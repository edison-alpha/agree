/**
 * Core game-play tunables.
 * Keep every magic number here so balancing is a one-file change.
 */
export const GAME_CONFIG = {
  // ── Map ─────────────────────────────────────────────────────────────
  mapWidth: 3000,
  mapHeight: 3000,

  // ── Player ──────────────────────────────────────────────────────────
  trooperSpeed: 150,
  fireRate: 5,
  bulletSpeed: 450,
  bulletDamage: 1,
  playerMaxHealth: 100,
  playerLives: 3,

  // ── Weapons ─────────────────────────────────────────────────────────
  shotgunSpread: 0.15,
  shotgunBullets: 5,
  shotgunFireRate: 2.5,
  rapidFireRate: 12,
  weaponDuration: 15, // seconds a picked-up weapon lasts

  // ── Power-ups ───────────────────────────────────────────────────────
  doubleBulletDuration: 12, // seconds
  pickupSpawnRate: 8, // seconds between pickup spawns
  pickupLifetime: 15, // seconds before pickup despawns
  heartHealAmount: 30,

  // ── Minion (normal) ─────────────────────────────────────────────────
  minionSpeed: 45,
  minionHealth: 1,

  // ── Elite Goblin ────────────────────────────────────────────────────
  eliteGoblinSpeed: 30,
  eliteGoblinHealth: 8,
  eliteGoblinDamage: 18,
  eliteGoblinChance: 0.18,

  // ── Turrets ─────────────────────────────────────────────────────────
  turretCount: 6,
  turretHealth: 12,
  turretRange: 280,
  turretFireRate: 1.5, // shots per second
  turretDamage: 8,
  turretRadius: 28,
  turretScore: 60,
  turretBulletSpeed: 300,

  // ── Spawning ────────────────────────────────────────────────────────
  spawnRate: 1.8,       // seconds between spawns
  maxMinionsOnScreen: 20,

  // ── Scoring ─────────────────────────────────────────────────────────
  pointsPerMinion: 10,
  pointsPerEliteGoblin: 45,

  // ── Collision ───────────────────────────────────────────────────────
  collisionDamage: 10,

  // ── Milestones & final goal ─────────────────────────────────────────
  wishMilestones: [100, 300, 600, 1000, 1500] as readonly number[],
  finalGoal: 1703,
} as const;

export type GameConfig = typeof GAME_CONFIG;
