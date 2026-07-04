import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Position } from '../../types';

interface TileProps {
  position: Position;
  isLight: boolean;
  isValidTarget: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isFrozen?: boolean;
  isCharmed?: boolean;
  isSuppressedAura?: boolean;
  isBastionAura?: boolean;
  isPieceUnaffected?: boolean;
  isPositiveTarget?: boolean;
  isAbilityTarget?: boolean;
  isSkillRangeIndicator?: boolean;
  hasPiece?: boolean;
  isRookGuarding?: boolean;
  isRookGuarded?: boolean;
  isPulsatingGuardian?: boolean;
  isPulsatingGuarded?: boolean;
  children: ReactNode;
  onClick: () => void;
}

export function Tile({ 
  isLight, 
  isValidTarget, 
  isSelected, 
  isLastMove,
  isFrozen,
  isCharmed,
  isSuppressedAura,
  isBastionAura,
  isPieceUnaffected = false,
  isPositiveTarget = false,
  isAbilityTarget = false,
  isSkillRangeIndicator = false,
  hasPiece = false,
  isRookGuarding = false,
  isRookGuarded = false,
  isPulsatingGuardian = false,
  isPulsatingGuarded = false,
  children, 
  onClick 
}: TileProps) {
  
  // Base tile colors matching the theme
  const baseColor = isLight ? 'bg-stone-800' : 'bg-stone-900';
  
  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-square border border-stone-950/50 flex items-center justify-center transition-colors
        ${baseColor}
        ${isSelected ? 'ring-2 ring-inset ring-blood-500 bg-stone-700' : ''}
        ${isLastMove ? 'bg-blood-900/30' : ''}
        ${isFrozen ? 'border-2 border-blue-500 bg-blue-950/30 shadow-[inset_0_0_12px_rgba(59,130,246,0.35)]' : ''}
        ${isCharmed ? 'border-2 border-pink-400/80 bg-pink-500/10 shadow-[inset_0_0_12px_rgba(244,114,182,0.6)]' : ''}
      `}
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none mix-blend-overlay" />

      {/* Suppression Aura Overlay */}
      {isSuppressedAura && (
        <div className={`absolute inset-0 bg-purple-950/45 border border-purple-500/20 shadow-[inset_0_0_16px_rgba(147,51,234,0.3)] pointer-events-none animate-pulse ${isPieceUnaffected ? 'z-[3]' : 'z-[5]'}`} />
      )}

      {/* Bastion Aura Overlay (Fortified Shield Zone) */}
      {isBastionAura && (
        <div className="absolute inset-0 bg-amber-900/10 border border-amber-600/30 shadow-[inset_0_0_12px_rgba(245,158,11,0.2)] pointer-events-none animate-pulse z-[4]">
          {/* Subtle fortress crenellation visual details */}
          <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 border border-amber-500/5 pointer-events-none" />
        </div>
      )}
      
      {/* Target indicator */}
      {isValidTarget && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[12]"
        >
          {isAbilityTarget ? (
            isPositiveTarget ? (
              // Positive ability/super green reticle
              <div className="w-[80%] h-[80%] border-2 border-emerald-500 rounded-sm opacity-80 rotate-45 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            ) : (
              // Offensive ability/super red reticle
              <div className="w-[80%] h-[80%] border-2 border-blood-500 rounded-sm opacity-80 rotate-45" />
            )
          ) : hasPiece ? (
            // If attacking, show a red reticle
            <div className="w-[80%] h-[80%] border-2 border-blood-500 rounded-sm opacity-80 rotate-45" />
          ) : (
            // If moving, show a soft dot
            <div className="w-1/4 h-1/4 rounded-full bg-stone-400/40" />
          )}
        </motion.div>
      )}
      
      {/* Guarding/Guarded Aura under the piece */}
      {(isRookGuarding || isPulsatingGuardian) && (
        <div className={`absolute inset-0 pointer-events-none z-[2] transition-all duration-300 ${isPulsatingGuardian ? 'bg-amber-500/30 border-2 border-amber-400/50 shadow-[inset_0_0_20px_rgba(251,191,36,0.5)]' : 'bg-amber-950/20 border border-amber-600/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.15)] opacity-70'}`} />
      )}
      {(isRookGuarded || isPulsatingGuarded) && (
        <div className={`absolute inset-0 pointer-events-none z-[2] bg-amber-950/30 border border-amber-500/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.35)] ${isPulsatingGuarded ? 'animate-ping opacity-100' : 'animate-pulse opacity-70'}`} />
      )}

      {/* Skill Range Indicator Aura */}
      {isSkillRangeIndicator && (
        <div className="absolute inset-0 pointer-events-none z-[3] bg-red-950/25 border border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.25)] animate-pulse mix-blend-screen" />
      )}

      {/* Piece Container Wrapper */}
      <div className={`w-full h-full flex items-center justify-center relative z-[4]`}>
        {children}
      </div>
    </div>
  );
}
