# 📦 Package d'Export YAM Management Platform

Ce package contient tout ce dont vous avez besoin pour migrer votre projet YAM vers un nouveau compte Bolt.

---

## 📁 Contenu du package

### 📄 Documentation

| Fichier | Description |
|---------|-------------|
| `MIGRATION_GUIDE.md` | Guide complet étape par étape pour la migration |
| `MIGRATION_CHECKLIST.md` | Checklist interactive pour suivre votre progression |
| `EXPORT_PACKAGE_README.md` | Ce fichier - Vue d'ensemble du package |

### 🔧 Scripts

| Fichier | Description |
|---------|-------------|
| `setup-new-environment.sh` | Script automatique pour configurer le nouvel environnement |

### 💾 Données à exporter séparément

Ces fichiers doivent être générés depuis l'ancien projet :

| Fichier | Comment l'obtenir |
|---------|-------------------|
| `yam_export_YYYY-MM-DD.sql` | Export des données > Format SQL |
| `yam_export_YYYY-MM-DD.json` | Export des données > Format JSON (backup) |
| `yam_documents_export_YYYY-MM-DD.json` | Export des données > Exporter les documents |

⚠️ **Important** : Ces fichiers contiennent vos données sensibles. Ne les partagez jamais publiquement !

---

## 🚀 Démarrage rapide

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
# 1. Placez-vous dans le dossier du projet
cd yam-management

# 2. Exécutez le script de configuration
bash setup-new-environment.sh

