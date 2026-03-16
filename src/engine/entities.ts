import type { Bullet, GameSnapshot, Minion, Particle, Pickup, PickupType, Player, Turret } from '../types/game';
import { GAME_CONFIG } from '../constants/config';

/** Create a fresh player at map centre. */
export function createPlayer(): Player {
  return {
    x: GAME_CONFIG.mapWidth / 2,
    y: GAME_CONFIG.mapHeight / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    radius: 25,
  };
}

/** Fire bullets from the player based on current weapon. */
export function createBullets(player: Player, weapon: string, doubleBullets: boolean): Bullet[] {
  const dmg = GAME_CONFIG.bulletDamage;
  const speed = GAME_CONFIG.bulletSpeed;

  let spreads: number[];
  if (weapon === 'shotgun') {
    const s = GAME_CONFIG.shotgunSpread;
    spreads = Array.from({ length: GAME_CONFIG.shotgunBullets }, (_, i) =>
      -s * 2 + (s * 4 * i) / (GAME_CONFIG.shotgunBullets - 1),
    );
  } else {
    spreads = [-0.08, 0, 0.08];
  }

  const bullets: Bullet[] = spreads.map((spread) => {
    const angle = player.angle + spread;
    return {
      x: player.x + Math.cos(angle) * player.radius,
      y: player.y + Math.sin(angle) * player.radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4,
      damage: dmg,
    };
  });

  // Double bullets power-up: duplicate each bullet with slight offset
  if (doubleBullets) {
    const extra = bullets.map((b) => ({
      ...b,
      x: b.x + Math.cos(player.angle + Math.PI / 2) * 6,
      y: b.y + Math.sin(player.angle + Math.PI / 2) * 6,
    }));
    bullets.push(...extra);
  }

  return bullets;
}

/** Create a turret bullet aimed at a target position. */
export function createTurretBullet(turret: Turret, targetX: number, targetY: number): Bullet {
  const angle = Math.atan2(targetY - turret.y, targetX - turret.x);
  return {
    x: turret.x + Math.cos(angle) * turret.radius,
    y: turret.y + Math.sin(angle) * turret.radius,
    vx: Math.cos(angle) * GAME_CONFIG.turretBulletSpeed,
    vy: Math.sin(angle) * GAME_CONFIG.turretBulletSpeed,
    radius: 5,
    damage: GAME_CONFIG.turretDamage,
    fromTurret: true,
  };
}

/** Spawn a minion from a random direction relative to the player position. */
export function createMinion(playerX: number, playerY: number): Minion {
  const angle = Math.random() * Math.PI * 2;
  const dist = 400 + Math.random() * 200; // spawn 400-600px away from player
  let mx = playerX + Math.cos(angle) * dist;
  let my = playerY + Math.sin(angle) * dist;

  // Clamp to map bounds
  mx = Math.max(30, Math.min(GAME_CONFIG.mapWidth - 30, mx));
  my = Math.max(30, Math.min(GAME_CONFIG.mapHeight - 30, my));

  const isElite = Math.random() < GAME_CONFIG.eliteGoblinChance;

  return {
    x: mx,
    y: my,
    radius: isElite ? 34 : 20,
    health: isElite ? GAME_CONFIG.eliteGoblinHealth : GAME_CONFIG.minionHealth,
    maxHealth: isElite ? GAME_CONFIG.eliteGoblinHealth : GAME_CONFIG.minionHealth,
    angle: 0,
    speed: isElite ? GAME_CONFIG.eliteGoblinSpeed : GAME_CONFIG.minionSpeed,
    damage: isElite ? GAME_CONFIG.eliteGoblinDamage : GAME_CONFIG.collisionDamage,
    scoreValue: isElite ? GAME_CONFIG.pointsPerEliteGoblin : GAME_CONFIG.pointsPerMinion,
    type: isElite ? 'elite' : 'normal',
  };
}

