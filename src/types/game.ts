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

// ─── Game Snapshot (mutable ref for the game loop) ──────────────────────────
export interface GameSnapshot {
  score: number;
  health: number;
  player: Player;
  bullets: Bullet[];
  minions: Minion[];
  particles: Particle[];
  keys: Record<string, boolean>;
  mouse: MouseState;
  joysticks: {
    left: JoystickState;
    right: JoystickState;
  };
  lastShot: number;
  lastSpawn: number;
  lastDamage: number;
  images: Record<string, HTMLImageElement>;
  audio: Record<string, HTMLAudioElement>;
  milestoneIndex: number;
  state: GameState;
}
