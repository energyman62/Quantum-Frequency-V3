'use client';

import WaveformDisplay from './waveform-display';
import type { SequenceItem } from '@/lib/types';
import { formatDuration, formatDurationHuman } from '@/lib/frequency-data';

interface PlaybackBarProps {
  items: SequenceItem[];
  currentIndex: number;
  elapsed: number;
  status: 'stopped' | 'playing' | 'paused';
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
}

export default function PlaybackBar({
  items,
  currentIndex,
  elapsed,
  status,
  volume,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
}: PlaybackBarProps) {
  const current = items[currentIndex];
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isStopped = status === 'stopped';

  const blockProgress = current ? Math.min(elapsed / current.duration, 1) : 0;
  const timeRemaining = current ? Math.max(current.duration - elapsed, 0) : 0;

  // Total sequence progress
  const totalElapsedAll =
    items.slice(0, currentIndex).reduce((acc, i) => acc + i.duration, 0) + elapsed;
  const totalDur = items.reduce((acc, i) => acc + i.duration, 0);
  const seqProgress = totalDur > 0 ? Math.min(totalElapsedAll / totalDur, 1) : 0;

  const blockColor = current?.color ?? '#1dd8e8';

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-sm">
      {/* Waveform */}
      <div className="px-4 pt-3">
        <WaveformDisplay color={blockColor} isPlaying={isPlaying} />
      </div>

      {/* Current block info */}
      {current && !isStopped ? (
        <div className="px-4 pt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: blockColor, textShadow: `0 0 12px ${blockColor}88` }}
            >
              {current.hz}
            </span>
            <span className="font-mono text-xs opacity-50" style={{ color: blockColor }}>
              Hz
            </span>
            <span
              className="font-rajdhani text-sm uppercase tracking-wide"
              style={{ color: blockColor + 'aa' }}
            >
              {current.name}
            </span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm text-foreground/80">
              -{formatDuration(timeRemaining)}
            </div>
            <div className="font-rajdhani text-xs text-muted-foreground">
              {currentIndex + 1}/{items.length}
            </div>
          </div>
        </div>
      ) : isStopped && items.length > 0 ? (
        <div className="px-4 pt-2">
          <div className="font-rajdhani text-xs text-muted-foreground">
            {items.length} block{items.length !== 1 ? 's' : ''} ·{' '}
            {formatDurationHuman(totalDur)} total
          </div>
        </div>
      ) : (
        <div className="px-4 pt-2">
          <div className="font-orbitron text-xs text-muted-foreground/50 uppercase tracking-widest">
            No sequence loaded
          </div>
        </div>
      )}

      {/* Block progress bar */}
      {!isStopped && current && (
        <div className="px-4 pt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${blockProgress * 100}%`,
                backgroundColor: blockColor,
                boxShadow: `0 0 6px ${blockColor}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Sequence progress bar */}
      {!isStopped && totalDur > 0 && (
        <div className="px-4 pt-1">
          <div className="h-0.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 bg-muted-foreground/40"
              style={{ width: `${seqProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 pt-3 pb-4 flex items-center gap-3">
        {/* Stop */}
        <button
          type="button"
          onClick={onStop}
          disabled={isStopped}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/50 hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Stop"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="1" y="1" width="12" height="12" rx="2" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          disabled={items.length === 0}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-orbitron text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          style={
            items.length > 0
              ? {
                  backgroundColor: blockColor + '22',
                  border: `1px solid ${blockColor}66`,
                  color: blockColor,
                  boxShadow: isPlaying ? `0 0 16px ${blockColor}44` : 'none',
                }
              : { backgroundColor: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }
          }
          aria-label={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
        >
          {isPlaying ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="4" height="12" rx="1" />
                <rect x="10" y="2" width="4" height="12" rx="1" />
              </svg>
              PAUSE
            </>
          ) : isPaused ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l11 6-11 6V2z" />
              </svg>
              RESUME
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l11 6-11 6V2z" />
              </svg>
              PLAY
            </>
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground shrink-0"
          >
            <path d="M1 5h3l3-3v10l-3-3H1V5zM10 4c1 1 1 5 0 6" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={e => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 accent-primary"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
