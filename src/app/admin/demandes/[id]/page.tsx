"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EstablishmentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  activities: string[];
  services: string[];
  ambiance: string[];
  website: string;
  instagram: string;
  facebook: string;
  createdAt: string;
  professionalOwner: {
    siret: string;
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    legalStatus: string;
  };
}

// Fonction helper pour parser les services/ambiances de manière sécurisée
const parseServicesOrAmbiance = (data: any): string[] => {
  if (!data) return [];
  
  // Si c'est déjà un tableau, on le retourne
  if (Array.isArray(data)) return data;
  
  // Si c'est une chaîne, on essaie de la parser comme JSON
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Si le parsing JSON échoue, on traite comme une chaîne simple
      return [data];
    }
  }
  
  return [];
};

export default function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [establishment, setEstablishment] = useState<EstablishmentDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      fetchEstablishmentDetail(resolvedParams.id);
    };
    loadData();
  }, [params]);

  const fetchEstablishmentDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/demandes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEstablishment(data);
      } else {
        alert("Établissement non trouvé");
        router.push("/admin/demandes");
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      alert("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason.trim()) {
      alert("Veuillez indiquer un motif de rejet");
      return;
    }

    setActionLoading(true);
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/demandes/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action,
          reason: action === "reject" ? rejectReason : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        router.push("/admin/demandes");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Erreur lors de l'action:", error);
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Établissement non trouvé</p>
          <Link
            href="/admin/demandes"
            className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
          >
            Retour aux demandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Détails de la demande
              </h1>
              <p className="text-gray-600 mt-2">
                {establishment.name}
              </p>
            </div>
            <Link
              href="/admin/demandes"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              ← Retour aux demandes
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => handleAction("approve")}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Approbation..." : "Approuver"}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Rejet..." : "Rejeter"}
            </button>
          </div>
        </div>

        {/* Informations de l'établissement */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informations de l'établissement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Nom</p>
              <p className="text-gray-900 mt-1">{establishment.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Slug</p>
              <p className="text-gray-900 mt-1">{establishment.slug}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-gray-900 mt-1">{establishment.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Adresse</p>
              <p className="text-gray-900 mt-1">
                {establishment.address}, {establishment.postalCode} {establishment.city}
              </p>
            </div>
          </div>
        </div>

        {/* Activités */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Activités
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(establishment.activities) ? 
              establishment.activities.map((activity: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {activity.replace(/_/g, ' ')}
                </span>
              )) : 
              <span className="text-gray-500">Aucune activité définie</span>
            }
          </div>
        </div>

        {/* Informations du professionnel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informations du professionnel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">SIRET</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.siret}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Raison sociale</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.companyName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Nom complet</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.firstName}{" "}
                {establishment.professionalOwner.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Téléphone</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.phone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Statut légal</p>
              <p className="text-gray-900 mt-1">
                {establishment.professionalOwner.legalStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Services et ambiance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Services et ambiance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Services</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {parseServicesOrAmbiance(establishment.services).map((service: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Ambiance</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {parseServicesOrAmbiance(establishment.ambiance).map((ambiance: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {ambiance}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Date d'inscription */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-sm font-medium text-gray-700">Date d'inscription</h2>
          <p className="text-gray-900 mt-1">
            {new Date(establishment.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Modal de rejet */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Motif du rejet
                </h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indiquez le motif du rejet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? "Rejet..." : "Confirmer le rejet"}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}