import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. LOAD CONFIG FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

console.log('--- SERVER STARTUP ---');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT FOUND');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'NOT FOUND');

// 2. CONNECT TO MONGODB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusec')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define a generic schema for data collections
const DataSchema = new mongoose.Schema({
  collectionName: String,
  dataId: { type: String, unique: true },
  content: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const DataModel = mongoose.model('Data', DataSchema);

// 3. OTP STORAGE (MONGODB)
const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSent: { type: Date, default: Date.now }
});

// TTL Index: Automatically delete document when current time > expiresAt
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.model('OTP', OTPSchema);

// 4. NODEMAILER SETUP
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: smtpPort,
  secure: smtpPort === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with some VPS/Provider certificate issues
  }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Connection Error Details:', {
      code: error.code,
      message: error.message,
      user: process.env.SMTP_USER,
      port: smtpPort
    });
  } else {
    console.log('✅ SMTP Server is ready to take messages');
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

/**
 * OTP Routes
 */
app.post('/api/otp/generate', async (req, res) => {
  const email = req.body.email?.toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });

  const now = Date.now();
  
  try {
    const cached = await OTPModel.findOne({ email });

    // Cooldown protection: 30 seconds
    if (cached && (now - cached.lastSent.getTime()) < 30000) {
      const wait = Math.ceil((30000 - (now - cached.lastSent.getTime())) / 1000);
      return res.status(429).json({ error: `Please wait ${wait} seconds before requesting another code.` });
    }

    let otp;
    let expiry;

    if (cached && now < cached.expiresAt.getTime()) {
      // Reuse existing OTP but re-send the email
      otp = cached.otp;
      expiry = cached.expiresAt;
      console.log(`[DEBUG] Reusing existing OTP for ${email}: ${otp}`);
    } else {
      // Generate new OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      expiry = new Date(now + 5 * 60 * 1000); // 5 minutes
      console.log(`[DEBUG] Generated NEW OTP for ${email}: ${otp}`);
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Verification Code - KGC ERP',
      html: `<div style="font-family: 'Inter', sans-serif; padding: 40px; background-color: #f8fafc; color: #1e293b;">
               <div style="max-width: 500px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <h2 style="color: #4f46e5; margin-top: 0; font-size: 24px;">Login Verification</h2>
                 <p style="font-size: 16px; color: #64748b;">Your verification code for KGC ERP is:</p>
                 <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e293b; margin: 32px 0; text-align: center; font-family: monospace;">${otp}</div>
                 <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
               </div>
             </div>`
    });

    // Save or update in DB
    await OTPModel.findOneAndUpdate(
      { email },
      { otp, expiresAt: expiry, lastSent: new Date(now) },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP Generation/Email Error:", error);
    res.status(500).json({ error: "Failed to process OTP request. Please check SMTP settings." });
  }
});

app.post('/api/otp/verify', async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const otp = req.body.otp?.toString().trim();
  
  console.log(`[AUTH] Verification attempt for: ${email}`);
  console.log(`[AUTH] Code entered: "${otp}"`);

  try {
    const cached = await OTPModel.findOne({ email });

    if (!cached) {
      console.warn(`[AUTH] No record found in DB for ${email}`);
      return res.status(400).json({ error: "No code found. Please request a new one." });
    }

    console.log(`[AUTH] Record found in DB: code="${cached.otp}", expires=${cached.expiresAt.toLocaleTimeString()}`);

    if (Date.now() > cached.expiresAt.getTime()) {
      console.warn(`[AUTH] Code expired for ${email}`);
      await OTPModel.deleteOne({ email });
      return res.status(400).json({ error: "Verification code has expired" });
    }

    if (cached.otp !== otp) {
      console.warn(`[AUTH] Mismatch! Expected "${cached.otp}", got "${otp}"`);
      return res.status(400).json({ error: "Incorrect verification code" });
    }

    console.log(`[AUTH] Success! Verified ${email}`);
    await OTPModel.deleteOne({ email });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP Verification DB Error:", error);
    res.status(500).json({ error: "Database error during verification." });
  }
});

/**
 * Data Persistence Routes (Generic CRUD)
 */
app.get('/api/data/:collection', async (req, res) => {
  try {
    const docs = await DataModel.find({ collectionName: req.params.collection });
    res.json(docs.map(d => d.content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:collection', async (req, res) => {
  try {
    const { id } = req.body;
    await DataModel.findOneAndUpdate(
      { collectionName: req.params.collection, dataId: id },
      { content: req.body, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data/:collection/:id', async (req, res) => {
  try {
    await DataModel.findOneAndUpdate(
      { collectionName: req.params.collection, dataId: req.params.id },
      { content: req.body, updatedAt: Date.now() },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/:collection/:id', async (req, res) => {
  try {
    await DataModel.deleteOne({ collectionName: req.params.collection, dataId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

