const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
        username: loginForm.username.value,
        password: loginForm.password.value
    };

    const res = await fetch('/api/login', { // <-- looks for something in auth.js (route directed from index.js)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if(result.token) {
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard.html';
    } else {
        alert(result.error);
        errorMsg.style.display = "block";
    }
});