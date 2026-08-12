const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'osint.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('✗ SQLite failed:', err);
  else console.log('✓ SQLite connected');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT NOT NULL,
      input_param TEXT,
      input_value TEXT,
      response_status INTEGER,
      response_data LONGTEXT,
      error_msg TEXT,
      ip_address TEXT,
      execution_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT UNIQUE,
      total_queries INTEGER DEFAULT 0,
      successful INTEGER DEFAULT 0,
      avg_time FLOAT DEFAULT 0
    )
  `);
});

module.exports = db;
