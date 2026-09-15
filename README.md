# @absolu/create-lab-project

Initialise une démo Vite prête à être publiée sur le lab d'Absolu
(**lab.agence-absolu.com/<slug>/**). Une seule question, le slug ; le reste
est générique et se remplace dans le projet généré.

```bash
npm create @absolu/lab-project@latest
```

Le projet généré contient tout ce que le hub attend, et rien à nommer :

- `vite.config.js` — déduit la base des chemins (`/<slug>/`) du nom npm ;
- `.github/workflows/deploy.yml` — compile et publie `dist/` par rsync sur SSH
  dans `lab-projects/<slug>/` à chaque push sur `main` ;
- `README.md` — rappelle que le dépôt doit être **public** pour recevoir les
  secrets SSH de l'organisation (`LAB_SSH_HOST`, `LAB_SSH_USER`,
  `LAB_SSH_PASSWORD`, `LAB_SSH_KNOWN_HOSTS` facultatif) ;
- `index.html`, `src/main.js`, `src/style.css` — une page minimale, sans
  dépendance autre que Vite ;
- `CLAUDE.md`, `.gitignore`, et un dépôt git initialisé (sans commit).

Le titre (« Démo Lab Absolu ») et la description (« Une démo de plus dans
l'univers du Lab Absolu. ») sont les mêmes pour toutes les démos : ils sont
à remplacer dans `index.html`, `README.md`, `CLAUDE.md` et `package.json`.

## Options

```
npm create @absolu/lab-project@latest -- [slug] [options]

      --dir <dossier>       dossier de destination (défaut : ./<slug>)
      --no-git              ne pas initialiser de dépôt git
  -h, --help
```

Le slug est le nom npm du projet et donne l'URL : minuscules, chiffres et
tirets (`/^[a-z0-9][a-z0-9-]*$/`), format imposé par le hub. Sans slug en
argument, il est demandé ; hors d'un terminal interactif (CI), il est requis.

## Ensuite

```bash
cd ma-demo
npm install
npm run dev                                  # http://localhost:5173/ma-demo/
gh repo create agence-absolu/lab-ma-demo --public --source=. --push
```

Le premier push sur `main` déclenche le workflow ; la démo apparaît sur
https://lab.agence-absolu.com/ma-demo/. Le détail (secrets, règles du hub)
est dans le README du projet généré.

## Structure

```
bin/create-lab-project.js   point d'entrée
src/cli.js                  arguments, question du slug, récapitulatif
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
node bin/create-lab-project.js demo         # essai à la main
npm pack --dry-run                          # contenu du paquet publié
```

## Publication

```bash
npm version <patch|minor|major>
npm publish
```

Le paquet est public (`publishConfig.access`), sous l'organisation npm `@absolu`.
