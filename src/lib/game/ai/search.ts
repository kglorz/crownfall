import { GameState, Position, PieceColor, PieceType } from '../../../types';
import { getValidMoves, getValidAttacks, getValidAbilityTargets, getValidSuperTargets, executeMove, executeAttack, executeAbility, executeSuper, cloneGameState, getPieceAt } from '../engine';
import { evaluateBoard } from './evaluator';
import { DifficultyProfile, AIMove, SearchResult } from './types';

// Transposition Table Entry
interface TTEntry {
  score: number;
  depth: number;
  bestMove: AIMove | null;
  flag: 'EXACT' | 'ALPHA' | 'BETA';
}

// Generate compact hash string for board state to cache results
function getBoardHash(gameState: GameState): string {
  let hashParts: string[] = [];
  // Include active player color and special turn state
  hashParts.push(gameState.activeColor);
  if (gameState.specialTurnState) {
    hashParts.push(gameState.specialTurnState);
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = gameState.board[r][c];
      if (p) {
        // Hash: position, type, color, hp, cooldowns, status conditions
        const conds = [
          p.conditions.shielded ? 'S' : '',
          p.conditions.guarded > 0 ? `G${p.conditions.guarded}` : '',
          p.conditions.frozen ? 'F' : '',
          p.conditions.suppressed ? 'U' : '',
          p.conditions.marked ? 'M' : '',
        ].join('');
        hashParts.push(`${r}${c}:${p.type[0]}${p.color[0]}:H${p.hp}:A${p.cooldowns.ability}:P${p.cooldowns.passive}:${conds}`);
      }
    }
  }
  return hashParts.join('|');
}

// Order moves for optimal alpha-beta cutoffs
function orderMoves(gameState: GameState, moves: AIMove[], profile: DifficultyProfile, pvMove?: AIMove | null): AIMove[] {
  return moves.map(move => {
    let priority = 0;

    // 0. PV-move first: Match target PV move to try it first
    if (pvMove && move.from.r === pvMove.from.r && move.from.c === pvMove.from.c &&
        move.to.r === pvMove.to.r && move.to.c === pvMove.to.c &&
        move.actionType === pvMove.actionType) {
      priority += 100000;
    } else {
      // 1. SUPERS: Very high value
      if (move.actionType === 'SUPER') {
        priority += 1000;
      }

      // 2. ATTACKS: Capture of high-value pieces (scaled by tacticalAggressiveness)
      if (move.actionType === 'ATTACK') {
        const target = getPieceAt(gameState.board, move.to.r, move.to.c);
        if (target) {
          const valMap: Record<string, number> = { KING: 10000, QUEEN: 90, ROOK: 55, KNIGHT: 35, BISHOP: 30, PAWN: 10, ROYAL_GUARD: 22 };
          priority += (500 + (valMap[target.type] || 0)) * profile.tacticalAggressiveness;
        }
      }

      // 3. ABILITIES: Tactical values
      if (move.actionType === 'ABILITY') {
        priority += 300 * profile.tacticalAggressiveness;
      }

      // 4. Center control for normal moves
      if (move.actionType === 'MOVE') {
        if (move.to.r >= 2 && move.to.r <= 5 && move.to.c >= 2 && move.to.c <= 5) {
          priority += 50;
        }
      }
    }

    return { ...move, priority };
  })
  .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

// Generate all legal moves/actions for the current player
export function generateAllMoves(gameState: GameState, color: PieceColor, profile?: DifficultyProfile): AIMove[] {
  const moves: AIMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = getPieceAt(gameState.board, r, c);
      if (piece && piece.color === color) {
        // 1. Moves
        const validMoves = getValidMoves(gameState, r, c);
        for (const to of validMoves) {
          const isPawnPromotion = piece.type === 'PAWN' && (color === 'WHITE' ? to.r === 0 : to.r === 7);
          if (isPawnPromotion) {
            moves.push({ from: { r, c }, to, actionType: 'MOVE', promotionType: 'ROOK' });
            moves.push({ from: { r, c }, to, actionType: 'MOVE', promotionType: 'KNIGHT' });
            moves.push({ from: { r, c }, to, actionType: 'MOVE', promotionType: 'BISHOP' });
          } else {
            moves.push({ from: { r, c }, to, actionType: 'MOVE' });
          }
        }

        // 2. Attacks
        const validAttacks = getValidAttacks(gameState, r, c);
        for (const to of validAttacks) {
          const isPawnPromotion = piece.type === 'PAWN' && (color === 'WHITE' ? to.r === 0 : to.r === 7);
          if (isPawnPromotion) {
            moves.push({ from: { r, c }, to, actionType: 'ATTACK', promotionType: 'ROOK' });
            moves.push({ from: { r, c }, to, actionType: 'ATTACK', promotionType: 'KNIGHT' });
            moves.push({ from: { r, c }, to, actionType: 'ATTACK', promotionType: 'BISHOP' });
          } else {
            moves.push({ from: { r, c }, to, actionType: 'ATTACK' });
          }
        }

        // 3. Abilities
        if (!profile || profile.allowAbilities) {
          const validAbilities = getValidAbilityTargets(gameState, r, c);
          for (const to of validAbilities) {
            moves.push({ from: { r, c }, to, actionType: 'ABILITY' });
          }
        }

        // 4. Supers
        if (!profile || profile.allowSupers) {
          const validSupers = getValidSuperTargets(gameState, r, c);
          for (const to of validSupers) {
            moves.push({ from: { r, c }, to, actionType: 'SUPER' });
          }
        }
      }
    }
  }

  return moves;
}

