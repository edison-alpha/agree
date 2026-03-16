import React from 'react';
import { GAME_CONFIG } from '../../constants/config';

interface BirthdayScreenProps {
  playerName: string;
  wishes: string[];
  onRestart: () => void;
}

export const BirthdayScreen: React.FC<BirthdayScreenProps> = ({ playerName, wishes, onRestart }) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    style={{
      padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
    }}
  >
    <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-pink-500/30 bg-[#171717]/95 p-5 text-center shadow-2xl sm:p-8">
      {/* Header */}
      <div className="shrink-0">
        <div className="mb-3 text-5xl sm:text-6xl" style={{ filter: 'drop-shadow(0 0 24px rgba(236,72,153,0.5))' }}>
          🎂
        </div>
        <h1 className="mb-1 text-3xl font-black uppercase tracking-[0.12em] text-pink-400 sm:text-5xl">
          Happy Birthday!
        </h1>
        <p className="mb-4 text-sm text-zinc-400 sm:mb-6 sm:text-base">
          Selamat <span className="font-bold text-pink-400">{playerName}</span>! Kamu mencapai{' '}
          <span className="font-bold text-yellow-400">{GAME_CONFIG.finalGoal}</span> poin! 🎉
        </p>
      </div>

      {/* Wishes */}
      {wishes.length > 0 && (
        <div className="mb-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4 text-left sm:mb-6 sm:p-5">
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-pink-400/70">
            Wishes kamu
          </div>
          <ul className="space-y-2">
            {wishes.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-200 sm:text-base">
                <span className="mt-0.5 text-yellow-400">✨</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="mt-auto w-full shrink-0 rounded-2xl bg-pink-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-pink-400 active:scale-[0.98] sm:py-4 sm:text-base"
      >
        Main Lagi 🎮
      </button>
    </div>
  </div>
);
