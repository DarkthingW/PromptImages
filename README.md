# Galerie de prompts visuels

Une galerie web en français pour **explorer, rechercher, classer et copier des prompts de génération d'images**. Chaque fiche présente un style ou un concept visuel, le prompt associé et, lorsqu'elles sont disponibles, des images d'exemple.

Le projet fonctionne avec **HTML, CSS et JavaScript natifs**, sans framework ni étape de compilation. Les données sont centralisées dans `prompts.json` au **format v2**, avec une liste de catégories indépendante des prompts.

## Fonctionnalités

- **943 prompts et 40 catégories** dans le catalogue de référence.
- Recherche de styles et de prompts.
- Filtrage par catégorie.
- Tris : derniers ajouts, ordre original, titres A–Z / Z–A, catégories A–Z / Z–A, longueur du prompt et ordre aléatoire.
- Affichage des exemples visuels et agrandissement des images dans une visionneuse.
- Copie du texte d'un prompt en un clic.
- Interface responsive, adaptée aux ordinateurs et aux appareils mobiles.
- Catalogue modifiable sans changer le HTML de chaque fiche.

## Aperçu du projet

```text
.
├── index.html                 # Structure de la galerie
├── styles.css                 # Apparence et version mobile
├── script.js                  # Chargement, filtres, tris et interactions
├── prompts.json               # Catégories et prompts (format v2)
├── images/                    # Images d'exemple référencées dans le JSON
│   ├── 1.png
│   └── ...
├── categories_index_v2.csv    # Index des catégories (facultatif)
└── README.md
```

> Le dossier `images/` doit contenir les fichiers que vous souhaitez afficher. Une référence à une image dans le JSON ne crée pas automatiquement son fichier PNG.

## Installation et utilisation

### En local

1. Téléchargez ou clonez le dépôt GitHub.
2. Vérifiez que `index.html`, `styles.css`, `script.js` et `prompts.json` se trouvent à la racine du projet.
3. Ajoutez le dossier `images/` contenant les exemples disponibles.
4. Démarrez un serveur web local depuis le dossier du projet.

Avec Python 3 :

```bash
python -m http.server 8000
```

Ouvrez ensuite **http://localhost:8000** dans votre navigateur.

**Pourquoi un serveur local ?** La galerie charge `prompts.json` par JavaScript. Selon le navigateur, ouvrir directement `index.html` avec une adresse `file://` peut empêcher le chargement des données.

### Sur GitHub Pages

1. Placez les fichiers du site à la racine du dépôt (ou dans le dossier choisi pour la publication).
2. Dans GitHub, ouvrez **Settings → Pages**.
3. Dans **Build and deployment**, choisissez **Deploy from a branch**.
4. Sélectionnez la branche de publication (par exemple `main`) et le dossier `/ (root)`, puis enregistrez.
5. Ouvrez l'URL GitHub Pages affichée dans les réglages après publication.

La galerie est un site statique : aucun serveur applicatif, base de données ni installation de dépendances n'est nécessaire pour la publier.

## Structure des données : `prompts.json` (v2)

Le fichier contient un **objet JSON** avec trois propriétés principales :

- `version` : numéro de format, actuellement `2`.
- `categories` : liste centrale des catégories et de leur ordre.
- `prompts` : liste des prompts, chacun relié à une catégorie par `categoryId`.

Exemple simplifié :

```json
{
  "version": 2,
  "categories": [
    {
      "id": "jeu-video-interfaces-menus-et-hud",
      "index": 13,
      "name": "Jeu Vidéo / Interfaces, menus & HUD"
    }
  ],
  "prompts": [
    {
      "id": "exemple-menu-jeu-video",
      "title": "Video Game Menu",
      "subtitle": "Menu de jeu vidéo",
      "prompt": "Transform the provided image into a polished video game menu screen...",
      "categoryId": "jeu-video-interfaces-menus-et-hud",
      "images": [
        {
          "src": "images/946.png",
          "alt": "Image 946",
          "label": "ChatGPT 2026"
        }
      ]
    }
  ]
}
```

*Cet exemple est fictif et illustre seulement la structure du fichier. `images/946.png` doit exister pour être affichée.*

### Propriétés d'une catégorie

| Champ | Rôle |
| --- | --- |
| `id` | Identifiant unique et stable, utilisé dans `categoryId`. |
| `index` | Position de la catégorie dans le catalogue. |
| `name` | Nom complet affiché dans l'interface. |

### Propriétés d'un prompt

| Champ | Rôle |
| --- | --- |
| `id` | Identifiant unique du prompt. |
| `title` | Titre principal de la fiche. |
| `subtitle` | Sous-titre, généralement en français. |
| `prompt` | Texte à copier pour générer ou modifier une image. |
| `categoryId` | `id` d'une catégorie déclarée dans `categories`. |
| `images` | Tableau des exemples visuels, pouvant être vide (`[]`). |

