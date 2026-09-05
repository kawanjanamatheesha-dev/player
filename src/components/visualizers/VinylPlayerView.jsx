import React from 'react';

export const VinylPlayerView = ({ coverUrl, isPlaying, trackTitle, artistName }) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Vinyl Turntable Base Body */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 bg-gradient-to-b from-stone-900 to-zinc-950 rounded-3xl p-6 border border-stone-700/50 shadow-2xl shadow-black/80 flex items-center justify-center overflow-hidden">
        
        {/* Metal Corner Plate Detailing */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-stone-700 border border-stone-500 shadow-inner" />
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-stone-700 border border-stone-500 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-stone-700 border border-stone-500 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-stone-700 border border-stone-500 shadow-inner" />

        {/* Speed Indicator Strobe LED */}
        <div className="absolute top-4 left-6 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-stone-700'}`} />
          <span className="text-[10px] font-mono font-bold text-stone-400">33 RPM</span>
        </div>

        {/* Rotating Vinyl LP Record Disc */}
        <div className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-r from-zinc-950 via-stone-900 to-zinc-950 p-3 border-4 border-zinc-800 shadow-2xl transition-transform duration-700 ${isPlaying ? 'animate-spin-slow' : ''}`}>
          
          {/* Glossy Vinyl Grooves */}
          <div className="w-full h-full rounded-full border border-zinc-700/30 flex items-center justify-center p-3">
            <div className="w-full h-full rounded-full border border-zinc-700/40 flex items-center justify-center p-3">
              <div className="w-full h-full rounded-full border border-zinc-700/50 flex items-center justify-center p-3">
                <div className="w-full h-full rounded-full border border-zinc-700/60 flex items-center justify-center">
                  
                  {/* Center Album Art Label */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-stone-800 shadow-inner">
                    <img src={coverUrl} alt={trackTitle} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-stone-900/30" />
                    {/* Spindle Hole */}
                    <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-zinc-900 border border-stone-500 shadow-inner" />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Vinyl Surface Gloss Reflection Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
        </div>

        {/* Realistic Tonearm Arm & Needle Cartridge */}
        <div
          className={`absolute top-4 right-8 w-24 h-44 origin-top-right transition-transform duration-1000 ease-in-out pointer-events-none ${
            isPlaying ? 'rotate-[26deg]' : 'rotate-[0deg]'
          }`}
        >
          {/* Base Pivot Ring */}
          <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-stone-400 to-stone-700 border border-stone-300 shadow-md" />
          
          {/* Metallic Arm Pole */}
          <div className="absolute top-4 right-3.5 w-1.5 h-32 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-full shadow-sm origin-top" />
          
          {/* Needle Cartridge Head */}
          <div className="absolute bottom-2 right-1.5 w-5 h-8 bg-zinc-800 border border-amber-500/50 rounded-sm shadow-md flex items-center justify-center">
            <div className="w-1 h-2 bg-amber-400 animate-pulse" />
          </div>
        </div>

      </div>

      <div className="text-center mt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-100/90 font-serif tracking-wide">
          {trackTitle}
        </h2>
        <p className="text-sm text-stone-400 font-medium mt-0.5">
          {artistName}
        </p>
      </div>
    </div>
  );
};
