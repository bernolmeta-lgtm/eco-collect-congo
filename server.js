const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();

// servir fichiers statiques
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 📁 vérifier dossier uploads
const uploadPath = path.join(__dirname, 'public/uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// configuration multer
const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ============================
// ENVOI SIGNALEMENT
// ============================
app.post('/report', upload.single('image'), (req, res) => {

  const { description, latitude, longitude } = req.body;

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO reports (description, image, latitude, longitude)
     VALUES (?, ?, ?, ?)`,
    [description, image, latitude, longitude],
    function(err) {
      if (err) {
        console.log(err.message);
        return res.send("Erreur serveur");
      }
      res.redirect('/');
    }
  );
});


// ============================
// RECUPERER SIGNALEMENTS
// ============================
app.get('/reports', (req, res) => {
  db.all("SELECT * FROM reports", [], (err, rows) => {
    if (err) return res.send(err.message);
    res.json(rows);
  });
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});