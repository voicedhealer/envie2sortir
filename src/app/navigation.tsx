"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/carte", label: "", icon: "/icone_maps_3.svg" },
    { href: "/etablissements/nouveau", label: "Ajoutez mon établissement" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Envie2Sortir - Accueil">
              <Image src="/logo.svg" alt="Envie2Sortir" width={135} height={150} priority />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === item.href
                    ? "bg-black/5 text-black"
                    : "text-gray-700 hover:text-black hover:bg-black/5"
                }`}
              >
                {item.icon && (
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={10} 
                    height={10} 
                    className="w-7 h-7"
                  />
                )}
                {item.label}
              </Link>
            ))}

            <Link href="/auth" className="px-4 py-2 text-sm font-medium rounded-md btn-gradient">
              S'inscrire
            </Link>
            <Link href="/auth" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black flex items-center gap-2">
              <Image 
                src="/connexion_user.svg" 
                alt="Connexion" 
                width={20} 
                height={20} 
                className="w-7 h-7"
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
