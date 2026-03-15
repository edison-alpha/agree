import type { DialogueMessage } from '../types/game';

/**
 * Build the opening dialogue sequence.
 * The player name is interpolated at call-time so the conversation
 * feels personalised.
 */
export const buildOpeningDialogues = (playerName: string): DialogueMessage[] => [
  {
    speaker: 'Goblin Bay',
    side: 'left',
    text: `Hoi ${playerName || 'petualang'}! Akhirnya kamu datang juga ke markas Goblin Bay.`,
  },
  {
    speaker: 'Player',
    side: 'right',
    text: `Aku ${playerName || 'petualang'}. Aku sudah siap, Goblin!`,
  },
  {
    speaker: 'Goblin Bay',
    side: 'left',
    text: 'Bagus. Foto yang barusan kamu ambil akan kupakai sebagai profil petarungmu di game ini.',
  },
  {
    speaker: 'Player',
    side: 'right',
    text: 'Mantap, berarti karakterku bakal tampil lebih keren.',
  },
  {
    speaker: 'Goblin Bay',
    side: 'left',
    text: 'Setelah ini goblin akan berdatangan. Setiap point milestone tercapai, kamu akan diminta memasukkan wish. Kalau score-mu tembus 1703, ada mystery box spesial menunggumu.',
  },
  {
    speaker: 'Player',
    side: 'right',
    text: 'Siap. Tunjukkan dulu tutorial main di HP, lalu aku lanjut ngobrol sebentar sebelum mulai bertarung!',
  },
];

/**
 * Build the milestone-reached dialogue.
 */
export const buildMilestoneDialogues = (
  playerName: string,
  milestone: number,
): DialogueMessage[] => [
  {
    speaker: 'Goblin Bay',
    side: 'left',
    text: `Hebat, ${playerName || 'petualang'}! Score kamu sudah mencapai ${milestone} point.`,
  },
  {
    speaker: 'Player',
    side: 'right',
    text: 'Siap, aku lanjut. Sekarang aku mau isi wish dulu sebelum bertarung lagi.',
  },
];
