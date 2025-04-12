import api from './api';

const candidateService = {
  // Get all candidates
  getAllCandidates: async () => {
    try {
      const response = await api.get('/candidates');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate by ID
  getCandidateById: async (id) => {
    try {
      const response = await api.get(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadResume: async (formData) => {
    return api.post('/candidates/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get candidate's resume
  getResume: async (userId) => {
    try {
      const response = await api.get(`/candidates/${userId}/resume`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all interviewers
  getInterviewers: async () => {
    try {
      const response = await api.get('/candidates/interviewers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Schedule an interview
  scheduleInterview: async (interviewData) => {
    try {
      const response = await api.post('/candidates/interviews', interviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get interviews for a candidate
  getCandidateInterviews: async (candidateId) => {
    try {
      const response = await api.get(`/interviews/job-candidate/${candidateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update interview status
  updateInterviewStatus: async (interviewId, status) => {
    try {
      const response = await api.put(`/candidates/interviews/${interviewId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add interview feedback
  addInterviewFeedback: async (interviewId, feedback) => {
    try {
      const response = await api.post(`/candidates/interviews/${interviewId}/feedback`, { feedback });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAppliedJobs: async (userId) => {
    try {
      const response = await api.get(`/job-candidates/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  applyForJob: async (applicationData) => {
    try {
      const response = await api.post('/job-candidates/apply', {
        jobId: applicationData.jobId,
        userId: applicationData.userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getJobCandidates: async (jobId) => {
    try {
      const response = await api.get(`/job-candidates/job/${jobId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default candidateService; 