// Ligne de commande : `npm create @absolu/lab-project@latest [slug] [options]`.
//
// Ce qui n'est pas passé en option est demandé, sauf avec --yes ou hors d'un
// terminal interactif (CI) où les valeurs par défaut s'appliquent.

import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { SLUG, scaffold } from './scaffold.js';

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

const HELP = `
${bold('npm create @absolu/lab-project@latest')} [slug] [options]

Initialise une démo Vite prête à être publiée sur lab.agence-absolu.com/<slug>/.

${bold('Options')}
      --title <texte>       titre de la démo (défaut : « Ma démo »)
  -d, --description <texte> description (balise meta et README)
      --dir <dossier>       dossier de destination (défaut : ./<slug>)
      --no-git              ne pas initialiser de dépôt git
  -y, --yes                 accepter les valeurs par défaut sans poser de question
  -h, --help                cette aide
`;

export async function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true, // --no-git
    options: {
      title: { type: 'string' },
      description: { type: 'string', short: 'd' },
      dir: { type: 'string' },
      git: { type: 'boolean', default: true },
      yes: { type: 'boolean', short: 'y', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const interactive = !values.yes && process.stdin.isTTY && process.stdout.isTTY;
  const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;

  // Pose la question si possible, sinon retient la valeur par défaut.
  async function ask(label, { fallback, validate = () => true, hint } = {}) {
    if (!rl) {
      const problem = validate(fallback);
      if (problem !== true) throw new Error(problem);
      return fallback;
    }
    for (;;) {
      const suffix = fallback ? dim(` (${fallback})`) : '';
      const answer = (await rl.question(`${cyan('?')} ${label}${suffix}${hint ? ` ${dim(hint)}` : ''} `)).trim();
      const value = answer || fallback || '';
      const problem = validate(value);
      if (problem === true) return value;
      console.log(`  ${problem}`);
    }
  }

  try {
    console.log(`\n${bold('Nouvelle démo pour le lab Absolu')}\n`);

    const slug =
      positionals[0] ??
      (await ask('Slug (nom npm, donne l’URL /<slug>/)', {
        validate: (v) =>
          (v ? SLUG.test(v) : false) ||
          'Le slug est requis : minuscules, chiffres et tirets, sans tiret initial.',
      }));
    if (!SLUG.test(slug)) throw new Error(`Slug invalide « ${slug} » : minuscules, chiffres et tirets.`);

    const title = values.title ?? (await ask('Titre', { fallback: 'Ma démo' }));

    const description =
      values.description ??
      (await ask('Description', { fallback: `${title} — démonstration technique du lab Absolu.` }));

    const dir = path.resolve(values.dir ?? slug);
    // Chemin court quand le dossier est sous le cwd, absolu sinon.
    const rel = path.relative(process.cwd(), dir);
    const relative = rel && !rel.startsWith('..') ? rel : dir;

    const { gitInitialized } = await scaffold({
      dir,
      slug,
      title,
      description,
      git: values.git,
    });

    console.log(`
${green('✔')} Projet ${bold(slug)} créé dans ${bold(relative)} ${gitInitialized ? ' (dépôt git initialisé)' : ''}.

${bold('Pour démarrer')}
  cd ${relative}
  npm install
  npm run dev            ${dim(`→ http://localhost:5173/${slug}/`)}

${bold('Pour publier')} ${dim('(détail dans le README du projet)')}
  gh repo create agence-absolu/lab-${slug} --public --source=. --push
  ${dim(`public : les secrets SSH de l’organisation ne sont partagés qu’avec les dépôts publics`)}
  ${dim(`→ https://lab.agence-absolu.com/${slug}/ après le premier push sur main`)}
`);
  } finally {
    rl?.close();
  }
}
