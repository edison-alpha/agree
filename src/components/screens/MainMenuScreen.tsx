import React from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { getTotalStars, getCompletedLevels, getTicketProgress } from '../../store/gameStore';
import { LEVELS, getMaxStars } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import heartImg from '../../assets/underwater/Bonus/Heart.webp';

interface MainMenuScreenProps {
  storeData: GameStoreData;
  playerName: string;
  profilePhoto: string | null;
  onPlay: () => void;
  onLeaderboard: () => void;
  onInventory: () => void;
  onMysteryBox: () => void;
  onSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  storeData,
  playerName,
  profilePhoto,
  onPlay,
  onLeaderboard,
  onInventory,
  onMysteryBox,
  onSettings,
}) => {
  const totalStars = getTotalStars(storeData);
  const maxStars = getMaxStars();
  const completedLevels = getCompletedLevels(storeData);
  const ticketProgress = getTicketProgress(storeData);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{
        padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
      }}
    >
      {/* Floating dimsum bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bubbleImg}
            alt=""
            className="absolute opacity-[0.06]"
            style={{
              width: `${20 + i * 8}px`,
              left: `${10 + i * 15}%`,
              bottom: `-${20 + i * 10}px`,
              animation: `float-up ${7 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center gap-3 sm:gap-4">
        {/* Logo */}
        <div className="text-center mb-1">
          <img
            src={dimsumImg}
            alt="Dimsum"
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24 mb-2"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.35))' }}
          />
          <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-yellow-400 sm:text-4xl"
            style={{ textShadow: '0 2px 12px rgba(250,204,21,0.3)' }}
          >
            Dimsum Dash
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Collect • Battle • Unlock</p>
        </div>

        {/* Profile Card */}
        <div className="w-full rounded-[22px] border border-white/10 bg-[#171717]/95 p-3 flex items-center gap-3 shadow-xl">
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-yellow-500"
            style={{ border: '2px solid rgba(250,204,21,0.4)' }}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt={playerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black text-black">{playerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate">{playerName}</div>
            <div className="flex items-center gap-2.5 text-[10px] text-zinc-500">
              <span>⭐ {totalStars}/{maxStars}</span>
              <span className="flex items-center gap-0.5">
                <img src={dimsumImg} alt="" className="h-3 w-3" /> {storeData.totalDimsum}
              </span>
              <span>🎫 {storeData.tickets}</span>
            </div>
          </div>
          <button
            onClick={onSettings}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition active:scale-90"
          >
            <span className="text-base">⚙️</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { label: 'Levels', value: `${completedLevels}/${LEVELS.length}`, spriteIcon: null, emoji: '📋', color: 'text-blue-400' },
            { label: 'Dimsum', value: storeData.totalDimsum.toString(), spriteIcon: dimsumImg, emoji: '', color: 'text-yellow-400' },
            { label: 'Tickets', value: storeData.tickets.toString(), spriteIcon: chestClosed, emoji: '', color: 'text-purple-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#171717]/95 p-2.5 text-center shadow-lg"
            >
              {stat.spriteIcon ? (
                <img src={stat.spriteIcon} alt="" className="mx-auto h-5 w-5 mb-0.5" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
              ) : (
                <div className="text-base mb-0.5">{stat.emoji}</div>
              )}
              <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ticket Progress */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400/70">Next Ticket</span>
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
              <img src={dimsumImg} alt="" className="h-3 w-3" />
              {ticketProgress.current}/{ticketProgress.needed}
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(ticketProgress.current / ticketProgress.needed) * 100}%`,
                background: 'linear-gradient(90deg, #eab308, #f59e0b)',
                boxShadow: '0 0 6px rgba(234,179,8,0.3)',
              }}
            />
          </div>
        </div>

        {/* Main Play Button */}
        <button
          onClick={onPlay}
          className="w-full rounded-2xl bg-yellow-500 py-3.5 text-base font-black uppercase tracking-[0.22em] text-black shadow-lg transition hover:bg-yellow-400 active:scale-[0.97] sm:py-4"
          style={{ boxShadow: '0 6px 20px rgba(234,179,8,0.3)' }}
        >
          🎮 Play
        </button>

        {/* Secondary Buttons */}
        <div className="w-full grid grid-cols-3 gap-2">
          <MenuButton icon="🏆" label="Leaderboard" onClick={onLeaderboard} />
          <MenuButton icon="" label="Inventory" onClick={onInventory} spriteIcon={heartImg} />
          <MenuButton icon="" label="Mystery Box" onClick={onMysteryBox} spriteIcon={chestClosed} badge={storeData.tickets > 0 ? storeData.tickets : undefined} />
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.06; }
          50% { transform: translateY(-${window.innerHeight}px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

interface MenuButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  spriteIcon?: string;
  badge?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, spriteIcon, badge }) => (
  <button
    onClick={onClick}
    className="relative rounded-2xl border border-white/10 bg-[#171717]/95 py-3 flex flex-col items-center gap-1 transition active:scale-[0.95] shadow-lg"
  >
    {spriteIcon ? (
      <img src={spriteIcon} alt="" className="h-5 w-5" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
    ) : (
      <span className="text-lg">{icon}</span>
    )}
    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</span>
    {badge !== undefined && (
      <div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white bg-red-500"
        style={{ boxShadow: '0 2px 4px rgba(239,68,68,0.4)' }}
      >
        {badge}
      </div>
    )}
  </button>
);
