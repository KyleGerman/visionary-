// defines ALL routes, initialized by index.js
// each route points to a backend module. When adding a new module to a file, add the route here under the relevant section
// when a new file is created, remember to Require it 

const express = require("express");
const router = express.Router();

// Requires
const auth = require('./auth');
const profileSection = require('./profile');
const appointments = require('./appointments');
const messages = require('./messages');
const actualDashboard = require('./dashboard');


// AUTHORIZATIONS //

// Create new user POST request
router.post('/newUser', auth.newUser); 

// Login POST request
router.post('/login', auth.login);

// Profile GET request
router.get('/profile', auth.verify, profileSection.getProfile);
router.put('/profile', auth.verify, profileSection.updateProfile);

// Update Appointment Status on Dashboard
router.get('/appointmentData', auth.verify, actualDashboard.getDashboardData);

// Dashboard: get and update dashboard-specific user info
router.get('/dashboard', auth.verify, profileSection.getDashboard);
router.put('/dashboard', auth.verify, profileSection.updateFromDashboard);

// Appointments
router.get('/appointments/doctorNames', auth.verify, appointments.getDoctorNames);
router.get('/appointments/past/:limit', auth.verify, appointments.showPast);
router.get('/appointments/past', auth.verify, appointments.showPast);

router.get('/appointments', auth.verify, appointments.getAppointments);
router.post('/appointments', auth.verify, appointments.createAppointment);
router.put('/appointments/:id', auth.verify, appointments.updateAppointment);
router.delete('/appointments/:id', auth.verify, appointments.deleteAppointment);

// Messages
router.get('/messages', auth.verify, messages.getMessages);
router.post('/messages', auth.verify, messages.sendMessage);
router.put('/messages/:id/read', auth.verify, messages.markRead);

//


module.exports = router;
