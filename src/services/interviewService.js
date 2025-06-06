import api from './api';

const interviewService = {
  getInterviewerInterviews: async (interviewerId) => {
    const response = await api.get(`/interviews/interviewer/${interviewerId}`);
    return response.data;
  },

  getCandidateInterviews: async (candidateId) => {
    const response = await api.get(`/interviews/candidate/${candidateId}`);
    return response.data;
  },

  getInterviewDetails: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  updateInterviewStatus: async (interviewId, data) => {
    const response = await api.put(`/interviews/${interviewId}/result`, data);
    return response.data;
  }
};

export default interviewService; 