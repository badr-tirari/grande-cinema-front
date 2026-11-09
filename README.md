# La Grande Cinéma — Front de réservation

Application web (React 19 + Vite) de réservation de places pour le cinéma **La Grande Cinéma**.
Elle consomme l'API [grande-cinema-api](https://github.com/badr-tirari/grande-cinema-api).

## Parcours

| Espace | Pages | User stories |
|---|---|---|
| Spectateur | À l'affiche, fiche film, plan de salle, réservation | CINE-5, CINE-6, CINE-7 |
| Spectateur connecté | Mes billets, billet QR code, annulation | CINE-8, CINE-9 |
| Compte | Connexion, inscription | CINE-4 |
| Administration | Programmation, réservations, taux de remplissage | CINE-10, CINE-11, CINE-12 |

Le plan de salle se rafraîchit toutes les 15 secondes et retire de la sélection les places
réservées entre-temps par d'autres spectateurs ; un conflit (409) renvoyé par l'API est affiché
et le plan rechargé.

## Lancer en local

```bash
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev                   # http://localhost:5173
```

## Qualité

```bash
npm run lint       # ESLint (règles React Hooks)
npm test           # tests unitaires Vitest
npm run coverage   # couverture des fonctions métier (src/lib)
npm run build      # build de production
```

## Déploiement

Vercel (offre gratuite) : framework Vite, variable `VITE_API_URL` = URL de l'API Render.
`vercel.json` redirige toutes les routes vers `index.html` (routage côté client).

Conventions Git : voir [CONTRIBUTING.md](CONTRIBUTING.md).
