'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus(LoadingState.LOADING);
    setError(null);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          consent: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus(LoadingState.SUCCESS);
        setEmail('');
      } else {
        setStatus(LoadingState.ERROR);
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setStatus(LoadingState.ERROR);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
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
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 md:py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff1fa9] focus:border-transparent transition-all backdrop-blur-sm"
          disabled={status === LoadingState.LOADING}
        />
        <button
          type="submit"
          disabled={status === LoadingState.LOADING || !email}
          className="absolute right-2 top-1.5 md:top-2 bottom-1.5 md:bottom-2 bg-[#ff1fa9] hover:bg-[#ff1fa9]/80 text-white rounded-full px-4 md:px-6 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff1fa9]/20"
        >
          {status === LoadingState.LOADING ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
};

export default Newsletter;

