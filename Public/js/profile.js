//profile.js

// loads this function when the page is loaded
window.onload = async function () 
{
// get the token from local storage
const token = localStorage.getItem('token'); 

// if no token found, redirect to login page
if (!token) { 
    alert("Please log in first.");
    window.location.href = "/login.html";
    return;
}

//fetch prpofile data
getProfile(token);

const form = document.getElementById("profileForm");

form.addEventListener("submit", function(e) {
        e.preventDefault();
        updateProfile(token); 
    });

}

// function to fetch profile data from the server
async function getProfile(token) {

// try to fetch profile data
try 
{
    // fetch profile data from the server
    const res = await fetch('/api/profile', { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token }
    });

    // parse the JSON response
    const data = await res.json();

    // if response is not ok, show error message
    if (!res.ok) 
    {
        this.alert(data.error || "Failed to fetch profile data.");
        return;
    }

    //populate fields
    document.getElementById("fullName").value = data.first_name + " " + data.last_name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("dob").value = data.birth_date.split("T")[0] || "";
    document.getElementById("address").value = data.address || "";
}

// catch any errors during fetch
catch (err) 
{
    console.error("Error fetching profile data:", err);
}

}

// submit updated profile data
async function updateProfile(token) {
    
    // split full name into first/last
    const fullName = document.getElementById("fullName").value.trim().split(" ");
    const first = fullName[0];
    const last = fullName.slice(1).join(" ");

    // update data object
    const updatedData = {
        first_name: first,
        last_name: last,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        birth_date: document.getElementById("dob").value,
        address: document.getElementById("address").value
    };

    // try to send updated data to server
    try {
    
        const res = await fetch('/api/profile', { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token },

        body: JSON.stringify(updatedData)
    });

        const data = await res.json();

        if (!res.ok) {
            this.alert(data.error || "Failed to update profile.");
            return;
        }
    }
    catch (err) {
        console.error("Error updating profile data:", err);
    }
    
    window.location.reload()
}