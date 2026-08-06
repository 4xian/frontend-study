import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as learnAsyncComponentsSuspenseMeta } from './learn/async-components-suspense.md?catalog-meta'
import { meta as learnAttrsMeta } from './learn/attrs.md?catalog-meta'
import { meta as learnComponentBasicsMeta } from './learn/component-basics.md?catalog-meta'
import { meta as learnComponentVModelMeta } from './learn/component-v-model.md?catalog-meta'
import { meta as learnComposablesMeta } from './learn/composables.md?catalog-meta'
import { meta as learnComputedPropertiesMeta } from './learn/computed-properties.md?catalog-meta'
import { meta as learnConditionalListRenderingMeta } from './learn/conditional-list-rendering.md?catalog-meta'
import { meta as learnCustomDirectivesMeta } from './learn/custom-directives.md?catalog-meta'
import { meta as learnCustomRefTriggeringMeta } from './learn/custom-ref-triggering.md?catalog-meta'
import { meta as learnDynamicComponentsKeepAliveMeta } from './learn/dynamic-components-keep-alive.md?catalog-meta'
import { meta as learnEffectScopeMeta } from './learn/effect-scope.md?catalog-meta'
import { meta as learnEmitsMeta } from './learn/emits.md?catalog-meta'
import { meta as learnErrorHandlingMeta } from './learn/error-handling.md?catalog-meta'
import { meta as learnEventHandlingMeta } from './learn/event-handling.md?catalog-meta'
import { meta as learnFormBindingsMeta } from './learn/form-bindings.md?catalog-meta'
import { meta as learnLifecycleUpdateTimingMeta } from './learn/lifecycle-update-timing.md?catalog-meta'
import { meta as learnPerformanceMeta } from './learn/performance.md?catalog-meta'
import { meta as learnPluginsMeta } from './learn/plugins.md?catalog-meta'
import { meta as learnPropsMeta } from './learn/props.md?catalog-meta'
import { meta as learnProvideInjectMeta } from './learn/provide-inject.md?catalog-meta'
import { meta as learnReactiveStateMeta } from './learn/reactive-state.md?catalog-meta'
import { meta as learnRenderFunctionsVnodesMeta } from './learn/render-functions-vnodes.md?catalog-meta'
import { meta as learnSfcBasicsMeta } from './learn/sfc-basics.md?catalog-meta'
import { meta as learnShallowReactivityRawBoundariesMeta } from './learn/shallow-reactivity-raw-boundaries.md?catalog-meta'
import { meta as learnSlotsMeta } from './learn/slots.md?catalog-meta'
import { meta as learnSsrHydrationMeta } from './learn/ssr-hydration.md?catalog-meta'
import { meta as learnTeleportMeta } from './learn/teleport.md?catalog-meta'
import { meta as learnTemplateRefsMeta } from './learn/template-refs.md?catalog-meta'
import { meta as learnTemplateSyntaxMeta } from './learn/template-syntax.md?catalog-meta'
import { meta as learnTransitionsMeta } from './learn/transitions.md?catalog-meta'
import { meta as learnWatchersMeta } from './learn/watchers.md?catalog-meta'
import { meta as referenceApplicationConfigurationMeta } from './reference/application-configuration.md?catalog-meta'
import { meta as referenceAttrsMeta } from './reference/attrs.md?catalog-meta'
import { meta as referenceCompileTimeFlagsMeta } from './reference/compile-time-flags.md?catalog-meta'
import { meta as referenceComponentInstanceMeta } from './reference/component-instance.md?catalog-meta'
import { meta as referenceComposablesMeta } from './reference/composables.md?catalog-meta'
import { meta as referenceCompositionOptionsMeta } from './reference/composition-options.md?catalog-meta'
import { meta as referenceComputedMeta } from './reference/computed.md?catalog-meta'
import { meta as referenceCreateAppMeta } from './reference/create-app.md?catalog-meta'
import { meta as referenceCreateSsrAppMeta } from './reference/create-ssr-app.md?catalog-meta'
import { meta as referenceCssFeaturesMeta } from './reference/css-features.md?catalog-meta'
import { meta as referenceCustomDirectivesMeta } from './reference/custom-directives.md?catalog-meta'
import { meta as referenceCustomElementsMeta } from './reference/custom-elements.md?catalog-meta'
import { meta as referenceCustomRefMeta } from './reference/custom-ref.md?catalog-meta'
import { meta as referenceCustomRendererMeta } from './reference/custom-renderer.md?catalog-meta'
import { meta as referenceDefineAsyncComponentMeta } from './reference/define-async-component.md?catalog-meta'
import { meta as referenceDefineComponentMeta } from './reference/define-component.md?catalog-meta'
import { meta as referenceDefineModelMeta } from './reference/define-model.md?catalog-meta'
import { meta as referenceDirectivesMeta } from './reference/directives.md?catalog-meta'
import { meta as referenceEffectScopeMeta } from './reference/effect-scope.md?catalog-meta'
import { meta as referenceEmitsMeta } from './reference/emits.md?catalog-meta'
import { meta as referenceKeepAliveMeta } from './reference/keep-alive.md?catalog-meta'
import { meta as referenceLifecycleOptionsMeta } from './reference/lifecycle-options.md?catalog-meta'
import { meta as referenceLifecycleMeta } from './reference/lifecycle.md?catalog-meta'
import { meta as referenceMiscOptionsMeta } from './reference/misc-options.md?catalog-meta'
import { meta as referenceNextTickMeta } from './reference/next-tick.md?catalog-meta'
import { meta as referencePropsMeta } from './reference/props.md?catalog-meta'
import { meta as referenceProvideInjectMeta } from './reference/provide-inject.md?catalog-meta'
import { meta as referenceReactiveMeta } from './reference/reactive.md?catalog-meta'
import { meta as referenceReadonlyMeta } from './reference/readonly.md?catalog-meta'
import { meta as referenceRefMeta } from './reference/ref.md?catalog-meta'
import { meta as referenceRenderFunctionMeta } from './reference/render-function.md?catalog-meta'
import { meta as referenceRenderingOptionsMeta } from './reference/rendering-options.md?catalog-meta'
import { meta as referenceScriptSetupMeta } from './reference/script-setup.md?catalog-meta'
import { meta as referenceServerRenderingMeta } from './reference/server-rendering.md?catalog-meta'
import { meta as referenceShallowMeta } from './reference/shallow.md?catalog-meta'
import { meta as referenceSlotsMeta } from './reference/slots.md?catalog-meta'
import { meta as referenceStateOptionsMeta } from './reference/state-options.md?catalog-meta'
import { meta as referenceSuspenseMeta } from './reference/suspense.md?catalog-meta'
import { meta as referenceSyntaxMeta } from './reference/syntax.md?catalog-meta'
import { meta as referenceTeleportMeta } from './reference/teleport.md?catalog-meta'
import { meta as referenceTemplatePrimitivesMeta } from './reference/template-primitives.md?catalog-meta'
import { meta as referenceTemplateRefsMeta } from './reference/template-refs.md?catalog-meta'
import { meta as referenceToRefMeta } from './reference/to-ref.md?catalog-meta'
import { meta as referenceTransitionMeta } from './reference/transition.md?catalog-meta'
import { meta as referenceUseIdMeta } from './reference/use-id.md?catalog-meta'
import { meta as referenceUtilityTypesMeta } from './reference/utility-types.md?catalog-meta'
import { meta as referenceUtilsMeta } from './reference/utils.md?catalog-meta'
import { meta as referenceWatchEffectMeta } from './reference/watch-effect.md?catalog-meta'
import { meta as referenceWatchPostSyncMeta } from './reference/watch-post-sync.md?catalog-meta'
import { meta as referenceWatchMeta } from './reference/watch.md?catalog-meta'

