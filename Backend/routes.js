// defines ALL routes, initialized by index.js
// each route points to a backend module. When adding a new module to a file, add the route here under the relevant section
// when a new file is created, remember to Require it 

const express = require("express");
const router = express.Router();

// Requires
const auth = require('./auth');



// AUTHORIZATIONS //

// Create new user POST request
router.post('/newuser', auth.new_user); // need to adjust this

// Login POST request
router.post('/login', auth.login);

// DASHBOARD //



//


module.exports = router;
