# PokeOpening

Application de bureau (Windows) pour collectionner les cartes Pokémon : pages par Pokémon, classeurs, ouverture de boosters.

## Installer
1. Récupère `PokeOpening-Windows.zip` (envoyé par Hugo), extrais-le et lance `PokeOpening.exe`.
3. Au premier lancement, les cartes se téléchargent (~830 Mo, une seule fois).

Windows peut afficher « Windows a protégé votre ordinateur » : clique sur *Informations complémentaires* puis *Exécuter quand même*.

## Mises à jour
Au démarrage, l'app lit `data/manifest.json` sur ce dépôt et ne télécharge que les fichiers nouveaux ou modifiés.
La collection est enregistrée sur chaque PC et n'est jamais effacée par une mise à jour.

## Publier une mise à jour (nouvelle génération…)
1. Ajouter les nouveaux fichiers dans `data/` (nouveaux `.pack` de moins de 95 Mo, nouvel `index.html`).
2. `python tools/make_manifest.py VERSION "Libellé"` (VERSION = l'ancienne + 1).
3. Commit + push sur `main`.
