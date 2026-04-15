const express = require('express');
const {
  getLatestCodexUsageByWindow,
  getRecentCodexUsageHistory,
  insertCodexUsageSnapshots
} = require('./ai-usage.repository');

const router = express.Router();

router.get('/codex', async (_req, res) => {
  try {
    const windows = await getLatestCodexUsageByWindow();
    const history = await getRecentCodexUsageHistory(10);

    res.json({
      windows,
      history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to load Codex usage',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/codex', async (req, res) => {
  const { snapshots } = req.body || {};

  if (!Array.isArray(snapshots) || snapshots.length === 0) {
    return res.status(400).json({
      message: 'Request body must include a non-empty snapshots array.'
    });
  }

  const invalidSnapshot = snapshots.find((snapshot) => !snapshot?.windowName);
  if (invalidSnapshot) {
    return res.status(400).json({
      message: 'Each snapshot must include windowName.'
    });
  }

  try {
    const inserted = await insertCodexUsageSnapshots(snapshots);
    return res.status(201).json({
      message: 'Codex usage snapshots stored.',
      insertedCount: inserted.length,
      snapshots: inserted
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to store Codex usage snapshots',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
