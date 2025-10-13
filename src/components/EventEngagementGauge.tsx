'use client';

import { useEffect, useState } from 'react';

interface EventEngagementGaugeProps {
  percentage: number;
  eventBadge?: {
    type: string;
    label: string;
    color: string;
  } | null;
  isVertical?: boolean;
}

export default function EventEngagementGauge({ percentage, eventBadge, isVertical = false }: EventEngagementGaugeProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // Animation progressive de la jauge au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  // Calcul de la largeur/hauteur de la jauge (max 100% de la barre même si la valeur va à 150%)
  const gaugeSize = Math.min((displayPercentage / 150) * 100, 100);

  // Déterminer la position du background pour afficher les bonnes couleurs
  const getBackgroundPosition = () => {
    if (displayPercentage <= 100) {
      return isVertical ? 'center top' : 'left center';
    }
    // Pour 100-150%, on déplace le gradient
    const shift = ((displayPercentage - 100) / 50) * 100;
    return isVertical ? `center ${shift}%` : `${shift}% center`;
  };

  return (
    <div className={`jauge-envie-container ${isVertical ? 'vertical' : ''}`}>
      {/* Barre de jauge */}
      <div className={`jauge-envie-background ${isVertical ? 'vertical' : ''}`}>
        <div 
          className={`jauge-envie-fill ${displayPercentage >= 100 ? 'fire-mode' : ''} ${isVertical ? 'vertical' : ''}`}
          style={{
            [isVertical ? 'height' : 'width']: `${gaugeSize}%`,
            backgroundPosition: getBackgroundPosition()
          }}
          data-percentage={displayPercentage}
        >
          {!isVertical && (
            <div className="jauge-percentage-text">
              {Math.round(displayPercentage)}%
            </div>
          )}
        </div>
      </div>

      {/* Labels de référence - seulement en horizontal */}
      {!isVertical && (
        <div className="jauge-labels">
          <span className="label-start">0%</span>
          <span className="label-normal">50%</span>
          <span className="label-hot">100%</span>
          <span className="label-fire">150%</span>
        </div>
      )}

      {/* Badge de l'événement - seulement en horizontal */}
      {eventBadge && !isVertical && (
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

      {/* Affichage du pourcentage en vertical */}
      {isVertical && (
        <div className="vertical-percentage">
          <div className="percentage-text">
            {Math.round(displayPercentage)}%
          </div>
        </div>
      )}

      <style jsx>{`
        .jauge-envie-container {
          margin: 15px 0;
          position: relative;
        }

        .jauge-envie-container.vertical {
          margin: 5px 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .jauge-envie-background {
          height: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          border: 2px solid #ddd;
        }

        .jauge-envie-background.vertical {
          width: 12px;
          height: 100px;
          border-radius: 6px;
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

        .jauge-envie-fill.vertical {
          width: 100%;
          height: 0%;
          border-radius: 6px;
          background: linear-gradient(to bottom,
            #4CAF50 0%,     /* Vert début */
            #8BC34A 16.66%, /* Vert clair */
            #FFC107 33.33%, /* Jaune */
            #FF9800 50%,    /* Orange */
            #F44336 66.66%, /* Rouge */
            #9C27B0 83.33%, /* Violet début */
            #6A1B9A 100%    /* Violet intense */
          );
          background-size: 100% 150%;
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

        .vertical-percentage {
          margin-top: 8px;
          text-align: center;
        }

        .percentage-text {
          color: #666;
          font-weight: bold;
          font-size: 11px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

