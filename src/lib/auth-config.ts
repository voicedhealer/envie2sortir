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
          console.log('❌ Credentials manquantes');
          return null;
        }

        try {
          console.log('🔐 Tentative de connexion pour:', credentials.email);
          
          // Rechercher l'utilisateur par email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log('❌ Utilisateur non trouvé:', credentials.email);
            return null;
          }

          if (!user.passwordHash) {
            console.log('❌ Pas de mot de passe hashé pour:', credentials.email);
            return null;
          }

          // Vérifier le mot de passe
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValidPassword) {
            console.log('❌ Mot de passe incorrect pour:', credentials.email);
            return null;
          }

          console.log('✅ Authentification réussie pour:', credentials.email);

          // Retourner les informations utilisateur
          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            favoriteCity: user.favoriteCity || ''
          };
        } catch (error) {
          console.error('❌ Erreur authentification:', error);
          return null;
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    ] : [])
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
          user.favoriteCity = existingUser.favoriteCity || '';

          return true;
        } catch (error) {
          console.error('Erreur lors de la connexion sociale:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      console.log('🔐 JWT Callback - User:', user ? 'Present' : 'Not present');
      console.log('🔐 JWT Callback - Token:', token ? 'Present' : 'Not present');
      
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.favoriteCity = user.favoriteCity;
        console.log('🔐 JWT Callback - Updated token with user data');
      } else if (token) {
        // Si pas d'utilisateur mais qu'on a un token, on peut essayer de récupérer les données mises à jour
        // Cela se produit lors des appels suivants après la connexion
        console.log('🔐 JWT Callback - No user, using existing token');
      }
      
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log('🔐 Session Callback - Token:', token ? 'Present' : 'Not present');
      console.log('🔐 Session Callback - Session:', session ? 'Present' : 'Not present');
      
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.favoriteCity = token.favoriteCity as string;
        
        // Corriger l'affichage du nom
        if (session.user.firstName && session.user.lastName) {
          session.user.name = `${session.user.firstName} ${session.user.lastName}`;
        } else if (session.user.firstName) {
          session.user.name = session.user.firstName;
        }
        
        console.log('🔐 Session Callback - Updated session with user data:', session.user);
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  debug: process.env.NODE_ENV === 'development'
};
