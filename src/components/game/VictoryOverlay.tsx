import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { PieceColor, GameState, PieceType } from '../../types';
import { Button } from '../ui/Button';
import { PieceIcon } from './PieceIcon';
import { audio } from '../../lib/audio';

interface VictoryOverlayProps {
  winner: PieceColor;
  gameState: GameState;
  onReturn: () => void;
  onPlayAgain: () => void;
  onReviewMatch: () => void;
}

// Inline SVGs for elegant Kingdom Banners
export function RoyalBanner({ color, className = "w-6 h-8" }: { color: 'WHITE' | 'BLACK', className?: string }) {
  if (color === 'WHITE') {
    return (
      <svg viewBox="0 0 100 120" className={`${className} drop-shadow-md`}>
        <path d="M 10 10 L 90 10 L 90 90 L 50 110 L 10 90 Z" fill="#e7e5e4" stroke="#d97706" strokeWidth="4" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="#d97706" strokeWidth="3" />
        <path d="M 50 25 L 50 75 M 25 50 L 75 50 M 32 32 L 68 68 M 32 68 L 68 32" stroke="#d97706" strokeWidth="3.5" />
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 100 120" className={`${className} drop-shadow-md`}>
        <path d="M 10 10 L 90 10 L 90 90 L 50 110 L 10 90 Z" fill="#292524" stroke="#78716c" strokeWidth="4" />
        <path d="M 30 70 L 70 70 L 65 45 L 50 55 L 35 45 Z" fill="#7a1212" stroke="#78716c" strokeWidth="2.5" />
        <path d="M 50 25 L 50 40" stroke="#78716c" strokeWidth="3.5" />
      </svg>
    );
  }
}

