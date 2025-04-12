import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopicsWithPendingGroups } from '../../data/mockThesisData';
import { FaChevronRight } from 'react-icons/fa';

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
        setError('Lỗi khi tải danh sách đề tài cần duyệt.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-gray-100 min-h-full">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Duyệt Nhóm Thực Hiện</h1>

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
                    to={`/lecturer/topics/${topic.id}/approve`} 
                    className="block px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{topic.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                         <FaChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-xs text-gray-500">
                          {/* Có thể thêm số lượng nhóm chờ duyệt ở đây */}
                          {topic.type} - {topic.semester}
                        </p>
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