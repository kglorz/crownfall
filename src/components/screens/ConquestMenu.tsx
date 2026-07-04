import { motion } from 'motion/react';
import { ScreenState, GameSetup } from '../../types';
import { Button } from '../ui/Button';
import { audio } from '../../lib/audio';
import { 
  Swords, 
  Users, 
  Globe, 
  Lock, 
  ArrowLeft
} from 'lucide-react';

interface ConquestMenuProps {
  setScreen: (screen: ScreenState) => void;
  startGame: (setup: GameSetup) => void;
}

export function ConquestMenu({ setScreen, startGame }: ConquestMenuProps) {
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
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blood-500/5 blur-[90px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-stone-500/5 blur-[90px]" />
      </div>

      <div className="w-full max-w-3xl max-h-full p-4 md:p-6 border border-stone-850 bg-stone-900/40 backdrop-blur-md relative rounded-lg shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        {/* Border corner decorations */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-blood-500/30 rounded-tl-sm"></span>
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-blood-500/30 rounded-tr-sm"></span>
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-blood-500/30 rounded-bl-sm"></span>
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-blood-500/30 rounded-br-sm"></span>

        <div>
          {/* Title block - Space-optimized */}
          <div className="flex flex-col items-center mb-5 md:mb-6 relative">
            <div className="relative mb-1">
              <Swords className="w-8 h-8 text-blood-400 animate-pulse" />
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl text-stone-100 text-center tracking-[0.2em] uppercase font-bold drop-shadow">
              Conquest
            </h2>
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-blood-500/30 to-transparent mt-2 mb-1.5" />
            <p className="text-stone-400 text-center font-cinzel text-[10px] uppercase tracking-[0.25em]">
              Claim Absolute Dominion in Combat
            </p>
          </div>
          
          {/* Grid - Highly compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local PVP Match Card */}
            <motion.div 
              whileHover={{ scale: 1.01, y: -1 }}
              className="border border-stone-800/80 hover:border-blood-500/40 p-4 flex flex-col justify-between transition-all duration-300 bg-stone-900/30 shadow-[0_0_15px_rgba(122,18,18,0.02)] hover:shadow-[0_0_20px_rgba(122,18,18,0.1)] cursor-pointer rounded-md group relative overflow-hidden"
              onMouseEnter={() => audio.playHover()}
              onClick={() => {
                audio.playClick();
                startGame({ 
                  mode: 'LOCAL_PVP', 
                  playerWhite: 'HUMAN', 
                  playerBlack: 'HUMAN',
                  bottomColor: 'WHITE' 
                });
              }}
            >
              {/* Visual glow overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-blood-950/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                <div className="p-2 w-10 h-10 rounded bg-stone-950/60 border border-stone-800/80 group-hover:border-blood-500/30 transition-all text-blood-400 mb-3 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-mono text-[9px] tracking-widest text-stone-500 uppercase block mb-0.5">
                  Local Battle
                </span>
                <h3 className="font-cinzel text-lg font-bold tracking-wider text-stone-200 group-hover:text-blood-400 transition-colors mb-2">
                  Local Duel
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed font-sans font-light">
                  Two players face off on a single device. Command your lane, maneuver your pieces, and out-wit your opponent in real-time tactical combat.
                </p>
              </div>

              <div className="mt-6 pt-2.5 border-t border-stone-800/40 flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider text-stone-500 uppercase">
                  Format: 1v1 Hotseat
                </span>
                <span className="text-[9px] font-cinzel tracking-[0.15em] text-blood-400 group-hover:underline uppercase flex items-center gap-1 font-semibold">
                  Begin Match <span className="transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
                </span>
              </div>
            </motion.div>

            {/* Online Match Card (Locked) */}
            <div className="border border-stone-900 bg-stone-950/30 p-4 flex flex-col justify-between rounded-md relative group select-none overflow-hidden">
              {/* Locked screen pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65),rgba(12,10,9,0.98))] z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="p-2.5 rounded-full bg-stone-900 border border-stone-850 text-stone-600 mb-2.5 relative">
                  <Lock className="w-4 h-4" />
                  <Globe className="w-6 h-6 text-stone-700/20 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="font-cinzel text-[10px] tracking-[0.25em] text-stone-500 uppercase font-semibold mb-0.5">
                  Locked Dimension
                </h4>
                <p className="text-[9px] text-stone-600 max-w-[180px] leading-normal font-sans">
                  Online servers are being forged in the Keep. Sharpen your blade.
                </p>
              </div>

              <div className="opacity-15">
                <div className="p-2 w-10 h-10 rounded bg-stone-950/60 border border-stone-900 text-stone-500 mb-3 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="font-mono text-[9px] tracking-widest text-stone-600 uppercase block mb-0.5">
                  Network Play
                </span>
                <h3 className="font-cinzel text-lg font-bold tracking-wider text-stone-400 mb-2">
                  Online Match
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed font-sans">
                  Connect through the celestial servers to search for worthy commanders across the digital lands. Claim rating and climb the leaderboards.
                </p>
              </div>

              <div className="mt-6 pt-2.5 border-t border-stone-900 opacity-15 flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider text-stone-600 uppercase">
                  Format: Matchmaking
                </span>
                <span className="text-[9px] font-cinzel tracking-[0.15em] text-stone-600 uppercase">
                  Unavailable
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button - Space-optimized */}
        <div className="mt-6 md:mt-8 flex justify-center">
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
