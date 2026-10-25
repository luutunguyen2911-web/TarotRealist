import React, { useRef, useState, useEffect } from 'react';
import { ReadingResult } from '../types';
import { ReaderPersona } from '../data/readers';
import { X, Download, Share2, Copy, CheckCircle, Sparkles, Instagram } from 'lucide-react';

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: ReadingResult;
  reader: ReaderPersona;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  isOpen,
  onClose,
  reading,
  reader,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const mainCard = reading.cards[0] || null;
  const quote = reading.shareableQuote || reading.punchline;

  // Render high-res 1080x1920 story on canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // 1. Dark mystical background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(0.4, '#0f172a');
    bgGradient.addColorStop(0.8, '#180f28');
    bgGradient.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle starfield
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    for (let i = 0; i < 70; i++) {
      const sx = (i * 137.5) % width;
      const sy = (i * 269.3) % height;
      const r = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer luxury gold frame
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(76, 76, width - 152, height - 152);

    // Corner ornate accents
    const corners = [
      [80, 80],
      [width - 80, 80],
      [80, height - 80],
      [width - 80, height - 80],
    ];
    ctx.fillStyle = '#fbbf24';
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    corners.forEach(([cx, cy]) => {
      ctx.fillText('✧', cx, cy + 10);
    });

    // 2. Header Brand
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
    ctx.fillText('TAROT REALIST', width / 2, 170);

    ctx.fillStyle = '#EC4899';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ETHEREAL TAROT • SẮC SẢO & ĐÍCH THỰC', width / 2, 215);

    // 3. Question box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(120, 270, width - 240, 150, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CÂU HỎI:', width / 2, 320);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'italic 600 32px "Playfair Display", Georgia, serif';
    const qText = `"${reading.question}"`;
    wrapText(ctx, qText, width / 2, 370, width - 300, 42);

    // 4. Featured Card Visual Display
    const cardBoxY = 480;
    const cardBoxW = 440;
    const cardBoxH = 640;
    const cardBoxX = (width - cardBoxW) / 2;

    // Glowing shadow
    ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
    ctx.shadowBlur = 40;

    const cardGradient = ctx.createLinearGradient(cardBoxX, cardBoxY, cardBoxX + cardBoxW, cardBoxY + cardBoxH);
    cardGradient.addColorStop(0, '#1e1b4b');
    cardGradient.addColorStop(0.5, '#0f172a');
    cardGradient.addColorStop(1, '#020617');
    ctx.fillStyle = cardGradient;
    ctx.roundRect(cardBoxX, cardBoxY, cardBoxW, cardBoxH, 32);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.shadowBlur = 0; // reset shadow

    // Inner card art
    if (mainCard) {
      ctx.font = '130px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mainCard.symbol, width / 2, cardBoxY + 280);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 42px "Lora", "Playfair Display", Georgia, serif';
      ctx.fillText(mainCard.nameVi, width / 2, cardBoxY + 390);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        `${mainCard.name} • ${mainCard.isReversed ? 'Ngược (Reversed)' : 'Xuôi (Upright)'}`,
        width / 2,
        cardBoxY + 440
      );

      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.roundRect(width / 2 - 180, cardBoxY + 490, 360, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#fde68a';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(mainCard.keywords.slice(0, 38) + '...', width / 2, cardBoxY + 528);
    }

    // 5. THE QUOTE "ĐÚNG TIM ĐEN" (Hero Highlight)
    const quoteY = 1210;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.roundRect(120, quoteY, width - 240, 340, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚡ LỜI PHÁN TỈNH ĐÒN', width / 2, quoteY + 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Playfair Display", Georgia, serif';
    wrapText(ctx, `"${quote}"`, width / 2, quoteY + 140, width - 320, 56);

    // Reader byline
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`— ${reader.name} (${reader.title})`, width / 2, quoteY + 285);

    // 6. Watermark footer
    ctx.fillStyle = '#64748b';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🔮 Xem tụ bài của bạn tại: tarot-realist.app', width / 2, height - 120);

    // Generate PNG data url
    try {
      const url = canvas.toDataURL('image/png');
      setDownloadUrl(url);
    } catch {}
  }, [isOpen, reading, reader]);

  // Helper to wrap text on canvas
  function wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, currentY);
  }

  if (!isOpen) return null;

  const captionText = `“${quote}” 🥀💀\n\nXem tụ bài này xong tỉnh cả ngủ luôn! Madame Vy phán đúng từng ngóc ngách không trượt phát nào.\n\n🔮 Xem Tarot thực tế, không mê tín tại: tarot-realist.app\n#tarotrealist #tinhdon #tarotvietnam #threads #healing`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tarot Realist - Lời Phán Sắc Sảo',
          text: captionText,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyCaption();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl my-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Thẻ Bài Khoe Mạng Xã Hội (Story &amp; Threads)</span>
        </div>
        <h3 className="text-xl font-serif font-black text-white text-center">
          Hình Ảnh Chuẩn Tỉ Lệ 9:16 (Story / Threads)
        </h3>
        <p className="text-xs text-slate-400 text-center mt-1 mb-5">
          Tải ảnh chất lượng cao hoặc copy caption để flex câu nói deep, trúng phóc tâm trạng!
        </p>

        {/* Live Canvas Preview (scaled down smoothly) */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black max-w-[280px] sm:max-w-[320px] aspect-[9/16]">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-md mt-6 flex flex-col gap-2.5">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`tarot-realist-story-${Date.now()}.png`}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Story Về Máy (HD PNG)</span>
            </a>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopyCaption}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCaption ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã Chép Caption!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép Caption Threads</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Chia Sẻ Nhanh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
