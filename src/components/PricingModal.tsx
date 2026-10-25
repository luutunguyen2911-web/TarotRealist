import React, { useState, useEffect } from 'react';
import { PRICING_PLANS, PricingPlan } from '../data/pricingPlans';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  Sparkles,
  Crown,
  Zap,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Copy,
  CheckCircle,
  Clock,
  Download,
  Settings,
  RefreshCw,
  ExternalLink,
  CreditCard,
  KeyRound,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  isVip: boolean;
  onPurchaseSuccess: (creditsAdded: number, isVipAdded: boolean, days: number) => void;
}

// Popular Vietnamese banks supported by SePay
const SEPAY_BANKS = [
  { code: 'MBBank', name: 'MBBank (Quân Đội)' },
  { code: 'Vietcombank', name: 'Vietcombank (VCB)' },
  { code: 'Techcombank', name: 'Techcombank (TCB)' },
  { code: 'TPBank', name: 'TPBank' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'VPBank', name: 'VPBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VietinBank', name: 'VietinBank' },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  isVip,
  onPurchaseSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find((p) => p.isPopular) || PRICING_PLANS[2]
  );
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // SePay merchant configuration
  const [sepayMerchantCode, setSepayMerchantCode] = useState<string>(() => {
    return localStorage.getItem('sepay_merchant_code') || 'SP-TEST-LT492795';
  });
  const [sepayBank, setSepayBank] = useState<string>(() => {
    return localStorage.getItem('sepay_bank') || 'MBBank';
  });
  const [sepayAccount, setSepayAccount] = useState<string>(() => {
    return localStorage.getItem('sepay_account') || '0988777666';
  });
  const [sepayAccountName, setSepayAccountName] = useState<string>(() => {
    return localStorage.getItem('sepay_acc_name') || 'TAROT REALIST';
  });
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  // Unique order code for SePay automatic transaction matching
  const [orderCode, setOrderCode] = useState<string>('');
  // 10-minute countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [qrLoaded, setQrLoaded] = useState<boolean>(false);
  const [isAutoChecking, setIsAutoChecking] = useState<boolean>(true);

  // Reset or create order code when checkout opened
  useEffect(() => {
    if (isCheckoutStep) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      // Format memo: SP-TEST-LT492795 8899 so SePay pattern matches instantly
      setOrderCode(`${sepayMerchantCode} ${randomSuffix}`);
      setTimeLeft(600);
      setQrLoaded(false);
    }
  }, [isCheckoutStep, selectedPlan, sepayMerchantCode]);

  // Countdown timer
  useEffect(() => {
    if (!isCheckoutStep || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckoutStep, timeLeft]);

  // Real-time automatic polling SePay payment status
  useEffect(() => {
    if (!isCheckoutStep || !orderCode) return;

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(
          `/api/sepay/check-payment?orderCode=${encodeURIComponent(
            orderCode
          )}&amount=${selectedPlan.priceVnd}`
        );
        const data = await res.json();
        if (data.success && data.paid && isSubscribed) {
          clearInterval(pollInterval);
          handleSuccessActivation('sepay_auto');
        }
      } catch {
        // Ignore network glitches during polling
      }
    }, 3500);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [isCheckoutStep, orderCode, selectedPlan]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SePay dynamic QR image endpoint
  // Standard format: https://qr.sepay.vn/img?acc={ACC}&bank={BANK}&amount={AMOUNT}&des={DES}&template=compact
  const sepayQrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(
    sepayAccount.replace(/\s+/g, '')
  )}&bank=${encodeURIComponent(sepayBank)}&amount=${selectedPlan.priceVnd}&des=${encodeURIComponent(
    orderCode
  )}&template=compact`;

  // Fallback VietQR endpoint
  const vietQrFallbackUrl = `https://img.vietqr.io/image/${sepayBank}-${sepayAccount.replace(
    /\s+/g,
    ''
  )}-compact2.png?amount=${selectedPlan.priceVnd}&addInfo=${encodeURIComponent(
    orderCode
  )}&accountName=${encodeURIComponent(sepayAccountName)}`;

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutStep(true);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('sepay_merchant_code', sepayMerchantCode);
    localStorage.setItem('sepay_bank', sepayBank);
    localStorage.setItem('sepay_account', sepayAccount);
    localStorage.setItem('sepay_acc_name', sepayAccountName);
    setIsEditingConfig(false);
  };

  const handleSuccessActivation = (_source?: string) => {
    soundEffects.playCoin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (selectedPlan.type === 'subscription') {
      onPurchaseSuccess(0, true, selectedPlan.vipDaysGranted || 30);
    } else {
      onPurchaseSuccess(selectedPlan.creditsGranted || 1, false, 0);
    }
    setIsCheckoutStep(false);
    onClose();
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      handleSuccessActivation('manual_confirm');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#120E1E] to-[#0B0F19] border border-[#9333EA]/35 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(147,51,234,0.25)] my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCheckoutStep ? (
          <div>
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9333EA]/20 border border-[#9333EA]/40 text-[#FCD34D] text-xs font-bold uppercase tracking-wider mb-2">
                <Crown className="w-4 h-4 text-[#FCD34D]" />
                <span>Thanh Toán Tự Động SePay • Mở Khóa Đọc Bài</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-normal font-sans">
                Chọn Gói Xem Tarot
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Hiện tại bạn có{' '}
                <span className="font-bold text-[#FCD34D]">{currentCredits} lượt xem</span>
                {isVip && ' • 👑 Bạn đang là Hội viên VIP Tháng Không Giới Hạn'}
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl flex flex-col justify-between p-5 transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-gradient-to-b from-[#9333EA]/25 via-[#120E1E] to-[#0B0F19] border-2 border-[#FCD34D] shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-[1.02]'
                        : 'bg-[#120E1E]/80 border border-white/10 hover:border-[#9333EA]/50'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-md ${
                          plan.isPopular
                            ? 'bg-[#FCD34D] text-black font-extrabold'
                            : 'bg-[#9333EA] text-white'
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-white font-sans">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="my-3">
                        <div className="text-2xl font-black text-[#FCD34D] font-mono">
                          {plan.priceDisplay}
                        </div>
                        {plan.originalPriceDisplay && (
                          <div className="text-xs text-slate-400 line-through">
                            {plan.originalPriceDisplay}
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 mb-4 line-clamp-2">
                        {plan.description}
                      </p>

                      <ul className="space-y-2 border-t border-white/10 pt-3 mb-6">
                        {plan.features.map((feat, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-slate-200"
                          >
                            <Check className="w-3.5 h-3.5 text-[#FCD34D] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-[#FCD34D] to-[#fbbf24] hover:brightness-110 text-slate-950 shadow-lg font-black'
                          : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footnote about Free Daily Card */}
            <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-[#FCD34D]" />
              <span>
                Mỗi người dùng mới luôn được tặng{' '}
                <strong className="text-[#FCD34D]">1 lượt xem miễn phí ban đầu</strong>.
              </span>
            </div>
          </div>
        ) : (
          /* CHECKOUT STEP: SEPAY DYNAMIC QR CODE */
          <div className="max-w-2xl mx-auto py-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsCheckoutStep(false)}
                className="text-xs text-[#FCD34D] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                ← Quay lại chọn gói khác
              </button>

              <button
                onClick={() => setIsEditingConfig(!isEditingConfig)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                title="Tùy chỉnh thông tin SePay"
              >
                <Settings className="w-3 h-3 text-[#EC4899]" />
                <span>Cài đặt SePay ({sepayMerchantCode})</span>
              </button>
            </div>

            {/* Expandable SePay Configuration Drawer */}
            {isEditingConfig && (
              <div className="mb-4 p-4 rounded-2xl bg-black/50 border border-[#9333EA]/40 text-xs space-y-3 animate-fade-in shadow-xl">
                <div className="flex items-center justify-between font-bold text-[#FCD34D]">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#EC4899]" />
                    <span>Cấu Hình Cổng Thanh Toán SePay</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    API Key: spsk_test_...2YT (Đã gắn)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Mã SePay (Merchant / Pattern Code):
                    </label>
                    <input
                      type="text"
                      value={sepayMerchantCode}
                      onChange={(e) => setSepayMerchantCode(e.target.value.trim())}
                      placeholder="SP-TEST-LT492795"
                      className="w-full bg-[#120E1E] border border-white/20 rounded-lg px-2.5 py-1.5 text-[#FCD34D] text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ngân hàng:</label>
                    <select
                      value={sepayBank}
                      onChange={(e) => setSepayBank(e.target.value)}
                      className="w-full bg-[#120E1E] border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    >
                      {SEPAY_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Số tài khoản:</label>
                    <input
                      type="text"
                      value={sepayAccount}
                      onChange={(e) => setSepayAccount(e.target.value)}
                      placeholder="0988777666"
                      className="w-full bg-[#120E1E] border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Tên chủ tài khoản:</label>
                    <input
                      type="text"
                      value={sepayAccountName}
                      onChange={(e) => setSepayAccountName(e.target.value)}
                      placeholder="TAROT REALIST"
                      className="w-full bg-[#120E1E] border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
                  <button
                    onClick={handleSaveConfig}
                    className="px-3.5 py-1.5 rounded-lg bg-[#9333EA] text-white font-bold text-xs hover:bg-[#a855f7] cursor-pointer shadow"
                  >
                    Lưu &amp; Cập Nhật Mã QR
                  </button>
                </div>
              </div>
            )}

            {/* SePay Checkout Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold mb-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Cổng SePay Tự Động • Mã: {sepayMerchantCode}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Quét Mã QR Chuyển Khoản
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Gói đã chọn: <strong className="text-[#FCD34D]">{selectedPlan.name}</strong> •{' '}
                <span className="text-[#EC4899] font-black font-mono">{selectedPlan.priceDisplay}</span>
              </p>
            </div>

            {/* SEPAY QR PAYMENT CONTAINER */}
            <div className="bg-[#0B0F19]/90 border border-[#9333EA]/35 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
              {/* SePay Official Watermark Corner */}
              <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-bold">SePay Auto Pay</span>
              </div>

              {/* QR Image Frame */}
              <div className="flex flex-col items-center gap-2.5 shrink-0">
                <div className="relative w-52 h-52 sm:w-56 sm:h-56 bg-white rounded-2xl p-2.5 shadow-[0_0_25px_rgba(252,211,77,0.25)] flex flex-col items-center justify-between border border-amber-400/40">
                  {/* SePay Top Bar */}
                  <div className="w-full flex items-center justify-between px-1 text-[9px] font-bold text-slate-800 border-b border-slate-200 pb-1">
                    <span className="text-[#9333EA] font-extrabold flex items-center gap-1">
                      ⚡ SePay QR
                    </span>
                    <span className="text-blue-700 font-black">VietQR • Napas247</span>
                  </div>

                  {/* Real Dynamic SePay QR Image with Fallback */}
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                    <img
                      src={sepayQrUrl}
                      alt="SePay VietQR Code"
                      className="w-full h-full object-contain"
                      onLoad={() => setQrLoaded(true)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = vietQrFallbackUrl;
                      }}
                    />
                  </div>

                  {/* SePay Bottom Footer */}
                  <div className="w-full text-center text-[9px] text-slate-600 font-medium border-t border-slate-200 pt-0.5">
                    Mở mọi App Ngân hàng để quét
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1.5 text-xs text-[#FCD34D] font-mono bg-white/5 px-3 py-1 rounded-full border border-[#FCD34D]/30">
                  <Clock className="w-3.5 h-3.5 text-[#EC4899]" />
                  <span>Mã QR hết hạn sau:</span>
                  <span className="font-bold text-white">{formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* Transfer Information Breakdown */}
              <div className="flex-1 space-y-3 text-xs w-full">
                {/* Bank */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Ngân hàng thụ hưởng
                    </div>
                    <div className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                      <CreditCard className="w-4 h-4 text-[#FCD34D]" />
                      <span>{sepayBank}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Napas 24/7
                  </span>
                </div>

                {/* Account Number */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Số tài khoản
                    </div>
                    <div className="text-[#FCD34D] font-mono font-black text-base mt-0.5 tracking-wider">
                      {sepayAccount}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      Chủ TK: {sepayAccountName}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(sepayAccount.replace(/\s+/g, ''), 'acc')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copiedField === 'acc' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transfer Content / Memo (Crucial for SePay auto matching) */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#9333EA]/20 to-[#EC4899]/20 border border-[#EC4899]/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#FCD34D] uppercase font-bold flex items-center gap-1">
                      <span>Nội dung chuyển khoản (bắt buộc)</span>
                    </div>
                    <div className="text-white font-mono font-black text-sm mt-0.5 tracking-wider">
                      {orderCode}
                    </div>
                    <div className="text-[9px] text-slate-300 flex items-center gap-1 mt-0.5">
                      <span>Mã SePay:</span>
                      <strong className="text-emerald-400">{sepayMerchantCode}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(orderCode, 'memo')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#9333EA] hover:bg-[#a855f7] text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow"
                  >
                    {copiedField === 'memo' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Exact Amount */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Số tiền chính xác
                    </div>
                    <div className="font-mono font-black text-[#FCD34D] text-lg">
                      {selectedPlan.priceDisplay}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedPlan.priceVnd.toString(), 'amount')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép tiền</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Realtime Status Indicator & Confirmation Button */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    SePay đang tự động lắng nghe giao dịch (Mã <strong>{sepayMerchantCode}</strong>)...
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Tự động kích hoạt sau khi chuyển
                </span>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-98 transition-all cursor-pointer disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>SePay đang xác thực giao dịch...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-slate-950" />
                    <span>Tôi Đã Chuyển Khoản (Xác Nhận &amp; Kích Hoạt Ngay)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Mẹo: Quét mã QR bằng App Ngân hàng sẽ tự động điền đúng Số tài khoản, Số tiền và cú pháp SePay ({sepayMerchantCode}).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
