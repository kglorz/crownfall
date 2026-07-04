import { motion } from 'motion/react';
import { ScreenState } from '../../types';
import { Button } from '../ui/Button';

interface PlaceholderScreenProps {
  title: string;
  setScreen: (screen: ScreenState) => void;
}

export function PlaceholderScreen({ title, setScreen }: PlaceholderScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen relative"
    >
      <div className="w-full max-w-2xl p-8 border border-stone-800 bg-stone-900/50 backdrop-blur-sm flex flex-col items-center">
        <h2 className="font-cinzel text-3xl text-stone-200 text-center mb-8 tracking-widest uppercase">
          {title}
        </h2>
        
        <p className="text-stone-400 mb-12 text-center max-w-md">
          This section is currently being transcribed by the Royal Scribes and will be available shortly.
        </p>

        <Button variant="ghost" size="sm" onClick={() => setScreen('MAIN_MENU')}>
          Return
        </Button>
      </div>
    </motion.div>
  );
}
