const sqlite3 = require('sqlite3').verbose();

// crée la base eco.db automatiquement
const db = new sqlite3.Database('./eco.db', (err) => {
  if (err) {
    console.error("Erreur connexion DB:", err.message);
  } else {
    console.log("SQLite connecté");
  }
});

// création table
db.run(`
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT,
  image TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

module.exports = db;