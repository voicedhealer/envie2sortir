// Fonctions factices pour éviter les erreurs d'import de react-hot-toast
export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
  },
  error: (message: string) => {
    console.log('❌ Error:', message);
  },
  loading: (message: string) => {
    console.log('⏳ Loading:', message);
  },
  dismiss: () => {
    console.log('🚫 Dismiss toast');
  }
};
