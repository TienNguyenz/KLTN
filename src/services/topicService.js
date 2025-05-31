import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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