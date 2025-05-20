import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get all review topics
// Chấp nhận optional reviewerId để lọc
export const getReviewTopics = async (reviewerId) => {
  try {
    const url = reviewerId ? `${API_URL}/topics/review?reviewerId=${reviewerId}` : `${API_URL}/topics/review`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getReviewTopics service:', error); // Thêm log ở service
    throw error;
  }
};

// Get all committee topics
// Chấp nhận optional committeeId để lọc
export const getCommitteeTopics = async (committeeId) => {
  try {
    const url = committeeId ? `${API_URL}/topics/committee?committeeId=${committeeId}` : `${API_URL}/topics/committee`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getCommitteeTopics service during API call:', error);
    throw error;
  }
};

// Get review topic by ID
export const getReviewTopicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/topics/review/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getReviewTopicById service:', error); // Thêm log ở service
    throw error;
  }
};

// Get committee topic by ID
export const getCommitteeTopicById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/topics/committee/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getCommitteeTopicById service:', error); // Thêm log ở service
    throw error;
  }
}; 