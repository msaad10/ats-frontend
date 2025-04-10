import axios from 'axios';
import { API_BASE_URL } from '../config';

export const createFeedback = async (feedbackData) => {
  const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData);
  return response.data;
};

export const getCandidateFeedback = async (candidateId) => {
  const response = await axios.get(`${API_BASE_URL}/feedback/candidate/${candidateId}`);
  return response.data;
}; 