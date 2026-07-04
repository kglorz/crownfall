import { GameState, Position, AIDifficulty, Piece } from '../../types';
import { executeMove, executeAttack, executeAbility, executeSuper, getPieceAt } from './engine';
import { DIFFICULTY_PROFILES } from './ai/profiles';
import { generateAllMoves, searchBestMove, simulateMove } from './ai/search';
import { evaluateBoard } from './ai/evaluator';
import { AIMove, AIDebugData } from './ai/types';

// Extend global window interface for developer tools debugging
declare global {
  interface Window {
    __last_ai_debug__?: AIDebugData;
  }
}

// Set to true to enable detailed AI move evaluation/scoring in the Dev Debug panel.
// In normal/production play, disabling this saves significant CPU by skipping an extra evaluation pass over every legal move.
const ENABLE_AI_DEBUG = typeof window !== 'undefined';

export function computeAIMove(gameState: GameState, difficulty: AIDifficulty): GameState {
  const color = gameState.activeColor;
  const profile = DIFFICULTY_PROFILES[difficulty];

  // 1. Generate all legal actions
  const allMoves = generateAllMoves(gameState, color, profile);
  if (allMoves.length === 0) {
    return gameState; // No valid moves available (e.g. all pieces frozen or defeated)
  }

  const startTime = performance.now();
  
  // 2. Run standard high-performance search to find optimal moves and score them
  const searchResult = searchBestMove(gameState, profile);

  // 3. Score all moves if debug is active OR if we actually need to make a sub-optimal choice
  const isOptimal = Math.random() >= profile.errorRate;
  
  let scoredMoves: { move: AIMove; score: number; explanation: string }[] = [];
  if (ENABLE_AI_DEBUG || !isOptimal) {
    scoredMoves = allMoves.map(move => {
      try {
        const simulated = simulateMove(gameState, move);
        const evalResult = evaluateBoard(simulated, color, profile);
        
        // Basic explanation of why this was selected or valued
        let explanation = 'Positional development.';
        if (move.actionType === 'ATTACK') {
          const target = getPieceAt(gameState.board, move.to.r, move.to.c);
          explanation = target ? `Attack enemy ${target.type} at r${move.to.r}c${move.to.c}.` : 'Attack enemy.';
        } else if (move.actionType === 'SUPER') {
          explanation = 'Triggered Sovereign Super active!';
        } else if (move.actionType === 'ABILITY') {
          explanation = 'Executed tactical special ability.';
        }

        return {
          move,
          score: evalResult.total,
          explanation
        };
      } catch {
        return {
          move,
          score: -99999,
          explanation: 'Invalid simulated transition.'
        };
      }
    });

    // Sort candidate moves by descending score
    scoredMoves.sort((a, b) => b.score - a.score);
  }

  // 4. Decision selection based on difficulty profile (simulating human error rates)
  let chosenMove: AIMove;

  if (isOptimal && searchResult.move) {
    chosenMove = searchResult.move;
  } else {
    // Sub-optimal path: Pick from a wider pool of moves based on difficulty
    let choices: typeof scoredMoves;
    if (profile.name === 'Squire') {
      // Top 50% of ranked moves to allow actual, noticeable development mistakes or hanging pieces
      const poolSize = Math.max(1, Math.floor(scoredMoves.length * 0.5));
      choices = scoredMoves.slice(0, poolSize);
    } else if (profile.name === 'Knight') {
      // Top 8 moves for narrower, but still tangible errors
      choices = scoredMoves.slice(0, Math.min(8, scoredMoves.length));
    } else {
      choices = scoredMoves.slice(0, Math.min(4, scoredMoves.length));
    }
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    chosenMove = randomChoice?.move || allMoves[0];
  }

  // 5. Populate developer tools telemetry logs (only if ENABLE_AI_DEBUG is true)
  if (ENABLE_AI_DEBUG) {
    const finalEval = evaluateBoard(gameState, color, profile);
    const thinkingTimeMs = performance.now() - startTime;

    // Render notations
    const formatNotation = (m: AIMove) => {
      const actionSymbols = { MOVE: '→', ATTACK: '⚔', ABILITY: '✦', SUPER: '★' };
      const p = getPieceAt(gameState.board, m.from.r, m.from.c);
      const pieceChar = p ? p.type.substring(0, 3) : '???';
      return `${pieceChar} (${m.from.r},${m.from.c}) ${actionSymbols[m.actionType]} (${m.to.r},${m.to.c})`;
    };

    window.__last_ai_debug__ = {
      chosenMove,
      score: searchResult.score,
      depth: searchResult.depth,
      nodesEvaluated: searchResult.nodesEvaluated,
      thinkingTimeMs,
      pv: searchResult.pv.map(formatNotation),
      topMoves: scoredMoves.slice(0, 5).map(tm => ({
        move: tm.move,
        score: Math.round(tm.score * 10) / 10,
        explanation: tm.explanation
      })),
      evaluationBreakdown: {
        material: Math.round(finalEval.material * 10) / 10,
        positional: Math.round(finalEval.positional * 10) / 10,
        kingSafety: Math.round(finalEval.kingSafety * 10) / 10,
        resources: Math.round(finalEval.resources * 10) / 10,
        total: Math.round(finalEval.total * 10) / 10,
        phase: finalEval.phase
      }
    };
  }

  // 6. Execute chosen action safely
  switch (chosenMove.actionType) {
    case 'MOVE':
      return executeMove(gameState, chosenMove.from, chosenMove.to);
    case 'ATTACK':
      return executeAttack(gameState, chosenMove.from, chosenMove.to);
    case 'ABILITY':
      return executeAbility(gameState, chosenMove.from, chosenMove.to);
    case 'SUPER':
      return executeSuper(gameState, chosenMove.from, chosenMove.to);
    default:
      return gameState;
  }
}
