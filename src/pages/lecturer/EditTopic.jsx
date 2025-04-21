import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getTopicById } from '../../data/mockThesisData'; // Import hàm lấy chi tiết đề tài
import { FaPlus, FaMinus, FaUserPlus, FaSave, FaTrash, FaPaperPlane } from 'react-icons/fa';

const EditTopic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    const loadTopic = async () => {
      const data = await getTopicById(id);
      setTopic(data);
    };
    loadTopic();
  }, [id]);

  const handleClose = () => {
    navigate('/lecturer/topics');
  };

  if (!topic) {
    return null;
  }

  return (
    <Modal
      title="Chi tiết đề tài"
      open={true}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="xoa" danger>Xóa</Button>,
        <Button key="guidangky" type="primary" className="bg-green-500">Gửi đăng ký</Button>,
        <Button key="capnhat" type="primary" className="bg-blue-500">Cập nhật đề tài</Button>,
      ]}
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Tên đề tài</div>
          <div className="text-base">{topic.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Chuyên ngành</div>
            <div className="text-base">{topic.major}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Loại đề tài</div>
            <div className="text-base">{topic.type}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Mô tả đề tài</div>
          <div className="text-base whitespace-pre-line border rounded-md p-4 bg-gray-50 min-h-[100px]">
            {topic.description || `1. Tính cấp thiết của đề tài
- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?
+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung
+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề
- Các nghiên cứu đã được thực hiện trước đó từ đó chỉ ra điểm mới của đề tài, vấn đề mà nhóm lựa chọn.
- Trọng số trong bài nghiên cứu: Luận giải rõ ràng tính cấp thiết của vấn đề nghiên cứu: 10%`}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Sinh viên thực hiện</div>
          <div className="text-base">
            {topic.selectedStudents?.length > 0 ? (
              <ul>
                {topic.selectedStudents.map(student => (
                  <li key={student.id}>{student.name}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Chưa có sinh viên thực hiện</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditTopic; 