import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    style={{
      padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
    }}
  >
    <div className="w-full max-w-md rounded-2xl border-4 border-red-500 bg-zinc-800 p-6 text-center shadow-2xl sm:p-8">
      <h1 className="mb-4 text-4xl font-bold text-red-500 drop-shadow-lg sm:text-5xl">GAME OVER</h1>
      <p className="mb-2 text-lg text-zinc-300 sm:text-xl">The goblins overwhelmed you!</p>
      <p className="mb-6 text-2xl font-bold text-yellow-400 sm:mb-8 sm:text-3xl">Final Score: {score}</p>
      <button
        onClick={onRestart}
        className="w-full transform rounded-lg bg-red-600 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-red-500 sm:py-4 sm:text-xl"
      >
        Try Again
      </button>
    </div>
  </div>
);
