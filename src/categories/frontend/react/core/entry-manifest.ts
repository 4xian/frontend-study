import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const reactCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'vite-react-project-setup',
    meta: getContentMeta('src/categories/frontend/react/core/learn/vite-react-project-setup.md'),
    load: async () => (await import('./learn/vite-react-project-setup.md?content-entry')).default,
  },
  {
    slug: 'tsx-markup-syntax',
    meta: getContentMeta('src/categories/frontend/react/core/learn/tsx-markup-syntax.md'),
    load: async () => (await import('./learn/tsx-markup-syntax.md?content-entry')).default,
  },
  {
    slug: 'tsx-expressions-and-attributes',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/tsx-expressions-and-attributes.md',
    ),
    load: async () =>
      (await import('./learn/tsx-expressions-and-attributes.md?content-entry')).default,
  },
  {
    slug: 'function-components',
    meta: getContentMeta('src/categories/frontend/react/core/learn/function-components.md'),
    load: async () => (await import('./learn/function-components.md?content-entry')).default,
  },
  {
    slug: 'module-boundaries-and-component-tree',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/module-boundaries-and-component-tree.md',
    ),
    load: async () =>
      (await import('./learn/module-boundaries-and-component-tree.md?content-entry')).default,
  },
  {
    slug: 'jsx-runtime-and-react-element',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/jsx-runtime-and-react-element.md',
    ),
    load: async () =>
      (await import('./learn/jsx-runtime-and-react-element.md?content-entry')).default,
  },
  {
    slug: 'react-root-lifecycle',
    meta: getContentMeta('src/categories/frontend/react/core/learn/react-root-lifecycle.md'),
    load: async () => (await import('./learn/react-root-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: getContentMeta('src/categories/frontend/react/core/learn/props.md'),
    load: async () => (await import('./learn/props.md?content-entry')).default,
  },
  {
    slug: 'children-and-composition',
    meta: getContentMeta('src/categories/frontend/react/core/learn/children-and-composition.md'),
    load: async () => (await import('./learn/children-and-composition.md?content-entry')).default,
  },
  {
    slug: 'conditional-rendering',
    meta: getContentMeta('src/categories/frontend/react/core/learn/conditional-rendering.md'),
    load: async () => (await import('./learn/conditional-rendering.md?content-entry')).default,
  },
  {
    slug: 'list-rendering-and-key',
    meta: getContentMeta('src/categories/frontend/react/core/learn/list-rendering-and-key.md'),
    load: async () => (await import('./learn/list-rendering-and-key.md?content-entry')).default,
  },
  {
    slug: 'lab-static-course-catalog',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-static-course-catalog.md'),
    load: async () => (await import('./learn/lab-static-course-catalog.md?content-entry')).default,
  },
  {
    slug: 'component-purity',
    meta: getContentMeta('src/categories/frontend/react/core/learn/component-purity.md'),
    load: async () => (await import('./learn/component-purity.md?content-entry')).default,
  },
  {
    slug: 'event-handling',
    meta: getContentMeta('src/categories/frontend/react/core/learn/event-handling.md'),
    load: async () => (await import('./learn/event-handling.md?content-entry')).default,
  },
  {
    slug: 'rules-of-hooks',
    meta: getContentMeta('src/categories/frontend/react/core/learn/rules-of-hooks.md'),
    load: async () => (await import('./learn/rules-of-hooks.md?content-entry')).default,
  },
  {
    slug: 'use-state',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-state.md'),
    load: async () => (await import('./learn/use-state.md?content-entry')).default,
  },
  {
    slug: 'render-commit-and-state-snapshot',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/render-commit-and-state-snapshot.md',
    ),
    load: async () =>
      (await import('./learn/render-commit-and-state-snapshot.md?content-entry')).default,
  },
  {
    slug: 'immutable-state-updates',
    meta: getContentMeta('src/categories/frontend/react/core/learn/immutable-state-updates.md'),
    load: async () => (await import('./learn/immutable-state-updates.md?content-entry')).default,
  },
  {
    slug: 'lab-task-editor',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-task-editor.md'),
    load: async () => (await import('./learn/lab-task-editor.md?content-entry')).default,
  },
  {
    slug: 'dom-props',
    meta: getContentMeta('src/categories/frontend/react/core/learn/dom-props.md'),
    load: async () => (await import('./learn/dom-props.md?content-entry')).default,
  },
  {
    slug: 'use-id-accessible-links',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-id-accessible-links.md'),
    load: async () => (await import('./learn/use-id-accessible-links.md?content-entry')).default,
  },
  {
    slug: 'react-forms',
    meta: getContentMeta('src/categories/frontend/react/core/learn/react-forms.md'),
    load: async () => (await import('./learn/react-forms.md?content-entry')).default,
  },
  {
    slug: 'state-ownership-and-thinking-in-react',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/state-ownership-and-thinking-in-react.md',
    ),
    load: async () =>
      (await import('./learn/state-ownership-and-thinking-in-react.md?content-entry')).default,
  },
  {
    slug: 'lab-course-registration',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-course-registration.md'),
    load: async () => (await import('./learn/lab-course-registration.md?content-entry')).default,
  },
  {
    slug: 'state-structure',
    meta: getContentMeta('src/categories/frontend/react/core/learn/state-structure.md'),
    load: async () => (await import('./learn/state-structure.md?content-entry')).default,
  },
  {
    slug: 'lifting-state-up',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lifting-state-up.md'),
    load: async () => (await import('./learn/lifting-state-up.md?content-entry')).default,
  },
  {
    slug: 'state-preservation-and-reset',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/state-preservation-and-reset.md',
    ),
    load: async () =>
      (await import('./learn/state-preservation-and-reset.md?content-entry')).default,
  },
  {
    slug: 'lab-multi-step-editor',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-multi-step-editor.md'),
    load: async () => (await import('./learn/lab-multi-step-editor.md?content-entry')).default,
  },
  {
    slug: 'use-reducer',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-reducer.md'),
    load: async () => (await import('./learn/use-reducer.md?content-entry')).default,
  },
  {
    slug: 'context-providing-and-reading',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/context-providing-and-reading.md',
    ),
    load: async () =>
      (await import('./learn/context-providing-and-reading.md?content-entry')).default,
  },
  {
    slug: 'reducer-context-composition',
    meta: getContentMeta('src/categories/frontend/react/core/learn/reducer-context-composition.md'),
    load: async () =>
      (await import('./learn/reducer-context-composition.md?content-entry')).default,
  },
  {
    slug: 'state-sharing-boundary',
    meta: getContentMeta('src/categories/frontend/react/core/learn/state-sharing-boundary.md'),
    load: async () => (await import('./learn/state-sharing-boundary.md?content-entry')).default,
  },
  {
    slug: 'lab-shared-task-workspace',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-shared-task-workspace.md'),
    load: async () => (await import('./learn/lab-shared-task-workspace.md?content-entry')).default,
  },
  {
    slug: 'use-ref',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-ref.md'),
    load: async () => (await import('./learn/use-ref.md?content-entry')).default,
  },
  {
    slug: 'dom-refs',
    meta: getContentMeta('src/categories/frontend/react/core/learn/dom-refs.md'),
    load: async () => (await import('./learn/dom-refs.md?content-entry')).default,
  },
  {
    slug: 'ref-as-prop',
    meta: getContentMeta('src/categories/frontend/react/core/learn/ref-as-prop.md'),
    load: async () => (await import('./learn/ref-as-prop.md?content-entry')).default,
  },
  {
    slug: 'portal-tree-and-dom-placement',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/portal-tree-and-dom-placement.md',
    ),
    load: async () =>
      (await import('./learn/portal-tree-and-dom-placement.md?content-entry')).default,
  },
  {
    slug: 'lab-accessible-dialog',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-accessible-dialog.md'),
    load: async () => (await import('./learn/lab-accessible-dialog.md?content-entry')).default,
  },
  {
    slug: 'use-imperative-handle',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-imperative-handle.md'),
    load: async () => (await import('./learn/use-imperative-handle.md?content-entry')).default,
  },
  {
    slug: 'use-effect',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-effect.md'),
    load: async () => (await import('./learn/use-effect.md?content-entry')).default,
  },
  {
    slug: 'unnecessary-effects',
    meta: getContentMeta('src/categories/frontend/react/core/learn/unnecessary-effects.md'),
    load: async () => (await import('./learn/unnecessary-effects.md?content-entry')).default,
  },
  {
    slug: 'effect-dependencies',
    meta: getContentMeta('src/categories/frontend/react/core/learn/effect-dependencies.md'),
    load: async () => (await import('./learn/effect-dependencies.md?content-entry')).default,
  },
  {
    slug: 'effect-events',
    meta: getContentMeta('src/categories/frontend/react/core/learn/effect-events.md'),
    load: async () => (await import('./learn/effect-events.md?content-entry')).default,
  },
  {
    slug: 'custom-hooks',
    meta: getContentMeta('src/categories/frontend/react/core/learn/custom-hooks.md'),
    load: async () => (await import('./learn/custom-hooks.md?content-entry')).default,
  },
  {
    slug: 'strict-mode-development-checks',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/strict-mode-development-checks.md',
    ),
    load: async () =>
      (await import('./learn/strict-mode-development-checks.md?content-entry')).default,
  },
  {
    slug: 'lab-synchronized-chat-room',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-synchronized-chat-room.md'),
    load: async () => (await import('./learn/lab-synchronized-chat-room.md?content-entry')).default,
  },
  {
    slug: 'profiler-render-measurement',
    meta: getContentMeta('src/categories/frontend/react/core/learn/profiler-render-measurement.md'),
    load: async () =>
      (await import('./learn/profiler-render-measurement.md?content-entry')).default,
  },
  {
    slug: 'use-memo-value-caching',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-memo-value-caching.md'),
    load: async () => (await import('./learn/use-memo-value-caching.md?content-entry')).default,
  },
  {
    slug: 'memo-component-bailout',
    meta: getContentMeta('src/categories/frontend/react/core/learn/memo-component-bailout.md'),
    load: async () => (await import('./learn/memo-component-bailout.md?content-entry')).default,
  },
  {
    slug: 'use-callback-function-identity',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-callback-function-identity.md',
    ),
    load: async () =>
      (await import('./learn/use-callback-function-identity.md?content-entry')).default,
  },
  {
    slug: 'lab-render-performance',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-render-performance.md'),
    load: async () => (await import('./learn/lab-render-performance.md?content-entry')).default,
  },
  {
    slug: 'use-layout-effect',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-layout-effect.md'),
    load: async () => (await import('./learn/use-layout-effect.md?content-entry')).default,
  },
  {
    slug: 'error-boundary-render-failures',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/error-boundary-render-failures.md',
    ),
    load: async () =>
      (await import('./learn/error-boundary-render-failures.md?content-entry')).default,
  },
  {
    slug: 'lazy-component-code-splitting',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/lazy-component-code-splitting.md',
    ),
    load: async () =>
      (await import('./learn/lazy-component-code-splitting.md?content-entry')).default,
  },
  {
    slug: 'suspense-fallback-boundary',
    meta: getContentMeta('src/categories/frontend/react/core/learn/suspense-fallback-boundary.md'),
    load: async () => (await import('./learn/suspense-fallback-boundary.md?content-entry')).default,
  },
  {
    slug: 'use-resource-reading',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-resource-reading.md'),
    load: async () => (await import('./learn/use-resource-reading.md?content-entry')).default,
  },
  {
    slug: 'lab-lazy-report-viewer',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-lazy-report-viewer.md'),
    load: async () => (await import('./learn/lab-lazy-report-viewer.md?content-entry')).default,
  },
  {
    slug: 'use-transition-pending-action',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-transition-pending-action.md',
    ),
    load: async () =>
      (await import('./learn/use-transition-pending-action.md?content-entry')).default,
  },
  {
    slug: 'use-deferred-value-stale-content',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-deferred-value-stale-content.md',
    ),
    load: async () =>
      (await import('./learn/use-deferred-value-stale-content.md?content-entry')).default,
  },
  {
    slug: 'activity-hidden-state-restoration',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/activity-hidden-state-restoration.md',
    ),
    load: async () =>
      (await import('./learn/activity-hidden-state-restoration.md?content-entry')).default,
  },
  {
    slug: 'lab-concurrent-search-workspace',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/lab-concurrent-search-workspace.md',
    ),
    load: async () =>
      (await import('./learn/lab-concurrent-search-workspace.md?content-entry')).default,
  },
  {
    slug: 'form-action-client-submission',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/form-action-client-submission.md',
    ),
    load: async () =>
      (await import('./learn/form-action-client-submission.md?content-entry')).default,
  },
  {
    slug: 'use-action-state-result-queue',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-action-state-result-queue.md',
    ),
    load: async () =>
      (await import('./learn/use-action-state-result-queue.md?content-entry')).default,
  },
  {
    slug: 'use-optimistic-pending-state',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-optimistic-pending-state.md',
    ),
    load: async () =>
      (await import('./learn/use-optimistic-pending-state.md?content-entry')).default,
  },
  {
    slug: 'lab-action-review-queue',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-action-review-queue.md'),
    load: async () => (await import('./learn/lab-action-review-queue.md?content-entry')).default,
  },
  {
    slug: 'use-sync-external-store-snapshot',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/use-sync-external-store-snapshot.md',
    ),
    load: async () =>
      (await import('./learn/use-sync-external-store-snapshot.md?content-entry')).default,
  },
  {
    slug: 'hydrate-root-markup-identity',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/hydrate-root-markup-identity.md',
    ),
    load: async () =>
      (await import('./learn/hydrate-root-markup-identity.md?content-entry')).default,
  },
  {
    slug: 'flush-sync-dom-commit',
    meta: getContentMeta('src/categories/frontend/react/core/learn/flush-sync-dom-commit.md'),
    load: async () => (await import('./learn/flush-sync-dom-commit.md?content-entry')).default,
  },
  {
    slug: 'document-metadata-hoisting',
    meta: getContentMeta('src/categories/frontend/react/core/learn/document-metadata-hoisting.md'),
    load: async () => (await import('./learn/document-metadata-hoisting.md?content-entry')).default,
  },
  {
    slug: 'declarative-stylesheet-resources',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/declarative-stylesheet-resources.md',
    ),
    load: async () =>
      (await import('./learn/declarative-stylesheet-resources.md?content-entry')).default,
  },
  {
    slug: 'declarative-async-script-resource',
    meta: getContentMeta(
      'src/categories/frontend/react/core/learn/declarative-async-script-resource.md',
    ),
    load: async () =>
      (await import('./learn/declarative-async-script-resource.md?content-entry')).default,
  },
  {
    slug: 'resource-hints',
    meta: getContentMeta('src/categories/frontend/react/core/learn/resource-hints.md'),
    load: async () => (await import('./learn/resource-hints.md?content-entry')).default,
  },
  {
    slug: 'use-insertion-effect',
    meta: getContentMeta('src/categories/frontend/react/core/learn/use-insertion-effect.md'),
    load: async () => (await import('./learn/use-insertion-effect.md?content-entry')).default,
  },
  {
    slug: 'lab-embedded-status-panel',
    meta: getContentMeta('src/categories/frontend/react/core/learn/lab-embedded-status-panel.md'),
    load: async () => (await import('./learn/lab-embedded-status-panel.md?content-entry')).default,
  },
]
