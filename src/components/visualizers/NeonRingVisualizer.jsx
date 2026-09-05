import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { Disc, Radio, Sparkles } from 'lucide-react';

export const NeonRingVisualizer = ({ coverUrl, isPlaying, trackTitle, artistName }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const freqData = new Uint8Array(128);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 95;

      ctx.clearRect(0, 0, width, height);

      audioEngine.getFrequencyData(freqData);

      // Draw 360 Degree Dancing Spectrum Spikes
      const barCount = 64;
      const angleStep = (Math.PI * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i % freqData.length] / 255;
        const barHeight = Math.max(8, val * 70);
        const angle = i * angleStep;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Neon Red & Cyan Gradient Spikes
        const spikeGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        spikeGrad.addColorStop(0, '#00f3ff');
        spikeGrad.addColorStop(0.5, '#ff0055');
        spikeGrad.addColorStop(1, '#ff00a0');

        ctx.strokeStyle = spikeGrad;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowColor = i % 2 === 0 ? '#ff0055' : '#00f3ff';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-4 space-y-4">
      {/* 360 Cyberpunk Canvas & Album Cover Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        {/* Canvas Spikes */}
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Pulsing Cover Art Glass Frame */}
        <div className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-red-500/80 shadow-[0_0_40px_rgba(255,0,85,0.5)] z-10 transition-transform duration-700 ${isPlaying ? 'scale-105 shadow-[0_0_60px_rgba(255,0,85,0.8)]' : ''}`}>
          <img
            src={coverUrl}
            alt={trackTitle}
            className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      </div>

      {/* Track Details */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          {trackTitle}
          <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
        </h2>
        <p className="text-xs font-bold text-cyan-400">
          {artistName}
        </p>
      </div>
    </div>
  );
};
