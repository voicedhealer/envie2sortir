"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import UserMenu from "./components/UserMenu";

// Composant Link personnalisé pour éviter les problèmes d'hydratation
const LinkComponent = ({ href, className, children, ...props }: any) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }
  
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
};

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/carte", label: "", icon: "/icone_maps_3.svg" },
    { href: "/etablissements/nouveau", label: "Ajoutez mon établissement" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <LinkComponent href="/" className="flex items-center" aria-label="Envie2Sortir - Accueil">
              <Image src="/logo.svg" alt="Envie2Sortir" width={135} height={150} priority />
            </LinkComponent>
          </div>
          
          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <LinkComponent
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
              </LinkComponent>
            ))}
            <UserMenu />
          </div>

          {/* Bouton Hamburger Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-black hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <LinkComponent
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2 ${
                    pathname === item.href
                      ? "bg-black/5 text-black"
                      : "text-gray-700 hover:text-black hover:bg-black/5"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                </LinkComponent>
              ))}
              <UserMenu isMobile={true} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
