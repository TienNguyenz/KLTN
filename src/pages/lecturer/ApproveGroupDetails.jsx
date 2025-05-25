import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopicById, getRegisteredGroupsForTopic } from '../../data/mockThesisData';
import { FaUsers, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaEnvelope } from 'react-icons/fa';

const ApproveGroupDetails = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageModal, setMessageModal] = useState({ isOpen: false, groupId: null, message: '' });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [topicData, groupData] = await Promise.all([
          getTopicById(topicId),
          getRegisteredGroupsForTopic(topicId)
        ]);

        if (!topicData) {
          setError('Không tìm thấy đề tài.');
          setTopic(null);
          setGroups([]);
        } else {
          setTopic(topicData);
          setGroups(groupData);
        }
      } catch (err) {
        console.error("Error fetching topic/group details:", err);
        setError('Lỗi khi tải dữ liệu.');
        setTopic(null);
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  const handleApprove = () => {
    if (!selectedGroupId) {
      alert('Vui lòng chọn một nhóm để duyệt.');
      return;
    }
    // Mock approval logic
    console.log(`Approving group ${selectedGroupId} for topic ${topicId}`);
    alert(`Đã duyệt nhóm ${selectedGroupId} thành công!`);
    navigate('/lecturer/approve-groups');
  };

  const handleViewInfo = (groupId) => {
    const group = groups.find(g => g.groupId === groupId);
    if (!group) return;

    const memberDetails = group.members.map(m => `${m.name} (${m.mssv})`).join('\n');
    alert(`Thông tin nhóm ${groupId}:\n\nThành viên:\n${memberDetails}`);
  };

  const handleSendMessage = (groupId) => {
    setMessageModal({ isOpen: true, groupId, message: '' });
  };

  const handleSubmitMessage = () => {
    if (!messageModal.message.trim()) {
      alert('Vui lòng nhập nội dung tin nhắn.');
      return;
    }
    // Mock sending message
    console.log(`Sending message to group ${messageModal.groupId}: ${messageModal.message}`);
    alert('Đã gửi tin nhắn thành công!');
    setMessageModal({ isOpen: false, groupId: null, message: '' });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Đang tải chi tiết duyệt nhóm...</div>;
  }

  if (error) {
     return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!topic) {
     return <div className="p-8 text-center">Không thể tải thông tin đề tài.</div>;
  }

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Chi Tiết Đề Tài & Duyệt Nhóm</h1>

      {/* Topic Details Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Thông tin đề tài</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Tên đề tài:</span>
            <p className="text-gray-900">{topic.topic_title}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Tối đa sinh viên:</span>
            <p className="text-gray-900">{topic.topic_max_members || topic.studentCount || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-500">Chuyên ngành:</span>
            <p className="text-gray-900">{topic.topic_major?.major_title || 'N/A'}</p> 
          </div>
           <div className="md:col-span-1">
             <span className="font-medium text-gray-500">Loại đề tài:</span>
             <p className="text-gray-900">{topic.topic_category?.topic_category_title}</p>
           </div>
           <div className="md:col-span-2">
            <span className="font-medium text-gray-500">Mô tả:</span>
            <p className="text-gray-900 whitespace-pre-wrap">{topic.topic_description}</p>
          </div>
        </div>
      </div>

      {/* Registered Groups Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Nhóm đăng ký</h2>
              {groups.length > 0 && (
                 <button 
                    onClick={handleApprove}
                    disabled={!selectedGroupId} 
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!selectedGroupId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                 >
                    <FaCheckCircle className="mr-2 -ml-1 h-5 w-5" />
                    Duyệt nhóm thực hiện
                 </button>
              )}
          </div>
          
           {groups.length === 0 ? (
             <p className="text-gray-500 text-center py-4">Chưa có nhóm nào đăng ký đề tài này.</p>
           ) : (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groups.map((group, index) => (
                            <tr key={group.groupId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-center">
                                    <input 
                                        type="radio" 
                                        name="selectedGroup"
                                        value={group.groupId}
                                        checked={selectedGroupId === group.groupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-medium">{index + 1}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{group.members.length}</td>
                                <td className="px-4 py-3 whitespace-normal text-gray-600">
                                    {group.members.map(member => (
                                        <div key={member.id}>{member.name} ({member.mssv})</div>
                                    ))}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleViewInfo(group.groupId)} 
                          className="text-blue-600 hover:text-blue-900 p-1" 
                          title="Xem chi tiết"
                        >
                                        <FaInfoCircle className="h-5 w-5"/>
                                    </button>
                        <button 
                          onClick={() => handleSendMessage(group.groupId)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Gửi tin nhắn"
                        >
                          <FaEnvelope className="h-5 w-5"/>
                        </button>
                      </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
           )}
      </div>

      {/* Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Gửi tin nhắn cho nhóm</h3>
            <textarea
              className="w-full p-2 border rounded-md mb-4"
              rows="4"
              placeholder="Nhập nội dung tin nhắn..."
              value={messageModal.message}
              onChange={(e) => setMessageModal(prev => ({ ...prev, message: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setMessageModal({ isOpen: false, groupId: null, message: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveGroupDetails; 