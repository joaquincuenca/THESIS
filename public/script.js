function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Hardcoded username and password for demonstration purposes
    const validUsername = "user";
    const validPassword = "pass";

    // Simple validation
    if (username === validUsername && password === validPassword) {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password');
    }
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    // Simple validation
    if (username && password) {
        // Normally you would send this data to the server for registration
        alert('Registration successful! You can now log in.');
        window.location.href = 'index.html';
    } else {
        alert('Please enter both username and password');
    }
}
