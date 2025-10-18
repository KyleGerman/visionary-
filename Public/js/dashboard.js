window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return; // if not logged in, nothing to do (page is static)

  try {
    const res = await fetch('/api/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
    });

    if (!res.ok) return;
    const data = await res.json();

    const name = (data.first_name || '') + (data.last_name ? ' ' + data.last_name : '');
    document.getElementById('welcomeName').textContent = name || 'User';
    document.getElementById('editName').value = name || '';
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }

  document.getElementById('saveDashboard')?.addEventListener('click', async () => {
    const fullName = document.getElementById('editName').value.trim();
    const [first_name, ...rest] = fullName.split(' ');
    const last_name = rest.join(' ');

    const payload = {
      first_name: first_name || '',
      last_name: last_name || '',
      email: undefined,
      phone: undefined,
      address: undefined,
      // health fields moved to /health.html
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
});
