import React, { useState } from 'react';
import { ReadingResult } from '../types';
import { X, Bookmark, Calendar, Trash2, ExternalLink, Flame } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReadings: ReadingResult[];
  onSelectReading: (reading: ReadingResult) => void;
  onDeleteReading: (id: string) => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  savedReadings,
  onSelectReading,
  onDeleteReading,
}) => {
  const [filterTopic, setFilterTopic] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = savedReadings.filter((r) => {
    if (filterTopic === 'all') return true;
    return r.topic === filterTopic;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Nhật Ký Tarot Cá Nhân (Tarot Journal)</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
          Lịch Sử Các Tụ Bài Đã Xem
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-5">
          Xem lại để kiểm chứng độ chính xác và những lời khuyên thức tỉnh bạn qua thời gian.
        </p>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'love', label: 'Tình Duyên' },
            { id: 'career', label: 'Sự Nghiệp' },
            { id: 'yesno', label: 'Yes / No' },
            { id: 'second-opinion', label: 'Góc Nhìn Khách Quan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTopic(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                filterTopic === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Journal list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {savedReadings.length === 0
              ? 'Bạn chưa lưu tụ bài nào vào nhật ký. Sau khi xem một trải bài, hãy bấm "Lưu Lại" để xem lại tại đây!'
              : 'Không có trải bài nào thuộc chủ đề này.'}
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">{item.readerName}</span>
                      <span>•</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px]">
                        {item.spreadName}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5 line-clamp-1">
                      "{item.question}"
                    </h4>

                    {/* Punchline snippet */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 italic line-clamp-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.punchline}</span>
                    </div>

                    {/* Mini cards summary */}
                    <div className="flex items-center gap-2 mt-2">
                      {item.cards.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1"
                        >
                          <span>{c.symbol}</span>
                          <span className="truncate max-w-[80px]">{c.nameVi}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        onSelectReading(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem Lại</span>
                    </button>
                    <button
                      onClick={() => onDeleteReading(item.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xóa khỏi nhật ký"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
