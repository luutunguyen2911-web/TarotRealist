export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
}

export interface SpreadConfig {
  id: string;
  name: string;
  category: 'love' | 'career' | 'yesno' | 'second-opinion' | 'comprehensive';
  cardCount: number;
  tag: string;
  description: string;
  suggestedQuestions: string[];
  positions: SpreadPosition[];
  isVipOnly?: boolean;
}

export const SPREADS: SpreadConfig[] = [
  {
    id: 'love-deep',
    name: 'Tình Yêu & Quan Hệ (3 Lá)',
    category: 'love',
    cardCount: 3,
    tag: 'Hot Nhất',
    description: 'Tâm lý thật của đối phương, điểm mù và tương lai thực tế.',
    suggestedQuestions: [
      'Người ấy có thực sự nghiêm túc với mình không?',
      'Có nên tiếp tục mối quan hệ này hay nên dừng lại?',
      'Bao giờ mình mới gặp được người phù hợp?',
      'Người yêu cũ có ý định quay lại không?',
    ],
    positions: [
      {
        index: 0,
        name: 'Tâm lý thật của đối phương',
        description: 'Cảm xúc và suy nghĩ thật của người ấy',
      },
      {
        index: 1,
        name: 'Điểm mù của chính bạn',
        description: 'Điều bạn đang tự huyễn hoặc bản thân',
      },
      {
        index: 2,
        name: 'Tương lai & Lời khuyên',
        description: 'Bước đi dứt khoát nhất cho bạn',
      },
    ],
  },
  {
    id: 'career-money',
    name: 'Sự Nghiệp & Tài Chính (3 Lá)',
    category: 'career',
    cardCount: 3,
    tag: 'Thực Tế',
    description: 'Định hướng công việc, cơ hội thăng tiến và chiến lược tài chính.',
    suggestedQuestions: [
      'Nên nhảy việc hay ở lại công ty hiện tại?',
      'Định hướng công việc 3 tháng tới ra sao?',
      'Dự án kinh doanh mới này có tiềm năng kiếm tiền không?',
      'Cách ứng xử với sếp hoặc đồng nghiệp hiện tại?',
    ],
    positions: [
      {
        index: 0,
        name: 'Vị thế hiện tại',
        description: 'Năng lực và vị thế thực tế của bạn',
      },
      {
        index: 1,
        name: 'Cơ hội hoặc Cạm bẫy',
        description: 'Biến số cần nắm bắt hoặc né tránh',
      },
      {
        index: 2,
        name: 'Chiến lược hành động',
        description: 'Bước triển khai thực tế tiếp theo',
      },
    ],
  },
  {
    id: 'yes-no-flash',
    name: 'Yes / No & Quyết Định (1 Lá)',
    category: 'yesno',
    cardCount: 1,
    tag: 'Nhanh Gọn',
    description: 'Đáp án dứt khoát và phân tích ngắn gọn cho quyết định tức thì.',
    suggestedQuestions: [
      'Có nên chủ động nhắn tin trước cho người ấy không?',
      'Có nên chốt cơ hội đầu tư / hợp đồng này không?',
      'Có nên thẳng thắn nói ra điều mình bức xúc không?',
      'Kế hoạch này có diễn ra thuận lợi không?',
    ],
    positions: [
      {
        index: 0,
        name: 'Đáp án & Nguyên nhân cốt lõi',
        description: 'Khẳng định rõ Có / Không cùng nguyên nhân',
      },
    ],
  },
  {
    id: 'second-opinion',
    name: 'Góc Nhìn Khách Quan (3 Lá)',
    category: 'second-opinion',
    cardCount: 3,
    tag: 'Tự Nhập Bài',
    description: 'Mổ xẻ công tâm các lá bài bạn đã tự rút ở ngoài.',
    suggestedQuestions: [
      'Tôi tự rút 3 lá ở nhà, nhờ Reader mổ xẻ góc nhìn không thiên vị',
      'Đã xem chỗ khác nhưng băn khoăn, cần Reader check lại',
      'Tự đặt câu hỏi riêng biệt và tự chọn 3 lá bài',
    ],
    positions: [
      {
        index: 0,
        name: 'Cốt lõi vấn đề',
        description: 'Bản chất sự việc mà bạn đang đối mặt',
      },
      {
        index: 1,
        name: 'Nhân tố ẩn',
        description: 'Tác động từ hoàn cảnh khách quan',
      },
      {
        index: 2,
        name: 'Phương án xử lý tối ưu',
        description: 'Nước cờ khôn ngoan nhất để nắm quyền chủ động',
      },
    ],
  },
  {
    id: 'full-spectrum-vip',
    name: 'Vận Trình Toàn Cảnh (5 Lá VIP)',
    category: 'comprehensive',
    cardCount: 5,
    tag: 'Gói VIP',
    isVipOnly: true,
    description: 'Phân tích vận hạn, tình cảm, sự nghiệp và bài học nhân sinh của tháng.',
    suggestedQuestions: [
      'Tổng quan vận trình tháng này: Đâu là điểm sáng và đâu là kiếp nạn?',
      'Nhìn lại toàn bộ khúc mắc trong cuộc sống và con đường giải phóng năng lượng',
      'Định hướng bước ngoặt lớn trong cuộc đời 6 tháng tới',
    ],
    positions: [
      { index: 0, name: 'Năng lượng chủ đạo & Khởi điểm', description: 'Nền tảng năng lượng và bài học đang đối diện' },
      { index: 1, name: 'Chướng ngại vật & Điểm nghẽn', description: 'Cái bẫy đang kìm hãm bạn phát triển' },
      { index: 2, name: 'Nguồn lực hỗ trợ tiềm ẩn', description: 'Điểm tựa quý giá mà bạn có thể chưa để ý' },
      { index: 3, name: 'Biến chuyển bất ngờ', description: 'Yếu tố định mệnh sẽ xoay chuyển cục diện' },
      { index: 4, name: 'Kết quả chung cuộc & Lời khuyên vàng', description: 'Bức tranh hoàn thiện và chiến lược tối thượng' },
    ],
  },
];
