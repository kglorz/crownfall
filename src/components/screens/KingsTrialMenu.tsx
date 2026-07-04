import { motion } from 'motion/react';
import { ScreenState, GameSetup, AIDifficulty } from '../../types';
import { Button } from '../ui/Button';
import { audio } from '../../lib/audio';
import { 
  Shield, 
  Swords, 
  Flame, 
  Crown, 
  ArrowLeft, 
  Trophy
} from 'lucide-react';

interface KingsTrialMenuProps {
  setScreen: (screen: ScreenState) => void;
  startGame: (setup: GameSetup) => void;
}

interface DifficultyDetails {
  id: AIDifficulty;
  name: string;
  description: string;
  tier: string;
  rating: number;
  icon: any;
}

const difficulties: DifficultyDetails[] = [
  { 
    id: 'SQUIRE', 
    name: 'Squire', 
    tier: 'Tier I: Novice',
    rating: 1,
    description: 'Eager and more brave than skilled. Ideal for learning the battlefield.', 
    icon: Shield
  },
  { 
    id: 'KNIGHT', 
    name: 'Knight', 
    tier: 'Tier II: Elite',
    rating: 2,
    description: 'Disciplined and honor-bound. Uses sound formations and tactical counters.', 
    icon: Swords
  },
  { 
    id: 'GENERAL', 
    name: 'General', 
    tier: 'Tier III: Champion',
    rating: 3,
    description: 'A calculating commander. Ruthlessly punishes any positional mistakes.', 
    icon: Flame
  },
  { 
    id: 'SOVEREIGN', 
    name: 'Sovereign', 
    tier: 'Tier IV: Crownmaster',
    rating: 4,
    description: 'Crownbound AI that plays with masterclass tactical foresight.', 
    icon: Crown
  },
];

export function KingsTrialMenu({ setScreen, startGame }: KingsTrialMenuProps) {
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
          <div className="flex flex-col items-center mb-4 md:mb-6 relative">
            <div className="relative mb-1">
              <Trophy className="w-8 h-8 text-red-600/90 animate-pulse" />
            </div>
            <h2 className="font-cinzel text-2xl md:text-3xl text-stone-100 text-center tracking-[0.2em] uppercase font-bold drop-shadow">
              King's Trial
            </h2>
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-red-900/40 to-transparent mt-2 mb-1.5" />
            <p className="text-stone-400 text-center font-cinzel text-[10px] uppercase tracking-[0.25em]">
              Face the Crown's Illustrious Champions
            </p>
          </div>
          
          {/* Grid - Highly compact, fits on almost any resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {difficulties.map((diff) => {
              const IconComponent = diff.icon;
              return (
                <motion.div 
                  key={diff.id}
                  whileHover={{ scale: 1.01, y: -1 }}
                  className="border border-stone-800/80 hover:border-red-600/50 p-3.5 md:p-4 flex flex-col justify-between transition-all duration-300 bg-stone-900/30 hover:bg-red-950/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.06)] cursor-pointer rounded-md relative overflow-hidden group"
                  onMouseEnter={() => audio.playHover()}
                  onClick={() => { 
                    audio.playClick(); 
                    const isWhite = Math.random() < 0.5;
                    startGame({ 
                      mode: 'PVE', 
                      playerWhite: isWhite ? 'HUMAN' : diff.id, 
                      playerBlack: isWhite ? diff.id : 'HUMAN',
                      bottomColor: isWhite ? 'WHITE' : 'BLACK'
                    }); 
                  }}
                >
                  {/* Decorative faint glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] to-transparent pointer-events-none" />

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-stone-950/60 border border-stone-800/80 group-hover:border-red-600/50 group-hover:text-red-400 text-stone-400 transition-colors flex-shrink-0">
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[9px] tracking-wider text-stone-500 group-hover:text-red-500/60 uppercase truncate transition-colors">
                          {diff.tier}
                        </span>
                        {/* Stars Difficulty Rating - Always Red */}
                        <div className="flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] ${i < diff.rating ? 'text-red-500 font-bold drop-shadow-[0_0_3px_rgba(239,68,68,0.4)]' : 'text-stone-850'}`}
                            >
                              ✦
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-cinzel text-base font-bold tracking-wider text-stone-200 group-hover:text-red-400 transition-colors mb-1">
                        {diff.name}
                      </h3>
                      <p className="text-stone-400 text-xs leading-normal font-sans font-light line-clamp-2 sm:line-clamp-none group-hover:text-stone-300 transition-colors">
                        {diff.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-800/40 flex items-center justify-end">
                    <span className="text-[9px] font-cinzel tracking-[0.15em] text-stone-400 group-hover:text-red-400 group-hover:underline uppercase flex items-center gap-1 font-semibold transition-colors">
                      Accept Duel <span className="transition-transform group-hover:translate-x-0.5 duration-200">➔</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Back to Menu Button - Space-optimized */}
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
