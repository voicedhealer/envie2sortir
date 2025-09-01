import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ActionButtons from "../action-buttons";
import EstablishmentDetail from "./EstablishmentDetail";

export default async function EstablishmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const establishment = await prisma.establishment.findUnique({
    where: { slug },
    include: {
      images: true,
      events: { orderBy: { startDate: "asc" } },
      professionalOwner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          companyName: true,
        }
      },
    },
  });

  if (!establishment) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <Link href="/etablissements" className="text-blue-500 hover:underline">
          ← Retour à la liste
        </Link>
        
        <ActionButtons establishment={establishment} />
      </div>

      <EstablishmentDetail establishment={establishment} />
    </main>
  );
}
