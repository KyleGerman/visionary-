const express = require('express');
const db = require('./connect_db');
const jwt = require('jsonwebtoken');

// new user setup
exports.newUser = async (req, res) => {
    const { firstName, lastName, gender, email, phone, dob, address, username, password } = req.body;

    const user_create = 'INSERT INTO users (first_name, last_name, birth_date, gender, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)'; 
        
    db.query(user_create, [firstName, lastName, dob, gender, email, phone, address], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const newUserId = results.insertId;
        const login_create = 'INSERT INTO logins (user_id, username, password) VALUES (?, ?, ?)';

        db.query(login_create, [newUserId, username, password], (err2) => {
            if (err2) {
                console.error("Login creation error:", err2);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const token = jwt.sign(
                { id: newUserId, username: username }, 
                'user session key', 
                { expiresIn: '1h' }
            );

            res.json({ token });
        });
    });
};

// login page login, assigns JWT token
exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM logins WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (!results.length) return res.status(401).json({ error: 'User not found' });

        const user = results[0];

        if (password != user.password) return res.status(401).json({ error: 'Wrong password' });

        const token = jwt.sign(
            { id: user.user_id, username: user.username }, 
            'user session key', 
            { expiresIn: '1h' }
        );

        res.json({ token });
    });
};

// reads JWT, verifies, and gets user_id
exports.verify = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    
    console.log('[AUTH] Authorization header:', authHeader);

    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'user session key', (err, decoded) => {
        if (err) {
            console.log('[AUTH] Token verification failed:', err);
            return res.sendStatus(403);
        }
        
        req.user_id = decoded.id; // ✅ FIXED: req instead of res
        console.log('[AUTH] User verified, user_id:', req.user_id);
        next();
    });
};