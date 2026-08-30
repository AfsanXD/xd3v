import React from 'react';
import { 
  Plus, 
  History, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Settings 
} from 'lucide-react';

interface BrowserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTab: () => void;
  onOpenHistory: () => void;
  onOpenDownloads: () => void;
  onOpenSettings: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export const BrowserMenu: React.FC<BrowserMenuProps> = ({
  isOpen,
  onClose,
  onNewTab,
  onOpenHistory,
  onOpenDownloads,
  onOpenSettings,
  zoomLevel,
  onZoomChange,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-11 right-2 z-50 w-56 bg-[#141414] border border-[#333333] shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden text-xs text-[#E0E0E0] select-none py-1 animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#222222]"
    >
      {/* Group 1: Tabs */}
      <div className="py-1">
        <button
          onClick={() => { onNewTab(); onClose(); }}
          className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-[#202020] text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Plus className="w-3.5 h-3.5 text-[#888]" />
            <span>New Tab</span>
          </div>
          <span className="text-[10px] text-[#666] font-mono">Ctrl+T</span>
        </button>
      </div>

      {/* Group 2: History & Downloads */}
      <div className="py-1">
        <button
          onClick={() => { onOpenHistory(); onClose(); }}
          className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-[#202020] text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-3.5 h-3.5 text-[#888]" />
            <span>History</span>
          </div>
          <span className="text-[10px] text-[#666] font-mono">Ctrl+H</span>
        </button>

        <button
          onClick={() => { onOpenDownloads(); onClose(); }}
          className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-[#202020] text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-3.5 h-3.5 text-[#888]" />
            <span>Downloads</span>
          </div>
          <span className="text-[10px] text-[#666] font-mono">Ctrl+J</span>
        </button>
      </div>

      {/* Group 3: Zoom Controls */}
      <div className="px-3.5 py-2 flex items-center justify-between">
        <span className="text-[#888]">Zoom</span>
        <div className="flex items-center border border-[#303030] bg-[#1F1F1F]">
          <button
            onClick={() => onZoomChange(Math.max(50, zoomLevel - 10))}
            className="p-1 hover:bg-[#303030] text-[#AAA] hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => onZoomChange(100)}
            className="px-1.5 font-mono text-[11px] min-w-[38px] text-center text-white border-x border-[#303030] hover:bg-[#2A2A2A]"
            title="Reset Zoom"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))}
            className="p-1 hover:bg-[#303030] text-[#AAA] hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Group 4: Settings */}
      <div className="py-1">
        <button
          onClick={() => { onOpenSettings(); onClose(); }}
          className="w-full px-3.5 py-1.5 flex items-center justify-between hover:bg-[#202020] text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-3.5 h-3.5 text-[#888]" />
            <span>Settings</span>
          </div>
        </button>
      </div>
    </div>
  );
};
