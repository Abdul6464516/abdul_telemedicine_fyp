const express = require('express');
const router = express.Router();
const {
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins,
  getAdminById,
  createAdmin,
  deleteAdmin,
  getPendingDoctors,
  getPendingPatients,
  verifyUser,
  rejectUser,
  getVerifiedUsersByRole,
  getAllDoctors,
  getAllPatients,
  getSystemMonitoring,
  getRecentActivity,
  getLatestFeedback,
  getTopDoctors,
  getKPIMetrics,
  getEngagementMetrics,
  getConsultationTrend,
  getSecurityLogs,
  getPatientDataAccess,
  getConsultationEncryption,
  getDataRetentionPolicies,
  getPendingDeletions,
  getStaffCompliance,
  getPatientConsent,
  approveDeletion
} = require('../controlers/adminController');
const { getAdminOverviewInsights } = require('../controlers/adminInsightsController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Get current admin profile (requires authentication and admin role)
router.get('/profile', verifyToken, requireRole('admin'), getAdminProfile);

// Update admin profile (requires authentication and admin role)
router.put('/profile', verifyToken, requireRole('admin'), updateAdminProfile);

// Get all admins (requires authentication and admin role)
router.get('/all', verifyToken, requireRole('admin'), getAllAdmins);

// Smart admin overview insights
router.get('/overview-insights', verifyToken, requireRole('admin'), getAdminOverviewInsights);

// Get single admin by ID (requires authentication and admin role)
router.get('/:adminId', verifyToken, requireRole('admin'), getAdminById);

// Create new admin (requires authentication and admin role)
router.post('/create', verifyToken, requireRole('admin'), createAdmin);

// Delete admin (requires authentication and admin role)
router.delete('/:adminId', verifyToken, requireRole('admin'), deleteAdmin);

// Get all pending doctors for verification (requires authentication and admin role)
router.get('/verification/pending-doctors', verifyToken, requireRole('admin'), getPendingDoctors);

// Get all pending patients for verification (requires authentication and admin role)
router.get('/verification/pending-patients', verifyToken, requireRole('admin'), getPendingPatients);

// Get all verified users by role (requires authentication and admin role)
router.get('/verification/verified/:role', verifyToken, requireRole('admin'), getVerifiedUsersByRole);

// Verify a doctor or patient (requires authentication and admin role)
router.put('/verification/verify/:userId', verifyToken, requireRole('admin'), verifyUser);

// Reject a doctor or patient (requires authentication and admin role)
router.put('/verification/reject/:userId', verifyToken, requireRole('admin'), rejectUser);

// Get all doctors with all verification statuses (requires authentication and admin role)
router.get('/verification/all-doctors', verifyToken, requireRole('admin'), getAllDoctors);

// Get all patients with all verification statuses (requires authentication and admin role)
router.get('/verification/all-patients', verifyToken, requireRole('admin'), getAllPatients);

// System Monitoring - Get live statistics
router.get('/monitoring/statistics', verifyToken, requireRole('admin'), getSystemMonitoring);

// System Monitoring - Get recent activity feed
router.get('/monitoring/activity', verifyToken, requireRole('admin'), getRecentActivity);

// System Monitoring - Get latest feedback
router.get('/monitoring/feedback', verifyToken, requireRole('admin'), getLatestFeedback);

// Analytics - Get top performing doctors
router.get('/analytics/top-doctors', verifyToken, requireRole('admin'), getTopDoctors);

// Analytics - Get KPI metrics
router.get('/analytics/kpi-metrics', verifyToken, requireRole('admin'), getKPIMetrics);

// Analytics - Get engagement metrics
router.get('/analytics/engagement', verifyToken, requireRole('admin'), getEngagementMetrics);

// Analytics - Get consultation trend
router.get('/analytics/consultation-trend', verifyToken, requireRole('admin'), getConsultationTrend);

// ============ SECURITY & PRIVACY ENDPOINTS ============

// Get security logs
router.get('/security/logs', verifyToken, requireRole('admin'), getSecurityLogs);

// Get patient data access records
router.get('/security/patient-access', verifyToken, requireRole('admin'), getPatientDataAccess);

// Get consultation encryption status
router.get('/security/consultation-encryption', verifyToken, requireRole('admin'), getConsultationEncryption);

// Get data retention policies
router.get('/security/retention-policies', verifyToken, requireRole('admin'), getDataRetentionPolicies);

// Get pending data deletion requests
router.get('/security/pending-deletions', verifyToken, requireRole('admin'), getPendingDeletions);

// Approve data deletion
router.put('/security/approve-deletion/:deletionId', verifyToken, requireRole('admin'), approveDeletion);

// Get staff confidentiality compliance records
router.get('/security/staff-compliance', verifyToken, requireRole('admin'), getStaffCompliance);

// Get patient consent records
router.get('/security/patient-consent', verifyToken, requireRole('admin'), getPatientConsent);

module.exports = router;
