'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Gamepad2 } from 'lucide-react';

enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// Réponses préfaites génériques
const genericResponses = [
  "Super idée ! C'est une jolie envie !",
  "Excellente suggestion ! Vous allez adorer cette expérience.",
  "Quelle belle envie ! On a hâte de vous faire découvrir ça.",
  "C'est une superbe idée de sortie !",
  "Parfait ! Vous allez passer un moment inoubliable.",
  "Génial ! Cette envie va vous réserver de belles surprises.",
  "Magnifique ! Vous allez créer de beaux souvenirs.",
  "Fantastique ! C'est exactement le genre d'expérience qu'on adore proposer.",
];

const AiVision: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setStatus(LoadingState.LOADING);
    setResponse(null);
    
    // Simuler un délai d'IA (1-2 secondes)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Sélectionner une réponse aléatoire
    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    
    setResponse(randomResponse);
    setStatus(LoadingState.SUCCESS);
  };

  return (
    <div className="mt-12 md:mt-20 p-1 rounded-2xl bg-gradient-to-r from-[#ff751f]/30 via-[#ff1fa9]/30 to-[#ff3a3a]/30">
      <div className="bg-black/80 backdrop-blur-xl rounded-xl p-6 md:p-8 border border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="text-[#ff751f]" size={20} />
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff751f] to-[#ff1fa9]">
            Générateur d'envie !
          </h3>
        </div>
        
        <p className="text-gray-400 text-sm mb-6">
          Qu'as-tu envie de faire ?
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Envie de: ..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all placeholder-gray-500"
          />
          <button
            onClick={handleAsk}
            disabled={status === LoadingState.LOADING || !query}
            className="bg-[#ff751f] hover:bg-[#ff751f]/80 text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#ff751f]/20"
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
          <div className="mt-6 p-4 border-l-4 border-[#ff751f] bg-white/5 rounded-r-lg animate-[fadeIn_0.5s_ease-out]">
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

