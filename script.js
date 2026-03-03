// ═══════════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════════
const dateInput = document.getElementById('target-date');
const timeInput = document.getElementById('target-time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const restartBtn = document.getElementById('restart-btn');
const timerDisplay = document.getElementById('timer-display');
const finishedMessage = document.getElementById('finished-message');
const progressFill = document.getElementById('progress-fill');
const eventLabel = document.getElementById('event-label');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const presetBtns = document.querySelectorAll('.preset-btn');

// ═══════════════════════════════════════════
// State
// ═══════════════════════════════════════════
let countdownInterval = null;
let targetDate = null;
let startDate = null;
let totalDuration = 0;

// ═══════════════════════════════════════════
// Initialize — set default date to tomorrow
// ═══════════════════════════════════════════
function init() {
    dateInput.value = '2026-04-09';
    timeInput.value = '12:00';
    startCountdown();
}

function formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ═══════════════════════════════════════════
// Start Countdown
// ═══════════════════════════════════════════
function startCountdown() {
    const dateVal = dateInput.value;
    const timeVal = timeInput.value || '00:00';

    if (!dateVal) {
        shakeElement(dateInput);
        return;
    }

    targetDate = new Date(`${dateVal}T${timeVal}:00`);
    startDate = new Date();

    if (targetDate <= startDate) {
        shakeElement(dateInput);
        return;
    }

    totalDuration = targetDate - startDate;

    // Format the target for display
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    eventLabel.textContent = `Counting down to ${targetDate.toLocaleDateString('en-US', options)}`;

    // Show timer, hide input
    document.querySelector('.input-section').classList.add('hidden');
    timerDisplay.classList.remove('hidden');
    finishedMessage.classList.add('hidden');

    // Update immediately, then every second
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// ═══════════════════════════════════════════
// Update Timer
// ═══════════════════════════════════════════
function updateTimer() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        showFinished();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    animateValue(daysEl, pad(days));
    animateValue(hoursEl, pad(hours));
    animateValue(minutesEl, pad(mins));
    animateValue(secondsEl, pad(secs));

    // Update progress
    const elapsed = totalDuration - diff;
    const percent = Math.min((elapsed / totalDuration) * 100, 100);
    progressFill.style.width = `${percent}%`;
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function animateValue(el, newVal) {
    if (el.textContent !== newVal) {
        el.textContent = newVal;
        el.classList.remove('pop');
        // Trigger reflow for animation restart
        void el.offsetWidth;
        el.classList.add('pop');
    }
}

// ═══════════════════════════════════════════
// Finished State
// ═══════════════════════════════════════════
function showFinished() {
    timerDisplay.classList.add('hidden');
    finishedMessage.classList.remove('hidden');
}

// ═══════════════════════════════════════════
// Reset
// ═══════════════════════════════════════════
function resetTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    targetDate = null;
    startDate = null;
    totalDuration = 0;

    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    progressFill.style.width = '0%';

    timerDisplay.classList.add('hidden');
    finishedMessage.classList.add('hidden');
    document.querySelector('.input-section').classList.remove('hidden');
}

// ═══════════════════════════════════════════
// Quick Presets
// ═══════════════════════════════════════════
function handlePreset(minutes) {
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutes);
    dateInput.value = formatDateForInput(target);
    timeInput.value = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
    startCountdown();
}

// ═══════════════════════════════════════════
// Shake Animation (validation feedback)
// ═══════════════════════════════════════════
function shakeElement(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.animation = ''; }, 400);
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ═══════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════
startBtn.addEventListener('click', startCountdown);
resetBtn.addEventListener('click', resetTimer);
restartBtn.addEventListener('click', resetTimer);

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mins = parseInt(btn.dataset.minutes, 10);
        handlePreset(mins);
    });
});

// Allow Enter key to start
dateInput.addEventListener('keydown', e => { if (e.key === 'Enter') startCountdown(); });
timeInput.addEventListener('keydown', e => { if (e.key === 'Enter') startCountdown(); });

// ═══════════════════════════════════════════
// Music Toggle (YouTube iframe)
// ═══════════════════════════════════════════
const musicToggle = document.getElementById('music-toggle');
const ytPlayer = document.getElementById('yt-player');
const musicIconOn = document.getElementById('music-icon-on');
const musicIconOff = document.getElementById('music-icon-off');
let isMuted = false;

musicToggle.classList.add('playing');

musicToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
        musicIconOn.style.display = 'none';
        musicIconOff.style.display = 'block';
        musicToggle.classList.remove('playing');
    } else {
        ytPlayer.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        musicIconOn.style.display = 'block';
        musicIconOff.style.display = 'none';
        musicToggle.classList.add('playing');
    }
});

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
init();
