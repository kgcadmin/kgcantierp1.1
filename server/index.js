import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
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

// Simple in-memory storage for OTPs
const otpCache = new Map();

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) console.error('❌ SMTP Connection Error:', error);
  else console.log('✅ SMTP Server is ready');
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
  const cached = otpCache.get(email);

  // Cooldown protection: 30 seconds
  if (cached && (now - cached.lastSent) < 30000) {
    const wait = Math.ceil((30000 - (now - cached.lastSent)) / 1000);
    return res.status(429).json({ error: `Please wait ${wait} seconds before requesting another code.` });
  }

  let otp;
  let expiry;

  if (cached && now < cached.expiry) {
    // Reuse existing OTP but re-send the email
    otp = cached.otp;
    expiry = cached.expiry;
    console.log(`[DEBUG] Reusing existing OTP for ${email}`);
  } else {
    // Generate new OTP
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    expiry = now + 5 * 60 * 1000; // 5 minutes
  }

  try {
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

    otpCache.set(email, { otp, expiry, lastSent: now });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: "Failed to send email. Please check SMTP settings." });
  }
});

app.post('/api/otp/verify', (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { otp } = req.body;
  const cached = otpCache.get(email);

  if (!cached) return res.status(400).json({ error: "No code found. Please request a new one." });
  if (Date.now() > cached.expiry) {
    otpCache.delete(email);
    return res.status(400).json({ error: "Verification code has expired" });
  }
  if (cached.otp !== otp?.trim()) return res.status(400).json({ error: "Incorrect verification code" });

  otpCache.delete(email);
  res.status(200).json({ success: true });
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

