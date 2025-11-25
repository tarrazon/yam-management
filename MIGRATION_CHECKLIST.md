# ✅ Checklist de Migration - YAM Management Platform

Utilisez cette checklist pour suivre votre progression lors de la migration.

---

## 📦 Phase 1 : Préparation et Export

### Export des données (Ancien projet)

- [ ] Connecté en tant qu'admin sur l'ancien projet
- [ ] Exporté la base de données en **SQL** (`yam_export_YYYY-MM-DD.sql`)
- [ ] Exporté la base de données en **JSON** (backup) (`yam_export_YYYY-MM-DD.json`)
- [ ] Exporté les documents et fichiers (`yam_documents_export_YYYY-MM-DD.json`)
- [ ] Fichiers sauvegardés en lieu sûr (plusieurs emplacements)

### Récupération des informations

- [ ] Noté l'URL Supabase actuelle
- [ ] Noté la clé ANON actuelle
- [ ] Noté la clé Google Maps API
- [ ] Noté la clé Resend API
- [ ] Téléchargé/cloné le code source complet

---

## 🔧 Phase 2 : Configuration du nouveau Supabase

### Création du projet

- [ ] Compte Supabase créé/accessible
- [ ] Nouveau projet Supabase créé
- [ ] Mot de passe de base de données noté et sauvegardé
- [ ] Région sélectionnée (proche des utilisateurs)
- [ ] Projet complètement initialisé (≈2 minutes)

### Récupération des nouvelles clés

- [ ] Project URL récupérée (Settings > API)
- [ ] anon public key récupérée
- [ ] service_role key récupérée
- [ ] Clés sauvegardées dans un fichier sécurisé

### Restauration de la base de données

- [ ] Fichier SQL ouvert dans un éditeur de texte
- [ ] Contenu copié intégralement
- [ ] SQL Editor ouvert dans Supabase
- [ ] Script SQL collé dans l'éditeur
- [ ] Script exécuté avec succès (Run)
- [ ] Vérification : Table Editor montre toutes les tables
- [ ] Vérification : Les données sont présentes dans les tables

### Configuration du Storage

- [ ] Accédé à Storage dans Supabase
- [ ] Bucket "documents" créé
- [ ] Bucket configuré en **privé** (non public)
- [ ] Politiques RLS appliquées automatiquement

---

## 🚀 Phase 3 : Déploiement sur Bolt

### Création du nouveau projet Bolt

- [ ] Compte Bolt accessible
- [ ] Nouveau projet créé sur Bolt
- [ ] Méthode d'import choisie (ZIP, GitHub, ou manuel)

### Import du code source

- [ ] Tous les fichiers sources importés
- [ ] Structure de dossiers préservée
- [ ] Fichier `.env` créé/modifié
- [ ] Nouvelles valeurs Supabase ajoutées dans `.env` :
  - [ ] `VITE_SUPABASE_URL=...`
  - [ ] `VITE_SUPABASE_ANON_KEY=...`
- [ ] Anciennes clés API préservées :
  - [ ] `VITE_GOOGLE_MAPS_API_KEY=...`
  - [ ] `RESEND_API_KEY=...`

### Installation et build

- [ ] Dépendances installées (`npm install`)
- [ ] Build réussi (`npm run build`)
- [ ] Application démarrée en mode dev

---

## 🔌 Phase 4 : Déploiement des Edge Functions

### Installation de Supabase CLI

- [ ] Supabase CLI installé (`npm install -g supabase`)
- [ ] Connexion à Supabase (`supabase login`)
- [ ] Projet lié (`supabase link --project-ref VOTRE-ID`)

### Déploiement des fonctions

- [ ] `create-user` déployée
- [ ] `expire-options-cron` déployée
- [ ] `export-database` déployée
- [ ] `export-lots` déployée
- [ ] `reset-password-with-token` déployée
- [ ] `send-birthday-emails` déployée
- [ ] `send-option-notification` déployée
- [ ] `send-password-reset` déployée
- [ ] `send-workflow-notification` déployée

### Configuration des secrets

- [ ] `RESEND_API_KEY` configuré dans Supabase secrets
- [ ] Secrets vérifiés (`supabase secrets list`)

---

## 📄 Phase 5 : Restauration des documents

### Connexion et import

- [ ] Application accessible via navigateur
- [ ] Connecté avec compte admin
- [ ] Page "Export des données" accessible
- [ ] Section "Sauvegarde des documents" trouvée
- [ ] Fichier JSON de documents sélectionné
- [ ] Import lancé et progression visible
- [ ] Import terminé avec succès (notification)
- [ ] Nombre de fichiers importés confirmé

