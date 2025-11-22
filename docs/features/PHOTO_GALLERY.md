# Galerie d'Images Moderne

## Description

Cette fonctionnalité ajoute une galerie d'images interactive avec un effet visuel moderne inspiré par les designs web contemporains. Lorsque l'utilisateur survole une image, elle s'agrandit et passe de niveaux de gris à la couleur, créant un effet visuellement attrayant.

## Composants

### 1. PhotoGallery (`src/components/PhotoGallery.tsx`)

Composant principal qui affiche la galerie d'images avec l'effet de focus.

**Props :**
- `images`: `string[]` - Liste des URLs des images à afficher
- `establishmentName`: `string` - Nom de l'établissement pour les alt texts

**Fonctionnalités :**
- Affiche jusqu'à 5 images côte à côte
- Effet grayscale par défaut
- Au survol : l'image s'agrandit (flex: 3) et devient en couleur
- Overlay avec numéro d'image apparaît au survol
- Responsive mobile : les images s'empilent verticalement

### 2. EstablishmentHeroWithGallery (`src/components/EstablishmentHeroWithGallery.tsx`)

Version alternative du composant `EstablishmentHero` qui intègre la nouvelle galerie d'images.

**Fonctionnalités :**
- Utilise `PhotoGallery` si l'établissement a 2 images ou plus
- Affichage classique (carrousel) si moins de 2 images
- Conserve toutes les fonctionnalités de l'ancien hero (favoris, partage, etc.)

## Styles CSS

Les styles sont définis dans `src/app/globals.css` :

### Classes principales

#### `.photo-gallery-container`
- Container flex pour la galerie
- Hauteur adaptative : `80vh` avec limites min/max
- Gap de 8px entre les images

#### `.gallery_item`
- Élément individuel de la galerie
- `flex: 1` par défaut
- `filter: grayscale(1)` pour l'effet noir et blanc
- Transition fluide de 0.8s
- Border-radius de 20px

#### `.gallery_item:hover`
- `flex: 3` pour agrandir l'image
- `filter: grayscale(0)` pour afficher les couleurs

#### `.gallery_item_overlay`
- Overlay dégradé en bas de l'image
- Opacité 0 par défaut, 1 au survol
- Affiche le numéro d'image

### Responsive

Sur mobile (< 768px) :
- Les images s'empilent verticalement
- Hauteur fixe de 200px par image
- Toutes les images en couleur (pas de grayscale)
- Pas d'effet d'agrandissement au survol

## Utilisation

### Option 1 : Utiliser le nouveau composant

Remplacez `EstablishmentHero` par `EstablishmentHeroWithGallery` dans vos pages :

\`\`\`tsx
import EstablishmentHeroWithGallery from '@/components/EstablishmentHeroWithGallery';

// Dans votre composant
<EstablishmentHeroWithGallery
  establishment={establishment}
  onFavorite={handleFavorite}
  onShare={handleShare}
/>
\`\`\`

### Option 2 : Utiliser PhotoGallery directement

Pour une intégration personnalisée :

\`\`\`tsx
import PhotoGallery from '@/components/PhotoGallery';

// Dans votre composant
<PhotoGallery 
  images={establishment.images} 
  establishmentName={establishment.name}
/>
\`\`\`

## Exemple visuel

L'effet est inspiré par le design moderne où :
1. Les images sont disposées côte à côte
2. L'image au centre est mise en évidence en couleur
3. Les images latérales sont en niveaux de gris
4. Au survol, l'image s'agrandit et devient colorée
5. Transition fluide de 0.8s

## Personnalisation

### Modifier la durée de transition

Dans `globals.css`, ligne 763 :
\`\`\`css
.gallery_item {
  transition: 0.8s ease-in-out; /* Modifier ici */
}
\`\`\`

### Modifier le facteur d'agrandissement

Dans `globals.css`, ligne 768 :
\`\`\`css
.gallery_item:hover {
  flex: 3; /* Modifier ici (1 = taille normale, 3 = 3x plus grand) */
}
\`\`\`

### Modifier le nombre maximum d'images

Dans `PhotoGallery.tsx`, ligne 20 :
\`\`\`tsx
const galleryImages = images.slice(0, 5); // Modifier le 5
\`\`\`

## Performance

- Utilise Next.js Image pour l'optimisation automatique
- Lazy loading pour les images non prioritaires
- Priority sur la première image uniquement
- Object-fit: cover pour un rendu optimal

## Accessibilité

- Alt texts descriptifs pour chaque image
- Curseur pointer pour indiquer l'interactivité
- Contraste suffisant pour les overlays

## Compatibilité

- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Support mobile complet
- Dégradation gracieuse sur navigateurs anciens

## Tests

Pour tester la fonctionnalité :
1. Assurez-vous qu'un établissement a au moins 2 images
2. Visitez la page détail de l'établissement
3. Survolez les images pour voir l'effet
4. Testez sur mobile pour vérifier le responsive

## Notes techniques

- Les styles utilisent `filter: grayscale()` pour l'effet noir et blanc
- L'agrandissement utilise `flex` pour une animation fluide
- L'overlay utilise `opacity` pour une transition douce
- Responsive géré par media queries

## Améliorations futures

- Ajouter un mode plein écran
- Permettre le swipe sur mobile
- Ajouter des animations de chargement
- Support du zoom sur les images

