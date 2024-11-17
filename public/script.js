let timer;
let timeLeft;
let isTimerRunning = false;
let workTime = 25 * 60; // Default work time: 25 minutes
let breakTime = 5 * 60; // Default break time: 5 minutes
let sessionCount = 0;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const sessionCountDisplay = document.getElementById('session-count');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');

// Start Timer
startBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
        isTimerRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        workTime = parseInt(workTimeInput.value) * 60;
        breakTime = parseInt(breakTimeInput.value) * 60;
        startPomodoro();
    }
});

// Stop Timer
stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    isTimerRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

// Update Timer Display
function updateTimerDisplay(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Start Pomodoro Cycle (Work and Break)
function startPomodoro() {
    timeLeft = workTime; // Start with work time

    timer = setInterval(() => {
        updateTimerDisplay(timeLeft);
        
        if (timeLeft === 0) {
            clearInterval(timer);
            sessionCount++;
            sessionCountDisplay.textContent = sessionCount;
            alert('Work session is over! Time for a break.');
            startBreak();
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Start Break Period
function startBreak() {
    timeLeft = breakTime; // Switch to break time
    timer = setInterval(() => {
        updateTimerDisplay(timeLeft);
        
        if (timeLeft === 0) {
            clearInterval(timer);
            alert('Break is over! Time to work again.');
            startPomodoro();
        } else {
            timeLeft--;
        }
    }, 1000);
}
