const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { dbPath, getDb } = require('./db');
const aiUsageRoutes = require('./ai-usage.routes');

const execFileAsync = promisify(execFile);
const app = express();
const port = process.env.PORT || 3000;
const ENERGY_RATE_PER_KWH = 0.117;

// Rolling 24-hour power buffer: samples every 30s = 2880 max entries
const POWER_BUFFER_MAX = 2880;
const POWER_SAMPLE_INTERVAL_MS = 30000;
const powerBuffer = [];

function collectPowerSample() {
  const raplPowerPath = '/sys/class/powercap/intel-rapl:0/power_uw';
  const raplPower = Number(safeReadFile(raplPowerPath) || NaN);
  if (Number.isFinite(raplPower) && raplPower > 0) {
    const watts = Number((raplPower / 1000000).toFixed(2));
    pushPowerSample(watts, 'ipmi');
    return;
  }

  execFile('ipmitool', ['dcmi', 'power', 'reading'], { timeout: 3000 }, (err, stdout) => {
    if (!err && stdout) {
      const match = stdout.match(/Instantaneous power reading:\s+(\d+)\s+Watts/i);
      if (match) {
        pushPowerSample(Number(match[1]), 'ipmi');
        return;
      }
    }

    execFile('ps', ['-o', 'pcpu=', '--no-headers', '-p', '1'], { timeout: 2000 }, () => {
      const cpuUsage = 0;
      pushPowerSample(35 + cpuUsage * 0.9, 'estimated');
    });
  });
}

function pushPowerSample(watts, source) {
  powerBuffer.push({ watts: Number.isFinite(watts) ? watts : 0, source });
  if (powerBuffer.length > POWER_BUFFER_MAX) {
    powerBuffer.shift();
  }
}

function getBufferedAverageWatts() {
  if (powerBuffer.length === 0) return null;
  const sum = powerBuffer.reduce((acc, s) => acc + s.watts, 0);
  return Number((sum / powerBuffer.length).toFixed(2));
}

setInterval(collectPowerSample, POWER_SAMPLE_INTERVAL_MS);
setTimeout(collectPowerSample, 2000);

app.use(cors());
app.use(express.json());
app.use('/api/ai-usage', aiUsageRoutes);

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function readCpuTimes() {
  const stat = safeReadFile('/proc/stat');
  const cpuLine = stat?.split('\n').find((line) => line.startsWith('cpu '));

  if (!cpuLine) {
    return null;
  }

  const values = cpuLine
    .trim()
    .split(/\s+/)
    .slice(1)
    .map((value) => Number(value));

  const idle = (values[3] || 0) + (values[4] || 0);
  const total = values.reduce((sum, value) => sum + value, 0);

  return { idle, total };
}

async function getCpuUsage() {
  const start = readCpuTimes();
  await new Promise((resolve) => setTimeout(resolve, 150));
  const end = readCpuTimes();

  if (!start || !end) {
    return null;
  }

  const totalDelta = end.total - start.total;
  const idleDelta = end.idle - start.idle;

  if (totalDelta <= 0) {
    return 0;
  }

  return Number((((totalDelta - idleDelta) / totalDelta) * 100).toFixed(2));
}

function getMemoryMetrics() {
  const meminfo = safeReadFile('/proc/meminfo');
  if (!meminfo) {
    return null;
  }

  const values = Object.fromEntries(
    meminfo
      .split('\n')
      .map((line) => line.match(/^(\w+):\s+(\d+)/))
      .filter(Boolean)
      .map(([, key, value]) => [key, Number(value) * 1024])
  );

  const total = values.MemTotal || 0;
  const free = values.MemAvailable || values.MemFree || 0;
  const used = Math.max(total - free, 0);
  const usage = total > 0 ? Number(((used / total) * 100).toFixed(2)) : 0;

  return { total, used, free, usage };
}

