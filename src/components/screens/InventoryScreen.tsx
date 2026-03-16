import React, { useState } from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { getTotalStars, getTicketProgress } from '../../store/gameStore';
import { LEVELS } from '../../constants/levels';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import chestOpen from '../../assets/underwater/Neutral/æhest_open.webp';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import shieldImg from '../../assets/underwater/Bonus/Shield.webp';
import pearlImg from '../../assets/underwater/Bonus/Pearl.webp';
import heartImg from '../../assets/underwater/Bonus/Heart.webp';
import swordIcon from '../../assets/water-fire-sprite-magic/Icons/PNG/Icons_Fire Arrow.webp';
import magicIcon from '../../assets/water-fire-sprite-magic/Icons/PNG/Icons_Fire Spell.webp';
import arenaBg from '../../assets/arena_background.webp';

interface InventoryScreenProps {
  storeData: GameStoreData;
  onBack: () => void;
}

type TabId = 'overview' | 'items' | 'rewards' | 'tickets';

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  storeData,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const totalStars = getTotalStars(storeData);
  const ticketProgress = getTicketProgress(storeData);

  const tabIcons: Record<TabId, string> = {
    overview: coinImg,
    items: shieldImg,
    rewards: chestOpen,
    tickets: chestClosed,
  };
  const tabLabels: Record<TabId, string> = {
    overview: 'Overview',
    items: 'Items',
    rewards: 'Rewards',
    tickets: 'Tickets',
  };

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
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2 mx-2 mb-2"
        style={{
          background: 'linear-gradient(180deg, rgba(62,40,20,0.92) 0%, rgba(40,26,12,0.95) 100%)',
          borderRadius: '12px',
          border: '2px solid rgba(180,140,60,0.5)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.15)',
        }}
      >
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90"
          style={{
            background: 'linear-gradient(180deg, rgba(80,50,20,0.8) 0%, rgba(50,30,10,0.9) 100%)',
            border: '1px solid rgba(180,140,60,0.4)',
          }}
        >
          <span className="text-amber-400 text-lg font-black">‹</span>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <img src={shieldImg} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }} />
          <h1 className="text-sm font-black text-amber-100 tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >INVENTORY</h1>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative z-10 flex gap-1 px-2 mb-2">
        {(['overview', 'items', 'rewards', 'tickets'] as TabId[]).map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition"
            style={{
              background: activeTab === tab
                ? 'linear-gradient(180deg, rgba(180,140,60,0.25) 0%, rgba(62,40,20,0.9) 100%)'
                : 'rgba(0,0,0,0.25)',
              border: `1.5px solid ${activeTab === tab ? 'rgba(180,140,60,0.5)' : 'rgba(80,60,30,0.2)'}`,
              boxShadow: activeTab === tab ? 'inset 0 1px 0 rgba(255,215,0,0.1)' : 'none',
            }}
          >
            <img src={tabIcons[tab]} alt="" className="w-4 h-4" style={{ filter: activeTab === tab ? 'brightness(1.3)' : 'brightness(0.5) grayscale(0.4)' }} />
            <span className={`text-[8px] font-bold uppercase tracking-wider ${activeTab === tab ? 'text-amber-300' : 'text-amber-700'}`}>
              {tabLabels[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-4">
        {activeTab === 'overview' && <OverviewTab storeData={storeData} totalStars={totalStars} ticketProgress={ticketProgress} />}
        {activeTab === 'items' && <ItemsTab storeData={storeData} />}
        {activeTab === 'rewards' && <RewardsTab storeData={storeData} />}
        {activeTab === 'tickets' && <TicketsTab storeData={storeData} ticketProgress={ticketProgress} />}
      </div>
    </div>
  );
};

/* ─── Overview Tab ─────────────────────────────────────────────────────── */

const OverviewTab: React.FC<{
  storeData: GameStoreData;
  totalStars: number;
  ticketProgress: { current: number; needed: number };
}> = ({ storeData, totalStars, ticketProgress }) => (
  <div className="space-y-2.5">
    {/* Resource Grid */}
    <div className="grid grid-cols-2 gap-2">
      <ResourceCard icon={dimsumImg} label="Total Dimsum" value={storeData.totalDimsum} />
      <ResourceCard icon={coinImg} label="Stars" value={totalStars} />
      <ResourceCard icon={chestClosed} label="Tickets" value={storeData.tickets} />
      <ResourceCard icon={shieldImg} label="Items" value={storeData.inventory.length} />
    </div>

    {/* Level Progress */}
    <SectionPanel title="Level Progress" icon={swordIcon}>
      <div className="space-y-1.5">
        {LEVELS.map(level => {
          const progress = storeData.levels[level.id];
          const stars = progress?.stars || 0;
          const dim = progress?.dimsumCollected || 0;
          return (
            <div key={level.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(180,140,60,0.1)' }}
            >
              <span className="text-[9px] font-bold text-amber-600/60 w-5 text-center">{level.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-amber-200 truncate">{level.name}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3].map(s => (
                    <span key={s} className="text-[8px]" style={{ filter: stars >= s ? 'none' : 'grayscale(1) opacity(0.3)' }}>
                      {stars >= s ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <img src={dimsumImg} alt="" className="w-3 h-3" />
                <span className={`text-[9px] font-bold ${dim === level.dimsumCount ? 'text-emerald-400' : 'text-amber-500/60'}`}>
                  {dim}/{level.dimsumCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionPanel>

    {/* Ticket Progress */}
    <SectionPanel title="Ticket Progress" icon={chestClosed}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-amber-400/70">Next ticket in</span>
        <div className="flex items-center gap-1">
          <img src={dimsumImg} alt="" className="w-3 h-3" />
          <span className="text-[10px] font-bold text-amber-300">{ticketProgress.current}/{ticketProgress.needed}</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(180,140,60,0.15)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(ticketProgress.current / ticketProgress.needed) * 100}%`,
            background: 'linear-gradient(90deg, #b45309, #f59e0b, #fbbf24)',
            boxShadow: '0 0 6px rgba(245,158,11,0.4)',
          }}
        />
      </div>
    </SectionPanel>
  </div>
);

/* ─── Items Tab ────────────────────────────────────────────────────────── */

const ItemsTab: React.FC<{ storeData: GameStoreData }> = ({ storeData }) => {
  const typeIcons: Record<string, string> = {
    consumable: heartImg,
    cosmetic: crownImg,
    special: pearlImg,
  };

  if (storeData.inventory.length === 0) {
    return (
      <EmptyState icon={shieldImg} title="No Items Yet" desc="Complete levels and open mystery boxes to get items!" />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {storeData.inventory.map(item => (
        <div key={item.id} className="relative rounded-xl p-2 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
            border: '2px solid rgba(180,140,60,0.25)',
            boxShadow: 'inset 0 1px 0 rgba(255,215,0,0.06)',
          }}
        >
          <img src={typeIcons[item.type] || shieldImg} alt="" className="w-8 h-8 mb-1"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
          />
          <p className="text-[9px] font-bold text-amber-200 truncate w-full">{item.name}</p>
          <p className="text-[8px] text-amber-600/50">x{item.quantity}</p>
          {/* Rarity glow for special items */}
          {item.type === 'special' && (
            <div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ boxShadow: 'inset 0 0 12px rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.2)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Rewards Tab ──────────────────────────────────────────────────────── */

const RewardsTab: React.FC<{ storeData: GameStoreData }> = ({ storeData }) => {
  const rewardIcons: Record<string, string> = {
    birthday_card: heartImg,
    inventory_item: shieldImg,
    dimsum_bonus: dimsumImg,
    cosmetic: crownImg,
  };

  if (storeData.mysteryBoxRewards.length === 0) {
    return (
      <EmptyState icon={chestOpen} title="No Rewards Yet" desc="Use tickets to open mystery boxes and collect rewards!" />
    );
  }

  return (
    <div className="space-y-2">
      {storeData.mysteryBoxRewards.map(reward => (
        <div key={reward.id} className="rounded-xl p-3 flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
            border: `2px solid ${reward.type === 'birthday_card' ? 'rgba(192,132,252,0.3)' : 'rgba(180,140,60,0.25)'}`,
            boxShadow: reward.type === 'birthday_card' ? 'inset 0 0 15px rgba(192,132,252,0.1)' : 'inset 0 1px 0 rgba(255,215,0,0.06)',
          }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(180,140,60,0.2)',
            }}
          >
            <img src={rewardIcons[reward.type] || pearlImg} alt="" className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-200">{reward.name}</p>
            <p className="text-[9px] text-amber-500/60 mt-0.5">{reward.description}</p>
            {reward.message && (
              <div className="mt-1.5 rounded-lg px-2 py-1.5 text-[9px] text-purple-300 italic"
                style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.15)' }}
              >
                "{reward.message}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Tickets Tab ──────────────────────────────────────────────────────── */

const TicketsTab: React.FC<{
  storeData: GameStoreData;
  ticketProgress: { current: number; needed: number };
}> = ({ storeData, ticketProgress }) => (
  <div className="space-y-2.5">
    {/* Ticket Display */}
    <div className="rounded-xl p-4 flex flex-col items-center"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
        border: '2px solid rgba(180,140,60,0.3)',
        boxShadow: 'inset 0 1px 0 rgba(255,215,0,0.08)',
      }}
    >
      <img src={chestClosed} alt="" className="w-16 h-16 mb-2" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
      <p className="text-2xl font-black text-amber-300 drop-shadow-lg">{storeData.tickets}</p>
      <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Available Tickets</p>
    </div>

    {/* Progress */}
    <div className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.8) 0%, rgba(40,26,12,0.85) 100%)',
        border: '2px solid rgba(180,140,60,0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-amber-500/70">Next ticket progress</span>
        <div className="flex items-center gap-1">
          <img src={dimsumImg} alt="" className="w-3 h-3" />
          <span className="text-[10px] font-bold text-amber-300">{ticketProgress.current}/{ticketProgress.needed}</span>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(180,140,60,0.15)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(ticketProgress.current / ticketProgress.needed) * 100}%`,
            background: 'linear-gradient(90deg, #b45309, #f59e0b, #fbbf24)',
            boxShadow: '0 0 6px rgba(245,158,11,0.4)',
          }}
        />
      </div>
      <p className="text-[9px] text-amber-700/50 mt-1.5 text-center">
        Collect 6 dimsum across all levels to earn 1 ticket
      </p>
    </div>

    {/* History */}
    <div className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.8) 0%, rgba(40,26,12,0.85) 100%)',
        border: '2px solid rgba(180,140,60,0.2)',
      }}
    >
      <p className="text-[10px] font-bold text-amber-500/70 mb-2">Ticket Stats</p>
      <div className="space-y-1">
        <StatRow label="Total Earned" value={storeData.tickets + storeData.ticketsUsed} />
        <StatRow label="Used" value={storeData.ticketsUsed} />
        <StatRow label="Remaining" value={storeData.tickets} />
      </div>
    </div>
  </div>
);

/* ─── Shared Components ────────────────────────────────────────────────── */

const ResourceCard: React.FC<{ icon: string; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="rounded-xl p-3 flex items-center gap-2.5"
    style={{
      background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
      border: '2px solid rgba(180,140,60,0.25)',
      boxShadow: 'inset 0 1px 0 rgba(255,215,0,0.06)',
    }}
  >
    <img src={icon} alt="" className="w-8 h-8" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }} />
    <div>
      <p className="text-lg font-black text-amber-300 drop-shadow">{value}</p>
      <p className="text-[8px] font-bold text-amber-600/60 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const SectionPanel: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-xl overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
      border: '2px solid rgba(180,140,60,0.25)',
    }}
  >
    <div className="flex items-center gap-2 px-3 py-2"
      style={{ background: 'rgba(180,140,60,0.1)', borderBottom: '1px solid rgba(180,140,60,0.15)' }}
    >
      <img src={icon} alt="" className="w-4 h-4" />
      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

const StatRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between px-2 py-1 rounded-lg"
    style={{ background: 'rgba(0,0,0,0.15)' }}
  >
    <span className="text-[10px] text-amber-500/60">{label}</span>
    <span className="text-[10px] font-bold text-amber-300">{value}</span>
  </div>
);

const EmptyState: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
        border: '2px solid rgba(180,140,60,0.2)',
      }}
    >
      <img src={icon} alt="" className="w-10 h-10 opacity-40" />
    </div>
    <p className="text-sm font-bold text-amber-600/70 text-center">{title}</p>
    <p className="text-xs text-amber-700/50 text-center max-w-[200px]">{desc}</p>
  </div>
);
