// Dữ liệu giả lập về đề tài đã đăng ký của sinh viên
// Trong ứng dụng thực tế, dữ liệu này sẽ lấy từ API

const registeredTopics = {
  // Sinh viên có ID 'sv001' đã đăng ký đề tài này
  'sv001': {
    topicId: 'DT001',
    topicName: 'Xây dựng phần mềm quản lý khối lượng giảng dạy của giảng viên khoa CNTT - Trường Đại học X',
    supervisor: 'ThS. Ngô Ngọc Đăng Khoa',
    major: 'Công nghệ phần mềm',
    type: 'Ứng dụng',
    details: [
      '1. Tính cấp thiết của đề tài', 
      '- Câu hỏi: Vì sao lại nghiên cứu đề tài đó?', 
      '+ Lí do khách quan: Ý nghĩa trên lý luận và thực tiễn chung', 
      '+ Lí do chủ quan: Thực trạng nơi tác giả nghiên cứu, nhu cầu, trách nhiệm, sự hứng thú của người nghiên cứu đối với vấn đề', 
      '- Các nghiên cứu đã được thực hiện trước đó từ đó chỉ ra điểm mới của đề tài, vấn đề mà nhóm lựa chọn.', 
      '- Trọng số trong bài nghiên cứu: Luận giải rõ ràng tính cấp thiết của vấn đề nghiên cứu: 10%',
      'Những hướng nghiên cứu chính về vấn đề của đề tài đã được thực hiện', 
      'Những trường phái lý thuyết đã được sử dụng để nghiên cứu vấn đề này', 
      'Những phương pháp nghiên cứu chính đã được áp dụng', 
      'Những kết quả nghiên cứu chính', 
      'Hạn chế của các nghiên cứu trước – những vấn đề cần tiếp tục nghiên cứu'
    ],
    maxStudents: 3,
    registeredGroups: [
      { 
        groupId: 'NHOM1',
        members: [
           { id: 'sv001', name: 'Nguyễn Hồng Đức', mssv: '19110308' },
           { id: 'sv002', name: 'Ngô Đình Đại', mssv: '19110160' },
           { id: 'sv004', name: 'Nguyễn Văn Truyền', mssv: '19110306' },
        ]
      }
    ],
    documents: {
        proposal: { name: null, url: null },
        defenseRequest: { name: null, url: null },
        finalReport: { name: null, url: null },
    },
    reviewer: null,
    committee: null,
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
      if (topic && topic.registeredGroups) {
          for (const group of topic.registeredGroups) {
              if (group.members.includes(studentId)) {
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

// Mock function to get a single topic by ID (already exists, ensure it works)
export const getTopicById = (topicId) => {
  // ... (existing implementation - should be correct now)
  console.log(`Mock fetching topic with ID: ${topicId}`);
  const topic = availableTopics.find(t => t.id === topicId);
  if (!topic) {
      console.error(`Mock topic with ID ${topicId} not found.`);
      return null;
  }
  return new Promise(resolve => setTimeout(() => resolve(topic), 150));
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