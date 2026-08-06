# Repository Guidelines

## Project Structure & Module Organization

Application assembly lives in `src/app/`: route-level views are in `pages/`, layouts in `layouts/`, router setup in
`router/`, Pinia setup in `stores/`, and global styles in `styles/`. Shared catalog, Markdown, content rendering,
progress, and UI capabilities live in `src/common/`. Technology-owned manifests, Markdown entries, and runnable
demos live in `src/categories/<domain>/<technology>/<module>/`. Keep lesson and Reference Markdown in
the module's `learn/` and `reference/` directories and real demo sources in `demos/`. Static files copied unchanged
belong in `public/`; planning and authoring references belong in `docs/`. Do not recreate `src/content/` or edit
generated `dist/`, installed `node_modules/`, or browser automation output. Vitest and Playwright configuration stays
at the repository root; `tests/unit/` and `tests/e2e/` are reserved empty directories.

## Build, Test, and Development Commands

- `npm install`: install locked dependencies with a Node version allowed by `package.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run type-check`: validate TypeScript and Vue SFC types with `vue-tsc`.
- `npm run test:unit`: run Vitest; an empty test directory is valid.
- `npm run test:e2e`: run Playwright; an empty test directory is valid.
- `npm run lint`: run Oxlint correctness checks.
- `npm run format:check`: verify Prettier formatting without changing files.
- `npm run build`: type-check and create a production build in `dist/`.

## Coding Style & Naming Conventions

Use TypeScript and Vue Single-File Components with `<script setup lang="ts">`. Prettier enforces two-space
indentation, no semicolons, single quotes, a 100-character line width, and trailing commas. Name Vue components in
PascalCase (`SearchDialog.vue`), variables and functions in camelCase, and Markdown topics in kebab-case
(`watch-effect.md`). Prefer the `@/` alias for imports from `src/`. Keep component styles scoped unless they define
shared tokens or base behavior. Do not use CSS Grid or the `gap` property; use Flexbox, margins, and normal flow.

## Content & Routing Conventions

The runtime hierarchy is `Domain -> Technology -> Module`. Lesson and Reference detail URLs use
`/<domain>/<technology>/<module>/<learn|reference>/<slug>`; learning stages remain metadata and never enter URLs.
Routes are generated from explicit manifests, not folder names, and old URLs are not redirected. Course and
Reference bodies use validated Markdown. Demos use explicit module manifests and must display the same source that
runs. Shared capabilities belong in `common`; technology-specific knowledge stays in its category module.

## Verification Guidelines

Keep the root Vitest and Playwright configuration, dependencies, and scripts, but do not add persistent test cases or
fixtures to the repository. When a focused automated check is needed, create the minimum verification asset in a
`mktemp` directory under `/tmp`, run it against the current snapshot, and delete that directory before finishing.
Every code change must pass type-check, lint, and formatting; code, configuration, route, UI, content, or Demo
changes also require the relevant build and browser verification. Verify desktop and 390px layouts for navigation
changes.

## Commit & Pull Request Guidelines

Do not commit, push, or create a pull request unless the user explicitly asks. Preserve unrelated staged, unstaged,
and untracked work. Never include generated output, local environment files, credentials, or unrelated cleanup.
