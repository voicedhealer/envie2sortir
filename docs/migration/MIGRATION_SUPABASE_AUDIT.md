# Audit Complet - Migration vers Supabase

## 📋 Inventaire du Schéma de Données Actuel

### Modèles Principaux

#### 1. **User** (Utilisateurs simples)
- **Champs** : id (cuid), email (unique), passwordHash, firstName, lastName, name, phone, preferences (Json), newsletterOptIn, provider, providerId, avatar, isVerified, favoriteCity, role (UserRole), karmaPoints, gamificationBadges (Json)
- **Relations** : adminActions[], eventEngagements[], comments[], favorites[], likes[], adminConversations[], locationPreference
- **Rôles** : user, admin
- **Usage** : Clients finaux, peuvent commenter, favoriser, liker

#### 2. **Professional** (Propriétaires d'établissements)
- **Champs** : id (cuid), siret (unique), firstName, lastName, email (unique), passwordHash, phone, companyName, legalStatus, subscriptionPlan (FREE/PREMIUM), siretVerified, siretVerifiedAt
- **Relations** : establishment (1:1), updateRequests[], conversations[]
- **Usage** : Seuls autorisés à créer/gérer des établissements, vérification SIRET obligatoire

#### 3. **Establishment** (Établissements)
- **Champs** : id (cuid), name, slug (unique), description, address, city, postalCode, country, latitude, longitude, phone, whatsappPhone, messengerUrl, email, website, instagram, facebook, tiktok, youtube, activities (Json), specialites, motsClesRecherche, services (Json), ambiance (Json), paymentMethods (Json), horairesOuverture (Json), prixMoyen, capaciteMax, accessibilite, parking, terrasse, status (pending/approved/rejected), subscription (FREE/PREMIUM), ownerId (unique FK), rejectionReason, rejectedAt, viewsCount, clicksCount, avgRating, totalComments, imageUrl, priceMax, priceMin, informationsPratiques (Json), googlePlaceId, googleBusinessUrl, enriched, smartEnrichmentData (Json), googleRating, googleReviewCount, envieTags (Json), priceLevel, specialties (Json), atmosphere (Json), accessibility (Json), accessibilityDetails (Json), detailedServices (Json), clienteleInfo (Json), detailedPayments (Json), childrenServices (Json)
- **Relations** : owner (Professional 1:1), adminActions[], clickAnalytics[], dailyDeals[], dealEngagements[], menus[], tags[], events[], featuredPromotions[], images[], pricing[], tariffs[], comments[], favorites[], likes[]
- **Usage** : Établissements de sortie, validation admin requise

#### 4. **Event** (Événements)
- **Champs** : id (cuid), title, description, imageUrl, establishmentId (FK), startDate, endDate, price, priceUnit, maxCapacity, isRecurring, modality, createdAt, updatedAt
- **Relations** : establishment, engagements[]
- **Usage** : Événements organisés par les établissements

#### 5. **UserComment** (Commentaires/Avis)
- **Champs** : id (cuid), content, rating (Int), userId (FK), establishmentId (FK), establishmentReply, repliedAt, isReported, reportReason, reportedAt, createdAt, updatedAt
- **Relations** : user, establishment
- **Usage** : Avis utilisateurs sur établissements

#### 6. **UserFavorite** (Favoris)
- **Champs** : id (cuid), userId (FK), establishmentId (FK), createdAt
- **Relations** : user, establishment
- **Contraintes** : unique([userId, establishmentId])

#### 7. **UserLike** (Likes)
- **Champs** : id (cuid), userId (FK), establishmentId (FK), createdAt
- **Relations** : user, establishment
- **Contraintes** : unique([userId, establishmentId])

#### 8. **DailyDeal** (Bons plans)
- **Champs** : id (cuid), establishmentId (FK), title, description, originalPrice, discountedPrice, imageUrl, pdfUrl, dateDebut, dateFin, heureDebut, heureFin, isActive, isDismissed (Json), modality, isRecurring, recurrenceType, recurrenceDays (Json), recurrenceEndDate, shortTitle, shortDescription, promoUrl, createdAt, updatedAt
- **Relations** : establishment, engagements[]
- **Index** : [establishmentId, isActive, dateDebut, dateFin]

#### 9. **DealEngagement** (Engagements bons plans)
- **Champs** : id (cuid), dealId (FK), establishmentId (FK), type (liked/disliked), userIp, timestamp, createdAt, updatedAt
- **Relations** : deal, establishment
- **Contraintes** : unique([dealId, userIp])
- **Index** : [dealId, type], [establishmentId, type], [timestamp]

#### 10. **EventEngagement** (Engagements événements)
- **Champs** : id (cuid), eventId (FK), userId (FK), type, createdAt
- **Relations** : event, user
- **Contraintes** : unique([eventId, userId])

#### 11. **Image** (Images)
- **Champs** : id (cuid), url, altText, isPrimary, isCardImage, ordre, establishmentId (FK), createdAt
- **Relations** : establishment

