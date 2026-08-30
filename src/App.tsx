import React, { useState, useEffect } from 'react';
import { BrowserChrome } from './components/BrowserChrome';
import { BrowserViewport } from './components/BrowserViewport';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { PurgeTransitionOverlay } from './components/PurgeTransitionOverlay';
import { 
  TabItem, 
  EngineMetrics, 
  DownloadItem, 
  HistoryEntry, 
  BrowserSettings 
} from './types';

export default function App() {
  const [tabs, setTabs] = useState<TabItem[]>([
    {
      id: 'tab-1',
      url: 'mem://welcome',
      title: 'New Tab',
      isLoading: false,
      memoryUsageMb: 14.8,
      zoomLevel: 100,
      canGoBack: false,
      canGoForward: false,
      historyStack: ['mem://welcome'],
      historyIndex: 0,
      protocol: 'mem://',
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'h-1',
      title: 'New Tab',
      url: 'mem://welcome',
      timestamp: '12:00 PM',
      timeAgo: 'Just now',
    }
  ]);

  const [settings, setSettings] = useState<BrowserSettings>({
    downloadDirectory: '~/Downloads',
    hardwareAcceleration: true,
    defaultSearchEngine: 'google',
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Engine Telemetry Metrics
  const [metrics, setMetrics] = useState<EngineMetrics>({
    totalRamUsedMb: 58.4,
    v8HeapUsedMb: 26.2,
    blinkDOMNodes: 1120,
    ramCacheMb: 14.5,
    skiaGpuMemoryMb: 12.7,
    fps: 144,
    paintTimeMs: 0.7,
    diskWritesBlockedCount: 842,
    zeroDiskEnforced: true,
    activeSockets: 4,
    macScrollEnabled: true,
    directWriteSubpixel: true,
    trackersBlockedCount: 0,
    httpsUpgradedCount: 18,
  });

  // Standard downloads list
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Subtle telemetry jitter simulating live engine
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const delta = (Math.random() - 0.5) * 0.3;
        const newTotal = Math.max(30, Math.min(95, prev.totalRamUsedMb + delta));
        return {
          ...prev,
          totalRamUsedMb: newTotal,
          v8HeapUsedMb: newTotal * 0.52,
          ramCacheMb: newTotal * 0.3,
          fps: Math.floor(142 + Math.random() * 3),
          paintTimeMs: Number((0.6 + Math.random() * 0.3).toFixed(1)),
        };
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      url: 'mem://welcome',
      title: 'New Tab',
      isLoading: false,
      memoryUsageMb: 12.0,
      zoomLevel: 100,
      canGoBack: false,
      canGoForward: false,
      historyStack: ['mem://welcome'],
      historyIndex: 0,
      protocol: 'mem://',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const handleNavigate = (newUrl: string, targetTabId?: string) => {
    const tabToUpdate = targetTabId || activeTabId;
    let displayTitle = newUrl;
    if (newUrl.startsWith('mem://welcome') || newUrl === 'about:blank') displayTitle = 'New Tab';
    else if (newUrl.startsWith('mem://acid-benchmark') || newUrl.startsWith('mem://acid3')) displayTitle = 'Acid3 & WASM Suite';
    else if (newUrl.startsWith('mem://canvas-physics') || newUrl.startsWith('mem://canvas')) displayTitle = '144Hz Skia Particle Engine';
    else if (newUrl.startsWith('mem://media-player') || newUrl.startsWith('mem://media')) displayTitle = 'Media Player';
    else {
      try {
        const u = new URL(newUrl);
        displayTitle = u.hostname.replace(/^www\./, '');
      } catch (e) {
        displayTitle = newUrl;
      }
    }

    // Protocol check
    const protocol: TabItem['protocol'] = newUrl.startsWith('mem://')
      ? 'mem://'
      : newUrl.startsWith('http://')
      ? 'http://'
      : newUrl.startsWith('about:')
      ? 'about:'
      : 'https://';

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabToUpdate) return t;
        const updatedHistory = [...t.historyStack.slice(0, t.historyIndex + 1), newUrl];

        return {
          ...t,
          url: newUrl,
          title: displayTitle,
          protocol,
          isLoading: false,
          historyStack: updatedHistory,
          historyIndex: updatedHistory.length - 1,
          canGoBack: updatedHistory.length > 1,
          canGoForward: false,
        };
      })
    );

    // Record in history
    const newEntry: HistoryEntry = {
      id: `h-${Date.now()}`,
      title: displayTitle,
      url: newUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now',
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const handleGoBack = () => {
    if (!activeTab || !activeTab.canGoBack) return;
    const newIdx = activeTab.historyIndex - 1;
    const targetUrl = activeTab.historyStack[newIdx];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              historyIndex: newIdx,
              canGoBack: newIdx > 0,
              canGoForward: true,
            }
          : t
      )
    );
  };

  const handleGoForward = () => {
    if (!activeTab || !activeTab.canGoForward) return;
    const newIdx = activeTab.historyIndex + 1;
    const targetUrl = activeTab.historyStack[newIdx];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: targetUrl,
              historyIndex: newIdx,
              canGoBack: true,
              canGoForward: newIdx < t.historyStack.length - 1,
            }
          : t
      )
    );
  };

  const handleRefresh = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: true } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
    }, 250);
  };

  const handleZoomChange = (newZoom: number) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, zoomLevel: newZoom } : t))
    );
  };

  const handleTriggerDownload = (filename: string, sizeBytes: number) => {
    const savePath = `${settings.downloadDirectory || '~/Downloads'}/${filename}`;
    const newDl: DownloadItem = {
      id: `dl-${Date.now()}`,
      filename,
      fileSizeBytes: sizeBytes,
      bytesReceived: sizeBytes,
      speedMbps: 75.0,
      progressPercent: 100,
      status: 'completed',
      timestamp: 'Just now',
      savePath,
    };
    setDownloads((prev) => [newDl, ...prev]);

    // Create a real mock download blob if user downloads sample file
    try {
      const blob = new Blob([`Sample downloaded file content for: ${filename}`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log('Download triggered:', filename);
    }
  };

  const handleRemoveDownload = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleClearAllDownloads = () => {
    setDownloads([]);
  };

  const handleUpdateSettings = (newSettings: Partial<BrowserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handlePurgeSession = () => {
    setIsPurging(true);
  };

  const handlePurgeComplete = () => {
    // 1. Wipe all session history entries
    setHistory([]);
    // 2. Reset tab history stacks
    setTabs((prev) =>
      prev.map((t) => ({
        ...t,
        canGoBack: false,
        canGoForward: false,
        historyStack: [t.url],
        historyIndex: 0,
      }))
    );
    // 3. Flush RAM cache metrics
    setMetrics((prev) => ({
      ...prev,
      totalRamUsedMb: 24.2,
      v8HeapUsedMb: 11.5,
      ramCacheMb: 4.8,
      skiaGpuMemoryMb: 6.2,
      trackersBlockedCount: 0,
    }));
    setIsPurging(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0A0A] text-[#E0E0E0] overflow-hidden font-sans select-none">
      {/* 1. Square Theme Navigation Toolbar, Tabs & Zoom Controls */}
      <BrowserChrome
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onNavigate={handleNavigate}
        onRefresh={handleRefresh}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        zoomLevel={activeTab?.zoomLevel || 100}
        onZoomChange={handleZoomChange}
        metrics={metrics}
        downloads={downloads}
        onRemoveDownload={handleRemoveDownload}
        onClearAllDownloads={handleClearAllDownloads}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPurgeSession={handlePurgeSession}
      />

      {/* 2. Main Browser Viewports (Keeps all tabs mounted in DOM to prevent refresh on tab switch) */}
      <div className="flex-1 flex overflow-hidden relative">
        {tabs.map((tabItem) => (
          <div
            key={tabItem.id}
            className="w-full h-full flex-1 flex flex-col"
            style={{ display: tabItem.id === activeTabId ? 'flex' : 'none' }}
          >
            <BrowserViewport
              tab={tabItem}
              metrics={metrics}
              zoomLevel={tabItem.zoomLevel || 100}
              onNavigate={(url) => handleNavigate(url, tabItem.id)}
              onTriggerDownload={handleTriggerDownload}
              settings={settings}
            />
          </div>
        ))}
      </div>

      {/* 3. History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onNavigate={handleNavigate}
        onClearHistory={() => setHistory([])}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 5. High-Tech Purge Transition Overlay */}
      <PurgeTransitionOverlay
        isPurging={isPurging}
        onComplete={handlePurgeComplete}
      />
    </div>
  );
}
