import React from 'react';

interface TutorialScreenProps {
  onContinue: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onContinue }) => (
  <div className="absolute inset-0 z-[65] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#171717]/95 p-6 text-white shadow-2xl sm:p-7">
      <div className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-yellow-400">Tutorial</div>
      <h2 className="mb-5 text-2xl font-black sm:text-3xl">Tutorial main di HP</h2>

      <div className="space-y-4 text-sm leading-6 text-zinc-300 sm:text-base">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Gerak</div>
          <p>Sentuh dan tahan sisi kiri layar untuk menggerakkan karaktermu ke segala arah.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Serang</div>
          <p>Sentuh sisi kanan layar untuk membidik dan menembak goblin yang mendekat.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Target</div>
          <p>Jaga HP tetap aman, kumpulkan score, isi wish setiap milestone tercapai, dan kejar 1703 point untuk mendapatkan mystery box.</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400"
      >
        Lanjut ke Percakapan
      </button>
    </div>
  </div>
);
