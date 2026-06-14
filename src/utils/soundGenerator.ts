// Web Audio Synthesizer for high-fidelity mechanical and robotic SFX
class SoundGenerator {
  private ctx: AudioContext | null = null;
  private continuousHumNode: OscillatorNode | null = null;
  private continuousHumGain: GainNode | null = null;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API is not supported in this frame context.");
    }
  }

  // 1. Play robotic system startup beep
  playSystemBeep() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.setValueAtTime(1320, now + 0.08); // E6 note

      osc2.type = "square";
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(659, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (_) {}
  }

  // 2. Play high-tech connection chime
  playConnectionChime() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        
        gain.gain.setValueAtTime(0.0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch (_) {}
  }

  // 3. Play hydraulic actuator motor rotation hum (frequency sweep)
  playHydraulicMove(intensity = 1) {
    this.init();
    if (!this.ctx) return;
    try {
      // Resume audio context if suspended (browser security limits)
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sawtooth + Triangle gives a realistic servo motor friction noise
      osc.type = "triangle";
      
      const startFreq = 80 + Math.random() * 20;
      const endFreq = 220 + intensity * 60;
      
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.06 * intensity, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      // Low pass filter to make it sound muffled and inside the metal chassis
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  // 4. Play camera focus snapshot chime
  playCameraShutter() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const bandpass = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2000, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(1000, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  // 5. Play critical high-voltage balance alarm (Fallen / Dizzy buzzer)
  playAlarmWarning() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.15);
      osc.frequency.linearRampToValueAtTime(480, now + 0.3);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (_) {}
  }

  // 6. Start continuous low-level turbine motor system sound that pitches on tilt angles!
  toggleTurbineStream(on: boolean) {
    this.init();
    if (!this.ctx) return;
    try {
      if (!on) {
        if (this.continuousHumNode) {
          try {
            this.continuousHumNode.stop();
          } catch (_) {}
          this.continuousHumNode = null;
        }
        this.continuousHumGain = null;
        return;
      }

      if (this.continuousHumNode) return; // already active

      const now = this.ctx.currentTime;
      this.continuousHumNode = this.ctx.createOscillator();
      this.continuousHumGain = this.ctx.createGain();

      this.continuousHumNode.type = "sine";
      this.continuousHumNode.frequency.setValueAtTime(55, now); // low baseline hum

      this.continuousHumGain.gain.setValueAtTime(0.015, now); // extremely low volume background noise

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, now);

      this.continuousHumNode.connect(filter);
      filter.connect(this.continuousHumGain);
      this.continuousHumGain.connect(this.ctx.destination);

      this.continuousHumNode.start(now);
    } catch (_) {}
  }

  // Pitch continuous hum on tilt intensity
  updateTurbinePitch(eulerValue: number) {
    this.init();
    if (!this.ctx || !this.continuousHumNode) return;
    try {
      const absVal = Math.abs(eulerValue);
      const targetFreq = 55 + (absVal / 90) * 110; // 55Hz to 165Hz shift
      this.continuousHumNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch (_) {}
  }
}

export const soundSynth = new SoundGenerator();
export default soundSynth;
