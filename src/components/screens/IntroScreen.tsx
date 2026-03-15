import React from 'react';
import introPng from '../../assets/intro.png';
import { ProgressBar } from '../ui/ProgressBar';

interface IntroScreenProps {
  loadingProgress: number;
  fading: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ loadingProgress, fading }) => (
  <div
    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease-in-out' }}
  >
    <img src={introPng} alt="Game Intro" className="absolute inset-0 w-full h-full object-contain" />

    <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6 pt-12 bg-gradient-to-t from-black via-black/60 to-transparent">
      <ProgressBar value={loadingProgress} />
    </div>
  </div>
);
