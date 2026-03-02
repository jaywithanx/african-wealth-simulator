# 🌍 Simulateur de Richesse Africaine

Un jeu de simulation économique basé sur navigateur où vous bâtissez votre empire financier dans différents pays africains.

## 🛠️ Technologies utilisées

- **Phaser.js v3** — moteur de jeu
- **TypeScript** — langage de programmation
- **Vite** — bundler et serveur de développement

## 📦 Installation et démarrage

### Prérequis
- Node.js (v18 ou supérieur)
- npm

### Installation

```bash
npm install
```

### Démarrage en développement

```bash
npm run dev
```

Ouvrez ensuite votre navigateur à l'adresse : `http://localhost:3000`

### Construction pour la production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

---

## 🎮 Instructions du jeu

### Objectif
Atteignez **1 000 000 $** de valeur nette en 30 tours maximum.

### 1. Choisissez votre pays
Sélectionnez parmi 6 pays africains, chacun avec ses propres ressources et bonus de départ :
- 🇳🇬 **Nigeria** — Pétrole, +20% Commerce
- 🇰🇪 **Kenya** — Agriculture, +20% Agriculture
- 🇬🇭 **Ghana** — Or, +15% Mines
- 🇿🇦 **Afrique du Sud** — Diamants, +10% tous secteurs
- 🇪🇹 **Éthiopie** — Café, +25% Agriculture
- 🇨🇩 **Congo RDC** — Coltan/Minerais, +30% Mines

### 2. Choisissez votre voie
- 🌾 **Agriculture** — Revenus stables, sensible aux sécheresses
- 📦 **Commerce** — Revenus variables, bonifiés par les accords commerciaux
- 🏪 **Entrepreneuriat** — Croissance lente au début, exponentielle ensuite

### 3. Gérez votre empire
Chaque tour, vous recevez des revenus et un événement aléatoire se produit.
Vous pouvez :
- **Améliorer votre activité** (Niveau 1 → 2 → 3) pour augmenter vos revenus
- **Investir dans l'immobilier** pour des revenus passifs supplémentaires

### Conditions de victoire/défaite
- ✅ **Victoire** : Atteindre 1 000 000 $ de valeur nette
- ❌ **Défaite** : Valeur nette à 0 $ ou 30 tours écoulés sans atteindre l'objectif

---

## 🎲 Événements aléatoires

Le jeu comprend 15 événements différents qui peuvent affecter positivement ou négativement votre fortune :
sécheresses, accords commerciaux, booms technologiques, crises économiques, et bien d'autres!