// Particle/Embers Canvas Background Component
export function VictoryCanvas({ isVictory }: { isVictory: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number; life: number; maxLife: number; color: string }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const createParticle = () => {
      const size = Math.random() * 2.0 + 0.5;
      const x = Math.random() * canvas.width;
      const y = isVictory ? canvas.height + 10 : Math.random() * canvas.height - 20;
      const speedY = isVictory 
        ? -(Math.random() * 0.5 + 0.1) // slow rise
        : (Math.random() * 0.3 + 0.1);   // slow fall
      const speedX = (Math.random() * 0.2 - 0.1);
      const maxLife = Math.random() * 240 + 120;
      
      // Grayish-amber/stone-like light dust particles
      const color = `rgba(${120 + Math.floor(Math.random() * 30)}, ${115 + Math.floor(Math.random() * 30)}, ${110 + Math.floor(Math.random() * 30)}, `;

      return { x, y, size, speedY, speedX, opacity: Math.random() * 0.3 + 0.1, life: 0, maxLife, color };
    };

    // Pre-populate particles
    for (let i = 0; i < 30; i++) {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Ambient radial gradient centered glow - extremely dark stone/charcoal neutral
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 40,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.4
      );
      // Dark slate/stone neutral gradient
      grad.addColorStop(0, 'rgba(28, 25, 23, 0.1)');
      grad.addColorStop(1, 'rgba(12, 10, 9, 0.98)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add fresh particles
      if (particles.length < 35 && Math.random() < 0.2) {
        particles.push(createParticle());
      }

      particles = particles.filter(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;
        
        const ageRatio = p.life / p.maxLife;
        const currentOpacity = p.opacity * (1 - ageRatio);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentOpacity})`;
        
        ctx.shadowBlur = 0; // No glow to keep it non-distracting

        ctx.fill();

        return p.life < p.maxLife && p.y >= -20 && p.y <= canvas.height + 20 && p.x >= -20 && p.x <= canvas.width + 20;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isVictory]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none -z-10" />;
}

// Piece class naming reference
const pieceTypeNames: Record<PieceType, string> = {
  KING: 'Sovereign',
  QUEEN: 'Empress',
  ROOK: 'Iron Bastion',
  KNIGHT: 'Grand Paladin',
  BISHOP: 'High Cleric',
  PAWN: 'Soldier',
  ROYAL_GUARD: 'Guard'
};

// MVP selection details generator
function getMVPDetails(mvp: any, isWinner: boolean) {
  const type = mvp.type as PieceType;
  let honorific = "Paragon Against the Crownfall";
  let description = "";

  switch (type) {
    case 'KING':
      honorific = isWinner ? "Sovereign of Salvation" : "Shattered Sovereign";
      description = isWinner
        ? "Let it be inscribed within the Royal Chronicle that the Sovereign stood resolute at the center of the battlefield, commanding the forces with divine authority. When the darkness closed in, his royal commands shattered the enemy's resolve, ensuring the Crown endured."
        : "Though the Kingdom fell, the Sovereign's final stand remains a testament to royal courage. He fought until the end, defending the sacred borders with his life, ensuring that even in defeat, the memory of his reign is gilded in gold.";
      break;
    case 'QUEEN':
      honorific = isWinner ? "Harbinger of Conquest" : "Fury of the Fallen";
      description = isWinner
        ? "The Empress moved across the battlefield with regal grace and devastating precision, unleashing a froststorm that froze the enemy's vanguard. Her chilling gaze charmed the mighty, and her wrath cleared the path to absolute victory."
        : "Even as darkness descended, the Empress raged against the dying light. Let the annals record that her ice palaces stood firm, casting a freezing shadow over the conquerors and striking fear into their hearts until the final bell.";
      break;
    case 'ROOK':
      honorific = isWinner ? "Bulwark of the Realm" : "Unbroken Shield";
      description = isWinner
        ? "The Iron Bastion stood as an immovable fortress, absorbing the full weight of the enemy's onslaught. Her shields did not break; her armored shell shielded the Sovereign and her allies, ensuring not a single drop of royal blood was spilled in vain."
        : "Though the walls eventually breached, the Iron Bastion bore the heaviest burden of the siege. She shielded her allies from countless fatal strikes, standing as a monument of steel and duty until the very end.";
      break;
    case 'KNIGHT':
      honorific = isWinner ? "Grand Templar of Victory" : "Beacon of the Vanguard";
      description = isWinner
        ? "The Grand Paladin galloped into the fray with unmatched speed, leaping over the enemy's front lines to strike at their soft underbelly. With lance and shield, he marked their champions and routed their hosts, carving the path to glory."
        : "Against impossible odds, the Grand Paladin rode with absolute conviction. He leaped into the heart of danger to defend the retreating, marking his enemies for vengeance and leaving a trail of broken armor before he was finally overwhelmed.";
      break;
    case 'BISHOP':
      honorific = isWinner ? "Archon of Divine Light" : "Martyr of the Sanctuary";
      description = isWinner
        ? "The High Cleric's prayers echoed across the valley, restoring hope and health to the battered warriors. Her divine judgment smote the wicked, while her blessings resurrected a fallen champion to seal the victory."
        : "In the darkest hour, the High Cleric's light shone brightest. She healed the wounded and brought comfort to the dying, calling upon the heavens to resurrect fallen allies to stand once more against the gathering dark.";
      break;
    case 'PAWN':
      honorific = isWinner ? "Hero of the Common Guard" : "Unsung Legend";
      description = isWinner
        ? "A humble Soldier who rose to legendary heights, marching relentlessly into the enemy's back ranks to promote into a champion of the realm. Her quiet courage held the line when the giants clashed, securing victory for the Kingdom."
        : "Let the realm remember the bravery of the Soldiers who held the line against insurmountable terrors. They marched without fear into the shadow of giants, sacrificing everything to protect the Crown until their final breaths.";
      break;
    case 'ROYAL_GUARD':
      honorific = isWinner ? "Guardian of the Throne" : "Dutiful Shield-Bearer";
      description = isWinner
        ? "The Guard stood as a vigilant sentinel beside the throne, intercepting strikes aimed at the Sovereign. With kite shield raised, he diverted fatal blows onto himself, proving that loyalty is the strongest armor."
        : "Though the Sovereign fell, the Guard's shield did not falter. He stood as a human wall, taking the blows meant for his king, fulfilling his sacred vow of protection until the light faded from his eyes.";
      break;
  }

  return { honorific, description };
}

// Honors Card detail assigner
function getHonorDetails(honor: any) {
  const type = honor.type as PieceType;
  let title = "Champion of Valor";
  let commendation = "Fought with honor and prestige on the field.";

  const stats = [
    { name: 'prevented', val: (honor.damagePrevented || 0) * 1.2 },
    { name: 'damage', val: honor.damageDealt || 0 },
    { name: 'healing', val: (honor.healing || 0) * 1.5 },
    { name: 'kills', val: (honor.kills || 0) * 3.5 },
    { name: 'supers', val: (honor.supersUsed || 0) * 4 }
  ].sort((a, b) => b.val - a.val);

  const bestStat = stats[0].name;

  if (bestStat === 'prevented' || type === 'ROOK' || type === 'ROYAL_GUARD') {
    title = "Shield of the Realm";
    commendation = "Absorbed countless blows that would have laid low our warriors.";
  } else if (bestStat === 'healing' || type === 'BISHOP') {
    title = "Light of the Kingdom";
    commendation = "Mended the wounds of battle and breathed life into the weary.";
  } else if (bestStat === 'damage' || type === 'QUEEN') {
    title = "Harbinger of War";
    commendation = "Brought fire and fury, laying waste to the enemy's vanguard.";
  } else if (bestStat === 'supers') {
    title = "Champion of Valor";
    commendation = "Channeled the kingdom's hope to unleash legendary powers.";
  } else if (type === 'PAWN') {
    title = "Steadfast Veteran";
    commendation = "Marched tirelessly through the blood and mud to hold the front line.";
  } else {
    title = "Slayer of Champions";
    commendation = "Hunted down the enemy's elite, ending their threat forever.";
  }

  return { title, commendation };
}

export function VictoryOverlay({ winner, gameState, onReturn, onPlayAgain, onReviewMatch }: VictoryOverlayProps) {
  const mode = gameState.setup.mode;
  const bottomColor = gameState.setup.bottomColor;
  const isLocal = mode === 'LOCAL_PVP';

  // Compute victory logical conditions
  const isVictory = (isLocal || mode === 'WAR_TABLE') ? true : (winner === bottomColor);

  // Play outcome specific cues
  useEffect(() => {
    if (isVictory) {
      audio.playReady('super');
    } else {
      audio.playReady('ability');
    }
  }, [isVictory]);

  // Determine statistical alignments
  const leftColor: 'WHITE' | 'BLACK' = (isLocal || mode === 'WAR_TABLE') ? 'WHITE' : bottomColor;
  const rightColor: 'WHITE' | 'BLACK' = leftColor === 'WHITE' ? 'BLACK' : 'WHITE';

  const leftLabel = (isLocal || mode === 'WAR_TABLE') ? 'WHITE' : 'YOU';
  const rightLabel = (isLocal || mode === 'WAR_TABLE') ? 'BLACK' : 'AI';

  const statsFallback = { defeated: 0, damageDealt: 0, damageTaken: 0, damagePrevented: 0, healing: 0, valorEarned: 0, resolveEarned: 0, promotions: 0, supersUsed: 0 };
  const leftStats = gameState.matchStats?.[leftColor] || statsFallback;
  const rightStats = gameState.matchStats?.[rightColor] || statsFallback;

  // Objective selection of MVP and Runner-Up Honors
  const { mvp, honors } = useMemo(() => {
    const perfs = gameState.piecePerformances ? Object.values(gameState.piecePerformances) : [];
    const allRecords = [...perfs];

    // Ensure safe default records exist if they haven't acted yet
    const fallbackWinnerColor = winner;
    const fallbackLoserColor = winner === 'WHITE' ? 'BLACK' : 'WHITE';
    const defaults = [
      { type: 'QUEEN', color: fallbackWinnerColor, score: 5 },
      { type: 'KNIGHT', color: fallbackWinnerColor, score: 4 },
      { type: 'ROOK', color: fallbackWinnerColor, score: 3 },
      { type: 'BISHOP', color: fallbackWinnerColor, score: 2 },
      { type: 'PAWN', color: fallbackWinnerColor, score: 1 },
      { type: 'KING', color: fallbackWinnerColor, score: 0 },
      { type: 'ROYAL_GUARD', color: fallbackWinnerColor, score: 0 },
      { type: 'QUEEN', color: fallbackLoserColor, score: -1 },
      { type: 'KNIGHT', color: fallbackLoserColor, score: -2 },
      { type: 'ROOK', color: fallbackLoserColor, score: -3 },
    ];

    defaults.forEach(def => {
      const exists = allRecords.some(r => r.type === def.type && r.color === def.color);
      if (!exists) {
        allRecords.push({
          type: def.type as PieceType,
          color: def.color as PieceColor,
          damageDealt: def.score > 0 ? def.score * 2.5 : 0,
          damagePrevented: def.score > 0 ? def.score * 1.5 : 0,
          healing: 0,
          kills: def.score > 0 ? 1 : 0,
          supersUsed: 0,
          score: def.score * 4
        });
      }
    });

    const sorted = allRecords.sort((a, b) => b.score - a.score);
    const mvpPiece = sorted[0];
    const honorsList = sorted.slice(1, 3);

    return { mvp: mvpPiece, honors: honorsList };
  }, [gameState.piecePerformances, winner]);

  const mvpDetails = getMVPDetails(mvp, mvp.color === winner);
  const honor1Details = getHonorDetails(honors[0]);
  const honor2Details = getHonorDetails(honors[1]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-stone-950/85 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Immersive Canvas Backdrop */}
      <VictoryCanvas isVictory={isVictory} />

      {/* Main Container Card - highly space efficient */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="w-full max-w-4xl bg-stone-900/95 border border-stone-800/80 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] p-2.5 sm:p-4 flex flex-col max-h-[98vh] md:max-h-[94vh] overflow-hidden relative backdrop-blur-sm"
      >
        {/* Subtle royal framing lines */}
        <div className="absolute inset-1.5 border border-stone-800/20 pointer-events-none" />
        
        {/* HEADER SECTION */}
        <div className="text-center mb-1.5 sm:mb-2.5 relative">
          <p className="font-cinzel text-[9px] sm:text-[10px] tracking-[0.25em] text-stone-400 uppercase leading-none">
            {isLocal || mode === 'WAR_TABLE' ? 'THE CROWN ENDURES' : (isVictory ? 'THE CROWN ENDURES' : 'THE CROWN HAS FALLEN')}
          </p>
          <h1 className={`font-cinzel text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.1em] uppercase mt-0.5 leading-tight ${
            isVictory 
              ? 'text-blood-500 [text-shadow:0_0_15px_rgba(220,38,38,0.45)]' 
              : 'text-stone-400 [text-shadow:0_0_15px_rgba(120,113,108,0.3)]'
          }`}>
            {isLocal || mode === 'WAR_TABLE' 
              ? `${winner === 'WHITE' ? 'White Kingdom' : 'Black Kingdom'} Victorious` 
              : (isVictory ? 'Victory' : 'Defeat')}
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 sm:mt-1">
            <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-r from-transparent to-stone-700"></span>
            <span className="font-cinzel text-[7px] sm:text-[9px] tracking-widest text-stone-500 uppercase leading-none">
              Battle Record • Turn {gameState.turn}
            </span>
            <span className="h-[1px] w-6 sm:w-12 bg-gradient-to-l from-transparent to-stone-700"></span>
          </div>
        </div>

        {/* CONTENT SPLIT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 flex-grow overflow-hidden pr-0.5 pb-1">
          
          {/* LEFT SECTION (Battle Chronicle & MVP below it) */}
          <div className="md:col-span-6 flex flex-col gap-2.5 overflow-hidden md:border-r border-stone-800/40 md:pr-4 pb-2.5 md:pb-0">
            
            {/* Battle Chronicle Compare */}
            <div className="w-full flex-shrink-0">
              <h3 className="font-cinzel text-[9px] sm:text-[10px] text-stone-400 tracking-widest uppercase mb-1 text-center font-bold">
                Battle Chronicle
              </h3>
              <div className="bg-stone-950/45 border border-stone-850/60 rounded-xs p-1 sm:p-1.5 space-y-0.5">
                {/* Headers */}
                <div className="grid grid-cols-5 items-center text-[8px] sm:text-[9px] font-cinzel text-stone-500 font-bold border-b border-stone-850/40 pb-0.5 mb-1 px-1">
                  <span className={`col-span-1 text-right pr-2 ${leftColor === 'WHITE' ? 'text-stone-300' : 'text-stone-500'}`}>{leftLabel}</span>
                  <span className="col-span-3 text-center tracking-widest uppercase text-stone-400">STATISTIC</span>
                  <span className={`col-span-1 text-left pl-2 ${rightColor === 'WHITE' ? 'text-stone-300' : 'text-stone-500'}`}>{rightLabel}</span>
                </div>
                {/* Stats rows */}
                {[
                  { label: 'Pieces Defeated', valL: leftStats.defeated, valR: rightStats.defeated },
                  { label: 'Damage Dealt', valL: leftStats.damageDealt, valR: rightStats.damageDealt },
                  { label: 'Damage Taken', valL: leftStats.damageTaken || 0, valR: rightStats.damageTaken || 0 },
                  { label: 'Damage Prevented', valL: leftStats.damagePrevented, valR: rightStats.damagePrevented },
                  { label: 'Healing', valL: leftStats.healing, valR: rightStats.healing },
                  { label: 'Valor Gained', valL: leftStats.valorEarned, valR: rightStats.valorEarned },
                  { label: 'Resolve Gained', valL: leftStats.resolveEarned, valR: rightStats.resolveEarned },
                  { label: 'Promotions', valL: leftStats.promotions, valR: rightStats.promotions },
                  { label: 'Supers Used', valL: leftStats.supersUsed, valR: rightStats.supersUsed }
                ].map((stat, idx) => (
                  <div key={idx} className="grid grid-cols-5 items-center text-[10px] py-0.5 hover:bg-stone-800/10 transition-colors px-1 border-b border-stone-900/40 last:border-0">
                    <span className="col-span-1 text-right pr-2 font-mono text-stone-300 font-semibold">{stat.valL}</span>
                    <span className="col-span-3 text-center font-cinzel text-stone-400 text-[8px] sm:text-[9px] tracking-wider uppercase">
                      {stat.label}
                    </span>
                    <span className="col-span-1 text-left pl-2 font-mono text-stone-300 font-semibold">{stat.valR}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MVP Section - occupies the remainder */}
            <div className="flex-grow bg-gradient-to-b from-stone-950/65 to-stone-950/35 border border-blood-500/25 p-1.5 sm:p-2 rounded-xs relative flex items-center gap-2.5 sm:gap-3 shadow-sm min-h-0">
              {/* Highlight background elements */}
              <div className="absolute top-1 right-1 pointer-events-none opacity-5">
                <svg className="w-10 h-10 text-blood-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>

              {/* Large MVP icon frame with Kingdom Banner */}
              <div className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 bg-stone-900/90 border border-blood-500/35 rounded-xs shadow-inner">
                {/* Miniature Kingdom Banner attached to MVP frame */}
                <div className="absolute -top-1 -left-1">
                  <RoyalBanner color={mvp.color} className="w-3 h-4" />
                </div>
                <PieceIcon 
                  type={mvp.type} 
                  color={mvp.color} 
                  className="w-[85%] h-[85%] drop-shadow-[0_0_6px_rgba(220,38,38,0.25)]"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="font-cinzel text-[8px] sm:text-[9px] text-blood-500 tracking-[0.25em] font-semibold uppercase block leading-none mb-0.5">
                  Most Valuable Piece
                </span>
                <h4 className="font-cinzel text-[10px] sm:text-xs text-stone-400 tracking-wider uppercase font-bold truncate leading-tight">
                  {mvpDetails.honorific}
                </h4>
                <h2 className="font-cinzel text-xs sm:text-sm text-blood-500 font-bold tracking-widest mt-0.5 leading-none">
                  ★ {pieceTypeNames[mvp.type as PieceType].toUpperCase()} ★
                </h2>
                <span className="font-cinzel text-[7px] sm:text-[8px] text-stone-500 tracking-widest uppercase block mt-0.5">
                  {mvp.color === 'WHITE' ? 'White Kingdom' : 'Black Kingdom'}
                </span>
                <p className="font-serif italic text-stone-300 text-[8px] sm:text-[10px] leading-relaxed mt-1 border-t border-stone-850/40 pt-1 text-justify overflow-hidden text-ellipsis line-clamp-2 md:line-clamp-3">
                  "{mvpDetails.description}"
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Final Board snapshot at the top, and Honors side-by-side below it) */}
          <div className="md:col-span-6 flex flex-col gap-2.5 overflow-hidden pl-0 md:pl-2">
            
            {/* Final Board Position Snapshot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="font-cinzel text-[9px] sm:text-[10px] text-stone-400 tracking-widest uppercase mb-1 sm:mb-2 font-semibold">
                Final Board Position
              </span>
              <div className="p-1 bg-stone-950/80 border border-blood-500/20 rounded-xs shadow-md">
                <div className="grid grid-cols-8 grid-rows-8 border border-stone-900 bg-stone-900 rounded-xs overflow-hidden w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48">
                  {Array.from({ length: 8 }).map((_, r) =>
                    Array.from({ length: 8 }).map((_, c) => {
                      const p = gameState.board[r][c];
                      const isLight = (r + c) % 2 === 0;
                      return (
                        <div 
                          key={`${r}-${c}`} 
                          className={`relative flex items-center justify-center ${isLight ? 'bg-stone-850' : 'bg-stone-900'}`}
                        >
                          {p && (
                            <PieceIcon 
                              type={p.type} 
                              color={p.color} 
                              className="w-[85%] h-[85%]"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Honors Bestowed Section - aligned side-by-side */}
            <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
              <h3 className="font-cinzel text-[9px] sm:text-[10px] text-stone-500 tracking-widest uppercase mb-1 font-bold text-center">
                Honors Bestowed
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 flex-grow overflow-hidden">
                
                {/* Honor Card 1 */}
                <div className="bg-stone-950/45 border border-blood-500/15 p-1.5 rounded-xs flex flex-col items-center justify-center text-center relative shadow-sm hover:border-blood-500/35 transition-colors min-h-0">
                  <div className="absolute top-1 left-1">
                    <RoyalBanner color={honors[0].color} className="w-2.5 h-3.5" />
                  </div>
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-stone-900/50 border border-stone-800 rounded-xs flex items-center justify-center p-0.5 mb-1">
                    <PieceIcon type={honors[0].type} color={honors[0].color} className="w-[90%] h-[90%]" />
                  </div>
                  <div className="min-w-0 px-1">
                    <span className="font-cinzel text-[7px] sm:text-[8px] text-blood-500 font-bold tracking-wider block leading-none">
                      {honor1Details.title}
                    </span>
                    <h5 className="font-cinzel text-[9px] sm:text-[10px] text-stone-300 font-bold uppercase tracking-wider mt-0.5 leading-none">
                      {pieceTypeNames[honors[0].type as PieceType]}
                    </h5>
                    <span className="font-cinzel text-[6.5px] sm:text-[7.5px] text-stone-500 uppercase tracking-widest block leading-none mt-0.5">
                      {honors[0].color === 'WHITE' ? 'White Kingdom' : 'Black Kingdom'}
                    </span>
                  </div>
                  <p className="font-serif italic text-stone-400 text-[8px] sm:text-[9px] leading-snug mt-1 border-t border-stone-850/40 pt-1 text-center w-full max-w-[90%] line-clamp-2">
                    "{honor1Details.commendation}"
                  </p>
                </div>

                {/* Honor Card 2 */}
                <div className="bg-stone-950/45 border border-blood-500/15 p-1.5 rounded-xs flex flex-col items-center justify-center text-center relative shadow-sm hover:border-blood-500/35 transition-colors min-h-0">
                  <div className="absolute top-1 left-1">
                    <RoyalBanner color={honors[1].color} className="w-2.5 h-3.5" />
                  </div>
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-stone-900/50 border border-stone-800 rounded-xs flex items-center justify-center p-0.5 mb-1">
                    <PieceIcon type={honors[1].type} color={honors[1].color} className="w-[90%] h-[90%]" />
                  </div>
                  <div className="min-w-0 px-1">
                    <span className="font-cinzel text-[7px] sm:text-[8px] text-blood-500 font-bold tracking-wider block leading-none">
                      {honor2Details.title}
                    </span>
                    <h5 className="font-cinzel text-[9px] sm:text-[10px] text-stone-300 font-bold uppercase tracking-wider mt-0.5 leading-none">
                      {pieceTypeNames[honors[1].type as PieceType]}
                    </h5>
                    <span className="font-cinzel text-[6.5px] sm:text-[7.5px] text-stone-500 uppercase tracking-widest block leading-none mt-0.5">
                      {honors[1].color === 'WHITE' ? 'White Kingdom' : 'Black Kingdom'}
                    </span>
                  </div>
                  <p className="font-serif italic text-stone-400 text-[8px] sm:text-[9px] leading-snug mt-1 border-t border-stone-850/40 pt-1 text-center w-full max-w-[90%] line-clamp-2">
                    "{honor2Details.commendation}"
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* BUTTON ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-1.5 sm:mt-2.5 pt-1.5 border-t border-stone-850/40 relative flex-shrink-0">
          <Button 
            id="play-again-btn"
            variant="primary" 
            size="sm" 
            onClick={onPlayAgain} 
            className="w-full sm:w-auto h-8 px-5 py-0 font-cinzel tracking-widest font-semibold uppercase text-[10px]"
          >
            Play Again
          </Button>
          <Button 
            id="review-match-btn"
            variant="outline" 
            size="sm" 
            onClick={onReviewMatch} 
            className="w-full sm:w-auto h-8 px-5 py-0 font-cinzel tracking-widest font-semibold uppercase text-[10px]"
          >
            Review Match
          </Button>
          <Button 
            id="main-menu-btn"
            variant="secondary" 
            size="sm" 
            onClick={onReturn} 
            className="w-full sm:w-auto h-8 px-5 py-0 font-cinzel tracking-widest font-semibold uppercase text-[10px]"
          >
            Main Menu
          </Button>
        </div>

      </motion.div>
    </motion.div>
  );
}
