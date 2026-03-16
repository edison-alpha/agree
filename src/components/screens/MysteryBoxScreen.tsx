import React, { useState, useEffect } from 'react';
import type { GameStoreData, MysteryBoxReward } from '../../store/gameStore';
import { redeemCode } from '../../store/gameStore';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import chestOpen from '../../assets/underwater/Neutral/æhest_open.webp';
import chestAjar from '../../assets/underwater/Neutral/æhest_ajar.webp';
import dimsumImg from '../../assets/dimsum.png';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import pearlImg from '../../assets/underwater/Bonus/Pearl.webp';
import arenaBg from '../../assets/arena_background.webp';

interface MysteryBoxScreenProps {
  storeData: GameStoreData;
  onDataChange: (data: GameStoreData) => void;
  onBack: () => void;
}

type Phase = 'input' | 'opening' | 'revealed';

export const MysteryBoxScreen: React.FC<MysteryBoxScreenProps> = ({
  storeData,
  onDataChange,
  onBack,
}) => {
  const [phase, setPhase] = useState<Phase>('input');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [reward, setReward] = useState<MysteryBoxReward | null>(null);
  const [shakeClass, setShakeClass] = useState('');

  const handleRedeem = () => {
    setError('');
    if (!code.trim()) { setError('Enter a redemption code'); return; }
    if (storeData.tickets < 1) { setError('You need at least 1 ticket!'); return; }

    const redeemResult = redeemCode(storeData, code.trim());
    if (!redeemResult) {
      setError('Invalid or already used code');
      return;
    }

    onDataChange(redeemResult.data);
    setReward(redeemResult.reward);
    setPhase('opening');
  };

  useEffect(() => {
    if (phase === 'opening') {
      const t = setTimeout(() => setPhase('revealed'), 2800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleShake = () => {
    setShakeClass('animate-shake');
    setTimeout(() => setShakeClass(''), 600);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
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
          <img src={chestClosed} alt="" className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">Mystery Box</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,215,0,0.1)' }}
        >
          <span className="text-xs">🎫</span>
          <span className="text-xs font-black text-amber-400">{storeData.tickets}</span>
        </div>
      </div>

      {/* ── Phase: Input ── */}
      {phase === 'input' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {/* Chest Display */}
          <div className="mb-4">
            <button onClick={handleShake} className={`transition ${shakeClass}`}>
              <img src={chestClosed} alt="" className="h-28 w-28" style={{ filter: 'drop-shadow(0 8px 24px rgba(168,85,247,0.4))' }} />
            </button>
          </div>
          <div className="text-[9px] font-bold text-purple-400/60 uppercase tracking-[0.3em] mb-1">Tap the chest!</div>
          <h2 className="text-xl font-black text-white mb-4">Mystery Box</h2>

          {/* Code Input Panel */}
          <div className="w-full rounded-2xl p-4"
            style={{
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,215,0,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <label className="block mb-3">
              <div className="text-[10px] font-bold text-amber-400/60 uppercase tracking-wider mb-1.5">Redemption Code</div>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="ENTER CODE..."
                className="w-full rounded-xl text-white text-sm font-bold text-center p-3 placeholder-purple-500/50 focus:outline-none transition"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.15)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                }}
                maxLength={20}
              />
            </label>

            {error && (
              <div className="rounded-xl px-3 py-2 mb-3 text-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            <button onClick={handleRedeem} disabled={storeData.tickets < 1}
              className="w-full py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
              }}
            >🔓 Open Box (1 Ticket)</button>
          </div>

          {/* Possible Rewards */}
          <div className="w-full mt-3 rounded-xl p-3"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,215,0,0.08)',
            }}
          >
            <div className="text-[9px] font-bold text-purple-400/50 uppercase tracking-wider mb-2">Possible Rewards</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { img: coinImg, label: 'Birthday Card' },
                { img: dimsumImg, label: 'Bonus Dimsum' },
                { img: pearlImg, label: 'Rare Items' },
                { img: chestClosed, label: 'Cosmetics' },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.06)' }}
                >
                  <img src={r.img} alt="" className="w-4 h-4" />
                  <span className="text-[9px] text-purple-300/70">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: Opening ── */}
      {phase === 'opening' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <div className="mb-4 relative">
            <img src={chestAjar} alt="" className="h-32 w-32 animate-pulse"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(255,215,0,0.4))' }}
            />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent 60%)' }}
            />
          </div>
          <div className="text-lg font-black text-amber-400 animate-pulse">Opening…</div>
          <div className="mt-3 flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #fbbf24, #d97706)',
                  animation: `dot-pulse 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Phase: Revealed ── */}
      {phase === 'revealed' && reward && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {/* Reward Card */}
          <div className="w-full max-w-sm rounded-2xl p-6 text-center relative overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.55)',
              border: '2px solid rgba(255,215,0,0.3)',
              boxShadow: '0 8px 40px rgba(255,215,0,0.15), 0 0 60px rgba(168,85,247,0.15)',
            }}
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 -translate-y-1/2 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.5), transparent)' }}
            />

            <div className="relative">
              <div className="text-5xl mb-3">{reward.icon}</div>
              <div className="text-[9px] font-bold text-amber-400/50 uppercase tracking-[0.35em] mb-1">You Got</div>
              <h2 className="text-xl font-black text-white mb-1">{reward.name}</h2>
              <p className="text-xs text-purple-300/70 mb-3">{reward.description}</p>

              {/* Birthday Card Message */}
              {reward.type === 'birthday_card' && reward.message && (
                <div className="rounded-xl p-4 mb-3 text-left"
                  style={{
                    background: 'rgba(219,39,119,0.08)',
                    border: '1px solid rgba(219,39,119,0.2)',
                  }}
                >
                  <div className="text-2xl text-center mb-2">🎂🎉</div>
                  <p className="text-sm text-purple-200 leading-relaxed whitespace-pre-wrap">{reward.message}</p>
                </div>
              )}

              {/* Dimsum Bonus */}
              {reward.type === 'dimsum_bonus' && (
                <div className="inline-flex items-center gap-2 rounded-xl px-5 py-2 mb-2"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(255,215,0,0.25)',
                  }}
                >
                  <img src={dimsumImg} alt="" className="h-6 w-6" />
                  <span className="text-xl font-black text-amber-400">+{reward.value ?? 10}</span>
                </div>
              )}

              {/* Inventory Item */}
              {reward.type === 'inventory_item' && (
                <div className="rounded-xl px-4 py-2 mb-2 inline-block"
                  style={{
                    background: 'rgba(255,215,0,0.05)',
                    border: '1px solid rgba(255,215,0,0.1)',
                  }}
                >
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Added to inventory!</span>
                </div>
              )}
            </div>
          </div>

          {/* Open Chest Below */}
          <div className="mt-3 mb-2">
            <img src={chestOpen} alt="" className="h-14 w-14 mx-auto" style={{ filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.3))' }} />
          </div>

          <p className="text-[10px] text-purple-400/60 mb-3">Tap to continue</p>

          {/* Buttons */}
          <button onClick={() => { setPhase('input'); setCode(''); setReward(null); }}
            className="w-full max-w-xs py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 20px rgba(245,158,11,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
            }}
          >
            {storeData.tickets > 0 ? '🎁 Open Another' : '✓ Done'}
          </button>
          <button onClick={onBack} className="text-xs text-purple-400 py-2 hover:text-purple-300 transition">
            Back to menu
          </button>
        </div>
      )}

      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)}
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
};
