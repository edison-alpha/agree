import React, { useState, useEffect } from 'react';
import type { GameStoreData, MysteryBoxReward } from '../../store/gameStore';
import { redeemCode } from '../../store/gameStore';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import dimsumImg from '../../assets/dimsum.png';
import bubbleImg from '../../assets/underwater/Neutral/Bubble_2.webp';

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

    // redeemCode handles ticket decrement internally
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
      const t = setTimeout(() => setPhase('revealed'), 2400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleShake = () => {
    setShakeClass('animate-shake');
    setTimeout(() => setShakeClass(''), 600);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#111]/95 backdrop-blur-sm"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}
    >
      {/* Floating bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <img key={i} src={bubbleImg} alt="" className="absolute opacity-[0.04]"
            style={{
              width: `${14 + i * 4}px`,
              left: `${8 + i * 18}%`,
              bottom: `-12px`,
              animation: `float-up ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-4 sm:mx-auto sm:max-w-2xl sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0 pt-1">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition active:scale-90">
            <span className="text-base">←</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400">🎁 Mystery Box</div>
          <div className="w-9" />
        </div>

        {/* ── Phase: Input ── */}
        {phase === 'input' && (
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="text-center">
              <button onClick={handleShake} className={`transition ${shakeClass}`}>
                <img src={chestClosed} alt="" className="mx-auto h-24 w-24 mb-2 drop-shadow-lg" />
              </button>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-0.5">Tap the chest!</div>
              <h2 className="text-lg font-black text-white">Mystery Box</h2>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-[#171717]/95 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Your Tickets</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">🎫</span>
                  <span className="text-base font-black text-yellow-400">{storeData.tickets}</span>
                </div>
              </div>

              <label className="block mb-3">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1.5">Redemption Code</div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="ENTER CODE..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold text-center p-2.5 placeholder-zinc-600 focus:outline-none focus:border-yellow-400/30 transition"
                  maxLength={20}
                />
              </label>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3 text-center">
                  <span className="text-xs text-red-400">{error}</span>
                </div>
              )}

              <button
                onClick={handleRedeem}
                disabled={storeData.tickets < 1}
                className="w-full rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400 active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none"
                style={{ boxShadow: '0 6px 20px rgba(234,179,8,0.25)' }}
              >
                🔓 Open Box (1 Ticket)
              </button>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-[#171717]/95 p-3 shadow-lg">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Possible Rewards</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { icon: '🎂', label: 'Birthday Card' },
                  { icon: '🥟', label: 'Bonus Dimsum' },
                  { icon: '✨', label: 'Rare Items' },
                  { icon: '🎨', label: 'Cosmetics' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/5 px-2 py-1.5">
                    <span className="text-sm">{r.icon}</span>
                    <span className="text-[10px] text-zinc-400">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Phase: Opening ── */}
        {phase === 'opening' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-bounce-slow mb-4">
              <img src={chestClosed} alt="" className="h-28 w-28 drop-shadow-lg animate-pulse" />
            </div>
            <div className="text-lg font-black text-yellow-400 animate-pulse">Opening…</div>
            <div className="mt-3 flex items-center gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" style={{ animation: `dot-pulse 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Phase: Revealed ── */}
        {phase === 'revealed' && reward && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-2">
            <div className="text-4xl mb-1 animate-bounce-slow">{reward.icon}</div>
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400/70 mb-1">You Got</div>
              <h2 className="text-xl font-black text-white mb-0.5">{reward.name}</h2>
              <p className="text-xs text-zinc-400">{reward.description}</p>
            </div>

            {reward.type === 'birthday_card' && reward.message && (
              <div className="w-full rounded-[22px] border border-pink-500/20 bg-gradient-to-b from-pink-500/10 to-transparent p-5 text-center shadow-xl">
                <div className="text-3xl mb-2">🎂🎉</div>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{reward.message}</p>
              </div>
            )}

            {reward.type === 'dimsum_bonus' && (
              <div className="flex items-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-2.5">
                <img src={dimsumImg} alt="" className="h-6 w-6" />
                <span className="text-lg font-black text-yellow-400">+{reward.value}</span>
              </div>
            )}

            {reward.type === 'inventory_item' && (
              <div className="rounded-2xl border border-white/10 bg-[#171717]/95 px-6 py-3 text-center shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Added to inventory!</span>
              </div>
            )}

            <button
              onClick={() => { setPhase('input'); setCode(''); setReward(null); }}
              className="w-full max-w-xs rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400 active:scale-[0.97]"
              style={{ boxShadow: '0 6px 20px rgba(234,179,8,0.25)' }}
            >
              {storeData.tickets > 0 ? '🎁 Open Another' : '✓ Done'}
            </button>
            <button onClick={onBack} className="text-xs text-zinc-500 py-1 hover:text-zinc-300 transition">Back to menu</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.04; }
          50% { transform: translateY(-${window.innerHeight}px) scale(0.5); opacity: 0; }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-slow { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-3px)} 20%,40%,60%,80%{transform:translateX(3px)}
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
      `}</style>
    </div>
  );
};
