import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('📍 Correction des coordonnées pour "La Pièce Unique Dijon"...');
    
    // Coordonnées de Chevigny-Saint-Sauveur (d'après l'adresse)
    const latitude = 47.3025118;
    const longitude = 5.1115999;
    
    // Mettre à jour l'établissement
    const updatedEstablishment = await prisma.establishment.updateMany({
      where: {
        name: {
          contains: "Pièce Unique"
        }
      },
      data: {
        latitude: latitude,
        longitude: longitude
      }
    });

    console.log(`✅ Coordonnées mises à jour: (${latitude}, ${longitude})`);

    return NextResponse.json({
      success: true,
      message: "Coordonnées mises à jour avec succès",
      coordinates: {
        latitude,
        longitude
      },
      establishmentsUpdated: updatedEstablishment.count
    });

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des coordonnées:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des coordonnées", details: error.message },
      { status: 500 }
    );
  }
}

