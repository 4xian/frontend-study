import type { CategoryContentEntryManifest } from '@/common/catalog'
import { getContentMeta } from 'virtual:content-catalog-meta'

export const vueCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'async-components-suspense',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/async-components-suspense.md'),
    load: async () => (await import('./learn/async-components-suspense.md?content-entry')).default,
  },
  {
    slug: 'attrs',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/attrs.md'),
    load: async () => (await import('./learn/attrs.md?content-entry')).default,
  },
  {
    slug: 'component-basics',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/component-basics.md'),
    load: async () => (await import('./learn/component-basics.md?content-entry')).default,
  },
  {
    slug: 'component-v-model',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/component-v-model.md'),
    load: async () => (await import('./learn/component-v-model.md?content-entry')).default,
  },
  {
    slug: 'composables',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/composables.md'),
    load: async () => (await import('./learn/composables.md?content-entry')).default,
  },
  {
    slug: 'computed-properties',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/computed-properties.md'),
    load: async () => (await import('./learn/computed-properties.md?content-entry')).default,
  },
  {
    slug: 'conditional-list-rendering',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/conditional-list-rendering.md'),
    load: async () => (await import('./learn/conditional-list-rendering.md?content-entry')).default,
  },
  {
    slug: 'custom-directives',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/custom-directives.md'),
    load: async () => (await import('./learn/custom-directives.md?content-entry')).default,
  },
  {
    slug: 'custom-ref-triggering',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/custom-ref-triggering.md'),
    load: async () => (await import('./learn/custom-ref-triggering.md?content-entry')).default,
  },
  {
    slug: 'dynamic-components-keep-alive',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/dynamic-components-keep-alive.md'),
    load: async () =>
      (await import('./learn/dynamic-components-keep-alive.md?content-entry')).default,
  },
  {
    slug: 'effect-scope',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/effect-scope.md'),
    load: async () => (await import('./learn/effect-scope.md?content-entry')).default,
  },
  {
    slug: 'emits',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/emits.md'),
    load: async () => (await import('./learn/emits.md?content-entry')).default,
  },
  {
    slug: 'error-handling',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/error-handling.md'),
    load: async () => (await import('./learn/error-handling.md?content-entry')).default,
  },
  {
    slug: 'event-handling',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/event-handling.md'),
    load: async () => (await import('./learn/event-handling.md?content-entry')).default,
  },
  {
    slug: 'form-bindings',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/form-bindings.md'),
    load: async () => (await import('./learn/form-bindings.md?content-entry')).default,
  },
  {
    slug: 'lifecycle-update-timing',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/lifecycle-update-timing.md'),
    load: async () => (await import('./learn/lifecycle-update-timing.md?content-entry')).default,
  },
  {
    slug: 'performance',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/performance.md'),
    load: async () => (await import('./learn/performance.md?content-entry')).default,
  },
  {
    slug: 'plugins',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/plugins.md'),
    load: async () => (await import('./learn/plugins.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/props.md'),
    load: async () => (await import('./learn/props.md?content-entry')).default,
  },
  {
    slug: 'provide-inject',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/provide-inject.md'),
    load: async () => (await import('./learn/provide-inject.md?content-entry')).default,
  },
  {
    slug: 'reactive-state',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/reactive-state.md'),
    load: async () => (await import('./learn/reactive-state.md?content-entry')).default,
  },
  {
    slug: 'render-functions-vnodes',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/render-functions-vnodes.md'),
    load: async () => (await import('./learn/render-functions-vnodes.md?content-entry')).default,
  },
  {
    slug: 'sfc-basics',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/sfc-basics.md'),
    load: async () => (await import('./learn/sfc-basics.md?content-entry')).default,
  },
  {
    slug: 'shallow-reactivity-raw-boundaries',
    meta: getContentMeta(
      'src/categories/frontend/vue/core/learn/shallow-reactivity-raw-boundaries.md',
    ),
    load: async () =>
      (await import('./learn/shallow-reactivity-raw-boundaries.md?content-entry')).default,
  },
  {
    slug: 'slots',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/slots.md'),
    load: async () => (await import('./learn/slots.md?content-entry')).default,
  },
  {
    slug: 'ssr-hydration',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/ssr-hydration.md'),
    load: async () => (await import('./learn/ssr-hydration.md?content-entry')).default,
  },
  {
    slug: 'teleport',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/teleport.md'),
    load: async () => (await import('./learn/teleport.md?content-entry')).default,
  },
  {
    slug: 'template-refs',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/template-refs.md'),
    load: async () => (await import('./learn/template-refs.md?content-entry')).default,
  },
  {
    slug: 'template-syntax',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/template-syntax.md'),
    load: async () => (await import('./learn/template-syntax.md?content-entry')).default,
  },
  {
    slug: 'transitions',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/transitions.md'),
    load: async () => (await import('./learn/transitions.md?content-entry')).default,
  },
  {
    slug: 'watchers',
    meta: getContentMeta('src/categories/frontend/vue/core/learn/watchers.md'),
    load: async () => (await import('./learn/watchers.md?content-entry')).default,
  },
  {
    slug: 'application-configuration',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/application-configuration.md'),
    load: async () =>
      (await import('./reference/application-configuration.md?content-entry')).default,
  },
  {
    slug: 'attrs',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/attrs.md'),
    load: async () => (await import('./reference/attrs.md?content-entry')).default,
  },
  {
    slug: 'compile-time-flags',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/compile-time-flags.md'),
    load: async () => (await import('./reference/compile-time-flags.md?content-entry')).default,
  },
  {
    slug: 'component-instance',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/component-instance.md'),
    load: async () => (await import('./reference/component-instance.md?content-entry')).default,
  },
  {
    slug: 'composables',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/composables.md'),
    load: async () => (await import('./reference/composables.md?content-entry')).default,
  },
  {
    slug: 'composition-options',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/composition-options.md'),
    load: async () => (await import('./reference/composition-options.md?content-entry')).default,
  },
  {
    slug: 'computed',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/computed.md'),
    load: async () => (await import('./reference/computed.md?content-entry')).default,
  },
  {
    slug: 'create-app',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/create-app.md'),
    load: async () => (await import('./reference/create-app.md?content-entry')).default,
  },
  {
    slug: 'create-ssr-app',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/create-ssr-app.md'),
    load: async () => (await import('./reference/create-ssr-app.md?content-entry')).default,
  },
  {
    slug: 'css-features',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/css-features.md'),
    load: async () => (await import('./reference/css-features.md?content-entry')).default,
  },
  {
    slug: 'custom-directives',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/custom-directives.md'),
    load: async () => (await import('./reference/custom-directives.md?content-entry')).default,
  },
  {
    slug: 'custom-elements',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/custom-elements.md'),
    load: async () => (await import('./reference/custom-elements.md?content-entry')).default,
  },
  {
    slug: 'custom-ref',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/custom-ref.md'),
    load: async () => (await import('./reference/custom-ref.md?content-entry')).default,
  },
  {
    slug: 'custom-renderer',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/custom-renderer.md'),
    load: async () => (await import('./reference/custom-renderer.md?content-entry')).default,
  },
  {
    slug: 'define-async-component',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/define-async-component.md'),
    load: async () => (await import('./reference/define-async-component.md?content-entry')).default,
  },
  {
    slug: 'define-component',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/define-component.md'),
    load: async () => (await import('./reference/define-component.md?content-entry')).default,
  },
  {
    slug: 'define-model',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/define-model.md'),
    load: async () => (await import('./reference/define-model.md?content-entry')).default,
  },
  {
    slug: 'directives',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/directives.md'),
    load: async () => (await import('./reference/directives.md?content-entry')).default,
  },
  {
    slug: 'effect-scope',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/effect-scope.md'),
    load: async () => (await import('./reference/effect-scope.md?content-entry')).default,
  },
  {
    slug: 'emits',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/emits.md'),
    load: async () => (await import('./reference/emits.md?content-entry')).default,
  },
  {
    slug: 'keep-alive',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/keep-alive.md'),
    load: async () => (await import('./reference/keep-alive.md?content-entry')).default,
  },
  {
    slug: 'lifecycle-options',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/lifecycle-options.md'),
    load: async () => (await import('./reference/lifecycle-options.md?content-entry')).default,
  },
  {
    slug: 'lifecycle',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/lifecycle.md'),
    load: async () => (await import('./reference/lifecycle.md?content-entry')).default,
  },
  {
    slug: 'misc-options',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/misc-options.md'),
    load: async () => (await import('./reference/misc-options.md?content-entry')).default,
  },
  {
    slug: 'next-tick',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/next-tick.md'),
    load: async () => (await import('./reference/next-tick.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/props.md'),
    load: async () => (await import('./reference/props.md?content-entry')).default,
  },
  {
    slug: 'provide-inject',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/provide-inject.md'),
    load: async () => (await import('./reference/provide-inject.md?content-entry')).default,
  },
  {
    slug: 'reactive',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/reactive.md'),
    load: async () => (await import('./reference/reactive.md?content-entry')).default,
  },
  {
    slug: 'readonly',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/readonly.md'),
    load: async () => (await import('./reference/readonly.md?content-entry')).default,
  },
  {
    slug: 'ref',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/ref.md'),
    load: async () => (await import('./reference/ref.md?content-entry')).default,
  },
  {
    slug: 'render-function',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/render-function.md'),
    load: async () => (await import('./reference/render-function.md?content-entry')).default,
  },
  {
    slug: 'rendering-options',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/rendering-options.md'),
    load: async () => (await import('./reference/rendering-options.md?content-entry')).default,
  },
  {
    slug: 'script-setup',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/script-setup.md'),
    load: async () => (await import('./reference/script-setup.md?content-entry')).default,
  },
  {
    slug: 'server-rendering',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/server-rendering.md'),
    load: async () => (await import('./reference/server-rendering.md?content-entry')).default,
  },
  {
    slug: 'shallow',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/shallow.md'),
    load: async () => (await import('./reference/shallow.md?content-entry')).default,
  },
  {
    slug: 'slots',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/slots.md'),
    load: async () => (await import('./reference/slots.md?content-entry')).default,
  },
  {
    slug: 'state-options',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/state-options.md'),
    load: async () => (await import('./reference/state-options.md?content-entry')).default,
  },
  {
    slug: 'suspense',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/suspense.md'),
    load: async () => (await import('./reference/suspense.md?content-entry')).default,
  },
  {
    slug: 'syntax',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/syntax.md'),
    load: async () => (await import('./reference/syntax.md?content-entry')).default,
  },
  {
    slug: 'teleport',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/teleport.md'),
    load: async () => (await import('./reference/teleport.md?content-entry')).default,
  },
  {
    slug: 'template-primitives',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/template-primitives.md'),
    load: async () => (await import('./reference/template-primitives.md?content-entry')).default,
  },
  {
    slug: 'template-refs',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/template-refs.md'),
    load: async () => (await import('./reference/template-refs.md?content-entry')).default,
  },
  {
    slug: 'to-ref',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/to-ref.md'),
    load: async () => (await import('./reference/to-ref.md?content-entry')).default,
  },
  {
    slug: 'transition',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/transition.md'),
    load: async () => (await import('./reference/transition.md?content-entry')).default,
  },
  {
    slug: 'use-id',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/use-id.md'),
    load: async () => (await import('./reference/use-id.md?content-entry')).default,
  },
  {
    slug: 'utility-types',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/utility-types.md'),
    load: async () => (await import('./reference/utility-types.md?content-entry')).default,
  },
  {
    slug: 'utils',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/utils.md'),
    load: async () => (await import('./reference/utils.md?content-entry')).default,
  },
  {
    slug: 'watch-effect',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/watch-effect.md'),
    load: async () => (await import('./reference/watch-effect.md?content-entry')).default,
  },
  {
    slug: 'watch-post-sync',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/watch-post-sync.md'),
    load: async () => (await import('./reference/watch-post-sync.md?content-entry')).default,
  },
  {
    slug: 'watch',
    meta: getContentMeta('src/categories/frontend/vue/core/reference/watch.md'),
    load: async () => (await import('./reference/watch.md?content-entry')).default,
  },
]
