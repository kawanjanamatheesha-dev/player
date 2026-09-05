import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { MousePointer, RotateCw, Move, Volume2, RotateCcw, Zap, Gauge, Sliders, Compass, Radio } from 'lucide-react';

export const Radar3DVisualizer = ({ is8DEnabled, onToggle8D }) => {
  const canvasRef = useRef(null);
  
  // Persistent Speaker & Subwoofer Locations State
  const [speakers, setSpeakers] = useState([...audioEngine.speakers]);
  const [draggedSpeakerId, setDraggedSpeakerId] = useState(null);
  const [isDraggingOrb, setIsDraggingOrb] = useState(false);

  const [isManualMode, setIsManualMode] = useState(audioEngine.isManualMode);
  const [activeSpeaker, setActiveSpeaker] = useState(audioEngine.activeSpeakerId || null);
  const [manualCoords, setManualCoords] = useState({ distance: '0.0', angleDeg: 0 });

  // 8D Orbit Speed & Radius Control States
  const [speed, setSpeed] = useState(audioEngine.orbitSpeed || 1.0);
  const [radius, setRadius] = useState(audioEngine.orbitRadius || 4.0);

  useEffect(() => {
    setSpeakers([...audioEngine.speakers]);
    setActiveSpeaker(audioEngine.activeSpeakerId);
    setIsManualMode(audioEngine.isManualMode);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let soundPos = { x: audioEngine.manualPos.x, y: 0, z: audioEngine.manualPos.z, angle: 0, isManual: audioEngine.isManualMode };
    const trail = [];
    let radarSweepAngle = 0;

    // Subscribe to AudioEngine position updates
    audioEngine.onPositionUpdate = (pos) => {
      soundPos = pos;
      setIsManualMode(pos.isManual);
      const dist = Math.hypot(pos.x, pos.z).toFixed(1);
      const deg = Math.round((Math.atan2(pos.x, pos.z) * 180) / Math.PI);
      setManualCoords({ distance: dist, angleDeg: deg < 0 ? deg + 360 : deg });

      trail.push({ x: pos.x, z: pos.z, alpha: 1.0 });
      if (trail.length > 30) trail.shift();
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 24;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Draw Radar Background Gradient ---
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width / 2);
      bgGrad.addColorStop(0, 'rgba(5, 11, 20, 0.25)');
      bgGrad.addColorStop(0.7, 'rgba(8, 18, 36, 0.35)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 16, 0.45)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // --- 2. Draw Radar Sonar Rotating Sweeper Line ---
      radarSweepAngle += 0.025 * speed;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(radarSweepAngle);

      // Sector Sweep Wedge Glow
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, width / 2 - 10, -0.4, 0);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, width / 2);
      sweepGrad.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
      sweepGrad.addColorStop(1, 'rgba(0, 243, 255, 0.0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Scanner Line Edge
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width / 2 - 10, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // --- 3. Draw Radar Concentric 360 Distance Rings ---
      for (let r = 1; r <= 3; r++) {
        ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 + r * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * scale * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Ring distance text label
        ctx.fillStyle = 'rgba(0, 243, 255, 0.7)';
        ctx.font = 'bold 8px font-mono, sans-serif';
        ctx.fillText(`${(r * 2.5).toFixed(1)}m`, centerX + 4, centerY - r * scale * 3 + 10);
      }

      // Draw Radar Grid Crosshairs
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2 + 10, centerY);
      ctx.lineTo(centerX + width / 2 - 10, centerY);
      ctx.moveTo(centerX, centerY - height / 2 + 10);
      ctx.lineTo(centerX, centerY + height / 2 - 10);
      ctx.stroke();

      // Draw 360 Angle Labels
      ctx.fillStyle = '#00f3ff';
      ctx.font = 'extrabold 9px font-mono, sans-serif';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 6;
      ctx.fillText('0° FRONT', centerX - 24, centerY - scale * 9.5);
      ctx.fillText('180° REAR', centerX - 26, centerY + scale * 10);
      ctx.fillText('270° L', centerX - scale * 10.5, centerY + 3);
      ctx.fillText('90° R', centerX + scale * 8.2, centerY + 3);
      ctx.shadowBlur = 0;

      // --- 4. Draw 7.1 Surround Speaker Array Nodes + Subwoofer Node ---
      const bassPulse = (Date.now() / 15) % 25;

      speakers.forEach((spk) => {
        const spkX = centerX + spk.x * scale * 0.95;
        const spkY = centerY + spk.z * scale * 0.95;
        const isActiveSpk = activeSpeaker === spk.id;
        const isBeingDragged = draggedSpeakerId === spk.id;
        const isSubwoofer = spk.type === 'subwoofer' || spk.id === 'SUB';

        if (isSubwoofer) {
          // Subwoofer Pulsing Wave Ring
          ctx.strokeStyle = 'rgba(255, 0, 85, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(spkX, spkY, 12 + bassPulse * 0.6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = isBeingDragged ? 30 : 20;
          ctx.fillStyle = isBeingDragged ? '#ff0055' : '#b00042';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.arc(spkX, spkY, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Inner Sub Core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(spkX, spkY, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ff0055';
          ctx.font = 'extrabold 10px font-mono, sans-serif';
          ctx.fillText('SUB 🔊', spkX - 17, spkY + 24);

        } else {
          ctx.shadowColor = isBeingDragged ? '#ff0055' : isActiveSpk ? '#ff0055' : '#00f3ff';
          ctx.shadowBlur = isBeingDragged ? 25 : isActiveSpk ? 18 : 10;
          ctx.fillStyle = isBeingDragged
            ? '#ff0055'
            : isActiveSpk
            ? 'rgba(255, 0, 85, 0.85)'
            : '#092138';
          ctx.strokeStyle = isBeingDragged ? '#ffffff' : isActiveSpk ? '#ff0055' : '#00f3ff';
          ctx.lineWidth = isBeingDragged ? 2.5 : 1.5;

          ctx.beginPath();
          ctx.arc(spkX, spkY, isBeingDragged ? 14 : 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = isBeingDragged || isActiveSpk ? '#ffffff' : '#00f3ff';
          ctx.beginPath();
          ctx.arc(spkX, spkY, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isBeingDragged ? '#ffffff' : isActiveSpk ? '#ff0055' : '#ffffff';
          ctx.font = 'bold 9px font-mono, sans-serif';
          ctx.fillText(spk.id, spkX - 6, spkY + 19);
        }

        if (isBeingDragged) {
          ctx.strokeStyle = isSubwoofer ? 'rgba(255, 0, 85, 0.8)' : 'rgba(0, 243, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(spkX, spkY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Center Listener Headset
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - 11, centerY, 4.5, 0, Math.PI * 2);
      ctx.arc(centerX + 11, centerY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw 8D Orbit Path Trajectory Circle
      if (is8DEnabled && !soundPos.isManual) {
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- 5. Draw Glowing Multi-Color Orbit Motion Trail Particles ---
      trail.forEach((t, i) => {
        t.alpha -= 0.025;
        if (t.alpha > 0) {
          const trailColor = i % 2 === 0 ? `rgba(255, 0, 85, ${t.alpha * 0.6})` : `rgba(0, 243, 255, ${t.alpha * 0.6})`;
          ctx.fillStyle = trailColor;
          ctx.beginPath();
          ctx.arc(centerX + t.x * scale, centerY + t.z * scale, 3 + (i / trail.length) * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Calculate Current Sound Orb Position
      const orbX = centerX + soundPos.x * scale;
      const orbY = centerY + soundPos.z * scale;

      const pulse = (Date.now() / 20) % 30;
      ctx.strokeStyle = soundPos.isManual ? 'rgba(255, 0, 85, 0.8)' : 'rgba(0, 243, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 7 + pulse * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = soundPos.isManual ? '#ff0055' : '#00f3ff';
      ctx.shadowBlur = 28;
      const orbGradient = ctx.createRadialGradient(orbX, orbY, 2, orbX, orbY, 13);
      if (soundPos.isManual) {
        orbGradient.addColorStop(0, '#ffffff');
        orbGradient.addColorStop(0.5, '#ff0055');
        orbGradient.addColorStop(1, '#9d00ff');
      } else {
        orbGradient.addColorStop(0, '#ffffff');
        orbGradient.addColorStop(0.5, '#00f3ff');
        orbGradient.addColorStop(1, '#0066ff');
      }

      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = soundPos.isManual ? 'rgba(255, 0, 85, 0.5)' : 'rgba(0, 243, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(orbX, orbY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      audioEngine.onPositionUpdate = null;
    };
  }, [is8DEnabled, radius, speed, activeSpeaker, speakers, draggedSpeakerId]);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 24;

    let hitSpeaker = null;
    speakers.forEach((spk) => {
      const spkX = centerX + spk.x * scale * 0.95;
      const spkY = centerY + spk.z * scale * 0.95;
      const dist = Math.hypot(mouseX - spkX, mouseY - spkY);
      if (dist < 22) {
        hitSpeaker = spk;
      }
    });

    if (hitSpeaker) {
      setDraggedSpeakerId(hitSpeaker.id);
      setActiveSpeaker(hitSpeaker.id);
      return;
    }

    setIsDraggingOrb(true);
    const x3d = (mouseX - centerX) / scale;
    const z3d = (mouseY - centerY) / scale;

    if (is8DEnabled) {
      audioEngine.setOrbitPositionFromCoordinates(x3d, z3d);
      setRadius(audioEngine.orbitRadius);
    } else {
      audioEngine.setManualPosition(x3d, audioEngine.orbitElevation || 1.2, z3d);
      setIsManualMode(true);
    }
    setActiveSpeaker(null);
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 24;

    const x3d = (mouseX - centerX) / scale;
    const z3d = (mouseY - centerY) / scale;

    if (draggedSpeakerId) {
      audioEngine.updateSpeakerPosition(draggedSpeakerId, x3d, z3d);
      setSpeakers([...audioEngine.speakers]);
      return;
    }

    if (isDraggingOrb) {
      if (is8DEnabled) {
        audioEngine.setOrbitPositionFromCoordinates(x3d, z3d);
        setRadius(audioEngine.orbitRadius);
      } else {
        audioEngine.setManualPosition(x3d, audioEngine.orbitElevation || 1.2, z3d);
      }
    }
  };

  const handlePointerUp = () => {
    setDraggedSpeakerId(null);
    setIsDraggingOrb(false);
  };

  const handleSpeakerClick = (speakerId) => {
    setActiveSpeaker(speakerId);
  };

  const handleResumeAutoOrbit = () => {
    audioEngine.setAutoOrbitMode();
    setIsManualMode(false);
    setActiveSpeaker(null);
  };

  const handleResetSpeakerLayout = () => {
    audioEngine.resetSpeakerLayout();
    setSpeakers([...audioEngine.speakers]);
    setActiveSpeaker(null);
    setIsManualMode(false);
  };

  const handleSpeedChange = (val) => {
    const v = parseFloat(val);
    setSpeed(v);
    audioEngine.set8DSpeed(v);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-5 glass-panel rounded-3xl border border-cyan-500/40 shadow-2xl select-none space-y-4">
      
      {/* Card Header */}
      <div className="flex items-center justify-between w-full pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white neon-text-cyan">
            3D SPATIAL SOUND SONAR RADAR
          </span>
        </div>

        {/* Master Auto-Orbit Spinning Motion Switch */}
        <button
          onClick={onToggle8D}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs font-mono transition-all border shadow-lg ${
            is8DEnabled
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300 shadow-cyan-500/40'
              : 'glass-pill text-slate-300 border-slate-700 hover:bg-white/15'
          }`}
          title="Toggle Auto-Orbit Spinning Motion"
        >
          <RotateCw className={`w-4 h-4 ${is8DEnabled ? 'animate-spin-slow text-white' : ''}`} />
          <span>AUTO-ORBIT: {is8DEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* 8D SPEED CONTROL PANEL */}
      <div className="w-full glass-card p-3.5 rounded-2xl border border-white/10 space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between text-xs font-extrabold">
          <span className="text-white flex items-center gap-1.5 font-bold">
            <Gauge className="w-4 h-4 text-cyan-400 animate-spin-slow" /> 8D Orbit RPM Speed Control:
          </span>
          <span className="font-mono text-cyan-400 font-extrabold text-sm neon-text-cyan">{speed.toFixed(1)}x RPM</span>
        </div>

        {/* Speed Range Slider */}
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={speed}
          onChange={(e) => handleSpeedChange(e.target.value)}
          className="w-full"
        />

        {/* Speed Preset Quick Chips */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <button
            onClick={() => handleSpeedChange(0.4)}
            className={`py-1 rounded-xl text-[10px] font-bold font-mono transition border ${
              speed === 0.4 ? 'bg-cyan-500 text-slate-950 font-extrabold border-cyan-300 shadow-md' : 'glass-pill text-white hover:bg-white/20'
            }`}
          >
            🐢 Slow 0.4x
          </button>
          <button
            onClick={() => handleSpeedChange(1.0)}
            className={`py-1 rounded-xl text-[10px] font-bold font-mono transition border ${
              speed === 1.0 ? 'bg-cyan-500 text-slate-950 font-extrabold border-cyan-300 shadow-md' : 'glass-pill text-white hover:bg-white/20'
            }`}
          >
            ⚡ Normal 1.0x
          </button>
          <button
            onClick={() => handleSpeedChange(2.0)}
            className={`py-1 rounded-xl text-[10px] font-bold font-mono transition border ${
              speed === 2.0 ? 'bg-cyan-500 text-slate-950 font-extrabold border-cyan-300 shadow-md' : 'glass-pill text-white hover:bg-white/20'
            }`}
          >
            🚀 Fast 2.0x
          </button>
          <button
            onClick={() => handleSpeedChange(3.0)}
            className={`py-1 rounded-xl text-[10px] font-bold font-mono transition border ${
              speed === 3.0 ? 'bg-red-600 text-white font-extrabold border-red-400 shadow-md shadow-red-500/40' : 'glass-pill text-red-300 hover:bg-red-500/30'
            }`}
          >
            🌀 Hyper 3.0x
          </button>
        </div>
      </div>

      {/* 7.1 Surround Speakers + SUB Subwoofer Snap Selector Bar */}
      <div className="w-full space-y-1.5">
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1 text-white font-bold">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> 7.1 Speakers + Subwoofer:
          </span>
          <button
            onClick={handleResetSpeakerLayout}
            className="text-[10px] text-red-400 hover:text-white font-mono flex items-center gap-1 font-bold transition"
            title="Reset speaker layout to default angles"
          >
            <RotateCcw className="w-3 h-3" /> Reset Layout
          </button>
        </div>
        
        {/* Speaker & Subwoofer Chips Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {speakers.map((spk) => {
            const isActive = activeSpeaker === spk.id;
            const isBeingDragged = draggedSpeakerId === spk.id;
            const isSub = spk.id === 'SUB';
            return (
              <button
                key={spk.id}
                onClick={() => handleSpeakerClick(spk.id)}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold font-mono text-center transition-all border cursor-grab active:cursor-grabbing ${
                  isSub
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/40'
                    : isBeingDragged || isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/40 scale-105'
                    : 'glass-pill text-white border-white/10 hover:border-cyan-400 hover:bg-white/20'
                }`}
                title={`Click or drag ${spk.label}`}
              >
                {isSub ? '🔊 SUB' : `🔊 ${spk.id}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Canvas with Subwoofer Drag & Drop */}
      <div className="relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={290}
          height={290}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="rounded-full bg-slate-950/80 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,243,255,0.25)] shadow-inner"
        />

        {/* Overlay Drag Prompt */}
        {!draggedSpeakerId && !isDraggingOrb && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-red-500/60 backdrop-blur-md text-[10px] font-extrabold text-red-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl pointer-events-none">
            <Zap className="w-3.5 h-3.5 animate-pulse text-red-500" /> Drag Any Speaker / Subwoofer 🔊
          </div>
        )}
      </div>

      {/* Real-time Position Coordinates Display */}
      <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-300 bg-slate-950/70 py-2 px-3.5 rounded-2xl border border-white/10 shadow-inner">
        <span>
          📍 Dist: <strong className="text-cyan-400 font-extrabold">{manualCoords.distance}m</strong>
        </span>
        <span>
          🧭 Angle: <strong className="text-red-400 font-extrabold">{manualCoords.angleDeg}°</strong>
        </span>
        {draggedSpeakerId ? (
          <span className="text-[10px] text-red-400 font-bold uppercase animate-pulse">
            Dragging {draggedSpeakerId} Node
          </span>
        ) : activeSpeaker ? (
          <span className="text-[10px] text-red-300 font-bold uppercase">
            {activeSpeaker} Active
          </span>
        ) : (
          <button
            onClick={handleResumeAutoOrbit}
            className="text-[10px] text-cyan-300 underline font-sans font-bold"
          >
            {is8DEnabled ? 'Auto Orbit Active' : 'Resume Orbit ↺'}
          </button>
        )}
      </div>
    </div>
  );
};
