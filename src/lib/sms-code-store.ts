// Stockage temporaire des codes SMS (en production, utiliser Redis)
// Ce module est partagé entre toutes les routes API
// NOTE: En Next.js, les routes API peuvent être exécutées dans des workers séparés,
// donc cette Map en mémoire peut ne pas être partagée. Pour la production, utiliser Redis.

const smsCodesStore = new Map<string, { code: string; expiry: Date }>();

export function storeSmsCode(userId: string, code: string, expiry: Date) {
  smsCodesStore.set(userId, { code, expiry });
  console.log('💾 [SMS Store] Code stocké pour userId:', userId, 'code:', code);
  console.log('📦 [SMS Store] Total codes stockés:', smsCodesStore.size);
  console.log('📋 [SMS Store] Tous les userIds stockés:', Array.from(smsCodesStore.keys()));
  console.log('⏰ [SMS Store] Expiration:', expiry.toISOString());
}

export function getSmsCode(userId: string): { code: string; expiry: Date } | undefined {
  const result = smsCodesStore.get(userId);
  console.log('🔍 [SMS Store] Recherche code pour userId:', userId);
  console.log('📦 [SMS Store] Total codes dans le store:', smsCodesStore.size);
  console.log('📋 [SMS Store] Tous les userIds dans le store:', Array.from(smsCodesStore.keys()));
  console.log('📋 [SMS Store] Code trouvé:', result ? `OUI (code: ${result.code}, expiry: ${result.expiry.toISOString()})` : 'NON');
  return result;
}

export function deleteSmsCode(userId: string) {
  smsCodesStore.delete(userId);
  console.log('🗑️ [SMS Store] Code supprimé pour userId:', userId);
}

export function getAllStoredCodes(): string[] {
  return Array.from(smsCodesStore.keys());
}

