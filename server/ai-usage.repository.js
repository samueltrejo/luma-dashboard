const { getDb } = require('./db');

function normalizeSnapshot(snapshot = {}) {
  const usageMinutesUsed = snapshot.usageMinutesUsed == null ? null : Number(snapshot.usageMinutesUsed);
  const usageMinutesLimit = snapshot.usageMinutesLimit == null ? null : Number(snapshot.usageMinutesLimit);

  let usagePercent = snapshot.usagePercent == null ? null : Number(snapshot.usagePercent);
  if (usagePercent == null && usageMinutesUsed != null && usageMinutesLimit != null && usageMinutesLimit > 0) {
    usagePercent = Number(((usageMinutesUsed / usageMinutesLimit) * 100).toFixed(2));
  }

  return {
    capturedAt: snapshot.capturedAt || new Date().toISOString(),
    windowName: String(snapshot.windowName || '').trim(),
    usageMinutesUsed,
    usageMinutesLimit,
    usagePercent,
    resetAt: snapshot.resetAt || null,
    source: snapshot.source || 'manual',
    rawPayload: snapshot.rawPayload == null ? null : JSON.stringify(snapshot.rawPayload)
  };
}

function insertCodexUsageSnapshots(snapshots) {
  const db = getDb();
  const rows = snapshots.map(normalizeSnapshot);
  const insert = db.prepare(`
    INSERT INTO codex_usage_snapshots (
      captured_at,
      window_name,
      usage_minutes_used,
      usage_minutes_limit,
      usage_percent,
      reset_at,
      source,
      raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((items) => {
    for (const row of items) {
      insert.run(
        row.capturedAt,
        row.windowName,
        row.usageMinutesUsed,
        row.usageMinutesLimit,
        row.usagePercent,
        row.resetAt,
        row.source,
        row.rawPayload
      );
    }
  });

  transaction(rows);
  return rows;
}

function getLatestCodexUsageByWindow() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.*
    FROM codex_usage_snapshots s
    INNER JOIN (
      SELECT window_name, MAX(captured_at) AS max_captured_at
      FROM codex_usage_snapshots
      GROUP BY window_name
    ) latest
      ON latest.window_name = s.window_name
     AND latest.max_captured_at = s.captured_at
    ORDER BY CASE s.window_name
      WHEN '5h' THEN 1
      WHEN 'weekly' THEN 2
      ELSE 3
    END, s.window_name ASC
  `).all();

  return rows.map(mapRow);
}

function getRecentCodexUsageHistory(limit = 20) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT *
    FROM codex_usage_snapshots
    ORDER BY captured_at DESC, id DESC
    LIMIT ?
  `).all(limit);

  return rows.map(mapRow);
}

function mapRow(row) {
  return {
    id: row.id,
    capturedAt: row.captured_at,
    windowName: row.window_name,
    usageMinutesUsed: row.usage_minutes_used,
    usageMinutesLimit: row.usage_minutes_limit,
    usagePercent: row.usage_percent,
    resetAt: row.reset_at,
    source: row.source,
    rawPayload: row.raw_payload ? safeJsonParse(row.raw_payload) : null,
    createdAt: row.created_at
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

module.exports = {
  insertCodexUsageSnapshots,
  getLatestCodexUsageByWindow,
  getRecentCodexUsageHistory
};
