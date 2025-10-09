'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EventEngagementButtonsProps {
  eventId: string;
  stats: {
    envie: number;
    'grande-envie': number;
    decouvrir: number;
    'pas-envie': number;
  };
  userEngagement?: string | null;
  onEngagementUpdate?: (data: any) => void;
}

export default function EventEngagementButtons({
  eventId,
  stats,
  userEngagement,
  onEngagementUpdate
}: EventEngagementButtonsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStats, setCurrentStats] = useState(stats);
  const [currentUserEngagement, setCurrentUserEngagement] = useState(userEngagement);

  const handleEngagement = async (type: string) => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'loading' || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'engagement');
      }

      const data = await response.json();

      // Mise à jour optimiste de l'UI
      setCurrentStats(data.stats);
      setCurrentUserEngagement(data.userEngagement);

      // Callback pour mettre à jour le composant parent (jauge)
      if (onEngagementUpdate) {
        onEngagementUpdate(data);
      }

      // Afficher notification si nouveau badge
      if (data.newBadge) {
        showBadgeNotification(data.newBadge);
      }

    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const showBadgeNotification = (badge: any) => {
    // Créer une notification toast pour le nouveau badge
    const toast = document.createElement('div');
    toast.className = 'badge-notification';
    toast.innerHTML = `🏆 Badge débloqué: ${badge.name}!`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.5s ease-out;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const buttons = [
    { type: 'envie', icon: '🌟', label: 'Envie d\'y être !', count: currentStats.envie },
    { type: 'grande-envie', icon: '🔥', label: 'Grande envie !', count: currentStats['grande-envie'] },
    { type: 'decouvrir', icon: '🔍', label: 'Envie de découvrir', count: currentStats.decouvrir },
    { type: 'pas-envie', icon: '❌', label: 'Pas mon envie', count: currentStats['pas-envie'] }
  ];

  return (
    <div className="envie-buttons-container">
      <div className="envie-buttons">
        {buttons.map((button) => (
          <button
            key={button.type}
            className={`btn-envie ${currentUserEngagement === button.type ? 'active' : ''} ${loading ? 'loading' : ''}`}
            data-type={button.type}
            onClick={() => handleEngagement(button.type)}
            disabled={loading}
          >
            <span className="btn-icon">{button.icon}</span>
            <span className="btn-label">{button.label}</span>
            <span className="count">{button.count}</span>
          </button>
        ))}
      </div>

      {status === 'unauthenticated' && (
        <p className="auth-hint">
          <span className="auth-icon">ℹ️</span>
          Connectez-vous pour participer !
        </p>
      )}

      <style jsx>{`
        .envie-buttons-container {
          margin: 10px 0;
        }

        .envie-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }

        .btn-envie {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        .btn-envie:hover:not(.loading) {
          border-color: #FF9800;
          background: #FFF3E0;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .btn-envie.active {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          border-color: #F57C00;
          color: white;
          font-weight: 600;
        }

        .btn-envie.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 16px;
          line-height: 1;
        }

        .btn-label {
          flex: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .count {
          background: rgba(0,0,0,0.1);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        .btn-envie.active .count {
          background: rgba(255,255,255,0.3);
        }

        .auth-hint {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .auth-icon {
          font-size: 14px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 640px) {
          .envie-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .btn-label {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}

