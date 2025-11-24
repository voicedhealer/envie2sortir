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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="relative z-10 bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        <Briefcase size={18} />
        Renseignements pour ajouter mon établissement
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black/95 border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Demande de renseignements</h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setStatus(LoadingState.IDLE);
              setError(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {status === LoadingState.SUCCESS ? (
          <div className="text-center py-8">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <p className="text-green-400 text-lg font-semibold">
              Merci pour votre demande ! Nous vous contacterons très bientôt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all"
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all"
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
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all resize-none"
                placeholder="Décrivez votre établissement et votre demande..."
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setStatus(LoadingState.IDLE);
                  setError(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={status === LoadingState.LOADING}
                className="flex-1 bg-[#ff751f] hover:bg-[#ff751f]/80 text-white font-semibold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === LoadingState.LOADING ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfessionalForm;