async function getDiskMetrics() {
  try {
    const { stdout } = await execFileAsync('df', ['-B1', '--output=target,size,used,pcent']);
    return stdout
      .trim()
      .split('\n')
      .slice(1)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(.*?)\s+(\d+)\s+(\d+)\s+(\d+)%$/);
        if (!match) {
          return null;
        }

        const [, mount, total, used, usage] = match;
        return {
          mount: mount.trim(),
          total: Number(total),
          used: Number(used),
          usage: Number(usage)
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getNetworkMetrics() {
  const networkDir = '/sys/class/net';

  try {
    return fs.readdirSync(networkDir).map((name) => {
      const bytesIn = Number(safeReadFile(path.join(networkDir, name, 'statistics/rx_bytes')) || 0);
      const bytesOut = Number(safeReadFile(path.join(networkDir, name, 'statistics/tx_bytes')) || 0);

      return {
        name,
        bytesIn,
        bytesOut
      };
    });
  } catch {
    return [];
  }
}

function getUptimeSeconds() {
  const uptime = safeReadFile('/proc/uptime');
  const seconds = uptime ? Number(uptime.split(' ')[0]) : 0;
  return Number.isFinite(seconds) ? seconds : 0;
}

function getTemperature() {
  const thermalDir = '/sys/class/thermal';

  try {
    const zones = fs.readdirSync(thermalDir).filter((entry) => entry.startsWith('thermal_zone'));

    for (const zone of zones) {
      const type = (safeReadFile(path.join(thermalDir, zone, 'type')) || '').trim().toLowerCase();
      const rawTemp = Number(safeReadFile(path.join(thermalDir, zone, 'temp')) || NaN);

      if (!Number.isFinite(rawTemp)) {
        continue;
      }

      const celsius = rawTemp > 1000 ? rawTemp / 1000 : rawTemp;
      if (type.includes('cpu') || type.includes('package') || type.includes('x86_pkg_temp') || zones.length === 1) {
        return Number(celsius.toFixed(1));
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function getPowerMetrics(cpuUsage) {
  const raplPowerPath = '/sys/class/powercap/intel-rapl:0/power_uw';
  const raplPower = Number(safeReadFile(raplPowerPath) || NaN);
  if (Number.isFinite(raplPower) && raplPower > 0) {
    return {
      watts: Number((raplPower / 1000000).toFixed(2)),
      powerSource: 'ipmi'
    };
  }

  try {
    const { stdout } = await execFileAsync('ipmitool', ['dcmi', 'power', 'reading'], { timeout: 3000 });
    const match = stdout.match(/Instantaneous power reading:\s+(\d+)\s+Watts/i);
    if (match) {
      return {
        watts: Number(match[1]),
        powerSource: 'ipmi'
      };
    }
  } catch {
    // ignore, fallback below
  }

  const estimatedWatts = Number((35 + (cpuUsage || 0) * 0.9).toFixed(2));
  return {
    watts: estimatedWatts,
    powerSource: 'estimated'
  };
}

async function getTopProcesses() {
  try {
    const { stdout } = await execFileAsync('ps', ['aux', '--sort=-%cpu']);
    return stdout
      .trim()
      .split('\n')
      .slice(1, 6)
      .map((line) => {
        const parts = line.trim().split(/\s+/, 11);
        return {
          user: parts[0],
          pid: Number(parts[1]),
          cpu: Number(parts[2]),
          memory: Number(parts[3]),
          command: parts[10] || ''
        };
      });
  } catch {
    return [];
  }
}

async function getServerMetrics() {
  const cpu = (await getCpuUsage()) ?? 0;
  const memory = getMemoryMetrics();
  const disk = await getDiskMetrics();
  const network = getNetworkMetrics();
  const uptime = getUptimeSeconds();
  const temperature = getTemperature();
  const power = await getPowerMetrics(cpu);
  const processes = await getTopProcesses();

  return {
    hostname: os.hostname(),
    cpu,
    memory,
    disk,
    network,
    uptime,
    temperature,
    power,
    processes,
    gpu: {
      available: false,
      message: 'No GPU detected — placeholder'
    },
    timestamp: new Date().toISOString()
  };
}

function buildCostResponse(powerWatts, hasBufferedData = false) {
  const watts = Number.isFinite(powerWatts) ? powerWatts : 0;
  const dailyCost = Number((((watts / 1000) * 24) * ENERGY_RATE_PER_KWH).toFixed(4));
  const weeklyCost = Number((dailyCost * 7).toFixed(4));
  const monthlyCost = Number((dailyCost * 30).toFixed(4));
  const yearlyCost = Number((monthlyCost * 12).toFixed(4));

  return {
    ratePerKwh: ENERGY_RATE_PER_KWH,
    watts,
    dailyCost,
    weeklyCost,
    monthlyCost,
    yearlyCost,
    sampleCount: powerBuffer.length,
    isRollingAverage: hasBufferedData
  };
}

app.get('/api/health', async (_req, res) => {
  let database = null;
  try {
    await getDb();
    database = {
      status: 'ok',
      path: dbPath
    };
  } catch (error) {
    database = {
      status: 'error',
      path: dbPath,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  res.json({
    status: 'ok',
    service: 'Luma Dashboard API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database
  });
});

app.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.get('/api/server/metrics', async (_req, res) => {
  try {
    res.json(await getServerMetrics());
  } catch (error) {
    res.status(500).json({
      message: 'Unable to collect server metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/server/cost', (_req, res) => {
  const avgWatts = getBufferedAverageWatts();
  const watts = avgWatts ?? 0;
  res.json(buildCostResponse(watts, avgWatts !== null));
});

app.listen(port, '0.0.0.0', async () => {
  try {
    await getDb();
    console.log(`SQLite ready at ${dbPath}`);
  } catch (error) {
    console.error('Failed to initialize SQLite database', error);
  }

  console.log(`Luma Dashboard API listening on port ${port}`);
});
