import React, { useState } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Radar3DVisualizer } from './visualizers/Radar3DVisualizer';
import { Compass, Headphones, Waves, RotateCw, ShieldAlert, Sparkles } from 'lucide-react';

export const Spatial8DPanel = () => {
  const [is8D, setIs8D] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [radius, setRadius] = useState(4.0);
  const [elevation, setElevation] = useState(1.2);
  const [direction, setDirection] = useState('cw');

  const [reverbPreset, setReverbPreset] = useState('concert');
  const [reverbWet, setReverbWet] = useState(0.35);

  const handleToggle8D = () => {
    const next = !is8D;
    setIs8D(next);
    audioEngine.set8DEnabled(next);
  };

  const handleSpeedChange = (val) => {
    const v = parseFloat(val);
    setSpeed(v);
    audioEngine.set8DSpeed(v);
  };

  const handleRadiusChange = (val) => {
    const v = parseFloat(val);
    setRadius(v);
    audioEngine.set8DRadius(v);
  };

  const handleElevationChange = (val) => {
    const v = parseFloat(val);
    setElevation(v);
    audioEngine.set8DElevation(v);
  };

  const handleDirectionToggle = () => {
    const nextDir = direction === 'cw' ? 'ccw' : 'cw';
    setDirection(nextDir);
    audioEngine.set8DDirection(nextDir);
  };

  const handleReverbSelect = (preset) => {
    setReverbPreset(preset);
    audioEngine.setReverbPreset(preset, reverbWet);
  };

  const handleReverbWetChange = (val) => {
    const v = parseFloat(val);
    setReverbWet(v);
    audioEngine.setReverbPreset(reverbPreset, v);
  };

  const REVERB_OPTIONS = [
    { id: 'concert', label: 'Concert Hall 🏛️', desc: 'Wide open acoustic hall' },
    { id: 'studio', label: 'Studio Room 🎙️', desc: 'Tight warm reflections' },
    { id: 'arena', label: 'Live Arena 🏟️', desc: 'Stadium echo & reverberation' },
    { id: 'cathedral', label: 'Cathedral ⛪', desc: 'Deep stone spatial decay' },
    { id: 'cosmic', label: 'Cosmic 🌌', desc: 'Ethereal 360° space' },
    { id: 'off', label: 'Dry Direct 🚫', desc: 'Raw uncolored sound' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: 8D Controls & Acoustic Environments (7 Cols) */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl space-y-6">
        
        {/* Header with Headphone Notice */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                3D & 8D HRTF SPATIALIZER
                <span className="text-[10px] uppercase font-mono bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded border border-pink-500/40">
                  360° AUDIO
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Orbital HRTF Binaural Sound Engine — Live Inside the Song
              </p>
            </div>
          </div>

          {/* Master 8D Toggle Button */}
          <button
            onClick={handleToggle8D}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs tracking-wide transition-all shadow-lg ${
              is8D
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-cyan-500/40'
                : 'glass-pill text-slate-300 border border-slate-700'
            }`}
          >
            <Headphones className="w-4 h-4" />
            {is8D ? '8D ORBIT ACTIVE' : '8D OFF (STEREO)'}
          </button>
        </div>

        {/* Headphone Recommended Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 font-semibold">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white font-bold">Headphones Recommended:</strong> 8D audio uses Head-Related Transfer Function (HRTF) to rotate sound around your head in 3D space.
          </span>
        </div>

        {/* 8D Motion Parameters Sliders */}
        <div className="space-y-4 pt-1">
          <div className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            ORBIT SPATIAL PARAMETERS
          </div>

          {/* Speed Slider */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">8D Orbit Speed</span>
              <span className="font-mono text-cyan-400 font-extrabold text-sm">{speed.toFixed(1)}x RPM</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(e.target.value)}
              disabled={!is8D}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-300 font-mono font-medium">
              <span>0.1x Slow Ambient</span>
              <span>1.0x Standard 8D</span>
              <span>3.0x Fast Spin</span>
            </div>
          </div>

          {/* Distance Radius Slider */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">3D Sound Distance (Radius)</span>
              <span className="font-mono text-cyan-400 font-extrabold text-sm">{radius.toFixed(1)} meters</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              disabled={!is8D}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-300 font-mono font-medium">
              <span>1m Intimate</span>
              <span>4m Stage</span>
              <span>10m Wide Field</span>
            </div>
          </div>

          {/* Height Elevation & Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Elevation Slider */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">3D Vertical Elevation</span>
                <span className="font-mono text-cyan-400 font-extrabold text-sm">{elevation.toFixed(1)}m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.2"
                value={elevation}
                onChange={(e) => handleElevationChange(e.target.value)}
                disabled={!is8D}
                className="w-full"
              />
            </div>

            {/* Direction Toggle */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Orbit Direction</div>
                <div className="text-[10px] text-slate-300 font-mono font-medium">
                  {direction === 'cw' ? 'Clockwise (R → L)' : 'Counter-CW (L → R)'}
                </div>
              </div>
              <button
                onClick={handleDirectionToggle}
                disabled={!is8D}
                className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition border border-cyan-500/40"
              >
                <RotateCw className={`w-5 h-5 ${direction === 'ccw' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 360° Reverb Simulator Options */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4 text-purple-400" />
              360° ACOUSTIC ENVIRONMENT SIMULATOR
            </div>
            <span className="text-[10px] font-mono font-extrabold text-purple-300">
              {Math.round(reverbWet * 100)}% Spatial Depth
            </span>
          </div>

          {/* Reverb Wet/Dry Slider */}
          <div className="glass-card p-3 rounded-2xl border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span>Reverb Echo Intensity</span>
              <span className="font-mono text-purple-400">{reverbWet === 0 ? 'Dry (0%)' : `${Math.round(reverbWet * 100)}% Wet`}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={reverbWet}
              onChange={(e) => handleReverbWetChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Reverb Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {REVERB_OPTIONS.map((opt) => {
              const isSelected = reverbPreset === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleReverbSelect(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/30 font-bold'
                      : 'glass-card text-white hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-extrabold text-white truncate">{opt.label}</div>
                  <div className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? 'text-purple-100' : 'text-slate-300'}`}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: 3D Radar Visualizer (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <Radar3DVisualizer is8DEnabled={is8D} onToggle8D={handleToggle8D} />
      </div>
    </div>
  );
};
