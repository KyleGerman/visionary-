const express = require("express");
const port = 3000;
const app = express();
const path = require('path');
const router = require('./Backend/routes')
require('dotenv').config();

// define json parser 
app.use(express.json());

// serve files
app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// define routes
app.use('/api', router);

//output in console -> if working, outputs the console.log
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));





