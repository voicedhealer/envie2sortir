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
  category: string;
  services: string;
  ambiance: string;
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

export default function DemandeDetailPage({
  params,
}: {
  params: { id: string };
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
    fetchEstablishmentDetail();
  }, [params.id]);

  const fetchEstablishmentDetail = async () => {
    try {
      const response = await fetch(`/api/admin/demandes/${params.id}`);
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
      const response = await fetch(`/api/admin/demandes/${params.id}`, {
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
      console.error("Erreur:", error);
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement des détails...</div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Établissement non trouvé</p>
        <Link
          href="/admin/demandes"
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/demandes"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Retour à la liste
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Détail de la demande
            </h1>
            <p className="text-gray-600 mt-1">
              {establishment.name} - {establishment.professionalOwner.companyName}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
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
            Rejeter
          </button>
        </div>
      </div>

      {/* Informations de l'établissement */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informations de l'établissement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Nom</p>
            <p className="text-gray-900">{establishment.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Catégorie</p>
            <p className="text-gray-900 capitalize">
              {establishment.category.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Adresse</p>
            <p className="text-gray-900">
              {establishment.address}
              {establishment.city && `, ${establishment.city}`}
              {establishment.postalCode && ` ${establishment.postalCode}`}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Pays</p>
            <p className="text-gray-900">{establishment.country}</p>
          </div>
          {establishment.description && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-gray-900">{establishment.description}</p>
            </div>
          )}
          {establishment.website && (
            <div>
              <p className="text-sm font-medium text-gray-700">Site web</p>
              <a
                href={establishment.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {establishment.website}
              </a>
            </div>
          )}
          {establishment.instagram && (
            <div>
              <p className="text-sm font-medium text-gray-700">Instagram</p>
              <p className="text-gray-900">@{establishment.instagram}</p>
            </div>
          )}
          {establishment.facebook && (
            <div>
              <p className="text-sm font-medium text-gray-700">Facebook</p>
              <p className="text-gray-900">{establishment.facebook}</p>
            </div>
          )}
        </div>
      </div>

      {/* Informations du professionnel */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Informations du professionnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700">SIRET</p>
            <p className="text-gray-900">{establishment.professionalOwner.siret}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Raison sociale</p>
            <p className="text-gray-900">
              {establishment.professionalOwner.companyName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Statut juridique</p>
            <p className="text-gray-900">
              {establishment.professionalOwner.legalStatus}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Contact</p>
            <p className="text-gray-900">
              {establishment.professionalOwner.firstName}{" "}
              {establishment.professionalOwner.lastName}
            </p>
            <p className="text-sm text-gray-600">
              {establishment.professionalOwner.email}
            </p>
            <p className="text-sm text-gray-600">
              {establishment.professionalOwner.phone}
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
              {JSON.parse(establishment.services || "[]").map((service: string, index: number) => (
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
              {JSON.parse(establishment.ambiance || "[]").map((ambiance: string, index: number) => (
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
  );
}
