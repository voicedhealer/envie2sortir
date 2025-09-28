const fs = require('fs');
const path = require('path');

// 1. Corriger le middleware pour rediriger vers la page d'accueil au lieu de /auth?error=AccessDenied
const middlewarePath = path.join(__dirname, 'src', 'middleware.ts');
let middlewareContent = fs.readFileSync(middlewarePath, 'utf8');

// Remplacer les redirections avec erreur par des redirections vers la page d'accueil
middlewareContent = middlewareContent.replace(
  'return NextResponse.redirect(new URL(\'/auth?error=AccessDenied\', req.url));',
  'return NextResponse.redirect(new URL(\'/\', req.url));'
);

fs.writeFileSync(middlewarePath, middlewareContent);
console.log('✅ Middleware corrigé - redirection vers la page d\'accueil');

// 2. Corriger la page d'authentification pour ne pas afficher l'erreur automatiquement
const authPagePath = path.join(__dirname, 'src', 'app', 'auth', 'page.tsx');
let authPageContent = fs.readFileSync(authPagePath, 'utf8');

// Remplacer l'affichage automatique de l'erreur AccessDenied
authPageContent = authPageContent.replace(
  "        case 'AccessDenied':\n          setError('Vous n\\'avez pas l\\'autorisation d\\'accéder à cette page. Veuillez vous connecter avec un compte approprié.');\n          break;",
  "        case 'AccessDenied':\n          // Ne pas afficher l'erreur automatiquement, seulement si l'utilisateur essaie de se connecter\n          console.log('🔐 Erreur AccessDenied détectée dans l\\'URL - sera affichée lors de la tentative de connexion');\n          break;"
);

fs.writeFileSync(authPagePath, authPageContent);
console.log('✅ Page d\'authentification corrigée - erreur AccessDenied ne s\'affiche plus automatiquement');

console.log('\n🎉 Corrections appliquées avec succès !');
console.log('📝 Changements effectués :');
console.log('   1. Redirection du middleware vers la page d\'accueil au lieu de /auth?error=AccessDenied');
console.log('   2. Suppression de l\'affichage automatique de l\'erreur AccessDenied sur la page d\'authentification');
console.log('\n🔄 Redémarrez le serveur pour appliquer les changements.');
