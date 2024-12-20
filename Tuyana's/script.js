    function showRegisterForm() {
      document.getElementById('register-form').style.display = 'flex';
      document.getElementById('login-form').style.display = 'none';
    }

    function showLoginForm() {
      document.getElementById('login-form').style.display = 'flex';
      document.getElementById('register-form').style.display = 'none';
    }

    function registerUser() {
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

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

    document.addEventListener("DOMContentLoaded", () => {
      const buttons = document.querySelectorAll("button"); // Select all buttons
  
      buttons.forEach(button => {
          button.addEventListener("click", () => {
              // Remove 'active' class from all buttons
              buttons.forEach(btn => btn.classList.remove("active"));
  
              // Add 'active' class to the clicked button
              button.classList.add("active");
          });
      });
    });