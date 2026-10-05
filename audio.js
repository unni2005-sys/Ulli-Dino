// ============================================================
// ULLI DINO - Custom Sound Synthesizer (Web Audio API)
// Provides 100% reliable, zero-latency cartoon sound effects
// Jump, Sword Crash, Duck, Score Chimes, and Lo-Fi Doodle BGM
// ============================================================

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bgmInterval = null;
        this.masterVolume = 0.7;

        const cacheBuster = Date.now();

        // Custom crash.ogg audio from project folder
        this.crashAudio = new Audio(`./Crash.ogg?v=${cacheBuster}`);
        this.crashAudio.preload = 'auto';
        this.crashAudioRetried = false;
        this.crashAudio.onerror = () => {
            if (!this.crashAudioRetried) {
                this.crashAudioRetried = true;
                this.crashAudio.src = `./crash.ogg?v=${cacheBuster}`;
            }
        };
        this.crashAudioBuffer = null;
        this.crashArrayBuffer = null;
        this.loadCrashAudioBuffer(cacheBuster);
    }

    async loadCrashAudioBuffer(cacheBuster = Date.now()) {
        try {
            let res = await fetch(`./Crash.ogg?v=${cacheBuster}`);
            if (!res.ok) {
                res = await fetch(`./crash.ogg?v=${cacheBuster}`);
            }
            if (res.ok) {
                this.crashArrayBuffer = await res.arrayBuffer();
                if (this.ctx) {
                    this.decodeCrashBuffer();
                }
            }
        } catch (e) {
            console.warn('Could not prefetch Crash.ogg:', e);
        }
    }

    async decodeCrashBuffer() {
        if (!this.ctx || !this.crashArrayBuffer || this.crashAudioBuffer) return;
        try {
            this.crashAudioBuffer = await this.ctx.decodeAudioData(this.crashArrayBuffer.slice(0));
        } catch (e) {
            console.warn('decodeAudioData failed for crash.ogg:', e);
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (this.ctx && this.crashArrayBuffer && !this.crashAudioBuffer) {
            this.decodeCrashBuffer();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.bgmPlaying) {
            this.stopBGM();
            this.bgmPlaying = true; // remember user wanted BGM
        } else if (!this.isMuted && this.bgmPlaying) {
            this.startBGM();
        }
        return this.isMuted;
    }

    // --- JUMP SOUND: Bouncy cartoon spring / whoop ---
    playJump() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Randomize base frequency slightly for lively, expressive jumps!
        const pitchVariation = 0.95 + Math.random() * 0.15;
        const startFreq = 220 * pitchVariation;
        const peakFreq = 620 * pitchVariation;

        osc.type = 'triangle';
        // Playful cartoon spring pitch envelope: rising rapidly then bouncing
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(peakFreq * 0.85, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(peakFreq * 1.05, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(peakFreq * 0.7, now + 0.28);

        // Lowpass filter for smooth, warm cartoon boing
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35 * this.masterVolume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.32);

        // Extra cute high harmonic pop
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(peakFreq * 1.5, now + 0.05);
        popOsc.frequency.exponentialRampToValueAtTime(peakFreq * 0.5, now + 0.15);
        popGain.gain.setValueAtTime(0.12 * this.masterVolume, now + 0.05);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        popOsc.connect(popGain);
        popGain.connect(this.ctx.destination);
        popOsc.start(now + 0.05);
        popOsc.stop(now + 0.16);
    }

    // --- CRASH SOUND: Plays custom crash.ogg file when girl crashes ---
    playCrash() {
        if (this.isMuted) return;
        this.init();

        // 1. Try zero-latency Web Audio buffer playback
        if (this.ctx && this.crashAudioBuffer) {
            try {
                const source = this.ctx.createBufferSource();
                source.buffer = this.crashAudioBuffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
                source.connect(gain);
                gain.connect(this.ctx.destination);
                source.start(0);
                return;
            } catch (e) {
                console.warn('Web Audio crash playback failed, trying HTML5 Audio:', e);
            }
        }

        // 2. Play via HTML5 Audio element
        if (this.crashAudio) {
            try {
                // Clone node or reset time to allow immediate playback
                const sound = this.crashAudio.cloneNode();
                sound.volume = this.masterVolume;
                const p = sound.play();
                if (p !== undefined) {
                    p.catch(err => {
                        console.warn('crashAudio play failed, falling back:', err);
                        this.playSynthesizedCrash();
                    });
                }
                return;
            } catch (e) {
                console.warn('HTML5 Audio error:', e);
            }
        }

        // 3. Fallback to synthesized cartoon metallic clash
        this.playSynthesizedCrash();
    }

    // --- SYNTHESIZED CRASH FALLBACK: Metallic sword clash + comical bonk ---
    playSynthesizedCrash() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Metal Blade Impact: High noise burst with metallic resonances
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.06));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const metalBand = this.ctx.createBiquadFilter();
        metalBand.type = 'bandpass';
        metalBand.frequency.setValueAtTime(2400, now);
        metalBand.Q.setValueAtTime(8, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5 * this.masterVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(metalBand);
        metalBand.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);

        // 2. High Ringing Metal Harmonics
        const metalHarmonics = [1280, 2560, 3840];
        metalHarmonics.forEach((freq, idx) => {
            const mOsc = this.ctx.createOscillator();
            const mGain = this.ctx.createGain();
            mOsc.type = 'sine';
            mOsc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), now);
            mGain.gain.setValueAtTime((0.25 / (idx + 1)) * this.masterVolume, now);
            mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            mOsc.connect(mGain);
            mGain.connect(this.ctx.destination);
            mOsc.start(now);
            mOsc.stop(now + 0.45);
        });

        // 3. Comic Thud & Descending Goofy Wobble
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(140, now);
        thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
        thudGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thudOsc.start(now);
        thudOsc.stop(now + 0.3);

        // Comical descending slide whistle "Aiyo!"
        const ouchOsc = this.ctx.createOscillator();
        const ouchGain = this.ctx.createGain();
        ouchOsc.type = 'sawtooth';
        ouchOsc.frequency.setValueAtTime(420, now + 0.08);
        ouchOsc.frequency.linearRampToValueAtTime(160, now + 0.4);
        ouchGain.gain.setValueAtTime(0.18 * this.masterVolume, now + 0.08);
        ouchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        ouchOsc.connect(ouchGain);
        ouchGain.connect(this.ctx.destination);
        ouchOsc.start(now + 0.08);
        ouchOsc.stop(now + 0.42);
    }

    // --- DUCK / CROUCH SOUND: Comic paper slide whoosh ---
    playDuck() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // --- SCORE MILESTONE: Happy notebook chime / bell arpeggio ---
    playScoreMilestone() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        });
    }

    // --- POWER-UP: Shield Pickup (Sparkling celestial doodle chime) ---
    playShieldPickup() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    // --- POWER-UP: Shield Deflect / Shatter (Deep metallic ring + glass chime) ---
    playShieldDeflect() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [840, 1680, 2520];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime((0.25 / (i + 1)) * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        });
    }

    // --- POWER-UP: Chilli Speed Boost (Spicy rocket whistle) ---
    playChilliBoost() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.25);
        gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // --- POWER-UP: Eraser Wipe (Sketchbook rubber scrub) ---
    playEraserWipe() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI * 4);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    // --- COMPANION ONION JUMP SQUEAK ---
    playCompanionJump() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime + 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.12);
        gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    // --- UI PENCIL CLICK ---
    playPencilClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.15 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // --- SQUEAK FOR MARGIN DOODLES (Onion Squeak) ---
    playOnionSqueak() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(1320, now + 0.08);
        osc.frequency.linearRampToValueAtTime(700, now + 0.16);
        gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // --- INTRO CHIME ---
    playIntroFanfare() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const chords = [
            { freq: 440, time: 0.0 },
            { freq: 554.37, time: 0.08 },
            { freq: 659.25, time: 0.16 },
            { freq: 880, time: 0.26 }
        ];
        chords.forEach(c => {
            const t = this.ctx.currentTime + c.time;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(c.freq, t);
            gain.gain.setValueAtTime(0.15 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    }

    // --- OPTIONAL PLAYFUL DOODLE LO-FI BEAT ---
    startBGM() {
        if (this.bgmInterval) return;
        this.bgmPlaying = true;
        this.init();

        const bassNotes = [130.81, 146.83, 164.81, 196.00]; // C3, D3, E3, G3
        const melodyNotes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;

            // Soft pencil percussion beat
            if (step % 2 === 0) {
                const pOsc = this.ctx.createOscillator();
                const pGain = this.ctx.createGain();
                pOsc.type = 'triangle';
                pOsc.frequency.setValueAtTime(160, now);
                pOsc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
                pGain.gain.setValueAtTime(0.06 * this.masterVolume, now);
                pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                pOsc.connect(pGain);
                pGain.connect(this.ctx.destination);
                pOsc.start(now);
                pOsc.stop(now + 0.06);
            }

            // Marimba / Kalimba style wood melody note
            if (step % 4 === 0 || step % 4 === 2) {
                const note = melodyNotes[(step % melodyNotes.length)];
                const mOsc = this.ctx.createOscillator();
                const mGain = this.ctx.createGain();
                mOsc.type = 'sine';
                mOsc.frequency.setValueAtTime(note, now);
                mGain.gain.setValueAtTime(0.04 * this.masterVolume, now);
                mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                mOsc.connect(mGain);
                mGain.connect(this.ctx.destination);
                mOsc.start(now);
                mOsc.stop(now + 0.22);
            }

            step++;
        }, 180);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.bgmPlaying = false;
    }

    toggleBGM() {
        if (this.bgmPlaying && this.bgmInterval) {
            this.stopBGM();
            return false;
        } else {
            this.startBGM();
            return true;
        }
    }
}

// Global instance
window.soundManager = new SoundManager();
