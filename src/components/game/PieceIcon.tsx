import { PieceType, PieceColor } from '../../types';

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  isSuperReady?: boolean;
  isLastStand?: boolean;
}

export function PieceIcon({ type, color, className = '', isSuperReady = false, isLastStand = false }: PieceIconProps) {
  const isWhite = color === 'WHITE';
  
  const fillUrl = isWhite ? 'url(#gradWhite)' : 'url(#gradBlack)';
  // Both white and black pieces get the same gray outline unless super is ready.
  const strokeColor = isSuperReady ? '#ef4444' : '#78716c'; 
  
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${className}`}>
      <defs>
        <linearGradient id="gradWhite" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f4" />
          <stop offset="50%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="gradBlack" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#292524" />
          <stop offset="50%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#0c0a09" />
        </linearGradient>
      </defs>
      
      <g fill={fillUrl} stroke={strokeColor} strokeWidth={isSuperReady ? "4.2" : "2.5"} strokeLinejoin="round" strokeLinecap="round">
        {type === 'KING' && (
          // King: Imposing jagged crown with cross, bulky and solid
          <g>
            <path d="M 20 85 L 80 85 L 75 75 L 25 75 Z" />
            <path d="M 30 75 L 70 75 L 65 50 L 35 50 Z" />
            {isLastStand ? (
              // Last Stand King: Ornate 5-spike crown, exactly the same base width and max height
              <g>
                <path d="M 35 50 L 65 50 L 85 25 L 75 35 L 67 22 L 59 32 L 50 20 L 41 32 L 33 22 L 25 35 L 15 25 Z" />
                <path d="M 50 20 L 50 5 M 42 12 L 58 12" strokeWidth="4" strokeLinecap="square" />
              </g>
            ) : (
              <g>
                <path d="M 35 50 L 65 50 L 85 25 L 65 35 L 50 20 L 35 35 L 15 25 Z" />
                <path d="M 50 20 L 50 5 M 42 12 L 58 12" strokeWidth="4" strokeLinecap="square" />
              </g>
            )}
          </g>
        )}
        
        {type === 'QUEEN' && (
          // Queen: Elegant, sharp spiked crown with jewels, slender
          <g>
            <path d="M 28 85 L 72 85 L 68 75 L 32 75 Z" />
            <path d="M 35 75 L 65 75 L 58 45 L 42 45 Z" />
            <path d="M 40 45 L 60 45 L 80 15 L 62 30 L 50 10 L 38 30 L 20 15 Z" />
            <circle cx="50" cy="10" r="3.5" fill={strokeColor} stroke="none" />
            <circle cx="20" cy="15" r="2.5" fill={strokeColor} stroke="none" />
            <circle cx="80" cy="15" r="2.5" fill={strokeColor} stroke="none" />
          </g>
        )}
        
        {type === 'ROOK' && (
          // Rook: Heavy fortress tower with crenellations
          <path d="M 25 85 L 75 85 L 70 75 L 30 75 Z M 35 75 L 65 75 L 60 35 L 40 35 Z M 30 35 L 70 35 L 70 15 L 60 15 L 60 25 L 55 25 L 55 15 L 45 15 L 45 25 L 40 25 L 40 15 L 30 15 Z" />
        )}
        
        {type === 'BISHOP' && (
          // Bishop: Tall miter
          <g>
            <path d="M 30 85 L 70 85 L 65 75 L 35 75 Z M 38 75 L 62 75 L 55 45 L 45 45 Z M 45 45 L 55 45 L 50 10 Z" />
            <path d="M 45 30 L 55 30 M 50 25 L 50 40" strokeWidth="2" fill="none" />
          </g>
        )}
        
        {type === 'KNIGHT' && (
          // Knight: Armored, menacing horse head, exact silhouette from image
          <g>
            <path d="M 25 85 L 75 85 L 70 75 L 30 75 Z" />
            <path d="M 35 75 L 65 75 L 55 15 L 45 25 L 15 35 L 25 55 L 45 55 Z" />
          </g>
        )}
        
        {type === 'PAWN' && (
          // Pawn: Infantry, diamond head
          <path d="M 35 85 L 65 85 L 60 75 L 40 75 Z M 42 75 L 58 75 L 53 45 L 47 45 Z M 50 45 L 60 30 L 50 15 L 40 30 Z" />
        )}
        
        {type === 'ROYAL_GUARD' && (
          // Guard: Pawn body, kite shield head
          <g>
            <path d="M 35 85 L 65 85 L 60 75 L 40 75 Z M 42 75 L 58 75 L 53 45 L 47 45 Z" />
            <path d="M 35 15 L 65 15 L 65 25 C 65 40, 50 50, 50 50 C 50 50, 35 40, 35 25 Z" />
          </g>
        )}
      </g>
    </svg>
  );
}
