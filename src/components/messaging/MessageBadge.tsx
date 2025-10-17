"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MessageBadge() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    // Fonction pour récupérer le nombre de messages non lus
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messaging/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des messages non lus:", error);
      }
    };

    // Récupérer immédiatement
    fetchUnreadCount();

    // Puis toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [session]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

