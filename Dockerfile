# Étape 1: Build de l'application Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl libc6-compat

# Arguments de build pour les variables d'environnement nécessaires au build
# Note: NEXT_PUBLIC_* doit être au build car injecté dans le code côté client
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_WAIT_MODE
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
ARG NEXT_PUBLIC_INSEE_API_URL
ARG NEXT_PUBLIC_SITE_URL

# Exporter les variables d'environnement pour le build Next.js
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_WAIT_MODE=$NEXT_PUBLIC_WAIT_MODE
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=$NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
ENV NEXT_PUBLIC_INSEE_API_URL=$NEXT_PUBLIC_INSEE_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Builder l'application
RUN npm run build

# Étape 2: Image de production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Installer les dépendances système nécessaires pour Prisma et SQLite
RUN apk add --no-cache openssl libc6-compat sqlite

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Créer le répertoire pour la base de données SQLite et les uploads
RUN mkdir -p /app/prisma /app/public/uploads /app/logs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Le mode standalone crée un fichier server.js à la racine du .next/standalone
CMD ["node", "server.js"]

