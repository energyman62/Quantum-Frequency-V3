'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FrequencyBlock, PlaybackStatus, SavedSequence, SequenceItem } from '@/lib/types';
import { DEFAULT_DURATION, DEFAULT_SEQUENCES } from '@/lib/frequency-data';
import { getAudioEngine } from '@/lib/audio-engine';
import PresetLibrary from './preset-library';
import SequenceTimeline from './sequence-timeline';
import SequenceManager from './sequence-manager';
import PlaybackBar from './playback-bar';

const LS_CUSTOM = 'fseq-custom-blocks';
const LS_SAVED = 'fseq-saved-sequences';

function makeInstanceId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function FrequencySequencer() {
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [customBlocks, setCustomBlocks] = useState<FrequencyBlock[]>([]);
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('stopped');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<'build' | 'library' | 'saved'>('library');
  const [volume, setVolume] = useState(0.4);
  const [addedToast, setAddedToast] = useState('');

  // Refs used inside interval callback (avoid stale closures)
  const sequenceRef = useRef(sequence);
  const currentIndexRef = useRef(currentIndex);
  const blockStartRef = useRef(0); // Date.now() adjusted for pauses
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep refs in sync with state
  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const custom = localStorage.getItem(LS_CUSTOM);
      if (custom) setCustomBlocks(JSON.parse(custom));
      const saved = localStorage.getItem(LS_SAVED);
      if (saved) setSavedSequences(JSON.parse(saved));
      console.log('FrequencySequencer: loaded from localStorage');
    } catch (err) {
      console.error('FrequencySequencer: failed to load localStorage', err);
    }
  }, []);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customBlocks));
  }, [customBlocks]);

  useEffect(() => {
    localStorage.setItem(LS_SAVED, JSON.stringify(savedSequences));
  }, [savedSequences]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      getAudioEngine().destroy();
    };
  }, []);

  // ── Playback engine ───────────────────────────────────────────────────────

  const advanceToBlock = useCallback((idx: number) => {
    const seq = sequenceRef.current;
    if (idx >= seq.length) return;
    currentIndexRef.current = idx;
    setCurrentIndex(idx);
    setElapsed(0);
    blockStartRef.current = Date.now();
    getAudioEngine().setFrequency(seq[idx].hz);
    console.log(`FrequencySequencer: advanced to block ${idx} — ${seq[idx].hz}Hz`);
  }, []);

  const doStop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    getAudioEngine().stopTone();
    setPlaybackStatus('stopped');
    setCurrentIndex(0);
    setElapsed(0);
    currentIndexRef.current = 0;
    console.log('FrequencySequencer: stopped');
  }, []);

  function startTimerLoop() {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const el = (Date.now() - blockStartRef.current) / 1000;
      setElapsed(el);

      const seq = sequenceRef.current;
      const idx = currentIndexRef.current;
      const block = seq[idx];

      if (!block) {
        doStop();
        return;
      }

      if (el >= block.duration) {
        const next = idx + 1;
        if (next >= seq.length) {
          doStop();
        } else {
          advanceToBlock(next);
        }
      }
    }, 200);
  }

  async function handlePlay() {
    if (sequence.length === 0) return;

    const engine = getAudioEngine();

    if (playbackStatus === 'paused') {
      // Resume from paused state — restart oscillator at current block
      const hz = sequenceRef.current[currentIndexRef.current]?.hz;
      if (!hz) return;
      await engine.startTone(hz);
      // Adjust start time so elapsed continues from where it was
      blockStartRef.current = Date.now() - elapsed * 1000;
      startTimerLoop();
      setPlaybackStatus('playing');
      console.log(`FrequencySequencer: resumed at ${hz}Hz`);
    } else {
      // Fresh start from first block
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      setElapsed(0);
      blockStartRef.current = Date.now();
      await engine.startTone(sequence[0].hz);
      startTimerLoop();
      setPlaybackStatus('playing');
      setActiveTab('build'); // show sequence progress
      console.log(`FrequencySequencer: started — ${sequence[0].hz}Hz`);
    }
  }

  function handlePause() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    getAudioEngine().stopTone();
    setPlaybackStatus('paused');
    console.log('FrequencySequencer: paused');
  }

  function handleStop() {
    doStop();
  }

  function handleVolumeChange(v: number) {
    setVolume(v);
    getAudioEngine().setGain(v);
  }

  // ── Sequence management ───────────────────────────────────────────────────

  function addToSequence(block: FrequencyBlock) {
    const item: SequenceItem = {
      instanceId: makeInstanceId(),
      blockId: block.id,
      name: block.name,
      hz: block.hz,
      color: block.color,
      duration: DEFAULT_DURATION,
    };
    setSequence(prev => [...prev, item]);
    setAddedToast(`${block.hz} Hz added`);
    setTimeout(() => setAddedToast(''), 1800);
    console.log(`FrequencySequencer: added ${block.hz}Hz to sequence`);
  }

  function removeFromSequence(instanceId: string) {
    setSequence(prev => prev.filter(i => i.instanceId !== instanceId));
  }

  function moveItem(instanceId: string, direction: 'up' | 'down') {
    setSequence(prev => {
      const idx = prev.findIndex(i => i.instanceId === instanceId);
      if (idx === -1) return prev;
      const next = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }

  function updateDuration(instanceId: string, duration: number) {
    setSequence(prev =>
      prev.map(i => i.instanceId === instanceId ? { ...i, duration } : i)
    );
  }

  function clearSequence() {
    if (playbackStatus !== 'stopped') doStop();
    setSequence([]);
  }

  // ── Custom block management ───────────────────────────────────────────────

  function addCustomBlock(block: FrequencyBlock) {
    setCustomBlocks(prev => [...prev, block]);
  }

  function deleteCustomBlock(id: string) {
    setCustomBlocks(prev => prev.filter(b => b.id !== id));
  }

  // ── Saved sequence management ─────────────────────────────────────────────

  function saveCurrentSequence(name: string) {
    const newSeq: SavedSequence = {
      id: `user-${Date.now()}`,
      name,
      items: sequence.map(item => ({ ...item, instanceId: makeInstanceId() })),
      createdAt: Date.now(),
    };
    setSavedSequences(prev => [...prev, newSeq]);
  }

  function loadSequence(seq: SavedSequence) {
    if (playbackStatus !== 'stopped') doStop();
    const fresh = seq.items.map(item => ({ ...item, instanceId: makeInstanceId() }));
    setSequence(fresh);
    setActiveTab('build');
    console.log(`FrequencySequencer: loaded sequence "${seq.name}"`);
  }

  function deleteSequence(id: string) {
    setSavedSequences(prev => prev.filter(s => s.id !== id));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const tabClass = (tab: typeof activeTab) =>
    `flex-1 py-2.5 text-center font-orbitron text-xs tracking-widest uppercase transition-all ${
      activeTab === tab
        ? 'text-primary border-b-2 border-primary'
        : 'text-muted-foreground/60 hover:text-muted-foreground border-b-2 border-transparent'
    }`;

  return (
    <div className="flex flex-col h-dvh relative z-10">
      {/* ── Header ── */}
      <header className="px-4 pt-5 pb-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1dd8e888, #a855f788)',
              border: '1px solid #1dd8e844',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 8 L3 4 L5 12 L7 2 L9 14 L11 5 L13 10 L15 8"
                stroke="#1dd8e8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-orbitron text-sm font-bold tracking-wider leading-none text-foreground">
              QUANTUM FREQUENCY V3
            </h1>
            <p className="font-rajdhani text-xs text-muted-foreground leading-none mt-0.5">
              Square wave therapeutic tones
            </p>
          </div>
        </div>

        {/* Added toast */}
        {addedToast && (
          <div className="mt-2 text-xs font-rajdhani text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 animate-fade-in-up">
            ✓ {addedToast}
          </div>
        )}
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="flex border-b border-border shrink-0 bg-background/50 backdrop-blur-sm">
        <button type="button" onClick={() => setActiveTab('build')} className={tabClass('build')}>
          Sequence
          {sequence.length > 0 && (
            <span className="ml-1 text-primary/80" style={{ fontSize: '9px' }}>
              ({sequence.length})
            </span>
          )}
        </button>
        <button type="button" onClick={() => setActiveTab('library')} className={tabClass('library')}>
          Library
        </button>
        <button type="button" onClick={() => setActiveTab('saved')} className={tabClass('saved')}>
          Saved
        </button>
      </nav>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 min-h-0">
        {activeTab === 'build' && (
          <SequenceTimeline
            items={sequence}
            currentIndex={currentIndex}
            playbackStatus={playbackStatus}
            elapsed={elapsed}
            onRemove={removeFromSequence}
            onMoveUp={id => moveItem(id, 'up')}
            onMoveDown={id => moveItem(id, 'down')}
            onUpdateDuration={updateDuration}
            onClearSequence={clearSequence}
          />
        )}
        {activeTab === 'library' && (
          <PresetLibrary
            customBlocks={customBlocks}
            onAddToSequence={addToSequence}
            onAddCustomBlock={addCustomBlock}
            onDeleteCustomBlock={deleteCustomBlock}
          />
        )}
        {activeTab === 'saved' && (
          <SequenceManager
            currentItems={sequence}
            savedSequences={savedSequences}
            defaultSequences={DEFAULT_SEQUENCES}
            onLoadSequence={loadSequence}
            onSaveSequence={saveCurrentSequence}
            onDeleteSequence={deleteSequence}
          />
        )}
      </div>

      {/* ── Playback Bar ── */}
      <div className="shrink-0">
        <PlaybackBar
          items={sequence}
          currentIndex={currentIndex}
          elapsed={elapsed}
          status={playbackStatus}
          volume={volume}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onVolumeChange={handleVolumeChange}
        />
      </div>
    </div>
  );
}
