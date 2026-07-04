import { Piece, PieceColor, PieceType, GameState, GameSetup } from '../../types';
import { updateAuras } from './engine';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const PIECE_STATS: Record<PieceType, { hp: number; atk: number; cooldowns: { ability: number; passive: number } }> = {
  KING: { hp: 12, atk: 3, cooldowns: { ability: 5, passive: 0 } },
  QUEEN: { hp: 9, atk: 4, cooldowns: { ability: 3, passive: 0 } },
  ROOK: { hp: 10, atk: 4, cooldowns: { ability: 3, passive: 5 } },
  BISHOP: { hp: 8, atk: 3, cooldowns: { ability: 3, passive: 3 } },
  KNIGHT: { hp: 8, atk: 3, cooldowns: { ability: 3, passive: 3 } },
  PAWN: { hp: 3, atk: 2, cooldowns: { ability: 2, passive: 0 } },
  ROYAL_GUARD: { hp: 4, atk: 2, cooldowns: { ability: 0, passive: 0 } },
};

export function createPiece(type: PieceType, color: PieceColor): Piece {
  const stats = PIECE_STATS[type];
  return {
    id: generateId(),
    type,
    color,
    hp: stats.hp,
    maxHp: stats.hp,
    atk: stats.atk,
    valor: 0,
    resolve: 0,
    cooldowns: { ability: 0, passive: 0 },
    conditions: {
      shielded: false, armored: 0, guarded: 0, empowered: 0,
      haste: false, frozen: 0, charmed: 0, suppressed: false,
      guarding: false, marked: false,
    },
    hasMoved: false,
    unyieldingUsed: false,
    survivedDamageThisRound: false,
    trackedStats: 0,
  };
}

export function createInitialGameState(setup: GameSetup): GameState {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces (row 0 and 1)
  const blackBackRank: PieceType[] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'BISHOP', 'KNIGHT', 'ROOK'];
  blackBackRank.forEach((type, i) => board[0][i] = createPiece(type, 'BLACK'));
  for (let i = 0; i < 8; i++) board[1][i] = createPiece('PAWN', 'BLACK');

  // White pieces (row 7 and 6)
  const whiteBackRank: PieceType[] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'BISHOP', 'KNIGHT', 'ROOK'];
  whiteBackRank.forEach((type, i) => board[7][i] = createPiece(type, 'WHITE'));
  for (let i = 0; i < 8; i++) board[6][i] = createPiece('PAWN', 'WHITE');

  // Apply initial conditions
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'ROOK') {
        piece.conditions.shielded = true;
        piece.cooldowns.passive = 5; // Start on cooldown? Actually prompt says "already have their shield active once the match starts."
      }
    }
  }

  const initialState: GameState = {
    board,
    turn: 1,
    activeColor: 'WHITE',
    selectedPosition: null,
    validTargets: [],
    activeActionType: null,
    history: [
      "The Watcher is ready to chronicle this battle...",
      "All Iron Bastions have raised their Iron Shields."
    ],
    winner: null,
    statusMessage: 'Match begins. White Kingdom to move.',
    isSimulating: setup.mode === 'WAR_TABLE',
    simulationSpeed: 1,
    pendingPromotion: null,
    pendingEvasions: [],
    specialTurnState: null,
    setup,
    graveyard: { WHITE: [], BLACK: [] }
  };
  
  updateAuras(initialState);
  return initialState;
}
