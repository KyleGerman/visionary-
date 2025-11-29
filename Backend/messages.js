const db = require('./connect_db');

exports.getMessages = (req, res) => {
  const userId = req.user_id; // ✅ FIXED: req instead of res
  
  console.log('[MESSAGES] Getting messages for user:', userId);
  
  const q = `SELECT * FROM messages WHERE sender_id = ? OR recipient_id = ? ORDER BY created_at DESC`;

  db.query(q, [userId, userId], (err, rows) => {
    if (err) {
      console.error('[MESSAGES] Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('[MESSAGES] Found messages:', rows.length);
    console.log('[MESSAGES] Sending data:', rows);
    res.json(rows);
  });
};

exports.sendMessage = (req, res) => {
  const senderId = req.user_id; // ✅ FIXED: req instead of res
  const { recipient_id, subject, body } = req.body;
  
  console.log('[MESSAGES] Send message request:', { senderId, recipient_id, subject, body });
  
  if (!recipient_id || !body) {
    return res.status(400).json({ error: 'recipient_id and body required' });
  }

  const q = `INSERT INTO messages (sender_id, recipient_id, subject, body, created_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)`;
  
  db.query(q, [senderId, recipient_id, subject || '', body], (err, result) => {
    if (err) {
      console.error('[MESSAGES] Error sending message:', err);
      return res.status(500).json({ error: 'Failed to send message', details: err.message });
    }
    console.log('[MESSAGES] Message sent, ID:', result.insertId);
    res.json({ success: true, message_id: result.insertId });
  });
};

exports.markRead = (req, res) => {
  const userId = req.user_id; // ✅ FIXED: req instead of res
  const messageId = req.params.id;
  
  const q = `UPDATE messages SET is_read = 1 WHERE message_id = ? AND recipient_id = ?`;
  
  db.query(q, [messageId, userId], (err, result) => {
    if (err) {
      console.error('[MESSAGES] Error marking read:', err);
      return res.status(500).json({ error: 'Failed to mark read' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.log('[MESSAGES] Marked message as read:', messageId);
    res.json({ success: true });
  });
};