import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Heart, Compass, Sliders, Clock } from 'lucide-react';

export const PlayerControls = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackSpeed,
  isRepeat,
  isShuffle,
  is8DActive,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSpeedChange,
  onToggleRepeat,
  onToggleShuffle,
  onToggle8D,
  onOpenEq
}) => {
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-4 py-3 backdrop-blur-2xl shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Track Thumbnail & Title */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
            <img src={currentTrack?.cover} alt={currentTrack?.title} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {currentTrack?.title || 'No Track Selected'}
            </h4>
            <p className="text-[11px] text-cyan-300/80 font-medium truncate mt-0.5">
              {currentTrack?.artist || 'Antigravity Player'}
            </p>
          </div>
          <button className="text-slate-400 hover:text-pink-500 transition p-1.5">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Center Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 transition ${isShuffle ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-1.5 text-slate-300 hover:text-white transition"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/40 transform hover:scale-105 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-slate-300 hover:text-white transition"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-1.5 transition ${isRepeat ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Repeat Track"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Seekbar and Timers */}
          <div className="flex items-center gap-3 w-full max-w-lg">
            <span className="text-[10px] font-mono text-slate-400 font-semibold w-8 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <span className="text-[10px] font-mono text-slate-400 font-semibold w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Section: Volume, Speed, 8D Indicator */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          
          {/* Quick 8D Toggle */}
          <button
            onClick={onToggle8D}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
              is8DActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-inner'
                : 'glass-pill text-slate-400 border-white/10'
            }`}
            title="Toggle 8D Spatial Audio"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">8D</span>
          </button>

          {/* Playback Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-slate-900 border border-white/10 rounded-xl px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={onToggleMute} className="text-slate-400 hover:text-white transition">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
