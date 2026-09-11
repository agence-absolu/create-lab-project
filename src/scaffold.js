// Génération d'un projet à partir du gabarit `template/`.
//
// Les fichiers sont copiés dans le dossier cible et rendus : chaque `{{clé}}`
// est remplacé par la valeur correspondante. package.json est écrit ici plutôt
// que rendu : JSON.stringify garantit un fichier valide.

import { execFile } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const TEMPLATE_DIR = path.join(import.meta.dirname, '../template');

// Format imposé par le hub : c'est le slug qui donne l'URL (lab.agence-absolu.com/<slug>/).
export const SLUG = /^[a-z0-9][a-z0-9-]*$/;

// Version validée sur la démo de référence (lab-drill).
const VITE = '^7.1.0';

// npm retire tout `.gitignore` d'un paquet publié : le gabarit le porte sous un
// autre nom, restitué à la copie.
const RENAMES = { _gitignore: '.gitignore' };

function render(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in vars)) throw new Error(`Variable de gabarit inconnue : ${key}`);
    return vars[key];
  });
}

async function copyTree(from, to, vars) {
  await mkdir(to, { recursive: true });

  for (const entry of await readdir(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, RENAMES[entry.name] ?? entry.name);

    if (entry.isDirectory()) {
      await copyTree(source, target, vars);
      continue;
    }

    const content = await readFile(source, 'utf8');
    await writeFile(target, render(content, vars));
  }
}

async function isEmptyDir(dir) {
  const entries = await readdir(dir).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  // Un .git ou un .idea déjà présents n'empêchent rien.
  return entries.every((name) => name.startsWith('.'));
}

export async function scaffold({ dir, slug, title, description, git = true }) {
  if (!SLUG.test(slug)) {
    throw new Error(`Slug invalide « ${slug} » : minuscules, chiffres et tirets, sans tiret initial.`);
  }
  if (!(await isEmptyDir(dir))) {
    throw new Error(`Le dossier ${dir} existe et n'est pas vide.`);
  }

  const vars = {
    slug,
    title,
    description,
    year: String(new Date().getFullYear()),
  };

  await copyTree(TEMPLATE_DIR, dir, vars);

  const pkg = {
    name: slug,
    private: true,
    version: '0.0.1',
    description,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    devDependencies: { vite: VITE },
  };
  await writeFile(path.join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

  let gitInitialized = false;
  if (git) {
    // Sans commit : le premier reste à la main de l'auteur.
    gitInitialized = await exec('git', ['init', '-b', 'main', dir])
      .then(() => true)
      .catch(() => false);
  }

  return { dir, gitInitialized };
}
