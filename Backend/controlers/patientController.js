const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

const ACTIVE_APPOINTMENT_STATUSES = ['pending', 'approved'];
const APPOINTMENT_BUFFER_MINUTES = 60;

function parseAppointmentTime(value) {
  if (!value) return null;

  const trimmed = String(value).trim().toUpperCase();

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2]);
    const period = amPmMatch[3];

    if (period === 'AM') {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }

    return hours * 60 + minutes;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    return hours * 60 + minutes;
  }

  return null;
}

function normalizeAppointmentTime(value) {
  const minutes = parseAppointmentTime(value);
  if (minutes === null) return String(value).trim();

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function hasAppointmentOverlap(existingTime, requestedTime) {
  const existingMinutes = parseAppointmentTime(existingTime);
  const requestedMinutes = parseAppointmentTime(requestedTime);

  if (existingMinutes === null || requestedMinutes === null) return false;

  return Math.abs(existingMinutes - requestedMinutes) < APPOINTMENT_BUFFER_MINUTES;
}

// GET /api/patient/doctor/:doctorId/appointments — fetch a doctor's booked slots for validation
async function getDoctorBookedSlots(req, res) {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor is required' });
    }

    const doctorUser = await User.findOne({ _id: doctorId, role: 'doctor' }).select('_id fullName');
    if (!doctorUser) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    }).select('date time status');

    res.json({ doctor: doctorUser, appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/patient/appointment — book an appointment
async function bookAppointment(req, res) {
  try {
    const { doctor, date, time, type, reason, notes } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({ message: 'Doctor, date and time are required' });
    }

    // Verify the doctor exists
    const doctorUser = await User.findOne({ _id: doctor, role: 'doctor' });
    if (!doctorUser) return res.status(404).json({ message: 'Doctor not found' });

    const normalizedDate = String(date).trim();
    const normalizedTime = normalizeAppointmentTime(time);

    if (parseAppointmentTime(normalizedTime) === null) {
      return res.status(400).json({ message: 'Invalid appointment time' });
    }

    // Prevent any patient from booking within 1 hour of an existing appointment for the same doctor
    const existingAppointments = await Appointment.find({
      doctor,
      date: normalizedDate,
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    }).select('patient time');

    const conflictingAppointment = existingAppointments.find((appointment) =>
      hasAppointmentOverlap(appointment.time, normalizedTime)
    );

    if (conflictingAppointment) {
      return res.status(409).json({
        message: 'This doctor already has an appointment within 1 hour of the selected time. Please choose another slot.',
      });
    }

    const appointment = new Appointment({
      patient: req.user.id,
      doctor,
      date: normalizedDate,
      time: normalizedTime,
      type: type || 'online',
      reason: reason || '',
      notes: notes || '',
      fee: doctorUser.chargesPerSession || 0,
    });

    await appointment.save();

    // Auto-create notification for the doctor
    const patientUser = await User.findById(req.user.id);
    const patientName = patientUser?.fullName || 'A patient';
    await Notification.create({
      recipient: doctor,
      type: 'booking',
      title: 'New Appointment Request',
      message: `${patientName} has requested an appointment on ${date} at ${time}`,
      relatedAppointment: appointment._id,
      relatedUser: req.user.id,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'fullName specialty city chargesPerSession')
      .populate('patient', 'fullName email phone');

    res.status(201).json({ message: 'Appointment booked successfully', appointment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/patient/appointments — get all appointments of the logged-in patient
async function getMyAppointments(req, res) {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'fullName specialty city chargesPerSession')
      .sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/patient/appointment/:id/cancel — patient cancels own appointment
async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/patient/profile — fetch logged-in patient's profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/patient/profile — update logged-in patient's profile
async function updateProfile(req, res) {
  try {
    const { fullName, age, gender, phone, medicalHistory } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, age, gender, phone, medicalHistory },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/patient/feedback — submit a feedback/review for a doctor
async function submitFeedback(req, res) {
  try {
    const { rating, message, reviewOn } = req.body;

    if (!rating || !reviewOn) {
      return res.status(400).json({ message: 'Rating and doctor are required' });
    }

    // Verify the doctor exists
    const doctor = await User.findOne({ _id: reviewOn, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const feedback = new Feedback({
      rating,
      totalRating: 5,
      message: message || '',
      reviewBy: req.user.id,
      reviewOn,
    });

    await feedback.save();

    // Populate the saved feedback before returning
    const populated = await Feedback.findById(feedback._id)
      .populate('reviewBy', 'fullName')
      .populate('reviewOn', 'fullName specialty');

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/patient/feedback — get all feedback submitted by the logged-in patient
async function getMyFeedbacks(req, res) {
  try {
    const feedbacks = await Feedback.find({ reviewBy: req.user.id })
      .populate('reviewOn', 'fullName specialty')
      .sort({ createdAt: -1 });

    res.json({ feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/patient/prescriptions — get all prescriptions for the logged-in patient
async function getMyPrescriptions(req, res) {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'fullName specialty qualifications phone city')
      .populate('appointment', 'date time type')
      .sort({ createdAt: -1 });

    // Mark as viewed
    await Prescription.updateMany(
      { patient: req.user.id, status: 'sent' },
      { status: 'viewed' }
    );

    res.json({ prescriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, submitFeedback, getMyFeedbacks, getDoctorBookedSlots, bookAppointment, getMyAppointments, cancelAppointment, getMyPrescriptions };
