'use client';

import { useEffect, useRef } from 'react';
import { getAudioEngine } from '@/lib/audio-engine';

interface WaveformDisplayProps {
  color: string;
  isPlaying: boolean;
}

export default function WaveformDisplay({ color, isPlaying }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const W = canvas.width;
      const H = canvas.height;

      // Dark background with slight fade for trails
      ctx.fillStyle = 'rgba(6, 11, 21, 0.85)';
      ctx.fillRect(0, 0, W, H);

      const analyser = getAudioEngine().getAnalyserNode();

      if (analyser && isPlaying) {
        // Real-time waveform from analyser
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = W / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * H) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Static decorative square wave
        const alpha = isPlaying ? '0.5' : '0.25';
        ctx.strokeStyle = color + (isPlaying ? 'cc' : '55');
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = isPlaying ? 4 : 0;
        ctx.beginPath();

        const step = W / 8;
        const top = H * 0.25;
        const bot = H * 0.75;
        let px = 0;

        ctx.moveTo(px, bot);
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(px, top);
          ctx.lineTo(px + step, top);
          ctx.lineTo(px + step, bot);
          ctx.lineTo(px + step * 2, bot);
          px += step * 2;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        void alpha; // suppress unused warning
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [color, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={64}
      className="w-full h-16 rounded-lg"
      style={{ display: 'block' }}
    />
  );
}
