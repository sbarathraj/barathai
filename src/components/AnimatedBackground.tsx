import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const containerElement = containerRef.current;
    if (containerElement) {
      containerElement.addEventListener('mousemove', handleMouseMove);
      return () => containerElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
      
      const colors = [
        'rgba(6, 182, 212, 0.6)',   // cyan
        'rgba(139, 92, 246, 0.6)',  // violet
        'rgba(236, 72, 153, 0.6)',  // pink
        'rgba(34, 197, 94, 0.6)',   // emerald
        'rgba(249, 115, 22, 0.6)',  // orange
      ];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
      
      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y <= 0 || particle.y >= canvas.height) {
          particle.vy *= -1;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Draw connections to nearby particles
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha = (1 - distance / 100) * 0.2;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none select-none">
      {/* Canvas particle system */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40 dark:opacity-60"
        style={{ zIndex: -1 }}
      />
      
      {/* Multi-layered interactive gradient orbs (balls) */}
      <div 
        className="absolute w-[32rem] h-[32rem] bg-gradient-to-r from-emerald-400/25 via-cyan-400/20 to-blue-400/25 rounded-full blur-3xl animate-float-slow transition-all duration-1000"
        style={{
          top: '5%',
          left: `${8 + mousePosition.x * 4}%`,
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 10}px)`,
          zIndex: -1,
        }}
      />
      <div 
        className="absolute w-[28rem] h-[28rem] bg-gradient-to-r from-violet-400/22 via-purple-400/18 to-pink-400/22 rounded-full blur-2xl animate-float-medium transition-all duration-1000"
        style={{
          top: '20%',
          right: `${12 + mousePosition.y * 4}%`,
          transform: `translate(${-mousePosition.x * 15}px, ${-mousePosition.y * 18}px)`,
          zIndex: -1,
        }}
      />
      <div 
        className="absolute w-[24rem] h-[24rem] bg-gradient-to-r from-pink-400/20 via-rose-400/15 to-orange-400/20 rounded-full blur-xl animate-pulse transition-all duration-1000"
        style={{
          bottom: '25%',
          left: `${25 + mousePosition.x * 3}%`,
          transform: `translate(${mousePosition.x * 12}px, ${mousePosition.y * 15}px)`,
          zIndex: -1,
        }}
      />
      <div 
        className="absolute w-[20rem] h-[20rem] bg-gradient-to-r from-cyan-400/18 via-teal-400/12 to-emerald-400/18 rounded-full blur-lg animate-float-slow transition-all duration-1000"
        style={{
          bottom: '10%',
          right: `${20 + mousePosition.y * 2}%`,
          transform: `translate(${-mousePosition.x * 10}px, ${mousePosition.y * 8}px)`,
          zIndex: -1,
        }}
      />
      <div 
        className="absolute w-[16rem] h-[16rem] bg-gradient-to-r from-indigo-400/15 via-blue-400/10 to-cyan-400/15 rounded-full blur-md animate-float-medium transition-all duration-1000"
        style={{
          top: '70%',
          left: `${70 + mousePosition.x * 2}%`,
          transform: `translate(${mousePosition.x * 8}px, ${-mousePosition.y * 10}px)`,
          zIndex: -1,
        }}
      />
      
      {/* Rainbow floating elements with varied sizes */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full opacity-40 animate-particle-float shadow-xl ${
            i % 6 === 0 ? 'w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500' :
            i % 6 === 1 ? 'w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500' :
            i % 6 === 2 ? 'w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500' :
            i % 6 === 3 ? 'w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500' :
            i % 6 === 4 ? 'w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500' :
            'w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-500'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            zIndex: -1,
          }}
        />
      ))}

      {/* Additional colorful geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className={`absolute opacity-20 animate-float-slow ${
            i % 3 === 0 ? 'w-8 h-8 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-lg rotate-45' :
            i % 3 === 1 ? 'w-6 h-6 bg-gradient-to-br from-lime-400 to-green-500 rounded-full' :
            'w-10 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full'
          }`}
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${20 + Math.random() * 10}s`,
            zIndex: -1,
          }}
        />
      ))}
    </div>
  );
};