#### 12. **EstablishmentMenu** (Menus PDF)
- **Champs** : id (cuid), name, description, fileUrl, fileName, fileSize, mimeType, order, isActive, establishmentId (FK), createdAt, updatedAt
- **Relations** : establishment

#### 13. **Conversation** (Conversations pro-admin)
- **Champs** : id (cuid), subject, status (open/closed), professionalId (FK), adminId (FK nullable), lastMessageAt, createdAt, updatedAt
- **Relations** : professional, admin (User), messages[]
- **Index** : [professionalId, status], [adminId, status], [lastMessageAt]

#### 14. **Message** (Messages)
- **Champs** : id (cuid), conversationId (FK), senderId, senderType (PROFESSIONAL/ADMIN), content, isRead, createdAt
- **Relations** : conversation
- **Index** : [conversationId, createdAt], [senderId, senderType]

#### 15. **AdminAction** (Actions admin)
- **Champs** : id (cuid), adminId (FK), establishmentId (FK), action (APPROVE/REJECT/PENDING/DELETE/RESTORE/UPDATE), reason, previousStatus, newStatus, details (Json), createdAt
- **Relations** : admin (User), establishment

#### 16. **ClickAnalytics** (Analytics clics)
- **Champs** : id (cuid), establishmentId (FK), elementType, elementId, elementName, action, sectionContext, userAgent, referrer, timestamp, country, city, hour, dayOfWeek, timeSlot
- **Relations** : establishment
- **Index** : [establishmentId, elementType], [timestamp], [hour, dayOfWeek]

#### 17. **SearchAnalytics** (Analytics recherches)
- **Champs** : id (cuid), searchTerm, resultCount, clickedEstablishmentId, clickedEstablishmentName, userAgent, referrer, timestamp, country, city, searchedCity
- **Index** : [searchTerm], [timestamp], [clickedEstablishmentId]

#### 18. **LocationPreference** (Préférences localisation)
- **Champs** : id (cuid), userId (unique FK), cityId, cityName, cityLatitude, cityLongitude, cityRegion, searchRadius, mode, useCurrentLocation, createdAt, updatedAt
- **Relations** : user (1:1)

#### 19. **Autres modèles**
- **EtablissementTag** : Tags pour établissements
- **FeaturedPromotion** : Promotions mises en avant
- **Pricing** : Tarifs établissements
- **Tariff** : Tarifs établissements
- **ProfessionalUpdateRequest** : Demandes de modification pro
- **EstablishmentLearningPattern** : Patterns d'apprentissage ML

### Enums

- **UserRole** : user, admin
- **EstablishmentStatus** : pending, approved, rejected
- **SubscriptionPlan** : FREE, PREMIUM
- **AdminActionType** : APPROVE, REJECT, PENDING, DELETE, RESTORE, UPDATE
- **ConversationStatus** : open, closed
- **SenderType** : PROFESSIONAL, ADMIN

## 🔧 Dépendances Backend Actuelles

### Packages Principaux
- **@prisma/client** : ^6.14.0 - ORM pour SQLite
- **next-auth** : ^4.24.11 - Authentification
- **bcryptjs** : ^3.0.2 - Hashage mots de passe
- **zod** : ^4.1.12 - Validation schémas

### Points Critiques de Logique Métier

1. **Authentification Duale** : User et Professional séparés, même email possible
2. **Vérification SIRET** : Obligatoire pour Professional, vérification externe
3. **Validation Admin** : Establishment nécessite approbation admin
4. **Système d'abonnement** : FREE/PREMIUM avec restrictions (images, etc.)
5. **Enrichissement Google Places** : Enrichissement automatique des établissements
6. **Gamification** : Karma points, badges, engagements
7. **Analytics** : Tracking clics, recherches, engagements
8. **Messagerie** : Conversations bidirectionnelles pro-admin
9. **Upload fichiers** : Images optimisées, menus PDF, médias bons plans

## 📁 Stockage Fichiers Actuel

- **Local** : `/public/uploads` pour images publiques
- **Local** : `/uploads` pour fichiers temporaires
- **Optimisation** : Génération de variantes (hero, thumbnail, etc.)
- **Types** : Images établissements, images événements, PDF menus, médias bons plans

## 🔐 Sécurité Actuelle

- **NextAuth** : Sessions avec JWT
- **CSRF** : Protection middleware
- **Rate Limiting** : Via middleware sécurité
- **Validation** : Zod schemas
- **Sanitization** : Input sanitization
- **Permissions** : Vérification manuelle dans chaque route API

## 📊 Statistiques

- **Modèles** : 19+ modèles Prisma
- **API Routes** : 80+ endpoints
- **Relations** : Complexes avec cascades
- **Index** : Multiples index sur tables critiques
- **JSON Fields** : Nombreux champs JSON pour flexibilité

