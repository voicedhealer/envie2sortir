const Filter = require('bad-words');
const filter = new Filter();

// Ajouter nos mots personnalisés
const frenchBadWords = [
  'merde', 'putain', 'connard', 'salope', 'enculé', 'foutre', 'bordel',
  'con', 'putes', 'pute', 'connasse', 'salopard', 'enfoiré',
  'chier', 'chiant', 'baiser', 'bite', 'cul', 'zizi', 'couilles', 'vagin',
  'salop', 'fdp', 'connas', 'pd', 'enculé', 'tapette',
  'sale', 'dégueulasse', 'pourri', 'nul', 'merdique', 'pourriture'
];
filter.addWords(...frenchBadWords);

const internationalBadWords = [
  'cabron', 'cabrón', 'puta', 'hijo de puta', 'mierda', 'joder', 'puto', 'hijoputa', 'mamada',
  'merda', 'cazzo', 'bastardo', 'puttana', 'fottere', 'fanculo', 'stronzo',
  'scheisse', 'scheiße', 'arschloch', 'ficken', 'scheiß', 'wichser',
  'porra', 'merda', 'puta', 'foder', 'caralho',
  'kut', 'fuck', 'kanker', 'flikker',
  'f*ck', 'f**k', 'sh*t', 'cr*p', 'p*ss', 'a*s',
  'fuck', 'fucking', 'bullshit', 'damn', 'shit', 'asshole', 'bitch', 'bastard'
];
filter.addWords(...internationalBadWords);

console.log('🧪 Test du filtre de mots interdits\n');
const testWords = [
  'fuck',
  'fuck you',
  'merde',
  'putain',
  'mierda',
  'scheisse',
  'cazzo',
  'Fuck you',
  'F*CK',
  'Bon restaurant',
  'Super endroit'
];

testWords.forEach(word => {
  const isProfane = filter.isProfane(word);
  console.log(`${isProfane ? '❌ BLOQUÉ' : '✅ OK'}: "${word}"`);
});

console.log('\n✅ Tests terminés');
