import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running securely' });
});

// Email dispatch route
app.post('/api/email/send', async (req, res) => {
  const { to, subject, body } = req.body;

  // Security check: ensure API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY. Please check your .env file.");
    return res.status(500).json({ success: false, error: "Email service is not configured." });
  }

  if (!to || !subject || !body) {
    return res.status(400).json({ success: false, error: "Missing required fields: to, subject, or body." });
  }

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Acme <onboarding@resend.dev>', // Default resend testing email
      to: to,
      subject: subject,
      html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
               <p>${body}</p>
             </div>`
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Resend API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Secure Backend Server running on http://localhost:${port}`);
  console.log(`🔒 Resend API Key Configured: ${process.env.RESEND_API_KEY ? 'Yes ✅' : 'No ❌'}`);
  console.log(`======================================================\n`);
});
