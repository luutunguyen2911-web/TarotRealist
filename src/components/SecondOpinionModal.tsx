import React, { useState } from 'react';
import { TAROT_DECK, TarotCard } from '../data/tarotDeck';
import { DrawnCard } from '../types';
import { ReaderPersona } from '../data/readers';
import { X, Sparkles, Check, Search, HelpCircle } from 'lucide-react';

interface SecondOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeReader: ReaderPersona;
  onSubmitSecondOpinion: (question: string, cards: DrawnCard[], userNotes: string) => void;
}

export const SecondOpinionModal: React.FC<SecondOpinionModalProps> = ({
  isOpen,
  onClose,
  activeReader,
  onSubmitSecondOpinion,
}) => {
  const [question, setQuestion] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [selectedCards, setSelectedCards] = useState<{
    card: TarotCard;
    isReversed: boolean;
  }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredDeck = TAROT_DECK.filter(
    (c) =>
      c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleCard = (card: TarotCard) => {
    const existingIndex = selectedCards.findIndex((sc) => sc.card.id === card.id);
    if (existingIndex >= 0) {
      setSelectedCards(selectedCards.filter((_, i) => i !== existingIndex));
    } else {
      if (selectedCards.length >= 3) return;
      setSelectedCards([...selectedCards, { card, isReversed: false }]);
    }
  };

  const handleToggleOrientation = (index: number) => {
    setSelectedCards((prev) => {
      const copy = [...prev];
      copy[index].isReversed = !copy[index].isReversed;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || selectedCards.length === 0) return;

    const drawn: DrawnCard[] = selectedCards.map((sc, idx) => ({
      ...sc.card,
      isReversed: sc.isReversed,
      positionName: `Lá thứ ${idx + 1}`,
      positionDescription: `Lá tự rút ở ngoài thứ ${idx + 1}`,
    }));

    onSubmitSecondOpinion(question, drawn, userNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Góc Nhìn Khách Quan (Second Opinion)</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
          Luận Giải Bộ Bài Bạn Tự Rút Ở Nhà
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-6">
          Bạn đã bốc bài bằng bộ bài vật lý ở nhà hoặc đã xem ở nơi khác nhưng chưa rõ ràng?
          Hãy chọn các lá bài bạn có để {activeReader.name} mổ xẻ thực tế!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question input */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              1. Câu hỏi bạn đã đặt khi bốc bài: *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="VD: Người ấy có thật lòng muốn cam kết lâu dài với mình không?"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              2. Hoàn cảnh / Ghi chú thêm (tùy chọn):
            </label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="VD: Tụi mình đang im lặng 3 tuần nay rồi, bạn ấy vừa hủy follow Instagram..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Selected Cards Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200">
                3. Các lá bài bạn đã rút ({selectedCards.length}/3 lá): *
              </label>
              <span className="text-[11px] text-amber-400">
                Bấm vào lá bên dưới để chọn &amp; đổi Xuôi/Ngược
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 min-h-[90px]">
              {[0, 1, 2].map((slotIndex) => {
                const item = selectedCards[slotIndex];
                return (
                  <div
                    key={slotIndex}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-slate-700 text-center relative"
                  >
                    {item ? (
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xl">{item.card.symbol}</span>
                        <span className="text-[11px] font-bold text-white line-clamp-1 mt-1">
                          {item.card.nameVi}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleOrientation(slotIndex)}
                          className={`mt-1 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold cursor-pointer ${
                            item.isReversed
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.isReversed ? '🔄 Ngược' : '⬆️ Xuôi'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCards(selectedCards.filter((_, i) => i !== slotIndex))
                          }
                          className="text-[10px] text-red-400 hover:underline mt-1 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Chưa chọn lá {slotIndex + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Picker Search and Grid */}
          <div>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm lá bài (VD: The Fool, Chàng Khờ, Ba Kiếm...)"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
            </div>

            <div className="max-h-44 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/60">
              {filteredDeck.map((card) => {
                const isSelected = selectedCards.some((sc) => sc.card.id === card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleToggleCard(card)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base shrink-0">{card.symbol}</span>
                    <div className="truncate flex-1">
                      <div className="text-[11px] font-medium truncate">{card.nameVi}</div>
                      <div className="text-[9px] text-slate-400 truncate">{card.name}</div>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!question.trim() || selectedCards.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mời {activeReader.name} Luận Giải Sắc Sảo</span>
          </button>
        </form>
      </div>
    </div>
  );
};
