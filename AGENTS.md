# Repository Guidelines

## Project Structure & Module Organization

Application code lives in `src/`. Route-level views are in `src/pages/`, shared UI in `src/components/`, layouts in `src/layouts/`, and router and Pinia setup in `src/router/` and `src/stores/`. Typed learning records live in `src/content/entries/<purpose>/<ecosystem>/<module>/`, with runnable examples under `src/content/demos/<ecosystem>/<module>/`; keep matching topics in the same category directory. Global styles belong in `src/styles/`, while static files copied unchanged are stored in `public/`. Planning and authoring references are under `docs/`. Generated `dist/` and installed `node_modules/` must not be edited or committed.

## Build, Test, and Development Commands

- `npm install`: install the locked dependencies; use the Node version declared in `package.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run type-check`: validate TypeScript and Vue SFC types with `vue-tsc`.
- `npm run lint`: run Oxlint correctness checks.
- `npm run format:check`: verify Prettier formatting without changing files.
- `npm run build`: type-check and create a production build in `dist/`.
- `npm run preview`: serve the production build locally for final inspection.

## Coding Style & Naming Conventions

Use TypeScript and Vue Single-File Components with `<script setup lang="ts">`. Prettier enforces two-space indentation, no semicolons, single quotes, a 100-character line width, and trailing commas. Run `npm run format` only when intentional repository-wide formatting is appropriate. Name Vue components in PascalCase (`SearchDialog.vue`), variables and functions in camelCase, and content topic files in kebab-case (`watch-effect.ts`). Prefer the `@/` alias for imports from `src/`. Keep component styles scoped unless they define shared tokens or base behavior.

## Testing Guidelines

No automated test runner or coverage threshold is currently configured. Treat `npm run type-check`, `npm run lint`, and `npm run format:check` as the minimum checks for every change. For UI or content changes, also exercise the affected route and interactive demo through `npm run dev`. If tests are introduced, colocate focused `*.spec.ts` files with the code they cover and add the corresponding npm script.

## Commit & Pull Request Guidelines

This checkout contains no Git history, so no project-specific commit convention can be inferred. Use short, imperative commit subjects such as `Add watch flush timing demo`, and keep unrelated changes separate. Pull requests should explain the intent, list verification commands, link relevant issues or planning documents, and include before/after screenshots for visible UI changes. Never include generated output, local environment files, or credentials.
