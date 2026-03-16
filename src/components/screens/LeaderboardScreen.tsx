import React, { useMemo } from 'react';
import type { GameStoreData, LeaderboardEntry } from '../../store/gameStore';
import { getLeaderboard } from '../../store/gameStore';
import dimsumImg from '../../assets/dimsum.png';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import arenaBg from '../../assets/arena_background.webp';

interface LeaderboardScreenProps {
  storeData: GameStoreData;
  currentPlayerName: string;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  storeData,
  currentPlayerName,
  onBack,
}) => {
  const entries = useMemo(() => getLeaderboard(storeData), [storeData]);

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
        <div className="flex-1 flex items-center justify-center gap-2">
          <img src={crownImg} alt="" className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">Leaderboard</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex-1 min-h-0 flex flex-col px-4">
        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="flex items-end justify-center gap-2 mb-3 flex-shrink-0">
            <PodiumCard entry={entries[1]} rank={2} />
            <PodiumCard entry={entries[0]} rank={1} />
            <PodiumCard entry={entries[2]} rank={3} />
          </div>
        )}

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pb-3">
          {entries.length === 0 && (
            <div className="text-center py-12">
              <img src={dimsumImg} alt="" className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p className="text-purple-300 text-sm font-bold">No entries yet!</p>
              <p className="text-purple-400/60 text-xs mt-1">Play levels to appear here</p>
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
    </div>
  );
};

/* ─── Podium Card ────────────────────────────────────────────────────────── */

const RANK_BADGES = ['🥇', '🥈', '🥉'];
const PODIUM_HEIGHTS = [110, 85, 68];
const PODIUM_BORDERS = [
  'rgba(255,215,0,0.3)',
  'rgba(168,162,158,0.2)',
  'rgba(180,120,60,0.2)',
];

const PodiumCard: React.FC<{ entry: LeaderboardEntry; rank: number }> = ({ entry, rank }) => (
  <div className="flex flex-col items-center" style={{ width: rank === 1 ? '36%' : '30%' }}>
    {/* Avatar */}
    <div className="w-10 h-10 rounded-full overflow-hidden mb-0.5"
      style={{
        border: `2px solid ${PODIUM_BORDERS[rank - 1]}`,
        boxShadow: rank === 1 ? '0 0 12px rgba(255,215,0,0.3)' : 'none',
      }}
    >
      {entry.profilePhoto ? (
        <img src={entry.profilePhoto} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-800 text-amber-400 font-black text-sm">
          {entry.playerName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <span className="text-[9px] font-bold text-purple-200 truncate w-full text-center mb-0.5">{entry.playerName}</span>
    <span className="text-lg mb-0.5">{RANK_BADGES[rank - 1]}</span>

    {/* Podium */}
    <div className="w-full rounded-t-xl flex flex-col items-center justify-center"
      style={{
        height: `${PODIUM_HEIGHTS[rank - 1]}px`,
        background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${PODIUM_BORDERS[rank - 1]}`,
        borderBottom: 'none',
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <img src={dimsumImg} alt="" className="h-4 w-4" />
        <span className="text-sm font-black text-amber-400">{entry.totalDimsum}</span>
      </div>
      <span className="text-[8px] text-purple-400">⭐ {entry.totalStars}</span>
    </div>
  </div>
);

/* ─── Leaderboard Row ────────────────────────────────────────────────────── */

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; rank: number; isCurrentPlayer: boolean }> = ({ entry, rank, isCurrentPlayer }) => (
  <div className="flex items-center gap-2.5 rounded-xl p-2.5"
    style={{
      background: isCurrentPlayer ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.35)',
      border: isCurrentPlayer
        ? '1px solid rgba(255,215,0,0.2)'
        : '1px solid rgba(255,215,0,0.08)',
    }}
  >
    <div className="w-7 text-center">
      <span className="text-xs font-black text-purple-400">#{rank}</span>
    </div>
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
      style={{ border: '1px solid rgba(255,215,0,0.15)' }}
    >
      {entry.profilePhoto ? (
        <img src={entry.profilePhoto} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-800 text-xs font-bold text-purple-300">
          {entry.playerName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-white truncate">
        {entry.playerName} {isCurrentPlayer && <span className="text-amber-400">(You)</span>}
      </div>
      <div className="text-[9px] text-purple-400">
        {entry.levelsCompleted} levels • ⭐ {entry.totalStars}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <img src={dimsumImg} alt="" className="h-3.5 w-3.5" />
      <span className="text-sm font-black text-amber-400">{entry.totalDimsum}</span>
    </div>
  </div>
);
