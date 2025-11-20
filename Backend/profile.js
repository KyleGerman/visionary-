const db = require('./connect_db');
const auth = require('./auth')

// function to get user profile data
exports.getProfile = (req, res) => {

    // get user ID from the authenticated request
    const userId = res.user_id; 

    const query = 'SELECT first_name, last_name, email, phone, birth_date, address FROM users WHERE user_id = ?';

    // execute the database query
    db.query(query, [userId], (err, results) => {

        // handle any database errors
        if (err)
        {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // if no user found
        if (results.length === 0) {
            return res.status(404);
        }

        // send the user profile data as JSON response
        res.json(results[0]);
});
};

// function to update user profile data
exports.updateProfile = (req, res) => {

    // get user ID from the authenticated request
    const userId = res.user_id;

    // from profile.js updateProfile function
    const { first_name, last_name, email, phone, birth_date, address } = req.body;
    
    const query = `UPDATE users 
                   SET first_name = ?, last_name = ?, email = ?, phone = ?, birth_date = ?, address = ? 
                   WHERE user_id = ?`;
    
    db.query(query, [first_name, last_name, email, phone, birth_date, address, userId], (err, result) => {
        
        // handle any database errors
        if (err)
        {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }
});

    // respond with success so the client can refresh its view
    return res.json({ success: true });

};

    // get dashboard data (name, contact, health summary)
    exports.getDashboard = (req, res) => {
        const userId = res.user_id;

        const query = `SELECT u.first_name, u.last_name, u.email, u.phone, u.address, p.med_history, p.prescriptions
                       FROM users u
                       LEFT JOIN patients p ON p.user_id = u.user_id
                       WHERE u.user_id = ?`;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!results || results.length === 0) return res.status(404).json({ error: 'User not found' });

            res.json(results[0]);
        });
    };

    // update dashboard fields (name/contact and patient med history/prescriptions)
    exports.updateFromDashboard = (req, res) => {
        const userId = res.user_id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { first_name, last_name, email, phone, address, med_history, prescriptions } = req.body;

        // update users table
        const q1 = `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ? WHERE user_id = ?`;

        db.query(q1, [first_name, last_name, email, phone, address, userId], (err, result1) => {
            if (err) {
                console.error('Error updating users:', err);
                return res.status(500).json({ error: 'Failed to update user info' });
            }

            // upsert into patients table: if a patients record exists, update it; otherwise insert
            const q2 = `SELECT patient_id FROM patients WHERE user_id = ?`;
            db.query(q2, [userId], (err, rows) => {
                if (err) {
                    console.error('Error selecting patient:', err);
                    return res.status(500).json({ error: 'Failed to update patient info' });
                }

                if (rows && rows.length > 0) {
                    const qUpdate = `UPDATE patients SET med_history = ?, prescriptions = ? WHERE user_id = ?`;
                    db.query(qUpdate, [med_history, prescriptions, userId], (err, r) => {
                        if (err) {
                            console.error('Error updating patients:', err);
                            return res.status(500).json({ error: 'Failed to update patient info' });
                        }
                        return res.json({ success: true });
                    });
                } else {
                    const qInsert = `INSERT INTO patients (user_id, med_history, prescriptions) VALUES (?, ?, ?)`;
                    db.query(qInsert, [userId, med_history, prescriptions], (err, r) => {
                        if (err) {
                            console.error('Error inserting patient:', err);
                            return res.status(500).json({ error: 'Failed to save patient info' });
                        }
                        return res.json({ success: true });
                    });
                }
            });
        });
    };

