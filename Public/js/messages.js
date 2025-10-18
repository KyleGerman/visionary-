window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const list = document.getElementById('messageList');

  async function load() {
    list.innerHTML = 'Loading...';
    try {
      const res = await fetch('/api/messages', { headers: { authorization: 'Bearer ' + token } });
      if (!res.ok) { list.innerHTML = 'Failed to load messages'; return; }
      const rows = await res.json();
      if (!rows.length) { list.innerHTML = '<p>No messages</p>'; return; }
      list.innerHTML = '';
      rows.forEach(m => {
        const d = document.createElement('div');
        d.className = 'card';
        d.innerHTML = `<h3>${m.first_name || 'Sender'} ${m.last_name || ''}</h3><p>${m.body}</p><small>${new Date(m.created_at).toLocaleString()}</small> <button data-id="${m.message_id}" class="markread">Mark read</button>`;
        list.appendChild(d);
      });
      document.querySelectorAll('.markread').forEach(b => b.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const r = await fetch('/api/messages/' + id + '/read', { method: 'PUT', headers: { authorization: 'Bearer ' + token } });
        if (r.ok) load(); else alert('Failed');
      }));
    } catch (err) { console.error(err); list.innerHTML = 'Network error'; }
  }

  document.getElementById('sendForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipient_id = document.getElementById('recipient').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ recipient_id, subject, body }) });
      if (!res.ok) { alert('Failed to send'); return; }
      alert('Message sent');
      load();
    } catch (err) { console.error(err); alert('Network error'); }
  });

  load();
});
