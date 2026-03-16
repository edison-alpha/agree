/**
 * Game Store — localStorage-based persistence for player progress.
 * Tracks dimsum collected, levels completed, stars, tickets, inventory, and leaderboard.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LevelProgress {
  levelId: number;
  dimsumCollected: number;
  dimsumTotal: number;
  stars: number; // 0-3
  completed: boolean;
  bestTime: number; // seconds
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  type: 'consumable' | 'cosmetic' | 'special';
}

export interface MysteryBoxReward {
  id: string;
  type: 'birthday_card' | 'inventory_item' | 'dimsum_bonus' | 'cosmetic';
  name: string;
  description: string;
  icon: string;
  message?: string; // For birthday cards
  value?: number;   // For dimsum_bonus amount
  claimed: boolean;
  claimedAt?: number;
}

export interface LeaderboardEntry {
  playerName: string;
  profilePhoto: string | null;
  totalDimsum: number;
  levelsCompleted: number;
  totalStars: number;
  timestamp: number;
}

export interface PlayerProfile {
  name: string;
  profilePhoto: string | null;
  characterId: string;
  createdAt: number;
}

export interface GameStoreData {
  profile: PlayerProfile | null;
  levels: Record<number, LevelProgress>;
  totalDimsum: number;
  tickets: number;
  ticketsUsed: number;
  inventory: InventoryItem[];
  mysteryBoxRewards: MysteryBoxReward[];
  leaderboard: LeaderboardEntry[];
  redeemedCodes: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    vibration: boolean;
    language: 'id' | 'en' | 'zh';
  };
}

const STORAGE_KEY = 'dimsum_dash_save';
const DIMSUM_PER_TICKET = 6;

// ─── Default data ────────────────────────────────────────────────────────────

function getDefaultData(): GameStoreData {
  return {
    profile: null,
    levels: {},
    totalDimsum: 0,
    tickets: 0,
    ticketsUsed: 0,
    inventory: [],
    mysteryBoxRewards: [],
    leaderboard: [],
    redeemedCodes: [],
    settings: {
      musicVolume: 0.7,
      sfxVolume: 1.0,
      vibration: true,
      language: 'id',
    },
  };
}

// ─── Load / Save ─────────────────────────────────────────────────────────────

export function loadGameData(): GameStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw) as Partial<GameStoreData>;
    return { ...getDefaultData(), ...parsed };
  } catch {
    return getDefaultData();
  }
}

export function saveGameData(data: GameStoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function saveProfile(data: GameStoreData, profile: PlayerProfile): GameStoreData {
  const updated = { ...data, profile };
  saveGameData(updated);
  return updated;
}

// ─── Level Progress ──────────────────────────────────────────────────────────

export function calculateStars(dimsumCollected: number, dimsumTotal: number): number {
  if (dimsumTotal === 0) return 0;
  const ratio = dimsumCollected / dimsumTotal;
  if (ratio >= 1) return 3;
  if (ratio >= 0.66) return 2;
  if (ratio >= 0.33) return 1;
  return 0;
}

export function saveLevelProgress(
  data: GameStoreData,
  levelId: number,
  dimsumCollected: number,
  dimsumTotal: number,
  timeSeconds: number,
): GameStoreData {
  const stars = calculateStars(dimsumCollected, dimsumTotal);
  const existing = data.levels[levelId];

  // Only update if better
  const bestDimsum = existing ? Math.max(existing.dimsumCollected, dimsumCollected) : dimsumCollected;
  const bestStars = existing ? Math.max(existing.stars, stars) : stars;
  const bestTime = existing?.bestTime ? Math.min(existing.bestTime, timeSeconds) : timeSeconds;

  const newTotalDimsum = Object.values({ ...data.levels, [levelId]: { dimsumCollected: bestDimsum } })
    .reduce((sum, lp) => sum + (lp as { dimsumCollected: number }).dimsumCollected, 0);

  // Calculate tickets based on total dimsum
  const totalTicketsEarned = Math.floor(newTotalDimsum / DIMSUM_PER_TICKET);
  const newTickets = totalTicketsEarned - data.ticketsUsed;

  const updated: GameStoreData = {
    ...data,
    levels: {
      ...data.levels,
      [levelId]: {
        levelId,
        dimsumCollected: bestDimsum,
        dimsumTotal,
        stars: bestStars,
        completed: true,
        bestTime,
      },
    },
    totalDimsum: newTotalDimsum,
    tickets: Math.max(0, newTickets),
  };

  saveGameData(updated);
  return updated;
}

// ─── Ticket System ───────────────────────────────────────────────────────────

export function useTicket(data: GameStoreData): GameStoreData | null {
  if (data.tickets <= 0) return null;
  const updated = {
    ...data,
    tickets: data.tickets - 1,
    ticketsUsed: data.ticketsUsed + 1,
  };
  saveGameData(updated);
  return updated;
}

export function getTicketProgress(data: GameStoreData): { current: number; needed: number } {
  const totalEarned = Math.floor(data.totalDimsum / DIMSUM_PER_TICKET) * DIMSUM_PER_TICKET;
  const current = data.totalDimsum - totalEarned;
  return { current: current % DIMSUM_PER_TICKET, needed: DIMSUM_PER_TICKET };
}

// ─── Mystery Box / Code Redemption ───────────────────────────────────────────

export function redeemCode(data: GameStoreData, code: string): { data: GameStoreData; reward: MysteryBoxReward } | null {
  // Check if code already redeemed
  if (data.redeemedCodes.includes(code.toUpperCase())) return null;

  // Require a ticket
  if (data.tickets <= 0) return null;

  // Generate reward based on code
  const reward = generateMysteryReward(code);

  const updated: GameStoreData = {
    ...data,
    tickets: data.tickets - 1,
    ticketsUsed: data.ticketsUsed + 1,
    redeemedCodes: [...data.redeemedCodes, code.toUpperCase()],
    mysteryBoxRewards: [...data.mysteryBoxRewards, reward],
  };

  // Add inventory item if applicable
  if (reward.type === 'inventory_item' || reward.type === 'cosmetic') {
    const existingItem = updated.inventory.find(i => i.id === reward.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      updated.inventory.push({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        icon: reward.icon,
        quantity: 1,
        type: reward.type === 'cosmetic' ? 'cosmetic' : 'consumable',
      });
    }
  }

  if (reward.type === 'dimsum_bonus') {
    updated.totalDimsum += 10;
  }

  saveGameData(updated);
  return { data: updated, reward };
}

function generateMysteryReward(code: string): MysteryBoxReward {
  const upperCode = code.toUpperCase();

  // Special birthday code — you can set your own code here
  if (upperCode.startsWith('BDAY') || upperCode.startsWith('HBD') || upperCode.startsWith('ULTAH')) {
    return {
      id: `bday_${Date.now()}`,
      type: 'birthday_card',
      name: '🎂 Birthday Card',
      description: 'A special birthday greeting card!',
      icon: '🎂',
      message: 'Selamat Ulang Tahun! 🎉🎂\n\nSemoga di hari yang spesial ini, semua harapan dan impianmu terwujud. Kamu adalah orang yang luar biasa dan dunia beruntung memilikimu.\n\nTerus bersinar dan jangan pernah berhenti bermimpi! ✨\n\nWith love and warm wishes! 💝',
      claimed: true,
      claimedAt: Date.now(),
    };
  }

  // Random rewards for other codes
  const rewards: MysteryBoxReward[] = [
    {
      id: `bonus_dimsum_${Date.now()}`,
      type: 'dimsum_bonus',
      name: '🥟 Dimsum Bonus Pack',
      description: '+10 Bonus Dimsum added to your collection!',
      icon: '🥟',
      value: 10,
      claimed: true,
      claimedAt: Date.now(),
    },
    {
      id: `golden_chopstick_${Date.now()}`,
      type: 'inventory_item',
      name: '🥢 Golden Chopstick',
      description: 'A rare golden chopstick. Boosts dimsum collection!',
      icon: '🥢',
      claimed: true,
      claimedAt: Date.now(),
    },
    {
      id: `lucky_cat_${Date.now()}`,
      type: 'cosmetic',
      name: '🐱 Lucky Cat Charm',
      description: 'A maneki-neko charm that brings good fortune!',
      icon: '🐱',
      claimed: true,
      claimedAt: Date.now(),
    },
    {
      id: `dragon_hat_${Date.now()}`,
      type: 'cosmetic',
      name: '🐉 Dragon Hat',
      description: 'A legendary dragon hat for your character!',
      icon: '🐉',
      claimed: true,
      claimedAt: Date.now(),
    },
  ];

  return rewards[Math.floor(Math.random() * rewards.length)];
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export function addToLeaderboard(data: GameStoreData, entry: Omit<LeaderboardEntry, 'timestamp'>): GameStoreData {
  const newEntry: LeaderboardEntry = { ...entry, timestamp: Date.now() };
  const leaderboard = [...data.leaderboard, newEntry]
    .sort((a, b) => b.totalDimsum - a.totalDimsum)
    .slice(0, 50); // Keep top 50

  const updated = { ...data, leaderboard };
  saveGameData(updated);
  return updated;
}

export function getLeaderboard(data: GameStoreData): LeaderboardEntry[] {
  return [...data.leaderboard].sort((a, b) => b.totalDimsum - a.totalDimsum);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function updateSettings(data: GameStoreData, settings: Partial<GameStoreData['settings']>): GameStoreData {
  const updated = {
    ...data,
    settings: { ...data.settings, ...settings },
  };
  saveGameData(updated);
  return updated;
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function resetAllProgress(): GameStoreData {
  const data = getDefaultData();
  saveGameData(data);
  return data;
}

// ─── Computed helpers ────────────────────────────────────────────────────────

export function getTotalStars(data: GameStoreData): number {
  return Object.values(data.levels).reduce((sum, lp) => sum + lp.stars, 0);
}

export function getCompletedLevels(data: GameStoreData): number {
  return Object.values(data.levels).filter(lp => lp.completed).length;
}

export function isLevelUnlocked(data: GameStoreData, levelId: number): boolean {
  if (levelId === 1) return true;
  // Previous level must be completed
  return data.levels[levelId - 1]?.completed ?? false;
}
