const fs = require('fs');
const path = require('path');

// Améliorer la gestion d'erreur dans ImagesManager.tsx
const imagesManagerPath = path.join(__dirname, 'src', 'app', 'dashboard', 'ImagesManager.tsx');
let imagesManagerContent = fs.readFileSync(imagesManagerPath, 'utf8');

console.log('🔧 Amélioration de la gestion d\'erreur pour updatePrimaryImage...\n');

// Remplacer la gestion d'erreur actuelle par une version plus robuste
const oldErrorHandling = `      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('❌ Erreur parsing JSON:', parseError);
          errorData = { error: \`Erreur \${response.status}: \${response.statusText}\` };
        }
        
        console.error('❌ Erreur API:', errorData);
        
        if (response.status === 403) {
          setError('Vous n\\'avez pas les permissions pour modifier cet établissement. Assurez-vous d\\'être connecté avec le bon compte.');
        } else {
          setError(errorData.error || 'Erreur lors de la mise à jour');
        }
        
        throw new Error(\`Erreur API: \${JSON.stringify(errorData)}\`);
      }`;

const newErrorHandling = `      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          console.log('📝 Réponse brute:', responseText);
          
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { error: \`Erreur \${response.status}: \${response.statusText}\` };
          }
        } catch (parseError) {
          console.error('❌ Erreur parsing JSON:', parseError);
          errorData = { error: \`Erreur \${response.status}: \${response.statusText}\` };
        }
        
        console.error('❌ Erreur API détaillée:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url
        });
        
        let errorMessage = 'Erreur lors de la mise à jour';
        
        if (response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (response.status === 403) {
          errorMessage = 'Vous n\\'avez pas les permissions pour modifier cet établissement.';
        } else if (response.status === 404) {
          errorMessage = 'Établissement non trouvé.';
        } else if (response.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer.';
        } else if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData && typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          errorMessage = \`Erreur: \${JSON.stringify(errorData)}\`;
        }
        
        setError(errorMessage);
        throw new Error(\`Erreur API \${response.status}: \${errorMessage}\`);
      }`;

imagesManagerContent = imagesManagerContent.replace(oldErrorHandling, newErrorHandling);

fs.writeFileSync(imagesManagerPath, imagesManagerContent);

console.log('✅ Gestion d\'erreur améliorée !');
console.log('📝 Changements effectués :');
console.log('   - Meilleure gestion des réponses vides');
console.log('   - Logs plus détaillés pour le débogage');
console.log('   - Messages d\'erreur plus spécifiques selon le code de statut');
console.log('   - Gestion des cas où errorData est vide ou malformé');
console.log('\n🔄 Redémarrez le serveur pour appliquer les changements.');
