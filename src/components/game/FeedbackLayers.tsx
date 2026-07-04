import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, ShieldAlert } from 'lucide-react';

// --- FLOATING TEXTS ---
interface FloatingTextProps {
  text: string;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'passive' | 'super' | 'valor' | 'resolve';
  onComplete: () => void;
}

export function FloatingText({ text, type, onComplete }: FloatingTextProps) {
  const colorMap: Record<string, string> = {
    damage: 'text-red-500 font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-sm md:text-base font-cinzel tracking-wider',
    heal: 'text-emerald-500 font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-sm md:text-base font-cinzel tracking-wider animate-pulse',
    buff: 'text-amber-400 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[10px] uppercase tracking-widest font-cinzel',
    debuff: 'text-cyan-400 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[10px] uppercase tracking-widest font-cinzel',
    passive: 'text-amber-500 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-xs font-cinzel tracking-wider',
    super: 'text-blood-400 font-black drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-xs md:text-sm uppercase tracking-widest font-cinzel',
    valor: 'text-amber-500 font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] text-[10px] font-cinzel tracking-wider',
    resolve: 'text-stone-300 font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] text-[10px] font-cinzel tracking-wider',
  };

  const isDmg = type === 'damage';

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 8, 
        scale: isDmg ? 1.25 : 0.9,
        x: isDmg ? (Math.random() * 20 - 10) : 0 
      }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: isDmg ? [-10, -40] : [-5, -50],
        scale: isDmg ? [1.25, 0.95, 0.95, 0.85] : [0.9, 1.05, 1.05, 0.9],
      }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className={`absolute z-40 pointer-events-none select-none text-center whitespace-nowrap ${colorMap[type] || 'text-white'}`}
    >
      {text}
    </motion.div>
  );
}

// --- PARTICLE EMITTER ---
interface ParticleEmitterProps {
  type: 'heal' | 'spark' | 'shatter' | 'magic' | 'slash' | 'ice' | 'super_holy' | 'super_bastion' | 'super_ice' | 'super_command' | 'ice_break';
  onComplete: () => void;
}

export function ParticleEmitter({ type, onComplete }: ParticleEmitterProps) {
  const isSuper = type.startsWith('super');
  const count = type === 'ice_break' ? 18 : (isSuper ? 24 : 12);
  
  const colors: Record<string, string> = {
    heal: 'bg-emerald-500 shadow-[0_0_6px_#10b981]',
    spark: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
    shatter: 'bg-cyan-300 shadow-[0_0_6px_#06b6d4]',
    magic: 'bg-purple-500 shadow-[0_0_6px_#a855f7]',
    slash: 'bg-red-500 shadow-[0_0_6px_#ef4444]',
    ice: 'bg-cyan-200 shadow-[0_0_6px_#ecfeff]',
    ice_break: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee,0_0_3px_#ffffff]',
    super_holy: 'bg-amber-400 shadow-[0_0_12px_#f59e0b,0_0_4px_#ffffff]',
    super_bastion: 'bg-stone-500 shadow-[0_0_10px_#78716c]',
    super_ice: 'bg-cyan-300 shadow-[0_0_12px_#06b6d4,0_0_4px_#ffffff]',
    super_command: 'bg-blood-500 shadow-[0_0_12px_#9e1b1b]',
  };

  const colorClass = colors[type] || 'bg-white';

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const speed = type === 'ice_break' ? (25 + Math.random() * 65) : (isSuper ? (35 + Math.random() * 95) : (20 + Math.random() * 45));
      const size = type === 'ice_break' ? (3 + Math.random() * 4) : (isSuper ? (3 + Math.random() * 4) : (2 + Math.random() * 2));
      const duration = type === 'ice_break' ? (0.5 + Math.random() * 0.4) : (isSuper ? (0.7 + Math.random() * 0.7) : (0.4 + Math.random() * 0.4));

      return {
        id: i,
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
        size,
        duration,
      };
    });
  }, [count, type, isSuper]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y, 
            scale: [1, 1.25, 0], 
            opacity: [1, 0.9, 0],
            rotate: type === 'ice_break' ? [0, Math.random() * 360] : 0
          }}
          style={{
            width: p.size,
            height: p.size,
            borderRadius: type === 'ice_break' ? '1px' : '50%',
            position: 'absolute'
          }}
          transition={{ duration: p.duration, ease: "easeOut" }}
          className={colorClass}
        />
      ))}
      {/* Hidden monitor to signal cleanup */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        onAnimationComplete={onComplete}
        className="hidden"
      />
    </div>
  );
}

// --- LAST STAND ANNOUNCEMENT OVERLAY ---
interface LastStandAnnouncementProps {
  name: string;
}

