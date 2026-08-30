import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  X, 
  Clock
} from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onNavigate,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#141414] border border-[#333333] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] font-sans">
        {/* Header */}
        <div className="p-4 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00FF66]" />
            <span className="font-semibold text-white text-sm">Browsing History</span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1 text-xs text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/80 border border-red-800/60 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#777] hover:text-white hover:bg-[#252525]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-[#111111] border-b border-[#222222]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-[#00FF66] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#1C1C1C]">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No history records found</p>
              <p className="text-xs text-[#555] mt-1">Your visited websites will appear here.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.url);
                  onClose();
                }}
                className="p-3 hover:bg-[#1C1C1C] flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="font-mono text-[11px] text-[#666] min-w-[60px]">
                    {item.timestamp}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs text-white group-hover:text-[#00FF66] font-medium truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#666] font-mono truncate">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#555] font-mono flex-shrink-0">
                  {item.timeAgo}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
