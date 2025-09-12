# 🧪 Guide de Test - URLs Google Maps

## ✅ URLs qui fonctionnent maintenant

### 1. URL avec Place ID complet
```
https://www.google.com/maps/place/Le+Comptoir+du+7ème/@48.8566,2.3522,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!8m2!3d48.8566!4d2.3522!16s%2Fg%2F11c0w8wr9r
```

### 2. URL avec coordonnées seulement
```
https://www.google.com/maps/place/Restaurant+Test/@48.8566,2.3522,17z
```

### 3. URL Google My Business
```
https://maps.google.com/maps/place/Restaurant+Test/@48.8566,2.3522,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e1f06e2b70f:0x40b82c3688c9460!8m2!3d48.8566!4d2.3522!16s%2Fg%2F11c0w8wr9r
```

## 🔧 Comment tester

1. **Allez sur** : `http://localhost:3001/demo-enrichment`
2. **Collez une URL** dans le champ "URL Google My Business"
3. **Cliquez sur** "Enrichir automatiquement"
4. **Vérifiez** que les données sont récupérées

## 🚨 URLs qui ne fonctionnent pas

- URLs qui ne sont pas Google Maps
- URLs sans coordonnées ni Place ID
- URLs malformées

## 📝 Notes

- Le système accepte maintenant les coordonnées comme fallback
- Les erreurs sont plus informatives
- L'API Nearby Search est utilisée pour les coordonnées
