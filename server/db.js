const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = process.env.DASHBOARD_DATA_DIR
  ? path.resolve(process.env.DASHBOARD_DATA_DIR)
  : path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'dashboard.sqlite');

let db;

function getDb() {
  if (!db) {
    db = initDb();
  }

  return db;
}

function initDb() {
  fs.mkdirSync(dataDir, { recursive: true });

  const database = new Database(dbPath);
  database.pragma('journal_mode = WAL');

  database.exec(`
    CREATE TABLE IF NOT EXISTS codex_usage_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      captured_at TEXT NOT NULL,
      window_name TEXT NOT NULL,
      usage_minutes_used REAL,
      usage_minutes_limit REAL,
      usage_percent REAL,
      reset_at TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      raw_payload TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_codex_usage_window_captured_at
      ON codex_usage_snapshots (window_name, captured_at DESC);
  `);

  return database;
}

module.exports = {
  dbPath,
  getDb
};
