import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopicsWithPendingGroups } from '../../data/mockThesisData';
import { FaChevronRight, FaUsers } from 'react-icons/fa';

const ApproveTopicList = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError('');
      try {
        const pendingTopics = await getTopicsWithPendingGroups();
        setTopics(pendingTopics);
      } catch (err) {
        console.error("Error fetching topics with pending groups:", err);
        setError('Lỗi khi tải danh sách đề tài cần duyệt nhóm.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Duyệt nhóm thực hiện</h1>

      {isLoading && <div className="text-center py-4">Đang tải danh sách...</div>}
      {error && <div className="text-center py-4 text-red-600">{error}</div>}
      
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {topics.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Không có đề tài nào cần duyệt nhóm.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {topics.map((topic) => (
                <li key={topic.id} className="hover:bg-gray-50">
                  <Link 
                    to={`/lecturer/approve-groups/${topic.id}`} 
                    className="block px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">{topic.name}</p>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {topic.type} - {topic.major}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaUsers className="mr-1" />
                          <span>{topic.pendingGroupsCount || 0} nhóm chờ duyệt</span>
                    </div>
                        <FaChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ApproveTopicList; 