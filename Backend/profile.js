const db = require('./connect_db');
const auth = require('./auth')

exports.getProfile = (req, res) => { // function to get user profile data

    const userId = res.user_id; // get user ID from the authenticated request

    const query = 'SELECT first_name, last_name, email, phone, birth_date, address FROM users WHERE user_id = ?';

    db.query(query, [userId], (err, results) => // execute the database query
{

        if (err) // handle any database errors
        {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) // if no user found
        {
            return res.status(404);
        }

        res.json(results[0]); // send the user profile data as JSON response
});
};

