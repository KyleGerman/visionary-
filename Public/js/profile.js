window.onload = async function ()
{

const token = localStorage.getItem('token');

if (!token) {
    alert("Please log in first.");
    window.location.href = "/login.html";
    return;
}

try
{
    const res = await fetch('/api/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token }
    });

    const data = await res.json();

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

catch (err)
{
    console.error("Error fetching profile data:", err);
}

}