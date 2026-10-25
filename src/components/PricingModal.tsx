import React, { useState } from 'react';
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
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  isVip: boolean;
  onPurchaseSuccess: (creditsAdded: number, isVipAdded: boolean, days: number) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  isVip,
  onPurchaseSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[2]); // Default to Pro Pack 99K
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  if (!isOpen) return null;

  // Transfer memo simulation
  const transferCode = `TAROT ${selectedPlan.id.toUpperCase().replace('-', '_')} 8899`;

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutStep(true);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
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
    }, 1200);
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(transferCode);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCheckoutStep ? (
          <div>
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Mô Hình Mua Lượt &amp; Đăng Ký Tháng VIP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Mở Khóa Luận Giải Chuyên Sâu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Hiện tại bạn có{' '}
                <span className="font-bold text-amber-400">{currentCredits} lượt xem</span>
                {isVip && ' • 👑 Bạn đang là Hội viên VIP Không Giới Hạn'}
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
                        ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                        : 'bg-slate-900/90 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500 text-slate-950 shadow-md">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif font-bold text-sm text-white">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="my-3">
                        <div className="text-2xl font-black text-amber-400 font-mono">
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

                      <ul className="space-y-2 border-t border-white/5 pt-3 mb-6">
                        {plan.features.map((feat, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] text-slate-200"
                          >
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        plan.isPopular
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
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
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>
                Mỗi ngày bạn luôn được tặng{' '}
                <strong className="text-emerald-300">1 lượt rút bài hàng ngày miễn phí</strong>.
              </span>
            </div>
          </div>
        ) : (
          /* Checkout / VietQR Payment Step */
          <div className="max-w-xl mx-auto py-2">
            <button
              onClick={() => setIsCheckoutStep(false)}
              className="text-xs text-amber-400 hover:underline mb-4 flex items-center gap-1 cursor-pointer"
            >
              ← Quay lại chọn gói khác
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-serif font-bold text-white">
                Thanh Toán Qua Quét Mã QR (VietQR / MoMo)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gói đã chọn: <strong className="text-amber-300">{selectedPlan.name}</strong> •{' '}
                <span className="text-amber-400 font-bold">{selectedPlan.priceDisplay}</span>
              </p>
            </div>

            {/* QR Card Container */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
              {/* Simulated QR Code Canvas */}
              <div className="w-44 h-44 rounded-xl bg-white p-3 flex flex-col items-center justify-between shrink-0 shadow-lg relative">
                <div className="w-full flex justify-between items-center text-[10px] text-slate-800 font-bold">
                  <span>VIETQR</span>
                  <span className="text-blue-600 font-black">Napas247</span>
                </div>
                {/* Visual QR representation */}
                <div className="w-32 h-32 bg-slate-900 rounded p-1 flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-1 bg-white">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                            ? 'bg-slate-950'
                            : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg bg-amber-400 text-slate-950 font-bold px-1 rounded shadow">
                      🔮
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-600 font-mono">
                  Quét bằng App Ngân Hàng
                </div>
              </div>

              {/* Transfer Details */}
              <div className="flex-1 space-y-3 text-xs w-full">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Ngân hàng thụ hưởng
                  </div>
                  <div className="text-white font-bold text-sm">
                    MBBank (Ngân hàng Quân Đội)
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Số tài khoản
                  </div>
                  <div className="text-amber-400 font-mono font-bold text-sm">
                    0988 777 666
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Nội dung chuyển khoản (bắt buộc)
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-amber-300 text-xs font-bold">
                      {transferCode}
                    </span>
                    <button
                      onClick={handleCopyMemo}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedMemo ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    {selectedPlan.priceDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* Test confirmation button */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleSimulatePayment}
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra giao dịch...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Xác Nhận Đã Chuyển Khoản (Kích Hoạt Ngay)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Môi trường trải nghiệm trực tiếp: Bấm nút trên để mô phỏng hoàn tất thanh toán và nhận lượt xem ngay lập tức!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
