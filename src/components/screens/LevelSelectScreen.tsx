import React from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { isLevelUnlocked, getTotalStars } from '../../store/gameStore';
import { LEVELS } from '../../constants/levels';
import type { LevelConfig } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';

interface LevelSelectScreenProps {
  storeData: GameStoreData;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  storeData,
  onSelectLevel,
  onBack,
}) => {
  const totalStars = getTotalStars(storeData);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-[#111]/95 backdrop-blur-sm"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}
    >
      {/* Floating bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <img key={i} src={bubbleImg} alt="" className="absolute opacity-[0.04]"
            style={{
              width: `${18 + i * 6}px`,
              left: `${15 + i * 20}%`,
              bottom: `-10px`,
              animation: `float-up ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 sm:mx-auto sm:max-w-2xl sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0 pt-1">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition active:scale-90"
          >
            <span className="text-base">←</span>
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400">Select Level</div>
          </div>
          <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-white/5 border border-white/10">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-yellow-400">{totalStars}</span>
          </div>
        </div>

        {/* Level List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pb-3">
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(storeData, level.id);
            const progress = storeData.levels[level.id];
            const starRequirementMet = totalStars >= level.unlockRequirement;
            const canPlay = unlocked && starRequirementMet;

            return (
              <LevelCard
                key={level.id}
                level={level}
                progress={progress}
                unlocked={canPlay}
                starRequirement={level.unlockRequirement}
                currentStars={totalStars}
                onSelect={() => canPlay && onSelectLevel(level.id)}
              />
            );
          })}
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

interface LevelCardProps {
  level: LevelConfig;
  progress?: { dimsumCollected: number; dimsumTotal: number; stars: number; completed: boolean; bestTime: number };
  unlocked: boolean;
  starRequirement: number;
  currentStars: number;
  onSelect: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, progress, unlocked, starRequirement, currentStars, onSelect }) => (
  <button
    onClick={onSelect}
    disabled={!unlocked}
    className={`w-full rounded-[22px] border p-3 text-left transition active:scale-[0.98] shadow-lg
      ${unlocked
        ? 'border-white/10 bg-[#171717]/95'
        : 'border-white/5 bg-[#171717]/50 opacity-50'
      }`}
  >
    <div className="flex items-start gap-3">
      {/* Level Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${unlocked ? 'bg-yellow-500/10 border border-yellow-400/20' : 'bg-white/5 border border-white/10'}`}>
        {unlocked ? level.icon : '🔒'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-black text-white">Level {level.id}</span>
          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
            level.difficulty === 'easy' ? 'bg-green-500/15 text-green-400' :
            level.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
            level.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' :
            'bg-purple-500/15 text-purple-400'
          }`}>
            {level.difficulty}
          </span>
        </div>
        <div className="text-xs font-bold text-zinc-300 mb-0.5">{level.name}</div>
        <div className="text-[10px] text-zinc-500 mb-2 leading-tight">{level.description}</div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((star) => (
              <span key={star} className="text-xs"
                style={{ filter: progress && progress.stars >= star ? 'drop-shadow(0 0 3px rgba(250,204,21,0.5))' : 'grayscale(1) opacity(0.25)' }}
              >⭐</span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <img src={dimsumImg} alt="" className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold text-zinc-400">
              {progress ? `${progress.dimsumCollected}/${level.dimsumCount}` : `0/${level.dimsumCount}`}
            </span>
          </div>
          {progress?.bestTime ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px]">⏱️</span>
              <span className="text-[10px] font-bold text-zinc-400">{formatTime(progress.bestTime)}</span>
            </div>
          ) : null}
        </div>

        {!unlocked && starRequirement > 0 && (
          <div className="mt-1.5 text-[10px] text-zinc-500">
            🔒 Requires {starRequirement} ⭐ (you have {currentStars})
          </div>
        )}
      </div>
    </div>
  </button>
);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