Pour chaque entrée de `images` :

| Champ | Rôle |
| --- | --- |
| `src` | Chemin relatif du fichier image, par exemple `images/946.png`. |
| `alt` | Texte alternatif décrivant l'image. |
| `label` | Étiquette visible associée à l'exemple, par exemple `ChatGPT 2026`. |

## Ajouter un prompt

1. Choisissez une catégorie existante et copiez son `id` depuis `categories` ou `categories_index_v2.csv`.
2. Ajoutez un nouvel objet à la fin du tableau `prompts`.
3. Donnez-lui un `id` **unique**, un titre, un sous-titre, le texte du prompt et un `categoryId` valide.
4. Ajoutez les entrées `images` en respectant la numérotation et la structure du catalogue. Si vous n'avez pas encore d'image, utilisez `"images": []`.
5. Placez chaque nouveau fichier PNG dans `images/` avec exactement le nom indiqué par `src`.
6. Vérifiez la syntaxe JSON et actualisez la page.

Exemple d'entrée sans image :

```json
{
  "id": "nouveau-prompt-exemple",
  "title": "New Visual Style",
  "subtitle": "Nouveau style visuel",
  "prompt": "Transform this image into...",
  "categoryId": "jeu-video-interfaces-menus-et-hud",
  "images": []
}
```

**Important :** le nom complet de la catégorie n'est **pas** répété dans chaque prompt. Seul `categoryId` est utilisé. L'identifiant doit correspondre exactement à une catégorie existante.

## Ajouter ou renommer une catégorie

Pour créer une catégorie, ajoutez un objet à `categories` :

```json
{
  "id": "nouvelle-categorie",
  "index": 41,
  "name": "Nouvelle catégorie"
}
```

Utilisez ensuite `"categoryId": "nouvelle-categorie"` dans les prompts concernés.

Pour **renommer** une catégorie, modifiez seulement `name` : les prompts associés continueront à fonctionner. Évitez de modifier son `id` une fois qu'il est utilisé; sinon, il faudra aussi mettre à jour tous les `categoryId` correspondants.

Le fichier `categories_index_v2.csv` sert d'aide-mémoire. Le **fichier JSON reste la source officielle** des catégories utilisées par le site.

## Vérifier le JSON

Vous pouvez contrôler rapidement sa syntaxe avec Python :

```bash
python -m json.tool prompts.json > /dev/null
```

Pour vérifier que tous les prompts utilisent une catégorie existante :

```python
import json

with open("prompts.json", encoding="utf-8") as fichier:
    data = json.load(fichier)

assert data["version"] == 2

ids_categories = {categorie["id"] for categorie in data["categories"]}
ids_prompts = [prompt["id"] for prompt in data["prompts"]]

assert len(ids_prompts) == len(set(ids_prompts)), "IDs de prompts en double"

for prompt in data["prompts"]:
    assert prompt["categoryId"] in ids_categories, prompt["id"]

print(f"Validation OK : {len(ids_prompts)} prompts, {len(ids_categories)} catégories")
```

## Personnalisation

- **`styles.css`** : couleurs, disposition des fiches, taille des images et affichage mobile.
- **`index.html`** : titre de la page, barre de recherche et options de tri.
- **`script.js`** : logique de chargement, d'affichage et d'interaction.
- **`prompts.json`** : contenu du catalogue et organisation des catégories.

## Dépannage

**La galerie est vide :** vérifiez que le serveur web fonctionne, que `prompts.json` est accessible à côté de `index.html` et que le JSON est valide au format v2.

**Une catégorie ne fonctionne pas :** vérifiez que son `id` est déclaré dans `categories` et que le `categoryId` du prompt correspond exactement à cet identifiant.

**Une image n'apparaît pas :** vérifiez le nom du fichier, sa casse (`PNG` et `png` peuvent être différents sur certains hébergements) et son chemin relatif dans `images/`.

**Les changements n'apparaissent pas :** rechargez la page, au besoin avec un rechargement forcé pour éviter les fichiers conservés dans le cache du navigateur.

## Technologies utilisées

- HTML5
- CSS3
- JavaScript natif
- JSON
- GitHub Pages (optionnel, pour l'hébergement)

## Licence et crédits

Aucune licence de réutilisation n'est déclarée par ce README. Si vous souhaitez permettre à d'autres personnes de réutiliser le code ou les contenus du dépôt, ajoutez un fichier `LICENSE` correspondant à votre choix et précisez, si nécessaire, les droits applicables aux images et aux prompts.

---

*Galerie de prompts visuels — un catalogue organisé pour expérimenter avec les styles et concepts de génération d'images.*
