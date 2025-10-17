const express = require('express');
const db = require('./connect_db');
const jwt = require('jsonwebtoken');

// new user setup
exports.new_user = async (req, res, next) => {
    res.send("Not implemented yet")
}

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
        { expiresIn: '1h' });

        res.json({ token });

    });
};

// reads JWT, verifies, and gets user_id
exports.verify = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    console.log(authHeader); // Bearer token
    const token = authHeader.split(' ')[1];
    jwt.verify(
      token,
      'user session key',
      (err, decoded) => {
        if (err) return res.sendStatus(403) // invalid token
        res.user_id = decoded.user_id; // user_id sent as 'user_id' to next function;
        next()
      }
    )
}


