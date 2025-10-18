window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) { alert('Please log in'); window.location.href = '/login.html'; return; }

  const medHistoryEl = document.getElementById('medHistory');
  const medsEl = document.getElementById('meds');

  async function load() {
    try {
      const res = await fetch('/api/dashboard', { headers: { authorization: 'Bearer ' + token } });
      if (!res.ok) { console.error('Failed to load'); return; }
      const data = await res.json();
      medHistoryEl.value = data.med_history || '';
      medsEl.value = data.prescriptions || '';
    } catch (err) { console.error(err); }
  }

  document.getElementById('healthForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { med_history: medHistoryEl.value, prescriptions: medsEl.value };
    try {
      const res = await fetch('/api/dashboard', { method: 'PUT', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to save'); return; }
      alert('Health info saved');
    } catch (err) { console.error(err); alert('Network error'); }
  });

  load();
});
