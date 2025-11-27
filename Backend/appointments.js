const db = require('./connect_db');

// get appointments for current user (patient)
exports.getAppointments = (req, res) => {
  const userId = res.user_id;
  // we need patient_id from patients table
  // Format scheduled_for as a string to avoid timezone conversion
  const q = `SELECT a.appointment_id, a.patient_id, a.provider_id, a.created_at, DATE_FORMAT(a.scheduled_for, '%Y-%m-%d %H:%i:%s') as scheduled_for, a.reason, a.notes, a.status FROM appointments a
             JOIN patients p ON p.patient_id = a.patient_id
             WHERE p.user_id = ? ORDER BY a.scheduled_for ASC`;

  db.query(q, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.json(rows);
  });
};

exports.createAppointment = (req, res) => {
  const userId = res.user_id;
  const { scheduled_for, reason, notes, provider_id } = req.body;

  // find patient_id
  db.query('SELECT patient_id FROM patients WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!rows.length) return res.status(400).json({ error: 'Patient record not found' });

    const patient_id = rows[0].patient_id;
    // scheduled_for is in format "2025-11-27 09:45:00" (local time, no timezone)
    const q = `INSERT INTO appointments (patient_id, provider_id, created_at, scheduled_for, reason, notes, status) VALUES (?, ?, NOW(), ?, ?, ?, 'scheduled')`;
    db.query(q, [patient_id, provider_id || 1, scheduled_for, reason || '', notes || ''], (err, result) => {
      if (err) {
        console.error('Error creating appointment:', err);
        return res.status(500).json({ error: 'Failed to create appointment' });
      }
      res.json({ success: true, appointment_id: result.insertId });
    });
  });
};

exports.updateAppointment = (req, res) => {
  const userId = res.user_id;
  const appointmentId = req.params.id;
  const { scheduled_for, reason, notes, status } = req.body;

  // ensure appointment belongs to user
  const check = `SELECT a.* FROM appointments a JOIN patients p ON p.patient_id = a.patient_id WHERE a.appointment_id = ? AND p.user_id = ?`;
  db.query(check, [appointmentId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });

    const q = `UPDATE appointments SET scheduled_for = ?, reason = ?, notes = ?, status = ? WHERE appointment_id = ?`;
    db.query(q, [scheduled_for || rows[0].scheduled_for, reason || rows[0].reason, notes || rows[0].notes, status || rows[0].status, appointmentId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update' });
      res.json({ success: true });
    });
  });
};

exports.deleteAppointment = (req, res) => {
  const userId = res.user_id;
  const appointmentId = req.params.id;
  const check = `SELECT a.* FROM appointments a JOIN patients p ON p.patient_id = a.patient_id WHERE a.appointment_id = ? AND p.user_id = ?`;
  db.query(check, [appointmentId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });

    db.query('DELETE FROM appointments WHERE appointment_id = ?', [appointmentId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete' });
      res.json({ success: true });
    });
  });
};
