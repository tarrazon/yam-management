# Corrections appliquées - Espace Acquéreur

## Problèmes corrigés

### 1. ✅ Page FAQ blanche
**Problème** : Le lien dans le menu utilisait `createPageUrl("FAQManagement")` qui générait `/FAQManagement` au lieu de `/faq-management`.

**Correction** : Changé dans `Layout.jsx` ligne 124 :
```javascript
// AVANT
url: createPageUrl("FAQManagement"),

// APRÈS
url: "/faq-management",
```

### 2. ✅ Acquéreur voit le Dashboard CRM
**Problèmes multiples** :

#### A. Menu acquéreur manquant
**Correction dans `Layout.jsx`** :
```javascript
// Ajouté avant partenaireItems
const acquereurItems = [
  {
    title: "Mon Espace Client",
    url: "/acquereur-dashboard",
    icon: LayoutDashboard,
    roles: ['acquereur'],
  },
];

// Modifié la fusion des menus
const allItems = [...adminItems, ...partenaireItems, ...acquereurItems];
```

#### B. Redirection incorrecte dans ProtectedRoute
**Correction dans `ProtectedRoute.jsx`** :
```javascript
// AVANT
const redirectTo = profile.role_custom === 'partenaire' ? '/partenairesdashboard' : '/dashboardcrm';

// APRÈS
let redirectTo = '/dashboardcrm';
if (profile.role_custom === 'partenaire') {
  redirectTo = '/partenairesdashboard';
} else if (profile.role_custom === 'acquereur') {
  redirectTo = '/acquereur-dashboard';
}
```

## Comment tester

### Test 1 : Page FAQ
1. Connectez-vous en tant qu'admin
2. Cliquez sur "Gestion FAQ" dans le menu
3. ✅ La page doit s'afficher (pas de page blanche)
4. Créez une première question test

### Test 2 : Dashboard Acquéreur
1. Déconnectez-vous
2. Connectez-vous avec le compte acquéreur
3. ✅ Vous devez voir "Mon Espace Client" dans le menu (pas les menus admin)
4. ✅ Vous devez être redirigé vers `/acquereur-dashboard`
5. ✅ Le dashboard avec les 6 onglets doit s'afficher

### Test 3 : Vérifier les données acquéreur

Si le dashboard acquéreur s'affiche mais est vide :

#### Vérifier que l'acquéreur est lié à un user
```sql
-- Dans la console Supabase SQL
SELECT a.*, p.email, p.role_custom
FROM acquereurs a
LEFT JOIN profiles p ON p.id = a.user_id
WHERE p.role_custom = 'acquereur';
```

**Doit retourner** : L'acquéreur avec son user_id rempli

#### Vérifier qu'un lot est assigné à l'acquéreur
```sql
SELECT * FROM lots_lmnp WHERE acquereur_id = 'ID_DE_VOTRE_ACQUEREUR';
```

**Doit retourner** : Au moins un lot

### Si le lot n'est pas assigné :
1. En tant qu'admin, aller dans "Lots LMNP"
2. Éditer un lot
3. Dans le champ "Acquéreur", sélectionner l'acquéreur
4. Sauvegarder

### Si les appels de fond ne s'affichent pas :
1. En tant qu'admin, aller dans "Acquéreurs"
2. Cliquer sur l'acquéreur
3. Scroller jusqu'à la section "Appels de fond de travaux"
4. Cliquer sur "Créer les étapes"
5. ✅ Les 10 étapes par défaut sont créées

## Vérifications supplémentaires

### Console navigateur
Ouvrir la console (F12) et vérifier :
- Pas d'erreurs rouges
- Pas de 404 sur les appels API

### Données dans Supabase

#### Tables à vérifier :
1. `profiles` : L'acquéreur a bien `role_custom = 'acquereur'`
2. `acquereurs` : Le `user_id` est bien rempli
3. `lots_lmnp` : Le lot a bien `acquereur_id` rempli
4. `appels_de_fond` : Les étapes sont créées pour le bon `acquereur_id` et `lot_id`

## Structure menu par rôle

### Admin
- Tableau de bord CRM
- Résidences
- Lots LMNP
- Vendeurs
- Acquéreurs
- Partenaires
- Notaires
- Statistiques
- Gestion utilisateurs
- **Gestion FAQ** ← Nouveau
- Etc.

### Acquéreur
- **Mon Espace Client** ← Uniquement ce menu
  - Tableau de bord
  - Documents
  - Messages
  - Appels de fond
  - Galerie
  - FAQ

### Partenaire
- Mon Espace
- Résidences
- Lots disponibles
- Mes Acquéreurs
- Suivi de dossier
- Suivi des options

## Workflow complet Acquéreur

1. **Admin crée l'acquéreur** dans "Acquéreurs"
2. **Admin crée le compte** dans "Gestion utilisateurs"
   - Sélectionne le rôle "Acquéreur"
   - Sélectionne l'acquéreur dans la liste
   - Le `user_id` est automatiquement lié
3. **Admin assigne un lot** dans "Lots LMNP"
   - Éditer le lot
   - Sélectionner l'acquéreur
4. **Admin crée les appels de fond**
   - Aller dans le profil de l'acquéreur
   - Cliquer "Créer les étapes"
5. **Acquéreur se connecte**
   - Voit son dashboard
   - Consulte l'avancement
   - Envoie des messages
6. **Admin valide les étapes**
   - Une par une
   - Avec notes optionnelles
   - L'acquéreur voit les validations en temps réel

## En cas de problème persistant

### 1. Vider le cache du navigateur
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Vérifier les variables d'environnement
Le fichier `.env` doit contenir :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 3. Reconstruire le projet
```bash
npm run build
```

### 4. Consulter les logs Supabase
Dans Supabase Dashboard → Logs → vérifier les erreurs

## Fichiers modifiés

- ✅ `src/pages/Layout.jsx` - Menu acquéreur + lien FAQ
- ✅ `src/components/ProtectedRoute.jsx` - Redirection acquéreur
- Tous les autres fichiers créés précédemment sont OK

## État actuel

✅ Base de données : OK
✅ Services API : OK
✅ Dashboard Acquéreur : OK
✅ Gestion FAQ : OK
✅ Appels de fond : OK
✅ Routing : OK
✅ Navigation : OK
✅ Build : OK

**Tout devrait fonctionner maintenant !** 🎉
