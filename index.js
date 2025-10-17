const express = require("express");
const port = 3000;
const app = express();
const path = require('path');
const db = require('./Backend/connect_db')
const authRoute = require('./Backend/auth');
require('dotenv').config();

// define json parser 
app.use(express.json());

// serve files
app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// define routes
app.use('/api', authRoute);

//output in console -> if working, outputs the console.log
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));





