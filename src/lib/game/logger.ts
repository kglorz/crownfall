import { PieceType, Piece, Position } from '../../types';

export const pieceNames: Record<PieceType, string> = {
  KING: 'King',
  QUEEN: 'Empress',
  ROOK: 'Iron Bastion',
  KNIGHT: 'Grand Paladin',
  BISHOP: 'High Cleric',
  PAWN: 'Soldier',
  ROYAL_GUARD: 'Guard'
};

const moveVerbs: Record<PieceType, string[]> = {
  KNIGHT: ["galloped toward", "charged to", "rode to", "spurred forward to", "vaulted toward"],
  BISHOP: ["advanced to", "approached", "walked calmly to"],
  QUEEN: ["glided to", "strode to", "commanded the field to", "decreed her path to"],
  ROOK: ["marched to", "fortified position at", "advanced steadfastly to", "stood firm at"],
  PAWN: ["stepped forward to", "pressed onward to", "held the line at", "advanced to"],
  KING: ["advanced cautiously to", "took the field at", "moved under royal command to", "rallied forward to"],
  ROYAL_GUARD: ["stood vigilant at", "reinforced the line at", "positioned beside the throne at", "stepped forth to"]
};

const targetSurvivesVerbs: Record<PieceType, string[]> = {
  KNIGHT: ["<P>[ATTACKER]</P> struck <P>[DEFENDER]</P> with a crushing blow.", "<P>[ATTACKER]</P> pierced <P>[DEFENDER]</P> before retreating.", "<P>[ATTACKER]</P> rode down <P>[DEFENDER]</P> in a fierce clash."],
  PAWN: ["<P>[ATTACKER]</P> drew first blood against <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> traded blows with <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> fought bravely against <P>[DEFENDER]</P>."],
  BISHOP: ["<P>[ATTACKER]</P> smote <P>[DEFENDER]</P> with sacred force.", "<P>[ATTACKER]</P> judged <P>[DEFENDER]</P> harshly.", "<P>[ATTACKER]</P> brought divine wrath upon <P>[DEFENDER]</P>."],
  ROOK: ["<P>[ATTACKER]</P> battered <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> struck <P>[DEFENDER]</P> with unyielding force.", "<P>[ATTACKER]</P> hammered <P>[DEFENDER]</P>."],
  QUEEN: ["<P>[ATTACKER]</P> struck <P>[DEFENDER]</P> with regal authority.", "<P>[ATTACKER]</P> punished <P>[DEFENDER]</P> for its insolence.", "<P>[ATTACKER]</P> enthralled <P>[DEFENDER]</P> in combat."],
  KING: ["<P>[ATTACKER]</P> delivered a sovereign blow to <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> struck <P>[DEFENDER]</P> by royal decree.", "<P>[ATTACKER]</P> engaged <P>[DEFENDER]</P> in honorable combat."],
  ROYAL_GUARD: ["<P>[ATTACKER]</P> fiercely repelled <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> intercepted <P>[DEFENDER]</P> with a heavy strike.", "<P>[ATTACKER]</P> defended the crown against <P>[DEFENDER]</P>."]
};

const targetDefeatedVerbs: Record<PieceType, string[]> = {
  KNIGHT: ["<P>[ATTACKER]</P> denied tomorrow for <P>[DEFENDER]</P> with a decisive charge.", "<P>[ATTACKER]</P> trampled <P>[DEFENDER]</P> underhoof.", "<P>[ATTACKER]</P> broke <P>[DEFENDER]</P> upon its lance."],
  PAWN: ["<P>[ATTACKER]</P> brought <P>[DEFENDER]</P> low after a hard-fought clash.", "<P>[ATTACKER]</P> stood its ground, ending <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> proved its worth by vanquishing <P>[DEFENDER]</P>."],
  BISHOP: ["<P>[ATTACKER]</P> delivered divine judgment upon <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> sanctified the battlefield, banishing <P>[DEFENDER]</P>.", "<P>[ATTACKER]</P> cleansed <P>[DEFENDER]</P> from the realm."],
  ROOK: ["<P>[ATTACKER]</P> crushed <P>[DEFENDER]</P> beneath unyielding steel.", "<P>[ATTACKER]</P> shattered <P>[DEFENDER]</P>'s defenses permanently.", "<P>[ATTACKER]</P> ground <P>[DEFENDER]</P> into the dust."],
  QUEEN: ["<P>[ATTACKER]</P> ended <P>[DEFENDER]</P>'s campaign with regal precision.", "<P>[ATTACKER]</P> dismissed <P>[DEFENDER]</P> from the board.", "<P>[ATTACKER]</P> decreed the fall of <P>[DEFENDER]</P>."],
  KING: ["<P>[ATTACKER]</P> executed <P>[DEFENDER]</P> with sovereign authority.", "<P>[ATTACKER]</P> struck down <P>[DEFENDER]</P> to protect the realm.", "<P>[ATTACKER]</P> personally ended the threat of <P>[DEFENDER]</P>."],
  ROYAL_GUARD: ["<P>[ATTACKER]</P> executed <P>[DEFENDER]</P> in defense of the throne.", "<P>[ATTACKER]</P> silenced <P>[DEFENDER]</P> forever.", "<P>[ATTACKER]</P> dutifully eliminated <P>[DEFENDER]</P>."]
};

function randomChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatSquare(p: Position): string {
  const files = 'abcdefgh';
  return `${files[p.c].toUpperCase()}${8 - p.r}`;
}

export function logMove(turn: number | null, piece: Piece, to: Position): string {
  const tStr = turn ? `<T>T${turn}.</T> ` : '';
  const verb = randomChoice(moveVerbs[piece.type]);
  const dest = `<S>${formatSquare(to)}</S>`;
  let pName = pieceNames[piece.type];
  
  return `${tStr}<P>${pName}</P> ${verb} <S>${formatSquare(to)}</S>.`;
}

export function logAttack(turn: number | null, attacker: Piece, defender: Piece, defeated: boolean): string {
  const tStr = turn ? `<T>T${turn}.</T> ` : '';
  const verbList = defeated ? targetDefeatedVerbs[attacker.type] : targetSurvivesVerbs[attacker.type];
  let text = randomChoice(verbList);
  text = text.replace('[ATTACKER]', pieceNames[attacker.type]);
  text = text.replace('[DEFENDER]', `enemy ${pieceNames[defender.type]}`);
  return `${tStr}${text}`;
}

export function logAbility(turn: number | null, piece: Piece, abilityName: string, effect: string): string {
  const tStr = turn ? `<T>T${turn}.</T> ` : '';
  const verbs = ['invoked', 'raised', 'unleashed', 'whispered', 'called forth', 'used'];
  const verb = randomChoice(verbs);
  return `${tStr}<P>${pieceNames[piece.type]}</P> ${verb} <A>${abilityName}</A>, ${effect}.`;
}

export function logSuper(turn: number | null, piece: Piece, superName: string, effect: string): string {
  const tStr = turn ? `<T>T${turn}.</T> ` : '';
  const verbs = ['unleashed', 'proclaimed', 'executed', 'manifested', 'called forth'];
  const verb = randomChoice(verbs);
  return `<SUPER>${tStr}<P>${pieceNames[piece.type]}</P> ${verb} <A>${superName}</A>, ${effect}.</SUPER>`;
}

export function logPassive(turn: number | null, piece: Piece, passiveName: string, effect: string): string {
  const tStr = turn ? `<T>T${turn}.</T> ` : '';
  return `${tStr}<P>${pieceNames[piece.type]}'s</P> <A>${passiveName}</A> ${effect}.`;
}
