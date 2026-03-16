import React from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { isLevelUnlocked, getTotalStars } from '../../store/gameStore';
import { LEVELS } from '../../constants/levels';
import type { LevelConfig } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import arenaBg from '../../assets/arena_background.webp';

interface LevelSelectScreenProps {
  storeData: GameStoreData;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#4ade80',
  medium: '#fbbf24',
  hard: '#f87171',
  extreme: '#c084fc',
};

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  storeData,
  onSelectLevel,
  onBack,
}) => {
  const totalStars = getTotalStars(storeData);

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-2 mx-2 mb-2 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <span className="text-sm">←</span>
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">⚔️ Select Level</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.1)' }}
        >
          <span className="text-xs">⭐</span>
          <span className="text-xs font-black text-amber-400">{totalStars}</span>
        </div>
      </div>

      {/* Level List */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2.5">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(storeData, level.id);
          const progress = storeData.levels[level.id];
          return (
            <LevelCard
              key={level.id}
              level={level}
              unlocked={unlocked}
              progress={progress}
              totalStars={totalStars}
              onSelect={() => unlocked && onSelectLevel(level.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─── Level Card ─────────────────────────────────────────────────────────── */

const LevelCard: React.FC<{
  level: LevelConfig;
  unlocked: boolean;
  progress: { dimsumCollected: number; dimsumTotal: number; stars: number; completed: boolean; bestTime: number } | undefined;
  totalStars: number;
  onSelect: () => void;
}> = ({ level, unlocked, progress, totalStars, onSelect }) => {
  const diffColor = DIFF_COLORS[level.difficulty] || '#fbbf24';

  return (
    <button
      onClick={onSelect}
      disabled={!unlocked}
      className="w-full text-left rounded-2xl p-3 transition active:scale-[0.98] relative overflow-hidden group"
      style={{
        background: unlocked ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)',
        border: unlocked
          ? '1px solid rgba(255,215,0,0.2)'
          : '1px solid rgba(100,80,140,0.2)',
        boxShadow: unlocked ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Level Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative"
          style={{
            background: unlocked
              ? `rgba(0,0,0,0.3)`
              : 'rgba(255,255,255,0.03)',
            border: `1px solid ${unlocked ? `${diffColor}30` : 'rgba(100,80,140,0.15)'}`,
          }}
        >
          {unlocked ? level.icon : '🔒'}
          {progress?.completed && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg, #4ade80, #22c55e)', boxShadow: '0 0 6px rgba(74,222,128,0.4)' }}
            >
              <span className="text-[8px] text-white font-black">✓</span>
            </div>
          )}
        </div>

        {/* Level Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-white truncate">{level.name}</span>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
              style={{
                background: `${diffColor}15`,
                color: diffColor,
                border: `1px solid ${diffColor}30`,
              }}
            >{level.difficulty}</span>
          </div>

          {unlocked ? (
            <>
              <p className="text-[10px] text-purple-300/70 truncate mb-1">{level.description}</p>
              <div className="flex items-center gap-3">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className="text-xs"
                      style={{ filter: (progress?.stars ?? 0) >= s ? 'none' : 'grayscale(1) opacity(0.3)' }}
                    >⭐</span>
                  ))}
                </div>
                {/* Dimsum */}
                <div className="flex items-center gap-1">
                  <img src={dimsumImg} alt="" className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold text-amber-400">
                    {progress?.dimsumCollected ?? 0}/{level.dimsumCount}
                  </span>
                </div>
                {/* Time */}
                {progress?.bestTime && (
                  <span className="text-[10px] text-purple-400">⏱ {Math.floor(progress.bestTime)}s</span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs">⭐</span>
              <span className="text-[10px] text-purple-400">Need {level.unlockRequirement} stars (You: {totalStars})</span>
            </div>
          )}
        </div>

        {/* Play Arrow */}
        {unlocked && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
          >
            <span className="text-amber-400 text-xs font-black">▶</span>
          </div>
        )}
      </div>
    </button>
  );
};