# 3. Suivez les instructions à l'écran
```

Le script va :
- ✅ Vérifier les prérequis (Node.js, npm)
- ✅ Configurer le fichier `.env`
- ✅ Installer les dépendances
- ✅ Optionnellement déployer les Edge Functions
- ✅ Builder le projet

### Option 2 : Configuration manuelle

1. **Lisez le guide complet** : `MIGRATION_GUIDE.md`
2. **Suivez la checklist** : `MIGRATION_CHECKLIST.md`
3. **Exécutez les commandes manuellement**

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

### Logiciels installés

- [x] **Node.js** (v16 ou supérieur) - [Télécharger](https://nodejs.org/)
- [x] **npm** (installé avec Node.js)
- [x] **Supabase CLI** (optionnel mais recommandé) - `npm install -g supabase`
- [x] **Git** (optionnel, pour cloner le projet)

### Comptes requis

- [x] **Compte Bolt** (destination) - [bolt.new](https://bolt.new)
- [x] **Compte Supabase** - [supabase.com](https://supabase.com)

### Clés API

- [x] **Google Maps API Key** (peut réutiliser l'ancienne)
- [x] **Resend API Key** (peut réutiliser l'ancienne)

---

## 🗺️ Plan de migration

### Étape 1 : Préparation (15 min)

1. Exporter les données depuis l'ancien projet
2. Télécharger le code source
3. Sauvegarder tous les fichiers en lieu sûr

### Étape 2 : Nouveau Supabase (10 min)

1. Créer un nouveau projet Supabase
2. Récupérer les nouvelles clés API
3. Restaurer la base de données (SQL)
4. Créer le bucket Storage "documents"

### Étape 3 : Nouveau Bolt (15 min)

1. Créer un nouveau projet Bolt
2. Importer le code source
3. Configurer les variables d'environnement
4. Installer les dépendances

### Étape 4 : Edge Functions (20 min)

1. Installer Supabase CLI
2. Lier le projet
3. Déployer les 9 Edge Functions
4. Configurer les secrets

### Étape 5 : Restauration des documents (5-30 min)

1. Lancer l'application
2. Se connecter en admin
3. Importer le fichier JSON de documents

### Étape 6 : Tests et vérification (30 min)

1. Tester toutes les fonctionnalités principales
2. Vérifier les données
3. Tester les emails et notifications

**Durée totale estimée : 1h30 - 2h**

---

## 📖 Documentation détaillée

### Pour une migration complète

Consultez **`MIGRATION_GUIDE.md`** qui couvre :

- ✅ Étapes détaillées avec captures d'écran
- ✅ Commandes exactes à exécuter
- ✅ Solutions aux problèmes courants
- ✅ Vérifications de sécurité
- ✅ Optimisations de performance

### Pour suivre votre progression

Utilisez **`MIGRATION_CHECKLIST.md`** qui contient :

- ✅ Checklist complète phase par phase
- ✅ Cases à cocher pour chaque étape
- ✅ Statistiques de migration
- ✅ Notes et observations

---

## 🔒 Sécurité

### Données sensibles

Ce projet contient des données sensibles. Prenez ces précautions :

1. **Ne commitez JAMAIS** :
   - ❌ Le fichier `.env`
   - ❌ Les exports SQL/JSON
   - ❌ Les clés API
   - ❌ Les mots de passe

2. **Sauvegardez en sécurité** :
   - ✅ Utilisez un gestionnaire de mots de passe
   - ✅ Chiffrez les exports de données
   - ✅ Utilisez un stockage cloud privé

3. **Après la migration** :
   - ✅ Supprimez les exports locaux
   - ✅ Vérifiez que RLS est actif
   - ✅ Testez les permissions

---

## 🆘 Support et résolution de problèmes

### En cas de problème

1. **Consultez le guide** : `MIGRATION_GUIDE.md` section "Résolution de problèmes"
2. **Vérifiez les logs** :
   - Supabase : Logs & Observability
   - Edge Functions : Function logs
   - Frontend : Console navigateur (F12)
3. **Vérifiez les bases** :
   - Fichier `.env` correct ?
   - Dépendances installées ?
   - Base de données restaurée ?

### Problèmes courants

| Problème | Solution rapide |
|----------|-----------------|
| "Cannot connect to database" | Vérifiez `VITE_SUPABASE_URL` dans `.env` |
| "Images not loading" | Vérifiez que le bucket "documents" existe |
| "Emails not sending" | Vérifiez `RESEND_API_KEY` et Edge Functions |
| "Function deployment failed" | Vérifiez `supabase link` et authentification |

---

## ✅ Checklist pré-migration

Avant de commencer, vérifiez que vous avez :

- [ ] Lu le `MIGRATION_GUIDE.md` entièrement
- [ ] Imprimé ou ouvert `MIGRATION_CHECKLIST.md`
- [ ] Exporté toutes les données (SQL + JSON + Documents)
- [ ] Sauvegardé les fichiers en 2 endroits différents
- [ ] Noté toutes les clés API actuelles
- [ ] Compte Supabase prêt
- [ ] Compte Bolt prêt
- [ ] Bloc de temps réservé (2h minimum)
- [ ] Café/thé préparé ☕

---

## 📊 Architecture du projet

### Structure des dossiers

```
yam-management/
├── src/
│   ├── api/              # Services API et Supabase
│   ├── components/       # Composants React réutilisables
│   ├── contexts/         # Contextes React (Auth, etc.)
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et configuration
│   ├── pages/            # Pages de l'application
│   └── utils/            # Fonctions utilitaires
├── supabase/
│   ├── functions/        # Edge Functions (serverless)
│   └── migrations/       # Migrations SQL historiques
├── public/               # Assets statiques
└── ...                   # Configuration (vite, tailwind, etc.)
```

### Technologies utilisées

- **Frontend** : React + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Serverless** : Supabase Edge Functions (Deno)
- **Emails** : Resend
- **Cartes** : Google Maps API + Leaflet
- **État** : React Context + TanStack Query

---

## 🎯 Fonctionnalités principales

### Pour les Administrateurs

- Gestion complète des résidences et lots
- Gestion des partenaires et commerciaux
- Gestion des acquéreurs et notaires
- Workflows automatisés d'emails
- Exports de données (SQL, JSON, XML)
- Statistiques et dashboards
- Système de messagerie

### Pour les Commerciaux

- Tableau de bord personnel
- Suivi de leurs dossiers
- Gestion de leurs partenaires
- Notifications en temps réel

### Pour les Partenaires

- Consultation des lots disponibles
- Pose d'options sur les lots
- Suivi de leurs acquéreurs
- Messagerie avec l'administration

### Pour les Acquéreurs

- Espace client personnalisé
- Suivi de leur dossier
- Appels de fond et calendrier
- Galerie photos de leur lot
- Documents téléchargeables
- FAQ et support

---

## 🔄 Mises à jour futures

Pour mettre à jour ce package vers une nouvelle version :

1. Exportez à nouveau les données
2. Comparez les différences de code
3. Appliquez les migrations SQL incrémentales
4. Redéployez les Edge Functions modifiées

---

## 📞 Contacts

**Projet** : YAM Management Platform

**Version** : 1.0

**Date du package** : 25 Novembre 2025

**Compatibilité** :
- Node.js : v16+
- Supabase : Latest
- Bolt : Latest

---

## 📝 Notes finales

### Recommandations

1. **Gardez un backup** de l'ancien projet pendant au moins 1 semaine
2. **Testez extensivement** avant la mise en production
3. **Informez vos utilisateurs** de la migration
4. **Surveillez les logs** pendant les premières 24h

### Améliorations futures possibles

- CI/CD automatisé
- Tests unitaires et E2E
- Monitoring et alertes
- Backups automatiques
- Multi-langue

---

**Bonne migration ! 🚀**

Pour toute question, consultez d'abord `MIGRATION_GUIDE.md` qui est très détaillé.
