import { useEffect, useRef } from 'react';

export function MenuBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Mouse Glow Effect
  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const updateGlow = () => {
      // Lerp for slight delay
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;
      
      if (glowRef.current) {
        glowRef.current.style.setProperty('--mouse-x', `${currentX}px`);
        glowRef.current.style.setProperty('--mouse-y', `${currentY}px`);
      }
      
      animationFrameId = requestAnimationFrame(updateGlow);
    };
    
    updateGlow();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Particles Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedY: number; opacity: number; flickerSpeed: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor(window.innerWidth * window.innerHeight / 15000); // Density
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedY: Math.random() * 0.5 + 0.1,
          opacity: Math.random(),
          flickerSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };
    initParticles();

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        // Update position
        p.y -= p.speedY;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        
        // Flicker
        p.opacity += p.flickerSpeed;
        if (p.opacity >= 1 || p.opacity <= 0.1) {
          p.flickerSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Blood red particles
        ctx.fillStyle = `rgba(158, 27, 27, ${Math.max(0.1, p.opacity)})`; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c22929';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 pointer-events-none -z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/50 via-stone-950 to-stone-950"
      />
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10 opacity-60"
      />
      <div 
        ref={glowRef}
        className="fixed inset-0 pointer-events-none -z-10 transition-opacity duration-1000 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(158,27,27,0.07), transparent 80%)'
        }}
      />
    </>
  );
}
