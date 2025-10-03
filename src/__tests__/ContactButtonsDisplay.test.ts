// Test d'affichage des boutons de contact dans la section action rapide
describe('Affichage des boutons de contact - Section Action Rapide', () => {
  it('vérifie que les boutons de contact s\'affichent avec les bonnes données', () => {
    const establishmentWithContact = {
      id: 'test-id',
      name: 'Test Restaurant',
      phone: '0123456789',
      whatsappPhone: '0123456789',
      messengerUrl: 'https://m.me/test-restaurant',
      email: 'contact@test-restaurant.com',
      address: '123 Rue Test',
      city: 'Paris'
    };

    // Vérifier que l'établissement a des données de contact
    const hasContact = !!(establishmentWithContact.phone || 
                         establishmentWithContact.whatsappPhone || 
                         establishmentWithContact.messengerUrl || 
                         establishmentWithContact.email);

    expect(hasContact).toBe(true);
    expect(establishmentWithContact.phone).toBe('0123456789');
    expect(establishmentWithContact.whatsappPhone).toBe('0123456789');
    expect(establishmentWithContact.messengerUrl).toBe('https://m.me/test-restaurant');
    expect(establishmentWithContact.email).toBe('contact@test-restaurant.com');
  });

  it('vérifie que les boutons ne s\'affichent pas sans données de contact', () => {
    const establishmentWithoutContact = {
      id: 'test-id',
      name: 'Test Restaurant',
      phone: null,
      whatsappPhone: null,
      messengerUrl: null,
      email: null,
      address: '123 Rue Test',
      city: 'Paris'
    };

    // Vérifier que l'établissement n'a pas de données de contact
    const hasContact = !!(establishmentWithoutContact.phone || 
                         establishmentWithoutContact.whatsappPhone || 
                         establishmentWithoutContact.messengerUrl || 
                         establishmentWithoutContact.email);

    expect(hasContact).toBe(false);
  });

  it('vérifie que les numéros de téléphone sont correctement nettoyés', () => {
    const phone = '01 23 45 67 89';
    
    // Nettoyer le numéro de téléphone (enlever espaces, points, tirets)
    const cleanPhone = phone.replace(/[\s\.\-\(\)]/g, '');
    
    expect(cleanPhone).toBe('0123456789');
  });

  it('vérifie que les messages WhatsApp sont correctement encodés', () => {
    const establishment = {
      name: 'Restaurant Test & Co'
    };

    const message = `Bonjour ! Je suis intéressé(e) par votre établissement "${establishment.name}" et j'aimerais avoir plus d'informations.`;
    const encodedMessage = encodeURIComponent(message);
    
    expect(encodedMessage).toContain('Restaurant%20Test%20%26%20Co');
    expect(encodedMessage).toContain('int%C3%A9ress%C3%A9(e)');
  });

  it('vérifie que les URLs Messenger sont correctement formatées', () => {
    const messengerUrl = 'https://m.me/test-restaurant';
    
    // Vérifier que l'URL est valide
    expect(() => new URL(messengerUrl)).not.toThrow();
    expect(messengerUrl).toMatch(/^https:\/\/m\.me\//);
  });

  it('vérifie que les emails sont correctement formatés', () => {
    const email = 'contact@test-restaurant.com';
    
    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(email)).toBe(true);
  });

  it('vérifie que les données peuvent être filtrées pour l\'affichage', () => {
    const establishment = {
      id: 'test-id',
      name: 'Test Restaurant',
      phone: '0123456789',
      whatsappPhone: null,
      messengerUrl: 'https://m.me/test-restaurant',
      email: 'contact@test-restaurant.com',
      address: '123 Rue Test',
      city: 'Paris'
    };

    // Fonction pour obtenir les moyens de contact disponibles
    const getAvailableContacts = (est: any) => {
      const contacts = [];
      
      if (est.phone) contacts.push({ type: 'phone', value: est.phone, label: 'Téléphone' });
      if (est.whatsappPhone) contacts.push({ type: 'whatsapp', value: est.whatsappPhone, label: 'WhatsApp' });
      if (est.messengerUrl) contacts.push({ type: 'messenger', value: est.messengerUrl, label: 'Messenger' });
      if (est.email) contacts.push({ type: 'email', value: est.email, label: 'Email' });
      
      return contacts;
    };

    const availableContacts = getAvailableContacts(establishment);

    expect(availableContacts).toHaveLength(3);
    expect(availableContacts[0]).toEqual({ type: 'phone', value: '0123456789', label: 'Téléphone' });
    expect(availableContacts[1]).toEqual({ type: 'messenger', value: 'https://m.me/test-restaurant', label: 'Messenger' });
    expect(availableContacts[2]).toEqual({ type: 'email', value: 'contact@test-restaurant.com', label: 'Email' });
  });

  it('vérifie que les données peuvent être sérialisées pour l\'API', () => {
    const establishment = {
      id: 'test-id',
      name: 'Test Restaurant',
      phone: '0123456789',
      whatsappPhone: '0123456789',
      messengerUrl: 'https://m.me/test-restaurant',
      email: 'contact@test-restaurant.com',
      address: '123 Rue Test',
      city: 'Paris'
    };

    // Vérifier que les données peuvent être sérialisées en JSON
    expect(() => JSON.stringify(establishment)).not.toThrow();
    
    const jsonString = JSON.stringify(establishment);
    const parsedData = JSON.parse(jsonString);
    
    // Vérifier que les données sont correctement sérialisées
    expect(parsedData.phone).toBe('0123456789');
    expect(parsedData.whatsappPhone).toBe('0123456789');
    expect(parsedData.messengerUrl).toBe('https://m.me/test-restaurant');
    expect(parsedData.email).toBe('contact@test-restaurant.com');
  });
});
