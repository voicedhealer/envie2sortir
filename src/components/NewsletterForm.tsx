'use client';

import { useState } from 'react';
import { toast } from '@/lib/fake-toast';

interface NewsletterFormState {
  email: string;
  consent: boolean;
  isSubmitting: boolean;
  message: string;
  messageType: 'success' | 'error' | '';
}

export default function NewsletterForm() {
  const [state, setState] = useState<NewsletterFormState>({
    email: '',
    consent: false,
    isSubmitting: false,
    message: '',
    messageType: ''
  });

  // Validation côté client
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!state.email.trim()) {
      setState(prev => ({
        ...prev,
        message: 'Veuillez saisir votre adresse email',
        messageType: 'error'
      }));
      return;
    }

    if (!validateEmail(state.email)) {
      setState(prev => ({
        ...prev,
        message: 'Veuillez saisir une adresse email valide',
        messageType: 'error'
      }));
      return;
    }

    if (!state.consent) {
      setState(prev => ({
        ...prev,
        message: 'Vous devez accepter de recevoir nos communications',
        messageType: 'error'
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, message: '', messageType: '' }));

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: state.email.trim().toLowerCase(),
          consent: state.consent
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          email: '',
          consent: false,
          message: data.message,
          messageType: 'success'
        }));
        toast.success('Inscription réussie !');
      } else {
        setState(prev => ({
          ...prev,
          message: data.error || 'Une erreur est survenue',
          messageType: 'error'
        }));
        toast.error(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error('Erreur newsletter:', error);
      setState(prev => ({
        ...prev,
        message: 'Erreur de connexion. Veuillez réessayer.',
        messageType: 'error'
      }));
      toast.error('Erreur de connexion');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <h3 className="text-xl font-semibold mb-4">Restez informé !</h3>
      <p className="text-gray-600 mb-6">Recevez nos meilleures découvertes et offres exclusives</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={state.email}
            onChange={(e) => setState(prev => ({ ...prev, email: e.target.value, message: '', messageType: '' }))}
            placeholder="Votre adresse email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            disabled={state.isSubmitting}
            required
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="newsletter-consent"
            checked={state.consent}
            onChange={(e) => setState(prev => ({ ...prev, consent: e.target.checked, message: '', messageType: '' }))}
            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            disabled={state.isSubmitting}
            required
          />
          <label htmlFor="newsletter-consent" className="text-sm text-gray-600">
            J'accepte de recevoir les communications d'Envie2Sortir
          </label>
        </div>

        <button
          type="submit"
          disabled={state.isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Inscription en cours...
            </span>
          ) : (
            'S\'abonner à la newsletter'
          )}
        </button>
      </form>

      {/* Messages de feedback */}
      {state.message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          state.messageType === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {state.message}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        En vous inscrivant, vous acceptez de recevoir nos communications. Vous pouvez vous désinscrire à tout moment.
        <br />
        <a href="/politique-confidentialite" className="text-orange-600 hover:text-orange-700 underline">
          Politique de confidentialité
        </a>
      </p>
    </div>
  );
}
