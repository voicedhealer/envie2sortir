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
      establishmentId: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: string
    establishmentId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    establishmentId: string
    role: string
    firstName: string
    lastName: string
  }
}
