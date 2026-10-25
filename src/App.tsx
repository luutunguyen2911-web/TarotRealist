import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DeckBoard } from './components/DeckBoard';
import { ReadingResultView } from './components/ReadingResultView';
import { PricingModal } from './components/PricingModal';
import { DailyCardModal } from './components/DailyCardModal';
import { SecondOpinionModal } from './components/SecondOpinionModal';
import { JournalModal } from './components/JournalModal';
import { READERS, ReaderPersona } from './data/readers';
import { SPREADS, SpreadConfig } from './data/spreads';
import { DrawnCard, ReadingResult } from './types';
import { soundEffects } from './utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Heart,
  Briefcase,
  Eye,
  Crown,
  ChevronRight,
  Flame,
  Zap,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  // State: Readers & Spreads
  const [activeReader, setActiveReader] = useState<ReaderPersona>(READERS[0]); // Madame Vy
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig>(SPREADS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [contextNotes, setContextNotes] = useState('');

  // Workflow steps: 'config' | 'drawing' | 'result'
  const [workflowStep, setWorkflowStep] = useState<'config' | 'drawing' | 'result'>('config');
  const [currentReading, setCurrentReading] = useState<ReadingResult | null>(null);
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);

  // User Account state - Rule: Mỗi người được xem 1 lá / 1 lượt free duy nhất
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('tarot_user_credits');
    return saved !== null ? parseInt(saved, 10) : 1; // 1 free starter credit only!
  });
  const [isVip, setIsVip] = useState<boolean>(() => {
    return localStorage.getItem('tarot_user_vip') === 'true';
  });
  const [savedReadings, setSavedReadings] = useState<ReadingResult[]>(() => {
    try {
      const saved = localStorage.getItem('tarot_journal');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastDailyDate, setLastDailyDate] = useState<string>(() => {
    return localStorage.getItem('tarot_daily_date') || '';
  });

  // Modals state
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isSecondOpinionOpen, setIsSecondOpinionOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const hasDrawnDailyToday = lastDailyDate === todayStr;

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('tarot_user_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('tarot_user_vip', isVip ? 'true' : 'false');
  }, [isVip]);

  useEffect(() => {
    localStorage.setItem('tarot_journal', JSON.stringify(savedReadings));
  }, [savedReadings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Start Drawing cards
  const handleProceedToDraw = () => {
    if (!customQuestion.trim()) {
      showToast('Vui lòng chọn hoặc nhập câu hỏi cụ thể trước khi trải bài.');
      return;
    }

    if (selectedSpread.isVipOnly && !isVip) {
      setIsPricingOpen(true);
      return;
    }

    // Check credits if not VIP (1 free card only)
    if (!isVip && credits <= 0) {
      showToast('Bạn đã sử dụng hết 1 lượt xem miễn phí. Vui lòng nạp thêm lượt (10K) hoặc VIP (99K) để tiếp tục!');
      setIsPricingOpen(true);
      return;
    }

    soundEffects.playShuffle();
    setWorkflowStep('drawing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cards drawn on DeckBoard -> Request AI Reading
  const handleCardsReady = async (cards: DrawnCard[]) => {
    setIsGeneratingReading(true);

    try {
      const res = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: activeReader.id,
          topic: selectedSpread.category,
          question: customQuestion,
          cards,
          spreadType: selectedSpread.name,
          userContext: contextNotes,
        }),
      });

      const resData = await res.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.error || 'Lỗi khi tạo bài đọc');
      }

      const generated = resData.data;
      const newReadingResult: ReadingResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        readerId: activeReader.id,
        readerName: activeReader.name,
        topic: selectedSpread.category,
        question: customQuestion,
        spreadId: selectedSpread.id,
        spreadName: selectedSpread.name,
        cards,
        punchline: generated.punchline,
        generalOverview: generated.generalOverview,
        cardsAnalysis: generated.cardsAnalysis,
        realityCheck: generated.realityCheck,
        actionAdvice: generated.actionAdvice,
        verdict: generated.verdict,
        closingMessage: generated.closingMessage,
        mirrorView: generated.mirrorView,
        threeDayActionPlan: generated.threeDayActionPlan,
        shareableQuote: generated.shareableQuote,
      };

      // Deduct credit if not VIP
      if (!isVip) {
        setCredits((prev) => Math.max(0, prev - 1));
      }

      setCurrentReading(newReadingResult);
      setWorkflowStep('result');
      soundEffects.playReveal();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorNotification('Không thể kết nối với Reader. Vui lòng thử lại sau giây lát.');
      setTimeout(() => setErrorNotification(null), 4000);
    } finally {
      setIsGeneratingReading(false);
    }
  };

  // Submit from Second Opinion modal
  const handleSecondOpinionSubmit = async (
    question: string,
    cards: DrawnCard[],
    userNotes: string
  ) => {
    if (!isVip && credits <= 0) {
      showToast('Bạn đã sử dụng hết 1 lượt xem miễn phí. Vui lòng nạp thêm để tiếp tục!');
      setIsPricingOpen(true);
      return;
    }

    setCustomQuestion(question);
    setContextNotes(userNotes);
    setIsGeneratingReading(true);
    setWorkflowStep('drawing');

    try {
      const res = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: activeReader.id,
          topic: 'second-opinion',
          question,
          cards,
          spreadType: 'Góc Nhìn Khách Quan (Second Opinion)',
          userContext: userNotes,
          isCustomDeck: true,
        }),
      });

      const resData = await res.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.error || 'Lỗi khi luận giải bài');
      }

      const generated = resData.data;
      const newReadingResult: ReadingResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        readerId: activeReader.id,
        readerName: activeReader.name,
        topic: 'second-opinion',
        question,
        spreadId: 'second-opinion',
        spreadName: 'Góc Nhìn Khách Quan (Second Opinion)',
        cards,
        punchline: generated.punchline,
        generalOverview: generated.generalOverview,
        cardsAnalysis: generated.cardsAnalysis,
        realityCheck: generated.realityCheck,
        actionAdvice: generated.actionAdvice,
        verdict: generated.verdict,
        closingMessage: generated.closingMessage,
        mirrorView: generated.mirrorView,
        threeDayActionPlan: generated.threeDayActionPlan,
        shareableQuote: generated.shareableQuote,
      };

      if (!isVip) {
        setCredits((prev) => Math.max(0, prev - 1));
      }

      setCurrentReading(newReadingResult);
      setWorkflowStep('result');
      soundEffects.playReveal();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorNotification('Không thể hoàn tất luận giải. Vui lòng thử lại.');
      setWorkflowStep('config');
    } finally {
      setIsGeneratingReading(false);
    }
  };

  // Save to journal
  const handleSaveToJournal = (reading: ReadingResult) => {
    if (savedReadings.some((r) => r.id === reading.id)) {
      showToast('Tụ bài này đã có trong nhật ký của bạn!');
      return;
    }
    setSavedReadings((prev) => [reading, ...prev]);
    showToast('Đã lưu vào Nhật Ký Tarot thành công!');
  };

  // Delete from journal
  const handleDeleteFromJournal = (id: string) => {
    setSavedReadings((prev) => prev.filter((r) => r.id !== id));
    showToast('Đã xóa khỏi nhật ký.');
  };

  // Purchase handler
  const handlePurchaseSuccess = (creditsAdded: number, isVipAdded: boolean) => {
    if (isVipAdded) {
      setIsVip(true);
      showToast('Chúc mừng bạn đã kích hoạt Hội viên VIP Tháng Không Giới Hạn!');
    } else {
      setCredits((prev) => prev + creditsAdded);
      showToast(`Nạp thành công +${creditsAdded} lượt xem chuyên sâu!`);
    }
  };

  const handleDailyDrawn = () => {
    setLastDailyDate(todayStr);
    localStorage.setItem('tarot_daily_date', todayStr);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#EC4899] selection:text-white">
      {/* Ethereal Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-[#9333EA]/18 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-[#EC4899]/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-[#9333EA]/16 rounded-full blur-[150px]" />
      </div>

      {/* Main Header */}
      <Header
        readers={READERS}
        activeReader={activeReader}
        onSelectReader={setActiveReader}
        credits={credits}
        isVip={isVip}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenDaily={() => setIsDailyOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenSecondOpinion={() => setIsSecondOpinionOpen(true)}
        hasDrawnDailyToday={hasDrawnDailyToday}
        savedCount={savedReadings.length}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-xs shadow-[0_0_25px_rgba(236,72,153,0.4)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#FCD34D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error alert */}
      {errorNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-medium text-xs shadow-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorNotification}</span>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        {workflowStep === 'config' && (
          <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
            {/* HERO BANNER - ETHEREAL TAROT (Bỏ vạch trần sự thật, giữ Tarot Realist) */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#9333EA]/15 border border-[#9333EA]/35 text-[#FCD34D] text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Ethereal Tarot • Chiêm Tinh &amp; Phong Cách Whimsical</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-normal text-[#F3F4F6] leading-tight drop-shadow-md font-sans">
                TAROT REALIST
              </h1>
              <p className="text-sm sm:text-base italic text-transparent bg-clip-text bg-gradient-to-r from-[#FCD34D] via-[#EC4899] to-[#9333EA] mt-1 font-semibold font-sans">
                Nghệ Thuật Bài Tarot Hiện Đại &amp; Tươi Sáng
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Đọc vị tâm lý sắc bén, đối thoại cùng AI Reader và khám phá góc nhìn đối phương với phong cách Ethereal huyền ảo.
              </p>

              {/* Free Trial Banner */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full ethereal-glass text-xs text-[#FCD34D] border border-[#FCD34D]/40 shadow-[0_0_20px_rgba(252,211,77,0.15)]">
                <Zap className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Mỗi người được xem <strong>1 lượt miễn phí</strong> duy nhất (Lượt lẻ: 10K • Gói Pro: 69K • VIP: 99K/tháng)</span>
              </div>
            </div>

            {/* STEP 1: SELECT YOUR READER PERSONA */}
            <div className="rounded-3xl ethereal-glass p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    1
                  </span>
                  <span>Chọn Reader Bạn Tin Tưởng</span>
                </div>
                <span className="text-[11px] text-slate-400">4 Cá Tính Độc Bản</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {READERS.map((r) => {
                  const isSelected = activeReader.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setActiveReader(r);
                        soundEffects.playShuffle();
                      }}
                      className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#9333EA]/25 via-[#120E1E] to-[#120E1E] border-[#FCD34D] shadow-[0_0_25px_rgba(236,72,153,0.3)] scale-[1.02]'
                          : 'bg-[#120E1E]/60 border-white/10 hover:border-[#9333EA]/40'
                      }`}
                    >
                      {/* Badges */}
                      <div className="flex items-center justify-between mb-3 w-full">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.badgeColor}`}>
                          {r.badge}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            r.modelBadge.includes('Claude')
                              ? 'bg-amber-500/20 text-[#FCD34D] border border-amber-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {r.modelBadge}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.avatarBg} flex items-center justify-center text-2xl border border-white/15 shadow-md`}>
                            {r.avatar}
                          </div>
                          <div>
                            <h4 className="reader-name font-bold text-sm text-white tracking-normal font-sans">
                              {r.name}
                            </h4>
                            <p className="text-[10px] text-[#FCD34D]/80">{r.title}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 italic mb-2 line-clamp-2">
                          {r.sampleQuote}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span>⭐ {r.rating} ({r.totalReadings} lượt)</span>
                        {isSelected && <span className="text-[#FCD34D] font-bold">✓ Đang Chọn</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SELECT SPREAD & TOPIC */}
            <div className="rounded-3xl ethereal-glass p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    2
                  </span>
                  <span>Chọn Chủ Đề &amp; Dạng Trải Bài</span>
                </div>
                <button
                  onClick={() => setIsSecondOpinionOpen(true)}
                  className="text-xs text-[#EC4899] hover:text-[#f472b6] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tự Nhập Bài Đã Rút</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SPREADS.map((spread) => {
                  const isSelected = selectedSpread.id === spread.id;
                  const icons: Record<string, any> = {
                    love: Heart,
                    career: Briefcase,
                    yesno: Zap,
                    'second-opinion': Eye,
                    comprehensive: Crown,
                  };
                  const IconComponent = icons[spread.category] || Sparkles;

                  return (
                    <div
                      key={spread.id}
                      onClick={() => {
                        setSelectedSpread(spread);
                        if (spread.suggestedQuestions.length > 0) {
                          setCustomQuestion(spread.suggestedQuestions[0]);
                        }
                      }}
                      className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#9333EA]/20 border-[#FCD34D] shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                          : 'bg-[#120E1E]/60 border-white/10 hover:border-[#9333EA]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#9333EA]/20 border border-[#9333EA]/40 flex items-center justify-center text-[#FCD34D]">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {spread.cardCount} Lá
                          </span>
                        </div>
                        {spread.isVipOnly && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white">
                            VIP
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-white mb-1">
                        {spread.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed line-clamp-2">
                        {spread.description}
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-[#FCD34D] font-medium">{spread.tag}</span>
                        {isSelected && <span className="text-[#FCD34D] font-bold">✓ Đã chọn</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: QUESTION INPUT & PRESETS */}
            <div className="rounded-3xl ethereal-glass p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    3
                  </span>
                  <span>Câu Hỏi Của Bạn</span>
                </div>
                <span className="text-[11px] text-slate-400">Hỏi cụ thể để phán chuẩn nhất</span>
              </div>

              {/* Input text */}
              <div>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Gõ câu hỏi bạn đang băn khoăn (VD: Người ấy nghĩ gì về mình? Có nên chuyển việc?)..."
                  className="w-full rounded-2xl bg-[#0B0F19]/90 border border-[#9333EA]/30 focus:border-[#FCD34D] px-5 py-3.5 text-sm text-[#F3F4F6] placeholder-slate-500 outline-none transition-colors shadow-inner"
                />
              </div>

              {/* Suggested Presets */}
              <div>
                <div className="text-[11px] text-slate-400 mb-2 font-medium">
                  Hoặc chọn nhanh câu hỏi hot hit:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSpread.suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomQuestion(q)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                        customQuestion === q
                          ? 'bg-[#9333EA]/25 border-[#FCD34D] text-[#FCD34D] font-medium'
                          : 'bg-[#0B0F19]/80 border-white/10 text-slate-300 hover:border-[#9333EA]/40'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Notes */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                  Chia sẻ thêm bối cảnh để Reader soi kỹ hơn (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="VD: Chúng mình quen nhau 6 tháng, tuần trước cãi nhau vì chuyện người yêu cũ, hiện đang im lặng..."
                  className="w-full rounded-xl bg-[#0B0F19]/90 border border-white/10 focus:border-[#FCD34D] px-4 py-2 text-xs text-[#F3F4F6] placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              {/* Action Button: Proceed to draw */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  {isVip ? (
                    <span className="text-[#FCD34D] font-bold">
                      👑 Quyền lợi VIP: Rút bài không giới hạn
                    </span>
                  ) : credits > 0 ? (
                    <span>
                      Bạn có <strong className="text-[#FCD34D]">{credits} lượt xem miễn phí</strong> (Tiêu tốn 1 lượt)
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      Đã dùng hết 1 lượt miễn phí • Cần nạp lượt (10K) hoặc VIP (99K)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleProceedToDraw}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#9333EA] hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(236,72,153,0.35)] active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FCD34D]" />
                  <span>Bước Vào Bàn Rút Bài Cùng {activeReader.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Benefits Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl ethereal-glass">
                <div className="text-[#FCD34D] font-bold text-xs uppercase mb-1">
                  100% Thực Tế &amp; Logic
                </div>
                <p className="text-[11px] text-slate-400">
                  Bóc tách tâm lý, chỉ rõ điểm mù, không phán nước đôi mê tín dị đoan.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl ethereal-glass">
                <div className="text-[#EC4899] font-bold text-xs uppercase mb-1">
                  🪞 The Mirror View
                </div>
                <p className="text-[11px] text-slate-400">
                  Đọc vị suy nghĩ, lớp phòng thủ &amp; nỗi sợ ngầm của người cũ / đối phương.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl ethereal-glass">
                <div className="text-emerald-400 font-bold text-xs uppercase mb-1">
                  📋 Action Plan 3 Ngày
                </div>
                <p className="text-[11px] text-slate-400">
                  Liệu pháp gỡ rối tâm lý với danh sách việc làm cụ thể từng ngày.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl ethereal-glass">
                <div className="text-[#FCD34D] font-bold text-xs uppercase mb-1">
                  1 Lượt Free • 10K/Lượt
                </div>
                <p className="text-[11px] text-slate-400">
                  1 lượt xem miễn phí, lượt lẻ 10K, gói Pro 69K và VIP 99K/tháng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DRAWING DECK BOARD */}
        {workflowStep === 'drawing' && (
          <div className="w-full flex flex-col items-center">
            {/* Top context bar */}
            <div className="w-full max-w-5xl px-4 pt-6 flex items-center justify-between">
              <button
                onClick={() => setWorkflowStep('config')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                ← Đổi câu hỏi / Chọn lại dạng bài
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Reader:</span>
                <span className="font-bold text-[#FCD34D] flex items-center gap-1">
                  <span>{activeReader.avatar}</span>
                  <span>{activeReader.name}</span>
                </span>
              </div>
            </div>

            {/* Question reminder */}
            <div className="text-center px-4 mt-2">
              <div className="text-sm sm:text-base font-serif font-bold text-white italic max-w-xl mx-auto">
                "{customQuestion}"
              </div>
            </div>

            {/* Deck Board */}
            <DeckBoard
              spread={selectedSpread}
              onCardsReady={handleCardsReady}
              isGeneratingReading={isGeneratingReading}
            />
          </div>
        )}

        {/* STEP 3: READING RESULT VIEW */}
        {workflowStep === 'result' && currentReading && (
          <ReadingResultView
            reading={currentReading}
            reader={activeReader}
            onNewReading={() => {
              setWorkflowStep('config');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveToJournal={handleSaveToJournal}
            isSaved={savedReadings.some((r) => r.id === currentReading.id)}
            canChatDeeply={isVip || credits > 0}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-[#0B0F19]/90 py-8 px-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-serif font-bold">
            <span>✨ TAROT REALIST</span>
            <span>•</span>
            <span className="text-[11px] font-sans font-normal text-slate-400">
              Ethereal Tarot Edition
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-[#FCD34D] cursor-pointer"
            >
              Bảng Giá (10K - 99K)
            </button>
            <button
              onClick={() => setIsSecondOpinionOpen(true)}
              className="hover:text-[#FCD34D] cursor-pointer"
            >
              Góc Nhìn Khách Quan
            </button>
            <button
              onClick={() => setIsDailyOpen(true)}
              className="hover:text-[#FCD34D] cursor-pointer"
            >
              Lá Bài Ngày
            </button>
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentCredits={credits}
        isVip={isVip}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <DailyCardModal
        isOpen={isDailyOpen}
        onClose={() => setIsDailyOpen(false)}
        activeReader={activeReader}
        onDailyDrawn={handleDailyDrawn}
      />

      <SecondOpinionModal
        isOpen={isSecondOpinionOpen}
        onClose={() => setIsSecondOpinionOpen(false)}
        activeReader={activeReader}
        onSubmitSecondOpinion={handleSecondOpinionSubmit}
      />

      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        savedReadings={savedReadings}
        onSelectReading={(reading) => {
          setCurrentReading(reading);
          const matchedReader = READERS.find((r) => r.id === reading.readerId) || READERS[0];
          setActiveReader(matchedReader);
          setWorkflowStep('result');
        }}
        onDeleteReading={handleDeleteFromJournal}
      />
    </div>
  );
}
