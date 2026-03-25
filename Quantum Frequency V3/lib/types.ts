export interface FrequencyBlock {
  id: string;
  name: string;
  hz: number;
  color: string;
  isPreset: boolean;
}

export interface SequenceItem {
  instanceId: string;
  blockId: string;
  name: string;
  hz: number;
  color: string;
  duration: number; // seconds
}

export interface SavedSequence {
  id: string;
  name: string;
  items: SequenceItem[];
  createdAt: number;
  isDefault?: boolean;
}

export type PlaybackStatus = 'stopped' | 'playing' | 'paused';
