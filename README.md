# @absolu/create-lab-project

Initialise une démo Vite prête à être publiée sur le lab d'Absolu
(**lab.agence-absolu.com/<slug>/**), sur le modèle de
[`lab-drill`](https://github.com/agence-absolu/lab-drill).

```bash
npm create @absolu/lab-project@latest
# ou, sans question :
npm create @absolu/lab-project@latest -- ma-demo --yes
```

Le projet généré contient tout ce que le hub attend, et rien à nommer :

- `vite.config.js` — déduit la base des chemins (`/<slug>/`) du nom npm ;
- `.github/workflows/deploy.yml` — compile et publie `dist/` par rsync sur SSH
  dans `lab-projects/<slug>/` à chaque push sur `main` ;
- `README.md` — rappelle que le dépôt doit être **public** pour recevoir les
  secrets SSH de l'organisation (`LAB_SSH_HOST`, `LAB_SSH_USER`,
  `LAB_SSH_PASSWORD`, `LAB_SSH_KNOWN_HOSTS` facultatif) ;
- `index.html`, `src/main.js`, `src/style.css` — une page minimale (titre,
  description), sans dépendance autre que Vite ;
- `CLAUDE.md`, `.gitignore`, et un dépôt git initialisé (sans commit).

## Options

```
npm create @absolu/lab-project@latest -- [slug] [options]

      --title <texte>       titre de la démo (défaut : « Ma démo »)
  -d, --description <texte> description (balise meta et README)
      --dir <dossier>       dossier de destination (défaut : ./<slug>)
      --no-git              ne pas initialiser de dépôt git
  -y, --yes                 accepter les valeurs par défaut sans poser de question
  -h, --help
```

Le slug est le nom npm du projet et donne l'URL : minuscules, chiffres et
tirets (`/^[a-z0-9][a-z0-9-]*$/`), format imposé par le hub.

## Structure

```
bin/create-lab-project.js   point d'entrée
src/cli.js                  arguments, questions, récapitulatif
src/scaffold.js             copie et rendu du gabarit, package.json, git init
template/                   le projet généré (config, workflow, README, page, code)
```

Les fichiers du gabarit sont rendus : chaque `{{clé}}` (`slug`, `title`,
`description`, `year`) est remplacé. `template/_gitignore` devient
`.gitignore` à la copie (npm retire les `.gitignore` d'un paquet publié).
Aucune dépendance : Node ≥ 22 suffit.

## Développement

```bash
npm test                                    # génère dans un dossier temporaire et vérifie
node bin/create-lab-project.js demo --yes   # essai à la main
npm pack --dry-run                          # contenu du paquet publié
```

## Publication

```bash
npm version <patch|minor|major>
npm publish
```

Le paquet est public (`publishConfig.access`), sous l'organisation npm `@absolu`.
