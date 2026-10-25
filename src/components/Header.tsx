import React from 'react';
import { ReaderPersona } from '../data/readers';
import {
  Sparkles,
  Crown,
  Bookmark,
  Zap,
  Coins,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  readers: ReaderPersona[];
  activeReader: ReaderPersona;
  onSelectReader: (reader: ReaderPersona) => void;
  credits: number;
  isVip: boolean;
  onOpenPricing: () => void;
  onOpenDaily: () => void;
  onOpenJournal: () => void;
  onOpenSecondOpinion: () => void;
  hasDrawnDailyToday: boolean;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  readers,
  activeReader,
  onSelectReader,
  credits,
  isVip,
  onOpenPricing,
  onOpenDaily,
  onOpenJournal,
  onOpenSecondOpinion,
  hasDrawnDailyToday,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/80 backdrop-blur-xl border-b border-[#9333EA]/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9333EA]/30 to-[#EC4899]/30 border border-[#FCD34D]/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(147,51,234,0.35)]">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#F3F4F6] via-[#FCD34D] to-[#EC4899]">
                TAROT REALIST
              </span>
              <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#9333EA]/20 text-[#EC4899] border border-[#9333EA]/40">
                Ethereal Edition
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Chiêm tinh sắc sảo &amp; phong cách Ethereal hiện đại
            </p>
          </div>
        </div>

        {/* Reader Selector Dropdown */}
        <div className="relative group hidden md:block">
          <button className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl ethereal-glass text-xs text-[#F3F4F6] hover:border-[#EC4899]/50 transition-all cursor-pointer">
            <span className="text-sm">{activeReader.avatar}</span>
            <div className="text-left">
              <div className="reader-name font-bold text-[11px] text-[#FCD34D] tracking-normal">{activeReader.name}</div>
              <div className="text-[9px] text-slate-400">{activeReader.title}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
          </button>

          <div className="absolute top-full left-0 mt-2 w-72 bg-[#120E1E]/95 backdrop-blur-2xl border border-[#9333EA]/40 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="text-[10px] font-bold text-[#FCD34D] uppercase tracking-wider px-2 py-1">
              Chọn Phong Cách Reader
            </div>
            {readers.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectReader(r)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeReader.id === r.id
                    ? 'bg-[#9333EA]/25 border border-[#9333EA]/50 text-white'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <span className="text-xl">{r.avatar}</span>
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="reader-name font-bold text-xs tracking-normal">{r.name}</span>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold ${
                        r.modelBadge.includes('Claude')
                          ? 'bg-amber-500/20 text-[#FCD34D] border border-amber-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {r.modelBadge}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{r.tagline}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Card Button */}
          <button
            onClick={onOpenDaily}
            className="relative px-3 py-1.5 rounded-xl ethereal-glass text-xs text-[#F3F4F6] hover:border-[#FCD34D]/50 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lá bài ngày miễn phí"
          >
            <Zap className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span className="hidden sm:inline">Lá Bài Ngày</span>
            {!hasDrawnDailyToday && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-ping" />
            )}
          </button>

          {/* Second Opinion (Tự Nhập Bài) */}
          <button
            onClick={onOpenSecondOpinion}
            className="px-3 py-1.5 rounded-xl ethereal-glass text-xs text-[#F3F4F6] hover:border-[#9333EA]/60 hidden lg:flex items-center gap-1.5 transition-all cursor-pointer"
            title="Nhập bài bạn tự bốc ở nhà"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Tự Nhập Bài</span>
          </button>

          {/* Journal Button */}
          <button
            onClick={onOpenJournal}
            className="px-3 py-1.5 rounded-xl ethereal-glass text-xs text-[#F3F4F6] hover:border-[#FCD34D]/50 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Nhật ký Tarot cá nhân"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span className="hidden sm:inline">Nhật Ký</span>
            {savedCount > 0 && (
              <span className="text-[10px] bg-[#9333EA]/30 text-[#FCD34D] px-1.5 py-0.2 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Credit / VIP Pill */}
          <div
            onClick={onOpenPricing}
            className="cursor-pointer flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl bg-gradient-to-r from-[#9333EA]/20 via-[#EC4899]/20 to-[#9333EA]/30 border border-[#FCD34D]/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all shadow-md group"
          >
            <div className="flex items-center gap-1.5">
              {isVip ? (
                <Crown className="w-4 h-4 text-[#FCD34D]" />
              ) : (
                <Coins className="w-4 h-4 text-[#FCD34D]" />
              )}
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-[#F3F4F6] font-mono">
                  {isVip ? 'VIP PASS' : `${credits} Lượt`}
                </div>
              </div>
            </div>
            <button className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-[10px] uppercase tracking-wide group-hover:scale-105 transition-transform">
              {isVip ? 'VIP' : 'Nạp'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
