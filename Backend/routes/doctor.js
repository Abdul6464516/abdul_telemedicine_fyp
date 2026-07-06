const express = require('express');
const router = express.Router();
const {
  getAllDoctors, getDoctorProfile, updateDoctorProfile,
  getDoctorAppointments, approveAppointment, cancelAppointmentByDoctor,
  getCompletedPatients, getPatientHistory, createPrescription, getDoctorPrescriptions, getPrescriptionById,
  getDoctorRatings,
} = require('../controlers/doctorController');
const { getDoctorDashboardInsights } = require('../controlers/doctorInsightsController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public route — any logged-in user can search doctors
router.get('/list', verifyToken, getAllDoctors);
router.get('/ratings', verifyToken, getDoctorRatings);

// Doctor-only routes
router.get('/profile', verifyToken, requireRole('doctor'), getDoctorProfile);
router.put('/profile', verifyToken, requireRole('doctor'), updateDoctorProfile);
router.get('/insights', verifyToken, requireRole('doctor'), getDoctorDashboardInsights);
router.get('/appointments', verifyToken, requireRole('doctor'), getDoctorAppointments);
router.put('/appointment/:id/approve', verifyToken, requireRole('doctor'), approveAppointment);
router.put('/appointment/:id/cancel', verifyToken, requireRole('doctor'), cancelAppointmentByDoctor);

// Prescription routes
router.get('/completed-patients', verifyToken, requireRole('doctor'), getCompletedPatients);
router.get('/patient/:id/history', verifyToken, requireRole('doctor'), getPatientHistory);
router.post('/prescription', verifyToken, requireRole('doctor'), createPrescription);
router.get('/prescriptions', verifyToken, requireRole('doctor'), getDoctorPrescriptions);
router.get('/prescription/:id', verifyToken, requireRole('doctor'), getPrescriptionById);

module.exports = router;
