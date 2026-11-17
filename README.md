# PokeOpening

Application de bureau (Windows) pour collectionner les cartes Pokémon : pages par Pokémon, classeurs, ouverture de boosters.

## Installer
1. Va dans **Releases** (à droite) et télécharge `PokeOpening-Windows.zip`.
2. Extrais-le et lance `PokeOpening.exe`.
3. Au premier lancement, les cartes se téléchargent (~830 Mo, une seule fois).

Windows peut afficher « Windows a protégé votre ordinateur » : clique sur *Informations complémentaires* puis *Exécuter quand même*.

## Mises à jour
Au démarrage, l'app lit `manifest.json` de la dernière Release et ne télécharge que les fichiers nouveaux ou modifiés.
La collection est enregistrée sur chaque PC et n'est jamais effacée par une mise à jour.

## Publier une mise à jour (nouvelle génération…)
```
python tools/make_release.py DOSSIER_DONNEES VERSION "Libellé" release/ manifest_precedent.json
gh release create vVERSION release/* --title "Libellé"
```
Les gros fichiers de cartes (`*.pack`) ne sont pas dans le dépôt git : ils sont joints aux Releases.
