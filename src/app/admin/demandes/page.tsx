"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PendingEstablishment {
  id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  createdAt: string;
  professionalOwner: {
    companyName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function DemandesPage() {
  const [establishments, setEstablishments] = useState<PendingEstablishment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEstablishments();
  }, []);

  const fetchPendingEstablishments = async () => {
    try {
      const response = await fetch("/api/admin/demandes");
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (
    establishmentId: string,
    action: "approve" | "reject"
  ) => {
    setActionLoading(establishmentId);
    try {
      const response = await fetch(`/api/admin/demandes/${establishmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Supprimer l'établissement de la liste
        setEstablishments((prev) =>
          prev.filter((est) => est.id !== establishmentId)
        );
        // Optionnel : afficher un message de succès
        alert(
          action === "approve"
            ? "Établissement approuvé avec succès !"
            : "Établissement rejeté avec succès !"
        );
      } else {
        alert("Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demandes en attente
          </h1>
          <p className="text-gray-600 mt-2">
            {establishments.length} établissement(s) en attente de validation
          </p>
        </div>
        <button
          onClick={fetchPendingEstablishments}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Liste des demandes */}
      {establishments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">
              Aucune demande en attente
            </p>
            <p className="text-sm">
              Tous les établissements ont été traités.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {establishments.map((establishment) => (
            <div
              key={establishment.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {establishment.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      En attente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-700">Adresse</p>
                      <p>{establishment.address}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Activités</p>
                      <p className="capitalize">
                        {establishment.activities && Array.isArray(establishment.activities) 
                          ? establishment.activities.join(', ').replace(/_/g, " ")
                          : 'Non définies'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Entreprise</p>
                      <p>{establishment.professionalOwner.companyName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Contact</p>
                      <p>
                        {establishment.professionalOwner.firstName}{" "}
                        {establishment.professionalOwner.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {establishment.professionalOwner.email}
                      </p>
                    </div>
                  </div>

                  {establishment.description && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-700 text-sm">
                        Description
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {establishment.description}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    Inscrit le{" "}
                    {new Date(establishment.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <Link
                    href={`/admin/demandes/${establishment.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                  >
                    Voir détails
                  </Link>
                  <button
                    onClick={() => handleAction(establishment.id, "approve")}
                    disabled={actionLoading === establishment.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === establishment.id
                      ? "Approbation..."
                      : "Approuver"}
                  </button>
                  <button
                    onClick={() => handleAction(establishment.id, "reject")}
                    disabled={actionLoading === establishment.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === establishment.id
                      ? "Rejet..."
                      : "Rejeter"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