export const vueCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'async-components-suspense',
    meta: learnAsyncComponentsSuspenseMeta,
    load: async () => (await import('./learn/async-components-suspense.md?content-entry')).default,
  },
  {
    slug: 'attrs',
    meta: learnAttrsMeta,
    load: async () => (await import('./learn/attrs.md?content-entry')).default,
  },
  {
    slug: 'component-basics',
    meta: learnComponentBasicsMeta,
    load: async () => (await import('./learn/component-basics.md?content-entry')).default,
  },
  {
    slug: 'component-v-model',
    meta: learnComponentVModelMeta,
    load: async () => (await import('./learn/component-v-model.md?content-entry')).default,
  },
  {
    slug: 'composables',
    meta: learnComposablesMeta,
    load: async () => (await import('./learn/composables.md?content-entry')).default,
  },
  {
    slug: 'computed-properties',
    meta: learnComputedPropertiesMeta,
    load: async () => (await import('./learn/computed-properties.md?content-entry')).default,
  },
  {
    slug: 'conditional-list-rendering',
    meta: learnConditionalListRenderingMeta,
    load: async () => (await import('./learn/conditional-list-rendering.md?content-entry')).default,
  },
  {
    slug: 'custom-directives',
    meta: learnCustomDirectivesMeta,
    load: async () => (await import('./learn/custom-directives.md?content-entry')).default,
  },
  {
    slug: 'custom-ref-triggering',
    meta: learnCustomRefTriggeringMeta,
    load: async () => (await import('./learn/custom-ref-triggering.md?content-entry')).default,
  },
  {
    slug: 'dynamic-components-keep-alive',
    meta: learnDynamicComponentsKeepAliveMeta,
    load: async () =>
      (await import('./learn/dynamic-components-keep-alive.md?content-entry')).default,
  },
  {
    slug: 'effect-scope',
    meta: learnEffectScopeMeta,
    load: async () => (await import('./learn/effect-scope.md?content-entry')).default,
  },
  {
    slug: 'emits',
    meta: learnEmitsMeta,
    load: async () => (await import('./learn/emits.md?content-entry')).default,
  },
  {
    slug: 'error-handling',
    meta: learnErrorHandlingMeta,
    load: async () => (await import('./learn/error-handling.md?content-entry')).default,
  },
  {
    slug: 'event-handling',
    meta: learnEventHandlingMeta,
    load: async () => (await import('./learn/event-handling.md?content-entry')).default,
  },
  {
    slug: 'form-bindings',
    meta: learnFormBindingsMeta,
    load: async () => (await import('./learn/form-bindings.md?content-entry')).default,
  },
  {
    slug: 'lifecycle-update-timing',
    meta: learnLifecycleUpdateTimingMeta,
    load: async () => (await import('./learn/lifecycle-update-timing.md?content-entry')).default,
  },
  {
    slug: 'performance',
    meta: learnPerformanceMeta,
    load: async () => (await import('./learn/performance.md?content-entry')).default,
  },
  {
    slug: 'plugins',
    meta: learnPluginsMeta,
    load: async () => (await import('./learn/plugins.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: learnPropsMeta,
    load: async () => (await import('./learn/props.md?content-entry')).default,
  },
  {
    slug: 'provide-inject',
    meta: learnProvideInjectMeta,
    load: async () => (await import('./learn/provide-inject.md?content-entry')).default,
  },
  {
    slug: 'reactive-state',
    meta: learnReactiveStateMeta,
    load: async () => (await import('./learn/reactive-state.md?content-entry')).default,
  },
  {
    slug: 'render-functions-vnodes',
    meta: learnRenderFunctionsVnodesMeta,
    load: async () => (await import('./learn/render-functions-vnodes.md?content-entry')).default,
  },
  {
    slug: 'sfc-basics',
    meta: learnSfcBasicsMeta,
    load: async () => (await import('./learn/sfc-basics.md?content-entry')).default,
  },
  {
    slug: 'shallow-reactivity-raw-boundaries',
    meta: learnShallowReactivityRawBoundariesMeta,
    load: async () =>
      (await import('./learn/shallow-reactivity-raw-boundaries.md?content-entry')).default,
  },
  {
    slug: 'slots',
    meta: learnSlotsMeta,
    load: async () => (await import('./learn/slots.md?content-entry')).default,
  },
  {
    slug: 'ssr-hydration',
    meta: learnSsrHydrationMeta,
    load: async () => (await import('./learn/ssr-hydration.md?content-entry')).default,
  },
  {
    slug: 'teleport',
    meta: learnTeleportMeta,
    load: async () => (await import('./learn/teleport.md?content-entry')).default,
  },
  {
    slug: 'template-refs',
    meta: learnTemplateRefsMeta,
    load: async () => (await import('./learn/template-refs.md?content-entry')).default,
  },
  {
    slug: 'template-syntax',
    meta: learnTemplateSyntaxMeta,
    load: async () => (await import('./learn/template-syntax.md?content-entry')).default,
  },
  {
    slug: 'transitions',
    meta: learnTransitionsMeta,
    load: async () => (await import('./learn/transitions.md?content-entry')).default,
  },
  {
    slug: 'watchers',
    meta: learnWatchersMeta,
    load: async () => (await import('./learn/watchers.md?content-entry')).default,
  },
  {
    slug: 'application-configuration',
    meta: referenceApplicationConfigurationMeta,
    load: async () =>
      (await import('./reference/application-configuration.md?content-entry')).default,
  },
  {
    slug: 'attrs',
    meta: referenceAttrsMeta,
    load: async () => (await import('./reference/attrs.md?content-entry')).default,
  },
  {
    slug: 'compile-time-flags',
    meta: referenceCompileTimeFlagsMeta,
    load: async () => (await import('./reference/compile-time-flags.md?content-entry')).default,
  },
  {
    slug: 'component-instance',
    meta: referenceComponentInstanceMeta,
    load: async () => (await import('./reference/component-instance.md?content-entry')).default,
  },
  {
    slug: 'composables',
    meta: referenceComposablesMeta,
    load: async () => (await import('./reference/composables.md?content-entry')).default,
  },
  {
    slug: 'composition-options',
    meta: referenceCompositionOptionsMeta,
    load: async () => (await import('./reference/composition-options.md?content-entry')).default,
  },
  {
    slug: 'computed',
    meta: referenceComputedMeta,
    load: async () => (await import('./reference/computed.md?content-entry')).default,
  },
  {
    slug: 'create-app',
    meta: referenceCreateAppMeta,
    load: async () => (await import('./reference/create-app.md?content-entry')).default,
  },
  {
    slug: 'create-ssr-app',
    meta: referenceCreateSsrAppMeta,
    load: async () => (await import('./reference/create-ssr-app.md?content-entry')).default,
  },
  {
    slug: 'css-features',
    meta: referenceCssFeaturesMeta,
    load: async () => (await import('./reference/css-features.md?content-entry')).default,
  },
  {
    slug: 'custom-directives',
    meta: referenceCustomDirectivesMeta,
    load: async () => (await import('./reference/custom-directives.md?content-entry')).default,
  },
  {
    slug: 'custom-elements',
    meta: referenceCustomElementsMeta,
    load: async () => (await import('./reference/custom-elements.md?content-entry')).default,
  },
  {
    slug: 'custom-ref',
    meta: referenceCustomRefMeta,
    load: async () => (await import('./reference/custom-ref.md?content-entry')).default,
  },
  {
    slug: 'custom-renderer',
    meta: referenceCustomRendererMeta,
    load: async () => (await import('./reference/custom-renderer.md?content-entry')).default,
  },
  {
    slug: 'define-async-component',
    meta: referenceDefineAsyncComponentMeta,
    load: async () => (await import('./reference/define-async-component.md?content-entry')).default,
  },
  {
    slug: 'define-component',
    meta: referenceDefineComponentMeta,
    load: async () => (await import('./reference/define-component.md?content-entry')).default,
  },
  {
    slug: 'define-model',
    meta: referenceDefineModelMeta,
    load: async () => (await import('./reference/define-model.md?content-entry')).default,
  },
  {
    slug: 'directives',
    meta: referenceDirectivesMeta,
    load: async () => (await import('./reference/directives.md?content-entry')).default,
  },
  {
    slug: 'effect-scope',
    meta: referenceEffectScopeMeta,
    load: async () => (await import('./reference/effect-scope.md?content-entry')).default,
  },
  {
    slug: 'emits',
    meta: referenceEmitsMeta,
    load: async () => (await import('./reference/emits.md?content-entry')).default,
  },
  {
    slug: 'keep-alive',
    meta: referenceKeepAliveMeta,
    load: async () => (await import('./reference/keep-alive.md?content-entry')).default,
  },
  {
    slug: 'lifecycle-options',
    meta: referenceLifecycleOptionsMeta,
    load: async () => (await import('./reference/lifecycle-options.md?content-entry')).default,
  },
  {
    slug: 'lifecycle',
    meta: referenceLifecycleMeta,
    load: async () => (await import('./reference/lifecycle.md?content-entry')).default,
  },
  {
    slug: 'misc-options',
    meta: referenceMiscOptionsMeta,
    load: async () => (await import('./reference/misc-options.md?content-entry')).default,
  },
  {
    slug: 'next-tick',
    meta: referenceNextTickMeta,
    load: async () => (await import('./reference/next-tick.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: referencePropsMeta,
    load: async () => (await import('./reference/props.md?content-entry')).default,
  },
  {
    slug: 'provide-inject',
    meta: referenceProvideInjectMeta,
    load: async () => (await import('./reference/provide-inject.md?content-entry')).default,
  },
  {
    slug: 'reactive',
    meta: referenceReactiveMeta,
    load: async () => (await import('./reference/reactive.md?content-entry')).default,
  },
  {
    slug: 'readonly',
    meta: referenceReadonlyMeta,
    load: async () => (await import('./reference/readonly.md?content-entry')).default,
  },
  {
    slug: 'ref',
    meta: referenceRefMeta,
    load: async () => (await import('./reference/ref.md?content-entry')).default,
  },
  {
    slug: 'render-function',
    meta: referenceRenderFunctionMeta,
    load: async () => (await import('./reference/render-function.md?content-entry')).default,
  },
  {
    slug: 'rendering-options',
    meta: referenceRenderingOptionsMeta,
    load: async () => (await import('./reference/rendering-options.md?content-entry')).default,
  },
  {
    slug: 'script-setup',
    meta: referenceScriptSetupMeta,
    load: async () => (await import('./reference/script-setup.md?content-entry')).default,
  },
  {
    slug: 'server-rendering',
    meta: referenceServerRenderingMeta,
    load: async () => (await import('./reference/server-rendering.md?content-entry')).default,
  },
  {
    slug: 'shallow',
    meta: referenceShallowMeta,
    load: async () => (await import('./reference/shallow.md?content-entry')).default,
  },
  {
    slug: 'slots',
    meta: referenceSlotsMeta,
    load: async () => (await import('./reference/slots.md?content-entry')).default,
  },
  {
    slug: 'state-options',
    meta: referenceStateOptionsMeta,
    load: async () => (await import('./reference/state-options.md?content-entry')).default,
  },
  {
    slug: 'suspense',
    meta: referenceSuspenseMeta,
    load: async () => (await import('./reference/suspense.md?content-entry')).default,
  },
  {
    slug: 'syntax',
    meta: referenceSyntaxMeta,
    load: async () => (await import('./reference/syntax.md?content-entry')).default,
  },
  {
    slug: 'teleport',
    meta: referenceTeleportMeta,
    load: async () => (await import('./reference/teleport.md?content-entry')).default,
  },
  {
    slug: 'template-primitives',
    meta: referenceTemplatePrimitivesMeta,
    load: async () => (await import('./reference/template-primitives.md?content-entry')).default,
  },
  {
    slug: 'template-refs',
    meta: referenceTemplateRefsMeta,
    load: async () => (await import('./reference/template-refs.md?content-entry')).default,
  },
  {
    slug: 'to-ref',
    meta: referenceToRefMeta,
    load: async () => (await import('./reference/to-ref.md?content-entry')).default,
  },
  {
    slug: 'transition',
    meta: referenceTransitionMeta,
    load: async () => (await import('./reference/transition.md?content-entry')).default,
  },
  {
    slug: 'use-id',
    meta: referenceUseIdMeta,
    load: async () => (await import('./reference/use-id.md?content-entry')).default,
  },
  {
    slug: 'utility-types',
    meta: referenceUtilityTypesMeta,
    load: async () => (await import('./reference/utility-types.md?content-entry')).default,
  },
  {
    slug: 'utils',
    meta: referenceUtilsMeta,
    load: async () => (await import('./reference/utils.md?content-entry')).default,
  },
  {
    slug: 'watch-effect',
    meta: referenceWatchEffectMeta,
    load: async () => (await import('./reference/watch-effect.md?content-entry')).default,
  },
  {
    slug: 'watch-post-sync',
    meta: referenceWatchPostSyncMeta,
    load: async () => (await import('./reference/watch-post-sync.md?content-entry')).default,
  },
  {
    slug: 'watch',
    meta: referenceWatchMeta,
    load: async () => (await import('./reference/watch.md?content-entry')).default,
  },
]
