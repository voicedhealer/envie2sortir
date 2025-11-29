'use client';

import { useState, useEffect } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, Plus, Users } from 'lucide-react';
import AdminLaunchPanel from '@/components/AdminLaunchPanel';
import Link from 'next/link';

interface WaitlistPro {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  establishmentName: string;
  phone: string;
  siret: string;
  companyName: string;
  legalStatus: string;
  createdAt: string;
}

export default function AdminWaitlistPage() {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ success: boolean; message?: string; error?: string; password?: string } | null>(null);
  const [waitlistPros, setWaitlistPros] = useState<WaitlistPro[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    establishmentName: '',
    phone: '',
    siret: '',
    companyName: '',
    legalStatus: '',
    password: '', // Optionnel, généré automatiquement si vide
  });

  // Redirection si pas admin (dans useEffect pour éviter l'erreur de rendu)
  useEffect(() => {
    if (!loading && (!session || session.user?.role !== 'admin')) {
      router.push('/auth?error=AccessDenied');
    }
  }, [session, loading, router]);

  // Charger la liste au montage
  useEffect(() => {
    const loadWaitlistPros = async () => {
      try {
        const res = await fetch('/api/admin/waitlist/list');
        if (res.ok) {
          const data = await res.json();
          setWaitlistPros(data.professionals || []);
        }
      } catch (error) {
        console.error('Erreur chargement waitlist:', error);
      }
    };

    if (session?.user?.role === 'admin') {
      loadWaitlistPros();
    }
  }, [session]);

  // Vérifier l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/admin/waitlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          siret: formData.siret.replace(/\s/g, ''),
          phone: formData.phone.replace(/\s/g, ''),
          password: formData.password || undefined, // Envoyer undefined si vide
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResponse(data);
        // Réinitialiser le formulaire
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          establishmentName: '',
          phone: '',
          siret: '',
          companyName: '',
          legalStatus: '',
          password: '',
        });
        setShowForm(false);
        // Recharger la liste
        const reloadList = async () => {
          try {
            const res = await fetch('/api/admin/waitlist/list');
            if (res.ok) {
              const data = await res.json();
              setWaitlistPros(data.professionals || []);
            }
          } catch (error) {
            console.error('Erreur chargement waitlist:', error);
          }
        };
        reloadList();
      } else {
        setResponse(data);
      }
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Erreur lors de la création',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#ff751f]" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion de la Waitlist Premium</h1>
                <p className="text-sm text-gray-600">
                  Ajoutez manuellement des professionnels en waitlist avant le lancement
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/waitlist/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] text-white rounded-lg hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 transition-all"
              >
                <Plus className="w-5 h-5" />
                Formulaire complet
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 border border-[#ff751f] text-[#ff751f] rounded-lg hover:bg-[#ff751f]/10 transition-all"
              >
                <Plus className="w-5 h-5" />
                Formulaire rapide
              </button>
            </div>
          </div>
        </div>

        {/* Panel d'activation */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <AdminLaunchPanel />
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ajouter un professionnel en waitlist</h2>
            
            {response?.success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium">{response.message}</p>
                  {response.password && (
                    <p className="text-sm text-green-700 mt-2">
                      <strong>Mot de passe généré:</strong> {response.password}
                      <br />
                      <span className="text-xs">(Notez-le, il ne sera plus affiché)</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {response && !response.success && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{response.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={formData.establishmentName}
                  onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (06 ou 07) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0612345678"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET (14 chiffres) *
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value.replace(/\D/g, '') })}
                  placeholder="12345678901234"
                  maxLength={14}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut juridique *
                  </label>
                  <select
                    value={formData.legalStatus}
                    onChange={(e) => setFormData({ ...formData, legalStatus: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="EURL">EURL</option>
                    <option value="SA">SA</option>
                    <option value="SNC">SNC</option>
                    <option value="SCI">SCI</option>
                    <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe (optionnel - généré automatiquement si vide)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#ff751f] outline-none"
                  placeholder="Laissez vide pour générer automatiquement"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 text-white font-semibold rounded-lg px-6 py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Créer en waitlist</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setResponse(null);
                    setFormData({
                      email: '',
                      firstName: '',
                      lastName: '',
                      establishmentName: '',
                      phone: '',
                      siret: '',
                      companyName: '',
                      legalStatus: '',
                      password: '',
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des professionnels en waitlist */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Professionnels en waitlist ({waitlistPros.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {waitlistPros.length > 0 ? (
              waitlistPros.map((pro) => (
                <div key={pro.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {pro.firstName} {pro.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{pro.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {pro.establishmentName} • {pro.companyName} • SIRET: {pro.siret}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      WAITLIST_BETA
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Aucun professionnel en waitlist</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

