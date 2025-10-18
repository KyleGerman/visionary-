const db = require('./connect_db');

// get messages for current user (recipient)
exports.getMessages = (req, res) => {
  const userId = res.user_id;
  const q = `SELECT m.message_id, m.sender_id, m.recipient_id, m.subject, m.body, m.created_at, m.is_read, u.first_name, u.last_name
             FROM messages m
             LEFT JOIN users u ON u.user_id = m.sender_id
             WHERE m.recipient_id = ? ORDER BY m.created_at DESC`;

  db.query(q, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    res.json(rows);
  });
};

// send a message (sender is current user)
exports.sendMessage = (req, res) => {
  const senderId = res.user_id;
  const { recipient_id, subject, body } = req.body;
  if (!recipient_id || !body) return res.status(400).json({ error: 'recipient_id and body required' });

  const q = `INSERT INTO messages (sender_id, recipient_id, subject, body, created_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)`;
  db.query(q, [senderId, recipient_id, subject || '', body], (err, result) => {
    if (err) {
      console.error('Error sending message:', err);
      return res.status(500).json({ error: 'Failed to send message' });
    }
    res.json({ success: true, message_id: result.insertId });
  });
};

exports.markRead = (req, res) => {
  const userId = res.user_id;
  const messageId = req.params.id;
  const q = `UPDATE messages SET is_read = 1 WHERE message_id = ? AND recipient_id = ?`;
  db.query(q, [messageId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to mark read' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true });
  });
};
