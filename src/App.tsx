/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ScreenState, GameSetup } from './types';
import { MainMenu } from './components/screens/MainMenu';
import { ConquestMenu } from './components/screens/ConquestMenu';
import { KingsTrialMenu } from './components/screens/KingsTrialMenu';
import { WarTableMenu } from './components/screens/WarTableMenu';
import { CodexScreen } from './components/screens/CodexScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { GameScreen } from './components/screens/GameScreen';
import { MenuBackground } from './components/ui/MenuBackground';
import { audio } from './lib/audio';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('MAIN_MENU');
  const [gameSetup, setGameSetup] = useState<GameSetup | null>(null);

  const handleStartGame = (setup: GameSetup) => {
    setGameSetup(setup);
    setScreen('GAME');
  };

  useEffect(() => {
    // Start BGM on first interaction
    const handleInteraction = () => {
      audio.playBGM();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 overflow-hidden select-none relative">
      {screen !== 'GAME' && <MenuBackground />}
      <AnimatePresence mode="wait">
        {screen === 'MAIN_MENU' && <MainMenu key="main" setScreen={setScreen} />}
        {screen === 'CONQUEST' && <ConquestMenu key="conquest" setScreen={setScreen} startGame={handleStartGame} />}
        {screen === 'KINGS_TRIAL' && <KingsTrialMenu key="trial" setScreen={setScreen} startGame={handleStartGame} />}
        {screen === 'WAR_TABLE' && <WarTableMenu key="war" setScreen={setScreen} startGame={handleStartGame} />}
        {screen === 'CODEX' && <CodexScreen key="codex" setScreen={setScreen} />}
        {screen === 'SETTINGS' && <SettingsScreen key="settings" setScreen={setScreen} />}
        {screen === 'GAME' && <GameScreen key="game" setup={gameSetup} setScreen={setScreen} />}
      </AnimatePresence>
    </main>
  );
}
