import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusec';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Generic Schema for ERP Data (Flexible)
const DataSchema = new mongoose.Schema({
  collectionName: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null }
});

const DataModel = mongoose.model('ERPData', DataSchema);

// Universal API Routes
app.get('/api/data/:collection', async (req, res) => {
  try {
    const records = await DataModel.find({ 
      collectionName: req.params.collection,
      isDeleted: false 
    });
    res.json(records.map(r => r.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const newData = new DataModel({ collectionName: collection, data: req.body });
    await newData.save();
    res.status(201).json(newData.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/data/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const record = await DataModel.findOne({ collectionName: collection, 'data.id': id });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    
    record.data = { ...record.data, ...req.body };
    record.updatedAt = Date.now();
    await record.save();
    res.json(record.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    await DataModel.updateOne(
      { collectionName: collection, 'data.id': id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    res.json({ success: true, message: 'Record moved to recovery centre' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Recovery Centre Routes
app.get('/api/recovery', async (req, res) => {
  try {
    // Also run a quick cleanup of 90+ day old records
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    await DataModel.deleteMany({ isDeleted: true, deletedAt: { $lt: ninetyDaysAgo } });

    const records = await DataModel.find({ isDeleted: true });
    res.json(records.map(r => ({
      ...r.data,
      collectionName: r.collectionName,
      deletedAt: r.deletedAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recovery/restore/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    await DataModel.updateOne(
      { collectionName: collection, 'data.id': id },
      { $set: { isDeleted: false, deletedAt: null } }
    );
    res.json({ success: true, message: 'Record restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recovery/permanent/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    await DataModel.deleteOne({ collectionName: collection, 'data.id': id });
    res.json({ success: true, message: 'Record permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  console.log(`📂 File Uploaded: ${req.file.filename} (${req.file.mimetype}, ${req.file.size} bytes)`);
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ 
    url: fileUrl, 
    filename: req.file.filename, 
    size: req.file.size,
    mimetype: req.file.mimetype 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
