let timerInterval;
let remainingTime = 0;

function showRegisterForm() {
  document.getElementById('register-form').style.display = 'flex';
  document.getElementById('login-form').style.display = 'none';
}

function showLoginForm() {
  document.getElementById('login-form').style.display = 'flex';
  document.getElementById('register-form').style.display = 'none';
}

function togglePassword(inputId, icon) {
  const passwordInput = document.getElementById(inputId);
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  icon.textContent = passwordInput.type === "password" ? "👁️" : "🙈";
}

function registerUser() {
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  localStorage.setItem('userData', JSON.stringify({ firstName, lastName, email, password }));

  alert('Registration successful! Please log in.');
  showLoginForm();
}

function loginUser() {
  const enteredName = document.getElementById('login-name').value;
  const enteredPassword = document.getElementById('login-password').value;

  const storedUser = JSON.parse(localStorage.getItem('userData'));

  if (storedUser && storedUser.firstName === enteredName && storedUser.password === enteredPassword) {
    alert('Login successful!');
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
  } else {
    alert('Invalid credentials, please try again.');
  }
}

function setTimer(minutes) {
  clearInterval(timerInterval);
  remainingTime = minutes * 60;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
