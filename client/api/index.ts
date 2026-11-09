import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'imageH1', maxCount: 1 },
  { name: 'imageM5', maxCount: 1 }
]);

const JWT_SECRET = 'rahasia-super-aman-123'; 
const usersFilePath = path.join('/tmp', 'users.json');
const historyFilePath = path.join('/tmp', 'history.json');

if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, JSON.stringify([]));
if (!fs.existsSync(historyFilePath)) fs.writeFileSync(historyFilePath, JSON.stringify([]));

app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' });
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    if (users.find((u: any) => u.email === email)) return res.status(400).json({ error: 'Email sudah terdaftar' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = email === 'admin@scanner.com' ? 'admin' : 'free';
    
    users.push({ email, password: hashedPassword, status, dailyQuota: 3, lastAnalysisDate: null });
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    
    res.json({ ok: true, message: 'Registrasi berhasil! Silakan login.' });
  } catch (error) { res.status(500).json({ error: 'Terjadi kesalahan pada server' }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const user = users.find((u: any) => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    
    const token = jwt.sign({ email: user.email, status: user.status || 'free' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ ok: true, token, message: 'Login berhasil!' });
  } catch (error) { res.status(500).json({ error: 'Terjadi kesalahan pada server' }); }
});

app.post('/api/request-upgrade', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const userIndex = users.findIndex((u: any) => u.email === decoded.email);
    
    if (userIndex === -1) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    users[userIndex].status = 'pending';
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    
    res.json({ ok: true, message: 'Permintaan dikirim. Admin akan memverifikasi pembayaran Anda.' });
  } catch (error) { res.status(500).json({ error: 'Gagal memproses permintaan' }); }
});

app.get('/api/admin/pending', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    if (decoded.status !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
    
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const pendingUsers = users.filter((u: any) => u.status === 'pending').map((u: any) => ({ email: u.email }));
    res.json({ ok: true, pending: pendingUsers });
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data' }); }
});

app.post('/api/admin/approve', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.status !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });

    const { targetEmail } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const userIndex = users.findIndex((u: any) => u.email === targetEmail);
    
    if (userIndex === -1) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    users[userIndex].status = 'pro';
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    res.json({ ok: true, message: 'User berhasil di-upgrade ke PRO' });
  } catch (error) { res.status(500).json({ error: 'Gagal approve' }); }
});

app.get('/api/history', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const history = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
    const userHistory = history.filter((h: any) => h.email === decoded.email);
    res.json({ ok: true, history: userHistory.reverse() });
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil history' }); }
});

app.post('/api/analyze', upload, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userEmail = 'guest';
    let userStatus = 'free';
    if (token) {
      try { const decoded: any = jwt.verify(token, JWT_SECRET); userEmail = decoded.email; userStatus = decoded.status; } catch (e) {}
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const userIndex = users.findIndex((u: any) => u.email === userEmail);
    
    if (userStatus === 'free' && userIndex !== -1) {
      const today = new Date().toISOString().split('T')[0];
      let user = users[userIndex];

      if (user.lastAnalysisDate !== today) {
        users[userIndex].dailyQuota = 3;
        users[userIndex].lastAnalysisDate = today;
      }

      if (users[userIndex].dailyQuota <= 0) {
        return res.status(403).json({ ok: false, error: 'QUOTA_EXCEEDED', message: 'Kuota gratis habis. Silakan Upgrade ke PRO!' });
      }

      users[userIndex].dailyQuota -= 1;
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files['imageH1'] || !files['imageM5']) {
      return res.status(400).json({ ok: false, error: 'INVALID_FILE', message: 'Gambar wajib diunggah' });
    }

    const imageH1 = { inlineData: { data: files['imageH1'][0].buffer.toString('base64'), mimeType: files['imageH1'][0].mimetype } };
    const imageM5 = { inlineData: { data: files['imageM5'][0].buffer.toString('base64'), mimeType: files['imageM5'][0].mimetype } };

    const prompt = `Kamu adalah analis trading SCALPING profesional. Gunakan strategi Top-Down Analysis. Gambar 1: H1/H4 (Tren). Gambar 2: M5/M15 (Entry). Berikan jawaban HANYA format JSON: { "signal": "BUY"|"SELL"|"NO_TRADE", "pair": "BTCUSD", "timeframe": "H1 + M5", "entry": 0, "sl": 0, "tp1": 0, "tp2": 0, "confidence": 0, "reason": "", "warnings": [] }`;

    const result = await model.generateContent([prompt, imageH1, imageM5]);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    const history = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
    history.push({
      id: Date.now().toString(), email: userEmail, date: new Date().toISOString(),
      imageM5: files['imageM5'][0].buffer.toString('base64'), mimeType: files['imageM5'][0].mimetype, result: parsedData
    });
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));

    res.json({ ok: true, result: parsedData });
  } catch (error) { res.status(500).json({ ok: false, error: 'AI_ERROR', message: 'Gagal menganalisis gambar' }); }
});

export default app;