import React, { useMemo } from 'react';
import type { GameStoreData, LeaderboardEntry } from '../../store/gameStore';
import { getLeaderboard } from '../../store/gameStore';
import dimsumImg from '../../assets/dimsum.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';

interface LeaderboardScreenProps {
  storeData: GameStoreData;
  currentPlayerName: string;
  onBack: () => void;
}

const RANK_BADGES = ['🥇', '🥈', '🥉'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  storeData,
  currentPlayerName,
  onBack,
}) => {
  const entries = useMemo(() => getLeaderboard(storeData), [storeData]);

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
              width: `${16 + i * 5}px`,
              left: `${10 + i * 20}%`,
              bottom: `-10px`,
              animation: `float-up ${7 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
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
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400">🏆 Leaderboard</div>
          <div className="w-9" />
        </div>

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="flex items-end justify-center gap-1.5 mb-3 shrink-0 px-1">
            <PodiumCard entry={entries[1]} rank={2} />
            <PodiumCard entry={entries[0]} rank={1} />
            <PodiumCard entry={entries[2]} rank={3} />
          </div>
        )}

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pb-3">
          {entries.length === 0 && (
            <div className="text-center py-12">
              <img src={dimsumImg} alt="" className="mx-auto h-14 w-14 mb-3 opacity-40" />
              <p className="text-zinc-400 text-sm">No entries yet!</p>
              <p className="text-zinc-500 text-xs mt-1">Play levels to appear here</p>
            </div>
          )}
          {entries.map((entry, index) => {
            if (index < 3 && entries.length >= 3) return null;
            return (
              <LeaderboardRow
                key={index}
                entry={entry}
                rank={index + 1}
                isCurrentPlayer={entry.playerName === currentPlayerName}
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

const PodiumCard: React.FC<{ entry: LeaderboardEntry; rank: number }> = ({ entry, rank }) => {
  const heights = [100, 80, 64];
  const height = heights[rank - 1] || 50;

  return (
    <div className="flex flex-col items-center" style={{ width: rank === 1 ? '36%' : '30%' }}>
      <div
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center mb-0.5 bg-yellow-500 sm:w-11 sm:h-11"
        style={{ border: rank === 1 ? '2px solid #eab308' : '2px solid rgba(255,255,255,0.15)' }}
      >
        {entry.profilePhoto ? (
          <img src={entry.profilePhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-black text-black">{entry.playerName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <span className="text-[9px] font-bold text-zinc-300 truncate w-full text-center">{entry.playerName}</span>
      <span className="text-base">{RANK_BADGES[rank - 1]}</span>
      <div
        className="w-full rounded-t-xl border border-white/10 border-b-0 bg-[#171717]/95 flex flex-col items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center gap-1">
          <img src={dimsumImg} alt="" className="h-4 w-4" />
          <span className="text-sm font-black text-yellow-400">{entry.totalDimsum}</span>
        </div>
        <span className="text-[8px] text-zinc-500 font-bold">⭐ {entry.totalStars}</span>
      </div>
    </div>
  );
};

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; rank: number; isCurrentPlayer: boolean }> = ({ entry, rank, isCurrentPlayer }) => (
  <div
    className={`flex items-center gap-2.5 rounded-[18px] p-2.5 border shadow-lg
      ${isCurrentPlayer
        ? 'border-yellow-400/20 bg-yellow-500/5'
        : 'border-white/10 bg-[#171717]/95'
      }`}
  >
    <div className="w-7 text-center">
      <span className="text-xs font-black text-zinc-500">#{rank}</span>
    </div>
    <div
      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/15"
    >
      {entry.profilePhoto ? (
        <img src={entry.profilePhoto} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-white">{entry.playerName.charAt(0).toUpperCase()}</span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-white truncate">
        {entry.playerName} {isCurrentPlayer && <span className="text-yellow-400">(You)</span>}
      </div>
      <div className="text-[9px] text-zinc-500">
        {entry.levelsCompleted} levels • ⭐ {entry.totalStars}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <img src={dimsumImg} alt="" className="h-3.5 w-3.5" />
      <span className="text-sm font-black text-yellow-400">{entry.totalDimsum}</span>
    </div>
  </div>
);
