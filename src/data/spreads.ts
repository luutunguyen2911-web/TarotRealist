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
    name: 'Tình Yêu & Mối Quan Hệ (3 Lá Chuyên Sâu)',
    category: 'love',
    cardCount: 3,
    tag: 'Hot Nhất',
    description: 'Bóc trần sự thật về người ấy, rào cản tiềm ẩn và tương lai thực tế của mối quan hệ.',
    suggestedQuestions: [
      'Người ấy thực sự nghĩ gì và có nghiêm túc với mình không?',
      'Có nên tiếp tục mối quan hệ này hay nên dứt khoát chia tay?',
      'Bao giờ mình mới gặp được người phù hợp?',
      'Người yêu cũ có ý định quay lại không và nếu quay lại thì có tương lai không?',
    ],
    positions: [
      {
        index: 0,
        name: 'Tâm lý & Ý định thật của người ấy',
        description: 'Bản chất cảm xúc thật của đối phương (không qua lăng kính màu hồng)',
      },
      {
        index: 1,
        name: 'Điểm mù & Rào cản của chính bạn',
        description: 'Điều bạn đang tự lừa dối mình hoặc thói quen tâm lý khiến bạn bế tắc',
      },
      {
        index: 2,
        name: 'Kết cục thực tế & Lời khuyên tỉnh đòn',
        description: 'Tương lai gần và bước đi dứt khoát nhất để không lãng phí thanh xuân',
      },
    ],
  },
  {
    id: 'career-money',
    name: 'Sự Nghiệp & Tài Chính (3 Lá Chiến Lược)',
    category: 'career',
    cardCount: 3,
    tag: 'Thực Tế Cao',
    description: 'Định hướng công việc 3 tháng tới, nên chuyển việc hay ở lại, cơ hội tài lộc.',
    suggestedQuestions: [
      'Nên nhảy việc tìm chân trời mới hay cắn răng ở lại công ty hiện tại?',
      'Định hướng công việc và tài chính trong 3 tháng tới ra sao?',
      'Dự án / ý tưởng kinh doanh mới này có tiềm năng kiếm tiền thực tế không?',
      'Làm sao để giải quyết mâu thuẫn với sếp / đồng nghiệp toxic?',
    ],
    positions: [
      {
        index: 0,
        name: 'Hiện trạng & Năng lực thực tế',
        description: 'Vị thế thật của bạn tại môi trường công việc hiện tại',
      },
      {
        index: 1,
        name: 'Cơ hội vàng hoặc Bẫy rập rình rập',
        description: 'Biến số bất ngờ cần nắm bắt hoặc chiếc bẫy cần né ngay',
      },
      {
        index: 2,
        name: 'Chiến lược tài chính & Hành động',
        description: 'Các bước triển khai cụ thể để tiền về tài khoản và nâng tầm sự nghiệp',
      },
    ],
  },
  {
    id: 'yes-no-flash',
    name: 'Yes / No Tarot Dứt Khoát (1 Lá Tốc Độ)',
    category: 'yesno',
    cardCount: 1,
    tag: 'Nhanh & Chuẩn',
    description: 'Đáp án dứt khoát Kèm phân tích lý do đằng sau cho các quyết định tức thì.',
    suggestedQuestions: [
      'Có nên chủ động nhắn tin / gọi điện trước cho người ấy không?',
      'Hôm nay có nên chốt ký hợp đồng / đầu tư khoản này không?',
      'Có nên thẳng thắn nói ra điều mình bức xúc không?',
      'Chuyến đi / kế hoạch này có diễn ra thuận lợi không?',
    ],
    positions: [
      {
        index: 0,
        name: 'Đáp án Dứt Khoát & Sự Thật Đằng Sau',
        description: 'Khẳng định rõ Có / Không / Tạm dừng cùng nguyên nhân cốt lõi',
      },
    ],
  },
  {
    id: 'second-opinion',
    name: 'Góc Nhìn Khách Quan (Second Opinion - 3 Lá)',
    category: 'second-opinion',
    cardCount: 3,
    tag: 'Độc Quyền',
    description: 'Bạn đã tự rút bài ở nhà? Hãy nhập câu hỏi và chọn các lá bài bạn có, AI Reader sẽ mổ xẻ thực tế.',
    suggestedQuestions: [
      'Tôi tự rút được 3 lá này ở nhà, nhờ Reader mổ xẻ góc nhìn không thiên vị',
      'Đã đi xem bói chỗ khác nhưng nghe hoang mang, cần Reader sắc sảo check lại',
      'Tự đặt câu hỏi riêng biệt và tự chọn 3 lá bài theo ý muốn',
    ],
    positions: [
      {
        index: 0,
        name: 'Cốt lõi vấn đề thực tế',
        description: 'Bản chất sự việc mà bạn có thể đang né tránh',
      },
      {
        index: 1,
        name: 'Tác động môi trường & Nhân tố ẩn',
        description: 'Ảnh hưởng từ người xung quanh hoặc hoàn cảnh khách quan',
      },
      {
        index: 2,
        name: 'Phương án xử lý tối ưu nhất',
        description: 'Nước cờ khôn ngoan nhất để bạn nắm thế chủ động',
      },
    ],
  },
  {
    id: 'full-spectrum-vip',
    name: 'Vận Trình Toàn Cảnh (5 Lá Chuyên Sâu VIP)',
    category: 'comprehensive',
    cardCount: 5,
    tag: 'Gói VIP',
    isVipOnly: true,
    description: 'Trải bài 5 lá phân tích tổng quan vận hạn, tình duyên, sự nghiệp và bài học nhân sinh của tháng.',
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
