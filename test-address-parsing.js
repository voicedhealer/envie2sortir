// Test du parsing d'adresse
function parseAddressFromGoogle(googleAddress) {
  console.log('🏠 Parsing adresse Google:', googleAddress);
  
  // Format typique: "44 Rue Monge, 21000 Dijon, France"
  const parts = googleAddress.split(',').map(part => part.trim());
  
  let street = '';
  let postalCode = '';
  let city = '';
  
  if (parts.length >= 3) {
    // Premier élément = rue
    street = parts[0];
    
    // Deuxième élément = code postal + ville
    const cityPart = parts[1];
    const postalMatch = cityPart.match(/(\d{5})\s+(.+)/);
    if (postalMatch) {
      postalCode = postalMatch[1];
      city = postalMatch[2];
    } else {
      city = cityPart;
    }
  } else if (parts.length === 2) {
    street = parts[0];
    city = parts[1];
  } else {
    street = googleAddress;
  }
  
  const result = { street, postalCode, city };
  console.log('✅ Adresse parsée:', result);
  return result;
}

// Test avec l'adresse du Maharaja
const testAddress = "44 Rue Monge, 21000 Dijon, France";
console.log('🧪 Test parsing adresse:');
parseAddressFromGoogle(testAddress);

// Test avec d'autres formats
console.log('\n🧪 Test autres formats:');
parseAddressFromGoogle("123 Avenue de la République, 75011 Paris, France");
parseAddressFromGoogle("Place de la Comédie, Montpellier, France");
parseAddressFromGoogle("10 Rue Simple");
