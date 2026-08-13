// db.js - Final working version
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('✗ SQLite failed:', err);
  else console.log('✓ SQLite connected (in-memory)');
});

// Your table creation code remains same...
module.exports = db;
