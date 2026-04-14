export interface ServerPower {
  watts: number | null;
  powerSource: 'estimated' | 'ipmi' | 'placeholder';
}

export interface ServerProcess {
  user: string;
  pid: number;
  cpu: number;
  memory: number;
  command: string;
}

export interface ServerDiskVolume {
  mount: string;
  total: number;
  used: number;
  usage: number;
}

export interface ServerNetworkInterface {
  name: string;
  bytesIn: number;
  bytesOut: number;
}

export interface ServerMemory {
  total: number;
  used: number;
  free: number;
  usage: number;
}

export interface ServerGpuPlaceholder {
  available: false;
  message: string;
}

export interface ServerMetricsResponse {
  hostname: string;
  cpu: number;
  memory: ServerMemory | null;
  disk: ServerDiskVolume[];
  network: ServerNetworkInterface[];
  uptime: number;
  temperature: number | null;
  power: ServerPower | null;
  processes: ServerProcess[];
  gpu: ServerGpuPlaceholder;
  timestamp: string;
}

export interface ServerCostResponse {
  ratePerKwh: number;
  watts: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  sampleCount: number;
  isRollingAverage: boolean;
}
