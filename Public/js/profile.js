window.onload = async function () // loads this function when the page is loaded
{

const token = localStorage.getItem('token'); // get the token from local storage

if (!token) { // if no token found, redirect to login page
    alert("Please log in first.");
    window.location.href = "/login.html";
    return;
}

try // try to fetch profile data
{
    const res = await fetch('/api/profile', { // fetch profile data from the server
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token }
    });

    const data = await res.json(); // parse the JSON response

    if (!res.ok) // if response is not ok, show error message
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