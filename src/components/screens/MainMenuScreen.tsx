import React from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { getTotalStars, getCompletedLevels, getTicketProgress } from '../../store/gameStore';
import { LEVELS, getMaxStars } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import heartImg from '../../assets/underwater/Bonus/Heart.webp';
import shieldImg from '../../assets/underwater/Bonus/Shield.webp';
import pearlImg from '../../assets/underwater/Bonus/Pearl.webp';
import arenaBg from '../../assets/arena_background.webp';

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
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      {/* ── Top HUD Bar ── */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 mx-2 mb-2 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
          style={{
            border: '2px solid rgba(255,215,0,0.5)',
            boxShadow: '0 0 8px rgba(255,215,0,0.2)',
          }}
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-900 text-amber-400 font-black text-sm">
              {playerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          <StatBadge icon={<img src={dimsumImg} alt="" className="w-4 h-4" />} value={storeData.totalDimsum} />
          <StatBadge icon={<span className="text-xs">⭐</span>} value={totalStars} />
          <StatBadge icon={<img src={chestClosed} alt="" className="w-4 h-4" />} value={storeData.tickets} />
        </div>

        {/* Settings */}
        <button onClick={onSettings} className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,215,0,0.15)',
          }}
        >
          <span className="text-sm">⚙️</span>
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 overflow-y-auto">
        {/* Player Card */}
        <div className="w-full rounded-2xl p-4 mb-3 relative overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,215,0,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <img src={crownImg} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                border: '2px solid rgba(255,215,0,0.4)',
                boxShadow: '0 0 12px rgba(255,215,0,0.15)',
              }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-800 text-amber-400 font-black text-xl">
                  {playerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-black text-white truncate">{playerName}</h2>
              <div className="text-[10px] font-bold text-amber-400/70 uppercase tracking-wider">Dimsum Collector</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-purple-300">⭐ {totalStars}/{maxStars}</span>
                <span className="text-[10px] text-purple-300">✅ {completedLevels}/{LEVELS.length}</span>
              </div>
            </div>
          </div>

          {/* Ticket Progress Bar */}
          <div className="mt-3 rounded-xl p-2"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,215,0,0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-wider">Next Ticket</span>
              <span className="text-[9px] font-bold text-purple-300">{ticketProgress.current}/{ticketProgress.needed} 🥟</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(ticketProgress.current / ticketProgress.needed) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.4)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Play Button ── */}
        <button onClick={onPlay}
          className="w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest text-black mb-3 transition active:scale-[0.97] relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
          }}
        >
          <span className="relative z-10">⚔️ Battle</span>
          <div className="absolute inset-0 opacity-20" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 2s ease-in-out infinite',
          }} />
        </button>

        {/* ── Quick Stats Grid ── */}
        <div className="grid grid-cols-2 gap-2 w-full mb-3">
          <QuickStatCard icon={dimsumImg} label="Total Dimsum" value={storeData.totalDimsum} color="#fbbf24" />
          <QuickStatCard icon={coinImg} label="Tickets" value={storeData.tickets} color="#a78bfa" />
        </div>

        {/* ── Menu Buttons Grid ── */}
        <div className="grid grid-cols-2 gap-2 w-full mb-4">
          <MenuButton icon={crownImg} label="Leaderboard" badge={null} onClick={onLeaderboard} />
          <MenuButton icon={shieldImg} label="Inventory" badge={storeData.inventory.length > 0 ? storeData.inventory.length : null} onClick={onInventory} />
          <MenuButton icon={chestClosed} label="Mystery Box" badge={storeData.tickets > 0 ? storeData.tickets : null} onClick={onMysteryBox} />
          <MenuButton icon={pearlImg} label="Rewards" badge={storeData.mysteryBoxRewards.length > 0 ? storeData.mysteryBoxRewards.length : null} onClick={() => onInventory()} />
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="relative z-10 flex items-center justify-around px-2 py-1.5 mx-2 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <NavButton icon="⚔️" label="Battle" active onClick={onPlay} />
        <NavButton icon="🏆" label="Rank" onClick={onLeaderboard} />
        <NavButton icon="🎒" label="Items" onClick={onInventory} />
        <NavButton icon="🎁" label="Box" badge={storeData.tickets > 0} onClick={onMysteryBox} />
        <NavButton icon="⚙️" label="More" onClick={onSettings} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

/* ─── Sub Components ─────────────────────────────────────────────────────── */

const StatBadge: React.FC<{ icon: React.ReactNode; value: number | string }> = ({ icon, value }) => (
  <div className="flex items-center gap-1 rounded-lg px-2 py-0.5"
    style={{
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,215,0,0.1)',
    }}
  >
    {icon}
    <span className="text-xs font-black text-amber-400">{value}</span>
  </div>
);

const QuickStatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
  <div className="rounded-xl p-3 relative overflow-hidden"
    style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,215,0,0.12)',
    }}
  >
    <div className="flex items-center gap-2">
      <img src={icon} alt="" className="w-8 h-8" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
      <div>
        <div className="text-lg font-black" style={{ color }}>{value}</div>
        <div className="text-[8px] font-bold text-purple-300/70 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  </div>
);

const MenuButton: React.FC<{ icon: string; label: string; badge: number | null; onClick: () => void }> = ({ icon, label, badge, onClick }) => (
  <button onClick={onClick}
    className="relative rounded-xl p-3 flex items-center gap-2 transition active:scale-[0.97]"
    style={{
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,215,0,0.12)',
    }}
  >
    <img src={icon} alt="" className="w-7 h-7" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    <span className="text-xs font-bold text-purple-200">{label}</span>
    {badge !== null && (
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-black"
        style={{ background: 'linear-gradient(180deg, #f87171, #dc2626)' }}
      >{badge}</div>
    )}
  </button>
);

const NavButton: React.FC<{ icon: string; label: string; active?: boolean; badge?: boolean; onClick: () => void }> = ({ icon, label, active, badge, onClick }) => (
  <button onClick={onClick}
    className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition active:scale-90"
    style={active ? {
      background: 'rgba(245,158,11,0.1)',
      boxShadow: '0 0 8px rgba(245,158,11,0.1)',
    } : {}}
  >
    <span className="text-lg">{icon}</span>
    <span className={`text-[8px] font-bold uppercase tracking-wider ${active ? 'text-amber-400' : 'text-purple-400'}`}>{label}</span>
    {active && (
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: '#f59e0b' }} />
    )}
    {badge && (
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
        style={{ background: 'linear-gradient(180deg, #f87171, #dc2626)', boxShadow: '0 0 4px rgba(248,113,113,0.5)' }}
      />
    )}
  </button>
);
