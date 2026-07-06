import api from './apiClient';

// Fetch all doctors with optional filters
export async function fetchDoctors({ search, specialty, availability, city } = {}) {
  try {
    const params = {};
    if (search) params.search = search;
    if (specialty && specialty !== 'All') params.specialty = specialty;
    if (availability && availability !== 'All') params.availability = availability;
    if (city && city !== 'All') params.city = city;

    const res = await api.get('/doctor/list', { params });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch doctors';
    throw new Error(msg);
  }
}

// Fetch aggregated average ratings for all doctors
export async function fetchDoctorRatings() {
  try {
    const res = await api.get('/doctor/ratings');
    return res.data; // { ratings: { doctorId: { avgRating, totalReviews } } }
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch ratings';
    throw new Error(msg);
  }
}

// Fetch logged-in doctor's own profile
export async function getDoctorProfile() {
  try {
    const res = await api.get('/doctor/profile');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch profile';
    throw new Error(msg);
  }
}

// Update logged-in doctor's profile
export async function updateDoctorProfile(profileData) {
  try {
    const res = await api.put('/doctor/profile', profileData);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to update profile';
    throw new Error(msg);
  }
}

// Fetch all appointments for the logged-in doctor
export async function getDoctorAppointments() {
  try {
    const res = await api.get('/doctor/appointments');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch appointments';
    throw new Error(msg);
  }
}

// Fetch smart dashboard insights for the logged-in doctor
export async function getDoctorDashboardInsights() {
  try {
    const res = await api.get('/doctor/insights');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch dashboard insights';
    throw new Error(msg);
  }
}

// Approve an appointment
export async function approveAppointment(appointmentId, remarks = '') {
  try {
    const res = await api.put(`/doctor/appointment/${appointmentId}/approve`, { remarks });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to approve appointment';
    throw new Error(msg);
  }
}

// Cancel/reject an appointment
export async function cancelAppointmentByDoctor(appointmentId, remarks = '') {
  try {
    const res = await api.put(`/doctor/appointment/${appointmentId}/cancel`, { remarks });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to cancel appointment';
    throw new Error(msg);
  }
}

// Fetch patients whose consultation was completed with this doctor
export async function getCompletedPatients() {
  try {
    const res = await api.get('/doctor/completed-patients');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch patients';
    throw new Error(msg);
  }
}

// Create a prescription
export async function createPrescription(prescriptionData) {
  try {
    const res = await api.post('/doctor/prescription', prescriptionData);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to create prescription';
    throw new Error(msg);
  }
}

// Get all prescriptions created by the doctor
export async function getDoctorPrescriptions() {
  try {
    const res = await api.get('/doctor/prescriptions');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch prescriptions';
    throw new Error(msg);
  }
}

// Get single prescription by ID
export async function getPrescriptionById(id) {
  try {
    const res = await api.get(`/doctor/prescription/${id}`);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch prescription';
    throw new Error(msg);
  }
}

// Fetch full medical history for a patient with this doctor
export async function getPatientHistory(patientId) {
  try {
    const res = await api.get(`/doctor/patient/${patientId}/history`);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch patient history';
    throw new Error(msg);
  }
}

// ─── Notification APIs ────────────────────────────────────────

// Fetch all notifications for the logged-in doctor
export async function getNotifications() {
  try {
    const res = await api.get('/doctor/notifications');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch notifications';
    throw new Error(msg);
  }
}

// Fetch unread notification count
export async function getUnreadCount() {
  try {
    const res = await api.get('/doctor/notifications/unread-count');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch unread count';
    throw new Error(msg);
  }
}

// Mark a single notification as read
export async function markNotificationRead(notificationId) {
  try {
    const res = await api.put(`/doctor/notifications/${notificationId}/read`);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to mark notification';
    throw new Error(msg);
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  try {
    const res = await api.put('/doctor/notifications/read-all');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to mark all notifications';
    throw new Error(msg);
  }
}
