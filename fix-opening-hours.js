const fs = require('fs');
const path = require('path');

// Lire le fichier actuel
const filePath = path.join(__dirname, 'src/components/forms/OpeningHoursInput.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Modifier la fonction removeSlot pour permettre la suppression du dernier créneau
const oldRemoveSlot = `  // Fonction pour supprimer un créneau
  const removeSlot = (dayKey: keyof HoursData, slotIndex: number) => {
    const currentDay = value[dayKey];
    if (!currentDay?.slots || currentDay.slots.length <= 1) return;
    
    const updatedSlots = currentDay.slots.filter((_, index) => index !== slotIndex);
    updateDay(dayKey, { slots: updatedSlots });
  };`;

const newRemoveSlot = `  // Fonction pour supprimer un créneau
  const removeSlot = (dayKey: keyof HoursData, slotIndex: number) => {
    const currentDay = value[dayKey];
    if (!currentDay?.slots || currentDay.slots.length === 0) return;
    
    const updatedSlots = currentDay.slots.filter((_, index) => index !== slotIndex);
    
    // Si c'était le dernier créneau, fermer le jour
    if (updatedSlots.length === 0) {
      updateDay(dayKey, { isOpen: false, slots: [] });
    } else {
      updateDay(dayKey, { slots: updatedSlots });
    }
  };`;

content = content.replace(oldRemoveSlot, newRemoveSlot);

// 2. Modifier la condition d'affichage des boutons Supprimer
const oldButtonCondition = `                      {/* Bouton supprimer - seulement si > 1 créneau */}
                      {dayData.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(key, slotIndex)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}`;

const newButtonCondition = `                      {/* Bouton supprimer - toujours visible */}
                      <button
                        type="button"
                        onClick={() => removeSlot(key, slotIndex)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Supprimer
                      </button>`;

content = content.replace(oldButtonCondition, newButtonCondition);

// Écrire le fichier modifié
fs.writeFileSync(filePath, content);

console.log('✅ Fichier OpeningHoursInput.tsx modifié avec succès !');
console.log('📝 Modifications apportées :');
console.log('   1. Fonction removeSlot : permet la suppression du dernier créneau');
console.log('   2. Boutons Supprimer : toujours visibles pour tous les créneaux');
console.log('   3. Logique : ferme automatiquement le jour si plus de créneaux');

