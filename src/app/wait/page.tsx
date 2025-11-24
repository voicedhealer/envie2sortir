'use client';

import React from 'react';
import Background from './components/Background';
import Countdown from './components/Countdown';
import Newsletter from './components/Newsletter';
import AiVision from './components/AiVision';
import ProfessionalForm from './components/ProfessionalForm';
import { MapPin, Briefcase, Store, Ticket } from 'lucide-react';

const WaitPage: React.FC = () => {
  const activities = [
    "🏎️ Karting", "🥽 Réalité Virtuelle", "🍽️ Restaurants", "🍸 Bars d'ambiance", 
    "💃 Soirées Dansantes", "🛼 Roller Indoor", "🤸 Trampoline Park", 
    "🎬 Cinéma", "🔫 Laser Game", "⚽ Futsal", "🎳 Bowling", "🧗 Escalade"
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 selection:bg-[#ff751f] selection:text-white">
      <Background />

      <main className="w-full max-w-5xl relative z-10 flex flex-col items-center text-center">
        
        {/* Stylized Logo Area */}
        <div className="mb-2 relative group cursor-default">
            {/* Sound wave simulation */}
            <div className="flex justify-center items-end h-8 gap-1 mb-2 opacity-80">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 bg-gradient-to-t from-[#ff1fa9] via-[#ff751f] to-[#ff3a3a] rounded-full animate-pulse" 
                         style={{ 
                             height: `${Math.random() * 100}%`, 
                             animationDelay: `${i * 0.1}s`,
                             animationDuration: '1s'
                         }}>
                    </div>
                ))}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-[#ff751f] drop-shadow-[0_2px_10px_rgba(255,117,31,0.5)] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                envie<span className="text-[#ff1fa9]">2</span>sortir
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-[#ff1fa9] mt-2 tracking-wide drop-shadow-lg">
                Découvrez, sortez, profitez !
            </p>
        </div>

        {/* Lancement Prochainement Effect */}
        <div className="my-6 relative">
          <div className="absolute inset-0 bg-[#ff1fa9]/20 blur-2xl rounded-full"></div>
          <h2 className="relative text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff751f] to-white animate-pulse transform -skew-x-6">
            Lancement <br className="md:hidden" /> Prochainement
          </h2>
          <div className="h-1 w-24 mx-auto bg-[#ff751f] mt-2 rounded-full shadow-[0_0_10px_#ff751f]"></div>
        </div>

        {/* Activity Marquee */}
        <div className="w-screen max-w-full overflow-hidden my-6 relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-20"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-20"></div>
            
            <div className="flex animate-scroll hover:[animation-play-state:paused] w-max">
                {[...activities, ...activities, ...activities].map((act, i) => (
                    <div key={i} className="mx-4 text-gray-300 text-lg font-light tracking-wider flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#ff751f] rounded-full mr-4"></span>
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
          <div className="flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-2xl hover:border-[#ff1fa9]/50 transition-all group backdrop-blur-md">
            <div className="bg-[#ff1fa9]/20 p-4 rounded-full mb-4 group-hover:bg-[#ff1fa9]/40 transition-colors">
                <Ticket className="text-[#ff1fa9]" size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-lg">Futurs Sorteurs</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Soyez les premiers informés de l'ouverture et recevez des offres exclusives pour vos premières sorties.
            </p>
            <div className="w-full">
                <Newsletter />
            </div>
          </div>

          {/* Professionals Section */}
          <div className="flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/5 shadow-2xl hover:border-[#ff751f]/50 transition-all group relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-[#ff751f]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="bg-[#ff751f]/20 p-4 rounded-full mb-4 group-hover:bg-[#ff751f]/40 transition-colors relative z-10">
                <Store className="text-[#ff751f]" size={32} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2 relative z-10 text-white drop-shadow-lg">Espace Professionnels</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs relative z-10">
                Gérant d'établissement de loisirs ? (Karting, Laser Game, Resto...)<br/>
                Boostez votre visibilité dès le lancement.
            </p>
            
            <div className="w-full relative z-10">
              <ProfessionalForm />
            </div>
            
            <div className="mt-4 text-xs text-[#ff751f] font-medium animate-pulse relative z-10">
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

export default WaitPage;

