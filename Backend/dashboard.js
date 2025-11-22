const db = require('./connect_db');

// get appointments for the dashboard
exports.getDashboardData = (req, res) => {

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
                WHERE pt.user_id = ?
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