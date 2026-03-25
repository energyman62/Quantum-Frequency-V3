# Quantum Frequency v3

A mobile-first therapeutic frequency sequencer. Plays square wave tones through the device's audio output.

## Features

- **10 Solfeggio preset frequencies** (174–963 Hz) with neon color coding
- **Custom frequency blocks** — create any Hz between 100–1000 with a custom color
- **Sequence builder** — arrange blocks, set per-block durations, reorder, remove
- **Playback engine** — real-time waveform display, progress tracking, pause/resume
- **Save & load** — persist sequences to localStorage, 4 built-in default sequences
- **Mobile-first UI** — dark cosmic theme, Orbitron/Rajdhani/Share Tech Mono fonts

## Stack

- Next.js (App Router)
- Web Audio API (square wave oscillator, AnalyserNode for waveform)
- localStorage for all persistence (no backend)
- Tailwind CSS with CSS variables for theming

## Project Structure

```
lib/
  types.ts              — TypeScript interfaces
  frequency-data.ts     — Preset blocks, default sequences, utilities
  audio-engine.ts       — Web Audio API singleton wrapper

components/
  frequency-sequencer.tsx   — Main orchestrator (state, playback engine)
  preset-library.tsx        — Preset grid + custom block creator
  sequence-timeline.tsx     — Current sequence editor with progress
  playback-bar.tsx          — Play/pause/stop controls + waveform
  sequence-manager.tsx      — Save/load named sequences

app/
  page.tsx      — Renders FrequencySequencer
  layout.tsx    — Fonts, metadata
  globals.css   — Dark theme, CSS vars, animations
```
