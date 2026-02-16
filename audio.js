class AudioSys {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3; // Default volume
    this.enabled = true;
  }

  playTone(freq, type, duration, vol=1) {
    if (!this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration, vol=1) {
    if (!this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  // Preset sounds
  jump() { this.playTone(400, 'sine', 0.1, 0.5); this.playTone(600, 'sine', 0.1, 0.3); }
  shoot() { this.playNoise(0.1, 0.8); }
  bounce() { this.playTone(150, 'triangle', 0.05, 0.8); }
  dribble() { this.playTone(100, 'sine', 0.05, 0.6); }
   rim() { this.playTone(800, 'square', 0.05, 0.4); }
  swish() { this.playNoise(0.3, 0.6); } // Net sound
  score() { this.playTone(600, 'sine', 0.1, 0.6); setTimeout(() => this.playTone(800, 'sine', 0.2, 0.6), 100); }
  cheer() { this.playNoise(1.5, 0.4); }
  buzzer() { this.playTone(200, 'sawtooth', 0.5, 0.8); }
  click() { this.playTone(800, 'sine', 0.05, 0.2); }
}

const audio = new AudioSys();
