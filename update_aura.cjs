const fs = require('fs');
let code = fs.readFileSync('src/components/game/Board.tsx', 'utf8');

const oldLogic = `  for (const q of queenPositions) {
    let hasAdjacentSuppressibleEnemy = false;
    for (const [dr, dc] of dirs) {
      const nr = q.r + dr;
      const nc = q.c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const adjacentPiece = board[nr][nc];
        if (adjacentPiece && adjacentPiece.color !== q.color) {
          if (adjacentPiece.type !== 'KING' && adjacentPiece.type !== 'QUEEN' && adjacentPiece.type !== 'ROYAL_GUARD') {
            hasAdjacentSuppressibleEnemy = true;
            break;
          }
        }
      }
    }
    
    if (hasAdjacentSuppressibleEnemy) {
      for (const [dr, dc] of dirs) {
        const nr = q.r + dr;
        const nc = q.c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const current = grid[nr][nc];
          if (current === '') {
            grid[nr][nc] = q.color;
          } else if (current !== q.color) {
            grid[nr][nc] = 'BOTH';
          }
        }
      }
    }
  }`;

const newLogic = `  for (const q of queenPositions) {
    for (const [dr, dc] of dirs) {
      const nr = q.r + dr;
      const nc = q.c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const adjacentPiece = board[nr][nc];
        // Only render the suppression aura on the specifically affected tiles
        if (adjacentPiece && adjacentPiece.color !== q.color) {
          if (adjacentPiece.type !== 'KING' && adjacentPiece.type !== 'QUEEN' && adjacentPiece.type !== 'ROYAL_GUARD') {
            const current = grid[nr][nc];
            if (current === '') {
              grid[nr][nc] = q.color;
            } else if (current !== q.color) {
              grid[nr][nc] = 'BOTH';
            }
          }
        }
      }
    }
  }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/game/Board.tsx', code);
