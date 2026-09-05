import React, { useState, useEffect } from 'react';
import { audioEngine, EQ_FREQUENCIES, EQ_15_FREQUENCIES, EQ_PRESETS, EQ_15_PRESETS } from '../audio/AudioEngine';
import { Sliders, Zap, Volume2, RotateCcw, Sparkles, Save, Trash2, Award, Waves } from 'lucide-react';

export const EqualizerPanel = () => {
  const [is15Band, setIs15Band] = useState(audioEngine.is15BandMode);
  const [eqGains, setEqGains] = useState(EQ_PRESETS['8D Immersive']);
  const [eq15Gains, setEq15Gains] = useState(EQ_15_PRESETS['Ultra 8D Spatial']);
  const [activePreset, setActivePreset] = useState('8D Immersive');

  const [preamp, setPreamp] = useState(2);
  const [bassBoost, setBassBoost] = useState(5);
  const [treble, setTreble] = useState(3);
  const [stereoWidth, setStereoWidth] = useState(120);

  const [customPresetName, setCustomPresetName] = useState('');
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [customPresets, setCustomPresets] = useState(audioEngine.customPresets || {});

  const [spectrum, setSpectrum] = useState(new Array(15).fill(0));

  useEffect(() => {
    eqGains.forEach((gain, idx) => audioEngine.setEQBandGain(idx, gain));
    eq15Gains.forEach((gain, idx) => audioEngine.setEQ15BandGain(idx, gain));
    audioEngine.setPreampGain(preamp);
    audioEngine.setBassBoost(bassBoost);
    audioEngine.setTrebleGain(treble);
  }, []);

  // Real-time FFT spectrum feed
  useEffect(() => {
    let animId;
    const freqData = new Uint8Array(128);
    const updateSpectrum = () => {
      audioEngine.getFrequencyData(freqData);
      const activeFrequencies = is15Band ? EQ_15_FREQUENCIES : EQ_FREQUENCIES;
      const sampled = activeFrequencies.map((_, idx) => {
        const sampleIndex = Math.floor((idx / activeFrequencies.length) * freqData.length * 0.7);
        return (freqData[sampleIndex] || 0) / 255;
      });
      setSpectrum(sampled);
      animId = requestAnimationFrame(updateSpectrum);
    };
    updateSpectrum();
    return () => cancelAnimationFrame(animId);
  }, [is15Band]);

  const handleToggle15Band = () => {
    const next = !is15Band;
    setIs15Band(next);
    audioEngine.set15BandMode(next);
  };

  const handle10BandChange = (index, value) => {
    const val = parseFloat(value);
    const newGains = [...eqGains];
    newGains[index] = val;
    setEqGains(newGains);
    setActivePreset('Custom');
    audioEngine.setEQBandGain(index, val);
  };

  const handle15BandChange = (index, value) => {
    const val = parseFloat(value);
    const newGains = [...eq15Gains];
    newGains[index] = val;
    setEq15Gains(newGains);
    setActivePreset('Custom');
    audioEngine.setEQ15BandGain(index, val);
  };

  const handlePresetSelect = (presetName) => {
    setActivePreset(presetName);
    if (customPresets[presetName]) {
      const custom = customPresets[presetName];
      if (custom.gains10) {
        setEqGains(custom.gains10);
        custom.gains10.forEach((g, idx) => audioEngine.setEQBandGain(idx, g));
      }
      if (custom.gains15) {
        setEq15Gains(custom.gains15);
        custom.gains15.forEach((g, idx) => audioEngine.setEQ15BandGain(idx, g));
      }
      return;
    }

    if (is15Band) {
      const new15 = audioEngine.apply15Preset(presetName);
      setEq15Gains(new15);
    } else {
      const new10 = audioEngine.applyPreset(presetName);
      setEqGains(new10);
    }
  };

  const handleSaveCustomPreset = () => {
    if (!customPresetName.trim()) return;
    audioEngine.saveCustomPreset(customPresetName.trim(), eqGains, eq15Gains);
    setCustomPresets({ ...audioEngine.customPresets });
    setActivePreset(customPresetName.trim());
    setCustomPresetName('');
    setIsSavingModalOpen(false);
  };

  const handleDeleteCustomPreset = (presetName, e) => {
    e.stopPropagation();
    audioEngine.deleteCustomPreset(presetName);
    setCustomPresets({ ...audioEngine.customPresets });
    if (activePreset === presetName) setActivePreset('Flat');
  };

  const handleReset = () => {
    handlePresetSelect('Flat');
    setPreamp(0);
    setBassBoost(0);
    setTreble(0);
    setStereoWidth(100);
    audioEngine.setPreampGain(0);
    audioEngine.setBassBoost(0);
    audioEngine.setTrebleGain(0);
  };

  const currentFrequencies = is15Band ? EQ_15_FREQUENCIES : EQ_FREQUENCIES;
  const currentGains = is15Band ? eq15Gains : eqGains;
  const currentPresetKeys = is15Band ? Object.keys(EQ_15_PRESETS) : Object.keys(EQ_PRESETS);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl space-y-6">
      
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              {is15Band ? 'PRO 15-BAND STUDIO PARAMETRIC EQ' : 'PRO 10-BAND GRAPHIC EQUALIZER'}
              <span className="text-[10px] uppercase font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                {is15Band ? '15-BAND ULTRA PRO' : '10-BAND DSP'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Studio-grade frequency sculptor with custom preset persistence & harmonic exciter
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher Button */}
          <button
            onClick={handleToggle15Band}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold font-mono transition-all border ${
              is15Band
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                : 'glass-pill text-cyan-300 border-cyan-500/40 hover:bg-white/15'
            }`}
          >
            <Award className="w-4 h-4 text-pink-300" />
            {is15Band ? '15-BAND ULTRA MODE' : 'SWITCH TO 15-BAND PRO'}
          </button>

          {/* Save Custom Preset Button */}
          <button
            onClick={() => setIsSavingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md"
          >
            <Save className="w-3.5 h-3.5" /> Save EQ Preset
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Preset Selector Chips (Built-in + User Saved Presets) */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> EQ Tuning Presets:
          </span>
          {Object.keys(customPresets).length > 0 && (
            <span className="text-[10px] text-purple-300 font-mono font-bold">
              ({Object.keys(customPresets).length} Custom Presets Saved)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Default Presets */}
          {currentPresetKeys.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === preset
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-lg shadow-cyan-500/30 border border-cyan-400'
                  : 'glass-pill text-white hover:bg-white/20'
              }`}
            >
              {preset}
            </button>
          ))}

          {/* User Saved Presets */}
          {Object.keys(customPresets).map((preset) => (
            <div
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activePreset === preset
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                  : 'glass-pill text-purple-300 border-purple-500/40 hover:bg-purple-500/20'
              }`}
            >
              <span>⭐ {preset}</span>
              <button
                onClick={(e) => handleDeleteCustomPreset(preset, e)}
                className="opacity-60 group-hover:opacity-100 hover:text-red-400 transition"
                title="Delete custom preset"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Equalizer Sliders Grid */}
      <div
        className={`grid gap-1.5 sm:gap-3 pt-2 pb-4 px-2 bg-slate-950/70 rounded-2xl border border-white/5 shadow-inner ${
          is15Band ? 'grid-cols-15' : 'grid-cols-10'
        }`}
      >
        {currentFrequencies.map((freq, idx) => {
          const gain = currentGains[idx] || 0;
          const specVal = spectrum[idx] || 0;
          const label = freq >= 1000 ? `${(freq / 1000).toFixed(freq % 1000 === 0 ? 0 : 1)}k` : `${freq}`;

          return (
            <div key={freq} className="flex flex-col items-center gap-2 min-w-0">
              {/* dB Value Readout */}
              <span className={`text-[9px] sm:text-[10px] font-mono font-extrabold ${gain > 0 ? 'text-cyan-400' : gain < 0 ? 'text-pink-400' : 'text-slate-300'}`}>
                {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
              </span>

              {/* Fader Track Container with Spectrum Glow Bar */}
              <div className="relative w-6 sm:w-8 h-44 sm:h-52 flex items-center justify-center bg-slate-900/90 rounded-full border border-white/10 py-3">
                {/* Live Realtime FFT Spectrum Bar (Vibrant Neon Red Light) */}
                <div
                  className="absolute bottom-3 w-2 sm:w-3 rounded-full bg-gradient-to-t from-red-600 via-rose-500 to-red-400 border-t border-red-300 shadow-[0_0_12px_#ff0055] transition-all duration-75 pointer-events-none"
                  style={{ height: `${Math.min(100, specVal * 100)}%` }}
                />

                {/* Center 0dB Reference Line */}
                <div className="absolute top-1/2 w-full h-[1px] bg-slate-700 pointer-events-none" />

                {/* Vertical Slider */}
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={gain}
                  onChange={(e) => (is15Band ? handle15BandChange(idx, e.target.value) : handle10BandChange(idx, e.target.value))}
                  className="vertical-slider z-10"
                />
              </div>

              {/* Frequency Label */}
              <span className="text-[10px] font-mono font-extrabold text-white truncate">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Special Controls: Pre-Amp, Bass Boost, Treble, Stereo Width Expander */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        {/* Pre-Amp Knob Control */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" /> Pre-Amp
            </span>
            <span className="font-mono text-cyan-400 font-extrabold">{preamp > 0 ? `+${preamp}` : preamp} dB</span>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            value={preamp}
            onChange={(e) => {
              setPreamp(parseFloat(e.target.value));
              audioEngine.setPreampGain(parseFloat(e.target.value));
            }}
            className="w-full"
          />
        </div>

        {/* Sub-Bass Saturator */}
        <div className="glass-card p-3.5 rounded-2xl border border-pink-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-pink-400" /> Sub-Bass
            </span>
            <span className="font-mono text-pink-400 font-extrabold">+{bassBoost} dB</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={bassBoost}
            onChange={(e) => {
              setBassBoost(parseFloat(e.target.value));
              audioEngine.setBassBoost(parseFloat(e.target.value));
            }}
            className="w-full"
          />
        </div>

        {/* Treble Clarity */}
        <div className="glass-card p-3.5 rounded-2xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-300" /> Treble Air
            </span>
            <span className="font-mono text-cyan-300 font-extrabold">+{treble} dB</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={treble}
            onChange={(e) => {
              setTreble(parseFloat(e.target.value));
              audioEngine.setTrebleGain(parseFloat(e.target.value));
            }}
            className="w-full"
          />
        </div>

        {/* Stereo Spatial Width Expander */}
        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-purple-400" /> Stereo Width
            </span>
            <span className="font-mono text-purple-300 font-extrabold">{stereoWidth}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={stereoWidth}
            onChange={(e) => setStereoWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Save Custom EQ Preset Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-purple-400" /> Save Custom EQ Preset
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Enter a name to save your current EQ gains curve permanently to LocalStorage.
            </p>
            <input
              type="text"
              placeholder="e.g. My Headphone Bass Tuning"
              value={customPresetName}
              onChange={(e) => setCustomPresetName(e.target.value)}
              className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSavingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomPreset}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
