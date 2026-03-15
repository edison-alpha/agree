import React from 'react';
import { IMAGE_ASSETS } from '../../constants/assets';

interface WishScreenProps {
  milestone: number;
  wishInput: string;
  onWishChange: (value: string) => void;
  onSubmit: () => void;
}

export const WishScreen: React.FC<WishScreenProps> = ({ milestone, wishInput, onWishChange, onSubmit }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
    <div
      className="p-6 sm:p-8 rounded-2xl border-4 border-yellow-500 shadow-2xl max-w-lg w-full text-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${IMAGE_ASSETS.wish_card_background})` }}
    >
      <div className="absolute inset-0 bg-black/50 rounded-xl" />
      <div className="relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4 drop-shadow-lg">🌟 Make a Wish! 🌟</h2>
        <p className="text-lg sm:text-xl text-white mb-6 drop-shadow-md">You reached {milestone} points!</p>
        <textarea
          value={wishInput}
          onChange={(e) => onWishChange(e.target.value)}
          placeholder="Type your wish here..."
          className="w-full p-4 mb-6 rounded-lg bg-white/90 text-black border-2 border-yellow-400 outline-none resize-none h-24 sm:h-32"
        />
        <button
          onClick={onSubmit}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold text-lg sm:text-xl rounded-lg shadow-lg transform transition hover:scale-105"
        >
          Submit Wish
        </button>
      </div>
    </div>
  </div>
);
