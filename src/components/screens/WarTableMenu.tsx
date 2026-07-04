import { useState } from 'react';
import { motion } from 'motion/react';
import { ScreenState, GameSetup, AIDifficulty } from '../../types';
import { Button } from '../ui/Button';
import { audio } from '../../lib/audio';
import { ArrowLeft, Swords } from 'lucide-react';

interface WarTableMenuProps {
  setScreen: (screen: ScreenState) => void;
  startGame: (setup: GameSetup) => void;
}

const difficulties: { id: AIDifficulty; name: string }[] = [
  { id: 'SQUIRE', name: 'Squire' },
  { id: 'KNIGHT', name: 'Knight' },
  { id: 'GENERAL', name: 'General' },
  { id: 'SOVEREIGN', name: 'Sovereign' },
];

const difficultyDetails: Record<AIDifficulty, { desc: string; trait: string }> = {
  SQUIRE: { 
    desc: 'Eager and direct, pursuing straightforward attacks and immediate captures.', 
    trait: 'Direct Offensive' 
  },
  KNIGHT: { 
    desc: 'Honorable and disciplined, prioritizing steady board control and lane defense.', 
    trait: 'Tactical Balance' 
  },
  GENERAL: { 
    desc: 'Cold and calculating, plotting deep map coverage and preparing ability counters.', 
    trait: 'Strategic Defense' 
  },
  SOVEREIGN: { 
    desc: 'Ruthlessly precise and unforgiving, exploiting every opening with flawless coordination.', 
    trait: 'Apex Dominance' 
  },
};

export function WarTableMenu({ setScreen, startGame }: WarTableMenuProps) {
  const [whiteAI, setWhiteAI] = useState<AIDifficulty>('KNIGHT');
  const [blackAI, setBlackAI] = useState<AIDifficulty>('KNIGHT');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen h-screen relative p-3 md:p-6 overflow-hidden bg-radial from-stone-900 via-stone-950 to-stone-950"
    >
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-red-950/10 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-red-950/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl max-h-full p-4 md:p-6 border border-stone-850 bg-stone-900/40 backdrop-blur-md relative rounded-lg shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {/* Border corner decorations */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-900/40 rounded-tl-sm"></span>
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-900/40 rounded-tr-sm"></span>
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-900/40 rounded-bl-sm"></span>
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-900/40 rounded-br-sm"></span>

        <div>
          {/* Header Panel - Space-optimized */}
          <div className="flex flex-col items-center mb-5 md:mb-6 relative">
            <div className="relative mb-1">
              <Swords className="w-8 h-8 text-red-600/90 animate-pulse" />
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl text-stone-100 text-center tracking-[0.2em] uppercase font-bold drop-shadow">
              War Table
            </h2>
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-red-900/40 to-transparent mt-2 mb-1.5" />
            <p className="text-stone-400 text-center font-cinzel text-[10px] uppercase tracking-[0.25em]">
              Automated Simulation Arena
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 md:gap-6 mb-6">
            {/* White Kingdom */}
            <div className="flex-1 border border-stone-800/80 p-4 bg-stone-950/40 rounded-md flex flex-col justify-between group hover:border-red-900/35 transition-colors">
              <div>
                <div className="flex justify-between items-center border-b border-stone-800/60 pb-2 mb-3">
                  <h3 className="font-cinzel text-sm text-stone-200 uppercase tracking-widest font-semibold">White Kingdom</h3>
                  <span className="text-[9px] font-mono tracking-wider text-stone-500 uppercase px-1.5 py-0.5 bg-stone-900/80 border border-stone-800/40 rounded">DIVINE LUMINARY</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {difficulties.map(diff => (
                    <button
                      key={`white-${diff.id}`}
                      onMouseEnter={() => audio.playHover()}
                      onClick={() => { audio.playClick(); setWhiteAI(diff.id); }}
                      className={`py-2 px-2.5 font-cinzel tracking-wider uppercase text-[10px] border transition-all duration-200 rounded-sm ${
                        whiteAI === diff.id 
                          ? 'border-red-600 text-red-500 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.15)] font-bold' 
                          : 'border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300 bg-transparent'
                      }`}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Difficulty Description */}
              <div className="border-t border-stone-800/40 pt-2.5 mt-1 min-h-[60px]">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] font-mono text-red-500/80 uppercase font-semibold">TRAIT: {difficultyDetails[whiteAI].trait}</span>
                </div>
                <p className="text-stone-400 text-xs font-sans leading-relaxed">
                  {difficultyDetails[whiteAI].desc}
                </p>
              </div>
            </div>

            {/* Versus Divider */}
            <div className="flex lg:flex-col items-center justify-center py-1 lg:py-0">
              <div className="h-[1px] lg:h-10 w-10 lg:w-[1px] bg-stone-800"></div>
              <div className="mx-3 lg:my-3 flex items-center justify-center w-8 h-8 rounded-full border border-stone-800 bg-stone-950/90 text-red-500 font-cinzel text-xs tracking-wider font-bold shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                VS
              </div>
              <div className="h-[1px] lg:h-10 w-10 lg:w-[1px] bg-stone-800"></div>
            </div>

            {/* Black Kingdom */}
            <div className="flex-1 border border-stone-800/80 p-4 bg-stone-950/40 rounded-md flex flex-col justify-between group hover:border-red-900/35 transition-colors">
              <div>
                <div className="flex justify-between items-center border-b border-stone-800/60 pb-2 mb-3">
                  <h3 className="font-cinzel text-sm text-stone-200 uppercase tracking-widest font-semibold">Black Kingdom</h3>
                  <span className="text-[9px] font-mono tracking-wider text-stone-500 uppercase px-1.5 py-0.5 bg-stone-900/80 border border-stone-800/40 rounded">SHADOW CONCLAVE</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {difficulties.map(diff => (
                    <button
                      key={`black-${diff.id}`}
                      onMouseEnter={() => audio.playHover()}
                      onClick={() => { audio.playClick(); setBlackAI(diff.id); }}
                      className={`py-2 px-2.5 font-cinzel tracking-wider uppercase text-[10px] border transition-all duration-200 rounded-sm ${
                        blackAI === diff.id 
                          ? 'border-red-600 text-red-500 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.15)] font-bold' 
                          : 'border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-300 bg-transparent'
                      }`}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Difficulty Description */}
              <div className="border-t border-stone-800/40 pt-2.5 mt-1 min-h-[60px]">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[9px] font-mono text-red-500/80 uppercase font-semibold">TRAIT: {difficultyDetails[blackAI].trait}</span>
                </div>
                <p className="text-stone-400 text-xs font-sans leading-relaxed">
                  {difficultyDetails[blackAI].desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-stone-850">
          <Button 
            variant="secondary"
            className="w-full sm:w-80 shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-950/80 hover:bg-red-900 active:bg-stone-950 border border-red-900/40 hover:border-red-600/60 text-stone-100 hover:text-white active:text-stone-300 transition-all duration-300"
            onClick={() => startGame({ mode: 'WAR_TABLE', playerWhite: whiteAI, playerBlack: blackAI, bottomColor: 'WHITE' })}
          >
            Begin Simulation
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { audio.playClick(); setScreen('MAIN_MENU'); }}
            className="group flex items-center gap-2 border border-stone-800/80 bg-stone-950/20 hover:bg-stone-900 hover:border-stone-700 hover:text-stone-100 rounded-md py-1.5 px-4 text-stone-400 font-cinzel text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5 duration-200" />
            Back to Menu
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
