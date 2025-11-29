'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import type { WaitlistJoinRequest, WaitlistJoinResponse } from '@/types/waitlist';

/**
 * Composant WaitlistSignupForm
 * Formulaire d'inscription à la waitlist premium pour les professionnels
 */
export default function WaitlistSignupForm() {
  const [formData, setFormData] = useState<WaitlistJoinRequest>({
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<WaitlistJoinResponse | null>(null);

  const handleChange = (field: keyof WaitlistJoinRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.firstName || formData.firstName.length < 1) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName || formData.lastName.length < 1) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.establishmentName || formData.establishmentName.length < 1) {
      newErrors.establishmentName = 'Le nom de l\'établissement est requis';
    }

    if (!formData.phone || !/^(0[67]|\+33[67])[0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide (06 ou 07)';
    }

    if (!formData.siret || !/^[0-9]{14}$/.test(formData.siret.replace(/\s/g, ''))) {
      newErrors.siret = 'SIRET invalide (14 chiffres)';
    }

    if (!formData.companyName || formData.companyName.length < 1) {
      newErrors.companyName = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.legalStatus || formData.legalStatus.length < 1) {
      newErrors.legalStatus = 'Le statut juridique est requis';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Nettoyer le SIRET (enlever les espaces)
      const cleanedData = {
        ...formData,
        siret: formData.siret.replace(/\s/g, ''),
        phone: formData.phone.replace(/\s/g, ''),
      };

      const res = await fetch('/api/professionals/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data: WaitlistJoinResponse = await res.json();

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
      } else {
        setResponse(data);
      }
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Erreur lors de l\'inscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (response?.success) {
    return (
      <div className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-[#ff751f]/20 via-[#ff1fa9]/20 to-[#ff3a3a]/20 border border-white/10">
        <div className="text-center space-y-4">
          <CheckCircle2 className="mx-auto text-[#ff751f] w-16 h-16" />
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff751f] to-[#ff1fa9]">
            Inscription réussie !
          </h3>
          <p className="text-gray-300">{response.message}</p>
          <div className="mt-6">
            <CountdownTimer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.firstName ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
            required
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
            Nom *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.lastName ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
            required
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full bg-white/5 border ${
            errors.email ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="establishmentName" className="block text-sm font-medium text-gray-300 mb-2">
          Nom de l'établissement *
        </label>
        <input
          type="text"
          id="establishmentName"
          value={formData.establishmentName}
          onChange={(e) => handleChange('establishmentName', e.target.value)}
          className={`w-full bg-white/5 border ${
            errors.establishmentName ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
          required
        />
        {errors.establishmentName && (
          <p className="mt-1 text-sm text-red-400">{errors.establishmentName}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          Téléphone (06 ou 07) *
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="0612345678"
          className={`w-full bg-white/5 border ${
            errors.phone ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
          required
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
        )}
      </div>

      <div>
        <label htmlFor="siret" className="block text-sm font-medium text-gray-300 mb-2">
          SIRET (14 chiffres) *
        </label>
        <input
          type="text"
          id="siret"
          value={formData.siret}
          onChange={(e) => handleChange('siret', e.target.value.replace(/\D/g, ''))}
          placeholder="12345678901234"
          maxLength={14}
          className={`w-full bg-white/5 border ${
            errors.siret ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
          required
        />
        {errors.siret && (
          <p className="mt-1 text-sm text-red-400">{errors.siret}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            id="companyName"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.companyName ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
            required
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label htmlFor="legalStatus" className="block text-sm font-medium text-gray-300 mb-2">
            Statut juridique *
          </label>
          <select
            id="legalStatus"
            value={formData.legalStatus}
            onChange={(e) => handleChange('legalStatus', e.target.value)}
            className={`w-full bg-white/5 border ${
              errors.legalStatus ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
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
          {errors.legalStatus && (
            <p className="mt-1 text-sm text-red-400">{errors.legalStatus}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Mot de passe (min. 8 caractères) *
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={`w-full bg-white/5 border ${
            errors.password ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#ff751f] outline-none transition-all`}
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      {response && !response.success && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{response.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#ff751f] to-[#ff1fa9] hover:from-[#ff751f]/80 hover:to-[#ff1fa9]/80 text-white font-semibold rounded-lg px-6 py-4 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#ff751f]/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Inscription en cours...</span>
          </>
        ) : (
          <span>Rejoindre la waitlist premium</span>
        )}
      </button>

      <div className="mt-6 pt-6 border-t border-white/10">
        <CountdownTimer />
      </div>
    </form>
  );
}

