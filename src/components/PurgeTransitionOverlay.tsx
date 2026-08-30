import React, { useEffect, useState } from 'react';
import { Flame, Check } from 'lucide-react';

interface PurgeTransitionOverlayProps {
  isPurging: boolean;
  onComplete: () => void;
}

export const PurgeTransitionOverlay: React.FC<PurgeTransitionOverlayProps> = ({
  isPurging,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isPurging) {
      setProgress(0);
      setIsDone(false);
      return;
    }

    const startTime = Date.now();
    const duration = 750; // Smooth 0.75s transition

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 90) {
        setIsDone(true);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 150);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isPurging, onComplete]);

  if (!isPurging) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center font-sans select-none animate-in fade-in duration-150">
      {/* Sleek Theme-Matched Purge Box */}
      <div className="w-full max-w-sm bg-[#121212] border border-[#282828] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.8)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
              {isDone ? (
                <Check className="w-4 h-4 text-[#00FF66]" />
              ) : (
                <Flame className="w-4 h-4 text-[#00FF66] animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-wide">
                {isDone ? 'Session Cleared' : 'Purging Session...'}
              </div>
              <div className="text-[11px] text-[#777] font-mono">
                xd3v Browser
              </div>
            </div>
          </div>

          <span className="font-mono text-xs text-[#00FF66] font-semibold">
            {progress}%
          </span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-[#1C1C1C] border border-[#2A2A2A] overflow-hidden">
          <div
            className="h-full bg-[#00FF66] transition-all duration-75 ease-out shadow-[0_0_10px_#00FF66]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
