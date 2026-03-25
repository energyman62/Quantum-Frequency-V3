'use client';

import { useState } from 'react';
import type { FrequencyBlock } from '@/lib/types';
import { PRESET_BLOCKS } from '@/lib/frequency-data';

interface PresetLibraryProps {
  customBlocks: FrequencyBlock[];
  onAddToSequence: (block: FrequencyBlock) => void;
  onAddCustomBlock: (block: FrequencyBlock) => void;
  onDeleteCustomBlock: (id: string) => void;
}

const PALETTE = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7',
  '#8b5cf6', '#ec4899', '#14b8a6', '#e8eaf0',
];

export default function PresetLibrary({
  customBlocks,
  onAddToSequence,
  onAddCustomBlock,
  onDeleteCustomBlock,
}: PresetLibraryProps) {
  const [hz, setHz] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  function flashAdded(id: string) {
    setAddedId(id);
    setTimeout(() => setAddedId(null), 600);
  }

  function handleAdd(block: FrequencyBlock) {
    onAddToSequence(block);
    flashAdded(block.id);
  }

  function handleCreateCustom(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const hzNum = parseInt(hz, 10);
    if (isNaN(hzNum) || hzNum < 100 || hzNum > 1000) {
      setError('Enter a whole number between 100 and 1000');
      return;
    }
    const label = name.trim() || `${hzNum} Hz`;
    const block: FrequencyBlock = {
      id: `custom-${Date.now()}`,
      name: label,
      hz: hzNum,
      color,
      isPreset: false,
    };
    onAddCustomBlock(block);
    setHz('');
    setName('');
    console.log(`PresetLibrary: created custom block ${hzNum}Hz`);
  }

  return (
    <div className="space-y-6 pb-4">
      {/* ── Preset Blocks ── */}
      <section>
        <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
          Preset Frequencies
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_BLOCKS.map(block => (
            <FreqBlockButton
              key={block.id}
              block={block}
              flashing={addedId === block.id}
              onAdd={() => handleAdd(block)}
            />
          ))}
        </div>
      </section>

      {/* ── Custom Blocks ── */}
      {customBlocks.length > 0 && (
        <section>
          <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
            My Frequencies
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {customBlocks.map(block => (
              <FreqBlockButton
                key={block.id}
                block={block}
                flashing={addedId === block.id}
                onAdd={() => handleAdd(block)}
                onDelete={() => onDeleteCustomBlock(block.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Create Custom Block ── */}
      <section>
        <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
          Create Custom Frequency
        </h2>
        <form
          onSubmit={handleCreateCustom}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1 font-rajdhani uppercase tracking-wide">
                Hz (100–1000)
              </label>
              <input
                type="number"
                value={hz}
                onChange={e => setHz(e.target.value)}
                placeholder="e.g. 440"
                min={100}
                max={1000}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 font-mono text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted-foreground mb-1 font-rajdhani uppercase tracking-wide">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Tune A"
                maxLength={20}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Color palette */}
          <div>
            <label className="block text-xs text-muted-foreground mb-2 font-rajdhani uppercase tracking-wide">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#ffffff' : 'transparent',
                    boxShadow: color === c ? `0 0 8px ${c}` : 'none',
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              {/* Custom color picker */}
              <div
                className="w-7 h-7 rounded-full border-2 border-border overflow-hidden cursor-pointer hover:scale-110 transition-transform relative"
                title="Custom color"
              >
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 w-10 h-10 -translate-x-1 -translate-y-1 cursor-pointer"
                  aria-label="Custom color picker"
                />
              </div>
            </div>
          </div>

          {/* Preview & Submit */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-lg px-3 py-2 text-center font-rajdhani font-semibold text-sm"
              style={{
                backgroundColor: color + '22',
                border: `1px solid ${color}66`,
                color,
              }}
            >
              {hz ? `${hz} Hz` : '--- Hz'} · {name || 'Custom'}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
            >
              + Add
            </button>
          </div>

          {error && (
            <p className="text-destructive text-xs font-rajdhani">{error}</p>
          )}
        </form>
      </section>
    </div>
  );
}

/* ─── FreqBlockButton ─────────────────────────────────────────────────────── */

interface FreqBlockButtonProps {
  block: FrequencyBlock;
  flashing: boolean;
  onAdd: () => void;
  onDelete?: () => void;
}

function FreqBlockButton({ block, flashing, onAdd, onDelete }: FreqBlockButtonProps) {
  return (
    <div
      className="relative rounded-xl overflow-hidden group cursor-pointer select-none active:scale-95 transition-transform"
      style={{
        backgroundColor: block.color + '18',
        border: `1px solid ${block.color}55`,
        boxShadow: flashing ? `0 0 20px ${block.color}88` : 'none',
        transition: 'box-shadow 0.3s ease, transform 0.1s ease',
      }}
      onClick={onAdd}
      role="button"
      aria-label={`Add ${block.name} (${block.hz}Hz) to sequence`}
    >
      <div className="px-3 py-3">
        <div
          className="font-mono text-xl font-bold leading-none"
          style={{ color: block.color }}
        >
          {block.hz}
        </div>
        <div className="font-mono text-xs opacity-60 leading-none mb-1">Hz</div>
        <div
          className="font-rajdhani text-xs font-semibold uppercase tracking-wide"
          style={{ color: block.color + 'cc' }}
        >
          {block.name}
        </div>
      </div>

      {/* Add indicator */}
      <div
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: block.color, color: '#000' }}
      >
        +
      </div>

      {/* Delete button for custom blocks */}
      {onDelete && (
        <button
          className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-80 transition-opacity hover:opacity-100 bg-destructive/80 text-white"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          aria-label={`Delete ${block.name}`}
          type="button"
        >
          ×
        </button>
      )}

      {/* Flash overlay */}
      {flashing && (
        <div
          className="absolute inset-0 animate-ping rounded-xl opacity-30"
          style={{ backgroundColor: block.color }}
        />
      )}
    </div>
  );
}
