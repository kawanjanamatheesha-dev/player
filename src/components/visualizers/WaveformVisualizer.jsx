import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../audio/AudioEngine';

export const WaveformVisualizer = ({ coverUrl, isPlaying, trackTitle, artistName }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const dataArray = new Uint8Array(256);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Get Time Domain Waveform Data
      audioEngine.getTimeDomainData(dataArray);

      ctx.lineWidth = 3;
      
      // Waveform Gradient Fill
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#ff007f');
      gradient.addColorStop(0.3, '#9d00ff');
      gradient.addColorStop(0.7, '#00f3ff');
      gradient.addColorStop(1, '#00ff66');

      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0; // 0 to 2
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Mirror reflection below
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = height - (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div className="relative flex flex-col items-center justify-center py-4 w-full">
      {/* Central Album Cover */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-4 group">
        <img src={coverUrl} alt={trackTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {trackTitle}
        </h2>
        <p className="text-sm text-purple-300 font-medium mt-0.5">
          {artistName}
        </p>
      </div>

      {/* Dynamic Fluid Waveform Canvas */}
      <div className="w-full max-w-md h-28 glass-card rounded-2xl p-2 border border-purple-500/20 shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-full rounded-xl"
        />
      </div>
    </div>
  );
};
