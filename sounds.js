// Sound synthesis using Web Audio API
// Generates various funny sounds without requiring audio files

class SoundGenerator {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    setVolume(vol) {
        this.volume = vol;
    }

    // Generate a fart sound using filtered noise and oscillators
    playFart() {
        const ctx = this.init();
        const duration = 0.3 + Math.random() * 0.7;
        const now = ctx.currentTime;

        // Create noise buffer
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with filtered noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * i / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Low-pass filter for that rumble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150 + Math.random() * 100, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + duration);

        // Add some oscillation for "flutter"
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80 + Math.random() * 40, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + duration);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3 * this.volume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(this.volume, now);
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(masterGain);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        masterGain.connect(ctx.destination);

        noise.start(now);
        osc.start(now);
        noise.stop(now + duration);
        osc.stop(now + duration);
    }

    // Generate a cough sound
    playCough() {
        const ctx = this.init();
        const now = ctx.currentTime;

        // Two-part cough: intake + expulsion
        for (let i = 0; i < 2; i++) {
            const offset = i * 0.15;
            const duration = 0.1 + Math.random() * 0.1;

            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let j = 0; j < bufferSize; j++) {
                const env = Math.sin(Math.PI * j / bufferSize);
                data[j] = (Math.random() * 2 - 1) * env;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800 + Math.random() * 400;
            filter.Q.value = 2;

            const gain = ctx.createGain();
            gain.gain.value = this.volume * (i === 1 ? 1 : 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now + offset);
            noise.stop(now + offset + duration);
        }
    }

    // Generate a sneeze sound
    playSneeze() {
        const ctx = this.init();
        const now = ctx.currentTime;

        // "Ah" buildup
        const buildupDuration = 0.4;
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.linearRampToValueAtTime(400, now + buildupDuration);

        const gain1 = ctx.createGain();
        gain1.gain.setValueAtTime(0.01, now);
        gain1.gain.linearRampToValueAtTime(this.volume * 0.3, now + buildupDuration);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + buildupDuration);

        // "Choo!" explosion
        const explodeDuration = 0.2;
        const bufferSize = ctx.sampleRate * explodeDuration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const env = Math.exp(-5 * i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * env;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        const gain2 = ctx.createGain();
        gain2.gain.value = this.volume;

        noise.connect(filter);
        filter.connect(gain2);
        gain2.connect(ctx.destination);

        noise.start(now + buildupDuration);
        noise.stop(now + buildupDuration + explodeDuration);
    }

    // Speak a random word using Speech Synthesis
    playRandomWord() {
        const words = [
            'banana', 'pickle', 'moist', 'chunky', 'wobble',
            'splendid', 'flabbergasted', 'discombobulated', 'shenanigans',
            'kerfuffle', 'brouhaha', 'hullabaloo', 'bamboozle',
            'lollygag', 'skedaddle', 'cattywampus', 'gobbledygook',
            'malarkey', 'nincompoop', 'ragamuffin', 'whippersnapper',
            'boop', 'yeet', 'bruh', 'oof', 'sus'
        ];
        
        const word = words[Math.floor(Math.random() * words.length)];
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8 + Math.random() * 0.4;
        utterance.pitch = 0.5 + Math.random() * 1;
        utterance.volume = this.volume;
        speechSynthesis.speak(utterance);
    }

    // Hell's Kitchen sound (angry chef)
    playHellsKitchen() {
        const phrases = [
            "It's raw!",
            "Donkey!",
            "Idiot sandwich!",
            "Where's the lamb sauce?",
            "Pathetic!",
            "Disgusting!",
            "Bloody hell!",
            "Get out!",
            "Shut it down!",
            "This is a disaster!"
        ];
        
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.2;
        utterance.pitch = 0.8;
        utterance.volume = this.volume;
        
        // Try to get a male voice
        const voices = speechSynthesis.getVoices();
        const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('James'));
        if (maleVoice) utterance.voice = maleVoice;
        
        speechSynthesis.speak(utterance);
    }

    // Play a random sound from all types
    playRandom() {
        const sounds = ['fart', 'cough', 'sneeze', 'word', 'kitchen'];
        const sound = sounds[Math.floor(Math.random() * sounds.length)];
        this.play(sound);
    }

    // Main play function
    play(type) {
        switch(type) {
            case 'fart':
                this.playFart();
                break;
            case 'cough':
                this.playCough();
                break;
            case 'sneeze':
                this.playSneeze();
                break;
            case 'word':
                this.playRandomWord();
                break;
            case 'kitchen':
                this.playHellsKitchen();
                break;
            case 'all':
                this.playRandom();
                break;
            default:
                this.playFart();
        }
    }
}

// Global sound generator instance
const soundGen = new SoundGenerator();
