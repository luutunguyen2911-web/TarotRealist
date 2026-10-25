import React from 'react';

interface CardArtProps {
  cardId: string;
  className?: string;
}

export const CardArtIllustration: React.FC<CardArtProps> = ({ cardId, className = 'w-full h-full' }) => {
  switch (cardId) {
    case '0-the-fool':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="foolBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="50%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#foolBg)" />
          <circle cx="150" cy="60" r="45" fill="url(#sunGlow)" />
          <circle cx="150" cy="60" r="18" fill="#fef08a" />
          {/* Whimsical Mountain Cliff */}
          <path d="M-10 290 L60 170 Q90 150 110 180 L140 290 Z" fill="#1e1b4b" opacity="0.85" />
          <path d="M-10 290 L40 190 Q70 180 80 205 L110 290 Z" fill="#312e81" />
          {/* The Wanderer Figure */}
          <circle cx="70" cy="140" r="12" fill="#fed7aa" />
          <path d="M68 152 Q70 195 55 205 L80 205 Q75 190 73 152 Z" fill="#a855f7" />
          {/* Walking Stick & Bundle */}
          <line x1="50" y1="130" x2="90" y2="190" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="48" cy="128" r="9" fill="#ec4899" />
          {/* Celestial Butterfly */}
          <path d="M85 125 Q95 115 105 125 Q95 135 85 125 Z" fill="#fef08a" />
          <path d="M88 128 Q98 123 102 133 Q93 133 88 128 Z" fill="#67e8f9" />
          {/* Little Companion Dog/Fox */}
          <ellipse cx="95" cy="190" rx="10" ry="7" fill="#fed7aa" />
          <circle cx="102" cy="186" r="5" fill="#fed7aa" />
          <polygon points="103,182 107,185 105,188" fill="#fb923c" />
          {/* Floating magical sparkles */}
          <circle cx="40" cy="80" r="1.5" fill="#fef08a" />
          <circle cx="85" cy="50" r="2" fill="#fcd34d" />
          <circle cx="130" cy="120" r="1.5" fill="#ffffff" />
          <circle cx="30" cy="140" r="2" fill="#f472b6" />
        </svg>
      );

    case '1-the-magician':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="magBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="magAura" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#magBg)" />
          <circle cx="100" cy="110" r="70" fill="url(#magAura)" />
          {/* Infinity Symbol above head */}
          <path
            d="M80 65 C68 65 68 85 80 85 C92 85 108 65 120 65 C132 65 132 85 120 85 C108 85 92 65 80 65 Z"
            stroke="#fcd34d"
            strokeWidth="3"
            fill="none"
          />
          {/* Magician Figure */}
          <circle cx="100" cy="108" r="14" fill="#fed7aa" />
          <path d="M85 125 C85 125 100 130 115 125 L125 210 L75 210 Z" fill="#9333ea" />
          {/* Raised Wand */}
          <line x1="120" y1="120" x2="138" y2="75" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="140" cy="72" r="6" fill="#fef08a" />
          <circle cx="140" cy="72" r="12" fill="#fef08a" opacity="0.3" />
          {/* Altar Table & 4 Elements */}
          <rect x="50" y="210" width="100" height="12" rx="4" fill="#64748b" />
          <circle cx="70" cy="202" r="6" fill="#fcd34d" /> {/* Coin */}
          <path d="M86 205 L94 205 L90 195 Z" fill="#67e8f9" /> {/* Cup */}
          <line x1="108" y1="195" x2="114" y2="205" stroke="#cbd5e1" strokeWidth="2" /> {/* Sword */}
          <line x1="126" y1="196" x2="132" y2="205" stroke="#f97316" strokeWidth="2.5" /> {/* Wand */}
          {/* Floral arch / roses */}
          <path d="M30 40 Q100 15 170 40" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 4" fill="none" />
          <circle cx="45" cy="38" r="4" fill="#fb7185" />
          <circle cx="100" cy="25" r="5" fill="#f43f5e" />
          <circle cx="155" cy="38" r="4" fill="#fb7185" />
        </svg>
      );

    case '2-the-high-priestess':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hpBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#hpBg)" />
          {/* Twin Pillars */}
          <rect x="25" y="50" width="22" height="180" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="36" y="145" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">B</text>
          <rect x="153" y="50" width="22" height="180" rx="4" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="164" y="145" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">J</text>
          {/* Sacred Crescent Moon under feet */}
          <path d="M70 215 C85 225 115 225 130 215 C118 220 82 220 70 215 Z" fill="#fef08a" />
          {/* Priestess Figure */}
          <circle cx="100" cy="100" r="13" fill="#fed7aa" />
          {/* Crescent crown */}
          <path d="M88 88 Q100 80 112 88 Q100 84 88 88 Z" fill="#38bdf8" />
          <circle cx="100" cy="85" r="4" fill="#fef08a" />
          {/* Flowing Water Robe */}
          <path d="M80 120 Q100 125 120 120 L135 220 L65 220 Z" fill="#0284c7" opacity="0.9" />
          <path d="M90 125 L110 125 L115 220 L85 220 Z" fill="#38bdf8" opacity="0.7" />
          {/* Sacred Scroll TORA */}
          <rect x="85" y="145" width="30" height="18" rx="3" fill="#fef08a" />
          <text x="100" y="158" fill="#78350f" fontSize="7" fontWeight="bold" textAnchor="middle">TORA</text>
          {/* Celestial Pomegranates */}
          <circle cx="100" cy="45" r="5" fill="#f43f5e" />
          <circle cx="80" cy="55" r="4" fill="#f43f5e" />
          <circle cx="120" cy="55" r="4" fill="#f43f5e" />
        </svg>
      );

    case '6-the-lovers':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="loversBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="40%" stopColor="#831843" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <radialGradient id="angelGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#loversBg)" />
          <circle cx="100" cy="80" r="60" fill="url(#angelGlow)" />
          {/* Angel Wings above */}
          <path d="M100 70 C70 40 40 60 50 90 C70 85 90 85 100 95 Z" fill="#f472b6" opacity="0.8" />
          <path d="M100 70 C130 40 160 60 150 90 C130 85 110 85 100 95 Z" fill="#f472b6" opacity="0.8" />
          <circle cx="100" cy="65" r="12" fill="#fed7aa" />
          {/* Twin lovers silhouettes */}
          <circle cx="70" cy="150" r="11" fill="#fed7aa" />
          <path d="M58 165 C58 165 70 170 82 165 L88 230 L52 230 Z" fill="#ec4899" />
          <circle cx="130" cy="150" r="11" fill="#fed7aa" />
          <path d="M118 165 C118 165 130 170 142 165 L148 230 L112 230 Z" fill="#9333ea" />
          {/* Entwined Heart Energy */}
          <path d="M100 170 C90 155 75 165 100 190 C125 165 110 155 100 170 Z" fill="#f43f5e" />
          <circle cx="100" cy="178" r="4" fill="#fef08a" />
          {/* Tree of life & Tree of knowledge */}
          <path d="M40 230 Q40 160 30 150 Q45 155 45 230 Z" fill="#15803d" />
          <circle cx="33" cy="148" r="6" fill="#f43f5e" />
          <path d="M160 230 Q160 160 170 150 Q155 155 155 230 Z" fill="#15803d" />
        </svg>
      );

    case '17-the-star':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="starBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="50%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#starBg)" />
          {/* Main Giant Radiating Star */}
          <g transform="translate(100, 75)">
            <polygon
              points="0,-35 8,-12 35,0 8,12 0,35 -8,12 -35,0 -8,-12"
              fill="#fef08a"
            />
            <circle cx="0" cy="0" r="8" fill="#ffffff" />
            <circle cx="0" cy="0" r="22" fill="#fcd34d" opacity="0.3" />
          </g>
          {/* 7 Little Surrounding Stars */}
          {[
            [-45, -20],
            [45, -20],
            [-60, 20],
            [60, 20],
            [-30, 45],
            [30, 45],
            [0, 55],
          ].map(([dx, dy], i) => (
            <circle key={i} cx={100 + dx} cy={75 + dy} r="2.5" fill="#bae6fd" />
          ))}
          {/* Water pool */}
          <ellipse cx="100" cy="245" rx="80" ry="25" fill="#0369a1" />
          <ellipse cx="100" cy="245" rx="55" ry="15" fill="#38bdf8" opacity="0.6" />
          {/* Celestial Maiden pouring water */}
          <circle cx="100" cy="160" r="10" fill="#fed7aa" />
          <path d="M90 172 Q100 175 110 172 L118 225 L82 225 Z" fill="#67e8f9" opacity="0.85" />
          {/* Two Urns Pouring Glowing Water */}
          <ellipse cx="78" cy="188" rx="6" ry="10" fill="#fcd34d" />
          <path d="M78 198 Q75 220 65 240" stroke="#bae6fd" strokeWidth="2.5" fill="none" />
          <ellipse cx="122" cy="188" rx="6" ry="10" fill="#fcd34d" />
          <path d="M122 198 Q125 220 135 240" stroke="#bae6fd" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case '18-the-moon':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="moonBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <radialGradient id="moonHalo" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#312e81" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#moonBg)" />
          <circle cx="100" cy="80" r="55" fill="url(#moonHalo)" />
          {/* Luminous Crescent and Profile Face */}
          <circle cx="100" cy="80" r="28" fill="#fef08a" />
          <path d="M100 52 C115 52 128 65 128 80 C128 95 115 108 100 108 C108 100 112 90 112 80 C112 70 108 60 100 52 Z" fill="#fde047" />
          {/* Twin Towers in Distance */}
          <polygon points="30,120 45,110 60,120 60,190 30,190" fill="#1e1b4b" />
          <polygon points="140,120 155,110 170,120 170,190 140,190" fill="#1e1b4b" />
          {/* Two Whimsical Dreaming Wolves howling */}
          <path d="M60 215 C60 195 75 190 80 175 C82 170 85 178 88 182 L80 220 Z" fill="#cbd5e1" />
          <path d="M140 215 C140 195 125 190 120 175 C118 170 115 178 112 182 L120 220 Z" fill="#cbd5e1" />
          {/* Winding Path to Infinity */}
          <path d="M100 240 Q110 205 90 175 Q105 145 100 120" stroke="#fcd34d" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        </svg>
      );

    case '19-the-sun':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sunCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <radialGradient id="sunShine" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#sunCardBg)" />
          <circle cx="100" cy="95" r="75" fill="url(#sunShine)" />
          {/* Radiant Sun Face with Ray Petals */}
          <g transform="translate(100, 95)">
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="34"
                x2="0"
                y2="52"
                stroke="#fef08a"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${i * 22.5})`}
              />
            ))}
            <circle cx="0" cy="0" r="32" fill="#fef08a" />
            {/* Friendly smiling face */}
            <circle cx="-10" cy="-5" r="3" fill="#78350f" />
            <circle cx="10" cy="-5" r="3" fill="#78350f" />
            <path d="M-10 10 Q0 18 10 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
          {/* Golden Sunflowers on wall */}
          <rect x="20" y="205" width="160" height="35" rx="6" fill="#ca8a04" opacity="0.9" />
          <circle cx="50" cy="205" r="10" fill="#fef08a" />
          <circle cx="50" cy="205" r="5" fill="#78350f" />
          <circle cx="100" cy="205" r="12" fill="#fef08a" />
          <circle cx="100" cy="205" r="6" fill="#78350f" />
          <circle cx="150" cy="205" r="10" fill="#fef08a" />
          <circle cx="150" cy="205" r="5" fill="#78350f" />
        </svg>
      );

    case '21-the-world':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="worldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#worldBg)" />
          {/* Giant Laurel Wreath of Victory */}
          <ellipse cx="100" cy="140" rx="65" ry="85" stroke="#fcd34d" strokeWidth="4" strokeDasharray="8 4" fill="none" />
          <ellipse cx="100" cy="140" rx="60" ry="80" stroke="#34d399" strokeWidth="2" fill="none" opacity="0.6" />
          {/* Celestial Dancer in Center */}
          <circle cx="100" cy="105" r="12" fill="#fed7aa" />
          <path d="M88 122 C88 122 100 128 112 122 L120 185 L80 185 Z" fill="#a7f3d0" />
          {/* Floating Violet Scarf */}
          <path d="M75 110 Q100 95 125 110 Q135 150 115 175 Q95 190 75 160 Z" stroke="#c084fc" strokeWidth="4" fill="none" />
          {/* 4 Sacred Guardians in Corners */}
          <circle cx="35" cy="35" r="10" fill="#38bdf8" opacity="0.8" /> {/* Angel */}
          <circle cx="165" cy="35" r="10" fill="#fcd34d" opacity="0.8" /> {/* Eagle */}
          <circle cx="35" cy="245" r="10" fill="#f43f5e" opacity="0.8" /> {/* Lion */}
          <circle cx="165" cy="245" r="10" fill="#a855f7" opacity="0.8" /> {/* Bull */}
        </svg>
      );

    case 'swords-3':
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="s3Bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#s3Bg)" />
          {/* Soft rain clouds */}
          <ellipse cx="70" cy="65" rx="30" ry="18" fill="#64748b" opacity="0.7" />
          <ellipse cx="120" cy="60" rx="35" ry="20" fill="#475569" opacity="0.8" />
          <ellipse cx="100" cy="70" rx="40" ry="22" fill="#94a3b8" opacity="0.6" />
          {/* Glowing Crystal Heart */}
          <path
            d="M100 135 C80 100 45 115 45 150 C45 185 100 220 100 220 C100 220 155 185 155 150 C155 115 120 100 100 135 Z"
            fill="#f43f5e"
            stroke="#fb7185"
            strokeWidth="3"
          />
          {/* 3 Iridescent Crystal Swords */}
          <line x1="60" y1="95" x2="135" y2="195" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <line x1="140" y1="95" x2="65" y2="195" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="85" x2="100" y2="205" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" />
          {/* Gentle healing blossoms floating */}
          <circle cx="50" cy="235" r="4" fill="#fda4af" />
          <circle cx="150" cy="230" r="5" fill="#fda4af" />
          <circle cx="100" cy="245" r="4" fill="#fda4af" />
        </svg>
      );

    default:
      // Whimsical Default / Other Cards with Celestial Geometry
      return (
        <svg viewBox="0 0 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="defBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#581c87" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id="defGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="280" rx="16" fill="url(#defBg)" />
          <circle cx="100" cy="140" r="70" fill="url(#defGlow)" />
          {/* Concentric Mystic Mandala */}
          <circle cx="100" cy="140" r="48" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="100" cy="140" r="32" stroke="#e879f9" strokeWidth="1.5" />
          <polygon points="100,105 130,158 70,158" stroke="#fcd34d" strokeWidth="2" fill="none" />
          <polygon points="100,175 130,122 70,122" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <circle cx="100" cy="140" r="10" fill="#fef08a" />
          {/* Corner star sparkles */}
          <circle cx="35" cy="40" r="3" fill="#fcd34d" />
          <circle cx="165" cy="40" r="3" fill="#fcd34d" />
          <circle cx="35" cy="240" r="3" fill="#fcd34d" />
          <circle cx="165" cy="240" r="3" fill="#fcd34d" />
        </svg>
      );
  }
};
