import React, { useState, useEffect } from 'react';
import type { GameStoreData, MysteryBoxReward } from '../../store/gameStore';
import { redeemCode, saveGameData } from '../../store/gameStore';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import chestAjar from '../../assets/underwater/Neutral/æhest_ajar.webp';
import chestOpen from '../../assets/underwater/Neutral/æhest_open.webp';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import pearlImg from '../../assets/underwater/Bonus/Pearl.webp';
import heartImg from '../../assets/underwater/Bonus/Heart.webp';
import shieldImg from '../../assets/underwater/Bonus/Shield.webp';
import arenaBg from '../../assets/arena_background.webp';

interface MysteryBoxScreenProps {
  storeData: GameStoreData;
  onBack: () => void;
  onDataChange: (data: GameStoreData) => void;
}

type Phase = 'input' | 'opening' | 'revealed';

export const MysteryBoxScreen: React.FC<MysteryBoxScreenProps> = ({
  storeData,
  onBack,
  onDataChange,
}) => {
  const [phase, setPhase] = useState<Phase>('input');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [reward, setReward] = useState<MysteryBoxReward | null>(null);
  const [chestState, setChestState] = useState<'closed' | 'ajar' | 'open'>('closed');
  const [showReward, setShowReward] = useState(false);

  const handleRedeem = () => {
    setError('');
    if (!code.trim()) {
      setError('Enter a redemption code');
      return;
    }
    if (storeData.tickets < 1) {
      setError('You need at least 1 ticket!');
      return;
    }

    const result = redeemCode(storeData, code.trim());
    if (!result) {
      setError('Invalid or already redeemed code');
      return;
    }

    // result contains { data, reward } — data already has ticket decremented and reward added
    saveGameData(result.data);
    onDataChange(result.data);
    setReward(result.reward);
    setPhase('opening');
  };

  // Chest opening animation sequence
  useEffect(() => {
    if (phase !== 'opening') return;
    const t1 = setTimeout(() => setChestState('ajar'), 800);
    const t2 = setTimeout(() => setChestState('open'), 1800);
    const t3 = setTimeout(() => {
      setPhase('revealed');
      setShowReward(true);
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  const rewardIcons: Record<string, string> = {
    birthday_card: heartImg,
    inventory_item: shieldImg,
    dimsum_bonus: dimsumImg,
    cosmetic: crownImg,
  };

  const chestImages = { closed: chestClosed, ajar: chestAjar, open: chestOpen };

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
          <img src={chestClosed} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }} />
          <h1 className="text-sm font-black text-amber-100 tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >MYSTERY BOX</h1>
        </div>
        <div className="flex items-center gap-1 rounded-lg px-2 py-1"
          style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(180,140,60,0.2)' }}
        >
          <img src={chestClosed} alt="" className="w-3.5 h-3.5" />
          <span className="text-xs font-black text-amber-400">{storeData.tickets}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        {phase === 'input' && (
          <InputPhase
            code={code}
            onCodeChange={setCode}
            error={error}
            tickets={storeData.tickets}
            onRedeem={handleRedeem}
          />
        )}

        {phase === 'opening' && (
          <OpeningPhase chestImage={chestImages[chestState]} chestState={chestState} />
        )}

        {phase === 'revealed' && reward && (
          <RevealedPhase
            reward={reward}
            rewardIcon={rewardIcons[reward.type] || pearlImg}
            showReward={showReward}
            onClose={() => {
              setPhase('input');
              setCode('');
              setChestState('closed');
              setShowReward(false);
              setReward(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Input Phase ──────────────────────────────────────────────────────── */

const InputPhase: React.FC<{
  code: string;
  onCodeChange: (c: string) => void;
  error: string;
  tickets: number;
  onRedeem: () => void;
}> = ({ code, onCodeChange, error, tickets, onRedeem }) => (
  <div className="w-full max-w-xs space-y-4">
    {/* Chest Display */}
    <div className="flex flex-col items-center mb-2">
      <img src={chestClosed} alt="" className="w-24 h-24 mb-3"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))', animation: 'chestFloat 2s ease-in-out infinite' }}
      />
      <p className="text-sm font-bold text-amber-300 text-center">Enter your code to open!</p>
      <p className="text-[10px] text-amber-600/60 text-center mt-1">Requires 1 ticket + redemption code</p>
    </div>

    {/* Ticket Status */}
    <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-2"
      style={{
        background: tickets > 0 ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
        border: `1px solid ${tickets > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
      }}
    >
      <img src={chestClosed} alt="" className="w-5 h-5" />
      <span className={`text-xs font-bold ${tickets > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {tickets > 0 ? `${tickets} ticket${tickets > 1 ? 's' : ''} available` : 'No tickets available'}
      </span>
    </div>

    {/* Code Input */}
    <div className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
        border: '2px solid rgba(180,140,60,0.3)',
      }}
    >
      <label className="text-[9px] font-bold text-amber-500/70 uppercase tracking-wider mb-1.5 block">
        Redemption Code
      </label>
      <input
        type="text"
        value={code}
        onChange={e => onCodeChange(e.target.value.toUpperCase())}
        placeholder="ENTER CODE..."
        className="w-full px-3 py-2.5 rounded-lg text-sm font-bold text-amber-200 placeholder-amber-800/40 text-center tracking-[0.2em] outline-none"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(180,140,60,0.2)',
        }}
      />
      {error && (
        <p className="text-[10px] text-red-400 text-center mt-2 font-bold">{error}</p>
      )}
    </div>

    {/* Redeem Button */}
    <button onClick={onRedeem}
      disabled={tickets < 1}
      className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest transition active:scale-[0.97] flex items-center justify-center gap-2"
      style={{
        background: tickets > 0
          ? 'linear-gradient(180deg, #b45309 0%, #78350f 100%)'
          : 'rgba(60,40,20,0.5)',
        border: `2px solid ${tickets > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(80,60,30,0.2)'}`,
        boxShadow: tickets > 0 ? '0 4px 12px rgba(180,100,10,0.3), inset 0 1px 0 rgba(255,215,0,0.15)' : 'none',
        color: tickets > 0 ? '#fef3c7' : 'rgba(180,140,60,0.3)',
        textShadow: tickets > 0 ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
        opacity: tickets > 0 ? 1 : 0.5,
      }}
    >
      <img src={chestClosed} alt="" className="w-5 h-5" style={{ filter: tickets > 0 ? 'brightness(1.3)' : 'brightness(0.3)' }} />
      Open Box
    </button>

    <style>{`
      @keyframes chestFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `}</style>
  </div>
);

/* ─── Opening Phase ────────────────────────────────────────────────────── */

const OpeningPhase: React.FC<{
  chestImage: string;
  chestState: string;
}> = ({ chestImage, chestState }) => (
  <div className="flex flex-col items-center">
    {/* Glow behind chest */}
    <div className="relative">
      <div className="absolute inset-0 -m-8 rounded-full"
        style={{
          background: `radial-gradient(circle, ${
            chestState === 'open' ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.1)'
          }, transparent 70%)`,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <img src={chestImage} alt=""
        className="w-32 h-32 relative z-10"
        style={{
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
          animation: chestState === 'ajar' ? 'chestShake 0.3s ease-in-out infinite' : undefined,
          transform: chestState === 'open' ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.5s ease-out',
        }}
      />
    </div>
    <p className="text-sm font-bold text-amber-400 mt-4 animate-pulse"
      style={{ textShadow: '0 0 8px rgba(251,191,36,0.4)' }}
    >
      {chestState === 'closed' ? 'Preparing...' : chestState === 'ajar' ? 'Opening...' : 'Revealing!'}
    </p>
    <style>{`
      @keyframes chestShake {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

/* ─── Revealed Phase ───────────────────────────────────────────────────── */

const RevealedPhase: React.FC<{
  reward: MysteryBoxReward;
  rewardIcon: string;
  showReward: boolean;
  onClose: () => void;
}> = ({ reward, rewardIcon, showReward, onClose }) => (
  <div className={`flex flex-col items-center w-full max-w-xs transition-all duration-700 ${showReward ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
    {/* Reward glow */}
    <div className="relative mb-4">
      <div className="absolute inset-0 -m-12 rounded-full"
        style={{
          background: reward.type === 'birthday_card'
            ? 'radial-gradient(circle, rgba(192,132,252,0.3), transparent 70%)'
            : 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)',
        }}
      />
      <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(62,40,20,0.9) 0%, rgba(40,26,12,0.95) 100%)',
          border: reward.type === 'birthday_card'
            ? '3px solid rgba(192,132,252,0.5)'
            : '3px solid rgba(180,140,60,0.5)',
          boxShadow: `0 0 20px ${reward.type === 'birthday_card' ? 'rgba(192,132,252,0.2)' : 'rgba(180,140,60,0.2)'}`,
        }}
      >
        <img src={rewardIcon} alt="" className="w-12 h-12" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
      </div>
    </div>

    {/* Reward Info */}
    <div className="w-full rounded-xl p-4 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.9) 0%, rgba(40,26,12,0.95) 100%)',
        border: `2px solid ${reward.type === 'birthday_card' ? 'rgba(192,132,252,0.3)' : 'rgba(180,140,60,0.3)'}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-wider mb-1">You received</p>
      <h3 className="text-base font-black text-amber-200 mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        {reward.name}
      </h3>
      <p className="text-xs text-amber-500/60">{reward.description}</p>

      {/* Birthday card message */}
      {reward.message && (
        <div className="mt-3 rounded-lg px-3 py-2"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}
        >
          <p className="text-xs text-purple-300 italic leading-relaxed">"{reward.message}"</p>
        </div>
      )}

      {/* Dimsum bonus */}
      {reward.type === 'dimsum_bonus' && reward.value && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <img src={dimsumImg} alt="" className="w-5 h-5" />
          <span className="text-lg font-black text-amber-300">+{reward.value}</span>
        </div>
      )}
    </div>

    {/* Close button */}
    <button onClick={onClose}
      className="mt-4 px-8 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.97]"
      style={{
        background: 'linear-gradient(180deg, rgba(80,50,20,0.8) 0%, rgba(50,30,10,0.9) 100%)',
        border: '2px solid rgba(180,140,60,0.3)',
        color: '#d4a547',
      }}
    >
      Collect
    </button>
  </div>
);
