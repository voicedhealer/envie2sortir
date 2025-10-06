import React from 'react';

interface HealthInfoProps {
  healthOptions: string[];
  className?: string;
}

export default function HealthInfo({ healthOptions, className = '' }: HealthInfoProps) {
  if (!healthOptions || healthOptions.length === 0) {
    return null;
  }

  // Séparer les risques des solutions
  const risks = healthOptions.filter(option => option.includes('⚠️'));
  const solutions = healthOptions.filter(option => option.includes('✅'));

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="text-xl mr-2">🏥</span>
        Santé et sécurité
      </h3>
      
      <div className="space-y-4">
        {/* Risques */}
        {risks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informations importantes :</h4>
            <div className="flex flex-wrap gap-2">
              {risks.map((risk, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Solutions */}
        {solutions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Mesures de sécurité :</h4>
            <div className="flex flex-wrap gap-2">
              {solutions.map((solution, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {solution}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
