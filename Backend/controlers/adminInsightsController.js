const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');

async function getAdminOverviewInsights(req, res) {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalDoctors,
      totalPatients,
      pendingVerifications,
      verifiedUsers,
      rejectedUsers,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      cancelledAppointments,
      completedAppointments,
      totalConsultations,
      activeConsultations,
      completedConsultations,
      latestUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: { $in: ['doctor', 'patient'] }, verificationStatus: 'pending' }),
      User.countDocuments({ role: { $in: ['doctor', 'patient'] }, verificationStatus: 'verified' }),
      User.countDocuments({ role: { $in: ['doctor', 'patient'] }, verificationStatus: 'rejected' }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.countDocuments({ status: 'completed' }),
      Consultation.countDocuments({}),
      Consultation.countDocuments({ status: 'active' }),
      Consultation.countDocuments({ status: 'completed' }),
      User.find({ role: { $in: ['doctor', 'patient'] } })
        .select('fullName role email city verificationStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      summary: {
        totalUsers,
        totalAdmins,
        totalDoctors,
        totalPatients,
        pendingVerifications,
        verifiedUsers,
        rejectedUsers,
        totalAppointments,
        pendingAppointments,
        approvedAppointments,
        cancelledAppointments,
        completedAppointments,
        totalConsultations,
        activeConsultations,
        completedConsultations,
      },
      latestUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAdminOverviewInsights };
