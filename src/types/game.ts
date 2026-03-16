// ─── Game State Machine ─────────────────────────────────────────────────────
export type GameState =
  | 'intro'
  | 'nameEntry'
  | 'photoCapture'
  | 'characterSelect'
  | 'dialogue'
  | 'tutorial'
  | 'milestoneDialogue'
  | 'playing'
  | 'wish'
  | 'gameover'
  | 'birthday';

// ─── Dialogue ───────────────────────────────────────────────────────────────
export type DialogueSpeaker = 'Goblin Bay' | 'Player';

export interface DialogueMessage {
  speaker: DialogueSpeaker;
  side: 'left' | 'right';
  text: string;
}

// ─── Character Selection ────────────────────────────────────────────────────
export type CharacterId = 'agree' | 'agreedaster';

export interface CharacterOption {
  id: CharacterId;
  name: string;
  image: string;
  description: string;
}

// ─── Game Entities ──────────────────────────────────────────────────────────
export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromTurret?: boolean; // true if fired by a turret
}

export type MinionType = 'normal' | 'elite';

export interface Minion {
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  angle: number;
  speed: number;
  damage: number;
  scoreValue: number;
  type: MinionType;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color?: string;
}

// ─── Turrets (destructible structures) ──────────────────────────────────────
export interface Turret {
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  lastShot: number;
  range: number;
  fireRate: number;
  damage: number;
  scoreValue: number;
}

// ─── Pickups ────────────────────────────────────────────────────────────────
export type PickupType = 'heart' | 'weapon_shotgun' | 'weapon_rapid' | 'powerup_double';

export interface Pickup {
  x: number;
  y: number;
  radius: number;
  type: PickupType;
  life: number; // despawn timer (seconds remaining)
}

// ─── Weapons ────────────────────────────────────────────────────────────────
export type WeaponType = 'default' | 'shotgun' | 'rapid';

// ─── Active Power-ups ───────────────────────────────────────────────────────
export interface ActivePowerUp {
  type: 'double_bullets';
  remaining: number; // seconds left
}

// ─── Input State ────────────────────────────────────────────────────────────
export interface JoystickState {
  active: boolean;
  id: number | null;
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
}

export interface MouseState {
  x: number;
  y: number;
  down: boolean;
}

// ─── Camera ─────────────────────────────────────────────────────────────────
export interface Camera {
  x: number;
  y: number;
}

// ─── Game Snapshot (mutable ref for the game loop) ──────────────────────────
export interface GameSnapshot {
  score: number;
  health: number;
  lives: number;
  player: Player;
  bullets: Bullet[];
  minions: Minion[];
  particles: Particle[];
  turrets: Turret[];
  pickups: Pickup[];
  powerUps: ActivePowerUp[];
  weapon: WeaponType;
  camera: Camera;
  keys: Record<string, boolean>;
  mouse: MouseState;
  joysticks: {
    left: JoystickState;
    right: JoystickState;
  };
  lastShot: number;
  lastSpawn: number;
  lastDamage: number;
  lastPickupSpawn: number;
  images: Record<string, HTMLImageElement>;
  audio: Record<string, HTMLAudioElement>;
  milestoneIndex: number;
  state: GameState;
}
