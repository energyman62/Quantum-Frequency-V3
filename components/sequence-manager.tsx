'use client';

import { useState } from 'react';
import type { SavedSequence, SequenceItem } from '@/lib/types';
import { formatDurationHuman, totalDuration } from '@/lib/frequency-data';

interface SequenceManagerProps {
  currentItems: SequenceItem[];
  savedSequences: SavedSequence[];
  defaultSequences: SavedSequence[];
  onLoadSequence: (seq: SavedSequence) => void;
  onSaveSequence: (name: string) => void;
  onDeleteSequence: (id: string) => void;
}

export default function SequenceManager({
  currentItems,
  savedSequences,
  defaultSequences,
  onLoadSequence,
  onSaveSequence,
  onDeleteSequence,
}: SequenceManagerProps) {
  const [saveName, setSaveName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const name = saveName.trim();
    if (!name) {
      setSaveError('Enter a name for this sequence');
      return;
    }
    if (currentItems.length === 0) {
      setSaveError('Add some blocks to your sequence first');
      return;
    }
    setSaveError('');
    onSaveSequence(name);
    setSaveName('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    console.log(`SequenceManager: saved sequence "${name}"`);
  }

  function confirmDelete(id: string) {
    if (deleteConfirm === id) {
      onDeleteSequence(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  return (
    <div className="space-y-6 pb-4">
      {/* ── Save Current Sequence ── */}
      <section>
        <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
          Save Current Sequence
        </h2>
        <form
          onSubmit={handleSave}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Sequence name..."
              maxLength={40}
              className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 font-rajdhani"
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm transition-all active:scale-95 ${
                savedFlash
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {savedFlash ? '✓ Saved!' : 'Save'}
            </button>
          </div>
          {saveError && (
            <p className="text-destructive text-xs font-rajdhani">{saveError}</p>
          )}
          {currentItems.length > 0 && (
            <p className="text-muted-foreground text-xs font-rajdhani">
              {currentItems.length} block{currentItems.length !== 1 ? 's' : ''} ·{' '}
              {formatDurationHuman(totalDuration(currentItems))}
            </p>
          )}
        </form>
      </section>

      {/* ── My Saved Sequences ── */}
      {savedSequences.length > 0 && (
        <section>
          <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
            My Sequences
          </h2>
          <div className="space-y-2">
            {savedSequences.map(seq => (
              <SequenceCard
                key={seq.id}
                seq={seq}
                onLoad={() => onLoadSequence(seq)}
                onDelete={() => confirmDelete(seq.id)}
                confirmingDelete={deleteConfirm === seq.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Default Sequences ── */}
      <section>
        <h2 className="font-orbitron text-xs tracking-widest text-muted-foreground uppercase mb-3">
          Default Sequences
        </h2>
        <div className="space-y-2">
          {defaultSequences.map(seq => (
            <SequenceCard
              key={seq.id}
              seq={seq}
              onLoad={() => onLoadSequence(seq)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── SequenceCard ──────────────────────────────────────────────────────────── */

interface SequenceCardProps {
  seq: SavedSequence;
  onLoad: () => void;
  onDelete?: () => void;
  confirmingDelete?: boolean;
}

function SequenceCard({ seq, onLoad, onDelete, confirmingDelete }: SequenceCardProps) {
  const total = totalDuration(seq.items);
  // Get up to 6 block colors for the color swatch
  const colors = seq.items.slice(0, 8).map(i => i.color);

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-secondary transition-colors">
      {/* Color strip */}
      <div className="flex gap-0.5 shrink-0">
        {colors.map((c, i) => (
          <div
            key={i}
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: c + 'aa' }}
          />
        ))}
        {seq.items.length > 8 && (
          <div className="w-2 h-8 rounded-full bg-muted flex items-end justify-center">
            <span className="text-muted-foreground" style={{ fontSize: '6px' }}>
              +{seq.items.length - 8}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-rajdhani font-semibold text-sm text-foreground truncate">
          {seq.name}
        </div>
        <div className="font-rajdhani text-xs text-muted-foreground">
          {seq.items.length} block{seq.items.length !== 1 ? 's' : ''} ·{' '}
          {formatDurationHuman(total)}
        </div>
        {seq.isDefault && (
          <div className="font-orbitron text-muted-foreground/40 mt-0.5" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
            DEFAULT
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className={`text-xs px-2 py-1.5 rounded-lg font-rajdhani transition-all ${
              confirmingDelete
                ? 'bg-destructive/20 text-destructive border border-destructive/40'
                : 'bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
            }`}
            aria-label={confirmingDelete ? 'Tap again to confirm delete' : 'Delete sequence'}
          >
            {confirmingDelete ? 'Sure?' : '✕'}
          </button>
        )}
        <button
          type="button"
          onClick={onLoad}
          className="text-xs px-3 py-1.5 rounded-lg font-rajdhani font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all active:scale-95"
          aria-label={`Load ${seq.name}`}
        >
          Load
        </button>
      </div>
    </div>
  );
}
