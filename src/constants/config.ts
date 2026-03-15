/**
 * Core game-play tunables.
 * Keep every magic number here so balancing is a one-file change.
 */
export const GAME_CONFIG = {
  // Player
  trooperSpeed: 120,
  fireRate: 4.5,
  bulletSpeed: 400,
  playerMaxHealth: 100,

  // Minion (normal)
  minionSpeed: 40,
  minionHealth: 1,

  // Elite Goblin
  eliteGoblinSpeed: 28,
  eliteGoblinHealth: 8,
  eliteGoblinDamage: 18,
  eliteGoblinChance: 0.18,

  // Spawning
  spawnRate: 2,          // seconds between spawns
  maxMinionsOnScreen: 15,

  // Scoring
  pointsPerMinion: 10,
  pointsPerEliteGoblin: 45,

  // Collision
  collisionDamage: 10,

  // Milestones & final goal
  wishMilestones: [100, 300, 600, 1000, 1500] as readonly number[],
  finalGoal: 1703,
} as const;

export type GameConfig = typeof GAME_CONFIG;
