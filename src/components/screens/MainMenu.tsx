import { motion } from 'motion/react';
import { ScreenState } from '../../types';
import { Button } from '../ui/Button';

interface MainMenuProps {
  setScreen: (screen: ScreenState) => void;
}

export function MainMenu({ setScreen }: MainMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen relative"
    >
      {/* Background ambient effects could go here */}

      <div className="flex flex-col items-center space-y-16">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="font-cinzel text-6xl md:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-stone-300 to-stone-500 filter drop-shadow-md">
            𝕮𝖗𝖔𝖜𝖓𝖋𝖆𝖑𝖑
          </h1>
          <p className="mt-4 font-cinzel text-blood-500/80 tracking-[0.3em] uppercase text-sm md:text-base">
            No Mercy for the Crown
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col space-y-4 w-64"
        >
          <Button onClick={() => setScreen('CONQUEST')}>Conquest</Button>
          <Button onClick={() => setScreen('KINGS_TRIAL')}>King's Trial</Button>
          <Button onClick={() => setScreen('WAR_TABLE')}>War Table</Button>
          <Button variant="outline" onClick={() => setScreen('CODEX')}>Codex</Button>
          <Button variant="ghost" onClick={() => setScreen('SETTINGS')}>Settings</Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
