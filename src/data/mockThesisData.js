// Dữ liệu giả lập về đề tài đã đăng ký của sinh viên
// Trong ứng dụng thực tế, dữ liệu này sẽ lấy từ API

const registeredTopics = {
  // Sinh viên có ID 'sv001' đã đăng ký đề tài này
  'sv001': {
    topicId: 'DT001',
    topic_title: 'Xây dựng phần mềm quản lý khối lượng giảng dạy của giảng viên khoa CNTT - Trường Đại học X',
    topic_instructor: 'ThS. Ngô Ngọc Đăng Khoa',
    topic_major: 'Công nghệ phần mềm',
    topic_category: 'Ứng dụng',
    topic_description: '1. Tính cấp thiết của đề tài... (rút gọn)',
    topic_max_members: 3,
    topic_group_student: [
      { id: 'sv001', name: 'Nguyễn Hồng Đức', mssv: '19110308' },
      { id: 'sv002', name: 'Ngô Đình Đại', mssv: '19110160' },
      { id: 'sv004', name: 'Nguyễn Văn Truyền', mssv: '19110306' },
    ],
    documents: {
      proposal: { name: null, url: null },
      defenseRequest: { name: null, url: null },
      finalReport: { name: null, url: null },
    },
    grades: {
      supervisorGrade: null,
      reviewerGrade: null,
      committeeGrade: null,
      finalGrade: null,
    }
  },
  // Sinh viên có ID 'sv003' chưa đăng ký đề tài nào
  'sv003': null, 
  // Thêm các sinh viên khác...
};

// Hàm để lấy thông tin đề tài của sinh viên
export const getStudentRegisteredTopic = (studentId) => {
  // Tìm xem sinh viên có trong nhóm nào đã đăng ký đề tài không
  for (const studentKey in registeredTopics) {
      const topic = registeredTopics[studentKey];
      if (topic && topic.topic_group_student) {
          for (const group of topic.topic_group_student) {
              if (group.id === studentId) {
                  // Trả về thông tin đề tài nếu sinh viên thuộc nhóm đã đăng ký
                  // (Trong ví dụ này, dữ liệu được lưu theo sv001 nên trả về của sv001)
                  // Thực tế bạn cần cấu trúc dữ liệu tốt hơn hoặc tìm theo topicId
                  return registeredTopics['sv001']; 
              }
          }
      }
  }
  // Nếu không tìm thấy, trả về null
  return registeredTopics[studentId] || null; 
}; 

// --- Dữ liệu giả lập cho Danh sách đề tài có sẵn ---
const availableTopics = [
  {
    id: 'AV001',
    name: 'Xây dựng Website bán sách trực tuyến tại Công ty sách Vạn Xuân',
    supervisor: 'Ngô Ngọc Đăng Khoa',
    major: 'Công nghệ phần mềm',
    type: 'Nghiên cứu',
    maxStudents: 2,
    isAvailable: true, 
    studentCount: 1, // Số SV đã đăng ký (ví dụ)
    lecturerStatus: 'READY', // Trạng thái duyệt của Giảng viên
    adminStatus: 'ACTIVE', // Trạng thái duyệt của Giáo vụ
  },
  {
    id: 'AV002',
    name: 'Xây dựng CSDL và công cụ quản lý khách sạn phục vụ cho công ty du lịch',
    supervisor: 'Ngô Ngọc Đăng Khoa',
    major: 'Công nghệ phần mềm',
    type: 'Ứng dụng',
    maxStudents: 2,
    isAvailable: false, 
    studentCount: 0,
    lecturerStatus: 'READY', 
    adminStatus: 'READY', 
  },
  {
    id: 'AV003',
    name: 'App nghe nhạc trực tuyến',
    supervisor: 'Ngô Ngọc Đăng Khoa',
    major: 'Công nghệ phần mềm',
    type: 'Nghiên cứu',
    maxStudents: 3,
    isAvailable: true,
    studentCount: 3,
    lecturerStatus: 'REGISTERED', 
    adminStatus: 'PENDING', 
  },
  {
    id: 'AV004',
    name: 'Phân tích thiết kế hệ thống quản lý thư viện',
    supervisor: 'Trần Văn B',
    major: 'Hệ thống thông tin',
    type: 'Phân tích thiết kế',
    maxStudents: 2,
    isAvailable: true,
  },
  // Thêm các đề tài khác...
];

