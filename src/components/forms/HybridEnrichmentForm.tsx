"use client";

import { useState, useEffect } from 'react';
import DetailedAccessibilityForm, { DetailedAccessibilityData } from './DetailedAccessibilityForm';
import DetailedServicesForm, { DetailedServicesData } from './DetailedServicesForm';
import ClienteleInfoForm, { ClienteleInfoData } from './ClienteleInfoForm';
import DetailedPaymentsForm, { DetailedPaymentsData } from './DetailedPaymentsForm';
import ChildrenServicesForm, { ChildrenServicesData } from './ChildrenServicesForm';
import ParkingInfoForm, { ParkingInfoData } from './ParkingInfoForm';

export interface HybridEnrichmentData {
  accessibilityDetails?: DetailedAccessibilityData;
  detailedServices?: DetailedServicesData;
  clienteleInfo?: ClienteleInfoData;
  detailedPayments?: DetailedPaymentsData;
  childrenServices?: ChildrenServicesData;
  parkingInfo?: ParkingInfoData;
}

interface HybridEnrichmentFormProps {
  initialData?: HybridEnrichmentData;
  onChange: (data: HybridEnrichmentData) => void;
  disabled?: boolean;
  title?: string;
}

export default function HybridEnrichmentForm({ 
  initialData, 
  onChange, 
  disabled = false,
  title = "Informations complémentaires"
}: HybridEnrichmentFormProps) {
  const [data, setData] = useState<HybridEnrichmentData>(initialData || {});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    accessibility: false,
    services: false,
    clientele: false,
    payments: false,
    children: false,
    parking: false,
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const updateData = (section: keyof HybridEnrichmentData, sectionData: any) => {
    const newData = { ...data, [section]: sectionData };
    setData(newData);
    onChange(newData);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionSummary = (section: keyof HybridEnrichmentData) => {
    const sectionData = data[section];
    if (!sectionData) return 0;
    
    return Object.values(sectionData).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            Complétez les informations automatiquement récupérées avec des détails spécifiques 
            à votre établissement. Ces informations amélioreront votre visibilité.
          </p>
        </div>

        <div className="space-y-4">
          {/* Section Accessibilité */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('accessibility')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">♿</span>
                <span className="font-medium">Accessibilité détaillée</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('accessibilityDetails')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.accessibility ? '▲' : '▼'}
              </span>
            </button>
            {openSections.accessibility && (
              <div className="p-4 border-t border-gray-200">
                <DetailedAccessibilityForm
                  initialData={data.accessibilityDetails}
                  onChange={(accessibilityData) => updateData('accessibilityDetails', accessibilityData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Section Services */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('services')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏪</span>
                <span className="font-medium">Services détaillés</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('detailedServices')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.services ? '▲' : '▼'}
              </span>
            </button>
            {openSections.services && (
              <div className="p-4 border-t border-gray-200">
                <DetailedServicesForm
                  initialData={data.detailedServices}
                  onChange={(servicesData) => updateData('detailedServices', servicesData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Section Clientèle */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('clientele')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">👥</span>
                <span className="font-medium">Clientèle et inclusivité</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('clienteleInfo')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.clientele ? '▲' : '▼'}
              </span>
            </button>
            {openSections.clientele && (
              <div className="p-4 border-t border-gray-200">
                <ClienteleInfoForm
                  initialData={data.clienteleInfo}
                  onChange={(clienteleData) => updateData('clienteleInfo', clienteleData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Section Paiements */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('payments')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">💳</span>
                <span className="font-medium">Moyens de paiement</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('detailedPayments')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.payments ? '▲' : '▼'}
              </span>
            </button>
            {openSections.payments && (
              <div className="p-4 border-t border-gray-200">
                <DetailedPaymentsForm
                  initialData={data.detailedPayments}
                  onChange={(paymentsData) => updateData('detailedPayments', paymentsData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Section Enfants */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('children')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">👶</span>
                <span className="font-medium">Services enfants</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('childrenServices')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.children ? '▲' : '▼'}
              </span>
            </button>
            {openSections.children && (
              <div className="p-4 border-t border-gray-200">
                <ChildrenServicesForm
                  initialData={data.childrenServices}
                  onChange={(childrenData) => updateData('childrenServices', childrenData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          {/* Section Parking */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('parking')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
              disabled={disabled}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🅿️</span>
                <span className="font-medium">Options de parking</span>
                <span className="text-sm text-gray-500">
                  ({getSectionSummary('parkingInfo')} sélectionnés)
                </span>
              </div>
              <span className="text-gray-400">
                {openSections.parking ? '▲' : '▼'}
              </span>
            </button>
            {openSections.parking && (
              <div className="p-4 border-t border-gray-200">
                <ParkingInfoForm
                  initialData={data.parkingInfo}
                  onChange={(parkingData) => updateData('parkingInfo', parkingData)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            💡 Pourquoi compléter ces informations ?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Meilleure visibilité</strong> : Les clients trouvent plus facilement votre établissement</li>
            <li>• <strong>Ciblage précis</strong> : Attirez la clientèle qui vous correspond</li>
            <li>• <strong>Confiance renforcée</strong> : Les informations détaillées rassurent les clients</li>
            <li>• <strong>Différenciation</strong> : Mettez en avant vos spécificités</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
