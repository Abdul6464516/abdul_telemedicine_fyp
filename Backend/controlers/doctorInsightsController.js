const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');

// GET /api/doctor/insights — dashboard metrics for logged-in doctor
async function getDoctorDashboardInsights(req, res) {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'fullName age gender city')
      .sort({ updatedAt: -1, createdAt: -1 });

    const totalConsultations = await Consultation.countDocuments({ doctor: doctorId });

    let pendingAppointments = 0;
    let approvedAppointments = 0;
    let rejectedAppointments = 0;
    let completedAppointments = 0;

    const uniquePatients = new Set();
    const latestPatients = [];
    const latestSeen = new Set();

    for (const appt of appointments) {
      const status = appt.status;
      if (status === 'pending') pendingAppointments += 1;
      if (status === 'approved') approvedAppointments += 1;
      if (status === 'cancelled') rejectedAppointments += 1;
      if (status === 'completed') completedAppointments += 1;

      const patientId = appt.patient?._id?.toString();
      if (!patientId) continue;

      uniquePatients.add(patientId);

      if (!latestSeen.has(patientId) && latestPatients.length < 5) {
        latestSeen.add(patientId);
        latestPatients.push({
          _id: appt.patient._id,
          fullName: appt.patient.fullName || 'Unknown Patient',
          age: appt.patient.age ?? null,
          gender: appt.patient.gender || '',
          city: appt.patient.city || '',
          lastAppointmentDate: appt.date || '',
          lastAppointmentTime: appt.time || '',
          lastAppointmentStatus: appt.status || '',
          reason: appt.reason || '',
        });
      }
    }

    res.json({
      summary: {
        totalAppointments: appointments.length,
        pendingAppointments,
        approvedAppointments,
        rejectedAppointments,
        completedAppointments,
        totalConsultations,
        totalPatients: uniquePatients.size,
      },
      latestPatients,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getDoctorDashboardInsights };
