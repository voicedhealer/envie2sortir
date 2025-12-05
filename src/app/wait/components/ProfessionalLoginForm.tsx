'use client';

import React, { useState } from 'react';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

const ProfessionalLoginForm: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(LoadingState.LOADING);
    setError(null);

    try {
      const response = await fetch('/api/wait/professional-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        setStatus(LoadingState.ERROR);
        setError(data.error || data.message || 'Une erreur est survenue lors de la connexion');
      }
    } catch (error) {
      setStatus(LoadingState.ERROR);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Réinitialiser l'erreur quand l'utilisateur tape
    if (error) {
      setError(null);
      setStatus(LoadingState.IDLE);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
          placeholder="votre.email@exemple.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mot de passe *
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
          placeholder="Votre mot de passe"
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === LoadingState.LOADING}
        className="w-full bg-[#ff751f] hover:bg-[#ff751f]/80 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ff751f]/20 transform hover:scale-[1.02]"
      >
        {status === LoadingState.LOADING ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Connexion en cours...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Se connecter
          </>
        )}
      </button>
    </form>
  );
};

export default ProfessionalLoginForm;

