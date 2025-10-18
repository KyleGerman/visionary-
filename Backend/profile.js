const db = require('./connect_db');
const auth = require('./auth')

exports.getProfile = (req, res) => {

    const userId = res.user_id;

    const query = 'SELECT first_name, last_name, email, phone, birth_date, address FROM users WHERE user_id = ?';

    db.query(query, [userId], (err, results) => 
{

        if (err)
        {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0)
        {
            return res.status(404);
        }

        res.json(results[0]);
});
};

