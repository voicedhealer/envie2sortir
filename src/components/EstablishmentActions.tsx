'use client';

import { Phone, MapPin, MessageCircle, Star } from 'lucide-react';

interface EstablishmentActionsProps {
  establishment: {
    phone?: string;
    address: string;
    city?: string;
    avgRating?: number;
    totalComments?: number;
  };
}

export default function EstablishmentActions({ establishment }: EstablishmentActionsProps) {
  const handleCall = () => {
    if (establishment.phone) {
      window.open(`tel:${establishment.phone}`, '_self');
    }
  };

  const handleDirections = () => {
    const address = `${establishment.address}${establishment.city ? `, ${establishment.city}` : ''}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const handleReview = () => {
    // Scroll vers la section avis ou ouvrir un modal
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 establishment-card animate-slide-in-right">
      <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
      
      <div className="action-buttons">
        {/* Itinéraire */}
        <button
          onClick={handleDirections}
          className="action-btn info"
        >
          <MapPin className="w-4 h-4" />
          <span>Itinéraire</span>
        </button>

        {/* Appeler */}
        <button
          onClick={handleCall}
          className={`action-btn ${establishment.phone ? 'success' : 'disabled'}`}
          disabled={!establishment.phone}
        >
          <Phone className="w-4 h-4" />
          <span>Appeler</span>
        </button>

        {/* Message */}
        <button
          onClick={() => console.log('Message')}
          className="action-btn"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>

        {/* Avis */}
        <button
          onClick={handleReview}
          className="action-btn primary"
        >
          <Star className="w-4 h-4" />
          <span>Avis</span>
        </button>
      </div>

      {/* Note et avis en bas */}
      {establishment.avgRating && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{establishment.avgRating.toFixed(1)}</span>
            </div>
            {establishment.totalComments && (
              <span className="text-gray-600 text-sm">
                ({establishment.totalComments} avis)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
