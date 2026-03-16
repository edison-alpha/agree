import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { ActivePowerUp, CharacterId, DialogueMessage, GameState } from './types/game';

// ─── Constants ──────────────────────────────────────────────────────────────
import { GAME_CONFIG } from './constants/config';
import { CHARACTER_OPTIONS } from './constants/characters';
import { buildOpeningDialogues, buildMilestoneDialogues } from './constants/dialogues';

// ─── Engine / Entities ──────────────────────────────────────────────────────
import { createInitialGameSnapshot, resetGameSnapshot } from './engine/entities';

// ─── Custom Hooks ───────────────────────────────────────────────────────────
import { useCamera } from './hooks/useCamera';
import { useGameLoop } from './hooks/useGameLoop';
import { useAudioManager } from './hooks/useAudioManager';
import { useIntroLoader } from './hooks/useIntroLoader';

// ─── Screen Components ─────────────────────────────────────────────────────
import { IntroScreen } from './components/screens/IntroScreen';
import { NameEntryScreen } from './components/screens/NameEntryScreen';
import { PhotoCaptureScreen } from './components/screens/PhotoCaptureScreen';
import { CharacterSelectScreen } from './components/screens/CharacterSelectScreen';
import { TutorialScreen } from './components/screens/TutorialScreen';
import { DialogueScreen } from './components/screens/DialogueScreen';
import { GameHUD } from './components/screens/GameHUD';
import { WishScreen } from './components/screens/WishScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { BirthdayScreen } from './components/screens/BirthdayScreen';

// ─── Helpers ────────────────────────────────────────────────────────────────
import { playSoundEffect } from './utils/audio';

