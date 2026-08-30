import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { BrowserSettings } from '../types';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  settings: BrowserSettings;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  onNavigate,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (q.startsWith('http://') || q.startsWith('https://') || q.startsWith('mem://') || q.startsWith('about:')) {
      onNavigate(q);
      return;
    }

    if (q.includes('.') && !q.includes(' ')) {
      onNavigate(`https://${q}`);
      return;
    }

    // Direct Web Search (Default: Google Search)
    const engine = settings?.defaultSearchEngine || 'google';
    if (engine === 'google') {
      onNavigate(`https://www.google.com/search?q=${encodeURIComponent(q)}`);
    } else if (engine === 'duckduckgo') {
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(q)}`);
    } else {
      onNavigate(`https://www.bing.com/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="flex-1 w-full min-h-full bg-[#0A0A0A] text-[#E0E0E0] flex flex-col items-center justify-between px-8 py-6 sm:px-12 sm:py-8 select-none">
      {/* Top Header / Clock */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
          <span className="font-mono text-xs text-[#888] uppercase tracking-wider font-semibold">
            xd3v
          </span>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {currentTime}
          </div>
          <div className="text-[11px] text-[#777] font-medium font-mono">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Center Search Hub */}
      <div className="w-full max-w-2xl flex flex-col items-center my-auto py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans flex items-center justify-center gap-2">
            <span>xd3v</span>
          </h1>
          <p className="text-xs text-[#888] mt-2.5 font-mono tracking-tight">
            zero-disk RAM browsing with zero digital footprint.
          </p>
        </div>

        {/* Square Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <div className="w-full flex items-center bg-[#121212] hover:bg-[#161616] focus-within:bg-[#161616] border border-[#2A2A2A] focus-within:border-[#00FF66] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all">
            <Search className="w-4 h-4 text-[#666] mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or enter URL..."
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-[#666] font-sans"
              autoFocus
            />

            <button
              type="submit"
              className="p-2 bg-[#202020] hover:bg-[#00FF66] text-[#AAA] hover:text-black transition-colors border border-[#333] ml-2"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Clean Bottom Footer */}
      <div className="w-full max-w-3xl flex items-center justify-center text-[11px] text-[#666] font-mono border-t border-[#1C1C1C] pt-4">
        <span>xd3v Browser</span>
      </div>
    </div>
  );
};
