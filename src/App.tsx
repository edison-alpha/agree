import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { ActivePowerUp, CharacterId, DialogueMessage, GameState } from './types/game';

// ─── Constants ──────────────────────────────────────────────────────────────
import { GAME_CONFIG } from './constants/config';
import { CHARACTER_OPTIONS } from './constants/characters';
import { buildOpeningDialogues, buildMilestoneDialogues } from './constants/dialogues';
import { LEVELS, getLevelById } from './constants/levels';
import type { LevelConfig } from './constants/levels';

// ─── Engine / Entities ──────────────────────────────────────────────────────
import { createInitialGameSnapshot, resetGameSnapshot } from './engine/entities';

// ─── Store ──────────────────────────────────────────────────────────────────
import {
  loadGameData,
  saveProfile,
  saveLevelProgress,
  addToLeaderboard,
  getTotalStars,
  getCompletedLevels,
  getTicketProgress,
} from './store/gameStore';
import type { GameStoreData } from './store/gameStore';

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
import { MainMenuScreen } from './components/screens/MainMenuScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { MysteryBoxScreen } from './components/screens/MysteryBoxScreen';
import { LevelCompleteScreen } from './components/screens/LevelCompleteScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

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
      document.removeEventListener('pointerdown', requestFullscreen);
    };
    document.addEventListener('pointerdown', requestFullscreen, { once: true });
    return () => document.removeEventListener('pointerdown', requestFullscreen);
  }, []);

  // ── Persistent Store ──────────────────────────────────────────────
  const [storeData, setStoreData] = useState<GameStoreData>(() => loadGameData());

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

  // ── Level / Dimsum State ──────────────────────────────────────────
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [dimsumCollected, setDimsumCollected] = useState(0);
  const [dimsumTotal, setDimsumTotal] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState(0);
  const [levelTimeElapsed, setLevelTimeElapsed] = useState(0);
  const [previousTickets, setPreviousTickets] = useState(0);

  // ── Refs ─────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef(createInitialGameSnapshot());

  // ── Derived ──────────────────────────────────────────────────────────
  const dialogueMessages = useMemo(() => buildOpeningDialogues(playerName.trim()), [playerName]);
  const selectedCharacter = CHARACTER_OPTIONS.find((c) => c.id === selectedCharacterId) ?? CHARACTER_OPTIONS[0];
  const currentLevel = useMemo(() => getLevelById(currentLevelId), [currentLevelId]);

  // ── Hooks ────────────────────────────────────────────────────────────
  const camera = useCamera(gameState);
  const audio = useAudioManager(gameRef);

  const { loadingProgress, introFading } = useIntroLoader(gameState, gameRef, () => {
    // Check if we have a saved profile
    const data = loadGameData();
    if (data.profile) {
      setPlayerName(data.profile.name);
      setSelectedCharacterId(data.profile.characterId as CharacterId);
      setStoreData(data);
      setGameState('mainMenu');
      gameRef.current.state = 'mainMenu';
    } else {
      setGameState('nameEntry');
      gameRef.current.state = 'nameEntry';
    }
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

  // ── Sync dimsum from gameRef to React state ──────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setDimsumCollected(gameRef.current.dimsumCollected);
      setWeapon(gameRef.current.weapon);
      setPowerUps([...gameRef.current.powerUps]);
    }, 200);
    return () => clearInterval(interval);
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
      // Check if all dimsum collected → level complete
      if (gameRef.current.dimsumCollected >= gameRef.current.dimsumTotal) {
        const timeElapsed = (performance.now() - levelStartTime) / 1000;
        setLevelTimeElapsed(timeElapsed);
        setDimsumCollected(gameRef.current.dimsumCollected);

        // Save progress
        const ticketsBefore = storeData.tickets;
        setPreviousTickets(ticketsBefore);
        const updated = saveLevelProgress(
          storeData,
          currentLevelId,
          gameRef.current.dimsumCollected,
          gameRef.current.dimsumTotal,
          timeElapsed,
        );

        // Add to leaderboard
        const finalData = addToLeaderboard(updated, {
          playerName: playerName.trim(),
          profilePhoto: camera.profilePhoto,
          totalDimsum: updated.totalDimsum,
          levelsCompleted: getCompletedLevels(updated),
          totalStars: getTotalStars(updated),
        });

        setStoreData(finalData);
        setGameState('levelComplete');
        audio.stopBackgroundMusic();
        playSoundEffect(gameRef.current.audio['victory_music']);
        return;
      }

      // Otherwise, standard milestone behavior
      setCurrentWishMilestone(milestone);
      setMilestoneDialogues(buildMilestoneDialogues(playerName.trim(), milestone));
      setMilestoneDialogueIndex(0);
      setGameState('milestoneDialogue');
      audio.stopBackgroundMusic();
    },
    [playerName, audio, levelStartTime, storeData, currentLevelId, camera.profilePhoto],
  );

  const onBirthday = useCallback(() => {
    // Level complete is now the primary endpoint
    const timeElapsed = (performance.now() - levelStartTime) / 1000;
    setLevelTimeElapsed(timeElapsed);
    setDimsumCollected(gameRef.current.dimsumCollected);

    const ticketsBefore = storeData.tickets;
    setPreviousTickets(ticketsBefore);
    const updated = saveLevelProgress(
      storeData,
      currentLevelId,
      gameRef.current.dimsumCollected,
      gameRef.current.dimsumTotal,
      timeElapsed,
    );

    const finalData = addToLeaderboard(updated, {
      playerName: playerName.trim(),
      profilePhoto: camera.profilePhoto,
      totalDimsum: updated.totalDimsum,
      levelsCompleted: getCompletedLevels(updated),
      totalStars: getTotalStars(updated),
    });

    setStoreData(finalData);
    setGameState('levelComplete');
    audio.stopBackgroundMusic();
    playSoundEffect(gameRef.current.audio['victory_music']);
  }, [audio, levelStartTime, storeData, currentLevelId, playerName, camera.profilePhoto]);

  // ── Game loop ────────────────────────────────────────────────────────
  useGameLoop(canvasRef, gameRef, {
    onScoreChange,
    onHealthChange,
    onLivesChange,
    onGameOver,
    onMilestone,
    onBirthday,
  });

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
      camera.setCameraError('Take a photo before continuing.');
      return;
    }
    setGameState('characterSelect');
    gameRef.current.state = 'characterSelect';
  };

  const goToMainMenu = () => {
    // Save profile
    const updated = saveProfile(storeData, {
      name: playerName.trim(),
      profilePhoto: camera.profilePhoto,
      characterId: selectedCharacterId,
      createdAt: Date.now(),
    });
    setStoreData(updated);
    setGameState('mainMenu');
    gameRef.current.state = 'mainMenu';
  };

  const startLevel = (levelId: number) => {
    const level = getLevelById(levelId);
    if (!level) return;

    setCurrentLevelId(levelId);
    setDimsumCollected(0);
    setDimsumTotal(level.dimsumCount);
    setScore(0);
    setHealth(GAME_CONFIG.playerMaxHealth);
    setLives(GAME_CONFIG.playerLives);
    setWeapon('default');
    setPowerUps([]);
    setCurrentWishMilestone(0);
    setWishes([]);

    // Configure game snapshot for this level
    resetGameSnapshot(gameRef.current);
    gameRef.current.dimsumCollected = 0;
    gameRef.current.dimsumTotal = level.dimsumCount;
    gameRef.current.currentLevelId = levelId;

    // Set player at map centre
    gameRef.current.player.x = level.mapWidth / 2;
    gameRef.current.player.y = level.mapHeight / 2;

    // Set character sprite
    const charFrontKey = `char_${selectedCharacterId}_front`;
    if (gameRef.current.images[charFrontKey]) {
      gameRef.current.images.trooper_character = gameRef.current.images[charFrontKey];
    }

    setLevelStartTime(performance.now());
    gameRef.current.levelStartTime = performance.now();

    setGameState('playing');
    gameRef.current.state = 'playing';
    audio.startBackgroundMusic();
  };

  const beginGameplay = () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    if (trimmed !== playerName) setPlayerName(trimmed);
    startLevel(currentLevelId);
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
    if (trimmed.length < 3) return;
    setWishes((prev) => [...prev, trimmed]);
    setWishInput('');
    setGameState('playing');
    gameRef.current.state = 'playing';
    audio.startBackgroundMusic();
  };

  const handleLevelComplete_NextLevel = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= LEVELS.length) {
      startLevel(nextId);
    } else {
      setGameState('mainMenu');
    }
  };

  const handleLevelComplete_Retry = () => {
    startLevel(currentLevelId);
  };

  const handleLevelComplete_Menu = () => {
    setGameState('mainMenu');
    gameRef.current.state = 'mainMenu';
    audio.stopBackgroundMusic();
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
    setDimsumCollected(0);
    setDimsumTotal(0);

    if (storeData.profile) {
      setGameState('mainMenu');
    } else {
      setSelectedCharacterId('agree');
      setGameState('nameEntry');
      camera.setProfilePhoto(null);
      camera.setCameraError('');
    }

    audio.stopBackgroundMusic();
    audio.stopVictoryMusic();
  };

  const fullRestart = () => {
    setSelectedCharacterId('agree');
    setPlayerName('');
    camera.setProfilePhoto(null);
    camera.setCameraError('');
    setGameState('nameEntry');
    gameRef.current.state = 'nameEntry';
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
            // First time → tutorial, returning → main menu
            if (!storeData.profile) {
              setGameState('tutorial');
              gameRef.current.state = 'tutorial';
            } else {
              goToMainMenu();
            }
          }}
        />
      )}

      {/* ── Tutorial ─────────────────────────────────────────────────── */}
      {gameState === 'tutorial' && (
        <TutorialScreen
          onContinue={() => {
            goToMainMenu();
          }}
        />
      )}

      {/* ── Main Menu (Hub) ──────────────────────────────────────────── */}
      {gameState === 'mainMenu' && (
        <MainMenuScreen
          storeData={storeData}
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          onPlay={() => {
            setGameState('levelSelect');
            gameRef.current.state = 'levelSelect';
          }}
          onLeaderboard={() => {
            setGameState('leaderboard');
            gameRef.current.state = 'leaderboard';
          }}
          onInventory={() => {
            setGameState('inventory');
            gameRef.current.state = 'inventory';
          }}
          onMysteryBox={() => {
            setGameState('mysteryBox');
            gameRef.current.state = 'mysteryBox';
          }}
          onSettings={() => {
            setGameState('settings');
            gameRef.current.state = 'settings';
          }}
        />
      )}

      {/* ── Level Select ─────────────────────────────────────────────── */}
      {gameState === 'levelSelect' && (
        <LevelSelectScreen
          storeData={storeData}
          onSelectLevel={(levelId) => {
            setCurrentLevelId(levelId);
            setDialogueIndex(0);
            // Quick start: skip dialogue for replayed levels
            const hasPlayed = storeData.levels[levelId]?.completed;
            if (hasPlayed) {
              startLevel(levelId);
            } else {
              setGameState('dialogue');
              gameRef.current.state = 'dialogue';
            }
          }}
          onBack={() => {
            setGameState('mainMenu');
            gameRef.current.state = 'mainMenu';
          }}
        />
      )}

      {/* ── Leaderboard ──────────────────────────────────────────────── */}
      {gameState === 'leaderboard' && (
        <LeaderboardScreen
          storeData={storeData}
          currentPlayerName={playerName}
          onBack={() => {
            setGameState('mainMenu');
            gameRef.current.state = 'mainMenu';
          }}
        />
      )}

      {/* ── Inventory ────────────────────────────────────────────────── */}
      {gameState === 'inventory' && (
        <InventoryScreen
          storeData={storeData}
          playerName={playerName}
          profilePhoto={camera.profilePhoto}
          onBack={() => {
            setGameState('mainMenu');
            gameRef.current.state = 'mainMenu';
          }}
          onMysteryBox={() => {
            setGameState('mysteryBox');
            gameRef.current.state = 'mysteryBox';
          }}
        />
      )}

      {/* ── Mystery Box ──────────────────────────────────────────────── */}
      {gameState === 'mysteryBox' && (
        <MysteryBoxScreen
          storeData={storeData}
          onDataChange={setStoreData}
          onBack={() => {
            setGameState('mainMenu');
            gameRef.current.state = 'mainMenu';
          }}
        />
      )}

      {/* ── Settings ─────────────────────────────────────────────────── */}
      {gameState === 'settings' && (
        <SettingsScreen
          storeData={storeData}
          onDataChange={setStoreData}
          onBack={() => {
            setGameState('mainMenu');
            gameRef.current.state = 'mainMenu';
          }}
          onResetComplete={fullRestart}
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
          finalLabel="Start Level"
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
          finalLabel="Continue"
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
          dimsumCollected={dimsumCollected}
          dimsumTotal={dimsumTotal}
          levelName={currentLevel?.name}
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
        <GameOverScreen
          score={score}
          onRestart={() => {
            // Go back to level select instead of full restart
            setGameState('levelSelect');
            gameRef.current.state = 'levelSelect';
            audio.stopBackgroundMusic();
          }}
        />
      )}

      {/* ── Level Complete ────────────────────────────────────────────── */}
      {gameState === 'levelComplete' && currentLevel && (
        <LevelCompleteScreen
          levelConfig={currentLevel}
          dimsumCollected={dimsumCollected}
          timeTaken={Math.floor(levelTimeElapsed)}
          previousBest={storeData.levels[currentLevelId]?.dimsumCollected ?? 0}
          ticketEarned={storeData.tickets > previousTickets}
          onNextLevel={handleLevelComplete_NextLevel}
          onRetry={handleLevelComplete_Retry}
          onMenu={handleLevelComplete_Menu}
          hasNextLevel={currentLevelId < LEVELS.length}
        />
      )}

      {/* ── Birthday / Victory (legacy, kept for compatibility) ───────── */}
      {gameState === 'birthday' && (
        <BirthdayScreen playerName={playerName} wishes={wishes} onRestart={restartGame} />
      )}
    </div>
  );
}
