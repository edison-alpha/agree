import React from 'react';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { HealthBar } from '../ui/HealthBar';

interface GameHUDProps {
  score: number;
  health: number;
  playerName: string;
  profilePhoto: string | null;
  characterImage: string;
  characterName: string;
}

/** Top-of-screen heads-up display shown during gameplay. */
export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  health,
  playerName,
  profilePhoto,
  characterImage,
  characterName,
}) => (
  <div className="absolute top-0 left-0 w-full p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none gap-2">
    <div className="flex flex-col gap-1">
      <div className="text-2xl font-bold text-yellow-400 drop-shadow-md">SCORE: {score}</div>
      <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-zinc-700/50">
        <ProfileAvatar
          photo={profilePhoto}
          fallbackSrc={characterImage}
          fallbackAlt={characterName}
          name={playerName}
        />
        <HealthBar health={health} />
      </div>
    </div>
    <div className="text-lg font-medium text-zinc-300 drop-shadow-md">{playerName}</div>
  </div>
);