export function LastStandAnnouncementOverlay({ name }: LastStandAnnouncementProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: [0.9, 1.05, 1], y: 0, opacity: [0, 1, 1] }}
        transition={{ duration: 2.0, ease: "easeInOut" }}
        className="w-full max-w-lg mx-4 bg-gradient-to-r from-blood-950/90 via-stone-900/95 to-blood-950/90 border-y-2 border-blood-600 py-8 px-10 text-center flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,transparent_70%)] animate-pulse" />
        
        <ShieldAlert className="w-12 h-12 text-blood-500 animate-pulse" />
        <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase text-stone-300 font-bold">Kingdom's Final Hope</h3>
        <h2 className="font-cinzel text-2xl md:text-4xl tracking-widest uppercase font-black text-stone-100">
          Last Stand
        </h2>
        <p className="font-cinzel text-xs md:text-sm tracking-widest text-stone-400 max-w-sm">
          The Sovereign refuses to fall. The kingdom rallies for one final defiant act.
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- EPIC SUPER ANNOUNCEMENT OVERLAY ---
interface SuperAnnouncementProps {
  name: string;
  type: string;
}

export function SuperAnnouncementOverlay({ name, type }: SuperAnnouncementProps) {
  const titles: Record<string, string> = {
    QUEEN: 'ICE PALACE ACTIVATED',
    KING: "KING'S COMMAND DECREED",
    ROOK: 'BASTION FORTIFIED',
    BISHOP: 'DIVINE RESURRECTION AWAKENED',
  };

  const colors: Record<string, string> = {
    QUEEN: 'from-cyan-900/80 via-slate-900/90 to-cyan-900/80 border-cyan-500 text-cyan-300',
    KING: 'from-amber-900/80 via-stone-900/90 to-amber-900/80 border-gold-500 text-amber-300',
    ROOK: 'from-stone-800/80 via-neutral-900/90 to-stone-800/80 border-stone-500 text-stone-300',
    BISHOP: 'from-amber-900/80 via-stone-900/90 to-amber-900/80 border-yellow-500 text-yellow-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: [0.8, 1.05, 1, 1, 0.9], y: 0, opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 2.8, times: [0, 0.1, 0.15, 0.85, 1.0], ease: "easeInOut" }}
        className={`w-full max-w-xl mx-4 bg-gradient-to-r ${colors[type] || colors.KING} border-y-2 py-6 px-8 text-center flex flex-col items-center gap-3 shadow-2xl relative overflow-hidden`}
      >
        {/* Magic background sparkles */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
        
        <Sparkles className="w-8 h-8 text-gold-500 animate-spin-slow" />
        <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-stone-400 font-semibold">ULTIMATE ACTION</h3>
        <h2 className="font-cinzel text-xl md:text-3xl tracking-widest uppercase font-extrabold">
          {name}
        </h2>
        <p className="font-cinzel text-[10px] md:text-xs tracking-widest text-stone-400 max-w-md">
          {titles[type] || 'A legendary power is unleashed upon the board.'}
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- VANGUARD PROMOTION ANNOUNCEMENT ---
interface PromoAnnouncementProps {
  name: string;
}

export function PromoAnnouncementOverlay({ name }: PromoAnnouncementProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px] pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: [0.85, 1.02, 1, 1, 0.95], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 2.3, times: [0, 0.1, 0.15, 0.85, 1.0] }}
        className="bg-gradient-to-r from-amber-950/80 via-stone-900/90 to-amber-950/80 border-y border-amber-500 py-6 px-12 text-center flex flex-col items-center gap-2 shadow-2xl relative overflow-hidden"
      >
        <Award className="w-8 h-8 text-amber-500 animate-bounce" />
        <h3 className="font-cinzel text-xs tracking-widest uppercase text-stone-400">Soldier Ascended</h3>
        <h2 className="font-cinzel text-xl md:text-2xl tracking-[0.15em] text-amber-300 font-black uppercase">
          Promoted to {name}
        </h2>
        <p className="font-cinzel text-[10px] tracking-wider text-stone-500">
          A new champion stands, ready to rewrite the war's fate.
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- ASCENSION RITE PENDING ANNOUNCEMENT (RED ACCENTS) ---
export function PrePromoAnnouncementOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: [0.85, 1.02, 1, 1, 0.95], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 1.8, times: [0, 0.1, 0.15, 0.85, 1.0] }}
        className="bg-gradient-to-r from-red-950/90 via-stone-900/95 to-red-950/90 border-y border-red-600 py-6 px-12 text-center flex flex-col items-center gap-2 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.2)_0%,transparent_70%)] animate-pulse" />
        <Award className="w-8 h-8 text-red-500 animate-bounce relative z-10" />
        <h3 className="font-cinzel text-xs tracking-widest uppercase text-red-400 relative z-10">Ascension Rite</h3>
        <h2 className="font-cinzel text-xl md:text-2xl tracking-[0.15em] text-red-500 font-black uppercase relative z-10 drop-shadow">
          Mantle Ascension Pending
        </h2>
        <p className="font-cinzel text-[10px] tracking-wider text-stone-400 relative z-10">
          A Soldier stands on the threshold of a glorious, crimson transformation.
        </p>
      </motion.div>
    </motion.div>
  );
}
