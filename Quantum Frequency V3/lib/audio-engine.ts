/**
 * AudioEngine — singleton wrapper around Web Audio API.
 * Produces a pure square wave at a given frequency.
 * Safe to import in SSR — AudioContext is only created on user gesture.
 */
export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private _gain = 0.4;

  private getOrCreateContext(): AudioContext {
    if (!this.audioCtx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new Ctx();
      console.log('AudioEngine: AudioContext created');
    }
    return this.audioCtx;
  }

  async startTone(hz: number): Promise<void> {
    this.stopTone(); // clean up any existing oscillator

    const ctx = this.getOrCreateContext();

    // iOS requires resume on user gesture
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this._gain, ctx.currentTime);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.1;

    this.oscillator = ctx.createOscillator();
    this.oscillator.type = 'square';
    this.oscillator.frequency.setValueAtTime(hz, ctx.currentTime);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.oscillator.start();
    console.log(`AudioEngine: started ${hz}Hz square wave (gain=${this._gain})`);
  }

  setFrequency(hz: number): void {
    if (this.oscillator && this.audioCtx) {
      this.oscillator.frequency.setValueAtTime(hz, this.audioCtx.currentTime);
      console.log(`AudioEngine: frequency → ${hz}Hz`);
    }
  }

  stopTone(): void {
    if (this.oscillator) {
      try { this.oscillator.stop(); } catch { /* already stopped */ }
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    console.log('AudioEngine: tone stopped');
  }

  setGain(value: number): void {
    this._gain = Math.max(0, Math.min(1, value));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this._gain, this.audioCtx.currentTime);
    }
  }

  getGain(): number {
    return this._gain;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  isActive(): boolean {
    return this.oscillator !== null;
  }

  destroy(): void {
    this.stopTone();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      console.log('AudioEngine: context closed');
    }
  }
}

// Singleton — created lazily (browser-only at call sites)
let _engine: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!_engine) _engine = new AudioEngine();
  return _engine;
}
