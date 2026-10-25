export interface PricingPlan {
  id: string;
  name: string;
  type: 'single' | 'pack' | 'subscription';
  priceVnd: number;
  priceDisplay: string;
  originalPriceDisplay?: string;
  badge?: string;
  isPopular?: boolean;
  creditsGranted?: number;
  vipDaysGranted?: number;
  features: string[];
  description: string;
  ctaText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pay-per-read',
    name: 'Lượt Xem Lẻ (Pay-per-read)',
    type: 'single',
    priceVnd: 10000,
    priceDisplay: '10.000 đ',
    badge: 'Chỉ 10K',
    creditsGranted: 1,
    description: 'Chỉ 10k giải quyết ngay một thắc mắc cấp bách của bạn.',
    features: [
      '1 lượt xem trải bài chuyên sâu (3-5 lá)',
      'Tự do chọn 1 trong 4 AI Reader cá tính',
      'Phân tích chi tiết + Reality Check bóc trần sự thật',
      'Kèm Action Checklist 3 ngày & Thẻ bài Story',
    ],
    ctaText: 'Mua 1 Lượt (10K)',
  },
  {
    id: 'pack-starter',
    name: 'Gói Thử Nghiệm (Starter Pack)',
    type: 'pack',
    priceVnd: 39000,
    priceDisplay: '39.000 đ',
    originalPriceDisplay: '50.000 đ',
    badge: 'Tiết Kiệm',
    creditsGranted: 4,
    description: 'Thoải mái trải bài nhiều chủ đề tình duyên và sự nghiệp.',
    features: [
      '4 lượt đọc sâu (chỉ ~9k/lượt)',
      'Đổi Reader linh hoạt giữa các lần bốc bài',
      'Lưu trải bài vào Nhật ký Tarot cá nhân',
      'Mở khóa tính năng Tự Nhập Bài (Second Opinion)',
    ],
    ctaText: 'Nạp Gói 39K',
  },
  {
    id: 'pack-pro',
    name: 'Gói Pro Tỉnh Ngộ (Pro Pack)',
    type: 'pack',
    priceVnd: 69000,
    priceDisplay: '69.000 đ',
    originalPriceDisplay: '99.000 đ',
    badge: 'Bán Chạy Nhất',
    isPopular: true,
    creditsGranted: 8,
    description: '8 lượt đọc sâu + MỞ KHÓA Chat sâu & Tính năng Góc nhìn đối phương (The Mirror View)!',
    features: [
      '8 lượt đọc chuyên sâu (chỉ ~8.6k/lượt)',
      '🔓 Mở khóa The Mirror View: Đọc suy nghĩ đối phương',
      '🔓 Mở khóa Chat đối thoại sâu với Reader sau mỗi tụ bài',
      'Action Checklist 3 ngày gỡ rối tâm lý cụ thể',
      'Xuất thẻ ảnh Story chuẩn kích thước Threads/Instagram',
    ],
    ctaText: 'Nạp Gói Pro 69K',
  },
  {
    id: 'vip-monthly',
    name: 'Đăng Ký VIP Tháng (VIP Pass)',
    type: 'subscription',
    priceVnd: 99000,
    priceDisplay: '99.000 đ / tháng',
    originalPriceDisplay: '149.000 đ',
    badge: 'Hội Viên VIP',
    vipDaysGranted: 30,
    description: 'Không giới hạn lượt rút bài, vận trình tháng & trọn bộ tính năng độc quyền.',
    features: [
      '👑 Rút bài KHÔNG GIỚI HẠN toàn bộ các tụ bài',
      '👑 Độc quyền The Mirror View đọc vị người yêu cũ/crush',
      '👑 Độc quyền Trải bài Vận trình 5 lá VIP chuyên sâu',
      '👑 Chat hỏi đáp không giới hạn với cả 4 Reader',
      '👑 Action Checklist 3 ngày & Nhật ký Tarot không giới hạn',
      '👑 Tải ảnh Story HD không giới hạn khoe mạng xã hội',
    ],
    ctaText: 'Đăng Ký VIP (99K/tháng)',
  },
];
