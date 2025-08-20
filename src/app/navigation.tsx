"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/etablissements", label: "Établissements" },
    { href: "/carte", label: "Carte" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Envie2Sortir - Accueil">
              <Image src="/logo.svg" alt="Envie2Sortir" width={135} height={150} priority />
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-black/5 text-black"
                    : "text-gray-700 hover:text-black hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
