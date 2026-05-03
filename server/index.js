import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Simple in-memory storage for OTPs (In production with multiple instances, use Redis)
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
 * Generate and Send OTP
 */
app.post('/api/otp/generate', async (req, res) => {
  const email = req.body.email?.toLowerCase();
  if (!email) return res.status(400).json({ error: "Email is required" });

  const now = Date.now();
  const cached = otpCache.get(email);

  // If an OTP exists and was generated less than 60 seconds ago, reuse it
  // This prevents "Double OTP" issues where 2 requests fire and overwrite each other
  if (cached && (cached.expiry - now) > (4 * 60 * 1000)) { 
    console.log(`[DEBUG] Reusing existing OTP for ${email} (Rate limit protection)`);
    return res.status(200).json({ success: true });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = now + 5 * 60 * 1000; // 5 minutes

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Your Login Verification Code',
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
               <h2 style="color: #4f46e5;">Verification Code</h2>
               <p>Your OTP for KGC ERP is:</p>
               <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${otp}</div>
               <p style="color: #64748b; font-size: 14px;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
             </div>`
    });

    otpCache.set(email, { otp, expiry });
    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("OTP Generation Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

/**
 * Verify OTP
 */
app.post('/api/otp/verify', (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { otp } = req.body;
  const cached = otpCache.get(email);

  console.log(`[DEBUG] Verifying OTP for ${email}. Entered: ${otp}, Expected: ${cached?.otp}`);

  if (!cached) return res.status(400).json({ error: "No OTP found. Please request a new one." });
  if (Date.now() > cached.expiry) {
    otpCache.delete(email);
    return res.status(400).json({ error: "OTP has expired" });
  }
  if (cached.otp !== otp.trim()) return res.status(400).json({ error: "Incorrect verification code" });

  // Success
  otpCache.delete(email);
  res.status(200).json({ success: true });
});

// Catch-all 404 handler (Returns JSON instead of HTML)
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.url} not found on this server` });
});

app.listen(port, () => {
  console.log(`🚀 KGC ERP Backend running on http://localhost:${port}`);
});
