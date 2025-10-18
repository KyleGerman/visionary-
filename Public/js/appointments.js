window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const upcoming = document.getElementById('upcomingList');

  async function load() {
    upcoming.innerHTML = 'Loading...';
    try {
      const res = await fetch('/api/appointments', { headers: { authorization: 'Bearer ' + token } });
      if (!res.ok) { upcoming.innerHTML = 'Failed to load'; return; }
      const rows = await res.json();
      if (!rows.length) { upcoming.innerHTML = '<p>No upcoming appointments</p>'; return; }
      upcoming.innerHTML = '';
      rows.forEach(a => {
        const div = document.createElement('div');
        div.className = 'appt-card';
        div.innerHTML = `<strong>${new Date(a.scheduled_for).toLocaleString()}</strong> - ${a.reason}<br/><small>Status: ${a.status}</small> <button data-id="${a.appointment_id}" class="cancel">Cancel</button>`;
        upcoming.appendChild(div);
      });
      document.querySelectorAll('.cancel').forEach(btn => btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!confirm('Cancel appointment?')) return;
        const r = await fetch('/api/appointments/' + id, { method: 'DELETE', headers: { authorization: 'Bearer ' + token } });
        if (r.ok) load(); else alert('Failed to cancel');
      }));
    } catch (err) { console.error(err); upcoming.innerHTML = 'Network error'; }
  }

  document.getElementById('apptForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const scheduled_for = document.getElementById('scheduled_for').value;
    const reason = document.getElementById('reason').value;
    const notes = document.getElementById('notes').value;
    try {
      const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ scheduled_for, reason, notes }) });
      if (!res.ok) { alert('Failed to request appointment'); return; }
      alert('Appointment requested');
      load();
    } catch (err) { console.error(err); alert('Network error'); }
  });

  load();
});
