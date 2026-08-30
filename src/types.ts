export interface TabItem {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  memoryUsageMb: number;
  zoomLevel: number; // 50 to 200 (100 = 1.0)
  canGoBack: boolean;
  canGoForward: boolean;
  historyStack: string[];
  historyIndex: number;
  protocol: 'mem://' | 'https://' | 'http://' | 'about:';
}

export interface EngineMetrics {
  totalRamUsedMb: number;
  v8HeapUsedMb: number;
  blinkDOMNodes: number;
  ramCacheMb: number;
  skiaGpuMemoryMb: number;
  fps: number;
  paintTimeMs: number;
  diskWritesBlockedCount: number;
  zeroDiskEnforced: boolean;
  activeSockets: number;
  macScrollEnabled: boolean;
  directWriteSubpixel: boolean;
  trackersBlockedCount: number;
  httpsUpgradedCount: number;
}

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  timestamp: string;
  timeAgo: string;
  icon?: string;
}

export interface DownloadItem {
  id: string;
  filename: string;
  fileSizeBytes: number;
  bytesReceived: number;
  speedMbps: number;
  progressPercent: number;
  status: 'downloading' | 'completed' | 'cancelled';
  timestamp: string;
  savePath: string;
  fileType?: string;
}

export interface BrowserSettings {
  downloadDirectory: string;
  hardwareAcceleration: boolean;
  defaultSearchEngine?: 'google' | 'duckduckgo' | 'bing';
}

