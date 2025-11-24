'use client';

import { useEffect, useState } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: string;
}

interface UserBadgesProps {
  compact?: boolean;
  showProgress?: boolean;
}

export default function UserBadges({ compact = false, showProgress = true }: UserBadgesProps) {
  const { user, loading: sessionLoading } = useSupabaseSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [karmaPoints, setKarmaPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBadges();
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [user, sessionLoading]);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/user/gamification');
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
        setKarmaPoints(data.karmaPoints || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !sessionLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="badges-loading">
        <div className="spinner"></div>
        <style jsx>{`
          .badges-loading {
            display: flex;
            justify-content: center;
            padding: 20px;
          }
          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #FF9800;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const lockedBadges = badges.filter(b => !b.isUnlocked);

  if (compact) {
    return (
      <div className="badges-compact">
        <div className="karma-display">
          <span className="karma-icon">⭐</span>
          <span className="karma-value">{karmaPoints}</span>
          <span className="karma-label">Karma</span>
        </div>
        <div className="badges-mini">
          {unlockedBadges.map(badge => (
            <span 
              key={badge.id} 
              className="badge-mini"
              onMouseEnter={() => setShowTooltip(badge.id)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {badge.icon}
              {showTooltip === badge.id && (
                <div className="tooltip">{badge.name}</div>
              )}
            </span>
          ))}
        </div>

        <style jsx>{`
          .badges-compact {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .karma-display {
            display: flex;
            align-items: center;
            gap: 4px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            padding: 4px 10px;
            border-radius: 16px;
            color: white;
            font-weight: 600;
            font-size: 13px;
          }

          .karma-icon {
            font-size: 16px;
          }

          .karma-value {
            font-size: 14px;
          }

          .karma-label {
            font-size: 11px;
            opacity: 0.9;
          }

          .badges-mini {
            display: flex;
            gap: 4px;
          }

          .badge-mini {
            position: relative;
            font-size: 20px;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .badge-mini:hover {
            transform: scale(1.2);
          }

          .tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            margin-bottom: 4px;
            z-index: 10;
          }

          .tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #333;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="user-badges-full">
      <div className="badges-header">
        <h3>Vos Badges & Karma</h3>
        <div className="karma-display-full">
          <span className="karma-icon">⭐</span>
          <span className="karma-value">{karmaPoints}</span>
          <span className="karma-label">points de karma</span>
        </div>
      </div>

      {unlockedBadges.length > 0 && (
        <div className="badges-section">
          <h4>Badges Débloqués ({unlockedBadges.length})</h4>
          <div className="badges-grid">
            {unlockedBadges.map(badge => (
              <div key={badge.id} className="badge-card unlocked">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                  {badge.unlockedAt && (
                    <div className="badge-date">
                      Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showProgress && lockedBadges.length > 0 && (
        <div className="badges-section">
          <h4>Badges à Débloquer ({lockedBadges.length})</h4>
          <div className="badges-grid">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="badge-card locked">
                <div className="badge-icon grayscale">{badge.icon}</div>
                <div className="badge-info">
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                  {badge.threshold > 0 && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                      <span className="progress-text">{Math.round(badge.progress)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .user-badges-full {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .badges-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .badges-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .karma-display-full {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
        }

        .karma-icon {
          font-size: 24px;
        }

        .karma-value {
          font-size: 20px;
        }

        .karma-label {
          font-size: 13px;
          opacity: 0.9;
        }

        .badges-section {
          margin-top: 24px;
        }

        .badges-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #666;
          margin-bottom: 12px;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .badge-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          background: white;
          transition: all 0.3s;
        }

        .badge-card.unlocked {
          border-color: #4CAF50;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .badge-card.unlocked:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
        }

        .badge-card.locked {
          opacity: 0.6;
        }

        .badge-icon {
          font-size: 48px;
          line-height: 1;
        }

        .badge-icon.grayscale {
          filter: grayscale(100%);
          opacity: 0.5;
        }

        .badge-info {
          flex: 1;
        }

        .badge-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .badge-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .badge-date {
          font-size: 11px;
          color: #4CAF50;
          font-weight: 500;
        }

        .progress-bar {
          position: relative;
          height: 20px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
          transition: width 0.5s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 11px;
          font-weight: 600;
          color: #333;
        }

        @media (max-width: 640px) {
          .badges-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .badges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

