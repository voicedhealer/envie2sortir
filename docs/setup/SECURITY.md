# 🔒 Politique de Sécurité

## Vue d'ensemble

Ce document décrit les mesures de sécurité mises en place pour protéger l'application Envie2Sortir contre les attaques courantes et assurer la protection des données utilisateurs.

## 🛡️ Mesures de Protection

### Rate Limiting

Protection contre les attaques par déni de service (DDoS) et l'abus d'API :

- **APIs générales** : 100 requêtes / 15 minutes par IP
- **Recherche** : 20 requêtes / minute par IP
- **Upload** : 5 fichiers / minute par IP
- **Authentification** : 10 tentatives / 15 minutes par IP
- **Admin** : 5 tentatives / 15 minutes par IP

### Protection CSRF (Cross-Site Request Forgery)

- Tokens CSRF générés pour chaque session utilisateur
- Validation obligatoire sur tous les formulaires sensibles
- Nettoyage automatique des tokens expirés (1 heure)
- Protection contre les attaques cross-site

### Sanitisation des Données

#### Input Sanitization
- Suppression des balises HTML dangereuses (`<`, `>`)
- Nettoyage des event handlers (`onclick`, `onload`, etc.)
- Suppression des protocoles dangereux (`javascript:`, `data:`, `vbscript:`)
- Protection contre les attaques XSS

#### HTML Sanitization
- Suppression des scripts (`<script>`)
- Suppression des iframes (`<iframe>`)
- Suppression des objets et embeds
- Nettoyage des attributs d'événements

#### Validation Spécialisée
- **Email** : Nettoyage et normalisation des adresses email
- **Téléphone** : Conservation uniquement des caractères numériques et `+`

### Validation des Fichiers

#### Images
- **Types autorisés** : JPEG, PNG, WebP
- **Extensions** : .jpg, .jpeg, .png, .webp
- **Taille maximale** : 5 MB

#### Documents
- **Types autorisés** : PDF, TXT
- **Extensions** : .pdf, .txt
- **Taille maximale** : 10 MB

#### Contrôles de Sécurité
- Vérification du type MIME
- Validation de l'extension
- Contrôle de la taille
- Rejet des fichiers suspects

## 🔧 Configuration

### Variables d'Environnement

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CSRF
CSRF_TOKEN_EXPIRY=3600000    # 1 heure

# File Upload
MAX_FILE_SIZE_IMAGE=5242880  # 5MB
MAX_FILE_SIZE_DOCUMENT=10485760  # 10MB
```

### Headers de Sécurité

L'application utilise les headers de sécurité suivants :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🚨 Gestion des Incidents

### Détection d'Attaques

- Surveillance des tentatives de rate limiting
- Monitoring des uploads suspects
- Détection des tentatives d'injection

### Réponse aux Incidents

1. **Isolation** : Blocage temporaire de l'IP
2. **Notification** : Alertes automatiques
3. **Analyse** : Investigation des logs
4. **Correction** : Mise à jour des règles de sécurité

## 📊 Monitoring

### Métriques Surveillées

- Nombre de requêtes par minute
- Taux d'échec des authentifications
- Volume des uploads
- Tentatives de CSRF
- Erreurs de validation

### Alertes

- Seuil de rate limiting dépassé
- Tentatives d'upload suspectes
- Échecs d'authentification répétés
- Erreurs de validation critiques

## 🔄 Mise à Jour

### Processus de Mise à Jour

1. **Test** : Validation en environnement de test
2. **Déploiement** : Mise en production progressive
3. **Monitoring** : Surveillance post-déploiement
4. **Rollback** : Retour en arrière si nécessaire

### Maintenance

- Nettoyage automatique des tokens CSRF
- Rotation des clés de sécurité
- Mise à jour des règles de validation
- Audit de sécurité régulier

## 📞 Contact

Pour toute question relative à la sécurité :

- **Email** : security@envie2sortir.fr
- **Urgences** : +33 1 23 45 67 89
- **Signalement** : security-report@envie2sortir.fr

---

*Dernière mise à jour : Janvier 2025*
