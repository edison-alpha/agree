import React from 'react';
import { IMAGE_ASSETS } from '../../constants/assets';
import { GAME_CONFIG } from '../../constants/config';

interface BirthdayScreenProps {
  playerName: string;
  wishes: string[];
  onRestart: () => void;
}

export const BirthdayScreen: React.FC<BirthdayScreenProps> = ({ playerName, wishes, onRestart }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50 p-4">
    <div
      className="p-6 sm:p-10 rounded-3xl border-8 border-pink-500 shadow-2xl max-w-2xl w-full text-center relative bg-cover bg-center max-h-[90vh] overflow-y-auto"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.birthday_card})` }}
    >
      <div className="absolute inset-0 bg-black/40 rounded-2xl" />
      <div className="relative z-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-400 mb-6 drop-shadow-lg animate-pulse">
          🎉 HAPPY BIRTHDAY! 🎉
        </h1>
        <p className="text-xl sm:text-2xl text-white mb-8 drop-shadow-md font-medium">
          Congratulations {playerName}! You reached the final goal of {GAME_CONFIG.finalGoal} points!
        </p>

        {wishes.length > 0 && (
          <div className="mb-8 text-left bg-black/50 p-4 sm:p-6 rounded-xl border border-pink-500/50">
            <h3 className="text-xl font-bold text-pink-300 mb-4">Your Wishes:</h3>
            <ul className="space-y-2">
              {wishes.map((w, i) => (
                <li key={i} className="text-white flex items-start text-sm sm:text-base">
                  <span className="mr-2">✨</span> {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onRestart}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold text-xl sm:text-2xl rounded-full shadow-xl transform transition hover:scale-105"
        >
          Play Again
        </button>
      </div>
    </div>
  </div>
);
