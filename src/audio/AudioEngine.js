/**
 * Advanced 3D & 8D Web Audio API DSP Engine
 * Provides 8D HRTF Orbital Panning, 360° Acoustic Reverb,
 * 10-Band & 15-Band Studio Equalizers, Stereo Width Expander, Pre-Amp, and Analyser.
 */

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_15_FREQUENCIES = [20, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000];

export const SURROUND_SPEAKERS = [
  { id: 'FC', label: 'Front Center', angleDeg: 0, x: 0, z: -4, type: 'full' },
  { id: 'FR', label: 'Front Right', angleDeg: 45, x: 2.83, z: -2.83, type: 'full' },
  { id: 'SR', label: 'Side Right', angleDeg: 90, x: 4, z: 0, type: 'full' },
  { id: 'BR', label: 'Back Right', angleDeg: 135, x: 2.83, z: 2.83, type: 'full' },
  { id: 'BL', label: 'Back Left', angleDeg: 225, x: -2.83, z: 2.83, type: 'full' },
  { id: 'SL', label: 'Side Left', angleDeg: 270, x: -4, z: 0, type: 'full' },
  { id: 'FL', label: 'Front Left', angleDeg: 315, x: -2.83, z: -2.83, type: 'full' },
  { id: 'SUB', label: 'Subwoofer (Sub-Bass .1)', angleDeg: 180, x: 0, z: 4.8, type: 'subwoofer' }
];

export const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 7, 5, 3, 0, 0, 1, 2, 3, 3],
  Vocal: [-2, -1, 1, 3, 5, 5, 4, 2, 0, -1],
  Rock: [5, 3, 2, -1, -2, 0, 2, 4, 5, 5],
  Pop: [-1, 2, 4, 5, 3, 0, -1, 2, 4, 4],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Electronic: [6, 5, 2, 0, -2, 2, 1, 3, 5, 6],
  Dance: [7, 6, 3, 0, 0, 2, 4, 4, 3, 0],
  Acoustic: [3, 2, 1, 1, 2, 2, 3, 3, 2, 1],
  '8D Immersive': [4, 3, 1, 0, 1, 2, 3, 4, 5, 5]
};

