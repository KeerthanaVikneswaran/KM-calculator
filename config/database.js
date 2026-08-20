const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'BusKMSystem.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(schemaPath, 'utf8'));

function ensureColumn(table, column, definition) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!cols.some(c => c.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

// Migrations for columns added after the initial schema (safe to re-run: no-op if already present)
ensureColumn('tblUsers', 'BusID', 'INTEGER REFERENCES tblBuses(BusID)');
ensureColumn('tblBusEmployee', 'ScannedBy', 'TEXT');
ensureColumn('tblBusEmployee', 'ScannedAt', 'TEXT');
ensureColumn('tblBusEmployee', 'KmEnteredBy', 'TEXT');
ensureColumn('tblBusEmployee', 'KmEnteredAt', 'TEXT');

console.log('Connected to SQLite database:', dbPath);

module.exports = db;
