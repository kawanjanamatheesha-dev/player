import React from 'react';
import { Headphones, Sliders, Music, Moon, Sun, Sparkles, Clock, Compass, Monitor } from 'lucide-react';

export const Header = ({
  currentTheme,
  onSelectTheme,
  is8DActive,
  activeTab,
  onChangeTab,
  isDesktopGlassActive,
  onToggleDesktopGlass
}) => {
  const THEMES = [
    { id: 'ios26', label: 'iOS 26 Liquid Glass', icon: '' },
    { id: 'glass', label: 'Glassmorphism', icon: '✨' },
    { id: 'neon', label: 'Neon Cyber', icon: '⚡' },
    { id: 'vinyl', label: 'Vintage Vinyl', icon: '📻' },
    { id: 'wave', label: 'Waveform', icon: '🌊' },
    { id: 'lyric', label: 'Lyric Sync', icon: '📝' },
    { id: 'ocean', label: 'Ocean Blue', icon: '🌌' }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl px-4 lg:px-8 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-cyan-500/30">
            <Headphones className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              SPATIAL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400">3D & 8D</span> PLAYER
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                360° PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              360° Living Soundstage & Professional 10-Band Equalizer
            </p>
          </div>
        </div>

        {/* Tab Navigation (Player / 8D Spatial / Equalizer / Playlist / Lyrics) */}
        <nav className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => onChangeTab('player')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'player'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" /> Player
          </button>

          <button
            onClick={() => onChangeTab('8d')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === '8d'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> 8D Spatial
            {is8DActive && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
          </button>

          <button
            onClick={() => onChangeTab('eq')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'eq'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Pro EQ
          </button>

          <button
            onClick={() => onChangeTab('playlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playlist'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Playlist
          </button>

          <button
            onClick={() => onChangeTab('lyrics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lyrics
          </button>
        </nav>

        {/* UI Visual Concept Theme Selector & Desktop Pass-Through Button */}
        <div className="flex items-center gap-2">
          {/* Desktop Pass-Through Car Windshield Glass Button */}
          <button
            onClick={onToggleDesktopGlass}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border shadow-md ${
              isDesktopGlassActive
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-400 shadow-red-500/40 animate-pulse'
                : 'glass-pill text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20'
            }`}
            title="See your real Desktop background inside the player window like looking through a car windshield!"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>🚗 {isDesktopGlassActive ? 'Desktop Glass ON' : 'Windshield Glass'}</span>
          </button>

          <select
            value={currentTheme}
            onChange={(e) => onSelectTheme(e.target.value)}
            className="bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label} Concept
              </option>
            ))}
          </select>
        </div>

      </div>
    </header>
  );
};
