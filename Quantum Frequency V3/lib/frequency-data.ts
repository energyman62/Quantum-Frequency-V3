import type { FrequencyBlock, SavedSequence, SequenceItem } from './types';

export const DEFAULT_DURATION = 600; // 10 minutes in seconds

export const PRESET_BLOCKS: FrequencyBlock[] = [
  { id: 'p-174', name: 'Foundation',  hz: 174, color: '#a855f7', isPreset: true },
  { id: 'p-285', name: 'Healing',     hz: 285, color: '#06b6d4', isPreset: true },
  { id: 'p-396', name: 'Liberation',  hz: 396, color: '#f43f5e', isPreset: true },
  { id: 'p-417', name: 'Change',      hz: 417, color: '#f97316', isPreset: true },
  { id: 'p-432', name: 'Harmony',     hz: 432, color: '#eab308', isPreset: true },
  { id: 'p-528', name: 'Restoration', hz: 528, color: '#22c55e', isPreset: true },
  { id: 'p-639', name: 'Connection',  hz: 639, color: '#3b82f6', isPreset: true },
  { id: 'p-741', name: 'Expression',  hz: 741, color: '#6366f1', isPreset: true },
  { id: 'p-852', name: 'Intuition',   hz: 852, color: '#8b5cf6', isPreset: true },
  { id: 'p-963', name: 'Crown',       hz: 963, color: '#e8eaf0', isPreset: true },
];

let _idCounter = 0;
function makeItem(block: FrequencyBlock, duration: number): SequenceItem {
  _idCounter++;
  return {
    instanceId: `default-${block.id}-${_idCounter}`,
    blockId: block.id,
    name: block.name,
    hz: block.hz,
    color: block.color,
    duration,
  };
}

const b = (hz: number) => PRESET_BLOCKS.find(p => p.hz === hz)!;

export const DEFAULT_SEQUENCES: SavedSequence[] = [
  {
    id: 'default-solfeggio',
    name: 'Solfeggio Journey',
    isDefault: true,
    createdAt: 0,
    items: [174, 285, 396, 432, 528, 639, 741, 852, 963].map(hz =>
      makeItem(b(hz), DEFAULT_DURATION)
    ),
  },
  {
    id: 'default-healing',
    name: 'Deep Healing',
    isDefault: true,
    createdAt: 0,
    items: [174, 528, 432].map(hz => makeItem(b(hz), 900)),
  },
  {
    id: 'default-energy',
    name: 'Energy Activation',
    isDefault: true,
    createdAt: 0,
    items: [285, 396, 417, 528].map(hz => makeItem(b(hz), 300)),
  },
  {
    id: 'default-focus',
    name: 'Focus & Clarity',
    isDefault: true,
    createdAt: 0,
    items: [528, 639, 741].map(hz => makeItem(b(hz), DEFAULT_DURATION)),
  },
];

/** Format seconds as mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format seconds as human-readable (e.g. "10 min", "1 hr 30 min") */
export function formatDurationHuman(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** Total sequence duration in seconds */
export function totalDuration(items: SequenceItem[]): number {
  return items.reduce((acc, item) => acc + item.duration, 0);
}
