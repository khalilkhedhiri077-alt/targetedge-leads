# TargetEdge Lead Manager — Guide de déploiement

## Les 6 liens une fois déployé

| Qui | URL | Usage |
|-----|-----|-------|
| Agents Y&H | `ton-projet.vercel.app/ynh-saisie` | Saisie des leads |
| Y&H (lecture) | `ton-projet.vercel.app/ynh-leads` | Voir leurs leads + CPL |
| Agents TargetEdge | `ton-projet.vercel.app/te-saisie` | Saisie des leads internes |
| Khalil (admin) | `ton-projet.vercel.app/te-admin` | Tout gérer |
| G-Connex | `ton-projet.vercel.app/client-gconnex` | Leads + facture |
| WHD Courtage | `ton-projet.vercel.app/client-whd` | Leads + facture |

---

## Étape 1 — Google Sheets

1. Crée un Google Sheet avec **2 onglets** :
   - Onglet `LEADS` — laisser vide (les colonnes seront créées automatiquement)
   - Onglet `CONFIG` — ajouter cette ligne en ligne 1 (headers) :
     ```
     type | id | nom | operation | client_id | cpl_st | cpl_client | url_slug | actif
     ```
   - Puis ajouter ces lignes de données de départ :
     ```
     CLIENT | gconnex | G-Connex | | | | | gconnex | 1
     CLIENT | whd | WHD Courtage | | | | | whd | 1
     SOUS_TRAITANT | YNH | Y&H Call Center | | | | | ynh | 1
     SOUS_TRAITANT | TARGETEDGE | TargetEdge (interne) | | | | | targetedge | 1
     CAMPAGNE | telecom-b2b | Télécom B2B | Télécom B2B | gconnex | 40 | 100 | | 1
     CAMPAGNE | decennale-btp | Décennale BTP | Décennale BTP | whd | 40 | 100 | | 1
     ```

2. Note l'ID du Sheet (dans l'URL : `spreadsheets/d/XXXXXXX/edit`)

---

## Étape 2 — Compte de service Google

1. Va sur [console.cloud.google.com](https://console.cloud.google.com)
2. Crée un projet ou utilise un existant
3. Active l'API **Google Sheets API**
4. Crée un **compte de service** (Service Account)
5. Génère une clé JSON
6. Dans le Sheet, clique **Partager** et ajoute l'email du compte de service avec le rôle **Éditeur**

---

## Étape 3 — Variables d'environnement Vercel

Dans ton dashboard Vercel → Settings → Environment Variables, ajoute :

```
GOOGLE_SHEET_ID          = (l'ID de ton Sheet)
GOOGLE_SERVICE_ACCOUNT_EMAIL = (email du compte de service)
GOOGLE_PRIVATE_KEY       = (la clé privée du JSON, avec les \n)
```

---

## Étape 4 — Déploiement

```bash
# Dans le dossier targetedge-leads
npm install
git init
git add .
git commit -m "TargetEdge Lead Manager v1"
# Connecte à GitHub puis importe dans Vercel
```

Ou directement avec Vercel CLI :
```bash
npm i -g vercel
vercel --prod
```

---

## Gestion des campagnes (depuis l'admin)

1. Va sur `/te-admin`
2. Clique sur l'onglet **⚙️ Campagnes**
3. Tu peux :
   - **Ajouter un client** (nouveau fournisseur) → son lien sera `/client/{id}`
   - **Ajouter un sous-traitant** → son lien de saisie sera `/ynh-saisie` (ou crée une nouvelle page)
   - **Ajouter une campagne** → choisis l'opération, le client, les CPL
4. Tout est sauvegardé dans Google Sheets instantanément
5. Aucun redéploiement nécessaire pour les changements de config

---

## Ajouter un nouveau client (ex. : un nouvel assureur)

1. Admin → Campagnes → **+ Ajouter** un client (ex. : `assureur-xyz`, `Assureur XYZ`)
2. **+ Nouvelle campagne** (ex. : RC Pro → Assureur XYZ → CPL ST : 35€ → CPL Client : 85€)
3. Créer une nouvelle page dans `/pages/client-xyz.js` :
   ```js
   import VueClient from '../components/VueClient';
   export default function XYZ() {
     return <VueClient client="assureur-xyz" operation="RC Pro" titre="Assureur XYZ" />;
   }
   ```
4. Redéployer (1 commande : `vercel --prod`)
5. Envoyer le lien `/client-xyz` au client

---

## Flux complet des statuts

```
AGENT saisit → EN_ATTENTE
     ↓
KHALIL valide → VALIDE (email client) | REFUSE (rouge ST)
     ↓
CLIENT conteste → CONTESTE (orange partout)
     ↓
KHALIL arbitre → ARBITRAGE_OK (maintenu vert) | ARBITRAGE_KO (invalidé rouge)
```

## CPL — Logique de calcul

- **Sous-traitant** voit : leads soumis / validés / refusés + total à percevoir par opération
- **Client** voit : leads reçus / déduits / facturés + total à payer à TargetEdge
- **Admin** voit : marge TargetEdge = CPL client − CPL sous-traitant
- Les leads refusés et les leads contestés-invalidés sont **automatiquement déduits** des deux côtés
