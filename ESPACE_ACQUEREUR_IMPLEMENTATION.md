# Implémentation Espace Client Acquéreur

## ✅ Ce qui a été fait

### 1. Base de données (Migration appliquée)
- ✅ Table `appels_de_fond` - Système d'appel de fonds avec validation admin
- ✅ Table `faq` - Questions fréquentes pour tous les clients
- ✅ Table `galerie_photos` - Photos du logement pour l'acquéreur
- ✅ Table `messages_admin` - Messagerie entre admin et acquéreur
- ✅ Colonne `user_id` ajoutée à `acquereurs` pour lier au compte utilisateur
- ✅ RLS configuré sur toutes les tables
- ✅ Policies pour acquéreurs, admins et commerciaux

### 2. Gestion des utilisateurs
- ✅ Ajout du rôle "Acquéreur" dans UsersManagement.jsx
- ✅ Sélection d'un acquéreur lors de la création du compte
- ✅ Edge function `create-user` modifiée pour lier user_id à l'acquéreur
- ✅ Statistiques mises à jour avec le nombre d'acquéreurs
- ✅ Icône ShoppingCart pour les acquéreurs

### 3. Emails
- ✅ En-tête des emails passée en bleu
- ✅ "YAM Immobilier" remplacé par "YAM Management"

## 📋 Ce qu'il reste à faire

### 1. Services API
Créer dans `/src/api/` :

#### `appelsDeFond.js`
```javascript
import { supabase } from '@/lib/supabase';

export const appelsDeFondService = {
  async list(lotId) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .select('*')
      .eq('lot_id', lotId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async listByAcquereur(acquereurId) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .select('*')
      .eq('acquereur_id', acquereurId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(appelData) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .insert(appelData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async validerParAdmin(id, adminId, notes = '') {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update({
        statut: 'valide_admin',
        date_validation_admin: new Date().toISOString(),
        valide_par: adminId,
        notes_admin: notes
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marquerComplete(id) {
    const { data, error } = await supabase
      .from('appels_de_fond')
      .update({
        statut: 'complete',
        date_completion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('appels_de_fond')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
```

#### `faq.js`
```javascript
import { supabase } from '@/lib/supabase';

export const faqService = {
  async listActive() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async listAll() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(faqData) {
    const { data, error } = await supabase
      .from('faq')
      .insert(faqData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('faq')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
```

#### `galeriePhotos.js`
```javascript
import { supabase } from '@/lib/supabase';

export const galeriePhotosService = {
  async list(lotId) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .select('*')
      .eq('lot_id', lotId)
      .order('ordre', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(photoData) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .insert(photoData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('galerie_photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('galerie_photos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
```

#### `messagesAdmin.js`
```javascript
import { supabase } from '@/lib/supabase';

export const messagesAdminService = {
  async list(acquereurId) {
    const { data, error } = await supabase
      .from('messages_admin')
      .select('*')
      .eq('acquereur_id', acquereurId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(messageData) {
    const { data, error } = await supabase
      .from('messages_admin')
      .insert(messageData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async marquerLu(id) {
    const { data, error } = await supabase
      .from('messages_admin')
      .update({ lu: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async countNonLus(acquereurId) {
    const { count, error } = await supabase
      .from('messages_admin')
      .select('*', { count: 'exact', head: true })
      .eq('acquereur_id', acquereurId)
      .eq('lu', false)
      .eq('expediteur_type', 'admin');
    if (error) throw error;
    return count || 0;
  }
};
```

### 2. Dashboard Acquéreur
Créer `/src/pages/AcquereurDashboard.jsx` avec les sections suivantes :

#### Structure du Dashboard
```
- Tableau de bord (informations résumées)
- Documents (liste des documents uploadés)
- Message envoyés par un administrateur
- Appels de fond de travaux (frise déroulante avec étapes)
  * Signature du contrat de réservation
  * Offre de prêt signée
  * Signature de l'acte authentique
  * Démarrage des travaux
  * Gros oeuvre / Structure
  * Second oeuvre
  * Finitions intérieures
  * Réception des travaux
  * Livraison
  * Mise en location
- Galerie Photos
- FAQ (accès aux questions fréquentes)
```

