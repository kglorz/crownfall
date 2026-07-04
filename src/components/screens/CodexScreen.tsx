import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenState, PieceColor, PieceType } from '../../types';
import { Button } from '../ui/Button';
import { getPieceDetails, PIECE_RANGES } from '../../lib/game/pieceDetails';
import { PieceIcon } from '../game/PieceIcon';
import { Sword, Heart, ArrowLeft, Target, Navigation } from 'lucide-react';
import { PIECE_STATS } from '../../lib/game/core';

export function getPieceClass(type: PieceType | 'KING_LAST_STAND'): string {
  if (type === 'KING' || type === 'QUEEN' || type === 'KING_LAST_STAND') return 'Royal';
  if (type === 'BISHOP' || type === 'ROOK' || type === 'KNIGHT') return 'Champion';
  return 'Infantry';
}

interface CodexScreenProps {
  setScreen: (screen: ScreenState) => void;
}

type TabType = 'KINGS_COURT' | 'MECHANICS' | 'GLOSSARY';
type CodexPieceType = PieceType | 'KING_LAST_STAND';

const PIECE_TYPES: CodexPieceType[] = ['KING', 'QUEEN', 'ROOK', 'BISHOP', 'KNIGHT', 'PAWN', 'ROYAL_GUARD'];

const PIECE_STORIES: Record<CodexPieceType, string> = {
  KING: "The heart of the kingdom. Bearing the weight of the crown, the King's survival dictates the fate of the realm. A Sovereign whose presence inspires and whose fall brings the end.",
  KING_LAST_STAND: "Pushed to the absolute brink, the Sovereign refuses to fall. Adrenaline and desperation fuel a final, devastating surge of power. The true wrath of the crown is unleashed.",
  QUEEN: "The kingdom's most potent force. Wielding absolute authority and magical prowess, the Queen dominates the battlefield. Her cold charm can turn foes into allies.",
  ROOK: "The impenetrable bastion. A walking fortress that shields the vulnerable and crushes the weak. The Rook is the ultimate defender, standing firm against the fiercest assaults.",
  BISHOP: "The spiritual guide. Channeling divine power, the Bishop heals the wounded and smites the wicked. Their faith brings miracles to the battlefield.",
  KNIGHT: "The vanguard of the assault. Leaping over the front lines, the Knight strikes where least expected. Their relentless pursuit marks the end for many.",
  PAWN: "The loyal foot soldier. Though individually weak, their strength lies in numbers and resolve. A Soldier who survives the front lines may become a legend.",
  ROYAL_GUARD: "The King's personal protector. Bound by duty, the Guard sacrifices everything to ensure the Sovereign's safety. Their bulwark is unbreakable."
};

const GLOSSARY_TERMS = {
  'Buffs': [
    { term: 'Shielded', def: 'Negates the next instance of incoming damage, then is removed.' },
    { term: 'Armored', def: 'Reduces all incoming damage by a flat amount.' },
    { term: 'Guarded', def: 'Redirects damage to a guarding ally.' },
    { term: 'Empowered', def: 'Increases Attack Power by a flat amount.' },
    { term: 'Haste', def: 'Improves movement capabilities.' }
  ],
  'Debuffs': [
    { term: 'Frozen', def: 'Cannot move, attack, or use abilities for a set duration.' },
    { term: 'Charmed', def: 'Control of the piece temporarily transfers to the opponent.' },
    { term: 'Suppressed', def: 'Cannot use active abilities or supers.' },
    { term: 'Marked', def: 'A special condition applied by the Knight, granting bonuses when damaged again.' }
  ],
  'Neutral': [
    { term: 'Guarding', def: 'Receives damage redirected from guarded allies.' }
  ],
  'Resources': [
    { term: 'Valor', def: 'Gained by Royals and Champions by performing specific actions. Maximum 7. Used to unleash Super actions.' },
    { term: 'Resolve', def: 'Gained by Infantry (Soldiers and Guards) by performing specific actions. Maximum 5. Grants permanent stat bonuses.' },
    { term: 'Action Points (AP)', def: 'Used to perform actions during a turn. Moving or attacking costs 1 AP. Using abilities may cost AP depending on the specific rules.' }
  ],
  'Mechanics': [
    { term: 'Splash Damage', def: 'Damage applied to adjacent pieces when a specific ability hits a target.' },
    { term: 'Promotion', def: 'When a Soldier reaches the opponent\'s back rank, it promotes to an Iron Bastion (Rook).' },
    { term: 'Line of Sight', def: 'A clear path (orthogonal or diagonal) from the source to the target, unblocked by any pieces.' }
  ]
};