// Hàm lấy danh sách đề tài (sau này có thể thêm filter, sort, pagination)
export const getAvailableTopics = () => {
  return availableTopics;
}; 

// Hàm lấy chi tiết một đề tài có sẵn theo ID
export const getAvailableTopicById = (topicId) => {
  return availableTopics.find(topic => topic.id === topicId) || null;
};

// --- Dữ liệu cho Form Đề xuất ---
export const mockLecturers = [
  { id: 'gv001', name: 'Ngô Ngọc Đăng Khoa' },
  { id: 'gv002', name: 'Trần Văn B' },
  { id: 'gv003', name: 'Lê Thị C' },
];

export const mockMajors = [
  { id: 'CNPM', name: 'Công nghệ phần mềm' },
  { id: 'HTTT', name: 'Hệ thống thông tin' },
  { id: 'KHMT', name: 'Khoa học máy tính' },
];

export const mockTopicTypes = [
  { id: 'NC', name: 'Nghiên cứu' },
  { id: 'UD', name: 'Ứng dụng' },
  { id: 'PTTK', name: 'Phân tích thiết kế' },
];

export const mockStudents = [
  { id: 'sv001', name: 'Nguyễn Văn Sinh Viên', mssv: '19110301' },
  { id: 'sv002', name: 'Phạm Thị Sinh Viên 2', mssv: '19110302' },
  { id: 'sv003', name: 'Lý Văn Sinh Viên 3', mssv: '19110303' },
  { id: 'sv004', name: 'Hoàng Thị Sinh Viên 4', mssv: '19110304' },
]; 

// Mock data for registered groups (example)
const mockRegisteredGroups = {
  'AV001': [ // Topic ID
    {
      groupId: 'G001',
      members: [mockStudents[0]], // Nguyễn Văn Sinh Viên
      status: 'pending',
    },
  ],
  'AV003': [ // Topic ID
    {
      groupId: 'G002',
      members: [mockStudents[1], mockStudents[2], mockStudents[3]], // Trần Thị SV 2, Lê Văn SV 3, Hoàng Thị SV 4
      status: 'pending',
    },
     {
      groupId: 'G003',
      members: [mockStudents[0]], // Group khác cũng đăng ký AV003
      status: 'pending',
    },
  ],
  'AV002': [], // No pending groups for this topic
};

// Mock function to get registered groups for a specific topic
export const getRegisteredGroupsForTopic = (topicId) => {
  console.log(`Mock fetching registered groups for topic ID: ${topicId}`);
  const groups = mockRegisteredGroups[topicId] || [];
  // Simulate API delay
  return new Promise(resolve => setTimeout(() => resolve(groups.filter(g => g.status === 'pending')), 100)); // Only return pending groups
};

// Mock function to get topics that have pending groups
export const getTopicsWithPendingGroups = () => {
   console.log("Mock fetching topics with pending groups");
   const topicIdsWithPendingGroups = Object.keys(mockRegisteredGroups).filter(topicId => 
       mockRegisteredGroups[topicId].some(group => group.status === 'pending')
   );
   const topics = availableTopics.filter(topic => topicIdsWithPendingGroups.includes(topic.id));
   // Simulate API delay
   return new Promise(resolve => setTimeout(() => resolve(topics), 120));
};

