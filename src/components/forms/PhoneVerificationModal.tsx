'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

export default function PhoneVerificationModal({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  onVerificationSuccess 
}: PhoneVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const [canResend, setCanResend] = useState(false);

  // Timer pour le code de vérification
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [isOpen, timeLeft]);

  // Envoyer le code automatiquement à l'ouverture du modal
  useEffect(() => {
    if (isOpen && phoneNumber) {
      sendVerificationCode();
    }
  }, [isOpen, phoneNumber]);

  const sendVerificationCode = async () => {
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          action: 'send'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Code de vérification envoyé !');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Veuillez saisir le code de vérification');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          action: 'verify',
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Numéro de téléphone vérifié avec succès !');
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'Code de vérification incorrect');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyCode();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay avec fond bleu transparent et noir */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Vérification du numéro
              </h3>
              <p className="text-sm text-gray-500">
                Code envoyé à {phoneNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message d'information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Code de vérification envoyé
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Vérifiez vos messages et saisissez le code reçu
                </p>
              </div>
            </div>
          </div>

          {/* Champ de code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification *
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="123456"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                maxLength={6}
              />
              <button
                onClick={verifyCode}
                disabled={isVerifying || !verificationCode.trim()}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isVerifying ? 'Vérification...' : 'Vérifier'}
              </button>
            </div>
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={sendVerificationCode}
              disabled={isSending || !canResend}
              className="text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {isSending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
            
            <div className="text-sm text-gray-500">
              {timeLeft > 0 ? (
                <span>Code valide {formatTime(timeLeft)}</span>
              ) : (
                <span className="text-orange-500">Code expiré</span>
              )}
            </div>
          </div>

          {/* Mode développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Mode développement : Vérifiez la console pour voir le code de vérification
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
