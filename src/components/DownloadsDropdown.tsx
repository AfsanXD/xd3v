import React from 'react';
import { 
  Download, 
  X, 
  Trash2, 
  FileText, 
  Folder, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { DownloadItem } from '../types';

interface DownloadsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: DownloadItem[];
  onRemoveDownload: (id: string) => void;
  onClearAll: () => void;
  downloadDirectory: string;
}

export const DownloadsDropdown: React.FC<DownloadsDropdownProps> = ({
  isOpen,
  onClose,
  downloads,
  onRemoveDownload,
  onClearAll,
  downloadDirectory,
}) => {
  if (!isOpen) return null;

  const handleOpenFile = (filename: string) => {
    try {
      const blob = new Blob([`File content for ${filename}`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.log('Opening file:', filename);
    }
  };

  return (
    <div className="absolute top-11 right-0 z-50 w-84 bg-[#141414] border border-[#333333] shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden text-xs text-[#E0E0E0] select-none animate-in fade-in zoom-in-95 duration-100 font-sans">
      {/* Header */}
      <div className="p-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#00FF66]" />
          <span className="font-semibold text-white text-[13px]">Downloads</span>
        </div>

        <div className="flex items-center gap-1.5">
          {downloads.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-[#888] hover:text-white px-2 py-0.5 hover:bg-[#252525] border border-transparent hover:border-[#333] transition-colors"
              title="Clear download history"
            >
              Clear List
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#777] hover:text-white hover:bg-[#252525]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Directory notice */}
      <div className="px-3 py-1.5 bg-[#181818] border-b border-[#242424] text-[10px] text-[#777] flex items-center justify-between font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <Folder className="w-3 h-3 text-[#00FF66] flex-shrink-0" />
          <span className="truncate">{downloadDirectory}</span>
        </div>
        <span className="text-[#555] flex-shrink-0">Default Folder</span>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-[#202020]">
        {downloads.length === 0 ? (
          <div className="p-8 text-center text-[#666]">
            <Download className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-[12px]">No recent downloads</p>
            <p className="text-[10px] text-[#555] mt-1">Downloaded files are saved to your Downloads folder.</p>
          </div>
        ) : (
          downloads.map((item) => (
            <div key={item.id} className="p-3 hover:bg-[#181818] transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="p-2 bg-[#202020] text-[#00FF66] border border-[#2A2A2A] mt-0.5 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-white text-[12px] truncate">{item.filename}</div>
                    <div className="text-[10px] text-[#777] font-mono mt-0.5 flex items-center gap-2">
                      <span>{(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenFile(item.filename)}
                        className="text-[10px] text-[#00FF66] hover:underline flex items-center gap-1 font-mono"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Open</span>
                      </button>
                      <span className="text-[#444]">•</span>
                      <span className="text-[10px] text-[#777] truncate font-mono">
                        Saved to folder
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 font-mono border ${
                    item.status === 'completed'
                      ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/20 flex items-center gap-1'
                      : item.status === 'downloading'
                      ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20'
                      : 'bg-red-950/40 text-red-400 border-red-800/40'
                  }`}>
                    {item.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {item.status.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => onRemoveDownload(item.id)}
                    className="p-1 text-[#666] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