// Mock function to get topic by ID
export const getTopicById = (id) => {
  console.log(`Mock fetching topic with ID: ${id}`);
  const topic = availableTopics.find(t => t.id === id);
  if (!topic) {
    console.error(`Mock topic with ID ${id} not found.`);
    return Promise.resolve(null);
  }

  // Thêm thông tin chi tiết cho đề tài
  const detailedTopic = {
    ...topic,
    description: `1. Tính cấp thiết của đề tài
- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?
+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung
+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề
- Các nghiên cứu đã được thực hiện trước đó từ đó chỉ ra điểm mới của đề tài, vấn đề mà nhóm lựa chọn.
- Trọng số trong bài nghiên cứu: Luận giải rõ ràng tính cấp thiết của vấn đề nghiên cứu: 10%`,
    reviewer: 'TS. Trần Văn B',
    documents: {
      proposal: {
        title: 'Đề cương chi tiết',
        status: 'Chưa nộp'
      },
      guide: {
        title: 'Tài liệu hướng dẫn',
        status: 'Chưa nộp'
      },
      thesis: {
        title: 'Báo cáo tổng kết',
        status: 'Chưa nộp'
      }
    },
    groups: [
      {
        id: 'G001',
        studentName: 'Nguyễn Văn A',
        studentId: '19110001'
      },
      {
        id: 'G002',
        studentName: 'Trần Thị B',
        studentId: '19110002'
      }
    ]
  };

  return new Promise(resolve => setTimeout(() => resolve(detailedTopic), 150));
}; 

// Mock data for student-proposed topics
const mockProposedTopics = [
  {
    proposalId: 'PROP001',
    topicName: 'Ứng dụng AI nhận diện giống mèo', 
    student: mockStudents[1], // Trần Thị Sinh Viên 2
    submissionDate: '2024-05-10',
    description: 'Xây dựng mô hình deep learning để phân loại các giống mèo phổ biến dựa trên hình ảnh.',
    goals: 'Đạt độ chính xác trên 90%.', 
    status: 'pending', // pending, approved, rejected
  },
  {
    proposalId: 'PROP002',
    topicName: 'Phân tích sentiment bình luận phim', 
    student: mockStudents[3], // Hoàng Thị Sinh Viên 4
    submissionDate: '2024-05-12',
    description: 'Sử dụng các kỹ thuật NLP để phân loại bình luận phim trên mạng xã hội thành tích cực, tiêu cực, trung tính.',
    goals: 'Xây dựng API cho phép phân tích sentiment.', 
    status: 'pending',
  },
   {
    proposalId: 'PROP003',
    topicName: 'Hệ thống gợi ý việc làm cho sinh viên IT', 
    student: mockStudents[0], // Nguyễn Văn Sinh Viên
    submissionDate: '2024-04-20',
    description: 'Dựa trên hồ sơ và kỹ năng của sinh viên.',
    goals: 'Gợi ý phù hợp.', 
    status: 'approved', // Example of an already approved one
  },
];

// Mock function to get pending proposed topics for the lecturer
export const getPendingProposedTopics = () => {
  console.log("Mock fetching pending student proposals");
  // In a real app, you might filter by lecturer ID
  const pendingProposals = mockProposedTopics.filter(p => p.status === 'pending');
  // Simulate API delay
  return new Promise(resolve => setTimeout(() => resolve(pendingProposals), 180));
};

// Mock function to get details of a specific proposal (optional, for detail view)
export const getProposedTopicDetails = (proposalId) => {
    console.log(`Mock fetching details for proposal ID: ${proposalId}`);
    const proposal = mockProposedTopics.find(p => p.proposalId === proposalId);
     if (!proposal) {
      console.error(`Mock proposal with ID ${proposalId} not found.`);
      return null;
  }
  return new Promise(resolve => setTimeout(() => resolve(proposal), 90));
};

// Mock data cho đề tài hướng dẫn
const mockSupervisedTopics = [
  {
    id: '1',
    title: 'Xây dựng phần mềm Quản lý khóa luận tốt nghiệp',
    supervisor: 'ThS. Ngô Ngọc Đăng Khoa',
    reviewer: 'Nguyễn Minh AAA',
    type: 'Ứng dụng',
    studentId: '1',
    lecturer: 'ThS. Ngô Ngọc Đăng Khoa',
    status: 'ACTIVE',
    description: `1. Tính cấp thiết của đề tài
- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?
+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung
+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề`,
    documents: {
      proposal: {
        title: 'Đề cương chi tiết',
        status: 'Đã nộp'
      },
      guide: {
        title: 'Tài liệu hướng dẫn',
        status: 'Chưa nộp'
      },
      thesis: {
        title: 'Báo cáo tổng kết',
        status: 'Chưa nộp'
      }
    },
    groups: [
      {
        id: 'G001',
        studentName: 'Nguyễn Văn A',
        studentId: '19110001'
      }
    ]
  },
  {
    id: '2',
    title: 'Nghiên cứu giải thuật Deep Learning',
    supervisor: 'TS. Nguyễn Văn A',
    reviewer: 'TS. Trần Văn B',
    type: 'Nghiên cứu',
    studentId: '2',
    lecturer: 'TS. Nguyễn Văn A',
    status: 'REGISTERED',
    description: `Nghiên cứu và ứng dụng các giải thuật Deep Learning hiện đại`,
    documents: {
      proposal: {
        title: 'Đề cương chi tiết',
        status: 'Chưa nộp'
      },
      guide: {
        title: 'Tài liệu hướng dẫn',
        status: 'Chưa nộp'
      },
      thesis: {
        title: 'Báo cáo tổng kết',
        status: 'Chưa nộp'
      }
    },
    groups: [
      {
        id: 'G002',
        studentName: 'Trần Thị B',
        studentId: '19110002'
      }
    ]
  }
];

