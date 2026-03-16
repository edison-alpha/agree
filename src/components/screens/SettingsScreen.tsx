import React, { useState } from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { updateSettings, resetAllProgress } from '../../store/gameStore';
import arenaBg from '../../assets/arena_background.webp';

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
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-2 mx-2 mb-2 rounded-2xl"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
      >
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
          style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <span className="text-sm">←</span>
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">⚙️ Settings</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4 space-y-3 pb-4">
        {/* Audio */}
        <Section title="🎵 Audio">
          <SliderRow label="Music" value={settings.musicVolume} onChange={(v) => handleVolume('musicVolume', v)} />
          <SliderRow label="SFX" value={settings.sfxVolume} onChange={(v) => handleVolume('sfxVolume', v)} />
        </Section>

        {/* Controls */}
        <Section title="🎮 Controls">
          <ToggleRow label="Vibration" enabled={settings.vibration} onToggle={() => handleToggle('vibration')} />
        </Section>

        {/* Language */}
        <Section title="🌐 Language">
          <div className="flex gap-2 flex-wrap">
            {([
              { code: 'en' as const, label: '🇬🇧 English' },
              { code: 'id' as const, label: '🇮🇩 Bahasa' },
              { code: 'zh' as const, label: '🇨🇳 中文' },
            ]).map((lang) => (
              <button key={lang.code} onClick={() => handleLang(lang.code)}
                className="rounded-xl px-3 py-2 text-xs font-bold transition"
                style={{
                  background: settings.language === lang.code
                    ? 'rgba(245,158,11,0.12)'
                    : 'rgba(0,0,0,0.2)',
                  border: settings.language === lang.code
                    ? '1px solid rgba(255,215,0,0.25)'
                    : '1px solid rgba(255,215,0,0.06)',
                  color: settings.language === lang.code ? '#fbbf24' : '#a78bfa',
                }}
              >{lang.label}</button>
            ))}
          </div>
        </Section>

        {/* About */}
        <Section title="ℹ️ About">
          <div className="text-xs text-purple-300/70 space-y-1">
            <p>Dimsum Collector v1.0</p>
            <p>Collect dimsum, earn tickets, open mystery boxes!</p>
            <p className="text-purple-400/40 text-[10px]">Made with ❤️</p>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section title="⚠️ Danger Zone" variant="danger">
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)}
              className="w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-wider text-red-400 transition"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >🗑 Reset All Progress</button>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <p className="text-xs text-red-400 font-bold mb-1">⚠ Are you sure?</p>
                <p className="text-[10px] text-red-400/60">This will delete all progress, dimsum, tickets, and rewards. Cannot be undone!</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold text-purple-300 transition"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,215,0,0.1)',
                  }}
                >Cancel</button>
                <button onClick={handleReset}
                  className="flex-1 rounded-xl py-2 text-xs font-black text-white transition"
                  style={{ background: 'linear-gradient(180deg, #dc2626, #b91c1c)' }}
                >Delete Everything</button>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

const Section: React.FC<{ title: string; variant?: 'danger'; children: React.ReactNode }> = ({ title, variant, children }) => (
  <div className="rounded-2xl p-4"
    style={{
      background: 'rgba(0,0,0,0.4)',
      border: variant === 'danger' ? '1px solid rgba(239,68,68,0.12)' : '1px solid rgba(255,215,0,0.12)',
    }}
  >
    <div className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${
      variant === 'danger' ? 'text-red-400/60' : 'text-amber-400/60'
    }`}>{title}</div>
    {children}
  </div>
);

const SliderRow: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3 mb-3 last:mb-0">
    <span className="text-xs font-bold text-purple-200 w-12">{label}</span>
    <div className="flex-1 relative">
      <input type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, #f59e0b ${value}%, rgba(255,255,255,0.08) ${value}%)`,
        }}
      />
    </div>
    <span className="text-[10px] font-bold text-purple-400 w-8 text-right">{value}%</span>
  </div>
);

const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle: () => void }> = ({ label, enabled, onToggle }) => (
  <button onClick={onToggle} className="flex items-center w-full gap-3 group">
    <span className="text-xs font-bold text-purple-200 flex-1 text-left">{label}</span>
    <div className="w-11 h-6 rounded-full transition flex items-center px-0.5"
      style={{
        background: enabled
          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          : 'rgba(255,255,255,0.08)',
        border: enabled ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      />
    </div>
  </button>
);
