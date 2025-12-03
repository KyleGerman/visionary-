window.addEventListener('DOMContentLoaded', async () => {
  console.log('[FRONTEND] Page loaded');
  
  const token = localStorage.getItem('token');
  console.log('[FRONTEND] Token:', token ? 'EXISTS' : 'MISSING');
  
  if (!token) {
    alert('Not logged in! Redirecting...');
    window.location.href = '/login.html';
    return;
  }

  const list = document.getElementById('messageList');
  console.log('[FRONTEND] Message list element:', list ? 'FOUND' : 'NOT FOUND');

  // Get current user ID from token
  function getCurrentUserId() {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[FRONTEND] Token payload:', payload);
      return payload.id;
    } catch (err) {
      console.error('[FRONTEND] Error parsing token:', err);
      return null;
    }
  }

  const currentUserId = getCurrentUserId();
  console.log('[FRONTEND] Current user ID:', currentUserId);

  async function load() {
    console.log('[FRONTEND] === LOADING MESSAGES ===');
    list.innerHTML = '<p>Loading messages...</p>';
    
    try {
      console.log('[FRONTEND] Fetching from /api/messages');
      const res = await fetch('/api/messages', { 
        headers: { 
          'Authorization': 'Bearer ' + token 
        } 
      });
      
      console.log('[FRONTEND] Response status:', res.status);
      console.log('[FRONTEND] Response ok:', res.ok);
      
      const data = await res.json();
      console.log('[FRONTEND] Response data:', data);
      console.log('[FRONTEND] Data type:', typeof data);
      console.log('[FRONTEND] Is array:', Array.isArray(data));
      console.log('[FRONTEND] Length:', data.length);
      
      if (!res.ok) {
        list.innerHTML = `<p style="color: red;">Error: ${data.error || 'Failed to load'}</p>`;
        return;
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        list.innerHTML = '<p>No messages found</p>';
        return;
      }
      
      // BUILD TABLE
      let html = `
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #0072c6; color: white;">
              <th style="padding: 12px; text-align: left;">Type</th>
              <th style="padding: 12px; text-align: left;">Senders Name</th>
              <th style="padding: 12px; text-align: left;">Recipient Name</th>
              <th style="padding: 12px; text-align: left;">Subject</th>
              <th style="padding: 12px; text-align: left;">Message</th>
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach((m, index) => {
        const isSent = m.sender_id === currentUserId;
        const type = isSent ? 'SENT' : 'RECEIVED';
        const typeColor = isSent ? '#0072c6' : '#28a745';
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
        
        html += `
          <tr style="background: ${rowBg}; border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 12px; color: ${typeColor}; font-weight: bold;">${type}</td>
            <td style="padding: 12px;">${m.sender_first_name}</td>
            <td style="padding: 12px;">${m.recipient_first_name}</td>
            <td style="padding: 12px;">${m.subject || '<em>(no subject)</em>'}</td>
            <td style="padding: 12px;">${m.body}</td>
            <td style="padding: 12px; font-size: 0.9em; color: #666;">${new Date(m.created_at).toLocaleString()}</td>
            <td style="padding: 12px;">
              ${m.is_read ? '<span style="color: green;">✓ Read</span>' : '<span style="color: orange;">Unread</span>'}
              ${!isSent && !m.is_read ? `<button onclick="markAsRead(${m.message_id})" style="margin-left: 8px; padding: 4px 8px; background: #0072c6; color: white; border: none; border-radius: 4px; cursor: pointer;">Mark Read</button>` : ''}
            </td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      list.innerHTML = html;
      
      console.log('[FRONTEND] Table rendered with', data.length, 'messages');
      
    } catch (err) { 
      console.error('[FRONTEND] ERROR:', err);
      list.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`; 
    }
  }

  // Make markAsRead global
  window.markAsRead = async function(messageId) {
    console.log('[FRONTEND] Marking message as read:', messageId);
    try {
      const res = await fetch('/api/messages/' + messageId + '/read', { 
        method: 'PUT', 
        headers: { 
          'Authorization': 'Bearer ' + token 
        } 
      });
      if (res.ok) {
        console.log('[FRONTEND] Message marked as read');
        load();
      } else {
        alert('Failed to mark as read');
      }
    } catch (err) {
      console.error('[FRONTEND] Error marking read:', err);
      alert('Error: ' + err.message);
    }
  };

  // Send message
  const sendForm = document.getElementById('sendForm');
  if (sendForm) {
    sendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[FRONTEND] === SENDING MESSAGE ===');
      
      const recipient_id = parseInt(document.getElementById('recipient').value);
      const subject = document.getElementById('subject').value;
      const body = document.getElementById('body').value;
      
      console.log('[FRONTEND] Form values:', { recipient_id, subject, body });
      
      if (!recipient_id || !body) {
        alert('Recipient ID and message body are required');
        return;
      }
      
      try {
        const res = await fetch('/api/messages', { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + token 
          }, 
          body: JSON.stringify({ recipient_id, subject, body }) 
        });
        
        const result = await res.json();
        console.log('[FRONTEND] Send response:', result);
        
        if (!res.ok) {
          alert('Failed: ' + (result.error || 'Unknown error'));
          return;
        }
        
        alert('Message sent successfully!');
        sendForm.reset();
        load(); // Reload messages after sending
        
      } catch (err) { 
        console.error('[FRONTEND] Send error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Initial load
  load();
});