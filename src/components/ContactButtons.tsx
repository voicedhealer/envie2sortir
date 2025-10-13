"use client";

import { useState } from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface ContactButtonsProps {
  establishment: {
    id: string;
    name: string;
    phone?: string | null;
    whatsappPhone?: string | null;
    messengerUrl?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
  };
  onContactClick?: () => void;
  vertical?: boolean;
}

export default function ContactButtons({ establishment, onContactClick, vertical = false }: ContactButtonsProps) {
  const { isMobile, isLoading } = useDeviceDetection();
  const [showOptions, setShowOptions] = useState(false);

  // Vérifier si on a au moins un moyen de contact
  const hasContact = establishment.phone || establishment.whatsappPhone || establishment.messengerUrl || establishment.email;
  
  if (!hasContact) {
    return null;
  }

  const handleWhatsAppClick = () => {
    if (!establishment.whatsappPhone) return;
    
    // Nettoyer le numéro de téléphone (enlever espaces, points, tirets)
    const cleanPhone = establishment.whatsappPhone.replace(/[\s\.\-\(\)]/g, '');
    
    // Ajouter l'indicatif +33 si ce n'est pas déjà présent
    const phoneWithCountryCode = cleanPhone.startsWith('+33') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? '+33' + cleanPhone.substring(1)
        : '+33' + cleanPhone;
    
    // Message pré-rempli
    const message = `Bonjour ! Je suis intéressé(e) par votre établissement "${establishment.name}" et j'aimerais avoir plus d'informations.`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    onContactClick?.();
  };

  const handleEmailClick = () => {
    if (!establishment.email) return;
    
    const subject = `Demande d'information - ${establishment.name}`;
    const body = `Bonjour,\n\nJe suis intéressé(e) par votre établissement "${establishment.name}" et j'aimerais avoir plus d'informations.\n\nCordialement`;
    
    const mailtoUrl = `mailto:${establishment.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    
    onContactClick?.();
  };

  const handlePhoneClick = () => {
    if (!establishment.phone) return;
    
    const telUrl = `tel:${establishment.phone}`;
    window.open(telUrl, '_self');
    
    onContactClick?.();
  };

  const handleMessengerClick = () => {
    if (!establishment.messengerUrl) return;
    
    // Ouvrir le lien Messenger
    window.open(establishment.messengerUrl, '_blank');
    
    onContactClick?.();
  };

  // Compter les moyens de contact disponibles
  const contactMethods = [];
  if (establishment.phone) contactMethods.push('phone');
  if (establishment.whatsappPhone) contactMethods.push('whatsapp');
  if (establishment.messengerUrl) contactMethods.push('messenger');
  if (establishment.email) contactMethods.push('email');
  
  // Si un seul moyen de contact, l'afficher directement (peu importe mobile/desktop)
  if (contactMethods.length === 1) {
    const buttonClass = vertical 
      ? "flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      : "action-btn info";
    
    if (establishment.whatsappPhone) {
      return (
        <button
          onClick={handleWhatsAppClick}
          className={buttonClass}
        >
          <MessageCircle className={`w-5 h-5 text-gray-700 ${vertical ? 'mb-2' : ''}`} />
          <span className={vertical ? 'text-xs text-gray-700 font-medium' : ''}>WhatsApp</span>
        </button>
      );
    } else if (establishment.messengerUrl) {
      return (
        <button
          onClick={handleMessengerClick}
          className={buttonClass}
        >
          <MessageCircle className={`w-5 h-5 text-gray-700 ${vertical ? 'mb-2' : ''}`} />
          <span className={vertical ? 'text-xs text-gray-700 font-medium' : ''}>Messenger</span>
        </button>
      );
    } else if (establishment.phone) {
      return (
        <button
          onClick={handlePhoneClick}
          className={buttonClass}
        >
          <Phone className={`w-5 h-5 text-gray-700 ${vertical ? 'mb-2' : ''}`} />
          <span className={vertical ? 'text-xs text-gray-700 font-medium' : ''}>Contacter</span>
        </button>
      );
    } else if (establishment.email) {
      return (
        <button
          onClick={handleEmailClick}
          className={buttonClass}
        >
          <Mail className={`w-5 h-5 text-gray-700 ${vertical ? 'mb-2' : ''}`} />
          <span className={vertical ? 'text-xs text-gray-700 font-medium' : ''}>Email</span>
        </button>
      );
    }
  }

  // Si plusieurs moyens de contact, afficher selon l'appareil
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // Sur mobile : Afficher les boutons côte à côte
  if (isMobile) {
    return (
      <div className="flex gap-2 flex-wrap">
        {establishment.whatsappPhone && (
          <button
            onClick={handleWhatsAppClick}
            className="action-btn info"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        )}
        
        {establishment.messengerUrl && (
          <button
            onClick={handleMessengerClick}
            className="action-btn info"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Messenger</span>
          </button>
        )}
        
        {establishment.phone && (
          <button
            onClick={handlePhoneClick}
            className="action-btn info"
          >
            <Phone className="w-4 h-4" />
            <span>Appeler</span>
          </button>
        )}
        
        {establishment.email && (
          <button
            onClick={handleEmailClick}
            className="action-btn info"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        )}
      </div>
    );
  }

  // Si plusieurs moyens de contact, afficher le menu déroulant
  const buttonClass = vertical 
    ? "flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
    : "action-btn info";
    
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={buttonClass}
      >
        <Phone className={`w-4 h-4 ${vertical ? 'mb-2' : ''}`} />
        <span className={vertical ? 'text-xs text-gray-700 font-medium' : ''}>Contacter</span>
      </button>
      
      {showOptions && (
        <div className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${vertical ? 'left-1/2 transform -translate-x-1/2' : ''}`}>
          <div className="py-2">
            {establishment.whatsappPhone && (
              <button
                onClick={() => {
                  handleWhatsAppClick();
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span>WhatsApp</span>
              </button>
            )}
            
            {establishment.messengerUrl && (
              <button
                onClick={() => {
                  handleMessengerClick();
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>Messenger</span>
              </button>
            )}
            
            {establishment.phone && (
              <button
                onClick={() => {
                  handlePhoneClick();
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-blue-500" />
                <span>Appeler</span>
              </button>
            )}
            
            {establishment.email && (
              <button
                onClick={() => {
                  handleEmailClick();
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 text-orange-500" />
                <span>Email</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
