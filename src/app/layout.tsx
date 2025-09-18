import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./navigation";
import AuthProvider from "./components/AuthProvider";
import FakeToaster from "@/components/FakeToaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Envie2Sortir",
  description: "Trouvez où sortir près de chez vous",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          <Navigation />
          {children}
          <FakeToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
