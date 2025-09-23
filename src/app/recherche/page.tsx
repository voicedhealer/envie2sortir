import { redirect } from 'next/navigation';

export default async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; lat?: string; lng?: string }>;
}) {
  const { q, category, lat, lng } = await searchParams;

  // Rediriger vers la page de recherche filtrée
  const params = new URLSearchParams();
  if (q) params.append('envie', q);
  if (category) params.append('ville', category);
  if (lat) params.append('lat', lat);
  if (lng) params.append('lng', lng);

  redirect(`/recherche/envie?${params.toString()}`);
}
