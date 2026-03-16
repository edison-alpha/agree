import React, { useState } from 'react';
import type { GameStoreData, MysteryBoxReward } from '../../store/gameStore';
import { getTotalStars, getCompletedLevels, getTicketProgress } from '../../store/gameStore';
import { LEVELS } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import shieldImg from '../../assets/underwater/Bonus/Shield.webp';
import arenaBg from '../../assets/arena_background.webp';

interface InventoryScreenProps {
  storeData: GameStoreData;
  playerName: string;
  profilePhoto: string | null;
  onBack: () => void;
  onMysteryBox: () => void;
}

type TabId = 'overview' | 'items' | 'rewards' | 'tickets';

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  storeData,
  playerName,
  profilePhoto,
  onBack,
  onMysteryBox,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const totalStars = getTotalStars(storeData);
  const completedLevels = getCompletedLevels(storeData);
  const ticketProgress = getTicketProgress(storeData);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Profile', icon: '👤' },
    { id: 'items', label: 'Items', icon: '🎒' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
  ];

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
          <img src={shieldImg} alt="" className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">Inventory</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Tab Bar */}
      <div className="relative z-10 flex gap-1 mx-4 mb-2 overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap"
            style={{
              background: activeTab === tab.id
                ? 'rgba(245,158,11,0.12)'
                : 'rgba(0,0,0,0.25)',
              border: activeTab === tab.id
                ? '1px solid rgba(255,215,0,0.25)'
                : '1px solid rgba(255,215,0,0.06)',
              color: activeTab === tab.id ? '#fbbf24' : '#a78bfa',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 pb-3">
        {activeTab === 'overview' && (
          <OverviewTab playerName={playerName} profilePhoto={profilePhoto} totalStars={totalStars}
            totalDimsum={storeData.totalDimsum} completedLevels={completedLevels} totalLevels={LEVELS.length} tickets={storeData.tickets} />
        )}
        {activeTab === 'items' && <ItemsTab storeData={storeData} />}
        {activeTab === 'rewards' && <RewardsTab rewards={storeData.mysteryBoxRewards} />}
        {activeTab === 'tickets' && (
          <TicketsTab tickets={storeData.tickets} ticketProgress={ticketProgress} totalDimsum={storeData.totalDimsum} onMysteryBox={onMysteryBox} />
        )}
      </div>
    </div>
  );
};

/* ─── Overview Tab ─────────────────────────────────────────────────────── */

const OverviewTab: React.FC<{
  playerName: string; profilePhoto: string | null; totalStars: number; totalDimsum: number;
  completedLevels: number; totalLevels: number; tickets: number;
}> = ({ playerName, profilePhoto, totalStars, totalDimsum, completedLevels, totalLevels, tickets }) => (
  <div className="space-y-3">
    {/* Profile Card */}
    <div className="rounded-2xl p-5 text-center relative overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,215,0,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="absolute top-2 right-2 opacity-10">
        <img src={crownImg} alt="" className="w-16 h-16" />
      </div>
      <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden"
        style={{ border: '3px solid rgba(255,215,0,0.4)', boxShadow: '0 0 16px rgba(255,215,0,0.2)' }}
      >
        {profilePhoto ? (
          <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-800 text-amber-400 font-black text-2xl">
            {playerName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h2 className="text-lg font-black text-white mb-0.5">{playerName}</h2>
      <div className="text-[10px] font-bold text-amber-400/60 uppercase tracking-[0.3em]">Dimsum Collector</div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Dimsum', value: totalDimsum, img: dimsumImg, color: '#fbbf24' },
        { label: 'Stars', value: totalStars, emoji: '⭐', color: '#fbbf24' },
        { label: 'Levels', value: `${completedLevels}/${totalLevels}`, emoji: '✅', color: '#4ade80' },
        { label: 'Tickets', value: tickets, img: chestClosed, color: '#a78bfa' },
      ].map((s) => (
        <div key={s.label} className="rounded-xl p-3"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,215,0,0.1)',
          }}
        >
          <div className="flex items-center gap-2">
            {s.img ? <img src={s.img} alt="" className="w-6 h-6" /> : <span className="text-lg">{s.emoji}</span>}
            <div>
              <div className="text-base font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[8px] font-bold text-purple-400 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Items Tab ────────────────────────────────────────────────────────── */

const ItemsTab: React.FC<{ storeData: GameStoreData }> = ({ storeData }) => (
  <div className="space-y-2">
    {storeData.inventory.length === 0 ? (
      <div className="text-center py-12">
        <img src={shieldImg} alt="" className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p className="text-purple-300 text-sm font-bold">No items yet!</p>
        <p className="text-purple-400/60 text-xs mt-1">Open Mystery Boxes to find items</p>
      </div>
    ) : (
      storeData.inventory.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-xl p-3"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,215,0,0.1)',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.12)' }}
          >{item.icon}</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">{item.name}</div>
            <div className="text-[10px] text-purple-400">{item.description}</div>
          </div>
          <div className="text-xs font-black text-amber-400/60">x{item.quantity}</div>
        </div>
      ))
    )}
  </div>
);

