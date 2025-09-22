'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn as nextAuthSignIn, signUp as nextAuthSignUp, getSession } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, User, Heart, MapPin, Star, X } from 'lucide-react';
import Image from 'next/image';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false
  });
  const [selectedRole, setSelectedRole] = useState<'user' | 'pro' | 'admin'>('user');

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const result = await nextAuthSignIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        if (result?.error) {
          console.error('Erreur de connexion:', result.error);
          setError('Email ou mot de passe incorrect');
        } else if (result?.ok) {
          // Forcer la synchronisation de la session
          const session = await getSession();
          console.log('🔐 Session après connexion:', session);
          
          // Vérifier que le rôle de l'utilisateur correspond au rôle sélectionné
          if (session?.user?.role !== selectedRole) {
            setError(`Ce compte n'est pas un compte ${selectedRole === 'pro' ? 'professionnel' : selectedRole === 'admin' ? 'administrateur' : 'utilisateur'}. Veuillez sélectionner le bon type de compte.`);
            return;
          }
          
          // Rediriger selon le rôle de l'utilisateur (pas celui sélectionné)
          let redirectUrl = callbackUrl;
          if (session.user.role === 'pro') {
            redirectUrl = '/dashboard';
          } else if (session.user.role === 'admin') {
            redirectUrl = '/admin';
          }
          router.push(decodeURIComponent(redirectUrl));
        } else {
          setError('Erreur de connexion inattendue');
        }
      } else {
        if (!formData.acceptTerms) {
          setError('Veuillez accepter les conditions d\'utilisation');
          return;
        }

        // Appeler l'API d'inscription
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            acceptTerms: formData.acceptTerms
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('✅ Inscription réussie, tentative de connexion automatique...');
          
          // Connexion automatique après inscription
          const signInResult = await nextAuthSignIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          });

          console.log('🔐 Résultat connexion:', signInResult);

          if (signInResult?.ok) {
            console.log('✅ Connexion réussie, redirection vers:', callbackUrl);
            // Forcer la synchronisation de la session
            await getSession();
            // Pour les nouveaux comptes, ajouter le paramètre welcome si on va vers l'accueil
            const redirectUrl = callbackUrl === '/' ? '/?welcome=true' : decodeURIComponent(callbackUrl);
            router.push(redirectUrl);
          } else {
            console.log('❌ Échec connexion, redirection vers auth');
            setError('Compte créé mais connexion échouée. Veuillez vous connecter manuellement.');
            router.push('/auth?registered=true');
          }
        } else {
          setError(data.message || 'Erreur lors de la création du compte');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🔐 Tentative de connexion ${provider}...`);
      
      const result = await nextAuthSignIn(provider, {
        redirect: false
      });

      console.log(`🔐 Résultat connexion ${provider}:`, result);

      if (result?.error) {
        console.error(`❌ Erreur ${provider}:`, result.error);
        if (result.error === 'Configuration') {
          setError(`${provider} n'est pas configuré. Veuillez utiliser la connexion par email/mot de passe.`);
        } else {
          setError(`Erreur lors de la connexion avec ${provider}`);
        }
      } else if (result?.ok) {
        console.log(`✅ Connexion ${provider} réussie`);
        // Forcer la synchronisation de la session
        await getSession();
        // Rediriger vers l'URL de callback ou la page d'accueil
        router.push(decodeURIComponent(callbackUrl));
      } else {
        setError(`Erreur inattendue lors de la connexion avec ${provider}`);
      }
    } catch (err: any) {
      console.error(`❌ Exception ${provider}:`, err);
      setError(`Erreur lors de la connexion avec ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/logo.svg"
              alt="Envie2Sortir"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Bon retour !' : 'Rejoignez la communauté'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Connectez-vous pour découvrir de nouveaux lieux' 
                : 'Créez votre compte et trouvez vos prochaines sorties'
              }
            </p>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Sélecteur de rôle (seulement pour la connexion) */}
          {isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Utilisateur
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('pro')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'pro'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Professionnel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom (seulement pour l'inscription) */}
            {!isLogin && (
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="firstName"
                    type="text"
                    required={!isLogin}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
            )}

            {/* Nom de famille (seulement pour l'inscription) */}
            {!isLogin && (
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de famille
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="lastName"
                    type="text"
                    required={!isLogin}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Votre nom de famille"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Conditions d'utilisation (seulement pour l'inscription) */}
            {!isLogin && (
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  J'accepte les{' '}
                  <a href="/conditions" className="text-orange-600 hover:text-orange-500 underline">
                    conditions générales d'utilisation
                  </a>
                  {' '}et la{' '}
                  <a href="/politique-confidentialite" className="text-orange-600 hover:text-orange-500 underline">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            )}

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                <span>{success}</span>
                <button
                  type="button"
                  onClick={() => setSuccess('')}
                  className="text-green-500 hover:text-green-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Connexion...' : 'Création du compte...'}
                </div>
              ) : (
                isLogin ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {/* Connexion sociale */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn('facebook')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
            
            {/* Message d'information pour les providers sociaux */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <strong>Note :</strong> Les connexions Google et Facebook ne sont pas encore configurées. 
                Utilisez la connexion par email/mot de passe pour le moment.
              </p>
            </div>
          </div>


          {/* Liens utiles */}
          <div className="mt-6 text-center">
            {isLogin ? (
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-orange-600 hover:text-orange-500 font-medium"
                >
                  Créer un compte
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-orange-600 hover:text-orange-500 font-medium"
                >
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section droite - Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-orange-100 to-pink-100">
        <div className="max-w-md text-center">
          <div className="space-y-8">
            {/* Icônes illustratives */}
            <div className="flex justify-center space-x-8">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Découvrez de nouveaux lieux
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Trouvez les meilleurs restaurants, bars et activités près de chez vous. 
                Partagez vos découvertes et inspirez d'autres passionnés de sorties.
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">500+</div>
                <div className="text-sm text-gray-600">Établissements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">10k+</div>
                <div className="text-sm text-gray-600">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">50k+</div>
                <div className="text-sm text-gray-600">Avis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}