// ═══════════════════════════════════════════════════════════════════════════
// App — thin orchestrator; all heavy lifting lives in hooks / engine
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Fullscreen API for mobile PWA ─────────────────────────────────
  useEffect(() => {
    const requestFullscreen = () => {
      const el = document.documentElement;
      if (document.fullscreenElement) return;
      el.requestFullscreen?.().catch(() => {});
      // Remove after first interaction
      document.removeEventListener('pointerdown', requestFullscreen);
    };
    document.addEventListener('pointerdown', requestFullscreen, { once: true });
    return () => document.removeEventListener('pointerdown', requestFullscreen);
  }, []);

  // ── State machine ────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>('intro');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(GAME_CONFIG.playerMaxHealth);
  const [lives, setLives] = useState(GAME_CONFIG.playerLives);
  const [weapon, setWeapon] = useState<string>('default');
  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [currentWishMilestone, setCurrentWishMilestone] = useState(0);
  const [wishInput, setWishInput] = useState('');
  const [wishes, setWishes] = useState<string[]>([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [milestoneDialogueIndex, setMilestoneDialogueIndex] = useState(0);
  const [milestoneDialogues, setMilestoneDialogues] = useState<DialogueMessage[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>('agree');

  // ── Refs ─────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef(createInitialGameSnapshot());

  // ── Derived ──────────────────────────────────────────────────────────
  const dialogueMessages = useMemo(() => buildOpeningDialogues(playerName.trim()), [playerName]);
  const selectedCharacter = CHARACTER_OPTIONS.find((c) => c.id === selectedCharacterId) ?? CHARACTER_OPTIONS[0];

  // ── Hooks ────────────────────────────────────────────────────────────
  const camera = useCamera(gameState);
  const audio = useAudioManager(gameRef);

  const { loadingProgress, introFading } = useIntroLoader(gameState, gameRef, () => {
    setGameState('nameEntry');
    gameRef.current.state = 'nameEntry';
  });

  // ── Sync game-ref state on every React state change ──────────────────
  useEffect(() => {
    gameRef.current.state = gameState;
    if (gameState !== 'playing') {
      gameRef.current.mouse.down = false;
      gameRef.current.keys = {};
      gameRef.current.joysticks.left.active = false;
      gameRef.current.joysticks.left.id = null;
      gameRef.current.joysticks.left.dx = 0;
      gameRef.current.joysticks.left.dy = 0;
      gameRef.current.joysticks.right.active = false;
      gameRef.current.joysticks.right.id = null;
    }
  }, [gameState]);

  // ── Physics event handlers (stable refs via useCallback) ────────────
  const onScoreChange = useCallback((s: number) => setScore(s), []);
  const onHealthChange = useCallback((h: number) => setHealth(h), []);
  const onLivesChange = useCallback((l: number) => setLives(l), []);

  const onGameOver = useCallback(() => {
    setGameState('gameover');
    audio.stopBackgroundMusic();
  }, [audio]);

  const onMilestone = useCallback(
    (milestone: number) => {
      setCurrentWishMilestone(milestone);
      setMilestoneDialogues(buildMilestoneDialogues(playerName.trim(), milestone));
      setMilestoneDialogueIndex(0);
      setGameState('milestoneDialogue');
      audio.stopBackgroundMusic();
    },
    [playerName, audio],
  );

  const onBirthday = useCallback(() => {
    setGameState('birthday');
    audio.stopBackgroundMusic();
    playSoundEffect(gameRef.current.audio['victory_music']);
  }, [audio]);

  // ── Game loop ────────────────────────────────────────────────────────
  useGameLoop(canvasRef, gameRef, {
    onScoreChange,
    onHealthChange,
    onLivesChange,
    onGameOver,
    onMilestone,
    onBirthday,
  });

  // ── Sync weapon/powerUps from gameRef to React state for HUD ──────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setWeapon(gameRef.current.weapon);
      setPowerUps([...gameRef.current.powerUps]);
    }, 200);
    return () => clearInterval(interval);
  }, [gameState]);

  // ── Transition helpers ───────────────────────────────────────────────
  const continueFromName = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    if (trimmed !== playerName) setPlayerName(trimmed);
    setGameState('photoCapture');
    gameRef.current.state = 'photoCapture';
  };

  const startGame = () => {
    if (!playerName.trim()) return;
    if (!camera.profilePhoto) {
      camera.setCameraError('Ambil foto dulu sebelum lanjut ke percakapan.');
      return;
    }
    setGameState('characterSelect');
    gameRef.current.state = 'characterSelect';
  };

  const beginGameplay = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    if (trimmed !== playerName) setPlayerName(trimmed);
    // Player starts at map centre
    gameRef.current.player.x = GAME_CONFIG.mapWidth / 2;
    gameRef.current.player.y = GAME_CONFIG.mapHeight / 2;
    setGameState('playing');
    gameRef.current.state = 'playing';
    audio.startBackgroundMusic();
  };

  const nextDialogue = () => {
    if (dialogueIndex < dialogueMessages.length - 1) {
      setDialogueIndex((i) => i + 1);
      return;
    }
    beginGameplay();
  };

  const nextMilestoneDialogue = () => {
    if (milestoneDialogueIndex < milestoneDialogues.length - 1) {
      setMilestoneDialogueIndex((i) => i + 1);
      return;
    }
    setGameState('wish');
    gameRef.current.state = 'wish';
  };

  const submitWish = () => {
    const trimmed = wishInput.trim();
    // MANDATORY: must write a wish (min 3 chars) before continuing
    if (trimmed.length < 3) return;
    setWishes((prev) => [...prev, trimmed]);
    setWishInput('');
    setGameState('playing');
    gameRef.current.state = 'playing';
    audio.startBackgroundMusic();
  };

  const restartGame = () => {
    resetGameSnapshot(gameRef.current);
    setScore(0);
    setHealth(GAME_CONFIG.playerMaxHealth);
    setLives(GAME_CONFIG.playerLives);
    setWeapon('default');
    setPowerUps([]);
    setCurrentWishMilestone(0);
    setWishes([]);
    setWishInput('');
    setDialogueIndex(0);
    setMilestoneDialogueIndex(0);
    setMilestoneDialogues([]);
    setSelectedCharacterId('agree');
    setGameState('nameEntry');
    camera.setProfilePhoto(null);
    camera.setCameraError('');
    audio.stopBackgroundMusic();
    audio.stopVictoryMusic();
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black text-white font-sans touch-none">
      {/* Canvas (always mounted so the game loop ref stays alive) */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* ── Intro ────────────────────────────────────────────────────── */}
      {gameState === 'intro' && (
        <IntroScreen loadingProgress={loadingProgress} fading={introFading} />
      )}

      {/* ── Name Entry ───────────────────────────────────────────────── */}
      {gameState === 'nameEntry' && (
        <NameEntryScreen
          playerName={playerName}
          onChange={setPlayerName}
          onSubmit={continueFromName}
        />
      )}

      {/* ── Photo Capture ────────────────────────────────────────────── */}
      {gameState === 'photoCapture' && (
        <PhotoCaptureScreen
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          videoRef={camera.videoRef}
          captureCanvasRef={camera.captureCanvasRef}
          cameraReady={camera.cameraReady}
          cameraError={camera.cameraError}
          onCapture={camera.capturePhoto}
          onRetake={() => camera.setProfilePhoto(null)}
          onContinue={startGame}
        />
      )}

      {/* ── Character Select ─────────────────────────────────────────── */}
      {gameState === 'characterSelect' && (
        <CharacterSelectScreen
          selectedId={selectedCharacterId}
          onSelect={setSelectedCharacterId}
          onContinue={() => {
            setGameState('tutorial');
            gameRef.current.state = 'tutorial';
          }}
        />
      )}

      {/* ── Tutorial ─────────────────────────────────────────────────── */}
      {gameState === 'tutorial' && (
        <TutorialScreen
          onContinue={() => {
            setDialogueIndex(0);
            setGameState('dialogue');
            gameRef.current.state = 'dialogue';
          }}
        />
      )}

      {/* ── Opening Dialogue ─────────────────────────────────────────── */}
      {gameState === 'dialogue' && (
        <DialogueScreen
          messages={dialogueMessages}
          currentIndex={dialogueIndex}
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          characterImage={selectedCharacter.image}
          characterName={selectedCharacter.name}
          onNext={nextDialogue}
          finalLabel="Mulai"
          zIndex={70}
        />
      )}

      {/* ── Milestone Dialogue ───────────────────────────────────────── */}
      {gameState === 'milestoneDialogue' && milestoneDialogues.length > 0 && (
        <DialogueScreen
          messages={milestoneDialogues}
          currentIndex={milestoneDialogueIndex}
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          characterImage={selectedCharacter.image}
          characterName={selectedCharacter.name}
          onNext={nextMilestoneDialogue}
          finalLabel="Lanjut Wish"
          zIndex={72}
        />
      )}

      {/* ── Playing HUD ──────────────────────────────────────────────── */}
      {gameState === 'playing' && (
        <GameHUD
          score={score}
          health={health}
          lives={lives}
          weapon={weapon}
          powerUps={powerUps}
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          characterImage={selectedCharacter.image}
          characterName={selectedCharacter.name}
        />
      )}

      {/* ── Wish ─────────────────────────────────────────────────────── */}
      {gameState === 'wish' && (
        <WishScreen
          milestone={currentWishMilestone}
          wishInput={wishInput}
          onWishChange={setWishInput}
          onSubmit={submitWish}
        />
      )}

      {/* ── Game Over ────────────────────────────────────────────────── */}
      {gameState === 'gameover' && (
        <GameOverScreen score={score} onRestart={restartGame} />
      )}

      {/* ── Birthday / Victory ───────────────────────────────────────── */}
      {gameState === 'birthday' && (
        <BirthdayScreen playerName={playerName} wishes={wishes} onRestart={restartGame} />
      )}
    </div>
  );
}
