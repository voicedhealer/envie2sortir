'use client';

import { useEffect, useState } from 'react';

interface EventEngagementGaugeProps {
  percentage: number;
  eventBadge?: {
    type: string;
    label: string;
    color: string;
  } | null;
}

export default function EventEngagementGauge({ percentage, eventBadge }: EventEngagementGaugeProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // Animation progressive de la jauge au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  // Calcul de la largeur de la jauge (max 100% de la barre même si la valeur va à 150%)
  const gaugeWidth = Math.min((displayPercentage / 150) * 100, 100);

  // Déterminer la position du background pour afficher les bonnes couleurs
  const getBackgroundPosition = () => {
    if (displayPercentage <= 100) {
      return 'left center';
    }
    // Pour 100-150%, on déplace le gradient
    const shift = ((displayPercentage - 100) / 50) * 100;
    return `${shift}% center`;
  };

  return (
    <div className="jauge-envie-container">
      {/* Barre de jauge */}
      <div className="jauge-envie-background">
        <div 
          className={`jauge-envie-fill ${displayPercentage >= 100 ? 'fire-mode' : ''}`}
          style={{
            width: `${gaugeWidth}%`,
            backgroundPosition: getBackgroundPosition()
          }}
          data-percentage={displayPercentage}
        >
          <div className="jauge-percentage-text">
            {Math.round(displayPercentage)}%
          </div>
        </div>
      </div>

      {/* Labels de référence */}
      <div className="jauge-labels">
        <span className="label-start">0%</span>
        <span className="label-normal">50%</span>
        <span className="label-hot">100%</span>
        <span className="label-fire">150%</span>
      </div>

      {/* Badge de l'événement */}
      {eventBadge && (
        <div 
          className="event-badge"
          style={{
            backgroundColor: eventBadge.color,
            animation: 'badgeAppear 0.5s ease-out'
          }}
        >
          {eventBadge.label}
        </div>
      )}

      <style jsx>{`
        .jauge-envie-container {
          margin: 15px 0;
          position: relative;
        }

        .jauge-envie-background {
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          border: 2px solid #ddd;
        }

        .jauge-envie-fill {
          height: 100%;
          width: 0%;
          border-radius: 10px;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: linear-gradient(to right,
            #4CAF50 0%,     /* Vert début */
            #8BC34A 16.66%, /* Vert clair */
            #FFC107 33.33%, /* Jaune */
            #FF9800 50%,    /* Orange */
            #F44336 66.66%, /* Rouge */
            #9C27B0 83.33%, /* Violet début */
            #6A1B9A 100%    /* Violet intense */
          );
          background-size: 150% 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jauge-envie-fill.fire-mode {
          animation: fireMode 2s infinite alternate;
          box-shadow: 0 0 20px rgba(156, 39, 176, 0.6);
        }

        @keyframes fireMode {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(156, 39, 176, 0.6);
          }
          100% { 
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(156, 39, 176, 0.9);
          }
        }

        .jauge-percentage-text {
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
          position: relative;
          z-index: 1;
        }

        .jauge-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 11px;
          color: #666;
        }

        .label-fire {
          color: #9C27B0;
          font-weight: bold;
        }

        .label-hot {
          color: #F44336;
          font-weight: 600;
        }

        .event-badge {
          display: inline-block;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          margin-top: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        @keyframes badgeAppear {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

