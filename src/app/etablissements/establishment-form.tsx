"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Establishment = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  category: string;
  status: string;
};

type EstablishmentFormProps = {
  establishment?: Establishment;
};

const categories = [
  "bar", "bowling", "escape_game", "market", "nightclub", 
  "restaurant", "cinema", "theater", "concert", "museum", "other"
];

const statuses = ["active", "pending", "suspended"];

export default function EstablishmentForm({ establishment }: EstablishmentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Establishment>({
    name: "",
    slug: "",
    description: "",
    address: "",
    latitude: 47.322,
    longitude: 5.041,
    phone: "",
    email: "",
    website: "",
    instagram: "",
    category: "restaurant",
    status: "pending",
  });

  const [errors, setErrors] = useState<Partial<Establishment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (establishment) {
      setFormData(establishment);
    }
  }, [establishment]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ùû]/g, 'u')
      .replace(/[ôö]/g, 'o')
      .replace(/[îï]/g, 'i')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Establishment> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }

    if (!formData.category) {
      newErrors.category = "La catégorie est requise";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = "L'URL doit commencer par http:// ou https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const url = establishment 
        ? `/api/etablissements/${establishment.slug}` 
        : '/api/etablissements';
      
      const method = establishment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      
      // Rediriger vers la page de détails
      router.push(`/etablissements/${result.slug || establishment?.slug}`);
      router.refresh();
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Establishment, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Générer le slug automatiquement quand le nom change
    if (field === 'name' && !establishment) {
      const slug = generateSlug(value as string);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Nom et Slug */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nom de l'établissement *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Le Central Bar"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="central-bar"
          />
          <p className="text-gray-500 text-sm mt-1">Généré automatiquement depuis le nom</p>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description de l'établissement..."
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Adresse *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="10 Rue Principale, 21000 Dijon"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* Coordonnées */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.latitude}
            onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.longitude}
            onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="03 80 XX XX XX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contact@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Web */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Site web
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.example.com"
          />
          {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Instagram
          </label>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => handleInputChange('instagram', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="@username"
          />
        </div>

        {/* Catégorie et Statut */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Catégorie *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "active" ? "Actif" : s === "pending" ? "En attente" : "Suspendu"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sauvegarde...' : (establishment ? 'Modifier' : 'Créer')}
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
