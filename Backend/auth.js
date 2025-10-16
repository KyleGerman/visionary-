const express = require('express');
const router = express.Router();
const db = require('./connect_db');
const jwt = require('jsonwebtoken');

router.post('/login', (req,res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM logins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (!results.length) return res.status(401).json({ error: 'User not found' });

        const user = results[0];

        if (password != user.password) return res.status(401).json({ error: 'Wrong password' });

        const token = jwt.sign(
        { id: user.user_id, username: user.username }, 
        'user session key', 
        { expiresIn: '1h' });

        res.json({ token });

    });
});

module.exports = router;

