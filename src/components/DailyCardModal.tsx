import React, { useState } from 'react';
import { TAROT_DECK, TarotCard } from '../data/tarotDeck';
import { TarotCardView } from './TarotCardView';
import { soundEffects } from '../utils/audio';
import { ReaderPersona } from '../data/readers';
import { X, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface DailyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReader: ReaderPersona;
  onDailyDrawn: () => void;
}

export const DailyCardModal: React.FC<DailyCardModalProps> = ({
  isOpen,
  onClose,
  activeReader,
  onDailyDrawn,
}) => {
  const [drawnCard, setDrawnCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyAnalysis, setDailyAnalysis] = useState<{
    energy: string;
    trapToAvoid: string;
    goldenAdvice: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleDrawDaily = async () => {
    soundEffects.playShuffle();
    setIsLoading(true);

    const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    const isReversed = Math.random() < 0.2;
    setDrawnCard(randomCard);

    setTimeout(() => {
      soundEffects.playReveal();
      setIsFlipped(true);
    }, 400);

    try {
      const res = await fetch('/api/tarot/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card: { ...randomCard, isReversed },
          readerId: activeReader.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDailyAnalysis(data.data);
      } else {
        throw new Error();
      }
    } catch {
      setDailyAnalysis({
        energy: `Năng lượng lá ${randomCard.nameVi} hôm nay nhắc bạn: bớt ôm đồm việc bao đồng, việc của mình làm xong hẵng tính việc người khác.`,
        trapToAvoid: 'Đừng shopping tùy hứng lúc đang stress và đừng dây dưa tranh cãi vô ích trên mạng xã hội.',
        goldenAdvice: 'Tập trung vào giá trị thực tế, tan làm đúng giờ và thưởng cho mình một bữa ăn ngon.',
      });
    } finally {
      setIsLoading(false);
      onDailyDrawn();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lá Bài Ngày Miễn Phí (Daily Reality Check)</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
          Thông Điệp Tỉnh Táo Hôm Nay
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-6">
          Được luận giải bởi <strong className="text-amber-400">{activeReader.name}</strong>
        </p>

        {!drawnCard ? (
          <div className="flex flex-col items-center py-6">
            <div
              onClick={handleDrawDaily}
              className="w-36 h-56 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 group shadow-xl"
            >
              <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-400 transition-all">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-200 mt-3">
                Chạm Để Rút Bài
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                Hoàn toàn miễn phí mỗi ngày
              </span>
            </div>

            <button
              onClick={handleDrawDaily}
              className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Rút Ngay Lá Bài Hôm Nay</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <TarotCardView card={drawnCard} isFlipped={isFlipped} size="md" />

            {isLoading ? (
              <div className="text-xs text-amber-300 italic animate-pulse">
                {activeReader.name} đang xem xét năng lượng của bạn...
              </div>
            ) : dailyAnalysis ? (
              <div className="w-full space-y-3 text-left text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                  <div className="text-[11px] font-bold text-indigo-300 uppercase mb-1">
                    ✨ Dự Báo Năng Lượng
                  </div>
                  <p className="text-slate-200">{dailyAnalysis.energy}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/20">
                  <div className="text-[11px] font-bold text-red-300 uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Kiếp Nạn Cần Né</span>
                  </div>
                  <p className="text-slate-200">{dailyAnalysis.trapToAvoid}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                  <div className="text-[11px] font-bold text-emerald-300 uppercase mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lời Khuyên Vàng Hôm Nay</span>
                  </div>
                  <p className="text-slate-200">{dailyAnalysis.goldenAdvice}</p>
                </div>
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
            >
              Đã Hiểu &amp; Bắt Đầu Ngày Mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
