import React, { useState, useEffect } from 'react';
import { SpreadConfig } from '../data/spreads';
import { TAROT_DECK, TarotCard } from '../data/tarotDeck';
import { DrawnCard } from '../types';
import { TarotCardView } from './TarotCardView';
import { soundEffects } from '../utils/audio';
import { Sparkles, Shuffle, RefreshCw, Eye } from 'lucide-react';

interface DeckBoardProps {
  spread: SpreadConfig;
  onCardsReady: (cards: DrawnCard[]) => void;
  isGeneratingReading: boolean;
}

export const DeckBoard: React.FC<DeckBoardProps> = ({
  spread,
  onCardsReady,
  isGeneratingReading,
}) => {
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<boolean[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [fannedCards, setFannedCards] = useState<number[]>([]);

  // Initialize slots
  useEffect(() => {
    resetBoard();
  }, [spread]);

  const resetBoard = () => {
    setDrawnCards([]);
    setFlippedIndices(new Array(spread.cardCount).fill(false));
    // Generate an array of 24 card backs in the fanned deck
    setFannedCards(Array.from({ length: 24 }, (_, i) => i));
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    soundEffects.playShuffle();
    setTimeout(() => {
      setIsShuffling(false);
      resetBoard();
    }, 600);
  };

  // Draw card for next slot
  const handleDrawCard = () => {
    if (drawnCards.length >= spread.cardCount) return;

    soundEffects.playFlip();

    // Pick random unique card not yet drawn
    const availableCards = TAROT_DECK.filter(
      (c) => !drawnCards.some((dc) => dc.id === c.id)
    );
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

    // 25% chance of reversed
    const isReversed = Math.random() < 0.25;
    const currentPosition = spread.positions[drawnCards.length];

    const newDrawnCard: DrawnCard = {
      ...randomCard,
      isReversed,
      positionName: currentPosition.name,
      positionDescription: currentPosition.description,
    };

    const nextIndex = drawnCards.length;
    setDrawnCards((prev) => [...prev, newDrawnCard]);

    // Flip card with reveal sound
    setTimeout(() => {
      soundEffects.playReveal();
      setFlippedIndices((prev) => {
        const copy = [...prev];
        copy[nextIndex] = true;
        return copy;
      });
    }, 300);
  };

  // Quick Draw All
  const handleAutoDrawAll = () => {
    if (drawnCards.length >= spread.cardCount) return;

    soundEffects.playShuffle();
    const remainingCount = spread.cardCount - drawnCards.length;
    const availableCards = [...TAROT_DECK.filter((c) => !drawnCards.some((dc) => dc.id === c.id))];

    // Shuffle available
    for (let i = availableCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCards[i], availableCards[j]] = [availableCards[j], availableCards[i]];
    }

    const newAdditions: DrawnCard[] = [];
    for (let i = 0; i < remainingCount; i++) {
      const card = availableCards[i];
      const isReversed = Math.random() < 0.25;
      const currentPosition = spread.positions[drawnCards.length + i];
      newAdditions.push({
        ...card,
        isReversed,
        positionName: currentPosition.name,
        positionDescription: currentPosition.description,
      });
    }

    const fullDrawn = [...drawnCards, ...newAdditions];
    setDrawnCards(fullDrawn);

    // Progressive flip
    fullDrawn.forEach((_, idx) => {
      setTimeout(() => {
        soundEffects.playReveal();
        setFlippedIndices((prev) => {
          const copy = [...prev];
          copy[idx] = true;
          return copy;
        });
      }, (idx + 1) * 220);
    });
  };

  const isComplete = drawnCards.length === spread.cardCount;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Spread Slots Area */}
      <div className="w-full max-w-5xl py-4 px-4">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#FCD34D] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>{spread.name} • {spread.cardCount} lá</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isComplete
              ? 'Tụ bài đã an bài. Chạm nút bên dưới để xem luận giải!'
              : `Chạm lá bài để lật mở (${drawnCards.length}/${spread.cardCount})`}
          </p>
        </div>

        {/* Dynamic Card Grid based on count */}
        <div
          className={`grid gap-4 sm:gap-6 justify-center items-start ${
            spread.cardCount === 1
              ? 'grid-cols-1 max-w-xs mx-auto'
              : spread.cardCount === 3
              ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-5xl mx-auto'
          }`}
        >
          {spread.positions.map((pos, index) => {
            const card = drawnCards[index];
            const isFlipped = flippedIndices[index] || false;

            return (
              <div
                key={pos.index}
                className="flex flex-col items-center bg-slate-900/60 border border-[#9333EA]/20 rounded-2xl p-3 backdrop-blur-sm shadow-xl transition-all hover:border-[#9333EA]/40"
              >
                {/* Slot Position Title */}
                <div className="w-full text-center mb-2">
                  <div className="text-xs font-semibold text-[#FCD34D] line-clamp-1">
                    {index + 1}. {pos.name}
                  </div>
                </div>

                {/* Card slot or Drawn Card */}
                {card ? (
                  <TarotCardView
                    card={card}
                    isFlipped={isFlipped}
                    size={spread.cardCount > 3 ? 'sm' : 'md'}
                  />
                ) : (
                  <button
                    onClick={handleDrawCard}
                    className="w-36 h-56 sm:w-36 sm:h-56 rounded-xl border-2 border-dashed border-[#9333EA]/30 hover:border-[#FCD34D] bg-[#9333EA]/5 hover:bg-[#9333EA]/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#9333EA]/30 flex items-center justify-center text-[#FCD34D] group-hover:scale-110 group-hover:border-[#FCD34D] transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 mt-3">
                      Lá thứ {index + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Chạm để rút
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar & Fanned Deck */}
      <div className="w-full max-w-2xl px-4 py-2 flex flex-col items-center">
        {!isComplete ? (
          <div className="flex flex-col items-center w-full">
            {/* Interactive Fanned Deck Preview */}
            <div className="relative h-20 w-72 flex justify-center items-center select-none my-2 overflow-visible">
              {fannedCards.slice(0, 15).map((num, i) => {
                const rotation = (i - 7) * 4;
                const translateY = Math.abs(i - 7) * 2;
                return (
                  <div
                    key={num}
                    onClick={handleDrawCard}
                    style={{
                      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                      zIndex: i,
                    }}
                    className={`absolute w-12 h-20 rounded-md border border-[#9333EA]/40 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 shadow-md cursor-pointer hover:-translate-y-2 hover:border-[#FCD34D] transition-all duration-200 flex items-center justify-center ${
                      isShuffling ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="text-[10px] text-[#FCD34D]/50">✧</div>
                  </div>
                );
              })}
            </div>

            {/* Deck buttons */}
            <div className="flex items-center gap-2.5 mt-3">
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Xào Lại</span>
              </button>

              <button
                onClick={handleDrawCard}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
                <span>Rút Tiếp</span>
              </button>

              <button
                onClick={handleAutoDrawAll}
                className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rút Nhanh</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <button
              onClick={() => onCardsReady(drawnCards)}
              disabled={isGeneratingReading}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#9333EA] hover:opacity-95 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-900/40 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
            >
              {isGeneratingReading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Luận Giải...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-[#FCD34D]" />
                  <span>Xem Luận Giải Ngay</span>
                </>
              )}
            </button>

            <button
              onClick={handleShuffle}
              disabled={isGeneratingReading}
              className="text-xs text-slate-400 hover:text-[#FCD34D] cursor-pointer"
            >
              Rút lại tụ bài khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
