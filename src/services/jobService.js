import api from './api';

const jobService = {
  // Get all jobs
  getAllJobs: async () => {
    try {
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get job by ID
  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new job
  createJob: async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a job
  updateJob: async (id, jobData) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a job
  deleteJob: async (id) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for a job
  applyForJob: async (jobId) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get applications for a job
  getJobApplications: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search jobs
  searchJobs: async (filters) => {
    try {
      const response = await api.get('/jobs/search', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get jobs by company
  getJobsByCompany: async (companyId) => {
    try {
      const response = await api.get(`/jobs/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's applications
  getUserApplications: async () => {
    try {
      const response = await api.get('/jobs/applications');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default jobService; 