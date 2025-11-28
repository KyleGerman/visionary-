// appointments.js
// Loads, creates, deletes, and calendar view

window.addEventListener('DOMContentLoaded', async () => {

  const token = localStorage.getItem('token');
  
  if (!token) return;

  const upcoming = document.getElementById('upcomingList');
  const calButton = document.getElementById('calButton');
  const calContainer = document.getElementById('calContainer');
  let calendar;

  async function load() {

    upcoming.innerHTML = 'Loading...';

    try {
      const res = await fetch('/api/appointments', { headers: { authorization: 'Bearer ' + token } });

      if (!res.ok) { 
        upcoming.innerHTML = 'Failed to load'; return; 
      }

      const rows = await res.json();

      if (!rows.length) { 
        upcoming.innerHTML = '<p>No upcoming appointments</p>'; return; 
      }

      upcoming.innerHTML = '';

      rows.forEach(a => {

        // does not put completed appointments in the list
        if (a.status == 'completed') {
          return;
        }

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

        window.location.reload();
        
      }));

      updateCalendar(rows);
    }

    catch (err) { 
      console.error(err); upcoming.innerHTML = 'Network error'; 
    }

    function updateCalendar(rows) {

    const events = rows.map(a => {
      // scheduled_for now comes as a plain string: "2025-11-26 23:48:00"
      // Convert to ISO format for Date parsing (add T instead of space)
      const isoString = a.scheduled_for.replace(' ', 'T');
      const start = new Date(isoString);

      // 30 minutes duration for appointments, change this?
      const end = new Date(start.getTime() + 30 * 60 * 1000); 
      
      if (a.status === 'completed') {
        return {
        title: a.reason || "Appointment",
        start: start,
        end: end,
        color: 'red',
        extendedProps: { status: a.status, notes: a.notes }
        }
      }
      else {
      return {
        title: a.reason || "Appointment",
        start: start,
        end: end,
        extendedProps: { status: a.status, notes: a.notes }
      };}
    });

    // Initialize or update calendar
    if (!calendar) {
      const calendarEl = document.getElementById('calendar');
      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        events,

        eventClick: function(info) {
        info.jsEvent.preventDefault();

        // Fill modal fields
        document.getElementById('modalTitle').textContent = info.event.title;

        if (info.event.extendedProps.notes === "") {
          document.getElementById('modalDescription').textContent = "No notes provided.";
        } else {
          document.getElementById('modalDescription').textContent = info.event.extendedProps.notes;
        }

        document.getElementById('modalStart').textContent =
          info.event.start.toLocaleString();
        document.getElementById('modalEnd').textContent =
          info.event.end ? info.event.end.toLocaleString() : "—";

        // Show modal
        document.getElementById('eventModal').style.display = 'block';
  }
      });

      calendar.render();
    } 
    else {
      calendar.removeAllEvents();
      events.forEach(ev => calendar.addEvent(ev));
    }
  }

    // Show calendar on button click
    calButton.addEventListener('click', () => {

    calContainer.style.display = 'block';
    
    // this fixes bug. waits for calendar to become visible, then resizes. idk what the 50 does but keep it there
    setTimeout(() => {
    if (calendar) { 
      calendar.updateSize();
    }
    }, 50);

    calContainer.scrollIntoView({ behavior: 'smooth' });
  });
  }

  document.getElementById('apptForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const scheduled_for = document.getElementById('scheduled_for').value;
    const reason = document.getElementById('reason').value;
    const notes = document.getElementById('notes').value;

    // Convert datetime-local format "2025-11-27T09:45" to MySQL format "2025-11-27 09:45:00"
    const [date, time] = scheduled_for.split('T');
    const scheduled_for_mysql = `${date} ${time}:00`;

    // random provider for test
    const provider_id = Math.floor(Math.random() * 20) + 1; 

    console.log('Sending scheduled_for:', scheduled_for_mysql);

    try {
      const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ scheduled_for: scheduled_for_mysql, reason, notes, provider_id }) });
      if (!res.ok) { alert('Failed to request appointment'); return; }
      alert('Appointment requested');
      load();
    } catch (err) { console.error(err); alert('Network error'); }
  });

  /*
  This must be at the end otherwise it breaks. Closes the modal aka popup when clicking outside or on the X
  thank you w3schools

  Top: if user clicks the X button, close the modal
  
  Bottom: if user clicks outside the modal, close it
  */
  document.getElementById('closeModal').onclick = function () {
    document.getElementById('eventModal').style.display = 'none';
  };
  window.onclick = function (e) {
    if (e.target === document.getElementById('eventModal')) {
      document.getElementById('eventModal').style.display = 'none';
    }
  }

  // load
  load();

});
