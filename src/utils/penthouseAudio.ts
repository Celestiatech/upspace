/**
 * Procedural Penthouse Skyline Lounge Ambient Music Generator
 * Built with Web Audio API for zero-latency, zero-dependency, crystal-clear background audio.
 */

class PenthouseAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private intervalId: any = null;
  private chordIndex = 0;

  // Penthouse Rooftop Lounge Chords (Frequencies in Hz for lush jazz/cyberpunk chords)
  // Dm9, G13, Cmaj9, Am9, BbMaj7, Fmaj7#11
  private chordProgression = [
    // Dm9: D3, F3, A3, C4, E4
    [146.83, 174.61, 220.0, 261.63, 329.63],
    // G13: G2, F3, B3, E4, A4
    [98.0, 174.61, 246.94, 329.63, 440.0],
    // Cmaj9: C3, E3, G3, B3, D4
    [130.81, 164.81, 196.0, 246.94, 293.66],
    // Am9: A2, E3, G3, C4, B4
    [110.0, 164.81, 196.0, 261.63, 493.88],
    // BbMaj7: Bb2, F3, A3, D4, F4
    [116.54, 174.61, 220.0, 293.66, 349.23],
    // Em7: E2, B2, D3, G3, B3
    [82.41, 123.47, 146.83, 196.0, 246.94],
  ];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play() {
    if (this.isPlaying) return;
    if (typeof window === 'undefined') return;

    try {
      const ctx = this.getContext();
      this.isPlaying = true;

      // Master Gain for smooth volume transitions
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      // Fade in over 1.8 seconds to a gentle lounge background level
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.8);

      // Low-pass filter for cozy, warm penthouse lounge warmth
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1400, ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.2, ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      // Start the chord loop every 4.2 seconds
      this.playNextChord();
      this.intervalId = setInterval(() => {
        this.playNextChord();
      }, 4200);

      // Start gentle background vinyl/skyline air texture
      this.startSkylineAtmosphere(ctx);
    } catch (e) {
      console.warn('AudioContext playback initiation:', e);
    }
  }

  private playNextChord() {
    if (!this.ctx || !this.filterNode || !this.isPlaying) return;

    const ctx = this.ctx;
    const chord = this.chordProgression[this.chordIndex % this.chordProgression.length];
    this.chordIndex++;

    const now = ctx.currentTime;
    const chordDuration = 4.0;

    // Add a lightweight disco groove underneath each chord phrase.
    this.playDiscoBeat(now);

    // Play each note in the chord with warm sine/triangle wave synthesizer voices
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      // Alternate waveforms for rich harmonic depth
      osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine';
      // Slight detune for analog chorus warmth
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 2) * 3, now);

      // Gentle attack and long smooth release
      const noteGain = idx === 0 ? 0.35 : 0.16 / chord.length;
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(noteGain, now + 0.8 + idx * 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

      osc.connect(oscGain);
      oscGain.connect(this.filterNode!);

      osc.start(now + idx * 0.08);
      osc.stop(now + chordDuration + 0.2);
    });

    // Random soft chime sparkle
    if (Math.random() > 0.3) {
      this.playChime(chord[chord.length - 1] * 2, now + 1.2);
    }
  }

  private playDiscoBeat(startTime: number) {
    if (!this.ctx || !this.filterNode) return;
    const ctx = this.ctx;
    const beat = 0.5;

    for (let step = 0; step < 8; step++) {
      const time = startTime + step * beat;

      // Four-on-the-floor kick.
      if (step % 2 === 0) {
        const kick = ctx.createOscillator();
        const gain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(125, time);
        kick.frequency.exponentialRampToValueAtTime(48, time + 0.16);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(0.16, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
        kick.connect(gain);
        gain.connect(this.filterNode);
        kick.start(time);
        kick.stop(time + 0.24);
      }

      // Bright offbeat hi-hat tick (very short, low CPU).
      const hat = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hat.type = 'square';
      hat.frequency.setValueAtTime(5200, time + beat * 0.5);
      hatGain.gain.setValueAtTime(0.0001, time + beat * 0.5);
      hatGain.gain.exponentialRampToValueAtTime(0.018, time + beat * 0.5 + 0.002);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, time + beat * 0.5 + 0.045);
      hat.connect(hatGain);
      hatGain.connect(this.filterNode);
      hat.start(time + beat * 0.5);
      hat.stop(time + beat * 0.5 + 0.05);
    }
  }

  private playChime(freq: number, startTime: number) {
    if (!this.ctx || !this.filterNode) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.6);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + 1.8);
  }

  private startSkylineAtmosphere(ctx: AudioContext) {
    // Generate gentle pink noise buffer for skyline breeze texture
    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(0.8, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.025, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      if (this.masterGain) {
        noiseGain.connect(this.masterGain);
      }
      whiteNoise.start();
    } catch {
      // Noise buffer optional enhancement
    }
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      setTimeout(() => {
        try {
          if (this.ctx && this.ctx.state === 'running' && !this.isPlaying) {
            this.ctx.suspend();
          }
        } catch {}
      }, 700);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const penthouseAudio = new PenthouseAudioManager();
