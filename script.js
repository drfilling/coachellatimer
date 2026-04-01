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
    startDate = new Date('2026-02-28T00:00:00');

    if (targetDate <= new Date()) {
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

    // Update progress (from fixed origin date of 2/28/2026)
    const elapsed = now - startDate;
    const percent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
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
// Weather Forecast (Open-Meteo, no API key)
// ═══════════════════════════════════════════
function getWeatherInfo(code) {
    if (code === 0)                       return { icon: '☀️',  label: 'Clear Sky' };
    if (code <= 2)                        return { icon: '🌤️',  label: 'Partly Cloudy' };
    if (code === 3)                       return { icon: '☁️',  label: 'Overcast' };
    if (code <= 48)                       return { icon: '🌫️',  label: 'Foggy' };
    if (code <= 55)                       return { icon: '🌦️',  label: 'Drizzle' };
    if (code <= 65)                       return { icon: '🌧️',  label: 'Rain' };
    if (code <= 75)                       return { icon: '❄️',  label: 'Snow' };
    if (code <= 82)                       return { icon: '🌦️',  label: 'Rain Showers' };
    if (code <= 86)                       return { icon: '🌨️',  label: 'Snow Showers' };
    return                                       { icon: '⛈️',  label: 'Thunderstorm' };
}

async function fetchWeather() {
    const days = [
        { date: '2026-04-10', name: 'Fri' },
        { date: '2026-04-11', name: 'Sat' },
        { date: '2026-04-12', name: 'Sun' },
    ];

    const startDate = days[0].date;
    const endDate   = days[days.length - 1].date;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=33.7206&longitude=-116.2156` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
        `&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles` +
        `&start_date=${startDate}&end_date=${endDate}`;

    try {
        const res  = await fetch(url);
        const data = await res.json();

        const grid = document.getElementById('weather-days-grid');
        grid.innerHTML = '';

        days.forEach((day, i) => {
            const code = data.daily.weathercode[i];
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const low  = Math.round(data.daily.temperature_2m_min[i]);
            const { icon, label } = getWeatherInfo(code);

            const card = document.createElement('div');
            card.className = 'weather-day-card';
            card.innerHTML = `
                <div class="weather-day-name">${day.name}</div>
                <div class="weather-day-icon">${icon}</div>
                <div class="weather-day-condition">${label}</div>
                <div class="weather-day-temps">
                    <span class="day-temp-high">${high}°</span>
                    <span class="day-temp-sep">/</span>
                    <span class="day-temp-low">${low}°</span>
                </div>
            `;
            grid.appendChild(card);
        });

        document.getElementById('weather-loading').classList.add('hidden');
        document.getElementById('weather-content').classList.remove('hidden');
    } catch (e) {
        document.getElementById('weather-loading').classList.add('hidden');
        document.getElementById('weather-error').classList.remove('hidden');
    }
}

// ═══════════════════════════════════════════
// Init
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    init();
    fetchWeather();
});