/* ─── Rewards Tab ──────────────────────────────────────────────────────── */

const RewardsTab: React.FC<{ rewards: MysteryBoxReward[] }> = ({ rewards }) => (
  <div className="space-y-2">
    {rewards.length === 0 ? (
      <div className="text-center py-12">
        <img src={chestClosed} alt="" className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p className="text-purple-300 text-sm font-bold">No rewards yet!</p>
        <p className="text-purple-400/60 text-xs mt-1">Use tickets + codes for Mystery Boxes</p>
      </div>
    ) : (
      rewards.map((reward, i) => <RewardCard key={i} reward={reward} />)
    )}
  </div>
);

const RewardCard: React.FC<{ reward: MysteryBoxReward }> = ({ reward }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <button onClick={() => setExpanded(!expanded)} className="w-full text-left rounded-xl p-3 transition"
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,215,0,0.1)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{reward.icon}</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-white">{reward.name}</div>
          <div className="text-[10px] text-purple-400">{reward.description}</div>
        </div>
        <span className="text-purple-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && reward.message && (
        <div className="mt-2 rounded-xl p-3 text-sm leading-relaxed whitespace-pre-wrap text-purple-200"
          style={{
            background: 'rgba(219,39,119,0.06)',
            border: '1px solid rgba(219,39,119,0.15)',
          }}
        >{reward.message}</div>
      )}
    </button>
  );
};

/* ─── Tickets Tab ──────────────────────────────────────────────────────── */

const TicketsTab: React.FC<{
  tickets: number; ticketProgress: { current: number; needed: number }; totalDimsum: number; onMysteryBox: () => void;
}> = ({ tickets, ticketProgress, totalDimsum, onMysteryBox }) => (
  <div className="space-y-3">
    {/* Ticket Count */}
    <div className="rounded-2xl p-5 text-center"
      style={{
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,215,0,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <img src={chestClosed} alt="" className="mx-auto h-14 w-14 mb-2" style={{ filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.3))' }} />
      <div className="text-3xl font-black text-amber-400 mb-0.5">{tickets}</div>
      <div className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.3em]">Available Tickets</div>
    </div>

    {/* Progress */}
    <div className="rounded-xl p-3"
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,215,0,0.1)',
      }}
    >
      <div className="text-[10px] font-bold text-amber-400/60 uppercase tracking-wider mb-2">Next Ticket Progress</div>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {Array.from({ length: ticketProgress.needed }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: i < ticketProgress.current
                ? 'rgba(245,158,11,0.12)'
                : 'rgba(255,255,255,0.03)',
              border: i < ticketProgress.current
                ? '1px solid rgba(255,215,0,0.25)'
                : '1px solid rgba(255,215,0,0.06)',
            }}
          >
            <img src={dimsumImg} alt="" className={`h-4 w-4 ${i < ticketProgress.current ? '' : 'opacity-20 grayscale'}`} />
          </div>
        ))}
        <span className="text-xs text-purple-400">→ 🎫</span>
      </div>
      <div className="text-[10px] text-purple-400/70">
        Collect {ticketProgress.needed - ticketProgress.current} more dimsum for a ticket! (Total: {totalDimsum})
      </div>
    </div>

    {/* How it works */}
    <div className="rounded-xl p-3"
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,215,0,0.08)',
      }}
    >
      <div className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider mb-2">How It Works</div>
      {[
        { icon: '🥟', text: 'Collect 6 dimsum across levels' },
        { icon: '🎫', text: 'Earn 1 ticket per 6 dimsum' },
        { icon: '🔑', text: 'Ticket + code → Mystery Box' },
        { icon: '🎁', text: 'Mystery Boxes contain special rewards!' },
      ].map((step, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.08)' }}
          >{step.icon}</div>
          <span className="text-[10px] text-purple-300/70">{step.text}</span>
        </div>
      ))}
    </div>

    {tickets > 0 && (
      <button onClick={onMysteryBox}
        className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition active:scale-[0.97]"
        style={{
          background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
        }}
      >🎁 Open Mystery Box</button>
    )}
  </div>
);
