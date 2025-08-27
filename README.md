# Envie2Sortir - Plateforme Ultra-Locale de Divertissements

Une plateforme moderne et intuitive pour découvrir tous les établissements de divertissement près de chez vous.

## 🚀 Fonctionnalités Principales

### 🏠 Page d'Accueil Ultra-Performante
- **Hero Section** avec gradient orange-pink-rouge et slogan accrocheur
- **Barre de recherche intelligente** avec double input (ville + activité)
- **Effet typewriter** pour les suggestions d'activités
- **Géolocalisation** "Autour de moi" avec consentement utilisateur
- **Dropdowns dynamiques** pour villes et catégories d'activités
- **Sections visuelles** : meilleurs endroits, catégories, comment ça marche
- **Social Proof** avec témoignages utilisateurs
- **Section Pro** avec CTA pour référencer
- **Newsletter** et géolocalisation
- **Footer complet** avec liens et informations

### 🔍 Système de Recherche Avancé
- **Recherche par ville** avec suggestions automatiques
- **Recherche par catégorie** liée à la base de données
- **Géolocalisation** précise avec rayon de 5km
- **Filtres dynamiques** basés sur le contenu réel
- **Page de résultats** avec grille de cartes + carte interactive

### 🗺️ Carte Interactive
- **Intégration Leaflet.js** pour la cartographie
- **Marqueurs dynamiques** pour chaque établissement
- **Centrage automatique** sur la zone de recherche
- **Liens directs** vers les pages de détails

### 🏢 Gestion des Établissements
- **CRUD complet** : Création, Lecture, Mise à jour, Suppression
- **Formulaires intelligents** avec validation client et serveur
- **Génération automatique** de slugs SEO-friendly
- **Gestion des images** avec image principale
- **Catégories étendues** : bar, restaurant, cinéma, théâtre, escape game, bowling, etc.

### 🎯 Catégories d'Activités
- **Système d'enum Prisma** pour la cohérence des données
- **Catégories visuelles** avec icônes et compteurs
- **Filtrage dynamique** par ville et activité
- **Support multi-activités** pour les établissements complexes

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS 4 avec thème personnalisé
- **Base de données** : SQLite avec Prisma ORM
- **Cartographie** : Leaflet.js
- **Géolocalisation** : API Web Geolocation
- **Déploiement** : Prêt pour Vercel/Netlify

## 🎨 Design System

### Couleurs Thème
- **Orange** : #ff751f
- **Pink** : #ff1fa9  
- **Rouge** : #ff3a3a
- **Fond** : Blanc (#ffffff)
- **Texte** : Noir (#171717)

### Typographie
- **Police principale** : Inter (Google Fonts)
- **Hiérarchie** : H1 (6xl), H2 (3xl), H3 (xl)
- **Responsive** : Mobile-first avec breakpoints Tailwind

### Composants
- **Cartes** avec gradients et effets hover
- **Boutons** avec dégradés et transitions
- **Formulaires** avec focus states et validation
- **Navigation** sticky avec logo et liens

## 📱 Responsive Design

- **Mobile-first** approche
- **Grilles adaptatives** (1 → 2 → 4 → 6 colonnes)
- **Navigation mobile** optimisée
- **Cartes tactiles** pour mobile
- **Carte interactive** responsive

## 🗄️ Structure de la Base de Données

### Modèles Principaux
```prisma
model Establishment {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  address     String
  category    EstablishmentCategory
  status      EstablishmentStatus
  latitude    Float?
  longitude   Float?
  images      Image[]
  events      Event[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum EstablishmentCategory {
  bar, bowling, escape_game, market, nightclub
  restaurant, cinema, theater, concert, museum, other
}
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation
```bash
# Cloner le projet
git clone https://github.com/voicedhealer/envie2sortir.git
cd envie2sortir

# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Modifier DATABASE_URL dans .env

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

### Variables d'Environnement
```env
DATABASE_URL="file:./dev.db"
```

## 📁 Structure du Projet

```
src/
├── app/
│   ├── api/                    # Routes API
│   │   ├── categories/         # API catégories
│   │   ├── etablissements/     # CRUD établissements
│   │   └── dev/seed/          # Seeding BDD
│   ├── carte/                  # Page carte interactive
│   ├── etablissements/         # Gestion établissements
│   ├── recherche/              # Page résultats recherche
│   ├── sections/               # Composants landing page
│   │   └── HeroSearch.tsx     # Barre de recherche
│   ├── globals.css             # Styles globaux
│   ├── layout.tsx              # Layout principal
│   ├── navigation.tsx          # Navigation globale
│   └── page.tsx                # Page d'accueil
├── lib/
│   └── prisma.ts              # Client Prisma
└── prisma/
    ├── schema.prisma          # Schéma base de données
    └── migrations/            # Migrations BDD
```

## 🔧 API Endpoints

### Catégories
- `GET /api/categories` - Liste des catégories avec compteurs
- `GET /api/categories?q=ville` - Filtrage par ville

### Établissements
- `GET /api/etablissements` - Liste des établissements
- `POST /api/etablissements` - Créer un établissement
- `PUT /api/etablissements/[slug]` - Modifier un établissement
- `DELETE /api/etablissements/[slug]` - Supprimer un établissement

### Développement
- `POST /api/dev/seed` - Seeding de la base de données

## 🎯 Fonctionnalités à Venir

- [ ] Système d'authentification utilisateur
- [ ] Système de réservation en ligne
- [ ] Notifications push et email
- [ ] Système d'avis et notes
- [ ] Mode sombre/clair
- [ ] Application mobile PWA
- [ ] Intégration paiements
- [ ] Tableau de bord professionnel

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

- **Développeur** : Vivien Bernardot
- **Projet** : Envie2Sortir
- **GitHub** : [voicedhealer/envie2sortir](https://github.com/voicedhealer/envie2sortir)

---

**Envie2Sortir** - Découvrez toutes les sorties, près de chez vous ! 🎉

