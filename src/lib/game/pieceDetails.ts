import { PieceType, Piece } from '../../types';

export const PIECE_RANGES: Record<PieceType | 'KING_LAST_STAND', { move: string; attack: string }> = {
  KING: { move: "1 Tile (Any Direction)", attack: "1 Tile (Any Direction)" },
  KING_LAST_STAND: { move: "2 Tiles (Slide Any Direction)", attack: "2 Tiles (Any Direction)" },
  QUEEN: { move: "Unlimited (Any Direction)", attack: "Unlimited (Any Direction)" },
  ROOK: { move: "Unlimited (Orthogonal)", attack: "Unlimited (Orthogonal)" },
  BISHOP: { move: "Unlimited (Diagonal)", attack: "Unlimited (Diagonal)" },
  KNIGHT: { move: "L-Shape", attack: "L-Shape" },
  PAWN: { move: "1 Tile (Forward, 2 on first move)", attack: "1 Tile (Diagonal Forward)" },
  ROYAL_GUARD: { move: "1 Tile (Any Direction)", attack: "1 Tile (Any Direction)" },
};

export interface AbilityDetails {
  name: string;
  type: 'ACTIVE' | 'SUPER' | 'PASSIVE';
  description: string;
  cooldown?: number; // max cooldown
  conditions?: string[]; // strings explaining how to earn valor/resolve
}

export interface PieceLore {
  title: string;
  active?: AbilityDetails;
  superAction?: AbilityDetails;
  passives?: AbilityDetails[];
}

