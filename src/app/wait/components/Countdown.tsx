'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC = () => {
  const calculateTimeLeft = (): TimeLeft => {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Initialiser avec des valeurs par défaut pour éviter les problèmes d'hydratation
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer comme monté côté client et calculer immédiatement
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-3 md:p-6 min-w-[70px] md:min-w-[100px] text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff1fa9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="text-2xl md:text-5xl font-bold text-white relative z-10">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      <span className="text-gray-400 text-xs md:text-sm mt-2 font-medium tracking-widest uppercase">{label}</span>
    </div>
  );

  // Afficher un placeholder jusqu'à ce que le composant soit monté côté client
  if (!mounted) {
    return (
      <div className="flex justify-center flex-wrap mt-8 md:mt-12">
        <TimeUnit value={0} label="Jours" />
        <TimeUnit value={0} label="Heures" />
        <TimeUnit value={0} label="Minutes" />
        <TimeUnit value={0} label="Secondes" />
      </div>
    );
  }

  return (
    <div className="flex justify-center flex-wrap mt-8 md:mt-12">
      <TimeUnit value={timeLeft.days} label="Jours" />
      <TimeUnit value={timeLeft.hours} label="Heures" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Secondes" />
    </div>
  );
};

export default Countdown;

