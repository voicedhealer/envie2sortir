// Fonctions de toast visibles pour l'utilisateur
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    // Afficher une notification visible à l'utilisateur
    showNotification(message, 'success');
  },
  error: (message: string) => {
    console.log('❌ Error:', message);
    // Afficher une notification visible à l'utilisateur
    showNotification(message, 'error');
  },
  loading: (message: string) => {
    console.log('⏳ Loading:', message);
    showNotification(message, 'loading');
  },
  dismiss: () => {
    console.log('🚫 Dismiss toast');
    hideNotification();
  }
};

// Fonction pour afficher des notifications visibles
function showNotification(message: string, type: 'success' | 'error' | 'loading') {
  // Supprimer toute notification existante avant d'en créer une nouvelle
  hideNotification();
  
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.id = 'toast-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    cursor: pointer;
  `;
  
  // Icône selon le type
  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : '⏳';
  notification.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span>${icon} ${message}</span>
      <button onclick="window.hideToastNotification()" style="
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Exposer la fonction de fermeture globalement
  (window as any).hideToastNotification = hideNotification;
  
  // Animation d'entrée
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto-dismiss après 5 secondes (sauf pour loading)
  if (type !== 'loading') {
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }
}

function hideNotification() {
  const notification = document.getElementById('toast-notification');
  if (notification) {
    // Animation de sortie
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    // Supprimer l'élément après l'animation
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}
