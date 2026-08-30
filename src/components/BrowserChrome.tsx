import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Plus, 
  X, 
  Lock, 
  Globe, 
  Download, 
  MoreVertical, 
  Minus, 
  Square, 
  ZoomIn, 
  ZoomOut,
  Flame
} from 'lucide-react';
import { TabItem, EngineMetrics, DownloadItem, BrowserSettings } from '../types';
import { DownloadsDropdown } from './DownloadsDropdown';
import { BrowserMenu } from './BrowserMenu';

interface BrowserChromeProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onGoBack: () => void;
  onGoForward: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  metrics: EngineMetrics;
  downloads: DownloadItem[];
  onRemoveDownload: (id: string) => void;
  onClearAllDownloads: () => void;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onPurgeSession: () => void;
}

export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onNavigate,
  onRefresh,
  onGoBack,
  onGoForward,
  zoomLevel,
  onZoomChange,
  metrics,
  downloads,
  onRemoveDownload,
  onClearAllDownloads,
  settings,
  onUpdateSettings,
  onOpenHistory,
  onOpenSettings,
  onPurgeSession,
}) => {
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [inputUrl, setInputUrl] = useState(activeTab ? activeTab.url : 'mem://welcome');
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const downloadsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync input with active tab url
  useEffect(() => {
    if (activeTab) {
      if (activeTab.url === 'mem://welcome') {
        setInputUrl('');
      } else {
        setInputUrl(activeTab.url);
      }
    }
  }, [activeTab?.url]);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadsRef.current && !downloadsRef.current.contains(e.target as Node)) {
        setIsDownloadsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) {
      onNavigate('mem://welcome');
      return;
    }

    if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mem://') || target.startsWith('about:')) {
      onNavigate(target);
      return;
    }

    if (target.includes('.') && !target.includes(' ')) {
      onNavigate(`https://${target}`);
      return;
    }

    // Direct Web Search (Default: Google Search)
    const engine = settings.defaultSearchEngine || 'google';
    if (engine === 'google') {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(target)}`);
    } else if (engine === 'duckduckgo') {
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
    } else {
      onNavigate(`https://www.bing.com/search?q=${encodeURIComponent(target)}`);
    }
  };

  return (
    <header className="bg-[#121212] border-b border-[#242424] select-none text-xs text-[#E0E0E0] flex flex-col z-30 relative font-sans">
      {/* 1. Top Tab Strip & Window Controls */}
      <div className="flex items-center justify-between px-2 pt-1 bg-[#0A0A0A] border-b border-[#1C1C1C]">
        {/* Tabs List (Square shape) */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 max-w-[calc(100%-120px)]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 max-w-[210px] min-w-[130px] px-3 py-1.5 cursor-pointer text-[12px] transition-all border-t border-l border-r ${
                  isActive
                    ? 'bg-[#181818] text-white border-[#333333] shadow-sm font-medium'
                    : 'bg-[#0E0E0E] text-[#888888] border-[#1A1A1A] hover:bg-[#141414] hover:text-[#CCC]'
                }`}
              >
                {/* Active accent top bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#00FF66]" />
                )}

                {/* Favicon / Status */}
                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  {tab.isLoading ? (
                    <RotateCw className="w-3 h-3 animate-spin text-[#00FF66]" />
                  ) : tab.url.startsWith('mem://') ? (
                    <span className="w-2 h-2 bg-[#00FF66] shadow-[0_0_4px_#00FF66]" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
                  )}
                </div>

                {/* Tab Title */}
                <span className="truncate flex-1 font-sans">
                  {tab.title || (tab.url === 'mem://welcome' ? 'New Tab' : tab.url)}
                </span>

                {/* Close Button */}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2A2A2A] text-[#888] hover:text-white transition-opacity"
                    title="Close Tab (Ctrl+W)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Square New Tab Button */}
          <button
            id="new-tab-btn"
            onClick={onNewTab}
            title="New Tab (Ctrl+T)"
            className="p-1.5 text-[#777] hover:text-white hover:bg-[#1E1E1E] border border-transparent hover:border-[#2E2E2E] transition-colors ml-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Controls (Square) */}
        <div className="flex items-center gap-1 pl-2 flex-shrink-0 text-[#777]">
          <button className="p-1.5 hover:text-white hover:bg-[#1E1E1E] transition-colors" title="Minimize">
            <Minus className="w-3 h-3" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-[#1E1E1E] transition-colors" title="Maximize">
            <Square className="w-3 h-3" />
          </button>
          <button className="p-1.5 hover:text-white hover:bg-red-950/60 transition-colors" title="Close">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Toolbar (Square theme with Zoom Controller) */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#181818]">
        {/* Navigation Buttons (Square shapes) */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoBack}
            disabled={!activeTab?.canGoBack}
            title="Back"
            className="p-1.5 text-[#AAA] hover:text-white bg-[#141414] hover:bg-[#222222] border border-[#282828] disabled:opacity-30 disabled:hover:bg-[#141414] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onGoForward}
            disabled={!activeTab?.canGoForward}
            title="Forward"
            className="p-1.5 text-[#AAA] hover:text-white bg-[#141414] hover:bg-[#222222] border border-[#282828] disabled:opacity-30 disabled:hover:bg-[#141414] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            title="Reload page"
            className="p-1.5 text-[#AAA] hover:text-white bg-[#141414] hover:bg-[#222222] border border-[#282828] transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${activeTab?.isLoading ? 'animate-spin text-[#00FF66]' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('mem://welcome')}
            title="Home / New Tab"
            className="p-1.5 text-[#AAA] hover:text-white bg-[#141414] hover:bg-[#222222] border border-[#282828] transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / Address Bar (Square Shape) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="w-full flex items-center bg-[#101010] hover:bg-[#141414] focus-within:bg-[#141414] border border-[#2B2B2B] focus-within:border-[#00FF66] px-3 py-1.5 transition-all shadow-inner">
            {/* Protocol Indicator */}
            <div className="flex items-center text-[#777] mr-1.5">
              {activeTab?.url.startsWith('https://') ? (
                <Lock className="w-3 h-3 text-[#00FF66]" />
              ) : activeTab?.url.startsWith('mem://') ? (
                <span className="text-[9px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-1 border border-[#00F0FF]/20">xd3v</span>
              ) : (
                <Globe className="w-3 h-3 text-[#888]" />
              )}
            </div>

            {/* URL Input */}
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Search or enter web address..."
              className="flex-1 bg-transparent text-white text-xs font-sans focus:outline-none placeholder-[#555]"
            />
          </div>
        </form>

        {/* Dedicated Zoom In / Zoom Out Toolbar Controller (Square segmented UI) */}
        <div className="flex items-center border border-[#2A2A2A] bg-[#121212]">
          <button
            onClick={() => onZoomChange(Math.max(50, zoomLevel - 10))}
            title="Zoom Out"
            className="px-2 py-1 text-[#AAA] hover:text-white hover:bg-[#222222] border-r border-[#2A2A2A] transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(100)}
            title="Reset Zoom to 100%"
            className="px-2 py-1 font-mono text-[11px] text-[#00FF66] hover:bg-[#222222] border-r border-[#2A2A2A] transition-colors min-w-[42px] text-center"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))}
            title="Zoom In"
            className="px-2 py-1 text-[#AAA] hover:text-white hover:bg-[#222222] transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1">
          {/* Downloads Dropdown (Square) */}
          <div ref={downloadsRef} className="relative">
            <button
              id="downloads-bubble-btn"
              onClick={() => setIsDownloadsOpen(!isDownloadsOpen)}
              className={`p-1.5 bg-[#141414] hover:bg-[#222222] border border-[#282828] text-[#AAA] hover:text-white transition-colors relative ${
                isDownloadsOpen ? 'bg-[#222222] text-white border-[#444]' : ''
              }`}
              title="Downloads"
            >
              <Download className="w-4 h-4" />
              {downloads.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#00FF66] shadow-[0_0_4px_#00FF66]" />
              )}
            </button>

            <DownloadsDropdown
              isOpen={isDownloadsOpen}
              onClose={() => setIsDownloadsOpen(false)}
              downloads={downloads}
              onRemoveDownload={onRemoveDownload}
              onClearAll={onClearAllDownloads}
              downloadDirectory={settings.downloadDirectory || '~/Downloads'}
            />
          </div>

          {/* Purge Session Quick Action Button (Square) */}
          <button
            onClick={onPurgeSession}
            className="p-1.5 bg-[#141414] hover:bg-[#1A2E20] border border-[#282828] hover:border-[#00FF66]/50 text-[#AAA] hover:text-[#00FF66] transition-colors group"
            title="Purge Session History"
          >
            <Flame className="w-4 h-4 text-[#888] group-hover:text-[#00FF66] transition-colors" />
          </button>

          {/* 3-Dots Menu (Square) */}
          <div ref={menuRef} className="relative">
            <button
              id="browser-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 bg-[#141414] hover:bg-[#222222] border border-[#282828] text-[#AAA] hover:text-white transition-colors ${
                isMenuOpen ? 'bg-[#222222] text-white border-[#444]' : ''
              }`}
              title="Menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <BrowserMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onNewTab={onNewTab}
              onOpenHistory={onOpenHistory}
              onOpenDownloads={() => setIsDownloadsOpen(true)}
              onOpenSettings={onOpenSettings}
              zoomLevel={zoomLevel}
              onZoomChange={onZoomChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
