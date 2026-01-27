// RandomFart App Controller

let isRunning = false;
let timeoutId = null;
let countdownInterval = null;
let selectedSound = 'fart';
let minInterval = 30;
let maxInterval = 120;
let playCount = 0;
let nextPlayTime = 0;
let intervalDuration = 0;

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const testBtn = document.getElementById('test-btn');
const countdownEl = document.getElementById('countdown');
const progressEl = document.getElementById('progress');
const playCountEl = document.getElementById('play-count');
const minIntervalSlider = document.getElementById('min-interval');
const maxIntervalSlider = document.getElementById('max-interval');
const volumeSlider = document.getElementById('volume');
const minValueEl = document.getElementById('min-value');
const maxValueEl = document.getElementById('max-value');
const volumeValueEl = document.getElementById('volume-value');
const soundBtns = document.querySelectorAll('.sound-btn');

// Initialize
function init() {
    // Slider event listeners
    minIntervalSlider.addEventListener('input', () => {
        minInterval = parseInt(minIntervalSlider.value);
        minValueEl.textContent = minInterval;
        // Ensure max is always >= min
        if (maxInterval < minInterval) {
            maxInterval = minInterval;
            maxIntervalSlider.value = maxInterval;
            maxValueEl.textContent = maxInterval;
        }
    });

    maxIntervalSlider.addEventListener('input', () => {
        maxInterval = parseInt(maxIntervalSlider.value);
        maxValueEl.textContent = maxInterval;
        // Ensure min is always <= max
        if (minInterval > maxInterval) {
            minInterval = maxInterval;
            minIntervalSlider.value = minInterval;
            minValueEl.textContent = minInterval;
        }
    });

    volumeSlider.addEventListener('input', () => {
        const volume = parseInt(volumeSlider.value);
        volumeValueEl.textContent = volume;
        soundGen.setVolume(volume / 100);
    });

    // Sound type selection
    soundBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSound = btn.dataset.sound;
        });
    });

    // Control buttons
    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click', stop);
    testBtn.addEventListener('click', testSound);

    // Initialize volume
    soundGen.setVolume(0.5);

    // Load speech synthesis voices
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.getVoices();
    }
}

function start() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusIndicator.className = 'status-on';
    statusText.textContent = 'Active';

    scheduleNext();
}

function stop() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusIndicator.className = 'status-off';
    statusText.textContent = 'Inactive';

    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    countdownEl.textContent = '--:--';
    progressEl.style.width = '0%';
}

function scheduleNext() {
    if (!isRunning) return;

    // Random interval between min and max
    intervalDuration = minInterval + Math.random() * (maxInterval - minInterval);
    nextPlayTime = Date.now() + intervalDuration * 1000;

    // Update countdown every second
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    timeoutId = setTimeout(() => {
        playSound();
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        scheduleNext();
    }, intervalDuration * 1000);
}

function updateCountdown() {
    const remaining = Math.max(0, (nextPlayTime - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);
    countdownEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progress = 100 - (remaining / intervalDuration * 100);
    progressEl.style.width = `${progress}%`;
}

function playSound() {
    soundGen.play(selectedSound);
    playCount++;
    playCountEl.textContent = playCount;

    // Visual feedback
    document.body.style.animation = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.animation = 'flash 0.3s';
}

function testSound() {
    soundGen.play(selectedSound);
}

// Flash animation for when sound plays
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0%, 100% { background: linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #0d0d1a 100%); }
        50% { background: linear-gradient(135deg, #4a2d7a 0%, #2a2a4e 50%, #1d1d3a 100%); }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
