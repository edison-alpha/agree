import React from 'react';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { HealthBar } from '../ui/HealthBar';
import type { ActivePowerUp } from '../../types/game';

interface GameHUDProps {
  score: number;
  health: number;
  lives: number;
  weapon: string;
  powerUps: ActivePowerUp[];
  playerName: string;
  profilePhoto: string | null;
  characterImage: string;
  characterName: string;
}

const WEAPON_LABELS: Record<string, { label: string; color: string }> = {
  default: { label: '🔫 Default', color: 'text-zinc-300' },
  shotgun: { label: '💥 Shotgun', color: 'text-orange-400' },
  rapid: { label: '⚡ Rapid Fire', color: 'text-blue-400' },
};

/** Top-of-screen heads-up display shown during gameplay. */
export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  health,
  lives,
  weapon,
  powerUps,
  playerName,
  profilePhoto,
  characterImage,
  characterName,
}) => (
  <div
    className="pointer-events-none absolute left-0 top-0 flex w-full flex-col gap-2 bg-gradient-to-b from-black/80 to-transparent p-4"
    style={{
      paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
      paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
      paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
    }}
  >
    {/* Top row: score + lives */}
    <div className="flex items-center justify-between">
      <div className="text-xl font-bold text-yellow-400 drop-shadow-md sm:text-2xl">
        SCORE: {score}
      </div>
      {/* Lives as hearts */}
      <div className="flex items-center gap-1">
        {Array.from({ length: lives }).map((_, i) => (
          <span key={i} className="text-lg sm:text-xl" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
            ❤️
          </span>
        ))}
        {lives <= 0 && <span className="text-sm text-red-400">No lives!</span>}
      </div>
    </div>

    {/* Player info + health bar */}
    <div className="flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-black/50 p-2">
      <ProfileAvatar
        photo={profilePhoto}
        fallbackSrc={characterImage}
        fallbackAlt={characterName}
        name={playerName}
      />
      <div className="flex flex-1 flex-col gap-1">
        <HealthBar health={health} />
        {/* Weapon indicator */}
        <div className={`text-xs font-semibold ${WEAPON_LABELS[weapon]?.color ?? 'text-zinc-300'}`}>
          {WEAPON_LABELS[weapon]?.label ?? weapon}
        </div>
      </div>
    </div>

    {/* Active power-ups */}
    {powerUps.length > 0 && (
      <div className="flex flex-col gap-1">
        {powerUps.map((pu, i) => (
          <div key={i} className="flex items-center gap-2 rounded bg-purple-900/60 px-2 py-1 text-xs text-purple-200">
            <span>✨ Double Bullets</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded bg-purple-950">
              <div
                className="absolute left-0 top-0 h-full rounded bg-purple-400 transition-all"
                style={{ width: `${Math.max(0, (pu.remaining / 10) * 100)}%` }}
              />
            </div>
            <span className="font-mono">{Math.ceil(pu.remaining)}s</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
