import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      role: string
      userType: 'user' | 'professional'
      establishmentId?: string // Optionnel car seulement pour les professionnels
      favoriteCity?: string // Optionnel car seulement pour les users
      siret?: string // Spécifique aux professionnels
      companyName?: string // Spécifique aux professionnels
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: string
    userType: 'user' | 'professional'
    establishmentId?: string
    favoriteCity?: string
    siret?: string
    companyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    firstName: string
    lastName: string
    userType: 'user' | 'professional'
    establishmentId?: string
    favoriteCity?: string
    siret?: string
    companyName?: string
  }
}