// Hàm lấy danh sách đề tài hướng dẫn
export const getSupervisedTopics = () => {
  return mockSupervisedTopics;
};

// Hàm lấy chi tiết đề tài hướng dẫn theo ID
export const getSupervisedTopicById = (id) => {
  console.log(`Mock fetching supervised topic with ID: ${id}`);
  const topic = mockSupervisedTopics.find(t => t.id === id);
  if (!topic) {
    console.error(`Mock supervised topic with ID ${id} not found.`);
    return Promise.resolve(null);
  }
  return Promise.resolve(topic);
};

// Mock function to get review topics
export const getReviewTopics = () => {
  return availableTopics.map(topic => ({
    ...topic,
    id: topic.id,
    title: topic.name,
    supervisor: topic.supervisor || 'ThS. Ngô Ngọc Đăng Khoa',
    reviewer: 'TS. Trần Văn B',
    type: topic.type || 'Ứng dụng',
    studentId: topic.studentId || '19110001',
    lecturer: topic.lecturer || 'ThS. Ngô Ngọc Đăng Khoa',
    status: topic.status || 'ACTIVE'
  }));
};

// Mock function to get review topic by ID
export const getReviewTopicById = (id) => {
  console.log(`Mock fetching review topic with ID: ${id}`);
  const topic = availableTopics.find(t => t.id === id);
  if (!topic) {
    console.error(`Mock review topic with ID ${id} not found.`);
    return Promise.resolve(null);
  }

  // Thêm thông tin chi tiết cho đề tài
  const detailedTopic = {
    ...topic,
    description: `1. Tính cấp thiết của đề tài
- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?
+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung
+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề
- Các nghiên cứu đã được thực hiện trước đó từ đó chỉ ra điểm mới của đề tài, vấn đề mà nhóm lựa chọn.
- Trọng số trong bài nghiên cứu: Luận giải rõ ràng tính cấp thiết của vấn đề nghiên cứu: 10%`,
    supervisor: 'ThS. Ngô Ngọc Đăng Khoa',
    documents: {
      proposal: {
        title: 'Đề cương chi tiết',
        status: 'Chưa nộp'
      },
      guide: {
        title: 'Tài liệu hướng dẫn',
        status: 'Chưa nộp'
      },
      thesis: {
        title: 'Báo cáo tổng kết',
        status: 'Chưa nộp'
      }
    },
    groups: [
      {
        id: 'G001',
        studentName: 'Nguyễn Văn A',
        studentId: '19110001'
      },
      {
        id: 'G002',
        studentName: 'Trần Thị B',
        studentId: '19110002'
      }
    ]
  };

  return new Promise(resolve => setTimeout(() => resolve(detailedTopic), 150));
};

