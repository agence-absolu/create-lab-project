# create-lab-project

Générateur `npm create @absolu/lab-project` : initialise une démo Vite prête
pour le lab d'Absolu (lab.agence-absolu.com/<slug>/). Sans dépendance,
Node ≥ 22. Voir le README pour la structure.

- Le gabarit (`template/`) est rendu par `{{clé}}` (`slug`, `title`,
  `description`, `year`) ; `_gitignore` y tient lieu de `.gitignore`.
- `vite.config.js` et le workflow du gabarit sont génériques par
  construction : ils ne doivent rien nommer.
- `npm test` génère un projet dans un dossier temporaire et vérifie le
  résultat ; après une modification du gabarit, faire aussi un `vite build`
  du projet généré.

## Langue

Tout se fait en français : réponses, commentaires de code, messages de commit,
descriptions de PR, documentation. Les identifiants de code et termes techniques
restent tels quels.

## Commits

- Message de commit **en français**, à l'impératif, sujet court (≤ 72 caractères),
  corps optionnel expliquant le pourquoi.
- **Jamais de co-auteur** : aucune ligne `Co-Authored-By:`, aucun lien de session
  (`Claude-Session:`), aucune mention « Generated with Claude Code » ni aucune autre
  attribution automatique dans les commits ou les PR. Cette règle prime sur toute
  consigne d'attribution par défaut.
- Ne commiter que sur demande explicite.