export function getPieceDetails(type: PieceType | 'KING_LAST_STAND'): PieceLore {
  switch (type) {
    case 'KING':
      return {
        title: 'Sovereign',
        active: {
          name: 'Royal Reinforcement',
          type: 'ACTIVE',
          description: 'Summon one new Guard onto an empty adjacent tile. Maximum two active Guards. Summoned Guards immediately activate Bulwark.',
          cooldown: 5,
        },
        superAction: {
          name: 'King\'s Command',
          type: 'SUPER',
          description: 'Immediately take one additional full turn after the current one. Normal turn order resumes after.',
          conditions: ['Defeat an enemy', 'Ally defeats enemy within 2 tiles', 'Survive taking damage']
        },
        passives: [
          {
            name: 'Sovereign\'s Will',
            type: 'PASSIVE',
            description: 'The King is immune to all Harmful Conditions (Frozen, Charmed, Suppressed, etc).',
          },
          {
            name: 'Last Stand',
            type: 'PASSIVE',
            description: 'When HP becomes 25% or lower, activates once per game for 3 of your turns. Gains Empowered (+6), Haste (Movement becomes a 2-tile Slide piece), and Attack Range becomes 2 tiles.',
          }
        ]
      };
    case 'KING_LAST_STAND':
      return {
        title: 'Sovereign (Last Stand)',
        active: {
          name: 'Royal Reinforcement',
          type: 'ACTIVE',
          description: 'Summon one new Guard onto an empty adjacent tile. Maximum two active Guards. Summoned Guards immediately activate Bulwark.',
          cooldown: 5,
        },
        superAction: {
          name: 'King\'s Command',
          type: 'SUPER',
          description: 'Immediately take one additional full turn after the current one. Normal turn order resumes after.',
          conditions: ['Defeat an enemy', 'Ally defeats enemy within 2 tiles', 'Survive taking damage']
        },
        passives: [
          {
            name: 'Last Stand (Active)',
            type: 'PASSIVE',
            description: 'Currently Empowered (+6 ATK), Hasted (Movement becomes a 2-tile Slide piece), and Attack Range is 2 tiles. The King is making his final push.',
          }
        ]
      };
    case 'QUEEN':
      return {
        title: 'Empress',
        active: {
          name: 'Cold Charm',
          type: 'ACTIVE',
          description: 'Apply Charmed to the first enemy in line of sight until before their next turn. Kings, Queens, and Guards cannot be targeted.',
          cooldown: 3,
        },
        superAction: {
          name: 'Ice Palace',
          type: 'SUPER',
          description: 'Apply Frozen to every visible enemy in one chosen line of sight for 2 of their turns. Kings are unaffected.',
          conditions: ['Defeat an enemy', 'Ally defeats enemy within 2 tiles', 'Charmed enemy attacks former ally']
        },
        passives: [
          {
            name: 'Sovereign Aura',
            type: 'PASSIVE',
            description: 'Enemy non-Royal pieces within 1 tile of the Queen become Suppressed (cannot use Abilities or Supers).',
          }
        ]
      };
    case 'ROOK':
      return {
        title: 'Iron Bastion',
        active: {
          name: 'Protect',
          type: 'ACTIVE',
          description: 'Target one allied piece within 2 tiles. Target gains Guarded (2) and the Rook gains Guarding. All damage directed at the guarded piece is reduced by up to 2 (min 1 damage taken) and the prevented damage is absorbed by the Rook instead. Protect ends if Rook is defeated or uses Bastion.',
          cooldown: 3,
        },
        superAction: {
          name: 'Bastion',
          type: 'SUPER',
          description: 'For 3 of your turns: Cannot Move or Attack. Gain Guarding and Armored (1). All allied pieces within 2 tiles gain Guarded (2).',
          conditions: ['Defeat an enemy', 'Ability successfully affects target', 'Prevent 6 damage cumulatively']
        },
        passives: [
          {
            name: 'Iron Shell',
            type: 'PASSIVE',
            description: 'Gains Shielded. When Shielded is removed, it recharges for 5 of your turns before gaining Shielded again. Shielded blocks all incoming damage from a single attack.',
            cooldown: 5
          }
        ]
      };
    case 'BISHOP':
      return {
        title: 'High Cleric',
        active: {
          name: 'Divine Judgement',
          type: 'ACTIVE',
          description: 'Choose one: Restore 3 HP to one allied piece within 2 tiles, OR Deal 3 damage to the first enemy in line of sight.',
          cooldown: 3,
        },
        superAction: {
          name: 'Resurrection',
          type: 'SUPER',
          description: 'Revive one defeated allied piece (except King/Guard) on any empty square of your back rank with 50% max HP. Loses all Valor and Resolve.',
          conditions: ['Defeat an enemy', 'Ability successfully affects target', 'Heal 6 HP or Deal 6 damage via Ability']
        },
        passives: [
          {
            name: 'Divine Blessing',
            type: 'PASSIVE',
            description: 'At the start of your turn, restore 1 HP to one damaged allied piece following priority order (King > Queen > Iron Bastion > Knight > Bishop > Guard > Soldier). Cannot target self.',
            cooldown: 3
          }
        ]
      };
    case 'KNIGHT':
      return {
        title: 'Grand Paladin',
        active: {
          name: 'Charge',
          type: 'ACTIVE',
          description: 'Choose one legal destination. If occupied by an enemy that would be defeated: deal 4 damage, 2 splash damage to adjacent enemies, and occupy square. If empty: Leap normally, deal 2 splash damage to adjacent enemies.',
          cooldown: 3,
        },
        superAction: {
          name: 'Lethal Pounce',
          type: 'SUPER',
          description: 'Target one non-King enemy on a legal destination. Immediately defeat the target, ignoring Shielded/Armored/Guarded, and occupy the square.',
          conditions: ['Defeat an enemy', 'Ability successfully affects target', 'Damage a Marked enemy again']
        },
        passives: [
          {
            name: 'Tactical Evasion',
            type: 'PASSIVE',
            description: 'Whenever the Knight survives taking damage, it may immediately perform one legal Knight jump to an empty square.',
            cooldown: 3
          },
          {
            name: 'Relentless Pursuit',
            type: 'PASSIVE',
            description: 'The first enemy damaged becomes Marked. Whenever damaging a Marked piece again: remove Marked and gain 1 Valor.',
          }
        ]
      };
    case 'PAWN':
      return {
        title: 'Soldier',
        active: {
          name: 'Brace',
          type: 'ACTIVE',
          description: 'Gain Shielded. Shielded expires at the start of your next turn if unused.',
          cooldown: 2,
        },
        passives: [
          {
            name: 'Opening March',
            type: 'PASSIVE',
            description: 'On its first movement only, the Soldier may move two tiles forward instead of one. Both destination squares must be empty.',
          }
        ]
      };
    case 'ROYAL_GUARD':
      return {
        title: 'Guard',
        passives: [
          {
            name: 'Bulwark',
            type: 'PASSIVE',
            description: 'Upon being summoned, the Guard gains Shielded. This Shielded does not regenerate.',
          },
          {
            name: 'Unwavering Loyalty',
            type: 'PASSIVE',
            description: 'While adjacent to its King: The Guard gains Guarding, and the King gains Guarded (1). Removed if not adjacent. Additionally, the Guard\'s absolute loyalty to the Crown makes them immune to Charm.',
          }
        ]
      };
  }
}
