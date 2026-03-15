import type { Bullet, GameSnapshot, Minion, Particle, Player } from '../types/game';
import { GAME_CONFIG } from '../constants/config';

/** Create a fresh player at screen centre. */
export function createPlayer(): Player {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    radius: 25,
  };
}

/** Fire a three-spread bullet burst from the player's position. */
export function createBullets(player: Player): Bullet[] {
  return [-0.08, 0, 0.08].map((spread) => {
    const angle = player.angle + spread;
    return {
      x: player.x + Math.cos(angle) * player.radius,
      y: player.y + Math.sin(angle) * player.radius,
      vx: Math.cos(angle) * GAME_CONFIG.bulletSpeed,
      vy: Math.sin(angle) * GAME_CONFIG.bulletSpeed,
      radius: 4,
    };
  });
}

/** Spawn a minion (normal or elite) from a random screen edge. */
export function createMinion(viewportWidth: number, viewportHeight: number): Minion {
  const side = Math.floor(Math.random() * 4);
  let mx = 0;
  let my = 0;

  if (side === 0) { mx = Math.random() * viewportWidth; my = -30; }
  else if (side === 1) { mx = viewportWidth + 30; my = Math.random() * viewportHeight; }
  else if (side === 2) { mx = Math.random() * viewportWidth; my = viewportHeight + 30; }
  else { mx = -30; my = Math.random() * viewportHeight; }

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

/** Create death-burst particles at a position. */
export function createDeathParticles(x: number, y: number, count = 8): Particle[] {
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
    });
  }
  return particles;
}

/** Create a blank game snapshot for initialisation / restart. */
export function createInitialGameSnapshot(): GameSnapshot {
  return {
    score: 0,
    health: GAME_CONFIG.playerMaxHealth,
    player: createPlayer(),
    bullets: [],
    minions: [],
    particles: [],
    keys: {},
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false },
    joysticks: {
      left: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
      right: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
    },
    lastShot: 0,
    lastSpawn: 0,
    lastDamage: 0,
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
  g.player = createPlayer();
  g.bullets.length = 0;
  g.minions.length = 0;
  g.particles.length = 0;
  g.keys = {};
  g.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };
  g.joysticks = {
    left: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
    right: { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 },
  };
  g.lastShot = 0;
  g.lastSpawn = 0;
  g.lastDamage = 0;
  g.milestoneIndex = 0;
  g.state = 'nameEntry';
}
