import React from 'react';
import { IMAGE_ASSETS } from '../../constants/assets';

interface WishScreenProps {
  milestone: number;
  wishInput: string;
  onWishChange: (value: string) => void;
  onSubmit: () => void;
}

export const WishScreen: React.FC<WishScreenProps> = ({ milestone, wishInput, onWishChange, onSubmit }) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    style={{
      padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
    }}
  >
    <div
      className="relative w-full max-w-lg rounded-2xl border-4 border-yellow-500 bg-cover bg-center p-5 text-center shadow-2xl sm:p-8"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.wish_card_background})` }}
    >
      <div className="absolute inset-0 rounded-xl bg-black/50" />
      <div className="relative z-10">
        <h2 className="mb-3 text-2xl font-bold text-yellow-400 drop-shadow-lg sm:mb-4 sm:text-4xl">🌟 Make a Wish! 🌟</h2>
        <p className="mb-4 text-base text-white drop-shadow-md sm:mb-6 sm:text-xl">You reached {milestone} points!</p>
        <textarea
          value={wishInput}
          onChange={(e) => onWishChange(e.target.value)}
          placeholder="Type your wish here..."
          className="mb-4 h-20 w-full resize-none rounded-lg border-2 border-yellow-400 bg-white/90 p-3 text-black outline-none sm:mb-6 sm:h-32 sm:p-4"
        />
        <button
          onClick={onSubmit}
          className="w-full transform rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 py-3 text-base font-bold text-black shadow-lg transition hover:scale-105 hover:from-yellow-300 hover:to-orange-400 sm:py-4 sm:text-xl"
        >
          Submit Wish
        </button>
      </div>
    </div>
  </div>
);
