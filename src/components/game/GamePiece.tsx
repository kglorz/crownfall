import { motion } from 'motion/react';
import { Piece } from '../../types';
import { PieceIcon } from './PieceIcon';

interface GamePieceProps {
  piece: Piece;
  isSelected: boolean;
  isEnemy?: boolean;
  isFlipped?: boolean;
}

export function GamePiece({ piece, isSelected, isEnemy = false, isFlipped = false }: GamePieceProps) {
  // HP percentage for bar
  const hpPercent = (piece.hp / piece.maxHp) * 100;
  
  // Progression (Valor for Royals/Champs, Resolve for Infantry)
  const isInfantry = piece.type === 'PAWN' || piece.type === 'ROYAL_GUARD';
  const maxProgression = isInfantry ? 5 : 7;
  const currentProgression = isInfantry ? piece.resolve : piece.valor;
  
  // Conditions
  const hasShield = piece.conditions.shielded;
  const isFrozen = piece.conditions.frozen > 0;
  const isCharmed = piece.conditions.charmed > 0;
  const isMarked = piece.conditions.marked;
  const isSuppressed = piece.conditions.suppressed;
  const isEmpowered = piece.conditions.empowered > 0;
  const hasHaste = piece.conditions.haste;
  const isBastionMode = piece.type === 'ROOK' && piece.bastionTurns !== undefined && piece.bastionTurns > 0;
  
  // Ability & Super Ready Status (for active feedback)
  const isAbilityReady = piece.cooldowns.ability === 0 && !isInfantry && !isSuppressed;
  const isSuperReady = (!isInfantry && piece.valor === 7) || (isInfantry && piece.resolve === 5);
  const isLastStand = piece.type === 'KING' && piece.conditions.haste && piece.conditions.empowered >= 6;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: isFlipped ? 180 : 0 }}
      animate={{ scale: 1, opacity: 1, rotate: isFlipped ? 180 : 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ rotate: { duration: 0.6, ease: "easeInOut" } }}
      className={`relative w-full h-full p-1.5 md:p-2 cursor-pointer rounded-full transition-shadow duration-200
        ${isSelected ? 'drop-shadow-[0_0_15px_rgba(158,27,27,0.8)]' : ''}
      `}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
    >



      {/* 4. Marked Target Overlay (Blinking circle) */}
      {isMarked && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500/95 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)] animate-pulse opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
      )}



      {/* 6. Empowered Aura (Soft burning golden flame pulse) */}
      {isEmpowered && !isLastStand && (
        <div className="absolute -inset-1 pointer-events-none z-5 rounded-full border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse" />
      )}

      {/* 7. Haste Trails (Slight green movement outlines) */}
      {hasHaste && !isLastStand && (
        <div className="absolute inset-x-0 -inset-y-0.5 pointer-events-none z-5 border-x-2 border-emerald-400/50 animate-pulse rounded-full" />
      )}





      <PieceIcon type={piece.type} color={piece.color} isSuperReady={isSuperReady} isLastStand={isLastStand} />
      
      {/* HP Bar */}
      <div className="absolute bottom-1 left-2 right-2 h-1 bg-stone-900 border border-stone-800 flex overflow-hidden">
        <motion.div 
          className={`h-full ${hasShield ? 'bg-blue-500' : (isEnemy ? 'bg-blood-500' : 'bg-emerald-600')}`}
          initial={{ width: `${hasShield ? 100 : hpPercent}%` }}
          animate={{ width: `${hasShield ? 100 : hpPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Progression Dots (Valor/Resolve) */}
      <div className="absolute top-1 left-2 right-2 flex justify-center space-x-[1.5px]">
        {Array.from({ length: maxProgression }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full border ${
              i < currentProgression 
                ? (isInfantry 
                    ? (currentProgression >= maxProgression ? 'bg-blood-500 border-blood-700 shadow-[0_0_2px_#ef4444]' : 'bg-stone-300 border-stone-700') 
                    : 'bg-blood-500 border-stone-800') 
                : 'bg-stone-900/50 border-stone-800'
            }`}
          />
        ))}
      </div>
      
    </motion.div>
  );
}
