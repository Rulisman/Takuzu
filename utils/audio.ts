
let musicInterval: number | null = null;
let audioCtx: AudioContext | null = null;

export const playAlarmSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export const startOrientalMusic = () => {
  if (musicInterval) return;
  
  audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4 Pentatonic
  
  const playNote = () => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Sonido tipo "Koto" o "Campana"
    osc.type = 'sine';
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    osc.frequency.setValueAtTime(freq, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 2.1);
  };

  musicInterval = window.setInterval(() => {
    if (Math.random() > 0.4) playNote();
  }, 1200);
};

export const stopOrientalMusic = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
};
