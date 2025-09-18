"use client";

import { useState, useEffect } from 'react';

export interface DetailedPaymentsData {
  credit_cards: boolean;
  debit_cards: boolean;
  nfc_payments: boolean;
  restaurant_vouchers: boolean;
  cash: boolean;
  bank_transfer: boolean;
  paypal: boolean;
  apple_pay: boolean;
  google_pay: boolean;
  cheques: boolean;
}

interface DetailedPaymentsFormProps {
  initialData?: DetailedPaymentsData;
  onChange: (data: DetailedPaymentsData) => void;
  disabled?: boolean;
}

const defaultData: DetailedPaymentsData = {
  credit_cards: false,
  debit_cards: false,
  nfc_payments: false,
  restaurant_vouchers: false,
  cash: false,
  bank_transfer: false,
  paypal: false,
  apple_pay: false,
  google_pay: false,
  cheques: false,
};

export default function DetailedPaymentsForm({ 
  initialData, 
  onChange, 
  disabled = false 
}: DetailedPaymentsFormProps) {
  const [data, setData] = useState<DetailedPaymentsData>(initialData || defaultData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof DetailedPaymentsData, value: boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const paymentOptions = [
    {
      key: 'credit_cards' as const,
      label: 'Cartes de crédit',
      icon: '💳',
    },
    {
      key: 'debit_cards' as const,
      label: 'Cartes de débit',
      icon: '💳',
    },
    {
      key: 'nfc_payments' as const,
      label: 'Paiements mobiles NFC',
      icon: '📱',
    },
    {
      key: 'restaurant_vouchers' as const,
      label: 'Titres restaurant',
      icon: '🍽️',
    },
    {
      key: 'cash' as const,
      label: 'Espèces',
      icon: '💵',
    },
    {
      key: 'bank_transfer' as const,
      label: 'Virement bancaire',
      icon: '🏦',
    },
    {
      key: 'paypal' as const,
      label: 'PayPal',
      icon: '🅿️',
    },
    {
      key: 'apple_pay' as const,
      label: 'Apple Pay',
      icon: '🍎',
    },
    {
      key: 'google_pay' as const,
      label: 'Google Pay',
      icon: '🔵',
    },
    {
      key: 'cheques' as const,
      label: 'Chèques',
      icon: '📝',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          💳 Moyens de paiement acceptés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                data[option.key]
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={data[option.key]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <span className="text-lg">{option.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>💰 Conseil :</strong> Plus vous acceptez de moyens de paiement, 
            plus vous facilitez l'accès à votre établissement.
          </p>
        </div>
      </div>
    </div>
  );
}
