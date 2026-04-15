export interface CodexUsageSnapshot {
  id: number;
  capturedAt: string;
  windowName: string;
  usageMinutesUsed: number | null;
  usageMinutesLimit: number | null;
  usagePercent: number | null;
  resetAt: string | null;
  source: string;
  createdAt: string;
}

export interface CodexUsageResponse {
  windows: CodexUsageSnapshot[];
  history: CodexUsageSnapshot[];
  timestamp: string;
}
