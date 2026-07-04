class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmOsc: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.5;
  private bgmVolumeTarget: number = 0.05;
  private bgmIntervalId: any = null;
  private bgmCurrentBeat: number = 0;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSFXVolume(vol: number) {
    this.sfxVolume = vol;
    // Persist volume in localstorage for accessibility
    localStorage.setItem('sfxVolume', vol.toString());
  }

  public setBGMVolume(vol: number) {
    this.bgmVolumeTarget = vol * 0.1; // Scale down for master BGM
    localStorage.setItem('bgmVolume', vol.toString());
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolumeTarget, this.ctx.currentTime);
    }
  }

  public getSFXVolume() {
    const saved = localStorage.getItem('sfxVolume');
    if (saved !== null) {
      this.sfxVolume = parseFloat(saved);
    }
    return this.sfxVolume;
  }

  public getBGMVolume() {
    const saved = localStorage.getItem('bgmVolume');
    if (saved !== null) {
      this.bgmVolumeTarget = parseFloat(saved) * 0.1;
    }
    return this.bgmVolumeTarget * 10;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.playBGM();
    }
    return this.isMuted;
  }

  // Helper to create a noise buffer (cached)
  private noiseBuffer: AudioBuffer | null = null;
  private getNoiseBuffer(): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    this.init();
    if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // --- GENERAL UI SOUNDS ---
  public playHover() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05 * this.sfxVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playClick() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- MOVEMENT FOOTSTEPS ---
  public playMove(type: string) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    if (type === 'KNIGHT') {
      // Gallop sound: Triple low-pass noise clicks
      const delays = [0, 0.12, 0.24];
      delays.forEach((delay) => {
        const noise = this.ctx!.createBufferSource();
        noise.buffer = this.getNoiseBuffer();
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, t + delay);
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        
        noise.start(t + delay);
        noise.stop(t + delay + 0.1);
      });
    } else if (type === 'ROOK') {
      // Heavy metallic slide with sub-bass scrape
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(180, t);
      filter.frequency.linearRampToValueAtTime(100, t + 0.4);
      filter.Q.setValueAtTime(4, t);
      
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.linearRampToValueAtTime(45, t + 0.4);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      noise.connect(filter);
      filter.connect(gain);
      osc.connect(gain);
      
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === 'KING' || type === 'ROYAL_GUARD') {
      // Heavy armored step
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      
      const metalOsc = this.ctx.createOscillator();
      metalOsc.type = 'triangle';
      metalOsc.frequency.setValueAtTime(900, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      
      noise.connect(filter);
      filter.connect(gain);
      osc.connect(gain);
      metalOsc.connect(gain);
      
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
      metalOsc.start(t);
      metalOsc.stop(t + 0.3);
    } else if (type === 'BISHOP') {
      // Robe rustle (pinkish noise sweep)
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.25);
      filter.Q.setValueAtTime(1.5, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.3);
    } else if (type === 'QUEEN') {
      // Elegant glissando / magic glide
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc.type = 'sine';
      osc2.type = 'sine';
      
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.35);
      
      osc2.frequency.setValueAtTime(222, t); // Detuned for chorus effect
      osc2.frequency.exponentialRampToValueAtTime(444, t + 0.35);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.35);
      osc2.start(t);
      osc2.stop(t + 0.35);
    } else {
      // Pawn (Soldier): light footstep
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.15);
    }
  }

  // --- ATTACKS AND STRIKES ---
  public playAttack(type: string) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    if (type === 'BISHOP') {
      // Holy energy smite
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.4);
      
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, t);
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(5, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.connect(gain);
      subOsc.connect(gain);
      noise.connect(filter);
      filter.connect(gain);
      
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
      subOsc.start(t);
      subOsc.stop(t + 0.4);
      noise.start(t);
      noise.stop(t + 0.4);
    } else if (type === 'QUEEN') {
      // Frost strike: ice chime arpeggio + chilly noise whoosh
      const freqs = [880, 1100, 1320, 1760];
      freqs.forEach((f, index) => {
        const o = this.ctx!.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t + index * 0.04);
        
        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0, t + index * 0.04);
        g.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + index * 0.04 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + index * 0.04 + 0.2);
        
        o.connect(g);
        g.connect(this.ctx!.destination);
        o.start(t + index * 0.04);
        o.stop(t + index * 0.04 + 0.25);
      });

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(1000, t + 0.3);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.35);
    } else if (type === 'ROOK') {
      // Heavy blunt impact: deep thud + metal resonance
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.4);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, t);
      
      const metal = this.ctx.createOscillator();
      metal.type = 'triangle';
      metal.frequency.setValueAtTime(520, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      metal.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
      metal.start(t);
      metal.stop(t + 0.4);
    } else if (type === 'KNIGHT' || type === 'KING') {
      // Sword slash / heavy blow: metal sword swipe + impact
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4000, t);
      filter.frequency.exponentialRampToValueAtTime(800, t + 0.2);
      filter.Q.setValueAtTime(2, t);
      
      const metal = this.ctx.createOscillator();
      metal.type = 'triangle';
      metal.frequency.setValueAtTime(650, t);
      metal.frequency.exponentialRampToValueAtTime(200, t + 0.25);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      metal.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.3);
      metal.start(t);
      metal.stop(t + 0.3);
    } else {
      // Pawn (Soldier) / Guard: simple clean slash
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, t);
      filter.frequency.exponentialRampToValueAtTime(1000, t + 0.15);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.2);
    }
  }

  // --- DAMAGE & IMPACTS ---
  public playHit(heavy: boolean = false) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(heavy ? 200 : 400, t);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(heavy ? 60 : 120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + (heavy ? 0.35 : 0.2));
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(heavy ? 0.3 * this.sfxVolume : 0.15 * this.sfxVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.35 : 0.2));
    
    noise.connect(filter);
    filter.connect(gain);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start(t);
    noise.stop(t + (heavy ? 0.35 : 0.2));
    osc.start(t);
    osc.stop(t + (heavy ? 0.35 : 0.2));
  }

  // --- HEALING MAGIC ---
  public playHeal() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Holy arpeggio chords
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major chord arpeggio
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + index * 0.08);
      
      gain.gain.setValueAtTime(0, t + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.05 * this.sfxVolume, t + index * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + index * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(t + index * 0.08);
      osc.stop(t + index * 0.08 + 0.7);
    });

    // Soft chime air
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.Q.setValueAtTime(3, t);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.8);
  }

  // --- SHIELDS ---
  public playShieldApply() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.3);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(500, t);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playShieldShatter() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Glass shatter sound (lots of high frequencies clashing)
    const glassFreqs = [1200, 1530, 1980, 2400, 3100];
    glassFreqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, t + 0.25);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(t);
      osc.stop(t + 0.25);
    });

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, t);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // --- BUFFS & DEBUFFS ---
  public playBuff() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.25);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playIceShatter() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Multiple high-pitched sharp cracking sounds
    const cracks = [1800, 2200, 2700, 3200];
    cracks.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + idx * 0.02 + 0.15);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t + idx * 0.02);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + idx * 0.02 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.02 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(t + idx * 0.02);
      osc.stop(t + idx * 0.02 + 0.16);
    });

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, t);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.25);
  }

  public playDebuff(type: string) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    if (type === 'frozen') {
      // Ice crackle: quick high click and cold air
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1500, t);
      osc.frequency.exponentialRampToValueAtTime(500, t + 0.2);
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2500, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      osc.connect(gain);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.2);
      noise.start(t);
      noise.stop(t + 0.2);
    } else {
      // Suppression / Marked / Charm: ominous dark low slide
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.3);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  public playPassiveTrigger() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Warm medieval lute/harp chime
    const chord = [329.63, 440.00, 554.37, 659.25]; // A major first inversion notes
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.5);
    });
  }

  // --- SUPERS ACTIVATED ---
  public playSuper(type: string) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (type === 'QUEEN') {
      // Ice Palace Super: cold howling wind + deep shatter explosion
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.8);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      
      const wind = this.ctx.createBufferSource();
      wind.buffer = this.getNoiseBuffer();
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(2500, t);
      windFilter.frequency.exponentialRampToValueAtTime(800, t + 0.8);
      windFilter.Q.setValueAtTime(2, t);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4 * this.sfxVolume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      
      osc.connect(filter);
      filter.connect(gain);
      wind.connect(windFilter);
      windFilter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.9);
      wind.start(t);
      wind.stop(t + 0.9);
      
      // Crackling ice bells arpeggio
      const highBells = [1500, 1800, 2200, 2600, 3100];
      highBells.forEach((f, idx) => {
        const bell = this.ctx!.createOscillator();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(f, t + idx * 0.06);
        const bg = this.ctx!.createGain();
        bg.gain.setValueAtTime(0, t + idx * 0.06);
        bg.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + idx * 0.06 + 0.01);
        bg.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.4);
        bell.connect(bg);
        bg.connect(this.ctx!.destination);
        bell.start(t + idx * 0.06);
        bell.stop(t + idx * 0.06 + 0.45);
      });
    } else if (type === 'KING') {
      // King's Command: Majestic brass/horn trumpet fanfare
      const notes = [261.63, 392.00, 523.25, 659.25]; // C4, G4, C5, E5 major fanfare
      notes.forEach((freq, idx) => {
        const horn = this.ctx!.createOscillator();
        horn.type = 'sawtooth';
        horn.frequency.setValueAtTime(freq, t + idx * 0.1);
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t + idx * 0.1);
        filter.frequency.exponentialRampToValueAtTime(400, t + idx * 0.1 + 0.6);
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, t + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.7);
        
        horn.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        
        horn.start(t + idx * 0.1);
        horn.stop(t + idx * 0.1 + 0.7);
      });
    } else if (type === 'ROOK') {
      // Iron Bastion Super: Earth shaking sub + stone crash
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, t);
      filter.frequency.linearRampToValueAtTime(50, t + 0.9);
      
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(50, t);
      sub.frequency.linearRampToValueAtTime(35, t + 0.9);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.45 * this.sfxVolume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      
      noise.connect(filter);
      filter.connect(gain);
      sub.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 1.0);
      sub.start(t);
      sub.stop(t + 1.0);
    } else if (type === 'BISHOP') {
      // Bishop Resurrection: Divine holy choir + sweeping shimmer
      const chord = [349.23, 440.00, 523.25, 698.46]; // F major chord (F4, A4, C5, F5)
      chord.forEach((freq, idx) => {
        const choir = this.ctx!.createOscillator();
        choir.type = 'triangle';
        choir.frequency.setValueAtTime(freq, t);
        choir.frequency.linearRampToValueAtTime(freq * 1.01, t + 1.2); // vibrato-like sweep
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        
        choir.connect(gain);
        gain.connect(this.ctx!.destination);
        
        choir.start(t);
        choir.stop(t + 1.4);
      });

      // Ascending shimmer bells
      for (let i = 0; i < 8; i++) {
        const bell = this.ctx.createOscillator();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(523.25 * Math.pow(1.122, i), t + i * 0.1);
        
        const bg = this.ctx.createGain();
        bg.gain.setValueAtTime(0, t + i * 0.1);
        bg.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, t + i * 0.1 + 0.02);
        bg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
        
        bell.connect(bg);
        bg.connect(this.ctx.destination);
        bell.start(t + i * 0.1);
        bell.stop(t + i * 0.1 + 0.45);
      }
    }
  }

  // --- DEATH ---
  public playDeath() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Soul dissolution: descending wind hiss + low sub boom
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.6);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25 * this.sfxVolume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    
    osc.connect(gain);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.65);
    noise.start(t);
    noise.stop(t + 0.65);
  }

  // --- TURN MANAGEMENT ---
  public playTurnStart(color: string) {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    
    // Wood block / leather drum accent
    osc.type = color === 'WHITE' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(color === 'WHITE' ? 180 : 130, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playTurnEnd() {
    // Left empty for subtle focus on turn start
  }

  // --- PROMOTION ---
  public playPromotion() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Radiant golden fanfare ascending arpeggio
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Sweet major sweep
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.55);
    });

    const sparkle = this.ctx.createOscillator();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(2000, t);
    sparkle.frequency.exponentialRampToValueAtTime(4000, t + 0.4);
    
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(0, t);
    sg.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, t + 0.1);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sparkle.connect(sg);
    sg.connect(this.ctx.destination);
    sparkle.start(t);
    sparkle.stop(t + 0.45);
  }

  // --- FANFARES ---
  public playVictory() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Triumph chord progression on royal synth horns
    const fanfareNotes = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [293.66, 349.23, 440.00, 587.33], // D minor/F Major shape
      [329.63, 415.30, 493.88, 659.25], // E Major
      [349.23, 440.00, 523.25, 698.46]  // F Major grand resolution
    ];

    fanfareNotes.forEach((chord, chordIdx) => {
      const startTime = t + chordIdx * 0.35;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime);
        filter.frequency.exponentialRampToValueAtTime(500, startTime + 0.3);
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    });
  }

  public playDefeat() {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Melancholy descending minor horn chord
    const sorrowNotes = [
      [220.00, 261.63, 329.63, 440.00], // A minor
      [196.00, 233.08, 293.66, 392.00], // G minor
      [146.83, 174.61, 220.00, 293.66]  // D minor final dark drone
    ];

    sorrowNotes.forEach((chord, chordIdx) => {
      const startTime = t + chordIdx * 0.5;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, startTime);
        
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    });
  }

  // --- SOUND EFFECTS FOR READY ALERTS ---
  public playReady(type: 'ability' | 'super') {
    if (this.isMuted || this.sfxVolume === 0) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    
    if (type === 'super') {
      // Energetic double-beep
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.setValueAtTime(1200, t + 0.08);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } else {
      // Warm quick shimmer
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08 * this.sfxVolume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  // --- MASTER BGM SYSTEM ---
  private playLuteNote(freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    if (this.bgmGain) {
      gain.connect(this.bgmGain);
    } else {
      gain.connect(this.ctx.destination);
    }
    
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private playFluteNote(freq: number, startTime: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Add subtle vibrato (LFO)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(6.0, startTime); // 6 Hz vibrato
    vibratoGain.gain.setValueAtTime(freq * 0.015, startTime); // 1.5% depth
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 1.3, startTime + 0.12); // soft attack
    gain.gain.setValueAtTime(volume * 1.3, startTime + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    vibrato.start(startTime);
    osc.connect(filter);
    filter.connect(gain);
    if (this.bgmGain) {
      gain.connect(this.bgmGain);
    } else {
      gain.connect(this.ctx.destination);
    }
    
    osc.start(startTime);
    vibrato.stop(startTime + duration + 0.1);
    osc.stop(startTime + duration + 0.1);
  }

  private playBGMStep() {
    if (!this.ctx || this.isMuted || this.bgmVolumeTarget === 0) return;
    const t = this.ctx.currentTime;
    const step = this.bgmCurrentBeat % 32;

    // 1. LUTE ACCOMPANIMENT
    if (step >= 0 && step < 8) {
      // Am chord
      if (step === 0) {
        this.playLuteNote(110.00, t, 1.8, 0.4); // A2 Bass
        this.playLuteNote(220.00, t, 0.8, 0.3); // A3
        this.playLuteNote(329.63, t, 0.8, 0.3); // E4
      } else if (step === 2) {
        this.playLuteNote(261.63, t, 0.6, 0.3); // C4
      } else if (step === 4) {
        this.playLuteNote(329.63, t, 0.8, 0.3); // E4
      } else if (step === 6) {
        this.playLuteNote(261.63, t, 0.6, 0.3); // C4
      }
    } else if (step >= 8 && step < 16) {
      // G chord
      if (step === 8) {
        this.playLuteNote(98.00, t, 1.8, 0.4);  // G2 Bass
        this.playLuteNote(196.00, t, 0.8, 0.3); // G3
        this.playLuteNote(293.66, t, 0.8, 0.3); // D4
      } else if (step === 10) {
        this.playLuteNote(246.94, t, 0.6, 0.3); // B3
      } else if (step === 12) {
        this.playLuteNote(293.66, t, 0.8, 0.3); // D4
      } else if (step === 14) {
        this.playLuteNote(246.94, t, 0.6, 0.3); // B3
      }
    } else if (step >= 16 && step < 24) {
      // F chord
      if (step === 16) {
        this.playLuteNote(87.31, t, 1.8, 0.4);  // F2 Bass
        this.playLuteNote(174.61, t, 0.8, 0.3); // F3
        this.playLuteNote(261.63, t, 0.8, 0.3); // C4
      } else if (step === 18) {
        this.playLuteNote(220.00, t, 0.6, 0.3); // A3
      } else if (step === 20) {
        this.playLuteNote(261.63, t, 0.8, 0.3); // C4
      } else if (step === 22) {
        this.playLuteNote(220.00, t, 0.6, 0.3); // A3
      }
    } else if (step >= 24 && step < 32) {
      // Em chord
      if (step === 24) {
        this.playLuteNote(82.41, t, 1.8, 0.4);  // E2 Bass
        this.playLuteNote(164.81, t, 0.8, 0.3); // E3
        this.playLuteNote(246.94, t, 0.8, 0.3); // B3
      } else if (step === 26) {
        this.playLuteNote(196.00, t, 0.6, 0.3); // G3
      } else if (step === 28) {
        this.playLuteNote(246.94, t, 0.8, 0.3); // B3
      } else if (step === 30) {
        this.playLuteNote(196.00, t, 0.6, 0.3); // G3
      }
    }

    // 2. MELODIC FLUTE SOLO
    const melody: Record<number, { freq: number, beats: number }> = {
      0: { freq: 440.00, beats: 1 },  // A4
      1: { freq: 493.88, beats: 1 },  // B4
      2: { freq: 523.25, beats: 1 },  // C5
      3: { freq: 440.00, beats: 1 },  // A4
      4: { freq: 659.25, beats: 2 },  // E5
      6: { freq: 587.33, beats: 1 },  // D5
      7: { freq: 523.25, beats: 1 },  // C5
      8: { freq: 493.88, beats: 2 },  // B4
      10: { freq: 392.00, beats: 1 }, // G4
      11: { freq: 440.00, beats: 1 }, // A4
      12: { freq: 493.88, beats: 2 }, // B4
      14: { freq: 523.25, beats: 1 }, // C5
      15: { freq: 587.33, beats: 1 }, // D5
      16: { freq: 659.25, beats: 2 }, // E5
      18: { freq: 698.46, beats: 1 }, // F5
      19: { freq: 659.25, beats: 1 }, // E5
      20: { freq: 587.33, beats: 2 }, // D5
      22: { freq: 523.25, beats: 1 }, // C5
      23: { freq: 493.88, beats: 1 }, // B4
      24: { freq: 440.00, beats: 4 }, // A4
      29: { freq: 493.88, beats: 1.5 }, // B4 leading tone
    };

    if (melody[step] !== undefined) {
      const note = melody[step];
      this.playFluteNote(note.freq, t, note.beats * 0.45 - 0.05, 0.35);
    }

    this.bgmCurrentBeat++;
  }

  public playBGM() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.bgmIntervalId) return; // Already playing

    const saved = localStorage.getItem('bgmVolume');
    if (saved !== null) {
      this.bgmVolumeTarget = parseFloat(saved) * 0.1;
    } else {
      this.bgmVolumeTarget = 0.05; // default
    }

    const t = this.ctx.currentTime;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolumeTarget, t);
    this.bgmGain.connect(this.ctx.destination);

    this.bgmCurrentBeat = 0;
    this.playBGMStep();
    this.bgmIntervalId = setInterval(() => {
      this.playBGMStep();
    }, 450);
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmGain.gain.linearRampToValueAtTime(0, t + 1.0); // Fade out over 1 second
      const gain = this.bgmGain;
      setTimeout(() => {
        try {
          gain.disconnect();
        } catch (e) {}
      }, 1100);
      this.bgmGain = null;
    }
  }
}

export const audio = new AudioEngine();
