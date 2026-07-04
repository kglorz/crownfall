import { ReactNode, ButtonHTMLAttributes, MouseEvent } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { audio } from '../../lib/audio';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative flex items-center justify-center font-cinzel font-semibold tracking-wider uppercase transition-all duration-300 focus:outline-none';
  
  const variants = {
    primary: 'bg-stone-900 text-blood-500 border border-stone-800 hover:border-blood-500/50 hover:bg-stone-850 hover:text-blood-400 hover:shadow-[0_0_15px_rgba(158,27,27,0.3)]',
    secondary: 'bg-stone-900/50 text-stone-300 border border-transparent hover:text-stone-100 hover:bg-stone-800/80',
    outline: 'bg-transparent text-stone-300 border border-stone-700 hover:border-blood-600/50 hover:text-blood-500',
    ghost: 'bg-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-8 py-3',
    lg: 'text-base px-12 py-4',
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    audio.playHover();
    if (props.onMouseEnter) {
      props.onMouseEnter(e);
    }
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    audio.playClick();
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {/* Decorative corners for primary variant */}
      {variant === 'primary' && (
        <>
          <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-blood-600/50"></span>
          <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-blood-600/50"></span>
          <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-blood-600/50"></span>
          <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-blood-600/50"></span>
        </>
      )}
      {children}
    </motion.button>
  );
}
