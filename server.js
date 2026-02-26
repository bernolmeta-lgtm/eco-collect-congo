// server.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload configuration
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- Database ---
const db = new sqlite3.Database(path.join(__dirname, 'reports.db'), (err) => {
  if (err) console.error('DB connection error:', err);
  else console.log('SQLite3 connecté');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    file TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

// --- API Routes ---
app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'API fonctionne !' });
});

app.post('/api/report', upload.single('file'), (req, res) => {
  const { name, description } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!name || !description) return res.json({ status: 'error', message: 'Champs manquants' });

  db.run(
    `INSERT INTO reports (name, description, file) VALUES (?, ?, ?)`,
    [name, description, file],
    function (err) {
      if (err) return res.json({ status: 'error', message: err.message });
      res.json({ status: 'success', id: this.lastID });
    }
  );
});

app.get('/api/reports', (req, res) => {
  db.all(`SELECT * FROM reports ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.json({ status: 'error', message: err.message });
    res.json({ status: 'success', reports: rows });
  });
});

// --- Front-end ---
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all SPA route (safe)
app.get(/.*/, (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});