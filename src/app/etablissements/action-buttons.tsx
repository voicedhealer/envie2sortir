"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Establishment = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export default function ActionButtons({ establishment }: { establishment: Establishment }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${establishment.name}" ?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/etablissements/${establishment.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Rediriger vers la liste et rafraîchir
      router.push('/etablissements');
      router.refresh();
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 ml-4">
      <Link
        href={`/etablissements/${establishment.slug}/modifier`}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Modifier
      </Link>
      
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        {isDeleting ? 'Suppression...' : 'Supprimer'}
      </button>
    </div>
  );
}
