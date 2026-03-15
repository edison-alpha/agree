import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50 p-4">
    <div className="bg-zinc-800 p-8 rounded-2xl border-4 border-red-500 shadow-2xl max-w-md w-full text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-lg">GAME OVER</h1>
      <p className="text-xl text-zinc-300 mb-2">The goblins overwhelmed you!</p>
      <p className="text-3xl font-bold text-yellow-400 mb-8">Final Score: {score}</p>
      <button
        onClick={onRestart}
        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded-lg shadow-lg transform transition hover:scale-105"
      >
        Try Again
      </button>
    </div>
  </div>
);
