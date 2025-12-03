//dashboard.js MAIN PAGE

window.addEventListener('DOMContentLoaded', async () => {

  const token = localStorage.getItem('token');

  // if not logged in, nothing to do (page is static)
  if (!token) return; 

  // load dashboard data
  await namePage(token);
  await updateAppointments(token);
  await updateMessage(token);

});

// load name and setup save button ?
async function namePage (token) {
    try {
    const res = await fetch('/api/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();

    const name = (data.first_name || '') + (data.last_name ? ' ' + data.last_name : '');
    document.getElementById('welcomeName').textContent = name || 'User';
    document.getElementById('editName').value = name || '';
  }

  catch (err) {
    console.error('Failed to load dashboard data', err);
  }

  document.getElementById('saveDashboard')?.addEventListener('click', async () => {
    const fullName = document.getElementById('editName').value.trim();
    const [first_name, ...rest] = fullName.split(' ');
    const last_name = rest.join(' ');

    // health fields moved to /health.html
    const payload = {
      first_name: first_name || '',
      last_name: last_name || '',
      email: undefined,
      phone: undefined,
      address: undefined,
      
    };

    try {
      const res = await fetch('/api/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Update failed');
        return;
      }

      alert('Dashboard updated successfully');
      // update shown name
      document.getElementById('welcomeName').textContent = (payload.first_name + ' ' + payload.last_name).trim();
    } catch (err) {
      console.error('Failed to save dashboard', err);
      alert('Network error');
    }
  });
}

// update appointment grid
async function updateAppointments(token) {

  try {
    
    const res = await fetch('/api/appointmentData', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token }
    });

    const data = await res.json();

    // if response is not ok, show error message
    if (!res.ok) {
        this.alert(data.error || "Failed to fetch profile data.");
        return;
    }

    //populate appointment grid
    const theList = document.getElementById("appointmentList");
    theList.innerHTML = ""; 

    // add each appointment to the list
    data.forEach ( a => {
    const li = document.createElement('li');
    li.textContent = `${formatDate(a.scheduled_for)} - ${a.reason} with Dr. ${a.provider_last}`;
    theList.appendChild(li);
    });
    
    // helper to format dates
    function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric'
  });
    }

    }

  // catch any errors during fetch
  catch (err) {
      console.error("Error fetching profile data:", err);
  }

}

// update messages on dashboard
async function updateMessage(token) {
  try {
    const res = await fetch ('/api/dashboard/getMessages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token }
    });
    
    const data = await res.json();

    // if response is not ok, show error message
    if (!res.ok) {
        this.alert(data.error || "Failed to fetch profile data.");
        return;
    }

    // populate messages grid
    const theList = document.getElementById("messagesList");
    theList.innerHTML = ""; 

    // add each message to the list
    data.forEach ( a => {
    const li = document.createElement('li');
    const count = a.message_count > 1 ? `${a.message_count} messages from` : `1 message from`;
    li.textContent = `${count} ${a.first_name} ${a.last_name}`;
    theList.appendChild(li);
    });    
  }

  // catch any errors during fetch
  catch (err) {
      console.error("Error fetching profile data:", err);
  }
}
