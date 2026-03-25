'use client';

import { useState } from 'react';
import type { SequenceItem } from '@/lib/types';
import { formatDurationHuman, totalDuration } from '@/lib/frequency-data';

interface SequenceTimelineProps {
  items: SequenceItem[];
  currentIndex: number;
  playbackStatus: 'stopped' | 'playing' | 'paused';
  elapsed: number;
  onRemove: (instanceId: string) => void;
  onMoveUp: (instanceId: string) => void;
  onMoveDown: (instanceId: string) => void;
  onUpdateDuration: (instanceId: string, duration: number) => void;
  onClearSequence: () => void;
}

const QUICK_DURATIONS = [
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '15m', value: 900 },
  { label: '30m', value: 1800 },
];

export default function SequenceTimeline({
  items,
  currentIndex,
  playbackStatus,
  elapsed,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdateDuration,
  onClearSequence,
}: SequenceTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
        <div className="text-4xl opacity-20">◈</div>
        <p className="font-orbitron text-sm text-muted-foreground">No blocks yet</p>
        <p className="text-xs text-muted-foreground/60 font-rajdhani">
          Go to the Library tab and tap a frequency to add it here
        </p>
      </div>
    );
  }

  const total = totalDuration(items);

  function startEdit(item: SequenceItem) {
    setEditingId(item.instanceId);
    setEditValue(String(Math.round(item.duration)));
  }

  function commitEdit(instanceId: string) {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 1) {
      onUpdateDuration(instanceId, val);
    }
    setEditingId(null);
  }

  return (
    <div className="pb-4">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-rajdhani text-xs text-muted-foreground uppercase tracking-widest">
          {items.length} block{items.length !== 1 ? 's' : ''} ·{' '}
          <span className="text-foreground/70">{formatDurationHuman(total)}</span>
        </div>
        <button
          onClick={onClearSequence}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors font-rajdhani uppercase tracking-wide"
          type="button"
        >
          Clear all
        </button>
      </div>

      {/* Blocks list */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isActive = idx === currentIndex && playbackStatus !== 'stopped';
          const isPast = playbackStatus !== 'stopped' && idx < currentIndex;
          const progress = isActive ? Math.min(elapsed / item.duration, 1) : isPast ? 1 : 0;

          return (
            <div
              key={item.instanceId}
              className={`relative rounded-xl overflow-hidden border transition-all ${
                isActive ? 'border-opacity-100 shadow-lg' : 'border-opacity-40'
              }`}
              style={{
                borderColor: isActive ? item.color : item.color + '44',
                backgroundColor: item.color + (isActive ? '1a' : '0d'),
                boxShadow: isActive ? `0 0 20px ${item.color}44, 0 0 40px ${item.color}22` : 'none',
              }}
            >
              {/* Progress bar */}
              {progress > 0 && (
                <div
                  className="absolute top-0 left-0 h-0.5 transition-all duration-1000"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }}
                />
              )}

              {/* Active pulse overlay */}
              {isActive && (
                <div
                  className="absolute inset-0 opacity-5 animate-glow-pulse rounded-xl"
                  style={{ backgroundColor: item.color }}
                />
              )}

              <div className="relative flex items-center gap-3 px-3 py-3">
                {/* Block number */}
                <div
                  className="font-mono text-xs w-5 text-center shrink-0"
                  style={{ color: item.color + '99' }}
                >
                  {idx + 1}
                </div>

                {/* Frequency info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-mono text-xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.hz}
                    </span>
                    <span className="font-mono text-xs opacity-50" style={{ color: item.color }}>
                      Hz
                    </span>
                    <span
                      className="font-rajdhani text-xs uppercase tracking-wide truncate"
                      style={{ color: item.color + 'aa' }}
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Duration editor */}
                  {editingId === item.instanceId ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex gap-1 flex-wrap">
                        {QUICK_DURATIONS.map(d => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => {
                              onUpdateDuration(item.instanceId, d.value);
                              setEditingId(null);
                            }}
                            className="text-xs px-1.5 py-0.5 rounded border border-border bg-muted hover:bg-secondary text-muted-foreground font-rajdhani"
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => commitEdit(item.instanceId)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit(item.instanceId);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        min={1}
                        autoFocus
                        className="w-16 bg-input border border-border rounded px-2 py-0.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        aria-label="Duration in seconds"
                      />
                      <span className="text-xs text-muted-foreground font-rajdhani">s</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="mt-1 text-xs font-rajdhani text-muted-foreground/70 hover:text-muted-foreground transition-colors text-left"
                    >
                      ⏱ {formatDurationHuman(item.duration)}
                      <span className="ml-1 opacity-50">(tap to edit)</span>
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveUp(item.instanceId)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-muted/50 hover:bg-secondary disabled:opacity-20 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(item.instanceId)}
                    disabled={idx === items.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-muted/50 hover:bg-secondary disabled:opacity-20 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-all"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.instanceId)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive/60 hover:text-destructive transition-all shrink-0"
                  aria-label="Remove block"
                >
                  ✕
                </button>
              </div>

              {/* Active label */}
              {isActive && (
                <div
                  className="absolute top-1 right-10 font-orbitron text-xs px-1.5 py-0.5 rounded"
                  style={{
                    color: item.color,
                    backgroundColor: item.color + '22',
                    fontSize: '9px',
                    letterSpacing: '0.05em',
                  }}
                >
                  PLAYING
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
