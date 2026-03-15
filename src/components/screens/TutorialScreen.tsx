import React from 'react';

interface TutorialScreenProps {
  onContinue: () => void;
}

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onContinue }) => (
  <div
    className="absolute inset-0 z-[65] flex items-center justify-center bg-black/85 backdrop-blur-sm"
    style={{
      padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
    }}
  >
    <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#171717]/95 p-5 text-white shadow-2xl sm:p-7">
      <div className="mb-2 shrink-0 text-xs font-black uppercase tracking-[0.35em] text-yellow-400">Tutorial</div>
      <h2 className="mb-4 shrink-0 text-xl font-black sm:mb-5 sm:text-2xl">Tutorial main di HP</h2>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto text-sm leading-6 text-zinc-300 sm:space-y-4 sm:text-base">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Gerak</div>
          <p>Sentuh dan tahan sisi kiri layar untuk menggerakkan karaktermu ke segala arah.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Serang</div>
          <p>Sentuh sisi kanan layar untuk membidik dan menembak goblin yang mendekat.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="mb-1 font-black uppercase tracking-[0.2em] text-white">Target</div>
          <p>Jaga HP tetap aman, kumpulkan score, isi wish setiap milestone tercapai, dan kejar 1703 point untuk mendapatkan mystery box.</p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-4 w-full shrink-0 rounded-2xl bg-yellow-500 py-3 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-yellow-400 sm:mt-6"
      >
        Lanjut ke Percakapan
      </button>
    </div>
  </div>
);
