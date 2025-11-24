# Système de Messagerie Pro-Admin

## Vue d'ensemble

Système de messagerie bidirectionnel type tickets/support permettant la communication entre les professionnels et les administrateurs.

## Architecture

### Base de données

**Modèles Prisma** :
- `Conversation` : Contient les conversations avec sujet, statut (open/closed), et références au professionnel et admin
- `Message` : Messages individuels avec contenu, type d'expéditeur (PROFESSIONAL/ADMIN) et statut de lecture

### Routes API

Toutes les routes sont dans `/src/app/api/messaging/` :

1. **POST /api/messaging/conversations** - Créer une nouvelle conversation
   - Pro : crée un ticket support
   - Admin : contacte un professionnel spécifique (nécessite `professionalId`)

2. **GET /api/messaging/conversations** - Lister les conversations
   - Filtres disponibles : `status` (open/closed), `unreadOnly` (true/false)
   - Pro : voit uniquement ses conversations
   - Admin : voit toutes les conversations

3. **GET /api/messaging/conversations/[id]** - Détails d'une conversation avec tous les messages

4. **POST /api/messaging/conversations/[id]/messages** - Envoyer un message dans une conversation

5. **PATCH /api/messaging/conversations/[id]/read** - Marquer les messages comme lus

6. **PATCH /api/messaging/conversations/[id]/status** - Changer le statut (open/closed)

7. **GET /api/messaging/unread-count** - Compter les messages non lus (pour le badge)

### Composants

Dans `/src/components/messaging/` :

- **MessageBadge.tsx** : Badge de notification avec polling automatique (30s)
- **ConversationList.tsx** : Liste des conversations avec filtres et preview
- **ConversationDetail.tsx** : Thread de messages avec formulaire d'envoi
- **MessageForm.tsx** : Formulaire d'envoi de message avec validation
- **NewConversationModal.tsx** : Modal pour créer une nouvelle conversation

### Pages

- `/dashboard/messagerie` : Interface pour les professionnels
- `/admin/messagerie` : Interface pour les administrateurs

## Utilisation

### Côté Professionnel

1. Accéder à l'onglet "Messagerie" dans le dashboard
2. Créer une nouvelle conversation avec le bouton "Nouvelle conversation"
3. Saisir le sujet et le message initial
4. Consulter les réponses et continuer la conversation

### Côté Admin

1. Accéder à "Messagerie" dans la navigation admin
2. Voir toutes les conversations des professionnels
3. Répondre aux tickets ou créer une conversation avec un pro spécifique
4. Fermer les conversations résolues

## Fonctionnalités

### Badges de notification

- Badge rouge avec compteur de messages non lus
- Mise à jour automatique toutes les 30 secondes
- Affiché dans la navigation (dashboard pro et admin)

### Gestion des conversations

- Statut open/closed
- Filtrage par statut
- Indicateur de messages non lus
- Marquage automatique comme lu lors de la lecture

### Sécurité

- Vérification des permissions (pro ne voit que ses conversations)
- Admin a accès à toutes les conversations
- Validation des données côté serveur

## Notes techniques

### Dépendances

- `date-fns` : Formatage des dates relatives
- `lucide-react` : Icônes
- Prisma : ORM pour la base de données

### Polling

Le système utilise un polling simple (30s) pour les notifications. Pour une application à fort trafic, considérer :
- WebSocket pour les mises à jour en temps réel
- Server-Sent Events (SSE) pour push notifications
- Redis pour la gestion du cache et des compteurs

### Amélioration futures possibles

1. Notifications email lors de nouveaux messages
2. Pièces jointes dans les messages
3. Recherche dans les conversations
4. Catégorisation des tickets
5. Système de priorité
6. Templates de réponses pour l'admin
7. Statistiques (temps de réponse moyen, etc.)

