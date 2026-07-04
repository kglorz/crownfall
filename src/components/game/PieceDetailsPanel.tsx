import { Heart, Sword, Navigation, Target } from 'lucide-react';
import { GameState, Piece } from '../../types';
import { getPieceDetails, PIECE_RANGES } from '../../lib/game/pieceDetails';
import { PieceIcon } from './PieceIcon';
import { getPieceClass } from '../screens/CodexScreen';
import { getValidAbilityTargets, getValidSuperTargets } from '../../lib/game/engine';

interface PieceDetailsPanelProps {
  piece: Piece | null;
  activeActionType?: 'MOVE' | 'ATTACK' | 'ABILITY' | 'SUPER' | null;
  onActionSelect?: (type: 'ABILITY' | 'SUPER') => void;
  isEnemy?: boolean;
  gameState?: GameState | null;
}

export function PieceDetailsPanel({ piece, activeActionType, onActionSelect, isEnemy = false, gameState = null }: PieceDetailsPanelProps) {
  if (!piece) {
    return (
      <div className="w-full h-full border border-stone-800 rounded-sm bg-stone-900/50 flex flex-col font-cinzel">
        <div className="px-4 py-3 border-b border-stone-800 bg-stone-900 uppercase tracking-widest text-sm text-stone-300">
          Codex
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="text-stone-500 uppercase tracking-widest text-sm">No Piece Selected</div>
        </div>
      </div>
    );
  }

  const isLastStand = piece.type === 'KING' && piece.conditions.haste && piece.conditions.empowered >= 6;
  const details = getPieceDetails(isLastStand ? 'KING_LAST_STAND' : piece.type);
  const isWhite = piece.color === 'WHITE';
  
  const isInfantry = piece.type === 'PAWN' || piece.type === 'ROYAL_GUARD';
  const maxProgression = isInfantry ? 5 : 7;
  const currentProgression = isInfantry ? piece.resolve : piece.valor;
  const progressionName = isInfantry ? 'Resolve' : 'Valor';
  
  const ranges = PIECE_RANGES[isLastStand ? 'KING_LAST_STAND' : piece.type];

  // Find position
  let pieceRow = -1;
  let pieceCol = -1;
  if (gameState) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (gameState.board[r][c]?.id === piece.id) {
          pieceRow = r;
          pieceCol = c;
          break;
        }
      }
      if (pieceRow !== -1) break;
    }
  }

  // Calculate Lock status
  let abilityLockReason: string | null = null;
  if (piece.conditions.frozen > 0) {
    abilityLockReason = "Frozen";
  } else if (piece.conditions.suppressed) {
    abilityLockReason = "Suppressed";
  } else if (gameState && pieceRow !== -1) {
    const targets = getValidAbilityTargets(gameState, pieceRow, pieceCol, true);
    if (targets.length === 0) {
      if (piece.type === 'KING') {
        let rgCount = 0;
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            const p = gameState.board[tr][tc];
            if (p && p.type === 'ROYAL_GUARD' && p.color === piece.color) rgCount++;
          }
        }
        if (rgCount >= 2) {
          abilityLockReason = "Max Guards active";
        } else {
          abilityLockReason = "No empty adjacent spaces";
        }
      } else if (piece.type === 'QUEEN') {
        abilityLockReason = "No enemies in line of sight";
      } else if (piece.type === 'ROOK') {
        abilityLockReason = "No allies in range";
      } else if (piece.type === 'BISHOP') {
        abilityLockReason = "No allies to heal or enemies in line of sight";
      } else if (piece.type === 'KNIGHT') {
        abilityLockReason = "No landing spaces";
      } else {
        abilityLockReason = "No targets in range";
      }
    }
  }

  let superLockReason: string | null = null;
  if (piece.conditions.frozen > 0) {
    superLockReason = "Frozen";
  } else if (piece.conditions.suppressed) {
    superLockReason = "Suppressed";
  } else if (gameState && pieceRow !== -1) {
    const targets = getValidSuperTargets(gameState, pieceRow, pieceCol, true);
    if (targets.length === 0) {
      if (piece.type === 'QUEEN') {
        superLockReason = "No enemies in line of sight";
      } else if (piece.type === 'BISHOP') {
        const deadCount = gameState.graveyard[piece.color].filter(t => t !== 'KING' && t !== 'ROYAL_GUARD').length;
        if (deadCount === 0) {
          superLockReason = "No eligible dead allies";
        } else {
          superLockReason = "Back rank fully blocked";
        }
      } else if (piece.type === 'KNIGHT') {
        superLockReason = "No enemies in range";
      } else {
        superLockReason = "No targets in range";
      }
    }
  }

  // Dynamic status check for adjacent Royal Guard / allied King
  let isAdjacentToRoyalGuard = false;
  if (gameState && piece.type === 'KING' && pieceRow !== -1) {
    const dirs = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
    for (const [dr, dc] of dirs) {
      const nr = pieceRow + dr, nc = pieceCol + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const rg = gameState.board[nr][nc];
        if (rg && rg.color === piece.color && rg.type === 'ROYAL_GUARD') {
          isAdjacentToRoyalGuard = true;
          break;
        }
      }
    }
  }

  let isGuardingKing = false;
  if (gameState && piece.type === 'ROYAL_GUARD' && pieceRow !== -1) {
    const dirs = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
    for (const [dr, dc] of dirs) {
      const nr = pieceRow + dr, nc = pieceCol + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const k = gameState.board[nr][nc];
        if (k && k.color === piece.color && k.type === 'KING') {
          isGuardingKing = true;
          break;
        }
      }
    }
  }

  return (
    <div className="w-full h-full border border-stone-800 rounded-sm bg-stone-900/50 flex flex-col font-cinzel overflow-hidden">
      {/* Header Panel like Chronicler */}
      <div className="px-4 py-3 border-b border-stone-800 bg-stone-900 uppercase tracking-widest text-sm text-stone-300 flex-shrink-0">
        Codex
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar font-sans min-h-0">
        {/* Header & Stats Compact */}
      <div className="p-4 border-b border-stone-800 flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-stone-950/40 p-3 rounded-sm border border-stone-800/50">
          <div className="w-12 h-12 flex-shrink-0">
            <PieceIcon type={piece.type} color={piece.color} isSuperReady={(!isInfantry && piece.valor === 7) || (isInfantry && piece.resolve === 5)} isLastStand={isLastStand} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-cinzel text-lg text-stone-200 tracking-wider flex items-center gap-3">
              {details.title}
              <span className="font-cinzel text-[9px] text-amber-500/80 tracking-widest uppercase px-1.5 py-0.5 bg-stone-950 border border-stone-800 rounded whitespace-nowrap">
                {getPieceClass(piece.type)}
              </span>
            </h2>
            <h3 className="font-cinzel text-[10px] text-stone-500 tracking-widest uppercase mt-1">
              {!isEnemy ? 'Ally' : 'Enemy'} • {isWhite ? 'White Kingdom' : 'Black Kingdom'}
            </h3>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-[2] bg-stone-950 border border-stone-800 rounded-sm p-3 flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-900">
              <div 
                className={`h-full transition-all duration-300 ${piece.conditions.shielded ? 'bg-blue-500' : (isEnemy ? 'bg-blood-500' : 'bg-emerald-600')}`} 
                style={{ width: `${piece.conditions.shielded ? 100 : (piece.hp / piece.maxHp) * 100}%` }} 
              />
            </div>
            <div className="flex justify-between items-end mb-1">
               <div className="text-[10px] tracking-widest uppercase text-stone-500 font-cinzel flex items-center gap-1.5">
                 <Heart className="w-3 h-3 text-stone-500" /> Health
               </div>
               <div className={`font-mono text-lg leading-none ${isEnemy ? 'text-blood-500' : 'text-emerald-500'}`}>
                 {piece.hp}<span className="text-xs text-stone-600">/{piece.maxHp}</span>
               </div>
            </div>
          </div>
          <div className="flex-1 bg-stone-950 border border-stone-800 rounded-sm p-3 flex flex-col justify-between">
            <div className="text-[10px] tracking-widest uppercase text-stone-500 font-cinzel flex items-center justify-center gap-1.5">
              <Sword className="w-3 h-3 text-stone-500" /> ATK
            </div>
            <div className={`font-mono text-lg leading-none text-center mt-1 ${piece.conditions.empowered > 0 ? 'text-blood-500' : 'text-stone-200'}`}>
              {piece.atk + piece.conditions.empowered}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-stone-950 border border-stone-800 rounded-sm p-3 flex flex-col justify-between">
            <div className="text-[10px] tracking-widest uppercase text-stone-500 font-cinzel flex items-center justify-center gap-1.5">
              <Navigation className="w-3 h-3 text-stone-500" /> Move Range
            </div>
            <div className="font-sans text-[11px] text-blue-400 text-center leading-tight mt-1">{ranges.move}</div>
          </div>
          <div className="flex-1 bg-stone-950 border border-stone-800 rounded-sm p-3 flex flex-col justify-between">
            <div className="text-[10px] tracking-widest uppercase text-stone-500 font-cinzel flex items-center justify-center gap-1.5">
              <Target className="w-3 h-3 text-stone-500" /> Attack Range
            </div>
            <div className="font-sans text-[11px] text-amber-400 text-center leading-tight mt-1">{ranges.attack}</div>
          </div>
        </div>
      </div>

      {/* Abilities & Progression */}
      <div className="p-6 flex flex-col gap-6">
        <h3 className="font-cinzel text-sm tracking-widest text-gold-500 uppercase border-b border-stone-800 pb-2">Abilities</h3>
        
        {/* Active Ability */}
        {details.active && (
          <button
            onClick={() => onActionSelect?.('ABILITY')}
            disabled={!onActionSelect || piece.cooldowns.ability > 0 || !!abilityLockReason}
            className={`group flex flex-col gap-2 text-left w-full ${activeActionType === 'ABILITY' ? 'bg-stone-800/80 border-stone-600' : 'bg-stone-950/50 hover:bg-stone-800/50 border-stone-800/50 hover:border-stone-700'} border p-3 rounded-sm transition-colors disabled:opacity-60 disabled:hover:bg-stone-950/50 disabled:cursor-not-allowed`}
          >
            <div className="flex justify-between items-center w-full">
              <h4 className={`font-cinzel tracking-widest text-sm uppercase transition-colors ${activeActionType === 'ABILITY' ? 'text-gold-400' : 'text-stone-200 group-hover:text-gold-400'}`}>{details.active.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded tracking-widest uppercase">Active</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">{details.active.description}</p>
            <div className="flex justify-between items-center mt-1 w-full">
              {details.active.cooldown !== undefined ? (
                <div className="text-[10px] text-stone-500 uppercase tracking-widest font-cinzel">
                  {piece.cooldowns.ability > 0 ? `Ready in: ${piece.cooldowns.ability} turns` : `Cooldown: ${details.active.cooldown} turns`}
                </div>
              ) : (
                <div />
              )}
              {abilityLockReason && (
                <span className="text-[8px] bg-red-950/60 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded tracking-widest uppercase flex items-center gap-1 font-mono">
                  <span>🔒</span> {abilityLockReason}
                </span>
              )}
            </div>
          </button>
        )}

        {/* Resolve Progression (Infantry only) */}
        {isInfantry && (
            <div className={`flex flex-col gap-3 mt-2 text-left w-full bg-stone-950/30 p-3 rounded-sm transition-all duration-300 ${currentProgression >= maxProgression ? 'border animate-flame-pulse border-blood-500' : 'border border-stone-800/30'}`}>
              <div className="flex justify-between items-center w-full">
                <h4 className="font-cinzel tracking-widest text-stone-200 text-sm uppercase">Resolve Progression</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase ${currentProgression >= maxProgression ? 'bg-blood-900/40 text-blood-500 border border-blood-900' : 'bg-stone-800 text-stone-400 border border-stone-700'}`}>Progression</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                {piece.type === 'PAWN' ? 'Soldiers' : 'Guards'} gain permanent stat bonuses based on Resolve (up to 5), unlocking +1 ATK, +1 HP, +1 ATK, and Unyielding (survive fatal damage at 1 HP once per match).
              </p>
              
              {/* Progression Meter */}
              <div className="mt-2 w-full">
                <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-500 font-cinzel mb-2">
                  <span>{progressionName} Milestones</span>
                  <span className={`font-mono ${currentProgression >= maxProgression ? 'text-blood-400 font-bold' : 'text-stone-300'}`}>{currentProgression} / {maxProgression}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { level: 1, label: 'I', effect: '—', unlocked: currentProgression >= 1 },
                    { level: 2, label: 'II', effect: '+1 ATK', unlocked: currentProgression >= 2 },
                    { level: 3, label: 'III', effect: '+1 HP', unlocked: currentProgression >= 3 },
                    { level: 4, label: 'IV', effect: '+1 ATK', unlocked: currentProgression >= 4 },
                    { level: 5, label: 'V', effect: 'Unyielding', unlocked: currentProgression >= 5, spec: !piece.unyieldingUsed }
                  ].map((m) => (
                    <div key={m.level} className="flex flex-col items-center">
                      <div 
                        className={`h-2 w-full rounded-sm border transition-all duration-300 ${
                          m.unlocked 
                            ? (m.level === 5 && m.spec ? 'bg-blood-500 border-blood-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-blood-600 border-blood-800') 
                            : 'bg-stone-900 border-stone-800/60'
                        }`} 
                      />
                      <span className={`text-[8px] font-mono mt-1 ${m.unlocked ? 'text-stone-300 font-semibold' : 'text-stone-600'}`}>
                        Lvl {m.level}
                      </span>
                      <span className={`text-[8px] text-center font-cinzel tracking-tight mt-0.5 leading-none px-0.5 py-0.5 rounded ${
                        m.unlocked 
                          ? (m.level === 5 && !m.spec ? 'text-stone-500 line-through' : 'text-gold-500/90 font-medium') 
                          : 'text-stone-600'
                      }`}>
                        {m.effect}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earn Conditions */}
              <div className="flex flex-wrap gap-2 mt-2">
                {['Defeat an enemy', 'Survive taking damage', piece.type === 'PAWN' ? 'Reach 4th/2nd rank from enemy back rank' : 'Prevent immediate attack against King'].map((cond, i) => (
                  <div 
                    key={i} 
                    title={cond}
                    className="bg-stone-900/80 border border-stone-800 px-2 py-1 rounded-sm text-[8px] text-stone-500 text-center leading-tight font-cinzel uppercase tracking-wider"
                  >
                    {cond}
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Super (Non-Infantry) */}
        {!isInfantry && details.superAction && (
            <button
              onClick={() => onActionSelect?.('SUPER')}
              disabled={!onActionSelect || currentProgression < maxProgression || !!superLockReason}
              className={`group flex flex-col gap-3 mt-2 text-left w-full border p-3 rounded-sm transition-all duration-300 disabled:opacity-60 disabled:hover:bg-stone-950/50 disabled:cursor-not-allowed ${
                currentProgression >= maxProgression 
                  ? (activeActionType === 'SUPER' ? 'bg-blood-900/20 animate-flame-pulse border-blood-500' : 'bg-stone-950/50 hover:bg-stone-900/50 animate-flame-pulse border-blood-500')
                  : (activeActionType === 'SUPER' ? 'bg-gold-900/20 border-gold-700/50' : 'bg-stone-950/50 hover:bg-stone-800/50 border-stone-800/50 hover:border-stone-700')
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <h4 className={`font-cinzel tracking-widest text-sm uppercase transition-colors ${
                  currentProgression >= maxProgression 
                    ? 'text-blood-400 group-hover:text-blood-300' 
                    : (activeActionType === 'SUPER' ? 'text-gold-400' : 'text-stone-200 group-hover:text-gold-400')
                }`}>{details.superAction.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase ${
                    currentProgression >= maxProgression 
                      ? 'bg-blood-900/40 text-blood-500 border border-blood-900' 
                      : 'bg-gold-900/40 text-gold-500 border border-gold-900'
                  }`}>Super</span>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">{details.superAction.description}</p>
              
              {/* Progression Meter */}
              <div className="mt-2 w-full">
                <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-500 font-cinzel mb-1">
                  <span>{progressionName} Meter</span>
                  <span className={`font-mono ${currentProgression >= maxProgression ? 'text-blood-400' : 'text-blood-500'}`}>{currentProgression} / {maxProgression}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: maxProgression }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-sm border ${currentProgression >= maxProgression ? 'border-blood-700' : 'border-stone-800'} ${
                        i < currentProgression ? 'bg-blood-500' : 'bg-stone-900'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Earn Conditions */}
              {details.superAction.conditions && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {details.superAction.conditions.map((cond, i) => (
                    <div 
                      key={i} 
                      title={cond}
                      className="bg-stone-900/80 border border-stone-800 px-2 py-1 rounded-sm text-[8px] text-stone-500 text-center leading-tight font-cinzel uppercase tracking-wider"
                    >
                      {cond}
                    </div>
                  ))}
                </div>
              )}

              {superLockReason && currentProgression >= maxProgression && (
                <div className="flex justify-end mt-2 w-full border-t border-stone-800/35 pt-2">
                  <span className="text-[8px] bg-red-950/60 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded tracking-widest uppercase flex items-center gap-1 font-mono">
                    <span>🔒</span> {superLockReason}
                  </span>
                </div>
              )}
            </button>
        )}

        {/* Passives */}
        {details.passives && [...details.passives, ...(isInfantry && currentProgression >= maxProgression ? [{
          name: 'Unyielding',
          type: 'PASSIVE',
          description: piece.unyieldingUsed ? 'This piece has survived fatal damage and its Unyielding passive has been consumed.' : 'When this piece would be defeated, it survives with 1 HP instead. This can only happen once per match.',
          consumed: piece.unyieldingUsed
        }] : [])].map((passive: any, idx: number) => {
          const isLastStandPassive = isLastStand && passive.name === 'Last Stand (Active)';
          return (
          <div key={idx} className={`flex flex-col gap-2 mt-2 border-t pt-6 ${passive.consumed ? 'opacity-50' : ''} ${isLastStandPassive ? 'border-blood-500/50 bg-blood-950/20 -mx-6 px-6 pb-6 animate-flame-pulse' : 'border-stone-800/50'}`}>
            <div className="flex justify-between items-center">
              <h4 className={`font-cinzel tracking-widest text-sm uppercase ${passive.consumed ? 'text-stone-500 line-through' : (isLastStandPassive ? 'text-blood-400' : 'text-stone-200')}`}>{passive.name}</h4>
              <span className={`text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase ${passive.consumed ? 'bg-stone-900 text-stone-600 border border-stone-800' : (isLastStandPassive ? 'bg-blood-900/40 text-blood-500 border border-blood-900' : 'bg-stone-800 text-stone-400 border border-stone-700')}`}>Passive</span>
            </div>
            <p className={`text-xs leading-relaxed font-sans ${isLastStandPassive ? 'text-stone-300' : 'text-stone-400'}`}>{passive.description}</p>
            {passive.cooldown !== undefined && (
              <div className="text-[10px] text-stone-500 uppercase tracking-widest mt-1 font-cinzel">Cooldown: {passive.cooldown} turns</div>
            )}
          </div>
          );
        })}

        {/* Status Effects */}
        <div className="flex flex-col gap-2 mt-2 border-t border-stone-800/50 pt-6">
          <h4 className="font-cinzel tracking-widest text-stone-500 text-[10px] uppercase">Active Status Effects</h4>
          <div className="flex flex-wrap gap-2">
            {(() => {
              interface ActiveEffect {
                name: string;
                type: 'buff' | 'debuff' | 'neutral';
                value?: string | number;
              }
              const effects: ActiveEffect[] = [];
              const { conditions } = piece;

              if (conditions.shielded) {
                effects.push({ name: 'Shielded', type: 'buff' });
              }
              if (conditions.armored > 0) {
                effects.push({ name: 'Armored', type: 'buff', value: `+${conditions.armored}` });
              }
              let guardedAmount = conditions.guarded + (isAdjacentToRoyalGuard ? 1 : 0);
              if (guardedAmount > 0) {
                effects.push({ name: 'Guarded', type: 'buff', value: `x${guardedAmount}` });
              }
              
              if (conditions.empowered > 0) {
                effects.push({ name: 'Empowered', type: 'buff', value: `+${conditions.empowered}` });
              }
              if (conditions.haste) {
                effects.push({ name: 'Haste', type: 'buff' });
              }
              if (conditions.frozen > 0) {
                effects.push({ name: 'Frozen', type: 'debuff', value: `${conditions.frozen}T` });
              }
              if (conditions.charmed > 0) {
                effects.push({ name: 'Charmed', type: 'debuff', value: `${conditions.charmed}H` });
              }
              if (conditions.suppressed) {
                effects.push({ name: 'Suppressed', type: 'debuff' });
              }
              if (conditions.marked) {
                effects.push({ name: 'Marked', type: 'debuff' });
              }
              if (conditions.guarding || isGuardingKing) {
                effects.push({ name: 'Guarding', type: 'neutral' });
              }

              if (effects.length === 0) {
                return (
                  <span className="text-[10px] text-stone-600 font-mono">None</span>
                );
              }

              return effects.map((eff, i) => {
                let colorClasses = '';
                if (eff.type === 'buff') {
                  colorClasses = 'border-emerald-800/60 text-emerald-400 bg-emerald-950/30';
                } else if (eff.type === 'debuff') {
                  colorClasses = 'border-red-800/60 text-red-400 bg-red-950/30';
                } else {
                  colorClasses = 'border-stone-700/60 text-stone-400 bg-stone-850/40';
                }

                return (
                  <span
                    key={`${eff.name}-${i}`}
                    className={`border ${colorClasses} text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm flex items-center gap-1`}
                  >
                    {eff.name}
                    {eff.value !== undefined && (
                      <span className="opacity-75 font-bold text-[8px] px-1 bg-black/40 rounded-sm">
                        {eff.value}
                      </span>
                    )}
                  </span>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
