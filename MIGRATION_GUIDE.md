# Guide de Migration - YAM Management Platform

Ce guide vous accompagne dans la migration complète de votre projet YAM vers un nouveau compte Bolt.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Étape 1 : Exporter les données](#étape-1--exporter-les-données)
3. [Étape 2 : Créer le nouveau Supabase](#étape-2--créer-le-nouveau-supabase)
4. [Étape 3 : Restaurer la base de données](#étape-3--restaurer-la-base-de-données)
5. [Étape 4 : Configurer le Storage](#étape-4--configurer-le-storage)
6. [Étape 5 : Importer dans Bolt](#étape-5--importer-dans-bolt)
7. [Étape 6 : Déployer les Edge Functions](#étape-6--déployer-les-edge-functions)
8. [Étape 7 : Restaurer les documents](#étape-7--restaurer-les-documents)
9. [Vérifications finales](#vérifications-finales)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte Bolt (destination)
- ✅ Un compte Supabase (ou possibilité d'en créer un)
- ✅ Accès à l'ancien projet avec droits admin
- ✅ Les fichiers suivants exportés :
  - `yam_export_YYYY-MM-DD.sql` (export SQL de la base)
  - `yam_export_YYYY-MM-DD.json` (export JSON alternatif)
  - `yam_documents_export_YYYY-MM-DD.json` (tous les fichiers/documents)
- ✅ Les clés API actuelles (Google Maps, Resend)

---

## Étape 1 : Exporter les données

### 1.1 Exporter la base de données

1. Connectez-vous à l'ancien projet avec un compte **admin**
2. Dans le menu de gauche, allez dans **"Export des données"**
3. Sélectionnez **"Toutes les tables"**
4. Cliquez sur **"Format SQL"** pour télécharger `yam_export_YYYY-MM-DD.sql`
5. Cliquez aussi sur **"Format JSON"** comme backup

### 1.2 Exporter les documents et fichiers

1. Sur la même page "Export des données"
2. Descendez jusqu'à la section orange **"Sauvegarde des documents et fichiers"**
3. Cliquez sur **"Exporter les documents"**
4. Téléchargez le fichier `yam_documents_export_YYYY-MM-DD.json`

⚠️ **Important** : Conservez ces fichiers en lieu sûr ! Ils contiennent toutes vos données.

---

## Étape 2 : Créer le nouveau Supabase

### 2.1 Créer un nouveau projet

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur **"New Project"**
3. Renseignez :
   - **Name** : `yam-management` (ou votre nom)
   - **Database Password** : Générez un mot de passe fort et sauvegardez-le
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
4. Cliquez sur **"Create new project"**

⏱️ La création prend environ 2 minutes.

### 2.2 Récupérer les clés d'API

Une fois le projet créé :

1. Allez dans **Settings** > **API**
2. Notez ces valeurs (vous en aurez besoin) :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (pour les Edge Functions)

---

## Étape 3 : Restaurer la base de données

### 3.1 Exécuter le script SQL

1. Dans votre nouveau projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Ouvrez votre fichier `yam_export_YYYY-MM-DD.sql` avec un éditeur de texte
4. Copiez **tout le contenu**
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **"Run"** (ou Ctrl+Enter)

⏱️ L'exécution peut prendre 1-2 minutes selon la taille.

### 3.2 Vérifier la restauration

1. Allez dans **Table Editor**
2. Vérifiez que toutes les tables sont présentes :
   - `profiles`
   - `partenaires`
   - `acquereurs`
   - `vendeurs`
   - `notaires`
   - `residences_gestion`
   - `lots_lmnp`
   - `workflow_steps`
   - etc.

3. Cliquez sur une table et vérifiez qu'elle contient vos données

---

## Étape 4 : Configurer le Storage

### 4.1 Créer le bucket "documents"

1. Dans Supabase, allez dans **Storage**
2. Cliquez sur **"Create a new bucket"**
3. Renseignez :
   - **Name** : `documents` (exactement ce nom)
   - **Public bucket** : ❌ NON (décochez)
4. Cliquez sur **"Create bucket"**

### 4.2 Configurer les politiques RLS (Row Level Security)

Le bucket utilise déjà les politiques de sécurité. Vous n'avez rien à faire de plus.

---

## Étape 5 : Importer dans Bolt

### 5.1 Créer un nouveau projet Bolt

1. Connectez-vous à votre nouveau compte Bolt
2. Créez un nouveau projet
3. Choisissez **"Import from GitHub"** ou **"Start from scratch"**

### 5.2 Uploader les fichiers

**Option A : Via ZIP**
1. Compressez tout le dossier du projet en ZIP
2. Uploadez-le dans Bolt (si cette fonctionnalité existe)

**Option B : Via GitHub**
1. Poussez le code sur un repository GitHub
2. Importez depuis GitHub dans Bolt

**Option C : Manuellement**
1. Copiez/collez les fichiers un par un (long mais fonctionne)

### 5.3 Configurer les variables d'environnement

Créez ou modifiez le fichier `.env` avec vos nouvelles valeurs :

```env
# Supabase Configuration (NOUVELLES VALEURS)
VITE_SUPABASE_URL=https://VOTRE-NOUVEAU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Keys (ANCIENNES VALEURS - à conserver)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCylRH1zDC8tfT6nZ9756ybT3veE9tKFhM
RESEND_API_KEY=re_PymVKmBe_8iTtyVbfGsUbQ2p68qYnmCRv
```

⚠️ **Important** :
- Remplacez uniquement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Gardez les mêmes clés Google Maps et Resend (si elles fonctionnent toujours)

### 5.4 Installer les dépendances

Si vous avez accès au terminal :

```bash
npm install
```

---

## Étape 6 : Déployer les Edge Functions

Les Edge Functions sont des fonctions serverless qui doivent être redéployées dans le nouveau Supabase.

### 6.1 Installer Supabase CLI (si pas déjà fait)

```bash
npm install -g supabase
```

### 6.2 Se connecter à Supabase

```bash
supabase login
```

### 6.3 Lier le projet

```bash
supabase link --project-ref VOTRE-NOUVEAU-PROJECT-ID
```

### 6.4 Déployer toutes les fonctions

```bash
# Fonction de création d'utilisateur
supabase functions deploy create-user

# Fonction d'expiration des options
supabase functions deploy expire-options-cron

# Fonction d'export de la base
supabase functions deploy export-database

# Fonction d'export des lots
supabase functions deploy export-lots

# Fonction de reset de mot de passe
supabase functions deploy reset-password-with-token

# Fonction d'envoi d'emails d'anniversaire
supabase functions deploy send-birthday-emails

# Fonction de notification d'option
supabase functions deploy send-option-notification

# Fonction d'envoi de reset password
supabase functions deploy send-password-reset

# Fonction de notification de workflow
supabase functions deploy send-workflow-notification
```

### 6.5 Configurer les secrets des Edge Functions

Certaines fonctions nécessitent des clés API :

```bash
# Clé Resend pour l'envoi d'emails
supabase secrets set RESEND_API_KEY=re_PymVKmBe_8iTtyVbfGsUbQ2p68qYnmCRv

# Service role key (automatiquement disponible, mais au cas où)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### 6.6 Vérifier les déploiements

```bash
supabase functions list
```

Vous devriez voir toutes les fonctions listées avec leur statut.

---

## Étape 7 : Restaurer les documents

### 7.1 Lancer l'application

1. Dans Bolt, lancez le projet (dev ou preview)
2. Attendez que l'application démarre

### 7.2 Se connecter en admin

1. Utilisez vos identifiants admin (email/mot de passe de l'ancien système)
2. Si vous avez oublié, créez un nouvel admin via SQL :

```sql
-- Dans Supabase SQL Editor
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('VotreMotDePasse', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Puis créez le profil admin
INSERT INTO profiles (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'admin'
);
```

### 7.3 Importer les documents

1. Une fois connecté en admin, allez dans **"Export des données"**
2. Descendez jusqu'à la section **"Sauvegarde des documents et fichiers"**
3. Cliquez sur **"Importer les documents"**
4. Sélectionnez votre fichier `yam_documents_export_YYYY-MM-DD.json`
5. Attendez que l'import se termine (peut prendre plusieurs minutes)

✅ Une notification vous indiquera le nombre de fichiers importés avec succès.

---

## Vérifications finales

Avant de considérer la migration comme complète, vérifiez :

### Base de données
- ✅ Toutes les tables sont présentes
- ✅ Les données sont intactes (nombre d'enregistrements)
- ✅ Les relations entre tables fonctionnent

### Authentification
- ✅ Vous pouvez vous connecter avec vos comptes existants
- ✅ Les rôles (admin, commercial, partenaire, acquéreur) fonctionnent
- ✅ Le reset de mot de passe fonctionne

### Documents et fichiers
- ✅ Les photos des lots s'affichent
- ✅ Les documents des acquéreurs sont accessibles
- ✅ Le téléchargement de documents fonctionne

### Fonctionnalités
- ✅ Les résidences s'affichent avec leur carte
- ✅ Les lots LMNP sont visibles
- ✅ Les workflows d'emails fonctionnent
- ✅ Les notifications s'envoient correctement
- ✅ Les exports (XML, database) fonctionnent

### Edge Functions
- ✅ Les emails de notification partent
- ✅ Les options expirent automatiquement (CRON)
- ✅ Les exports de données fonctionnent

---

## 🆘 Résolution de problèmes

### Problème : "Impossible de se connecter à la base de données"

**Solution** : Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont corrects dans `.env`

### Problème : "Les images ne s'affichent pas"

**Solution** :
1. Vérifiez que le bucket "documents" existe dans Supabase Storage
2. Vérifiez que l'import des documents s'est bien passé
3. Vérifiez les politiques RLS du bucket

### Problème : "Les emails ne partent pas"

**Solution** :
1. Vérifiez que `RESEND_API_KEY` est correct dans `.env`
2. Vérifiez que les Edge Functions sont déployées
3. Vérifiez les secrets des Edge Functions : `supabase secrets list`

### Problème : "Erreur lors du déploiement d'une Edge Function"

**Solution** :
1. Vérifiez que vous êtes bien lié au bon projet : `supabase projects list`
2. Reliez-vous si nécessaire : `supabase link --project-ref VOTRE-ID`
3. Redéployez la fonction spécifique

---

## 📞 Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. Vérifiez les logs dans Supabase (Logs & Observability)
2. Vérifiez les logs des Edge Functions
3. Vérifiez la console du navigateur (F12) pour les erreurs frontend

---

## ✅ Checklist finale

Avant de mettre en production votre nouveau projet :

- [ ] Base de données restaurée et vérifiée
- [ ] Bucket Storage créé et configuré
- [ ] Variables d'environnement configurées
- [ ] Edge Functions déployées et testées
- [ ] Documents restaurés et accessibles
- [ ] Connexion et authentification fonctionnelles
- [ ] Tests sur toutes les pages principales
- [ ] Backup des données exportées stocké en sécurité
- [ ] Ancien projet gardé en backup pendant 1 semaine minimum

---

**Date de création du guide** : 25 Novembre 2025
**Version du projet** : YAM Management v1.0
**Compatibilité** : Supabase + Bolt + React
