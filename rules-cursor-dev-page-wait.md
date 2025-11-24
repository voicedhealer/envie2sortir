Je veux que tu suive cette idée de page, ls newsletters doivent être récupèrer et stocké comme celles sur la page landing normal du site si des utilisateur souhaitent laissé leurs adresse mail, un message de validation et de remerciement doit apparaitre , le compte à rebours jusqu'au 1er janvier 2026 sous forme de jours, heures, minutes etc ... pour les Professionnelssi il clique sur le bouton que tu rennomera "Renseignement pour ajouter mon établissement" tu ouvre un modal de formulaire pour récupérer : Nom, prénom, nom de l'établissement , ville , et un champs vide pour description et motif de la demande ..., pour l'IA générateur d'idée Sortie (change de titre je veux "Générateur d'envie ! qu'a tu enive de faire ?  envie de: champs a remplir) le but étant de simulé la barre de recherche avec de fausse réponse préfaite, du genre super idée ! , c'est une jolie envie ! des phrases générique pour tout. tu comprend ?  

App.tsx : 
import React from 'react';
import Background from './components/Background';
import Countdown from './components/Countdown';
import Newsletter from './components/Newsletter';
import AiVision from './components/AiVision';
import { MapPin, Briefcase, Store, Ticket } from 'lucide-react';

const App: React.FC = () => {
  const activities = [
    "🏎️ Karting", "🥽 Réalité Virtuelle", "🍽️ Restaurants", "🍸 Bars d'ambiance", 
    "💃 Soirées Dansantes", "🛼 Roller Indoor", "🤸 Trampoline Park", 
    "🎬 Cinéma", "🔫 Laser Game", "⚽ Futsal", "🎳 Bowling", "🧗 Escalade"
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 selection:bg-accent-orange selection:text-white">
      <Background />

      <main className="w-full max-w-5xl relative z-10 flex flex-col items-center text-center">
        
        {/* Stylized Logo Area */}
        <div className="mb-2 relative group cursor-default">
            {/* Sound wave simulation */}
            <div className="flex justify-center items-end h-8 gap-1 mb-2 opacity-80">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 bg-gradient-to-t from-accent-purple via-brand-500 to-accent-yellow rounded-full animate-pulse" 
                         style={{ 
                             height: `${Math.random() * 100}%`, 
                             animationDelay: `${i * 0.1}s`,
                             animationDuration: '1s'
                         }}>
                    </div>
                ))}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-logo text-accent-orange drop-shadow-[0_2px_10px_rgba(249,115,22,0.5)] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                envie<span className="text-brand-500">2</span>sortir
            </h1>
            <p className="text-2xl md:text-3xl font-display font-bold text-brand-500 mt-2 tracking-wide drop-shadow-lg">
                Découvrez, sortez, profitez !
            </p>
        </div>

        {/* Lancement Prochainement Effect */}
        <div className="my-6 relative">
          <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
          <h2 className="relative text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-yellow to-white animate-glow transform -skew-x-6">
            Lancement <br className="md:hidden" /> Prochainement
          </h2>
          <div className="h-1 w-24 mx-auto bg-accent-orange mt-2 rounded-full shadow-[0_0_10px_#f97316]"></div>
        </div>

        {/* Activity Marquee */}
        <div className="w-screen max-w-full overflow-hidden my-6 relative mask-linear-gradient">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-20"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-20"></div>
            
            <div className="flex animate-scroll hover:[animation-play-state:paused] w-max">
                {[...activities, ...activities, ...activities].map((act, i) => (
                    <div key={i} className="mx-4 text-gray-300 font-display text-lg font-light tracking-wider flex items-center">
                        <span className="w-1.5 h-1.5 bg-accent-orange rounded-full mr-4"></span>
                        {act}
                    </div>
                ))}
            </div>
        </div>

        <p className="text-lg md:text-xl text-gray-200 max-w-3xl font-light mb-8 leading-relaxed px-4 backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5">
            <strong className="text-white font-semibold block mb-2 text-2xl">Ce n'est pas un site de rencontre.</strong>
            C'est votre futur compagnon pour trouver les meilleures activités locales : 
            loisirs, divertissements et sorties inoubliables entre amis ou en famille.
        </p>

        {/* Countdown */}
        <div className="w-full mb-12 transform hover:scale-105 transition-transform duration-500">
          <Countdown />
        </div>

        {/* Dual Section: Pros vs Public */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl items-stretch">
          
          {/* Public / Newsletter */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-2xl hover:border-brand-500/50 transition-all group backdrop-blur-md">
            <div className="bg-brand-500/20 p-4 rounded-full mb-4 group-hover:bg-brand-500/40 transition-colors">
                <Ticket className="text-brand-400" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Futurs Sorteurs</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Soyez les premiers informés de l'ouverture et recevez des offres exclusives pour vos premières sorties.
            </p>
            <div className="w-full">
                <Newsletter />
            </div>
          </div>

          {/* Professionals Section */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-2xl hover:border-accent-orange/50 transition-all group relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="bg-accent-orange/20 p-4 rounded-full mb-4 group-hover:bg-accent-orange/40 transition-colors relative z-10">
                <Store className="text-accent-orange" size={32} />
            </div>
            
            <h2 className="text-2xl font-display font-bold mb-2 relative z-10">Espace Professionnels</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs relative z-10">
                Gérant d'établissement de loisirs ? (Karting, Laser Game, Resto...)<br/>
                Boostez votre visibilité dès le lancement.
            </p>
            
            <button className="relative z-10 bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Briefcase size={18} />
                Ajouter mon établissement
            </button>
            
            <div className="mt-4 text-xs text-accent-orange font-medium animate-pulse relative z-10">
                Places limitées pour le lancement !
            </div>
          </div>

        </div>

        {/* AI Feature */}
        <div className="w-full max-w-3xl mt-12 relative z-20">
          <AiVision />
        </div>

        {/* Footer */}
        <footer className="mt-20 text-gray-500 text-sm font-light text-center relative z-20 pb-8">
          <div className="flex justify-center gap-4 mb-4 opacity-50">
             <MapPin size={14} /> Paris • Lyon • Marseille • Bordeaux • Lille • Nantes
          </div>
          &copy; {new Date().getFullYear()} Envie2Sortir. La plateforme de découverte d'activités locales. <br/>
          <span className="opacity-30 text-xs">Images non contractuelles. Site en construction.</span>
        </footer>

      </main>
    </div>
  );
};

AIVision.tsx: 
import React, { useState } from 'react';
import { Sparkles, Loader2, Gamepad2 } from 'lucide-react';
import { generateTeaser } from '../services/geminiService';
import { LoadingState } from '../types';

const AiVision: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setStatus(LoadingState.LOADING);
    setResponse(null);
    
    const result = await generateTeaser(query);
    
    setResponse(result);
    setStatus(LoadingState.SUCCESS);
  };

  return (
    <div className="mt-12 md:mt-20 p-1 rounded-2xl bg-gradient-to-r from-accent-orange/30 via-brand-500/30 to-accent-purple/30">
      <div className="bg-black/80 backdrop-blur-xl rounded-xl p-6 md:p-8 border border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="text-accent-orange" size={20} />
          <h3 className="text-xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-brand-400">
            Générateur d'Idées Sorties
          </h3>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          En manque d'inspiration pour ce week-end ? Demandez à l'IA une idée d'activité.
          <br/> <span className="text-xs opacity-60">(Ex: "Sensations fortes", "Sortie avec des enfants", "Soirée entre potes")</span>
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Quelle ambiance cherchez-vous ?"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder-gray-500"
          />
          <button
            onClick={handleAsk}
            disabled={status === LoadingState.LOADING || !query}
            className="bg-accent-orange hover:bg-orange-600 text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/20"
          >
            {status === LoadingState.LOADING ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Gamepad2 size={18} />
                <span>Trouver</span>
              </>
            )}
          </button>
        </div>

        {response && (
          <div className="mt-6 p-4 border-l-4 border-accent-orange bg-white/5 rounded-r-lg animate-[fadeIn_0.5s_ease-out]">
            <p className="text-orange-50 font-medium italic leading-relaxed">
              "{response}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiVision;

Background.tsx:

import React, { useEffect, useRef } from 'react';

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(window.innerWidth / 10, 100); // Responsive count
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle gradient background - Warm/Social vibes
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#500724'); // Dark Pink/Red center
      gradient.addColorStop(0.5, '#2e021d'); // Deep Purple
      gradient.addColorStop(1, '#000000'); // Black edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      ctx.fillStyle = 'rgba(255, 192, 203, 0.5)'; // Pinkish white
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)'; // Brand Pink low opacity

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.lineWidth = 1 - distance / 150;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default Background;

Countdown.tsx : 
import React, { useState, useEffect } from 'react';
import { TimeLeft } from '../types';

const Countdown: React.FC = () => {
  const calculateTimeLeft = (): TimeLeft => {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-6 min-w-[70px] md:min-w-[100px] text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="text-2xl md:text-5xl font-display font-bold text-white relative z-10">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      <span className="text-gray-400 text-xs md:text-sm mt-2 font-medium tracking-widest uppercase">{label}</span>
    </div>
  );

  return (
    <div className="flex justify-center flex-wrap mt-8 md:mt-12 animate-float">
      <TimeUnit value={timeLeft.days} label="Jours" />
      <TimeUnit value={timeLeft.hours} label="Heures" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Secondes" />
    </div>
  );
};

export default Countdown;

Newletter:

import React, { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { LoadingState } from '../types';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus(LoadingState.LOADING);
    
    // Simulate API call
    setTimeout(() => {
      setStatus(LoadingState.SUCCESS);
      setEmail('');
    }, 1500);
  };

  if (status === LoadingState.SUCCESS) {
    return (
      <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-xl flex items-center justify-center space-x-3 animate-pulse">
        <CheckCircle size={20} />
        <span>Vous êtes sur la Guest List VIP pour 2026 !</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-gray-400 mb-4 text-center text-sm">Rejoignez la liste d'attente exclusive.</p>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 md:py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all backdrop-blur-sm"
          disabled={status === LoadingState.LOADING}
        />
        <button
          type="submit"
          disabled={status === LoadingState.LOADING || !email}
          className="absolute right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 bg-brand-600 hover:bg-brand-500 text-white rounded-full px-4 md:px-6 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
        >
          {status === LoadingState.LOADING ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;

index.html :
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="https://lucide.dev/logo.light.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Envie2Sortir - Découvrez, Sortez, Profitez !</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@300;500;700&family=Kaushan+Script&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
              display: ['Space Grotesk', 'sans-serif'],
              logo: ['Kaushan Script', 'cursive'],
            },
            colors: {
              brand: {
                50: '#fdf2f8',
                100: '#fce7f3',
                400: '#f472b6',
                500: '#ec4899', // Pink-500
                600: '#db2777', // Pink-600
                900: '#831843', // Pink-900
                950: '#500724', // Pink-950
              },
              accent: {
                purple: '#8b5cf6',
                orange: '#f97316', // Orange for the logo
                yellow: '#fbbf24'
              }
            },
            animation: {
              'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              'float': 'float 6s ease-in-out infinite',
              'float-random': 'floatRandom 10s ease-in-out infinite',
              'scroll': 'scroll 20s linear infinite',
              'tilt': 'tilt 5s linear infinite',
              'glow': 'glow 2s ease-in-out infinite alternate',
              'dance': 'dance 1s ease-in-out infinite',
            },
            keyframes: {
              float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
              },
              floatRandom: {
                '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                '33%': { transform: 'translate(10px, -20px) rotate(5deg)' },
                '66%': { transform: 'translate(-10px, 10px) rotate(-5deg)' },
              },
              scroll: {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' },
              },
              tilt: {
                 '0%, 100%': { transform: 'rotate(-2deg)' },
                 '50%': { transform: 'rotate(2deg)' },
              },
              glow: {
                '0%': { textShadow: '0 0 10px #ec4899, 0 0 20px #f97316' },
                '100%': { textShadow: '0 0 20px #ec4899, 0 0 40px #f97316' }
              },
              dance: {
                '0%, 100%': { transform: 'rotate(-10deg) scale(1)' },
                '50%': { transform: 'rotate(10deg) scale(1.1)' },
              }
            }
          },
        },
      }
    </script>
    <style>
      body {
        background-color: #000;
        color: white;
        overflow-x: hidden;
      }
      .scrollbar-hide::-webkit-scrollbar {
          display: none;
      }
      .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>

index.tsx : 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

metadata.json:
{
  "name": "Envie2Sortir - Lancement 2026",
  "description": "La référence pour vos loisirs : Karting, VR, Restaurants, Cinéma, Laser Game. Découvrez, sortez, profitez ! Lancement 2026.",
  "requestFramePermissions": []
}

Types.ts
export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