export const EQ_15_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Pro Bass Saturator': [10, 9, 7, 5, 3, 1, 0, 0, 0, 1, 2, 3, 4, 4, 4],
  'Studio Vocal Master': [-3, -2, -1, 0, 1, 2, 4, 6, 6, 5, 3, 2, 1, 0, -1],
  'Ultra 8D Spatial': [5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 6, 7],
  'High-End Air Exciter': [0, 0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 7, 8, 9, 10]
};

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.sourceNode = null;
    this.preampNode = null;
    this.bassNode = null;
    this.trebleNode = null;
    this.eqNodes = [];
    this.eq15Nodes = [];
    this.pannerNode = null;
    this.convolverNode = null;
    this.dryGainNode = null;
    this.wetGainNode = null;
    this.compressorNode = null;
    this.analyserNode = null;
    this.stereoPannerNode = null;

    // 8D Orbital Motion & 3D Surround Speaker State
    this.is8DEnabled = true;
    this.isManualMode = false;
    this.manualPos = { x: 0, y: 1, z: 3 };
    this.speakers = JSON.parse(JSON.stringify(SURROUND_SPEAKERS));
    this.activeSpeakerId = null;

    this.orbitSpeed = 1.0; // 0.1 to 3.0
    this.orbitRadius = 4.0; // 1.0 to 10.0
    this.orbitElevation = 1.2; // 0.0 to 5.0
    this.orbitDirection = 1; // 1 = clockwise, -1 = counter-clockwise
    this.orbitAngle = 0;
    this.animFrameId = null;

    // Reverb Environment
    this.reverbPreset = 'concert';
    this.reverbWet = 0.35; // 0.0 to 1.0

    // Equalizer State
    this.is15BandMode = false; // 10-band vs 15-band Ultra Pro Studio mode
    this.eqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.eq15Gains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.preampGain = 0; // -12 to +12 dB
    this.bassBoostGain = 4; // 0 to 15 dB
    this.trebleGain = 2; // 0 to 12 dB
    this.stereoWidth = 100; // 0% (Mono) to 200% (Ultra-Wide Spatial)

    // Subscriptions for 8D position updates (for 3D Radar Visualizer)
    this.onPositionUpdate = null;

    // Load custom presets from LocalStorage
    this.customPresets = this.loadCustomPresetsFromStorage();
  }

  init() {
    if (this.audioCtx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // Create Source Node
    this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);

    // 1. Pre-Amp Gain
    this.preampNode = this.audioCtx.createGain();
    this.setPreampGain(this.preampGain);

    // 2. Bass Boost Low-Shelf Filter (@80Hz)
    this.bassNode = this.audioCtx.createBiquadFilter();
    this.bassNode.type = 'lowshelf';
    this.bassNode.frequency.value = 80;
    this.bassNode.gain.value = this.bassBoostGain;

    // 3. Treble Enhancement High-Shelf Filter (@6000Hz)
    this.trebleNode = this.audioCtx.createBiquadFilter();
    this.trebleNode.type = 'highshelf';
    this.trebleNode.frequency.value = 6000;
    this.trebleNode.gain.value = this.trebleGain;

    // 4. Create 10-Band EQ Nodes Chain
    this.eqNodes = EQ_FREQUENCIES.map((freq, index) => {
      const node = this.audioCtx.createBiquadFilter();
      if (index === 0) {
        node.type = 'lowshelf';
      } else if (index === EQ_FREQUENCIES.length - 1) {
        node.type = 'highshelf';
      } else {
        node.type = 'peaking';
        node.Q.value = 1.4;
      }
      node.frequency.value = freq;
      node.gain.value = this.eqGains[index];
      return node;
    });

    // 4b. Create 15-Band Ultra Pro Studio EQ Nodes Chain
    this.eq15Nodes = EQ_15_FREQUENCIES.map((freq, index) => {
      const node = this.audioCtx.createBiquadFilter();
      if (index === 0) {
        node.type = 'lowshelf';
      } else if (index === EQ_15_FREQUENCIES.length - 1) {
        node.type = 'highshelf';
      } else {
        node.type = 'peaking';
        node.Q.value = 1.8;
      }
      node.frequency.value = freq;
      node.gain.value = this.eq15Gains[index];
      return node;
    });

    // 5. Create 7.1 Surround Speaker Array Nodes + Dedicated Subwoofer (.1 SUB) Node!
    this.speakerAudioNodes = {};
    this.speakers.forEach((spk) => {
      const panner = this.audioCtx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.positionX.value = spk.x;
      panner.positionY.value = this.orbitElevation || 1.2;
      panner.positionZ.value = spk.z;

      const gain = this.audioCtx.createGain();
      gain.gain.value = spk.type === 'subwoofer' ? 0.85 : 0.5; // Dedicated sub-bass gain

      // Subwoofer filter node (120Hz Lowpass) for SUB node only
      let subFilter = null;
      if (spk.type === 'subwoofer') {
        subFilter = this.audioCtx.createBiquadFilter();
        subFilter.type = 'lowpass';
        subFilter.frequency.value = 120; // Only pass sub-bass vibration (20Hz - 120Hz)
      }

      this.speakerAudioNodes[spk.id] = { panner, gain, subFilter, type: spk.type, muted: false };
    });

    // 6. 360° Reverb Convolver Node + Dry/Wet Mix
    this.convolverNode = this.audioCtx.createConvolver();
    this.dryGainNode = this.audioCtx.createGain();
    this.wetGainNode = this.audioCtx.createGain();
    this.setReverbPreset(this.reverbPreset, this.reverbWet);

    // 7. Master Dynamics Compressor (Clipping & Loudness Limiter)
    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -12;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // 8. Audio Spectrum Analyser Node
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.analyserNode.smoothingTimeConstant = 0.85;

    // ---- Connect Node Pipeline ----
    let current = this.sourceNode;
    current.connect(this.preampNode);
    current = this.preampNode;

    current.connect(this.bassNode);
    current = this.bassNode;

    current.connect(this.trebleNode);
    current = this.trebleNode;

    // Connect 10-Band EQ Chain
    for (const eqNode of this.eqNodes) {
      current.connect(eqNode);
      current = eqNode;
    }

    // Connect 15-Band EQ Chain
    for (const eqNode of this.eq15Nodes) {
      current.connect(eqNode);
      current = eqNode;
    }

    // Connect EQ Output to ALL SURROUND SPEAKERS + DEDICATED SUBWOOFER NODE!
    Object.values(this.speakerAudioNodes).forEach(({ panner, gain, subFilter, type }) => {
      if (type === 'subwoofer' && subFilter) {
        current.connect(subFilter);
        subFilter.connect(panner);
      } else {
        current.connect(panner);
      }
      panner.connect(gain);
      gain.connect(this.dryGainNode);
      gain.connect(this.convolverNode);
    });

    this.convolverNode.connect(this.wetGainNode);

    // Merge Dry and Wet to Compressor
    this.dryGainNode.connect(this.compressorNode);
    this.wetGainNode.connect(this.compressorNode);

    // Compressor -> Analyser -> Speakers
    this.compressorNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);

    // Start 8D Animation Loop
    this.start8DLoop();
  }

  async ensureContextActive() {
    if (!this.audioCtx) {
      this.init();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  loadTrack(src) {
    this.ensureContextActive();
    if (src && (src.startsWith('blob:') || src.startsWith('data:'))) {
      this.audioElement.removeAttribute('crossorigin');
    } else {
      this.audioElement.crossOrigin = 'anonymous';
    }
    this.audioElement.src = src;
    this.audioElement.load();
  }

  play() {
    this.ensureContextActive();
    return this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  seek(seconds) {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    }
  }

  setVolume(vol) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, vol));
    }
  }

  setPlaybackRate(rate) {
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  // --- 8D & 3D Spatial Audio Controls ---
  setManualPosition(x, y, z) {
    this.isManualMode = true;
    this.manualPos = { x, y, z };
    
    if (this.pannerNode && this.audioCtx) {
      const currentTime = this.audioCtx.currentTime;
      this.pannerNode.positionX.setValueAtTime(x, currentTime);
      this.pannerNode.positionY.setValueAtTime(y, currentTime);
      this.pannerNode.positionZ.setValueAtTime(z, currentTime);
    }

    const angle = Math.atan2(x, z);
    if (this.onPositionUpdate) {
      this.onPositionUpdate({ x, y, z, angle, isManual: true });
    }
  }

  snapToSpeaker(speakerId) {
    const speaker = this.speakers.find((s) => s.id === speakerId);
    if (speaker) {
      this.setManualPosition(speaker.x, this.orbitElevation || 1.2, speaker.z);
      this.activeSpeakerId = speakerId;
    }
  }

  updateSpeakerPosition(speakerId, x, z) {
    const speaker = this.speakers.find((s) => s.id === speakerId);
    if (speaker) {
      speaker.x = x;
      speaker.z = z;
      if (this.speakerAudioNodes && this.speakerAudioNodes[speakerId]) {
        const panner = this.speakerAudioNodes[speakerId].panner;
        if (panner && this.audioCtx) {
          const currentTime = this.audioCtx.currentTime;
          panner.positionX.setValueAtTime(x, currentTime);
          panner.positionZ.setValueAtTime(z, currentTime);
        }
      }
    }
  }

  resetSpeakerLayout() {
    this.speakers = JSON.parse(JSON.stringify(SURROUND_SPEAKERS));
    this.activeSpeakerId = null;
    this.setAutoOrbitMode();
  }

  setAutoOrbitMode() {
    this.isManualMode = false;
    this.activeSpeakerId = null;
  }

  set8DEnabled(enabled) {
    this.is8DEnabled = enabled;
  }

  set8DSpeed(speed) {
    this.orbitSpeed = parseFloat(speed);
  }

  set8DRadius(radius) {
    this.orbitRadius = parseFloat(radius);
  }

  setOrbitPositionFromCoordinates(x, z) {
    const r = Math.max(0.5, Math.hypot(x, z));
    const angle = Math.atan2(x, z);
    this.orbitRadius = r;
    this.orbitAngle = angle;
    this.isManualMode = false;
  }

  set8DElevation(elevation) {
    this.orbitElevation = parseFloat(elevation);
  }

  set8DDirection(direction) {
    this.orbitDirection = direction === 'ccw' ? -1 : 1;
  }

  start8DLoop() {
    const animate = () => {
      if (this.audioElement && !this.audioElement.paused && this.speakerAudioNodes) {
        const currentTime = this.audioCtx ? this.audioCtx.currentTime : 0;

        if (this.is8DEnabled && !this.isManualMode) {
          // Orbit angle increment in Auto-Orbit Mode
          this.orbitAngle += 0.015 * this.orbitSpeed * this.orbitDirection;

          const orbX = this.orbitRadius * Math.sin(this.orbitAngle);
          const orbZ = this.orbitRadius * Math.cos(this.orbitAngle);
          const orbY = this.orbitElevation * Math.sin(this.orbitAngle * 0.5);

          // Modulate surround speaker volume gains based on 8D orbital sound position
          this.speakers.forEach((spk) => {
            const nodeInfo = this.speakerAudioNodes[spk.id];
            if (nodeInfo && nodeInfo.gain) {
              if (spk.type === 'subwoofer') {
                nodeInfo.gain.gain.setValueAtTime(0.85, currentTime);
              } else {
                const dist = Math.hypot(orbX - spk.x, orbZ - spk.z);
                // Proximity gain boost as 8D sound passes near each speaker
                const proximityGain = Math.max(0.15, Math.min(1.2, 1.2 - dist / 6.0));
                nodeInfo.gain.gain.setValueAtTime(proximityGain, currentTime);
              }
            }
          });

          if (this.onPositionUpdate) {
            this.onPositionUpdate({ x: orbX, y: orbY, z: orbZ, angle: this.orbitAngle, isManual: false });
          }
        } else {
          // Manual Mode / Orbit Off: Full Surround Sound Balance
          this.speakers.forEach((spk) => {
            const nodeInfo = this.speakerAudioNodes[spk.id];
            if (nodeInfo && nodeInfo.gain) {
              const defaultGain = spk.type === 'subwoofer' ? 0.85 : 0.55;
              nodeInfo.gain.gain.setValueAtTime(defaultGain, currentTime);
            }
          });

          if (this.onPositionUpdate) {
            this.onPositionUpdate({
              x: this.manualPos.x,
              y: this.manualPos.y,
              z: this.manualPos.z,
              angle: Math.atan2(this.manualPos.x, this.manualPos.z),
              isManual: true
            });
          }
        }
      }
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  // --- Equalizer Controls ---
  set15BandMode(enabled) {
    this.is15BandMode = enabled;
  }

  setEQBandGain(index, gain) {
    this.eqGains[index] = gain;
    if (this.eqNodes[index] && this.audioCtx) {
      this.eqNodes[index].gain.setValueAtTime(gain, this.audioCtx.currentTime);
    }
  }

  setEQ15BandGain(index, gain) {
    this.eq15Gains[index] = gain;
    if (this.eq15Nodes[index] && this.audioCtx) {
      this.eq15Nodes[index].gain.setValueAtTime(gain, this.audioCtx.currentTime);
    }
  }

  applyPreset(presetName) {
    const preset = EQ_PRESETS[presetName] || EQ_PRESETS.Flat;
    preset.forEach((gain, index) => {
      this.setEQBandGain(index, gain);
    });
    return [...preset];
  }

  apply15Preset(presetName) {
    const preset = EQ_15_PRESETS[presetName] || EQ_15_PRESETS.Flat;
    preset.forEach((gain, index) => {
      this.setEQ15BandGain(index, gain);
    });
    return [...preset];
  }

  setPreampGain(gainDb) {
    this.preampGain = gainDb;
    if (this.preampNode && this.audioCtx) {
      const linearGain = Math.pow(10, gainDb / 20);
      this.preampNode.gain.setValueAtTime(linearGain, this.audioCtx.currentTime);
    }
  }

  setBassBoost(gainDb) {
    this.bassBoostGain = gainDb;
    if (this.bassNode && this.audioCtx) {
      this.bassNode.gain.setValueAtTime(gainDb, this.audioCtx.currentTime);
    }
  }

  setTrebleGain(gainDb) {
    this.trebleGain = gainDb;
    if (this.trebleNode && this.audioCtx) {
      this.trebleNode.gain.setValueAtTime(gainDb, this.audioCtx.currentTime);
    }
  }

  // --- Custom EQ Presets LocalStorage Persistence ---
  loadCustomPresetsFromStorage() {
    try {
      const saved = localStorage.getItem('antigravity_custom_eq_presets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveCustomPreset(name, gains10, gains15) {
    this.customPresets[name] = { gains10: [...gains10], gains15: [...gains15] };
    try {
      localStorage.setItem('antigravity_custom_eq_presets', JSON.stringify(this.customPresets));
    } catch (e) {
      console.error('Error saving custom preset:', e);
    }
  }

  deleteCustomPreset(name) {
    delete this.customPresets[name];
    try {
      localStorage.setItem('antigravity_custom_eq_presets', JSON.stringify(this.customPresets));
    } catch (e) {
      console.error('Error deleting custom preset:', e);
    }
  }

  // --- 360° Reverb Controls ---
  setReverbPreset(presetName, wetAmount = this.reverbWet) {
    this.reverbPreset = presetName;
    this.reverbWet = wetAmount;

    if (!this.audioCtx) return;

    if (presetName === 'off') {
      this.dryGainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);
      this.wetGainNode.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
      return;
    }

    const sampleRate = this.audioCtx.sampleRate;
    let duration = 2.5;
    let decay = 3.0;

    switch (presetName) {
      case 'studio':
        duration = 0.8;
        decay = 4.5;
        break;
      case 'concert':
        duration = 2.8;
        decay = 2.5;
        break;
      case 'arena':
        duration = 3.8;
        decay = 1.8;
        break;
      case 'cathedral':
        duration = 5.5;
        decay = 1.2;
        break;
      case 'cosmic':
        duration = 4.5;
        decay = 1.5;
        break;
      default:
        duration = 2.0;
        decay = 2.5;
    }

    const impulseBuffer = this.generateImpulseResponse(duration, decay, sampleRate);
    this.convolverNode.buffer = impulseBuffer;

    this.dryGainNode.gain.setValueAtTime(1.0 - wetAmount * 0.5, this.audioCtx.currentTime);
    this.wetGainNode.gain.setValueAtTime(wetAmount, this.audioCtx.currentTime);
  }

  generateImpulseResponse(duration, decay, sampleRate) {
    const length = sampleRate * duration;
    const impulse = this.audioCtx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  }

  getFrequencyData(array) {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  getTimeDomainData(array) {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    }
  }
}

export const audioEngine = new AudioEngine();
