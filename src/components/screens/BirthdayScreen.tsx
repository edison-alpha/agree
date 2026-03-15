import React from 'react';
import { IMAGE_ASSETS } from '../../constants/assets';
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
    <div
      className="relative max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border-8 border-pink-500 bg-cover bg-center p-5 text-center shadow-2xl sm:p-10"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.birthday_card})` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-black/40" />
      <div className="relative z-10">
        <h1 className="mb-4 text-3xl font-extrabold text-transparent drop-shadow-lg animate-pulse bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-400 bg-clip-text sm:mb-6 sm:text-6xl">
          🎉 HAPPY BIRTHDAY! 🎉
        </h1>
        <p className="mb-6 text-lg font-medium text-white drop-shadow-md sm:mb-8 sm:text-2xl">
          Congratulations {playerName}! You reached the final goal of {GAME_CONFIG.finalGoal} points!
        </p>

        {wishes.length > 0 && (
          <div className="mb-6 rounded-xl border border-pink-500/50 bg-black/50 p-4 text-left sm:mb-8 sm:p-6">
            <h3 className="mb-3 text-lg font-bold text-pink-300 sm:mb-4 sm:text-xl">Your Wishes:</h3>
            <ul className="space-y-2">
              {wishes.map((w, i) => (
                <li key={i} className="flex items-start text-sm text-white sm:text-base">
                  <span className="mr-2">✨</span> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onRestart}
          className="transform rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:from-pink-400 hover:to-purple-400 sm:px-8 sm:py-4 sm:text-2xl"
        >
          Play Again
        </button>
      </div>
    </div>
  </div>
);
