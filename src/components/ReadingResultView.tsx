import React, { useState } from 'react';
import { ReadingResult, ChatMessage } from '../types';
import { ReaderPersona } from '../data/readers';
import { ShareStoryModal } from './ShareStoryModal';
import {
  Sparkles,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RotateCcw,
  Eye,
  CalendarCheck,
  ShieldAlert,
  HelpCircle,
  Check,
  Camera,
} from 'lucide-react';

interface ReadingResultViewProps {
  reading: ReadingResult;
  reader: ReaderPersona;
  onNewReading: () => void;
  onSaveToJournal: (reading: ReadingResult) => void;
  isSaved: boolean;
  canChatDeeply: boolean;
  onOpenPricing: () => void;
}

export const ReadingResultView: React.FC<ReadingResultViewProps> = ({
  reading,
  reader,
  onNewReading,
  onSaveToJournal,
  isSaved,
  canChatDeeply,
  onOpenPricing,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Active view mode: 'standard' | 'mirror' (The Mirror View - Góc nhìn đối phương)
  const [activePerspective, setActivePerspective] = useState<'standard' | 'mirror'>('standard');

  // 3-day action checklist checked items
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});

  const toggleDayCheck = (day: number) => {
    setCompletedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Send message to reader
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage.trim(),
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/tarot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: reader.id,
          message: userMsg.text,
          chatHistory: chatMessages.slice(-4),
          readingContext: {
            question: reading.question,
            punchline: reading.punchline,
            cards: reading.cards,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: data.reply,
            timestamp: Date.now(),
          },
        ]);
      } else {
        throw new Error(data.error || 'Lỗi khi trò chuyện');
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Đừng hỏi dồn dập thế, Reader đang uống ngụm nước trà! Nhưng tóm lại là: đừng tự lừa dối mình nữa nhé!`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const mirror = reading.mirrorView;
  const actionPlan = reading.threeDayActionPlan || [];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Top Banner: Reader Intro & Question */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reader.avatarBg} flex items-center justify-center text-3xl shadow-lg border`}>
              {reader.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="reader-name font-bold text-lg text-white tracking-normal font-sans">
                  {reader.name}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${reader.badgeColor}`}>
                  {reader.badge}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                  reader.modelBadge.includes('Claude')
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {reader.modelBadge}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">{reader.tagline}</p>
            </div>
          </div>

          {/* Action buttons: Share story, save, copy */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600/30 to-pink-600/30 hover:from-fuchsia-600/50 hover:to-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-pink-300" />
              <span>📸 Khoe Story / Threads</span>
            </button>

            <button
              onClick={() => onSaveToJournal(reading)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
              <span>{isSaved ? 'Đã Lưu' : 'Lưu'}</span>
            </button>
          </div>
        </div>

        {/* Question Details */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Câu hỏi của bạn ({reading.spreadName})
          </div>
          <div className="text-base sm:text-lg font-medium text-slate-100 mt-1 italic">
            "{reading.question}"
          </div>
        </div>

        {/* THE PUNCHLINE (Hero highlight) */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-purple-500/15 border border-[#FCD34D]/40 relative">
          <div className="flex items-center gap-2 text-[#FCD34D] text-xs font-bold uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-[#EC4899]" />
            <span>Thông Điệp Trọng Tâm</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-[#F3F4F6] leading-snug">
            "{reading.punchline}"
          </p>
        </div>
      </div>

      {/* FEATURE 1: PERSPECTIVE SWITCH (GÓC NHÌN BẢN THÂN VS GÓC NHÌN ĐỐI PHƯƠNG / THE MIRROR VIEW) */}
      <div className="rounded-2xl bg-slate-900/90 border border-[#9333EA]/30 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5 mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
              <Eye className="w-3.5 h-3.5 text-[#EC4899]" />
              <span>Góc Nhìn Luận Giải</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Lựa Chọn Lăng Kính Tâm Lý
            </h4>
          </div>

          {/* Toggle pill buttons */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActivePerspective('standard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePerspective === 'standard'
                  ? 'bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Góc Nhìn Thực Tế
            </button>
            <button
              onClick={() => setActivePerspective('mirror')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePerspective === 'mirror'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <span>🪞 Đọc Vị Đối Phương</span>
            </button>
          </div>
        </div>

        {activePerspective === 'mirror' ? (
          /* THE MIRROR VIEW: Đọc suy nghĩ đối phương */
          <div className="space-y-3.5 animate-fade-in">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
              💡 <strong>Đọc vị đối phương:</strong> Phân tích cảm xúc thật, lớp phòng thủ và nỗi sợ ngầm họ đang giấu bạn.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partner Thoughts */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20">
                <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>💭</span>
                  <span>Họ Đang Nghĩ Gì Trong Đầu Về Bạn?</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {mirror?.partnerThoughts || 'Họ cảm thấy áp lực khi bạn cần một câu trả lời dứt khoát, và đang cố giữ khoảng cách an toàn để quan sát phản ứng của bạn.'}
                </p>
              </div>

              {/* Defense Mechanism */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Lớp Mặt Nạ / Hàng Phòng Thủ Họ Dựng Lên</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {mirror?.defenseMechanism || 'Sự im lặng, lạnh lùng, lấy cớ bận rộn công việc để tránh các cuộc nói chuyện cảm xúc sâu sắc.'}
                </p>
              </div>

              {/* Hidden Fears */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20">
                <div className="text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🥀</span>
                  <span>Nỗi Sợ Ngầm Họ Giấu Kín</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {mirror?.hiddenFears || 'Họ sợ bị phụ thuộc cảm xúc, sợ mất đi sự tự do hoặc sợ bản thân không đáp ứng được kỳ vọng của bạn.'}
                </p>
              </div>

              {/* What they wish you knew */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🤐</span>
                  <span>Điều Họ Muốn Bạn Hiểu Nhưng Không Nói Ra</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {mirror?.whatTheyWishYouKnew || 'Càng dồn ép họ giải thích, họ sẽ càng đẩy bạn ra xa hơn. Hãy lùi lại một bước để họ nhận ra khoảng trống khi thiếu bạn.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD PERSPECTIVE: Overview & Reality Check */
          <div className="space-y-6">
            <p className="text-sm text-slate-200 leading-relaxed">
              {reading.generalOverview}
            </p>

            {/* Reality Check */}
            <div className="rounded-2xl bg-gradient-to-br from-red-950/30 via-slate-950 to-slate-950 border border-red-500/30 p-5">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Sự Thật Trần Trụi (Bóc Tách Điểm Mù)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {reading.realityCheck}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cards Spread Display Overview */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Chi Tiết Từng Lá Bài Đã Rút</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reading.cards.map((card, idx) => {
            const analysis = reading.cardsAnalysis[idx];
            return (
              <div
                key={card.id + idx}
                className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 p-4 transition-all"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-amber-400">
                    Vị trí {idx + 1}: {card.positionName}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      card.isReversed
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {card.isReversed ? 'Ngược' : 'Xuôi'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-white/5">
                    {card.symbol}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-white text-sm">
                      {card.nameVi}
                    </h5>
                    <p className="text-[10px] text-slate-400 italic">{card.name}</p>
                    <p className="text-[10px] text-amber-300/80 mt-0.5">{card.keywords}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5 flex-1">
                  {analysis?.interpretation || card.uprightMeaning}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 2: LIỆU PHÁP CHỮA LÀNH & ACTION CHECKLIST 3 NGÀY TỚI */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-base font-bold text-white">
                Liệu Pháp Chữa Lành &amp; Action Checklist 3 Ngày Tới
              </h4>
              <p className="text-xs text-slate-400">
                Không chỉ đoán tương lai mà còn cho bạn bản kế hoạch hành động gỡ rối tâm lý cụ thể.
              </p>
            </div>
          </div>

          <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            {Object.values(completedDays).filter(Boolean).length}/3 Việc Đã Xong
          </div>
        </div>

        {/* 3 Days Steps List */}
        <div className="space-y-3.5">
          {actionPlan.map((step) => {
            const isDone = completedDays[step.day] || false;
            return (
              <div
                key={step.day}
                onClick={() => toggleDayCheck(step.day)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/50 opacity-90'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Custom Checkbox */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      {step.title}
                    </span>
                    {isDone && (
                      <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full font-bold">
                        Đã Hoàn Thành ✓
                      </span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm text-slate-200 leading-relaxed font-medium ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {step.task}
                  </p>
                  <p className="text-[11px] text-amber-300/80 italic mt-1">
                    💡 Lời khuyên: {step.advice}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict Banner */}
        <div className="mt-5 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Kết luận dứt khoát:</span>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {reading.verdict}
          </span>
        </div>
      </div>

      {/* Closing Message from Reader */}
      <div className="rounded-2xl bg-slate-900/60 border border-amber-500/20 p-4 sm:p-5 flex items-center gap-4">
        <div className="text-2xl shrink-0">{reader.avatar}</div>
        <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
          "{reading.closingMessage}"
        </p>
      </div>

      {/* Interactive Chat with Reader */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Trò Chuyện Hỏi Thêm Với {reader.name}
              </h4>
              <p className="text-[11px] text-slate-400">
                Thắc mắc thêm về tụ bài? Hãy hỏi thẳng để Reader bóc tách tiếp!
              </p>
            </div>
          </div>

          {!canChatDeeply && (
            <button
              onClick={onOpenPricing}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Mở khóa Chat sâu không giới hạn
            </button>
          )}
        </div>

        {/* Chat message history */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-4">
          {chatMessages.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Chưa có tin nhắn nào. Bạn có thể hỏi: <br />
              <span className="text-amber-300/80 italic">
                "Reader ơi, vậy em có nên nhắn tin cho ex không?"
              </span>{' '}
              hoặc{' '}
              <span className="text-amber-300/80 italic">
                "Tại sao lá bài bảo em đang tự lừa dối mình?"
              </span>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm shrink-0">
                    {reader.avatar}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {isSendingChat && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400 italic">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">
                {reader.avatar}
              </div>
              <span>{reader.name} đang gõ câu trả lời đanh thép...</span>
            </div>
          )}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Hỏi thêm ${reader.name} về tụ bài này...`}
            className="flex-1 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSendingChat}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>

      {/* Bottom CTA: Share Story, New Reading, Pricing */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Khoe Thẻ Bài Story / Threads (9:16)</span>
        </button>

        <button
          onClick={onNewReading}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Trải Bài Chủ Đề Mới</span>
        </button>

        <button
          onClick={onOpenPricing}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nạp Thêm Lượt (10K) / VIP (99K)</span>
        </button>
      </div>

      {/* Modal Xuất Ảnh Story */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reading={reading}
        reader={reader}
      />
    </div>
  );
};
