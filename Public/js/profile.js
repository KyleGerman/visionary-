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

catch (err) // catch any errors during fetch
{
    console.error("Error fetching profile data:", err);
}

}

// submit updated profile data
async function updateProfile(token) {
    
}