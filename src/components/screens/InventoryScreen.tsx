import React, { useState } from 'react';
import type { GameStoreData, MysteryBoxReward } from '../../store/gameStore';
import { getTotalStars, getCompletedLevels, getTicketProgress } from '../../store/gameStore';
import { LEVELS } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';

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
    <div
      className="absolute inset-0 z-50 flex flex-col bg-[#111]/95 backdrop-blur-sm"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col px-4 sm:mx-auto sm:max-w-2xl sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0 pt-1">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition active:scale-90">
            <span className="text-base">←</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400">🎒 Inventory</div>
          <div className="w-9" />
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-3 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap border
                ${activeTab === tab.id
                  ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-400'
                  : 'border-white/5 bg-white/3 text-zinc-500'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-3">
          {activeTab === 'overview' && (
            <OverviewTab playerName={playerName} profilePhoto={profilePhoto} totalStars={totalStars} totalDimsum={storeData.totalDimsum} completedLevels={completedLevels} totalLevels={LEVELS.length} tickets={storeData.tickets} />
          )}
          {activeTab === 'items' && <ItemsTab storeData={storeData} />}
          {activeTab === 'rewards' && <RewardsTab rewards={storeData.mysteryBoxRewards} />}
          {activeTab === 'tickets' && (
            <TicketsTab tickets={storeData.tickets} ticketProgress={ticketProgress} totalDimsum={storeData.totalDimsum} onMysteryBox={onMysteryBox} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Overview Tab ────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{
  playerName: string; profilePhoto: string | null; totalStars: number; totalDimsum: number;
  completedLevels: number; totalLevels: number; tickets: number;
}> = ({ playerName, profilePhoto, totalStars, totalDimsum, completedLevels, totalLevels, tickets }) => (
  <div className="space-y-3">
    <div className="rounded-[22px] border border-white/10 bg-[#171717]/95 p-5 text-center shadow-xl">
      <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center bg-yellow-500" style={{ border: '3px solid rgba(250,204,21,0.4)' }}>
        {profilePhoto ? (
          <img src={profilePhoto} alt={playerName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-black text-black">{playerName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <h2 className="text-lg font-black text-white mb-0.5">{playerName}</h2>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Dimsum Collector</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Dimsum', value: totalDimsum, icon: dimsumImg, color: 'text-yellow-400' },
        { label: 'Stars', value: totalStars, icon: null, emoji: '⭐', color: 'text-yellow-400' },
        { label: 'Levels', value: `${completedLevels}/${totalLevels}`, icon: null, emoji: '✅', color: 'text-green-400' },
        { label: 'Tickets', value: tickets, icon: chestClosed, color: 'text-purple-400' },
      ].map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            {stat.icon ? <img src={stat.icon} alt="" className="h-5 w-5" /> : <span className="text-lg">{stat.emoji}</span>}
            <div>
              <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Items Tab ───────────────────────────────────────────────────────────────

const ItemsTab: React.FC<{ storeData: GameStoreData }> = ({ storeData }) => (
  <div className="space-y-2">
    {storeData.inventory.length === 0 ? (
      <div className="text-center py-12">
        <img src={bubbleImg} alt="" className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p className="text-zinc-400 text-sm">No items yet!</p>
        <p className="text-zinc-500 text-xs mt-1">Open Mystery Boxes to find items</p>
      </div>
    ) : (
      storeData.inventory.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white/5 border border-white/10">
            {item.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white">{item.name}</div>
            <div className="text-[10px] text-zinc-500">{item.description}</div>
          </div>
          <div className="text-xs font-black text-zinc-400">x{item.quantity}</div>
        </div>
      ))
    )}
  </div>
);

// ─── Rewards Tab ─────────────────────────────────────────────────────────────

const RewardsTab: React.FC<{ rewards: MysteryBoxReward[] }> = ({ rewards }) => (
  <div className="space-y-2">
    {rewards.length === 0 ? (
      <div className="text-center py-12">
        <img src={chestClosed} alt="" className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p className="text-zinc-400 text-sm">No rewards yet!</p>
        <p className="text-zinc-500 text-xs mt-1">Use tickets + codes for Mystery Boxes</p>
      </div>
    ) : (
      rewards.map((reward, i) => <RewardCard key={i} reward={reward} />)
    )}
  </div>
);

const RewardCard: React.FC<{ reward: MysteryBoxReward }> = ({ reward }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <button onClick={() => setExpanded(!expanded)} className="w-full text-left rounded-[18px] border border-white/10 bg-[#171717]/95 p-3 transition shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{reward.icon}</div>
        <div className="flex-1">
          <div className="text-xs font-bold text-white">{reward.name}</div>
          <div className="text-[10px] text-zinc-500">{reward.description}</div>
        </div>
        <span className="text-zinc-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && reward.message && (
        <div className="mt-2 rounded-xl border border-pink-500/15 bg-pink-500/5 p-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-200">
          {reward.message}
        </div>
      )}
    </button>
  );
};

// ─── Tickets Tab ─────────────────────────────────────────────────────────────

const TicketsTab: React.FC<{
  tickets: number; ticketProgress: { current: number; needed: number }; totalDimsum: number; onMysteryBox: () => void;
}> = ({ tickets, ticketProgress, totalDimsum, onMysteryBox }) => (
  <div className="space-y-3">
    <div className="rounded-[22px] border border-white/10 bg-[#171717]/95 p-5 text-center shadow-xl">
      <img src={chestClosed} alt="" className="mx-auto h-12 w-12 mb-2" style={{ filter: 'drop-shadow(0 2px 8px rgba(168,85,247,0.3))' }} />
      <div className="text-3xl font-black text-yellow-400 mb-0.5">{tickets}</div>
      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Available Tickets</div>
    </div>

    <div className="rounded-[18px] border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400/70 mb-2">Next Ticket Progress</div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {Array.from({ length: ticketProgress.needed }).map((_, i) => (
          <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
            i < ticketProgress.current ? 'border-yellow-400/30 bg-yellow-500/15' : 'border-white/10 bg-white/5'
          }`}>
            <img src={dimsumImg} alt="" className={`h-4 w-4 ${i < ticketProgress.current ? '' : 'opacity-20 grayscale'}`} />
          </div>
        ))}
        <span className="text-xs text-zinc-500">→ 🎫</span>
      </div>
      <div className="text-[10px] text-zinc-500">
        Collect {ticketProgress.needed - ticketProgress.current} more dimsum for a ticket! (Total: {totalDimsum})
      </div>
    </div>

    <div className="rounded-[18px] border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">How It Works</div>
      {[
        { icon: '🥟', text: 'Collect 6 dimsum across levels' },
        { icon: '🎫', text: 'Earn 1 ticket per 6 dimsum' },
        { icon: '🔑', text: 'Ticket + code → Mystery Box' },
        { icon: '🎁', text: 'Mystery Boxes contain special rewards!' },
      ].map((step, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">{step.icon}</div>
          <span className="text-[10px] text-zinc-400">{step.text}</span>
        </div>
      ))}
    </div>

    {tickets > 0 && (
      <button onClick={onMysteryBox}
        className="w-full rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400 active:scale-[0.97]"
        style={{ boxShadow: '0 6px 20px rgba(234,179,8,0.25)' }}
      >
        🎁 Open Mystery Box
      </button>
    )}
  </div>
);
