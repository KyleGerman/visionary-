let currentStep = 1;

function showStep(step) {
    document.querySelectorAll('.step').forEach((el) => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
}

function nextStep() {
    currentStep++;
    showStep(currentStep);
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

// handle form submission
const CreateUserForm = document.getElementById("CreateUserForm");
CreateUserForm.addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
        firstName: CreateUserForm.firstName.value,
        lastName: CreateUserForm.lastName.value,
        gender: CreateUserForm.gender.value,
        email: CreateUserForm.email.value,
        phone: CreateUserForm.phone.value,
        dob: CreateUserForm.dob.value,
        address:CreateUserForm.address.value,
        username: CreateUserForm.username.value,
        password: CreateUserForm.password.value
    };

    const res = await fetch('/api/newUser', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if(result.token) {
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard.html';
        alert('User Created!');

    } else {
        alert(result.error); // <-- this throws any errors back
    }
});


