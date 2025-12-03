const db = require('./connect_db');

// Update past appointments to "completed" status
const markPastAppointmentsCompleted = () => {
  const updateQ = `UPDATE appointments SET status = 'completed' 
                   WHERE status IN ('scheduled', 'in-progress') 
                   AND scheduled_for < NOW()`;
  
  db.query(updateQ, (err) => {
    if (err) {
      console.error('Error updating past appointments:', err);
    }
  });
};

// get appointments for the dashboard
exports.getDashboardData = (req, res) => {

    // Mark past appointments as completed before fetching
    markPastAppointmentsCompleted();

    // get user ID from the authenticated request
    const userId = res.user_id;

    const query = `SELECT 
                    a.appointment_id,
                    a.scheduled_for,
                    a.reason,
                    a.status,
                    u.first_name AS provider_first,
                    u.last_name  AS provider_last,
                    pr.specialty
                FROM appointments a
                JOIN patients pt ON a.patient_id = pt.patient_id
                JOIN providers pr ON a.provider_id = pr.provider_id
                JOIN users u ON pr.user_id = u.user_id
                WHERE pt.user_id = ? AND a.status IN ('scheduled', 'in-progress')
                ORDER BY a.scheduled_for ASC
                LIMIT 5;`;

    db.query(query, [userId], (err, results) => {
        
        // handle any database errors
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // send the dashboard data as JSON response
        res.json(results);
        });
        
};

// selects first and last name of the sender, counts it for frontend function
exports.getMessagesDashboard = (req, res) => {

  const userId = res.user_id;

  const query = `SELECT u.first_name, u.last_name, COUNT(*) as message_count
                 FROM messages m JOIN users u ON m.sender_id = u.user_id
                 WHERE m.recipient_id = ?
                 GROUP BY m.sender_id, u.first_name, u.last_name
                 LIMIT 3`;
  
  db.query (query, [userId], (err,results) => {

        // handle any database errors
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // send the message dashboard data as JSON response
        res.json(results);
  });
}