export function CodexScreen({ setScreen }: CodexScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('KINGS_COURT');
  const [colorToggle, setColorToggle] = useState<PieceColor>('WHITE');
  const [selectedPiece, setSelectedPiece] = useState<CodexPieceType>('KING');

  const details = getPieceDetails(selectedPiece);
  const story = PIECE_STORIES[selectedPiece];
  
  const baseType = selectedPiece === 'KING_LAST_STAND' ? 'KING' : selectedPiece;
  const stats = PIECE_STATS[baseType];
  const hp = stats.hp;
  const atk = selectedPiece === 'KING_LAST_STAND' ? stats.atk + 6 : stats.atk;
  const ranges = PIECE_RANGES[selectedPiece];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen relative p-8 max-w-6xl mx-auto w-full"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-cinzel text-4xl text-stone-200 tracking-widest uppercase">Codex</h1>
        <Button variant="ghost" onClick={() => setScreen('MAIN_MENU')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-stone-800 pb-4">
        <button 
          onClick={() => setActiveTab('KINGS_COURT')}
          className={`font-cinzel tracking-widest uppercase text-sm px-4 py-2 transition-colors ${activeTab === 'KINGS_COURT' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-stone-500 hover:text-stone-300'}`}
        >
          King's Court
        </button>
        <button 
          onClick={() => setActiveTab('MECHANICS')}
          className={`font-cinzel tracking-widest uppercase text-sm px-4 py-2 transition-colors ${activeTab === 'MECHANICS' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-stone-500 hover:text-stone-300'}`}
        >
          Game Mechanics
        </button>
        <button 
          onClick={() => setActiveTab('GLOSSARY')}
          className={`font-cinzel tracking-widest uppercase text-sm px-4 py-2 transition-colors ${activeTab === 'GLOSSARY' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-stone-500 hover:text-stone-300'}`}
        >
          Glossary
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'KINGS_COURT' && (
            <motion.div
              key="kings-court"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex h-full gap-8"
            >
              {/* Left Column: Piece List */}
              <div className="w-64 flex flex-col gap-4">
                <div className="flex bg-stone-900 border border-stone-800 rounded-sm p-1">
                  <button 
                    onClick={() => setColorToggle('WHITE')}
                    className={`flex-1 text-[10px] tracking-widest uppercase font-cinzel py-2 rounded-sm transition-colors ${colorToggle === 'WHITE' ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-400'}`}
                  >
                    White
                  </button>
                  <button 
                    onClick={() => setColorToggle('BLACK')}
                    className={`flex-1 text-[10px] tracking-widest uppercase font-cinzel py-2 rounded-sm transition-colors ${colorToggle === 'BLACK' ? 'bg-stone-800 text-stone-200' : 'text-stone-500 hover:text-stone-400'}`}
                  >
                    Black
                  </button>
                </div>
                
                <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar-red pr-2 pb-8">
                  {PIECE_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedPiece(type)}
                      className={`flex items-center gap-3 p-3 border rounded-sm transition-all text-left ${(selectedPiece === type || (selectedPiece === 'KING_LAST_STAND' && type === 'KING')) ? 'bg-stone-900 border-gold-700/50' : 'bg-stone-950 border-stone-800 hover:border-stone-700 hover:bg-stone-900/50'}`}
                    >
                      <div className="w-8 h-8">
                        <PieceIcon 
                          type={type === 'KING_LAST_STAND' ? 'KING' : type} 
                          color={colorToggle} 
                          isLastStand={type === 'KING_LAST_STAND'}
                        />
                      </div>
                      <span className={`font-cinzel text-xs tracking-widest uppercase ${(selectedPiece === type || (selectedPiece === 'KING_LAST_STAND' && type === 'KING')) ? 'text-gold-500' : 'text-stone-400'}`}>
                        {getPieceDetails(type).title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Piece Details */}
              <div className="flex-1 bg-stone-900/50 border border-stone-800 rounded-sm p-8 overflow-y-auto custom-scrollbar-red pb-16">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex items-stretch gap-8">
                    <div className="aspect-square flex-shrink-0 flex items-center justify-center bg-stone-950/50 border border-stone-800 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-800/20 to-transparent pointer-events-none" />
                      <div className="w-[70%] h-[70%] group-hover:scale-110 transition-transform duration-500">
                        <PieceIcon 
                          type={selectedPiece === 'KING_LAST_STAND' ? 'KING' : selectedPiece} 
                          color={colorToggle} 
                          isLastStand={selectedPiece === 'KING_LAST_STAND'}
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h2 className="font-cinzel text-4xl text-stone-200 tracking-widest mb-1 uppercase drop-shadow-sm">{details.title}</h2>
                      <div className="flex gap-3 items-center mb-6">
                        <span className="font-cinzel text-xs text-amber-500 tracking-widest uppercase px-3 py-1 bg-stone-950 border border-stone-800 rounded shadow-sm">
                          Class: {getPieceClass(selectedPiece)}
                        </span>
                        {(selectedPiece === 'KING' || selectedPiece === 'KING_LAST_STAND') && (
                          <button 
                            onClick={() => setSelectedPiece(selectedPiece === 'KING' ? 'KING_LAST_STAND' : 'KING')}
                            className="font-cinzel text-xs tracking-widest uppercase px-3 py-1 bg-blood-900/40 text-blood-400 border border-blood-800 rounded shadow-sm hover:bg-blood-900/60 transition-all hover:shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                          >
                            {selectedPiece === 'KING' ? 'View Last Stand Form' : 'View Base Form'}
                          </button>
                        )}
                      </div>
                      
                      {/* RPG Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-stone-950/80 border border-stone-800 rounded p-3 flex items-center gap-3 shadow-inner">
                          <div className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-900 flex items-center justify-center text-emerald-500">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[9px] text-stone-500 uppercase tracking-widest font-cinzel">Health</div>
                            <div className="text-lg text-emerald-400 font-mono leading-none mt-0.5">{hp}</div>
                          </div>
                        </div>
                        
                        <div className="bg-stone-950/80 border border-stone-800 rounded p-3 flex items-center gap-3 shadow-inner">
                          <div className="w-8 h-8 rounded-full bg-blood-950/50 border border-blood-900 flex items-center justify-center text-blood-500">
                            <Sword className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[9px] text-stone-500 uppercase tracking-widest font-cinzel">Attack</div>
                            <div className="text-lg text-blood-400 font-mono leading-none mt-0.5">{atk}</div>
                          </div>
                        </div>

                        <div className="bg-stone-950/80 border border-stone-800 rounded p-3 flex items-center gap-3 shadow-inner">
                          <div className="w-8 h-8 rounded-full bg-blue-950/50 border border-blue-900 flex items-center justify-center text-blue-500">
                            <Navigation className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[9px] text-stone-500 uppercase tracking-widest font-cinzel">Movement</div>
                            <div className="text-xs text-blue-400 font-sans leading-tight mt-0.5">{ranges.move}</div>
                          </div>
                        </div>

                        <div className="bg-stone-950/80 border border-stone-800 rounded p-3 flex items-center gap-3 shadow-inner">
                          <div className="w-8 h-8 rounded-full bg-amber-950/50 border border-amber-900 flex items-center justify-center text-amber-500">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[9px] text-stone-500 uppercase tracking-widest font-cinzel">Attack Range</div>
                            <div className="text-xs text-amber-400 font-sans leading-tight mt-0.5">{ranges.attack}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-950/40 border-l-2 border-stone-700 p-4 rounded-r-sm w-full">
                    <p className="text-sm text-stone-300 font-sans leading-relaxed italic drop-shadow-sm">"{story}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-6">
                    <h4 className="font-cinzel text-sm tracking-widest text-gold-500 uppercase border-b border-stone-800 pb-2">Abilities</h4>
                    {details.active && (
                      <div className="bg-stone-950/50 border border-stone-800/50 p-4 rounded-sm">
                         <div className="flex justify-between items-center mb-2">
                           <h5 className="font-cinzel tracking-widest text-stone-200 text-sm uppercase">{details.active.name}</h5>
                           <span className="text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded tracking-widest uppercase">Active</span>
                         </div>
                         <p className="text-xs text-stone-400 leading-relaxed font-sans">{details.active.description}</p>
                         <div className="text-[10px] text-stone-500 uppercase tracking-widest mt-2 font-cinzel">Cooldown: {details.active.cooldown} turns</div>
                      </div>
                    )}
                    {details.superAction && (
                      <div className="bg-stone-950/50 border border-stone-800/50 p-4 rounded-sm">
                         <div className="flex justify-between items-center mb-2">
                           <h5 className="font-cinzel tracking-widest text-stone-200 text-sm uppercase">{details.superAction.name}</h5>
                           <span className="text-[9px] bg-gold-900/40 text-gold-500 border border-gold-900 px-1.5 py-0.5 rounded tracking-widest uppercase">{details.superAction.type}</span>
                         </div>
                         <p className="text-xs text-stone-400 leading-relaxed font-sans">{details.superAction.description}</p>
                         {details.superAction.conditions && (
                           <div className="mt-3">
                             <div className="text-[10px] tracking-widest uppercase text-stone-500 font-cinzel mb-1">Earn Conditions</div>
                             <ul className="list-disc list-inside text-[10px] text-stone-400 font-sans">
                               {details.superAction.conditions.map((cond, i) => <li key={i}>{cond}</li>)}
                             </ul>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <h4 className="font-cinzel text-sm tracking-widest text-gold-500 uppercase border-b border-stone-800 pb-2">Passives</h4>
                    {details.passives ? details.passives.map((passive, idx) => (
                      <div key={idx} className="bg-stone-950/50 border border-stone-800/50 p-4 rounded-sm">
                         <div className="flex justify-between items-center mb-2">
                           <h5 className="font-cinzel tracking-widest text-stone-200 text-sm uppercase">{passive.name}</h5>
                           <span className="text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded tracking-widest uppercase">Passive</span>
                         </div>
                         <p className="text-xs text-stone-400 leading-relaxed font-sans">{passive.description}</p>
                         {passive.cooldown !== undefined && (
                           <div className="text-[10px] text-stone-500 uppercase tracking-widest mt-2 font-cinzel">Cooldown: {passive.cooldown} turns</div>
                         )}
                      </div>
                    )) : (
                      <p className="text-xs text-stone-500 italic">No passive abilities.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'MECHANICS' && (
            <motion.div
              key="mechanics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto custom-scrollbar-red bg-stone-900/50 border border-stone-800 rounded-sm p-8 pb-16"
            >
              <h2 className="font-cinzel text-2xl text-stone-200 tracking-wider mb-6 uppercase">How to Play</h2>
              <div className="space-y-8 font-sans text-stone-400 text-sm leading-relaxed max-w-4xl">
                <section>
                  <h3 className="font-cinzel text-lg text-gold-500 mb-2 uppercase tracking-widest">Turn Structure</h3>
                  <p>Crownfall is a turn-based tactical game where players alternate taking turns. On your turn, you have one primary action: you can either move a piece OR attack an enemy piece. Some pieces have abilities that can be used instead of a standard action.</p>
                </section>
                
                <section>
                  <h3 className="font-cinzel text-lg text-gold-500 mb-2 uppercase tracking-widest">Victory Condition</h3>
                  <p>The objective is to defeat the opponent's King. The game ends immediately when a King's Health (HP) reaches 0 and they do not have any effects (like Unyielding) that would prevent their defeat.</p>
                </section>

                <section>
                  <h3 className="font-cinzel text-lg text-gold-500 mb-2 uppercase tracking-widest">Combat</h3>
                  <p>When attacking, a piece deals its ATK value as damage to the target's HP. Damage can be mitigated by effects such as Shielded, Armored, or Guarded. If a piece's HP reaches 0, it is defeated and removed from the board.</p>
                </section>
                
                <section>
                  <h3 className="font-cinzel text-lg text-gold-500 mb-2 uppercase tracking-widest">Action Range</h3>
                  <p>Pieces move and attack similar to traditional chess, but with constrained ranges. For example, a King or Queen can move in any direction but only up to 2 tiles. Rooks and Bishops can move further in straight lines or diagonals. Ensure you check each piece's specific movement and attack capabilities in the King's Court.</p>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'GLOSSARY' && (() => {
            const getCategoryStyles = (cat: string) => {
              if (cat === 'Buffs') {
                return {
                  header: 'text-emerald-500 border-emerald-950',
                  item: 'border-emerald-950 bg-emerald-950/10 hover:border-emerald-800/30 text-stone-200',
                  badge: 'border-emerald-800 text-emerald-400 bg-emerald-950/40',
                  label: 'BUFF'
                };
              }
              if (cat === 'Debuffs') {
                return {
                  header: 'text-red-500 border-red-950',
                  item: 'border-red-950 bg-red-950/10 hover:border-red-900/30 text-stone-200',
                  badge: 'border-red-800 text-red-400 bg-red-950/40',
                  label: 'DEBUFF'
                };
              }
              if (cat === 'Neutral') {
                return {
                  header: 'text-stone-400 border-stone-850',
                  item: 'border-stone-800/40 bg-stone-950/50 hover:border-stone-700/30 text-stone-300',
                  badge: 'border-stone-700 text-stone-400 bg-stone-800/40',
                  label: 'NEUTRAL'
                };
              }
              return {
                header: 'text-gold-500 border-stone-800',
                item: 'border-stone-800/30 bg-stone-950/50 hover:border-stone-700/20 text-stone-200',
                badge: 'border-stone-800 text-stone-400 bg-stone-900/40',
                label: cat
              };
            };

            return (
              <motion.div
                key="glossary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full overflow-y-auto custom-scrollbar-red bg-stone-900/50 border border-stone-800 rounded-sm p-8 pb-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {Object.entries(GLOSSARY_TERMS).map(([category, terms]) => {
                    const styles = getCategoryStyles(category);
                    return (
                      <div key={category}>
                        <h3 className={`font-cinzel text-xl tracking-widest uppercase border-b pb-2 mb-4 flex justify-between items-center ${styles.header}`}>
                          <span>{category}</span>
                          {(category === 'Buffs' || category === 'Debuffs' || category === 'Neutral') && (
                            <span className={`text-[9px] font-cinzel font-bold tracking-widest uppercase px-2 py-0.5 border rounded-sm ${styles.badge}`}>
                              {styles.label}
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-col gap-4">
                          {terms.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-sm border transition-colors ${styles.item}`}>
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-cinzel text-sm text-stone-200 tracking-wider">{item.term}</h4>
                                {(category !== 'Buffs' && category !== 'Debuffs' && category !== 'Neutral') && (
                                  <span className={`text-[8px] font-cinzel tracking-widest uppercase px-1.5 py-0.5 border rounded-sm ${styles.badge}`}>
                                    {styles.label}
                                  </span>
                                )}
                              </div>
                              <p className="font-sans text-xs text-stone-400 leading-relaxed">{item.def}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
