import React, { useMemo } from 'react';
import chestOpen from '../../assets/underwater/Neutral/\u00e6hest_open.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.png';
import energyImg from '../../assets/energy-pack/energy/10.png';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  const formattedScore = useMemo(() => score.toLocaleString(), [score]);

  // Determine rank based on score
  const rank = useMemo(() => {
    if (score >= 500) return { title: 'LEGENDARY', color: '#fbbf24', icon: '👑' };
    if (score >= 300) return { title: 'EPIC', color: '#a855f7', icon: '⚔️' };
    if (score >= 150) return { title: 'GREAT', color: '#3b82f6', icon: '🛡️' };
    if (score >= 50) return { title: 'GOOD', color: '#22c55e', icon: '⭐' };
    return { title: 'ROOKIE', color: '#6b7280', icon: '🔰' };
  }, [score]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(30,10,40,0.95) 0%, rgba(0,0,0,0.98) 100%)',
        backdropFilter: 'blur(12px)',
        padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
      }}
    >
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bubbleImg}
            alt=""
            className="absolute opacity-10"
            style={{
              width: `${20 + i * 10}px`,
              left: `${10 + i * 15}%`,
              bottom: `-${20 + i * 5}px`,
              animation: `float-up ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-center sm:p-8"
        style={{
          background: 'linear-gradient(145deg, rgba(23,23,23,0.97) 0%, rgba(30,15,35,0.95) 100%)',
          border: '1px solid rgba(239,68,68,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Red glow overlay at top */}
        <div
          className="absolute left-0 top-0 h-40 w-full"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Game Over skull */}
        <div className="relative mb-3">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
              border: '2px solid rgba(239,68,68,0.2)',
              boxShadow: '0 0 30px rgba(239,68,68,0.15)',
            }}
          >
            <span className="text-5xl sm:text-6xl" style={{ filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.5))' }}>
              💀
            </span>
          </div>
        </div>

        <h1
          className="relative mb-1 text-3xl font-black uppercase tracking-[0.18em] sm:text-4xl"
          style={{
            color: '#ef4444',
            textShadow: '0 0 20px rgba(239,68,68,0.4), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          Game Over
        </h1>

        <p className="relative mb-5 text-sm text-zinc-400/80 sm:text-base">
          The creatures overwhelmed you!
        </p>

        {/* Score panel with chest */}
        <div
          className="relative mb-4 rounded-2xl p-4 sm:mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.04) 100%)',
            border: '1px solid rgba(251,191,36,0.15)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src={chestOpen}
              alt="treasure"
              className="h-10 w-10 sm:h-12 sm:w-12"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(251,191,36,0.3))' }}
            />
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500/60">
                Final Score
              </div>
              <div
                className="text-4xl font-black tabular-nums sm:text-5xl"
                style={{
                  color: '#fbbf24',
                  textShadow: '0 0 20px rgba(251,191,36,0.3), 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {formattedScore}
              </div>
            </div>
          </div>

          {/* Rank badge */}
          <div
            className="mx-auto flex items-center gap-1.5 rounded-full px-3 py-1 w-fit"
            style={{
              background: `${rank.color}15`,
              border: `1px solid ${rank.color}33`,
            }}
          >
            <span className="text-sm">{rank.icon}</span>
            <span
              className="text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: rank.color }}
            >
              {rank.title}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mb-5 flex items-center justify-center gap-4 sm:mb-6">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
            <img src={energyImg} alt="energy" className="h-4 w-4 opacity-70" />
            <span className="text-[10px] font-bold text-zinc-400">
              {Math.floor(score / 10)} Kills
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
            <img src={bubbleImg} alt="bubble" className="h-4 w-4 opacity-70" />
            <span className="text-[10px] font-bold text-zinc-400">
              {Math.floor(score * 0.6)} Hits
            </span>
          </div>
        </div>

        {/* Try Again button */}
        <button
          onClick={onRestart}
          className="relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-lg transition-all duration-200 active:scale-[0.97] sm:py-4 sm:text-base"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 25px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <span className="relative z-10">⚔️ Try Again</span>
        </button>
      </div>

      {/* Float-up animation */}
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.08; }
          50% { transform: translateY(-${window.innerHeight}px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
