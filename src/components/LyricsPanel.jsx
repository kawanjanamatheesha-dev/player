import React, { useEffect, useRef } from 'react';
import { AlignLeft, Sparkles } from 'lucide-react';

export const LyricsPanel = ({ lyrics, currentTime }) => {
  const containerRef = useRef(null);

  // Find active lyric line based on currentTime
  let activeIndex = 0;
  if (lyrics && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
      }
    }
  }

  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl space-y-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40">
          <AlignLeft className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            SYNCHRONIZED LYRIC VIEW
            <span className="text-[10px] uppercase font-mono bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/40">
              LIVE SYNC
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time synced lyrics with glowing active line highlighting
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-80 overflow-y-auto space-y-4 py-8 px-4 text-center font-medium scroll-smooth rounded-2xl bg-slate-950/60 border border-white/5"
      >
        {(!lyrics || lyrics.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 text-pink-400/50 mb-2 animate-bounce" />
            <span>No lyrics available for this audio file</span>
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <p
                key={idx}
                className={`transition-all duration-500 leading-relaxed text-sm sm:text-base ${
                  isActive
                    ? 'text-cyan-300 font-extrabold scale-110 neon-text-cyan py-2'
                    : 'text-slate-500 scale-95 opacity-60 hover:opacity-100'
                }`}
              >
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
};
