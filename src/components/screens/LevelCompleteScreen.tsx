import React, { useState, useEffect } from 'react';
import { calculateStars } from '../../store/gameStore';
import type { LevelConfig } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import chestOpen from '../../assets/underwater/Neutral/æhest_open.webp';
import arenaBg from '../../assets/arena_background.webp';

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
      timers.push(window.setTimeout(() => setShowStars(i), i * 500));
    }
    timers.push(window.setTimeout(() => setShowContent(true), stars * 500 + 300));
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
      }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 overflow-y-auto sm:mx-auto sm:max-w-2xl">
        {/* Title */}
        <div className="text-center mt-6 mb-3 flex-shrink-0">
          {isPerfect && <img src={crownImg} alt="" className="mx-auto h-8 w-8 mb-1" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,215,0,0.4))' }} />}
          <div className="text-[10px] font-bold uppercase tracking-[0.35em] mb-1"
            style={{ color: isPerfect ? '#fbbf24' : '#a78bfa' }}
          >
            {isPerfect ? '⭐ PERFECT CLEAR ⭐' : 'Level Complete'}
          </div>
          <h1 className="text-2xl font-black text-white">{levelConfig.name}</h1>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-4 mb-5 flex-shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="transition-all duration-500"
              style={{
                transform: showStars >= s ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-30deg)',
                opacity: showStars >= s ? 1 : 0.15,
              }}
            >
              <span className="text-4xl" style={{
                filter: showStars >= s ? 'drop-shadow(0 0 10px rgba(255,215,0,0.6))' : 'grayscale(1)',
              }}>⭐</span>
            </div>
          ))}
        </div>

        {/* Content (fades in after stars) */}
        <div className={`w-full space-y-3 transition-all duration-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Dimsum Collected Card */}
          <div className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,215,0,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <div className="text-[10px] font-bold text-amber-400/60 uppercase tracking-wider mb-2 text-center">
              Dimsum Collected
            </div>
            <div className="flex items-center justify-center flex-wrap gap-1.5 mb-2">
              {Array.from({ length: levelConfig.dimsumCount }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: i < dimsumCollected
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(255,255,255,0.02)',
                    border: i < dimsumCollected
                      ? '1px solid rgba(255,215,0,0.25)'
                      : '1px solid rgba(255,215,0,0.06)',
                    boxShadow: i < dimsumCollected ? '0 0 8px rgba(245,158,11,0.1)' : 'none',
                  }}
                >
                  <img src={dimsumImg} alt="" className={`h-5 w-5 transition ${i < dimsumCollected ? '' : 'opacity-15 grayscale'}`} />
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-amber-400">{dimsumCollected}</span>
              <span className="text-lg font-black text-purple-400"> / {levelConfig.dimsumCount}</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,215,0,0.1)',
              }}
            >
              <div className="text-base font-black text-white">{mins > 0 ? `${mins}m ` : ''}{secs}s</div>
              <div className="text-[8px] font-bold text-purple-400 uppercase tracking-wider">Time</div>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,215,0,0.1)',
              }}
            >
              <div className="text-base font-black text-amber-400">{stars}/3</div>
              <div className="text-[8px] font-bold text-purple-400 uppercase tracking-wider">Stars</div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isNewBest && (
              <div className="rounded-xl px-3 py-1.5"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <span className="text-[10px] font-black text-green-400">🏆 New Best!</span>
              </div>
            )}
            {ticketEarned && (
              <div className="rounded-xl px-3 py-1.5 animate-pulse"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}
              >
                <span className="text-[10px] font-black text-purple-400">🎫 Ticket Earned!</span>
              </div>
            )}
            {isPerfect && (
              <div className="rounded-xl px-3 py-1.5"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}
              >
                <span className="text-[10px] font-black text-amber-400">✨ All Collected!</span>
              </div>
            )}
          </div>

          {ticketEarned && (
            <div className="flex items-center justify-center gap-2">
              <img src={chestOpen} alt="" className="h-8 w-8" style={{ filter: 'drop-shadow(0 2px 6px rgba(168,85,247,0.3))' }} />
              <span className="text-xs font-bold text-purple-300">Check Mystery Box!</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={`w-full mt-auto pt-4 pb-2 space-y-2 flex-shrink-0 transition-all duration-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {hasNextLevel && (
            <button onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition active:scale-[0.97] relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
              }}
            >
              ▶ Next Level
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onRetry}
              className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-purple-200 transition active:scale-[0.97]"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,215,0,0.12)',
              }}
            >🔄 Retry</button>
            <button onClick={onMenu}
              className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-purple-200 transition active:scale-[0.97]"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,215,0,0.12)',
              }}
            >🏠 Menu</button>
          </div>
        </div>
      </div>
    </div>
  );
};
