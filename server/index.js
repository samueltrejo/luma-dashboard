const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Luma Dashboard API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Luma Dashboard API listening on port ${port}`);
});
