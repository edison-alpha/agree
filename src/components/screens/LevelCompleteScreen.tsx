import React, { useState, useEffect } from 'react';
import { calculateStars } from '../../store/gameStore';
import type { LevelConfig } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';

interface LevelCompleteScreenProps {
  levelConfig: LevelConfig;
  dimsumCollected: number;
  timeTaken: number;
  previousBest: number;
  ticketEarned: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  levelConfig,
  dimsumCollected,
  timeTaken,
  previousBest,
  ticketEarned,
  onNextLevel,
  onRetry,
  onMenu,
  hasNextLevel,
}) => {
  const stars = calculateStars(dimsumCollected, levelConfig.dimsumCount);
  const isNewBest = dimsumCollected > previousBest;
  const isPerfect = dimsumCollected === levelConfig.dimsumCount;
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  const [showStars, setShowStars] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 1; i <= stars; i++) {
      timers.push(window.setTimeout(() => setShowStars(i), i * 400));
    }
    timers.push(window.setTimeout(() => setShowContent(true), stars * 400 + 200));
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md"
      style={{
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}
    >
      {/* Floating bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <img key={i} src={bubbleImg} alt="" className="absolute opacity-[0.04]"
            style={{
              width: `${14 + i * 4}px`,
              left: `${5 + i * 20}%`,
              bottom: `-12px`,
              animation: `float-up ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center px-4 sm:mx-auto sm:max-w-2xl sm:px-6 overflow-y-auto">
        {/* Title */}
        <div className="text-center mt-6 mb-2 shrink-0">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400/70 mb-1">
            {isPerfect ? '⭐ PERFECT CLEAR ⭐' : 'Level Complete'}
          </div>
          <h1 className="text-2xl font-black text-white mb-0.5">{levelConfig.name}</h1>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative transition-all duration-300"
              style={{
                transform: showStars >= s ? 'scale(1)' : 'scale(0.3)',
                opacity: showStars >= s ? 1 : 0.2,
              }}
            >
              <span className="text-3xl" style={{
                filter: showStars >= s ? 'drop-shadow(0 0 6px rgba(250,204,21,0.5))' : 'grayscale(1)',
              }}>⭐</span>
            </div>
          ))}
        </div>

        {/* Content (fades in after stars) */}
        <div className={`w-full space-y-3 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          {/* Dimsum Collected */}
          <div className="rounded-[22px] border border-white/10 bg-[#171717]/95 p-4 shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2 text-center">
              Dimsum Collected
            </div>
            <div className="flex items-center justify-center flex-wrap gap-1.5 mb-2">
              {Array.from({ length: levelConfig.dimsumCount }).map((_, i) => (
                <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                  i < dimsumCollected
                    ? 'border-yellow-400/30 bg-yellow-500/15'
                    : 'border-white/10 bg-white/5'
                }`}>
                  <img src={dimsumImg} alt="" className={`h-5 w-5 transition ${i < dimsumCollected ? '' : 'opacity-15 grayscale'}`} />
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-2xl font-black text-yellow-400">{dimsumCollected}</span>
              <span className="text-base font-black text-zinc-500"> / {levelConfig.dimsumCount}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-[#171717]/95 p-3 text-center shadow-lg">
              <div className="text-sm font-black text-white">{mins > 0 ? `${mins}m ` : ''}{secs}s</div>
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">Time</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#171717]/95 p-3 text-center shadow-lg">
              <div className="text-sm font-black text-white">{stars}/3</div>
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">Stars</div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isNewBest && (
              <div className="rounded-xl border border-green-400/20 bg-green-500/10 px-3 py-1">
                <span className="text-[10px] font-black text-green-400">🏆 New Best!</span>
              </div>
            )}
            {ticketEarned && (
              <div className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-1 animate-pulse">
                <span className="text-[10px] font-black text-purple-400">🎫 Ticket Earned!</span>
              </div>
            )}
            {isPerfect && (
              <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-3 py-1">
                <span className="text-[10px] font-black text-yellow-400">✨ All Collected!</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className={`w-full mt-auto pt-4 pb-2 space-y-2 shrink-0 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          {hasNextLevel && (
            <button onClick={onNextLevel}
              className="w-full rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400 active:scale-[0.97]"
              style={{ boxShadow: '0 6px 20px rgba(234,179,8,0.25)' }}
            >
              ▶ Next Level
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onRetry}
              className="flex-1 rounded-2xl border border-white/10 bg-[#171717]/95 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/10 active:scale-[0.97]"
            >
              🔄 Retry
            </button>
            <button onClick={onMenu}
              className="flex-1 rounded-2xl border border-white/10 bg-[#171717]/95 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/10 active:scale-[0.97]"
            >
              🏠 Menu
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.04; }
          50% { transform: translateY(-${window.innerHeight}px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
