import React from 'react';
import { DrawnCard } from '../types';
import { TarotCard } from '../data/tarotDeck';
import { CardArtIllustration } from './CardArtIllustration';

interface TarotCardViewProps {
  card?: DrawnCard | TarotCard | null;
  isFlipped?: boolean;
  isReversed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  positionLabel?: string;
  onClick?: () => void;
  isInteractive?: boolean;
  className?: string;
}

export const TarotCardView: React.FC<TarotCardViewProps> = ({
  card,
  isFlipped = false,
  isReversed = false,
  size = 'md',
  positionLabel,
  onClick,
  isInteractive = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-28 h-44 text-xs',
    md: 'w-40 h-64 text-sm',
    lg: 'w-52 h-80 text-base',
  };

  const actualReversed = (card && 'isReversed' in card) ? (card as DrawnCard).isReversed : isReversed;

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      className={`group relative perspective-1000 ${sizeClasses[size]} ${
        isInteractive ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300' : ''
      } ${className}`}
    >
      {/* Position label header if provided */}
      {positionLabel && (
        <div className="absolute -top-6 left-0 right-0 text-center font-serif text-xs text-[#FCD34D] tracking-wide truncate px-1">
          {positionLabel}
        </div>
      )}

      {/* 3D Flip Card Container */}
      <div
        className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] rounded-2xl shadow-2xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* CARD BACK - ETHEREAL TAROT STYLE */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden border border-[#FCD34D]/50 bg-gradient-to-b from-[#120E1E] via-[#0B0F19] to-[#1a0f2e] p-3 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(147,51,234,0.25)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.35)] transition-shadow">
          {/* Ornate corner stars */}
          <div className="w-full flex justify-between text-[#FCD34D] text-[10px]">
            <span>✧</span>
            <span className="text-[8px] text-[#EC4899]">✦</span>
            <span>✧</span>
          </div>

          {/* Central Sacred Geometry Whimsical Mandala */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-[#FCD34D]/40 bg-[#9333EA]/10 shadow-[0_0_15px_rgba(147,51,234,0.4)]">
            <div className="absolute inset-1.5 border border-dashed border-[#FCD34D]/50 rounded-full animate-spin-slow" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#EC4899]/30 to-[#9333EA]/30 backdrop-blur-sm" />
            <span className="text-2xl select-none filter drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">
              ✨
            </span>
          </div>

          {/* Whimsical branding footer */}
          <div className="w-full text-center">
            <div className="text-[10px] font-serif tracking-[0.25em] text-[#FCD34D] uppercase font-bold">
              TAROT REALIST
            </div>
            <div className="text-[8px] text-[#EC4899]/80 tracking-widest mt-0.5">
              ETHEREAL ORACLE
            </div>
          </div>

          <div className="w-full flex justify-between text-[#FCD34D] text-[10px]">
            <span>✧</span>
            <span className="text-[8px] text-[#EC4899]">✦</span>
            <span>✧</span>
          </div>
        </div>

        {/* CARD FRONT - MODERN WHIMSICAL ETHEREAL STYLE */}
        <div
          className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden border border-[#FCD34D]/60 p-2.5 flex flex-col justify-between shadow-[0_0_25px_rgba(147,51,234,0.3)] bg-gradient-to-b from-[#120E1E] via-[#0B0F19] to-[#05070d]"
        >
          {card ? (
            <div
              className={`w-full h-full flex flex-col justify-between transition-transform duration-300 ${
                actualReversed ? 'rotate-180' : ''
              }`}
            >
              {/* Card top bar */}
              <div className="flex items-center justify-between border-b border-[#FCD34D]/30 pb-1">
                <span className="font-serif text-[11px] font-bold text-[#FCD34D] tracking-wide truncate max-w-[70%]">
                  {card.nameVi}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold tracking-tight ${
                    actualReversed
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {actualReversed ? 'Ngược' : 'Xuôi'}
                </span>
              </div>

              {/* Whimsical Vector Illustration Canvas */}
              <div className="relative flex-1 my-1.5 rounded-xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center bg-black/40">
                <CardArtIllustration cardId={card.id} className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B0F19]/80 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 left-0 right-0 text-center font-serif text-[10px] text-[#F3F4F6] italic tracking-wider px-1 drop-shadow-md">
                  {card.name}
                </div>
              </div>

              {/* Card Footer Keywords */}
              <div className="border-t border-[#FCD34D]/25 pt-1 text-center">
                <p className="text-[9px] text-[#F3F4F6]/90 line-clamp-2 leading-tight">
                  {card.keywords}
                </p>
                <div className="mt-0.5 text-[8px] text-[#FCD34D]/80 flex items-center justify-center gap-1">
                  <span>✦ Hệ {card.element} ✦</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-serif">
              Chưa lật bài
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
