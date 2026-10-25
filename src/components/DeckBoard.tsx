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
      <div className="w-full max-w-5xl py-6 px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{spread.name} ({spread.cardCount} lá)</span>
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            {isComplete
              ? 'Tất cả các lá bài đã được an bài. Hãy bấm để Reader luận giải sự thật!'
              : `Hãy chạm vào lá bài bên dưới hoặc bấm "Rút Nhanh" để lật mở từng vị trí (${drawnCards.length}/${spread.cardCount})`}
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
                className="flex flex-col items-center bg-slate-900/60 border border-amber-500/15 rounded-2xl p-3 backdrop-blur-sm shadow-xl transition-all hover:border-amber-500/30"
              >
                {/* Slot Position Title */}
                <div className="w-full text-center mb-3">
                  <div className="text-xs font-semibold text-amber-400 line-clamp-1">
                    {index + 1}. {pos.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {pos.description}
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
                    className="w-36 h-56 sm:w-36 sm:h-56 rounded-xl border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:border-amber-400 transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-amber-200 mt-3">
                      Bốc lá thứ {index + 1}
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
      <div className="w-full max-w-2xl px-4 py-4 mt-2 flex flex-col items-center">
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
                    className={`absolute w-12 h-20 rounded-md border border-amber-500/40 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 shadow-md cursor-pointer hover:-translate-y-2 hover:border-amber-300 transition-all duration-200 flex items-center justify-center ${
                      isShuffling ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="text-[10px] text-amber-400/50">✧</div>
                  </div>
                );
              })}
            </div>

            {/* Deck buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Xào Lại Bài</span>
              </button>

              <button
                onClick={handleDrawCard}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Rút Lá Kế Tiếp</span>
              </button>

              <button
                onClick={handleAutoDrawAll}
                className="px-4 py-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rút Nhanh Tất Cả</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => onCardsReady(drawnCards)}
              disabled={isGeneratingReading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
            >
              {isGeneratingReading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Reader Đang Bóc Mẽ &amp; Soi Tụ Bài...</span>
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  <span>Xem Luận Giải Sắc Sảo &amp; Thực Tế Ngay</span>
                </>
              )}
            </button>

            <button
              onClick={handleShuffle}
              disabled={isGeneratingReading}
              className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
            >
              Bốc lại tụ bài khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
