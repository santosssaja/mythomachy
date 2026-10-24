class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    const saved = localStorage.getItem('mythomachy_audio_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('mythomachy_audio_muted', String(muted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Hit impact: Heavy punch / blunt strike (low-pass triangle wave 110Hz -> 35Hz)
  public playHitSound(isHeavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isHeavy ? 'sawtooth' : 'triangle';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isHeavy ? 180 : 120, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + 0.18);

    osc.frequency.setValueAtTime(isHeavy ? 140 : 110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Slash / Wind whoosh: Band-pass white noise sweep
  public playSlashSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.0;
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.08);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.15);
  }

  // Dash sound: Fast frequency sweep
  public playDashSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(850, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Thunder strike: Sudden crack followed by low rumble
  public playThunderSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Crack
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(t);

    // Deep sub bass rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.5);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Ocean wave / vortex sound
  public playOceanWaveSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.3);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.6);
  }

  // Ultimate activation: Cinematic energy swell & blast
  public playUltimateSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Ascending power chords
    const freqs = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0, 523.25];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.05);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + 0.85);
    });
  }

  // Gacha Summon Chimes: Harmonic sine/triangle crystal arpeggio + triumphant gold chord
  public playGachaSummonChimes(isApex: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Mystic arpeggio in Pentatonic Scale (C, D, E, G, A, C)
    const arpeggio = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    arpeggio.forEach((f, i) => {
      if (!this.ctx || !this.masterGain) return;
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const noteTime = t + i * 0.09;

      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(f, noteTime);

      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.setValueAtTime(0.3, noteTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      noteOsc.connect(noteGain);
      noteGain.connect(this.masterGain);

      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.45);
    });

    // Climax chord at t + 0.8s
    const chordTime = t + 0.85;
    const climaxFreqs = isApex
      ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5] // Grand Major Gold chord
      : [329.63, 392.0, 523.25, 659.25]; // Resonant chord

    climaxFreqs.forEach(f => {
      if (!this.ctx || !this.masterGain) return;
      const chordOsc = this.ctx.createOscillator();
      const chordGain = this.ctx.createGain();

      chordOsc.type = isApex ? 'triangle' : 'sine';
      chordOsc.frequency.setValueAtTime(f, chordTime);

      chordGain.gain.setValueAtTime(0.001, t);
      chordGain.gain.setValueAtTime(isApex ? 0.4 : 0.25, chordTime);
      chordGain.gain.exponentialRampToValueAtTime(0.001, chordTime + (isApex ? 1.6 : 0.9));

      chordOsc.connect(chordGain);
      chordGain.connect(this.masterGain);

      chordOsc.start(chordTime);
      chordOsc.stop(chordTime + (isApex ? 1.7 : 1.0));
    });
  }

  // Button click tick
  public playClickSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const soundEngine = new SoundEngine();
