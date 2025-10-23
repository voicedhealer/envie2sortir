'use client';

import { useState } from 'react';
import { toast } from '@/lib/fake-toast';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Veuillez saisir votre adresse email');
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message || data.error
      });

      if (data.success) {
        toast.success('Désinscription réussie');
        setEmail('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erreur désinscription:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion. Veuillez réessayer.'
      });
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Désinscription Newsletter
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Nous sommes désolés de vous voir partir. Vous pouvez vous désinscrire à tout moment.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!result ? (
            <form className="space-y-6" onSubmit={handleUnsubscribe}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="votre@email.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Désinscription en cours...
                    </span>
                  ) : (
                    'Se désinscrire'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
                {result.success ? (
                  <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              
              <h3 className={`text-lg font-medium ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.success ? 'Désinscription réussie' : 'Erreur'}
              </h3>
              
              <p className={`mt-2 text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>

              {result.success && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    Vous ne recevrez plus nos emails. Si vous changez d'avis, vous pouvez vous réinscrire à tout moment.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => {
                    setResult(null);
                    setEmail('');
                  }}
                  className="text-sm text-orange-600 hover:text-orange-500"
                >
                  Désinscrire un autre email
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            En cas de problème, contactez-nous à{' '}
            <a href="mailto:support@envie2sortir.com" className="text-orange-600 hover:text-orange-500">
              support@envie2sortir.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
