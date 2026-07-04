import { motion } from 'motion/react';
import { ScreenState, GameSetup } from '../../types';
import { Board } from '../game/Board';

interface GameScreenProps {
  setup: GameSetup | null;
  setScreen: (screen: ScreenState) => void;
}

export function GameScreen({ setup, setScreen }: GameScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
    >
      <div className="w-full flex-grow flex flex-col items-center justify-center min-h-0">
        <Board setup={setup} setScreen={setScreen} />
      </div>
    </motion.div>
  );
}