// Execute any abstract AIMove onto a game state to produce next state
export function simulateMove(gameState: GameState, move: AIMove): GameState {
  // cloneGameState is imported from engine.ts and safe to use
  const nextState = cloneGameState(gameState);
  
  switch (move.actionType) {
    case 'MOVE':
      return executeMove(nextState, move.from, move.to, move.promotionType);
    case 'ATTACK':
      return executeAttack(nextState, move.from, move.to, move.promotionType);
    case 'ABILITY':
      return executeAbility(nextState, move.from, move.to);
    case 'SUPER':
      return executeSuper(nextState, move.from, move.to);
    default:
      return nextState;
  }
}

export function searchBestMove(
  gameState: GameState,
  profile: DifficultyProfile
): SearchResult {
  const startTime = performance.now();
  const activeColor = gameState.activeColor;
  const transpositionTable = new Map<string, TTEntry>();
  let nodesEvaluated = 0;

  // Search parameters
  const maxSearchDepth = profile.maxDepth;
  const timeLimitMs = maxSearchDepth >= 4 ? 500 : maxSearchDepth === 3 ? 250 : 50;

  let bestMoveFound: AIMove | null = null;
  let bestScoreFound = -Infinity;
  let completedDepth = 0;
  let pvLine: AIMove[] = [];

  // Iterate deepening
  for (let currentDepth = 1; currentDepth <= maxSearchDepth; currentDepth++) {
    // Check if we've already run out of time
    if (performance.now() - startTime > timeLimitMs) {
      break;
    }

    try {
      const result = alphaBetaSearch(
        gameState,
        currentDepth,
        -Infinity,
        Infinity,
        true, // Maximizing player is activeColor
        activeColor,
        bestMoveFound
      );

      bestMoveFound = result.bestMove;
      bestScoreFound = result.score;
      completedDepth = currentDepth;
      pvLine = result.pv;
    } catch (e) {
      // Catch time limit or search interruptions gracefully
      break;
    }
  }

  // Fallback: If no moves generated, pick first legal action
  if (!bestMoveFound) {
    const allMoves = generateAllMoves(gameState, activeColor, profile);
    if (allMoves.length > 0) {
      bestMoveFound = allMoves[0];
      bestScoreFound = evaluateBoard(gameState, activeColor, profile).total;
    }
  }

  const thinkingTimeMs = performance.now() - startTime;

  return {
    move: bestMoveFound,
    score: bestScoreFound,
    depth: completedDepth,
    nodesEvaluated,
    pv: pvLine,
    thinkingTimeMs,
  };

  // Nest Alpha-Beta inside searchBestMove to share transpositionTable & nodesEvaluated
  function alphaBetaSearch(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    color: PieceColor,
    rootPvMove?: AIMove | null,
    lastMove?: AIMove
  ): { score: number; bestMove: AIMove | null; pv: AIMove[] } {
    nodesEvaluated++;

    // Time Check
    if (nodesEvaluated % 100 === 0 && performance.now() - startTime > timeLimitMs) {
      throw new Error('TIMEOUT');
    }

    // Terminal or Game Over state check
    if (state.winner) {
      const winScore = state.winner === color ? 20000 + depth : -20000 - depth;
      return { score: winScore, bestMove: null, pv: [] };
    }

    // Transposition Table lookup
    const stateHash = getBoardHash(state);
    const cached = transpositionTable.get(stateHash);
    let pvMove: AIMove | null = rootPvMove || null;
    if (cached) {
      pvMove = cached.bestMove || pvMove;
      if (cached.depth >= depth) {
        if (cached.flag === 'EXACT') {
          return { score: cached.score, bestMove: cached.bestMove, pv: cached.bestMove ? [cached.bestMove] : [] };
        } else if (cached.flag === 'ALPHA' && cached.score <= alpha) {
          return { score: cached.score, bestMove: cached.bestMove, pv: cached.bestMove ? [cached.bestMove] : [] };
        } else if (cached.flag === 'BETA' && cached.score >= beta) {
          return { score: cached.score, bestMove: cached.bestMove, pv: cached.bestMove ? [cached.bestMove] : [] };
        }
      }
    }

    // Base Case
    if (depth === 0) {
      // Perform Quiescence search for unstable attack/capture states
      const qScore = quiescenceSearch(state, alpha, beta, isMaximizing, color, 0, lastMove);
      return { score: qScore, bestMove: null, pv: [] };
    }

    const currentTurnColor = state.activeColor;
    const rawMoves = generateAllMoves(state, currentTurnColor, profile);

    if (rawMoves.length === 0) {
      // No legal moves
      const leafScore = evaluateBoard(state, color, profile, lastMove).total;
      return { score: leafScore, bestMove: null, pv: [] };
    }

    const moves = orderMoves(state, rawMoves, profile, pvMove);
    let bestMove: AIMove | null = null;
    let pv: AIMove[] = [];

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const nextState = simulateMove(state, move);
        const nextIsMaximizing = nextState.activeColor === color;
        const searchResult = alphaBetaSearch(
          nextState,
          depth - 1,
          alpha,
          beta,
          nextIsMaximizing,
          color,
          null,
          move
        );

        if (searchResult.score > maxEval) {
          maxEval = searchResult.score;
          bestMove = move;
          pv = [move, ...searchResult.pv];
        }
        alpha = Math.max(alpha, searchResult.score);
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }

      // TT save
      let ttFlag: 'EXACT' | 'ALPHA' | 'BETA' = 'EXACT';
      if (maxEval <= alpha) ttFlag = 'ALPHA';
      else if (maxEval >= beta) ttFlag = 'BETA';
      transpositionTable.set(stateHash, { score: maxEval, depth, bestMove, flag: ttFlag });

      return { score: maxEval, bestMove, pv };
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const nextState = simulateMove(state, move);
        const nextIsMaximizing = nextState.activeColor === color;
        const searchResult = alphaBetaSearch(
          nextState,
          depth - 1,
          alpha,
          beta,
          nextIsMaximizing,
          color,
          null,
          move
        );

        if (searchResult.score < minEval) {
          minEval = searchResult.score;
          bestMove = move;
          pv = [move, ...searchResult.pv];
        }
        beta = Math.min(beta, searchResult.score);
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }

      // TT save
      let ttFlag: 'EXACT' | 'ALPHA' | 'BETA' = 'EXACT';
      if (minEval <= alpha) ttFlag = 'ALPHA';
      else if (minEval >= beta) ttFlag = 'BETA';
      transpositionTable.set(stateHash, { score: minEval, depth, bestMove, flag: ttFlag });

      return { score: minEval, bestMove, pv };
    }
  }

  // Quiescence Search: avoids the horizon effect by searching all active attacks/captures
  function quiescenceSearch(
    state: GameState,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    color: PieceColor,
    qDepth: number,
    lastMove?: AIMove
  ): number {
    nodesEvaluated++;

    // Time Check inside quiescenceSearch
    if (nodesEvaluated % 100 === 0 && performance.now() - startTime > timeLimitMs) {
      throw new Error('TIMEOUT');
    }

    const standPat = evaluateBoard(state, color, profile, lastMove).total;

    if (qDepth >= 2) {
      return standPat; // Hard limit on quiescence depth to maintain high performance
    }

    if (isMaximizing) {
      if (standPat >= beta) {
        return beta;
      }
      alpha = Math.max(alpha, standPat);

      // Search only Attacks & Supers (active/unstable plies)
      const rawMoves = generateAllMoves(state, state.activeColor, profile);
      const activeMoves = rawMoves.filter(m => m.actionType === 'ATTACK' || m.actionType === 'SUPER');
      const orderedActive = orderMoves(state, activeMoves, profile);

      for (const move of orderedActive) {
        const nextState = simulateMove(state, move);
        const score = quiescenceSearch(nextState, alpha, beta, !isMaximizing, color, qDepth + 1, move);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break; // Cutoff
        }
      }
      return alpha;
    } else {
      if (standPat <= alpha) {
        return alpha;
      }
      beta = Math.min(beta, standPat);

      const rawMoves = generateAllMoves(state, state.activeColor, profile);
      const activeMoves = rawMoves.filter(m => m.actionType === 'ATTACK' || m.actionType === 'SUPER');
      const orderedActive = orderMoves(state, activeMoves, profile);

      for (const move of orderedActive) {
        const nextState = simulateMove(state, move);
        const score = quiescenceSearch(nextState, alpha, beta, !isMaximizing, color, qDepth + 1, move);
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break; // Cutoff
        }
      }
      return beta;
    }
  }
}
