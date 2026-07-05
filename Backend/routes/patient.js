const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, submitFeedback, getMyFeedbacks, getDoctorBookedSlots, bookAppointment, getMyAppointments, cancelAppointment, getMyPrescriptions } = require('../controlers/patientController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/profile', verifyToken, requireRole('patient'), getProfile);
router.put('/profile', verifyToken, requireRole('patient'), updateProfile);
router.post('/feedback', verifyToken, requireRole('patient'), submitFeedback);
router.get('/feedback', verifyToken, requireRole('patient'), getMyFeedbacks);
router.get('/doctor/:doctorId/appointments', verifyToken, requireRole('patient'), getDoctorBookedSlots);
router.post('/appointment', verifyToken, requireRole('patient'), bookAppointment);
router.get('/appointments', verifyToken, requireRole('patient'), getMyAppointments);
router.put('/appointment/:id/cancel', verifyToken, requireRole('patient'), cancelAppointment);
router.get('/prescriptions', verifyToken, requireRole('patient'), getMyPrescriptions);

module.exports = router;
