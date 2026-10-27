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
  CalendarCheck,
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

  // Persistent user ID for banking webhook matching
  const [userId] = useState<string>(() => {
    let uid = localStorage.getItem('tarot_user_id');
    if (!uid || !/^\d+$/.test(uid)) {
      uid = Math.floor(10000 + Math.random() * 90000).toString();
      localStorage.setItem('tarot_user_id', uid);
    }
    return uid;
  });

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

  // Sync with server Database / banking webhook status on load
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/user/status?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.user) {
          if (data.user.isVip) {
            setIsVip(true);
          }
          if (typeof data.user.credits === 'number' && data.user.credits > credits) {
            setCredits(data.user.credits);
          }
        }
      })
      .catch(() => {});
  }, [userId]);

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

  // Client-side fallback generator for 100% reliability
  const createClientFallbackReading = (
    reader: typeof activeReader,
    spread: typeof selectedSpread,
    question: string,
    cards: DrawnCard[]
  ) => {
    const primaryCard = cards[0] || {
      nameVi: 'Vị Vua Tiền Bạc',
      name: 'King of Pentacles',
      isReversed: false,
    };
    const cardNames = cards.map((c) => `${c.nameVi || c.name} (${c.isReversed ? 'ngược' : 'xuôi'})`).join(', ');

    const punchlines: Record<string, string> = {
      'madame-realist': `Lá ${primaryCard.nameVi || primaryCard.name} nhắc bạn: Đừng cố chấp tưới nước cho cây nhựa nữa, người ta không rep tin nhắn tức là câu trả lời rồi!`,
      'genz-boc-me': `Cờ đỏ bay rợp trời tưởng hội trại, lá ${primaryCard.nameVi || primaryCard.name} bảo bạn bớt simp và tỉnh cái đầu lại giùm!`,
      'chi-thao': `Lá ${primaryCard.nameVi || primaryCard.name} gửi đến bạn thông điệp yêu thương: Bạn đã kiên cường rất nhiều rồi, hãy cho phép bản thân nghỉ ngơi.`,
      'thay-triet-hoc': `Cục diện lá ${primaryCard.nameVi || primaryCard.name} cho thấy: Cờ tàn thì dừng, không thể dùng sự bốc đồng ngắn hạn để giải quyết ván cờ dài hạn.`,
    };

    return {
      punchline: punchlines[reader.id] || punchlines['madame-realist'],
      generalOverview: `Nhìn vào năng lượng tụ bài (${cardNames || 'Hiện tại'}), ${reader.name} thấy bạn đang tự dựng lên nhiều rào cản suy diễn hơn thực tế. Vấn đề không bế tắc như bạn nghĩ, điều cần làm lúc này là bước lùi một bước để nhìn rõ toàn cảnh bàn cờ.`,
      cardsAnalysis: cards.length > 0
        ? cards.map((c, i) => ({
            cardName: c.nameVi || c.name,
            position: c.positionName || `Lá ${i + 1}`,
            interpretation: `Với lá ${c.nameVi || c.name} ${c.isReversed ? 'ở thế ngược' : 'ở thế thuận'}, thông điệp muốn nhắn nhủ: ${
              c.isReversed
                ? 'Có sự ngập ngừng và sợ đối diện sự thật. Đừng tiếp tục trì hoãn việc đưa ra quyết định mà lòng bạn đã biết rõ.'
                : 'Năng lượng đang sẵn sàng chuyển biến tích cực nếu bạn dứt khoát nắm quyền chủ động và đặt ra ranh giới rõ ràng.'
            }`,
          }))
        : [
            {
              cardName: primaryCard.nameVi || primaryCard.name,
              position: 'Thông điệp trọng tâm',
              interpretation: 'Bạn đang tìm kiếm sự khẳng định từ bên ngoài trong khi câu trả lời thực ra đã nằm sẵn trong trực giác của bạn rồi.',
            },
          ],
      realityCheck: 'Vấn đề cốt lõi không phải do hoàn cảnh trớ trêu, mà là bạn đang ngần ngại bước ra khỏi vùng an toàn hoặc sợ đối diện sự thật đã an bài.',
      actionAdvice: [
        'Ngừng ngay việc suy diễn suy nghĩ của người khác, tập trung 100% vào điều bản thân có thể kiểm soát.',
        'Đặt ra hạn chót (deadline) rõ ràng: nếu sau 7 ngày không có động thái tích cực, dứt khoát chuyển hướng.',
        'Chăm sóc bản thân: ăn ngon, ngủ đủ giấc, tập trung vào công việc và mục tiêu độc lập.',
      ],
      verdict: 'Cần tỉnh táo, ngẩng cao đầu và hành động dứt khoát!',
      closingMessage: 'Thà đau ngắn một lần để tỉnh ngộ, còn hơn tự ru ngủ bản thân dài hạn trong hoài nghi nhé!',
      mirrorView: {
        partnerThoughts: 'Đối phương cảm thấy bạn đang dần nhìn thấu sự mập mờ của họ. Họ muốn giữ sự chú ý nhưng sợ phải cam kết trách nhiệm.',
        defenseMechanism: 'Họ chọn cách im lặng hoặc phản hồi chậm rãi để kiểm soát nhịp độ, buộc bạn phải là người sốt ruột trước.',
        hiddenFears: 'Họ sợ bị ràng buộc và sợ bạn phát hiện ra họ không hoàn hảo như những gì họ thể hiện ban đầu.',
        whatTheyWishYouKnew: 'Đừng ép họ phải đưa ra câu trả lời lúc này; nếu bị ép, câu trả lời sẽ là né tránh hoặc từ chối.',
      },
      shareableQuote: 'Người không trân trọng thời gian của mình thì mình nhẹ nhàng bước tiếp!',
    };
  };

  // Cards drawn on DeckBoard -> Request AI Reading
  const handleCardsReady = async (cards: DrawnCard[]) => {
    setIsGeneratingReading(true);

    try {
      let generated: any = null;

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

        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            generated = resData.data;
          }
        }
      } catch (fetchErr) {
        console.warn('API call error, switching to instant generation:', fetchErr);
      }

      if (!generated) {
        generated = createClientFallbackReading(activeReader, selectedSpread, customQuestion, cards);
      }

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
      console.error('Critical reading handler error:', err);
      const emergency = createClientFallbackReading(activeReader, selectedSpread, customQuestion, cards);
      setCurrentReading({
        id: Date.now().toString(),
        timestamp: Date.now(),
        readerId: activeReader.id,
        readerName: activeReader.name,
        topic: selectedSpread.category,
        question: customQuestion,
        spreadId: selectedSpread.id,
        spreadName: selectedSpread.name,
        cards,
        ...emergency,
      });
      setWorkflowStep('result');
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
      let generated: any = null;

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

        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            generated = resData.data;
          }
        }
      } catch (err) {
        console.warn('Second opinion API call error:', err);
      }

      if (!generated) {
        generated = createClientFallbackReading(activeReader, selectedSpread, question, cards);
      }

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
      const emergency = createClientFallbackReading(activeReader, selectedSpread, question, cards);
      setCurrentReading({
        id: Date.now().toString(),
        timestamp: Date.now(),
        readerId: activeReader.id,
        readerName: activeReader.name,
        topic: 'second-opinion',
        question,
        spreadId: 'second-opinion',
        spreadName: 'Góc Nhìn Khách Quan',
        cards,
        ...emergency,
      });
      setWorkflowStep('result');
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
            {/* HERO BANNER */}
            <div className="text-center max-w-xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-black tracking-normal text-[#F3F4F6] leading-tight font-sans">
                TAROT REALIST
              </h1>
              <p className="text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#FCD34D] via-[#EC4899] to-[#9333EA] mt-1 font-semibold">
                Đọc Vị Tâm Lý Thực Tế &amp; Lắng Nghe Bản Thân
              </p>

              {/* Free Trial & Pricing Banner */}
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full ethereal-glass text-xs text-[#FCD34D] border border-[#FCD34D]/30 shadow-[0_0_15px_rgba(252,211,77,0.12)]">
                <Zap className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>1 lượt Free • Lẻ 10K • Pro 69K • VIP 99K/tháng</span>
              </div>
            </div>

            {/* STEP 1: SELECT YOUR READER PERSONA */}
            <div className="rounded-2xl ethereal-glass p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    1
                  </span>
                  <span>Chọn Reader</span>
                </div>
                <span className="text-[11px] text-slate-400">4 Phong Cách Độc Bản</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {READERS.map((r) => {
                  const isSelected = activeReader.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setActiveReader(r);
                        soundEffects.playShuffle();
                      }}
                      className={`relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#9333EA]/20 border-[#FCD34D] shadow-[0_0_20px_rgba(236,72,153,0.25)] scale-[1.01]'
                          : 'bg-[#120E1E]/60 border-white/10 hover:border-[#9333EA]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 w-full">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.badgeColor}`}>
                          {r.badge}
                        </span>
                        <span className="text-[9px] text-[#FCD34D] font-medium">⭐ {r.rating}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${r.avatarBg} flex items-center justify-center text-xl border border-white/15 shadow-sm`}>
                            {r.avatar}
                          </div>
                          <div>
                            <h4 className="reader-name font-bold text-sm text-white tracking-normal font-sans">
                              {r.name}
                            </h4>
                            <p className="text-[10px] text-[#FCD34D]/80">{r.title}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 italic mb-1.5 line-clamp-2">
                          {r.sampleQuote}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{r.totalReadings} lượt xem</span>
                        {isSelected && <span className="text-[#FCD34D] font-bold">✓ Đang chọn</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SELECT SPREAD & TOPIC */}
            <div className="rounded-2xl ethereal-glass p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    2
                  </span>
                  <span>Chọn Dạng Trải Bài</span>
                </div>
                <button
                  onClick={() => setIsSecondOpinionOpen(true)}
                  className="text-xs text-[#EC4899] hover:text-[#f472b6] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tự Nhập Bài</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                      className={`relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#9333EA]/20 border-[#FCD34D] shadow-[0_0_15px_rgba(147,51,234,0.25)]'
                          : 'bg-[#120E1E]/60 border-white/10 hover:border-[#9333EA]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#9333EA]/20 border border-[#9333EA]/40 flex items-center justify-center text-[#FCD34D]">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {spread.cardCount} Lá
                          </span>
                        </div>
                        {spread.isVipOnly && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white">
                            VIP
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-white mb-0.5">
                        {spread.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-2 leading-tight line-clamp-2">
                        {spread.description}
                      </p>

                      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-[#FCD34D] font-medium">{spread.tag}</span>
                        {isSelected && <span className="text-[#FCD34D] font-bold">✓ Đã chọn</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: QUESTION INPUT & PRESETS */}
            <div className="rounded-2xl ethereal-glass p-4 sm:p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                  <span className="w-5 h-5 rounded-full bg-[#9333EA]/30 text-[#FCD34D] flex items-center justify-center text-[10px] border border-[#9333EA]/50">
                    3
                  </span>
                  <span>Câu Hỏi Của Bạn</span>
                </div>
                <span className="text-[11px] text-slate-400">Gõ hoặc chọn nhanh bên dưới</span>
              </div>

              {/* Input text */}
              <div>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Gõ câu hỏi bạn muốn hỏi bài Tarot..."
                  className="w-full rounded-xl bg-[#0B0F19]/90 border border-[#9333EA]/30 focus:border-[#FCD34D] px-4 py-2.5 text-xs sm:text-sm text-[#F3F4F6] placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              {/* Suggested Presets */}
              <div className="flex flex-wrap gap-1.5">
                {selectedSpread.suggestedQuestions.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomQuestion(q)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                      customQuestion === q
                        ? 'bg-[#9333EA]/25 border-[#FCD34D] text-[#FCD34D] font-medium'
                        : 'bg-[#0B0F19]/80 border-white/10 text-slate-300 hover:border-[#9333EA]/40'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Context Notes */}
              <div>
                <input
                  type="text"
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="Bối cảnh thêm (VD: Quen nhau 6 tháng, đang im lặng 3 ngày)... [tùy chọn]"
                  className="w-full rounded-xl bg-[#0B0F19]/90 border border-white/10 focus:border-[#FCD34D] px-3.5 py-2 text-[11px] text-[#F3F4F6] placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              {/* Action Button: Proceed to draw */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {isVip ? (
                    <span className="text-[#FCD34D] font-bold">
                      👑 VIP: Rút bài không giới hạn
                    </span>
                  ) : credits > 0 ? (
                    <span>
                      Còn <strong className="text-[#FCD34D]">{credits} lượt xem</strong> (Dùng 1 lượt)
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      Hết lượt xem • Lẻ 10K / Pro 69K / VIP 99K
                    </span>
                  )}
                </div>

                <button
                  onClick={handleProceedToDraw}
                  className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#9333EA] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FCD34D]" />
                  <span>Bắt Đầu Rút Bài</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sleek Minimal Feature Strip (Replaced 4 wordy paragraph boxes) */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400 py-1">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" /> 100% Thực Tế &amp; Logic</span>
              <span className="hidden sm:inline text-white/20">•</span>
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#EC4899]" /> Đọc Vị Đối Phương</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Thanh Toán VNPAY / QR Tự Động</span>
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
