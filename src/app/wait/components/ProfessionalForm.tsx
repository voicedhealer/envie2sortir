'use client';

import React, { useState } from 'react';
import { Briefcase, CheckCircle, Loader2, X } from 'lucide-react';

enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const ProfessionalForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    establishmentName: '',
    city: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(LoadingState.LOADING);
    setError(null);

    try {
      const response = await fetch('/api/wait/professional-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus(LoadingState.SUCCESS);
        setTimeout(() => {
          setIsOpen(false);
          setStatus(LoadingState.IDLE);
          setFormData({
            firstName: '',
            lastName: '',
            establishmentName: '',
            city: '',
            description: '',
          });
        }, 3000);
      } else {
        setStatus(LoadingState.ERROR);
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setStatus(LoadingState.ERROR);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (status === LoadingState.SUCCESS) {
    return (
      <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-xl text-center">
        <CheckCircle className="mx-auto mb-2" size={24} />
        <p className="text-sm font-medium">
          Merci ! Nous vous contacterons très bientôt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nom *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
            placeholder="Votre nom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nom de l'établissement *
        </label>
        <input
          type="text"
          name="establishmentName"
          value={formData.establishmentName}
          onChange={handleChange}
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
          placeholder="Ex: Karting Dijon"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ville *
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all"
          placeholder="Ex: Dijon"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description et motif de la demande
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff751f] focus:border-[#ff751f] outline-none transition-all resize-none"
          placeholder="Décrivez votre établissement et votre demande..."
        />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm">
          {error}
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
            Envoi en cours...
          </>
        ) : (
          <>
            <Briefcase size={18} />
            Envoyer ma demande
          </>
        )}
      </button>
    </form>
  );
};

export default ProfessionalForm;