#### Étapes d'implémentation :
1. Récupérer l'acquéreur lié au user connecté
2. Récupérer le lot LMNP associé à l'acquéreur
3. Afficher les appels de fond avec système de validation
4. Afficher la messagerie avec l'admin
5. Afficher la galerie photos
6. Afficher la FAQ

### 3. Page Gestion FAQ (Admin)
Créer `/src/pages/FAQManagement.jsx` :
- Liste des FAQ avec possibilité d'activer/désactiver
- Création/édition/suppression de FAQ
- Réorganisation de l'ordre (drag & drop ou boutons haut/bas)
- Catégorisation des questions

### 4. Modification AcquereurDetail (Admin)
Dans `/src/components/acquereurs/AcquereurDetail.jsx`, ajouter :
- Section "Appels de fond" avec liste des étapes
- Boutons pour valider chaque étape (admin uniquement)
- Notes admin pour chaque validation
- Timeline visuelle des validations

### 5. Routing
Modifier `/src/main.jsx` ou `/src/App.jsx` pour ajouter :
```javascript
{
  path: '/dashboard-acquereur',
  element: (
    <ProtectedRoute allowedRoles={['acquereur']}>
      <AcquereurDashboard />
    </ProtectedRoute>
  )
},
{
  path: '/faq-management',
  element: (
    <ProtectedRoute allowedRoles={['admin']}>
      <FAQManagement />
    </ProtectedRoute>
  )
}
```

### 6. Navigation
Modifier le menu dans `/src/pages/Layout.jsx` :
- Pour les acquéreurs : afficher uniquement "Mon espace"
- Pour les admins : ajouter "Gestion FAQ" dans le menu

### 7. AuthContext
Vérifier que `AuthContext` gère bien le rôle 'acquereur' et récupère l'ID de l'acquéreur associé

## 🎨 Design des composants

### Frise déroulante Appels de fond
```
┌─────────────────────────────────────────────┐
│  ○ Signature contrat (En attente)          │
│     ↓                                       │
│  ✓ Offre de prêt (Validé par admin)       │
│     ↓                                       │
│  ○ Signature acte authentique (En attente) │
│     ↓                                       │
│  ...                                        │
└─────────────────────────────────────────────┘
```

États :
- `en_attente` : Cercle vide gris
- `valide_admin` : Cercle avec check vert
- `complete` : Cercle plein vert

### Messagerie
Style chat avec :
- Messages admin à gauche (fond gris clair)
- Messages acquéreur à droite (fond bleu clair)
- Badge "nouveau" sur messages non lus

### Galerie Photos
Grid responsive avec :
- Miniatures cliquables
- Lightbox au clic
- Titre et description sous chaque photo

## 🔒 Sécurité

Toutes les RLS sont déjà en place :
- Acquéreurs ne voient que leurs données
- Admins/commerciaux ont accès complet
- Les policies vérifient auth.uid() et les relations

## 🧪 Tests à faire

1. Créer un compte acquéreur dans UsersManagement
2. Se connecter avec ce compte
3. Vérifier que seul le dashboard acquéreur est accessible
4. Tester la création d'appels de fond (admin)
5. Tester la validation des appels de fond (admin)
6. Tester la messagerie bidirectionnelle
7. Tester l'upload de photos dans la galerie
8. Tester la FAQ

## 📝 Notes importantes

- Les appels de fond doivent être créés dans l'ordre (ordre: 1, 2, 3...)
- La validation admin est obligatoire avant que l'acquéreur puisse voir l'étape comme complète
- Les messages peuvent être envoyés par admin ou acquéreur
- Les photos sont stockées dans Supabase Storage (bucket 'documents')
- La FAQ est commune à tous les acquéreurs

## 🚀 Étapes suivantes recommandées

1. Créer les services API
2. Créer le dashboard acquéreur
3. Créer la page gestion FAQ
4. Modifier le routing
5. Tester l'ensemble du flux
6. Créer quelques FAQ par défaut
7. Créer un template d'appels de fond par défaut (10 étapes)
