import { GameState, Position, PieceType, PieceColor } from '../../../types';

export interface AIMove {
  from: Position;
  to: Position;
  actionType: 'MOVE' | 'ATTACK' | 'ABILITY' | 'SUPER';
  promotionType?: PieceType;
  notation?: string;
  score?: number;
}

export interface SearchResult {
  move: AIMove | null;
  score: number;
  depth: number;
  nodesEvaluated: number;
  pv: AIMove[];
  thinkingTimeMs: number;
}

export interface AIDebugData {
  chosenMove: AIMove | null;
  score: number;
  depth: number;
  nodesEvaluated: number;
  thinkingTimeMs: number;
  pv: string[];
  topMoves: { move: AIMove; score: number; explanation: string }[];
  evaluationBreakdown: {
    material: number;
    positional: number;
    kingSafety: number;
    resources: number;
    total: number;
    phase?: string;
  };
}

export interface DifficultyProfile {
  name: string;
  maxDepth: number;
  randomness: number;             // Factor of score noise to allow human-like mistakes
  tacticalAggressiveness: number; // Multiplier for attack value
  kingSafetyWeight: number;       // Weight for defending King
  resourceValuation: number;      // Weight for abilities, supers, valor, resolve
  positionalWeight: number;       // Weight for controlling the board
  errorRate: number;              // Probability of picking a non-optimal move (0-1)
  allowSupers: boolean;
  allowAbilities: boolean;
}
