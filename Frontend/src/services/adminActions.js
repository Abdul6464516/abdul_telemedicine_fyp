import  api  from './apiClient';


export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error.response?.data || { message: 'Failed to fetch admin profile' };
  }
};


export const updateAdminProfile = async (profileData) => {
  try {
    const response = await api.put('/admin/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error.response?.data || { message: 'Failed to update admin profile' };
  }
};


export const getAllAdmins = async () => {
  try {
    const response = await api.get('/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error.response?.data || { message: 'Failed to fetch admins' };
  }
};

export const getAdminOverviewInsights = async () => {
  try {
    const response = await api.get('/admin/overview-insights');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin overview insights:', error);
    throw error.response?.data || { message: 'Failed to fetch admin overview insights' };
  }
};

export const getAdminById = async (adminId) => {
  try {
    const response = await api.get(`/admin/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error.response?.data || { message: 'Failed to fetch admin' };
  }
};


export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/admin/create', adminData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error.response?.data || { message: 'Failed to create admin' };
  }
};


export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/admin/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error.response?.data || { message: 'Failed to delete admin' };
  }
};


// Get all pending doctors for verification
export const getPendingDoctors = async () => {
  try {
    const response = await api.get('/admin/verification/pending-doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    throw error.response?.data || { message: 'Failed to fetch pending doctors' };
  }
};


// Get all pending patients for verification
export const getPendingPatients = async () => {
  try {
    const response = await api.get('/admin/verification/pending-patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending patients:', error);
    throw error.response?.data || { message: 'Failed to fetch pending patients' };
  }
};


// Verify a doctor or patient
export const verifyUser = async (userId) => {
  try {
    const response = await api.put(`/admin/verification/verify/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error.response?.data || { message: 'Failed to verify user' };
  }
};


// Reject a doctor or patient
export const rejectUser = async (userId, reason = '') => {
  try {
    const response = await api.put(`/admin/verification/reject/${userId}`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error.response?.data || { message: 'Failed to reject user' };
  }
};


// Get all doctors with all verification statuses
export const getAllDoctors = async () => {
  try {
    const response = await api.get('/admin/verification/all-doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    throw error.response?.data || { message: 'Failed to fetch all doctors' };
  }
};


// Get all patients with all verification statuses
export const getAllPatients = async () => {
  try {
    const response = await api.get('/admin/verification/all-patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching all patients:', error);
    throw error.response?.data || { message: 'Failed to fetch all patients' };
  }
};


// ========== SYSTEM MONITORING FUNCTIONS ==========

// Get system monitoring statistics
export const getSystemMonitoring = async () => {
  try {
    const response = await api.get('/admin/monitoring/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching system monitoring stats:', error);
    throw error.response?.data || { message: 'Failed to fetch system monitoring statistics' };
  }
};


// Get recent activity feed
export const getRecentActivity = async () => {
  try {
    const response = await api.get('/admin/monitoring/activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error.response?.data || { message: 'Failed to fetch recent activity' };
  }
};


// Get latest feedback
export const getLatestFeedback = async (limit = 10) => {
  try {
    const response = await api.get(`/admin/monitoring/feedback?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest feedback:', error);
    throw error.response?.data || { message: 'Failed to fetch latest feedback' };
  }
};


// ========== ANALYTICS FUNCTIONS ==========

// Get top performing doctors
export const getTopDoctors = async () => {
  try {
    const response = await api.get('/admin/analytics/top-doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    throw error.response?.data || { message: 'Failed to fetch top doctors' };
  }
};


// Get KPI metrics (total consultations, new registrations, trends)
export const getKPIMetrics = async () => {
  try {
    const response = await api.get('/admin/analytics/kpi-metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    throw error.response?.data || { message: 'Failed to fetch KPI metrics' };
  }
};


// Get engagement metrics (patient retention, app usage, consultation completion)
export const getEngagementMetrics = async () => {
  try {
    const response = await api.get('/admin/analytics/engagement');
    return response.data;
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    throw error.response?.data || { message: 'Failed to fetch engagement metrics' };
  }
};


// Get consultation trend (monthly data for 6 months)
export const getConsultationTrend = async () => {
  try {
    const response = await api.get('/admin/analytics/consultation-trend');
    return response.data;
  } catch (error) {
    console.error('Error fetching consultation trend:', error);
    throw error.response?.data || { message: 'Failed to fetch consultation trend' };
  }
};

// ============ SECURITY & PRIVACY ACTIONS ============

// Get security logs
export const getSecurityLogs = async () => {
  try {
    const response = await api.get('/admin/security/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching security logs:', error);
    throw error.response?.data || { message: 'Failed to fetch security logs' };
  }
};

// Get patient data access records
export const getPatientDataAccess = async () => {
  try {
    const response = await api.get('/admin/security/patient-access');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient data access:', error);
    throw error.response?.data || { message: 'Failed to fetch patient data access' };
  }
};

// Get consultation encryption status
export const getConsultationEncryption = async () => {
  try {
    const response = await api.get('/admin/security/consultation-encryption');
    return response.data;
  } catch (error) {
    console.error('Error fetching consultation encryption:', error);
    throw error.response?.data || { message: 'Failed to fetch consultation encryption' };
  }
};

// Get data retention policies
export const getDataRetentionPolicies = async () => {
  try {
    const response = await api.get('/admin/security/retention-policies');
    return response.data;
  } catch (error) {
    console.error('Error fetching data retention policies:', error);
    throw error.response?.data || { message: 'Failed to fetch data retention policies' };
  }
};

// Get pending data deletion requests
export const getPendingDeletions = async () => {
  try {
    const response = await api.get('/admin/security/pending-deletions');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending deletions:', error);
    throw error.response?.data || { message: 'Failed to fetch pending deletions' };
  }
};

// Get staff confidentiality compliance
export const getStaffCompliance = async () => {
  try {
    const response = await api.get('/admin/security/staff-compliance');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff compliance:', error);
    throw error.response?.data || { message: 'Failed to fetch staff compliance' };
  }
};

// Get patient consent records
export const getPatientConsent = async () => {
  try {
    const response = await api.get('/admin/security/patient-consent');
    return response.data;
  } catch (error) {
    console.error('Error fetching patient consent:', error);
    throw error.response?.data || { message: 'Failed to fetch patient consent' };
  }
};

// Approve data deletion request
export const approveDeletion = async (deletionId) => {
  try {
    const response = await api.put(`/admin/security/approve-deletion/${deletionId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving deletion:', error);
    throw error.response?.data || { message: 'Failed to approve deletion' };
  }
};
