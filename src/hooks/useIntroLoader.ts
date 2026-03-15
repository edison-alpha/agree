import React, { useEffect, useRef, useState } from 'react';
import type { GameSnapshot, GameState } from '../types/game';
import { ALL_ASSETS } from '../constants/assets';
import { playIntroAudio } from '../utils/audio';
import goblinBayPng from '../assets/goblinbay.png';

interface UseIntroLoaderResult {
  loadingProgress: number;
  introFading: boolean;
}

/**
 * Orchestrates the intro screen: preloads all remote assets,
 * plays the intro jingle, shows progress, then signals transition.
 */
export function useIntroLoader(
  gameState: GameState,
  gameRef: React.MutableRefObject<GameSnapshot>,
  onComplete: () => void,
): UseIntroLoaderResult {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [introFading, setIntroFading] = useState(false);
  const introAudioRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (gameState !== 'intro') return;

    let cancelled = false;
    let progress = 0;

    // ── Intro audio ──────────────────────────────────────────────────
    const tryPlayAudio = () => {
      if (!introAudioRef.current) {
        introAudioRef.current = playIntroAudio();
      }
    };

    try { tryPlayAudio(); } catch { /* autoplay policy */ }

    const onInteract = () => {
      tryPlayAudio();
      window.removeEventListener('click', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
    window.addEventListener('click', onInteract);
    window.addEventListener('touchstart', onInteract);

    // ── Asset loading ────────────────────────────────────────────────
    const imageEntries = Object.entries(ALL_ASSETS).filter(([, u]) => u.endsWith('.webp') || u.endsWith('.png'));
    const audioEntries = Object.entries(ALL_ASSETS).filter(([, u]) => u.endsWith('.mp3'));
    const totalAssets = imageEntries.length + audioEntries.length;
    let loadedCount = 0;

    const bumpProgress = () => {
      loadedCount++;
      const assetPct = (loadedCount / totalAssets) * 70;
      if (!cancelled) {
        progress = Math.min(assetPct, 70);
        setLoadingProgress(Math.round(progress));
      }
    };

    imageEntries.forEach(([key, url]) => {
      const img = new Image();
      img.onload = bumpProgress;
      img.onerror = bumpProgress;
      img.src = url;
      gameRef.current.images[key] = img;
    });

    // Load local Goblin Bay image for elite enemies in the canvas
    const goblinLocal = new Image();
    goblinLocal.src = goblinBayPng;
    gameRef.current.images['goblin_bay_local'] = goblinLocal;

    audioEntries.forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.addEventListener('canplaythrough', bumpProgress, { once: true });
      audio.addEventListener('error', bumpProgress, { once: true });
      gameRef.current.audio[key] = audio;
    });

    // ── Smooth remaining 30 % ────────────────────────────────────────
    const smoothTimer = setInterval(() => {
      if (cancelled) return;
      progress += (100 - progress) * 0.05;
      if (progress > 98) progress = 100;
      setLoadingProgress(Math.round(progress));

      if (progress >= 100) {
        clearInterval(smoothTimer);
        setTimeout(() => {
          if (cancelled) return;
          setIntroFading(true);
          setTimeout(() => {
            if (cancelled) return;
            if (introAudioRef.current) {
              introAudioRef.current.stop();
              introAudioRef.current = null;
            }
            onComplete();
          }, 800);
        }, 500);
      }
    }, 80);

    return () => {
      cancelled = true;
      clearInterval(smoothTimer);
      window.removeEventListener('click', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loadingProgress, introFading };
}
