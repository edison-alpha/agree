import React from 'react';
import type { CharacterId, CharacterOption } from '../../types/game';
import { CHARACTER_OPTIONS } from '../../constants/characters';

interface CharacterSelectScreenProps {
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  onContinue: () => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  selectedId,
  onSelect,
  onContinue,
}) => (
  <div className="absolute inset-0 z-[61] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
    <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#171717]/95 p-5 shadow-2xl sm:p-6">
      <div className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-yellow-400">Pilih Karakter</div>
      <h2 className="mb-2 text-2xl font-black text-white sm:text-3xl">Pilih karakter lucu kamu</h2>
      <p className="mb-5 text-sm leading-6 text-zinc-400">
        Setelah foto, sekarang pilih partner tempur favoritmu sebelum masuk tutorial.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CHARACTER_OPTIONS.map((character: CharacterOption) => {
          const isActive = character.id === selectedId;
          return (
            <button
              key={character.id}
              onClick={() => onSelect(character.id)}
              className={`rounded-[28px] border p-4 text-left transition ${
                isActive
                  ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="mb-3 overflow-hidden rounded-[24px] bg-zinc-900">
                <img src={character.image} alt={character.name} className="h-64 w-full object-contain" />
              </div>
              <div className="text-lg font-black text-white">{character.name}</div>
              <div className="mt-1 text-sm text-zinc-400">{character.description}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="mt-5 w-full rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400"
      >
        Lanjut ke Tutorial
      </button>
    </div>
  </div>
);
