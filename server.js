// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // sert les fichiers front-end

// === SQLite setup ===
const DB_PATH = './green.db';
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Erreur DB:', err.message);
  else console.log('SQLite connecté');
});

// Table reports
db.run(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  file TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// === Multer setup pour uploads ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// === Routes ===

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API test
app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'API is working!' });
});

// Ajouter un rapport avec fichier
app.post('/api/report', upload.single('file'), (req, res) => {
  const { name, description } = req.body;
  const file = req.file ? req.file.filename : null;

  db.run(
    `INSERT INTO reports (name, description, file) VALUES (?, ?, ?)`,
    [name, description, file],
    function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ status: 'error', message: 'DB error' });
      } else {
        res.json({ status: 'success', reportId: this.lastID });
      }
    }
  );
});

// Lister tous les rapports
app.get('/api/reports', (req, res) => {
  db.all(`SELECT * FROM reports ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ status: 'error', message: 'DB error' });
    } else {
      res.json({ status: 'success', reports: rows });
    }
  });
});

// Port dynamique pour Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});