import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ProposedTopics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/topics/instructor/${user?.id}/proposals`);
        setProposals(response.data);
      } catch (err) {
        console.error("Error fetching proposed topics:", err);
        setError('Lỗi khi tải danh sách đề xuất.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, [user?.id]);

  const handleViewDetails = (proposalId) => {
    navigate(`/lecturer/proposed-topics/${proposalId}`);
  };

  const handleApprove = async (proposalId, topicName) => {
    if (window.confirm(`Bạn có chắc chắn muốn duyệt đề tài "${topicName}"?`)) {
      try {
        await axios.put(`/api/topics/${proposalId}/approve`);
        alert(`Đã duyệt đề tài "${topicName}"!`);
        setProposals(prev => prev.filter(p => p._id !== proposalId));
      } catch (error) {
        console.error('Error approving topic:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt đề tài!');
      }
    }
  };

  const handleReject = async (proposalId, topicName) => {
    if (window.confirm(`Bạn có chắc chắn muốn từ chối đề tài "${topicName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `/api/topics/${proposalId}/reject-by-lecturer`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        alert(`Đã từ chối đề tài "${topicName}"!`);
        setProposals(prev => prev.filter(p => p._id !== proposalId));
      } catch (error) {
        console.error('Error rejecting topic:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đề tài!');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Đề Tài Sinh Viên Đề Xuất</h1>

      {isLoading && <div className="text-center py-4">Đang tải danh sách...</div>}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}

      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {proposals.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Không có đề tài nào do sinh viên đề xuất đang chờ duyệt.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề tài đề xuất</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên đề xuất</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đề xuất</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-normal font-medium text-gray-900">{proposal.topic_title}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {proposal.topic_group_student[0]?.user_name} ({proposal.topic_group_student[0]?.user_id})
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {new Date(proposal.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleViewDetails(proposal._id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100" 
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleApprove(proposal._id, proposal.topic_title)}
                           className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100" 
                           title="Duyệt"
                        >
                          <FaCheck />
                        </button>
                        <button 
                          onClick={() => handleReject(proposal._id, proposal.topic_title)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100" 
                          title="Từ chối"
                        >
                           <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposedTopics; 