import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./navigation";
import AuthProvider from "./components/AuthProvider";
import { CSRFProvider } from "@/components/CSRFProvider";
import FakeToaster from "@/components/FakeToaster";
import { LocationProvider } from "@/contexts/LocationContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Envie2Sortir",
  description: "Trouvez où sortir près de chez vous",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.ico' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true} style={{ overflowAnchor: 'none' }}>
        <AuthProvider>
          <CSRFProvider>
            <LocationProvider isAuthenticated={false}>
              <Navigation />
              {children}
              <FakeToaster />
            </LocationProvider>
          </CSRFProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