/** Generate turrets spread across the map. */
export function createTurrets(): Turret[] {
  const turrets: Turret[] = [];
  const margin = 200;
  const safeZone = 400; // don't spawn near center where player starts
  const cx = GAME_CONFIG.mapWidth / 2;
  const cy = GAME_CONFIG.mapHeight / 2;

  for (let i = 0; i < GAME_CONFIG.turretCount; i++) {
    let x: number, y: number;
    do {
      x = margin + Math.random() * (GAME_CONFIG.mapWidth - margin * 2);
      y = margin + Math.random() * (GAME_CONFIG.mapHeight - margin * 2);
    } while (Math.hypot(x - cx, y - cy) < safeZone);

    turrets.push({
      x,
      y,
      radius: GAME_CONFIG.turretRadius,
      health: GAME_CONFIG.turretHealth,
      maxHealth: GAME_CONFIG.turretHealth,
      lastShot: 0,
      range: GAME_CONFIG.turretRange,
      fireRate: GAME_CONFIG.turretFireRate,
      damage: GAME_CONFIG.turretDamage,
      scoreValue: GAME_CONFIG.turretScore,
    });
  }
  return turrets;
}

/** Create a pickup at a given position. */
export function createPickup(x: number, y: number, type?: PickupType): Pickup {
  const types: PickupType[] = ['heart', 'weapon_shotgun', 'weapon_rapid', 'powerup_double'];
  return {
    x,
    y,
    radius: 16,
    type: type ?? types[Math.floor(Math.random() * types.length)],
    life: GAME_CONFIG.pickupLifetime,
  };
}

/** Spawn a random pickup near the player. */
export function createRandomPickup(playerX: number, playerY: number): Pickup {
  const angle = Math.random() * Math.PI * 2;
  const dist = 150 + Math.random() * 250;
  const x = Math.max(50, Math.min(GAME_CONFIG.mapWidth - 50, playerX + Math.cos(angle) * dist));
  const y = Math.max(50, Math.min(GAME_CONFIG.mapHeight - 50, playerY + Math.sin(angle) * dist));
  return createPickup(x, y);
}

/** Create death-burst particles at a position. */
export function createDeathParticles(x: number, y: number, count = 8, color?: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 100 + 50;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
    });
  }
  return particles;
}

/** Create a blank game snapshot for initialisation / restart. */
export function createInitialGameSnapshot(): GameSnapshot {
  return {
    score: 0,
    health: GAME_CONFIG.playerMaxHealth,
    lives: GAME_CONFIG.playerLives,
    player: createPlayer(),
    bullets: [],
    minions: [],
    particles: [],
    turrets: createTurrets(),
    pickups: [],
    powerUps: [],
    weapon: 'default',
    camera: { x: 0, y: 0 },
    keys: {},
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false },
    joysticks: {
      left: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
      right: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
    },
    lastShot: 0,
    lastSpawn: 0,
    lastDamage: 0,
    lastPickupSpawn: 0,
    images: {},
    audio: {},
    milestoneIndex: 0,
    state: 'intro',
  };
}

/** Mutate-reset a snapshot in place (keeps object identity for the game loop closure). */
export function resetGameSnapshot(g: GameSnapshot): void {
  g.score = 0;
  g.health = GAME_CONFIG.playerMaxHealth;
  g.lives = GAME_CONFIG.playerLives;
  g.player = createPlayer();
  g.bullets.length = 0;
  g.minions.length = 0;
  g.particles.length = 0;
  g.turrets = createTurrets();
  g.pickups.length = 0;
  g.powerUps.length = 0;
  g.weapon = 'default';
  g.camera = { x: 0, y: 0 };
  g.keys = {};
  g.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };
  g.joysticks = {
    left: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
    right: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
  };
  g.lastShot = 0;
  g.lastSpawn = 0;
  g.lastDamage = 0;
  g.lastPickupSpawn = 0;
  g.milestoneIndex = 0;
  g.state = 'nameEntry';
}
