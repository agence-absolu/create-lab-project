// Test de bout en bout : le CLI génère un projet complet, rendu, sans
// placeholder oublié, et refuse les entrées invalides.

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const BIN = path.join(import.meta.dirname, '../bin/create-lab-project.js');

let root;

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'create-lab-project-'));
});

after(() => rm(root, { recursive: true, force: true }));

async function listFiles(dir, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(path.join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out.sort();
}

test('fichiers, rendu et package.json', async () => {
  const dir = path.join(root, 'ma-demo');
  await exec(process.execPath, [BIN, 'ma-demo', '--yes', '--dir', dir, '--no-git']);

  assert.deepEqual(await listFiles(dir), [
    '.github/workflows/deploy.yml',
    '.gitignore',
    'CLAUDE.md',
    'README.md',
    'index.html',
    'package.json',
    'src/main.js',
    'src/style.css',
    'vite.config.js',
  ]);

  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'ma-demo');
  assert.ok(pkg.devDependencies.vite);

  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  assert.match(html, /<title>Ma démo<\/title>/);

  // Aucun {{placeholder}} ne doit subsister ; les ${{ }} de GitHub Actions,
  // eux, ont un espace et ne sont pas concernés.
  for (const file of await listFiles(dir)) {
    const content = await readFile(path.join(dir, file), 'utf8');
    assert.doesNotMatch(content, /\{\{\w+\}\}/, `placeholder oublié dans ${file}`);
  }
});

test('titre et description passés en option, avec git', async () => {
  const dir = path.join(root, 'plate');
  await exec(process.execPath, [
    BIN, 'plate', '--title', 'Démo plate', '-d', 'Une page.', '--dir', dir, '--yes',
  ]);

  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
  assert.equal(pkg.description, 'Une page.');

  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  assert.match(html, /<title>Démo plate<\/title>/);

  const entries = await readdir(dir);
  assert.ok(entries.includes('.git'), 'dépôt git initialisé');
});

test('refuse un slug invalide', async () => {
  await assert.rejects(
    exec(process.execPath, [BIN, 'Ma_Demo', '--yes', '--dir', path.join(root, 'x')]),
    /Slug invalide/
  );
});

test('refuse un dossier non vide', async () => {
  const dir = path.join(root, 'plate'); // créé par le test précédent
  await assert.rejects(exec(process.execPath, [BIN, 'plate', '--yes', '--dir', dir]), /n'est pas vide/);
});
