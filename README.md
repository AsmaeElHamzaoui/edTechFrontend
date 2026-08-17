# Plateforme d'Apprentissage Intelligent — Frontend

Frontend de la plateforme EdTech intelligente, développé avec **React**.

Cette application web permet aux apprenants d'interagir avec leurs documents PDF, de poser des questions à une IA, de générer des quiz, de consulter leur progression et de recevoir des recommandations pédagogiques.

Le frontend communique avec le backend **Django REST Framework** via des APIs REST et utilise **Server-Sent Events (SSE)** pour afficher les réponses de l'IA en streaming.

##  Fonctionnalités principales

###  Authentification & Utilisateurs

- Inscription des apprenants
- Connexion sécurisée
- Authentification JWT
- Déconnexion
- Protection des routes privées
- Gestion des rôles :
  - `APPRENANT`
  - `ADMINISTRATEUR`
- Gestion des erreurs d'authentification et d'autorisation
- Gestion des sessions expirées

###  Gestion des documents

- Téléversement de documents PDF
- Affichage de la liste des documents
- Affichage du statut de traitement :
  - `UPLOADED`
  - `PROCESSING`
  - `READY`
  - `FAILED`
- Affichage du nom, de la taille et de la date d'ajout
- Renommage d'un document
- Suppression d'un document
- Affichage des erreurs de traitement
- Actualisation du statut de traitement
- Gestion des quotas de stockage
- Accès aux fonctionnalités IA uniquement lorsque le document est `READY`

Les documents sont limités à **50 Mo** et **500 pages maximum** .

###  Chat IA

Le frontend fournit une interface conversationnelle permettant à l'apprenant de poser des questions concernant ses documents.

- Sélection d'un document
- Sélection de plusieurs documents
- Interrogation de tout l'espace de travail
- Questions en langage naturel
- Historique des conversations
- Mémoire conversationnelle
- Réponses IA en streaming avec **SSE**
- Choix du niveau de vulgarisation
- Affichage des citations
- Accès au passage et à la page correspondante dans le PDF
- Actions de suivi :
  - Approfondir
  - Simplifier
  - Générer un quiz

### Quiz interactifs

- Génération automatique de quiz
- Sélection du document ou du chapitre
- Sélection des concepts complexes
- Choix du nombre de questions
- Choix du type de questions :
  - QCM
  - Vrai/Faux
  - Questions ouvertes
- Choix du niveau de difficulté
- Mode adaptatif
- Affichage question par question
- Sauvegarde continue des réponses
- Soumission du quiz
- Affichage du score
- Correction détaillée
- Explication des réponses
- Références vers les passages concernés du document

Le nombre de questions peut être configuré entre **5 et 50 questions**.

###  Dashboard & Progression

Le tableau de bord permet à l'apprenant de suivre son évolution.

- Nombre de documents traités
- Nombre de questions posées
- Nombre de quiz réalisés
- Scores obtenus
- Progression par concept
- Courbe de progression
- Série d'assiduité
- Trois concepts les plus fragiles
- Recommandations de révision

Filtres disponibles :

- Période
- Matière
- Document

Exports :

- PDF
- CSV

###  Notifications

- Notification lorsqu'un document est prêt
- Notification en cas d'échec de traitement
- Rappels de révision
- Résultats de quiz
- Recommandations pédagogiques
- Consultation des notifications depuis l'application

###  Administration

Les utilisateurs ayant le rôle `ADMINISTRATEUR` disposent d'une interface dédiée permettant de :

- Rechercher un apprenant
- Consulter son profil
- Consulter son rôle
- Consulter son quota
- Consulter sa volumétrie
- Consulter sa dernière activité
- Modifier son rôle
- Modifier ses quotas

##  Architecture du frontend

Le frontend est développé sous forme de **Single Page Application (SPA)** avec React.

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── documents/
│   │   ├── chat/
│   │   ├── quiz/
│   │   ├── dashboard/
│   │   └── notifications/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── chat/
│   │   ├── quiz/
│   │   ├── profile/
│   │   └── admin/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── documents/
│   │   ├── chat/
│   │   ├── quiz/
│   │   ├── dashboard/
│   │   └── notifications/
│   │
│   ├── hooks/
│   ├── context/
│   ├── guards/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

### Installation
1. Cloner le projet
git clone <URL_DU_REPOSITORY>
cd frontend

2. Installer les dépendances
npm install

3. Configurer les variables d'environnement

Créer un fichier .env à partir du fichier .env.example.

Configurer l'URL du backend :

VITE_API_URL=http://localhost:8000

Lancer le frontend

Pour lancer le serveur de développement :

npm run dev


Le frontend sera généralement accessible sur :

http://localhost:5173

Build de production

Pour générer la version de production :

npm run build
