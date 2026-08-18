const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'BusKMSystem.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(schemaPath, 'utf8'));

console.log('Connected to SQLite database:', dbPath);

module.exports = db;