---

## ✅ Phase 6 : Vérifications et tests

### Tests de base de données

- [ ] Toutes les tables sont visibles
- [ ] Comptage des enregistrements correct
- [ ] Relations entre tables fonctionnelles
- [ ] Pas d'erreurs dans les logs Supabase

### Tests d'authentification

- [ ] Connexion avec compte admin fonctionne
- [ ] Connexion avec compte commercial fonctionne
- [ ] Connexion avec compte partenaire fonctionne
- [ ] Connexion avec compte acquéreur fonctionne
- [ ] Rôles et permissions respectés
- [ ] Reset de mot de passe fonctionne
- [ ] Déconnexion fonctionne

### Tests de l'interface

- [ ] Dashboard admin s'affiche correctement
- [ ] Tableau de bord commercial accessible
- [ ] Espace acquéreur accessible
- [ ] Liste des résidences visible
- [ ] Carte géographique des résidences fonctionne
- [ ] Liste des lots LMNP visible
- [ ] Liste des partenaires visible
- [ ] Liste des acquéreurs visible
- [ ] Liste des notaires visible

### Tests des documents et fichiers

- [ ] Photos des lots s'affichent
- [ ] Galerie photos fonctionne
- [ ] Documents des acquéreurs accessibles
- [ ] Téléchargement de documents fonctionne
- [ ] Upload de nouveaux documents fonctionne

### Tests des fonctionnalités

- [ ] Création d'une nouvelle résidence
- [ ] Création d'un nouveau lot
- [ ] Création d'un nouveau partenaire
- [ ] Création d'un nouvel acquéreur
- [ ] Poser une option sur un lot
- [ ] Workflow d'emails activé
- [ ] Notifications reçues par email
- [ ] Export de données (SQL/JSON) fonctionne
- [ ] Export de documents fonctionne
- [ ] Export XML des lots fonctionne

### Tests des Edge Functions

- [ ] Email de bienvenue envoyé (création utilisateur)
- [ ] Email de reset password reçu
- [ ] Notification d'option reçue
- [ ] Notification de workflow reçue
- [ ] Export de base de données via API fonctionne

### Performance et sécurité

- [ ] Temps de chargement acceptable (<3s)
- [ ] Pas d'erreurs dans la console navigateur (F12)
- [ ] RLS (Row Level Security) actif sur toutes les tables
- [ ] Politiques RLS testées (accès restreint)
- [ ] Variables d'environnement sécurisées
- [ ] Clés API non exposées côté client

---

## 🎯 Phase 7 : Mise en production

### Dernières vérifications

- [ ] Tests effectués sur plusieurs navigateurs
- [ ] Tests effectués sur mobile
- [ ] Backup des données exportées conservé
- [ ] Documentation consultée (MIGRATION_GUIDE.md)
- [ ] Ancien projet conservé en backup (1 semaine minimum)

### Communication et déploiement

- [ ] Utilisateurs informés de la migration
- [ ] Horaire de migration choisi (faible affluence)
- [ ] Support préparé pour répondre aux questions
- [ ] Monitoring mis en place (logs, erreurs)

### Après migration

- [ ] Surveillance des logs pendant 24h
- [ ] Vérification des emails automatiques
- [ ] Vérification des cronjobs (expiration options)
- [ ] Feedback utilisateurs collecté
- [ ] Problèmes résolus rapidement

---

## 📊 Statistiques de migration

**Date de début** : ___/___/______

**Date de fin** : ___/___/______

**Durée totale** : _______ heures

**Nombre d'enregistrements migrés** : _______

**Nombre de documents migrés** : _______

**Nombre de fonctions déployées** : 9/9

**Problèmes rencontrés** : _______

**Notes additionnelles** :
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🆘 En cas de problème

**Avant de paniquer** :

1. Consultez MIGRATION_GUIDE.md section "Résolution de problèmes"
2. Vérifiez les logs Supabase (Logs & Observability)
3. Vérifiez la console navigateur (F12)
4. Vérifiez le fichier .env

**Backup disponible** :

- [ ] Fichier SQL d'export conservé
- [ ] Fichier JSON d'export conservé
- [ ] Fichier documents conservé
- [ ] Ancien projet toujours accessible

**En dernier recours** :

- Restaurez depuis l'ancien projet
- Recommencez la migration étape par étape

---

✅ **Migration complétée avec succès !**

_Date de validation finale : ___/___/_______

_Validé par : _________________________
