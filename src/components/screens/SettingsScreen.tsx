import React, { useState } from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { updateSettings, resetAllProgress } from '../../store/gameStore';

interface SettingsScreenProps {
  storeData: GameStoreData;
  onDataChange: (data: GameStoreData) => void;
  onBack: () => void;
  onResetComplete: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  storeData,
  onDataChange,
  onBack,
  onResetComplete,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const settings = storeData.settings;

  const handleToggle = (key: 'vibration') => {
    onDataChange(updateSettings(storeData, { [key]: !settings[key] }));
  };

  const handleVolume = (key: 'musicVolume' | 'sfxVolume', val: number) => {
    onDataChange(updateSettings(storeData, { [key]: val }));
  };

  const handleLang = (lang: 'en' | 'id' | 'zh') => {
    onDataChange(updateSettings(storeData, { language: lang }));
  };

  const handleReset = () => {
    resetAllProgress();
    onResetComplete();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#111]/95 backdrop-blur-sm"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
      }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col px-4 sm:mx-auto sm:max-w-2xl sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0 pt-1">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition active:scale-90">
            <span className="text-base">←</span>
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-400">⚙ Settings</div>
          <div className="w-9" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-3">
          {/* Audio */}
          <Section title="Audio">
            <SliderRow label="Music" value={settings.musicVolume} onChange={(v) => handleVolume('musicVolume', v)} icon="🎵" />
            <SliderRow label="SFX" value={settings.sfxVolume} onChange={(v) => handleVolume('sfxVolume', v)} icon="🔊" />
          </Section>

          {/* Controls */}
          <Section title="Controls">
            <ToggleRow label="Vibration" enabled={settings.vibration} onToggle={() => handleToggle('vibration')} icon="📳" />
          </Section>

          {/* Language */}
          <Section title="Language">
            <div className="flex gap-2 flex-wrap">
              {([
                { code: 'en' as const, label: '🇬🇧 English' },
                { code: 'id' as const, label: '🇮🇩 Bahasa' },
                { code: 'zh' as const, label: '🇨🇳 中文' },
              ]).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLang(lang.code)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold border transition
                    ${settings.language === lang.code
                      ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-400'
                      : 'border-white/10 bg-white/5 text-zinc-400'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </Section>

          {/* About */}
          <Section title="About">
            <div className="text-xs text-zinc-500 space-y-1">
              <p>Dimsum Collector v1.0</p>
              <p>Collect dimsum, earn tickets, open mystery boxes!</p>
              <p className="text-zinc-600 text-[10px]">Made with ❤️</p>
            </div>
          </Section>

          {/* Danger Zone */}
          <Section title="Danger Zone" variant="danger">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-black uppercase tracking-wider text-red-400 transition hover:bg-red-500/20"
              >
                🗑 Reset All Progress
              </button>
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-xs text-red-400 font-bold mb-1">⚠ Are you sure?</p>
                  <p className="text-[10px] text-red-400/70">This will delete all your progress, dimsum, tickets, and rewards. This cannot be undone!</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-[#171717]/95 py-2 text-xs font-bold text-zinc-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-black text-white transition hover:bg-red-500"
                  >
                    Delete Everything
                  </button>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; variant?: 'danger'; children: React.ReactNode }> = ({ title, variant, children }) => (
  <div className={`rounded-[22px] border p-4 shadow-xl ${
    variant === 'danger' ? 'border-red-500/15 bg-[#171717]/95' : 'border-white/10 bg-[#171717]/95'
  }`}>
    <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-3 ${
      variant === 'danger' ? 'text-red-400/70' : 'text-zinc-400'
    }`}>{title}</div>
    {children}
  </div>
);

const SliderRow: React.FC<{ label: string; value: number; onChange: (v: number) => void; icon: string }> = ({ label, value, onChange, icon }) => (
  <div className="flex items-center gap-3 mb-3 last:mb-0">
    <span className="text-sm">{icon}</span>
    <span className="text-xs font-bold text-zinc-300 w-12">{label}</span>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1.5 rounded-full accent-yellow-400 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
    />
    <span className="text-[10px] font-bold text-zinc-500 w-8 text-right">{value}%</span>
  </div>
);

const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle: () => void; icon: string }> = ({ label, enabled, onToggle, icon }) => (
  <button onClick={onToggle} className="flex items-center w-full gap-3 group">
    <span className="text-sm">{icon}</span>
    <span className="text-xs font-bold text-zinc-300 flex-1 text-left">{label}</span>
    <div className={`w-10 h-5 rounded-full transition flex items-center px-0.5 ${enabled ? 'bg-yellow-500' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);
