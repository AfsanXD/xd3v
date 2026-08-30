import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  X, 
  Cpu, 
  Folder 
} from 'lucide-react';
import { BrowserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BrowserSettings;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'about'>('downloads');
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [folderInput, setFolderInput] = useState(settings.downloadDirectory || '~/Downloads');

  if (!isOpen) return null;

  const handleSaveDirectory = () => {
    const trimmed = folderInput.trim();
    if (trimmed) {
      onUpdateSettings({ downloadDirectory: trimmed });
    }
    setIsEditingFolder(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#141414] border border-[#333333] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh] font-sans">
        {/* Header */}
        <div className="p-4 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#00FF66]" />
            <span className="font-semibold text-white text-sm">Settings</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#777] hover:text-white hover:bg-[#252525]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body with Sidebar Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <aside className="w-48 bg-[#111111] border-r border-[#242424] p-2 space-y-1 select-none flex-shrink-0">
            <button
              onClick={() => setActiveTab('downloads')}
              className={`w-full px-3 py-2 text-xs font-medium text-left flex items-center gap-2 transition-colors border ${
                activeTab === 'downloads'
                  ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30 font-semibold'
                  : 'text-[#888] hover:text-white hover:bg-[#1A1A1A] border-transparent'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Downloads</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full px-3 py-2 text-xs font-medium text-left flex items-center gap-2 transition-colors border ${
                activeTab === 'about'
                  ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30 font-semibold'
                  : 'text-[#888] hover:text-white hover:bg-[#1A1A1A] border-transparent'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>About Engine</span>
            </button>
          </aside>

          {/* Main Settings Panel */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#141414] text-xs">
            {/* Downloads Tab */}
            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1">Downloads Location</h2>
                  <p className="text-[#888] mb-4">Manage where downloaded files are saved on your computer.</p>

                  <div className="p-4 bg-[#181818] border border-[#262626] space-y-4">
                    <div>
                      <label className="text-[11px] text-[#888] block mb-1.5 font-medium">Default Download Folder</label>
                      {isEditingFolder ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={folderInput}
                            onChange={(e) => setFolderInput(e.target.value)}
                            className="flex-1 bg-[#121212] border border-[#00FF66] px-3 py-2 text-white font-mono text-xs focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveDirectory();
                              if (e.key === 'Escape') setIsEditingFolder(false);
                            }}
                          />
                          <button
                            onClick={handleSaveDirectory}
                            className="px-3 py-2 bg-[#00FF66] hover:bg-[#00e65c] text-black font-semibold transition-colors text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setFolderInput(settings.downloadDirectory || '~/Downloads');
                              setIsEditingFolder(false);
                            }}
                            className="px-3 py-2 bg-[#202020] hover:bg-[#2A2A2A] border border-[#333] text-[#AAA] hover:text-white transition-colors text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-white font-mono text-xs flex items-center gap-2">
                            <Folder className="w-3.5 h-3.5 text-[#00FF66]" />
                            <span>{settings.downloadDirectory || '~/Downloads'}</span>
                          </div>
                          <button
                            onClick={() => {
                              setFolderInput(settings.downloadDirectory || '~/Downloads');
                              setIsEditingFolder(true);
                            }}
                            className="px-3 py-2 bg-[#202020] hover:bg-[#2A2A2A] border border-[#333] text-white font-medium transition-colors"
                          >
                            Change
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-[#666] pt-2 border-t border-[#222]">
                      Files downloaded from websites will be saved directly to this directory.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Engine */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="p-5 bg-[#181818] border border-[#262626] space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white text-base">xd3v Browser</span>
                  </div>

                  <p className="text-[#888] text-xs leading-relaxed">
                    xd3v is engineered around a clean architecture and volatile in-memory execution. Web pages, cache entries, and temporary assets run entirely in isolated RAM partitions with zero disk persistence and hardware-accelerated rendering.
                  </p>

                  <div className="space-y-2 pt-1 border-t border-[#262626]">
                    <div className="text-xs font-semibold text-white">Built with:</div>
                    <div className="font-mono text-[11px] text-[#888] space-y-1.5 bg-[#121212] p-3 border border-[#222]">
                      <div className="flex justify-between">
                        <span className="text-[#666]">Chromium Engine</span>
                        <span className="text-[#00FF66]">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">V8 JavaScript Engine</span>
                        <span className="text-[#00FF66]">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Skia 2D Graphics Pipeline</span>
                        <span className="text-[#00FF66]">Direct3D 12 / Metal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Kinetic Momentum Physics</span>
                        <span className="text-white">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Subpixel Glyph Rasterizer</span>
                        <span className="text-white">DirectWrite LCD Cleartype</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
