"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Clock, Send, LogIn } from "lucide-react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import Link from "next/link";

export default function ContactPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    type: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rediriger vers la connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!loading && !session) {
      // Ne pas rediriger automatiquement, afficher un message à la place
    }
  }, [session, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Erreur de parsing de la réponse:', parseError);
        throw new Error('Erreur de communication avec le serveur. Veuillez réessayer.');
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || 'Erreur lors de l\'envoi du message';
        console.error('Erreur API:', {
          status: response.status,
          error: errorMsg,
          details: data?.details
        });
        throw new Error(errorMsg);
      }

      // Succès
      setIsSubmitted(true);
      setFormData({ subject: "", message: "", type: "general" });
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Message envoyé !</h1>
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ subject: "", message: "", type: "general" });
            }}
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contactez-nous</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Une question ? Un problème ? Notre équipe est là pour vous aider
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-600">contact@envie2sortir.fr</p>
              <p className="text-sm text-gray-500 mt-1">Réponse sous 24h</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Téléphone</h3>
              <p className="text-gray-600">06.61.32.38.03</p>
              <p className="text-sm text-gray-500 mt-1">Lun-Ven 9h-18h</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adresse</h3>
              <p className="text-gray-600">7 rue magedeleine</p>
              <p className="text-gray-600">21800 Neuilly-Crimolois</p>
              <p className="text-sm text-gray-500 mt-1">Fondateur : Vivien Bernardot - Auto-entrepreneur</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              {/* Vérification de l'authentification */}
              {loading ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-800 text-sm">Vérification de votre session...</p>
                </div>
              ) : !session ? (
                <div className="mb-6 p-6 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <LogIn className="w-6 h-6 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        Connexion requise
                      </h3>
                      <p className="text-orange-800 mb-4">
                        Vous devez être connecté pour envoyer un message. Cela nous permet de vous répondre directement.
                      </p>
                      <Link
                        href="/auth?redirect=/contact"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Se connecter ou créer un compte
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Informations de l'utilisateur connecté */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800">
                      <strong>Connecté en tant que :</strong> {session.user?.email}
                      {session.user?.user_metadata?.first_name && session.user?.user_metadata?.last_name && (
                        <span> ({session.user.user_metadata.first_name} {session.user.user_metadata.last_name})</span>
                      )}
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Type de demande
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="general">Question générale</option>
                        <option value="technical">Problème technique</option>
                        <option value="business">Partenariat professionnel</option>
                        <option value="bug">Signaler un bug</option>
                        <option value="feature">Demande de fonctionnalité</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Résumé de votre demande"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Décrivez votre demande en détail..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Informations supplémentaires */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Autres moyens de nous joindre</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">Lundi - Vendredi : 9h00 - 18h00</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">Samedi : 10h00 - 16h00</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">Dimanche : Fermé</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Temps de réponse</h3>
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Email</span>
                      <span className="font-semibold text-green-600">Sous 24h</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Téléphone</span>
                      <span className="font-semibold text-green-600">Immédiat</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Support technique</span>
                      <span className="font-semibold text-orange-600">Sous 48h</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions fréquentes</h3>
                  <div className="space-y-3">
                    <a href="/faq#premiere-utilisation" className="block text-orange-600 hover:text-orange-700 transition-colors">
                      Comment utiliser la plateforme ?
                    </a>
                    <a href="/faq#referent-etablissement" className="block text-orange-600 hover:text-orange-700 transition-colors">
                      Comment référencer mon établissement ?
                    </a>
                    <a href="/faq#recherche-avancee" className="block text-orange-600 hover:text-orange-700 transition-colors">
                      Comment bien rechercher ?
                    </a>
                    <a href="/support" className="block text-orange-600 hover:text-orange-700 transition-colors">
                      Voir toutes les FAQ →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
