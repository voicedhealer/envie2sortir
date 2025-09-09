import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Rechercher l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Vérifier le mot de passe
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValidPassword) {
            return null;
          }

          // Rechercher l'établissement de l'utilisateur (seulement pour les pros)
          let establishment = null;
          if (user.role === 'pro') {
            establishment = await prisma.establishment.findFirst({
              where: { ownerId: user.id }
            });
          }

          // Retourner les informations utilisateur
          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            establishmentId: establishment?.id || ''
          };
        } catch (error) {
          console.error('Erreur authentification:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile: any }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Vérifier si l'utilisateur existe déjà
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Créer un nouvel utilisateur
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                provider: account.provider,
                providerId: account.providerAccountId,
                avatar: user.image,
                isVerified: true,
                role: 'user'
              }
            });
          } else if (existingUser.provider !== account.provider) {
            // Mettre à jour l'utilisateur existant
            existingUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
                avatar: user.image,
                isVerified: true
              }
            });
          }

          // Ajouter les informations utilisateur au token
          user.id = existingUser.id;
          user.role = existingUser.role;
          user.firstName = existingUser.firstName;
          user.lastName = existingUser.lastName;
          user.establishmentId = '';

          return true;
        } catch (error) {
          console.error('Erreur lors de la connexion sociale:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.establishmentId = user.establishmentId;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.establishmentId = token.establishmentId as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
