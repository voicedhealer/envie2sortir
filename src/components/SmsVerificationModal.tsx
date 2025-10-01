"use client";

import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

interface SmsVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  fieldName: string;
  phone: string;
}

export default function SmsVerificationModal({ 
  isOpen, 
  onClose, 
  onVerified, 
  fieldName,
  phone 
}: SmsVerificationModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Envoyer le code SMS à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      sendSmsCode();
    }
  }, [isOpen]);

  // Compte à rebours pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendSmsCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/professional/send-verification-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60); // 60 secondes avant de pouvoir renvoyer
        if (data.devCode) {
          setDevCode(data.devCode);
          console.log('🔐 Code de développement:', data.devCode);
        }
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/professional/verify-sms-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        onVerified();
        onClose();
      } else {
        setError(data.error || 'Code incorrect');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-orange-500" />
            Vérification par SMS
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Un code de vérification à 6 chiffres a été envoyé par SMS au numéro :
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="font-mono text-lg">{phone}</p>
          </div>

          {devCode && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Mode développement - Code:</strong> {devCode}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entrez le code reçu
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Renvoyer le code dans {countdown}s
              </p>
            ) : (
              <button
                onClick={sendSmsCode}
                disabled={isLoading}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Renvoyer le code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