export const getCommitteeTopics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Xây dựng ứng dụng quản lý đồ án',
          supervisor: 'Nguyễn Văn A',
          reviewer: 'Trần Thị B',
          type: 'Khóa luận tốt nghiệp',
          studentId: '19120001',
          lecturer: 'Phạm Văn C',
          status: 'Đang chờ bảo vệ',
          description: 'Xây dựng ứng dụng web hỗ trợ quản lý đồ án, khóa luận tốt nghiệp cho khoa',
          documents: {
            outline: 'Đã nộp',
            guidance: 'Đã nộp',
            report: 'Chưa nộp'
          },
          groups: [
            {
              id: '1',
              studentName: 'Nguyễn Văn X',
              studentId: '19120001'
            }
          ]
        },
        {
          id: '2',
          title: 'Phát triển ứng dụng học máy cho bài toán phân loại văn bản',
          supervisor: 'Lê Thị D',
          reviewer: 'Hoàng Văn E',
          type: 'Khóa luận tốt nghiệp',
          studentId: '19120002',
          lecturer: 'Ngô Thị F',
          status: 'Đang chờ bảo vệ',
          description: 'Nghiên cứu và phát triển các mô hình học máy cho bài toán phân loại văn bản tiếng Việt',
          documents: {
            outline: 'Đã nộp',
            guidance: 'Đã nộp',
            report: 'Đã nộp'
          },
          groups: [
            {
              id: '2',
              studentName: 'Trần Thị Y',
              studentId: '19120002'
            }
          ]
        }
      ]);
    }, 150);
  });
};

export const getCommitteeTopicById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const topics = [
        {
          id: '1',
          name: 'Xây dựng ứng dụng quản lý đồ án',
          supervisor: 'Nguyễn Văn A',
          reviewer: 'Trần Thị B',
          type: 'Khóa luận tốt nghiệp',
          major: 'Công nghệ thông tin',
          maxStudents: 1,
          description: 'Xây dựng ứng dụng web hỗ trợ quản lý đồ án, khóa luận tốt nghiệp cho khoa. Ứng dụng sẽ giúp quản lý thông tin về đề tài, sinh viên, giảng viên và quy trình thực hiện đồ án một cách hiệu quả.',
          documents: {
            outline: 'Đã nộp',
            guidance: 'Đã nộp',
            report: 'Chưa nộp'
          },
          groups: [
            {
              id: '1',
              studentName: 'Nguyễn Văn X',
              studentId: '19120001'
            }
          ]
        },
        {
          id: '2',
          name: 'Phát triển ứng dụng học máy cho bài toán phân loại văn bản',
          supervisor: 'Lê Thị D',
          reviewer: 'Hoàng Văn E',
          type: 'Khóa luận tốt nghiệp',
          major: 'Công nghệ thông tin',
          maxStudents: 1,
          description: 'Nghiên cứu và phát triển các mô hình học máy cho bài toán phân loại văn bản tiếng Việt. Đề tài tập trung vào việc áp dụng các kỹ thuật xử lý ngôn ngữ tự nhiên và học sâu.',
          documents: {
            outline: 'Đã nộp',
            guidance: 'Đã nộp',
            report: 'Đã nộp'
          },
          groups: [
            {
              id: '2',
              studentName: 'Trần Thị Y',
              studentId: '19120002'
            }
          ]
        }
      ];

      const topic = topics.find(t => t.id === id);
      resolve(topic || null);
    }, 150);
  });
};

// Mock function to get all topics
export const getTopics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Xây dựng phần mềm Quản lý khóa luận tốt nghiệp',
          supervisor: 'ThS. Ngô Ngọc Đăng Khoa',
          reviewer: 'Nguyễn Minh AAA',
          type: 'Ứng dụng',
          studentId: '1',
          lecturer: 'ThS. Ngô Ngọc Đăng Khoa',
          status: 'ACTIVE'
        },
        {
          id: '2',
          title: 'Nghiên cứu giải thuật Deep Learning',
          supervisor: 'TS. Nguyễn Văn A',
          reviewer: 'TS. Trần Văn B',
          type: 'Nghiên cứu',
          studentId: '2',
          lecturer: 'TS. Nguyễn Văn A',
          status: 'REGISTERED'
        },
        {
          id: '3',
          title: 'Xây dựng Website bán sách trực tuyến',
          supervisor: 'ThS. Ngô Ngọc Đăng Khoa',
          reviewer: 'TS. Trần Văn B',
          type: 'Ứng dụng',
          studentId: '3',
          lecturer: 'ThS. Ngô Ngọc Đăng Khoa',
          status: 'ACTIVE'
        }
      ]);
    }, 150);
  });
}; 