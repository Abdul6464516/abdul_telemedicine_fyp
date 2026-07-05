import api from './apiClient';

export async function getPatientProfile() {
  try {
    const res = await api.get('/patient/profile');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch profile';
    throw new Error(msg);
  }
}

export async function updatePatientProfile(profileData) {
  try {
    const res = await api.put('/patient/profile', profileData);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to update profile';
    throw new Error(msg);
  }
}

// Submit feedback for a doctor
export async function submitFeedback({ rating, message, reviewOn }) {
  try {
    const res = await api.post('/patient/feedback', { rating, message, reviewOn });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to submit feedback';
    throw new Error(msg);
  }
}

// Get all feedbacks submitted by the logged-in patient
export async function getMyFeedbacks() {
  try {
    const res = await api.get('/patient/feedback');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch feedbacks';
    throw new Error(msg);
  }
}

// Fetch active booked slots for a doctor so the UI can validate availability
export async function getDoctorBookedSlots(doctorId) {
  try {
    const res = await api.get(`/patient/doctor/${doctorId}/appointments`);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch doctor appointments';
    throw new Error(msg);
  }
}

// Book an appointment with a doctor
export async function bookAppointment({ doctor, date, time, type, reason, notes }) {
  try {
    const res = await api.post('/patient/appointment', { doctor, date, time, type, reason, notes });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to book appointment';
    throw new Error(msg);
  }
}

// Get all appointments of the logged-in patient
export async function getMyAppointments() {
  try {
    const res = await api.get('/patient/appointments');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch appointments';
    throw new Error(msg);
  }
}

// Cancel an appointment
export async function cancelAppointment(appointmentId) {
  try {
    const res = await api.put(`/patient/appointment/${appointmentId}/cancel`);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to cancel appointment';
    throw new Error(msg);
  }
}

// Get all prescriptions for the logged-in patient
export async function getMyPrescriptions() {
  try {
    const res = await api.get('/patient/prescriptions');
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to fetch prescriptions';
    throw new Error(msg);
  }
}
