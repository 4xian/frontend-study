import type { CategoryContentEntryManifest } from '@/common/catalog'

import { meta as childrenAndCompositionMeta } from './learn/children-and-composition.md?catalog-meta'
import { meta as componentPurityMeta } from './learn/component-purity.md?catalog-meta'
import { meta as conditionalRenderingMeta } from './learn/conditional-rendering.md?catalog-meta'
import { meta as contextProvidingAndReadingMeta } from './learn/context-providing-and-reading.md?catalog-meta'
import { meta as customHooksMeta } from './learn/custom-hooks.md?catalog-meta'
import { meta as domRefsMeta } from './learn/dom-refs.md?catalog-meta'
import { meta as domPropsMeta } from './learn/dom-props.md?catalog-meta'
import { meta as errorBoundaryRenderFailuresMeta } from './learn/error-boundary-render-failures.md?catalog-meta'
import { meta as eventHandlingMeta } from './learn/event-handling.md?catalog-meta'
import { meta as functionComponentsMeta } from './learn/function-components.md?catalog-meta'
import { meta as immutableStateUpdatesMeta } from './learn/immutable-state-updates.md?catalog-meta'
import { meta as jsxRuntimeAndReactElementMeta } from './learn/jsx-runtime-and-react-element.md?catalog-meta'
import { meta as labAccessibleDialogMeta } from './learn/lab-accessible-dialog.md?catalog-meta'
import { meta as labCourseRegistrationMeta } from './learn/lab-course-registration.md?catalog-meta'
import { meta as labMultiStepEditorMeta } from './learn/lab-multi-step-editor.md?catalog-meta'
import { meta as labSharedTaskWorkspaceMeta } from './learn/lab-shared-task-workspace.md?catalog-meta'
import { meta as labStaticCourseCatalogMeta } from './learn/lab-static-course-catalog.md?catalog-meta'
import { meta as labSynchronizedChatRoomMeta } from './learn/lab-synchronized-chat-room.md?catalog-meta'
import { meta as labTaskEditorMeta } from './learn/lab-task-editor.md?catalog-meta'
import { meta as lazyComponentCodeSplittingMeta } from './learn/lazy-component-code-splitting.md?catalog-meta'
import { meta as listRenderingAndKeyMeta } from './learn/list-rendering-and-key.md?catalog-meta'
import { meta as liftingStateUpMeta } from './learn/lifting-state-up.md?catalog-meta'
import { meta as moduleBoundariesAndComponentTreeMeta } from './learn/module-boundaries-and-component-tree.md?catalog-meta'
import { meta as memoComponentBailoutMeta } from './learn/memo-component-bailout.md?catalog-meta'
import { meta as profilerRenderMeasurementMeta } from './learn/profiler-render-measurement.md?catalog-meta'
import { meta as useMemoValueCachingMeta } from './learn/use-memo-value-caching.md?catalog-meta'
import { meta as useCallbackFunctionIdentityMeta } from './learn/use-callback-function-identity.md?catalog-meta'
import { meta as labRenderPerformanceMeta } from './learn/lab-render-performance.md?catalog-meta'
import { meta as labLazyReportViewerMeta } from './learn/lab-lazy-report-viewer.md?catalog-meta'
import { meta as propsMeta } from './learn/props.md?catalog-meta'
import { meta as reactFormsMeta } from './learn/react-forms.md?catalog-meta'
import { meta as reactRootLifecycleMeta } from './learn/react-root-lifecycle.md?catalog-meta'
import { meta as refAsPropMeta } from './learn/ref-as-prop.md?catalog-meta'
import { meta as reducerContextCompositionMeta } from './learn/reducer-context-composition.md?catalog-meta'
import { meta as renderCommitAndStateSnapshotMeta } from './learn/render-commit-and-state-snapshot.md?catalog-meta'
import { meta as rulesOfHooksMeta } from './learn/rules-of-hooks.md?catalog-meta'
import { meta as statePreservationAndResetMeta } from './learn/state-preservation-and-reset.md?catalog-meta'
import { meta as stateSharingBoundaryMeta } from './learn/state-sharing-boundary.md?catalog-meta'
import { meta as stateOwnershipAndThinkingInReactMeta } from './learn/state-ownership-and-thinking-in-react.md?catalog-meta'
import { meta as stateStructureMeta } from './learn/state-structure.md?catalog-meta'
import { meta as strictModeDevelopmentChecksMeta } from './learn/strict-mode-development-checks.md?catalog-meta'
import { meta as suspenseFallbackBoundaryMeta } from './learn/suspense-fallback-boundary.md?catalog-meta'
import { meta as tsxExpressionsAndAttributesMeta } from './learn/tsx-expressions-and-attributes.md?catalog-meta'
import { meta as tsxMarkupSyntaxMeta } from './learn/tsx-markup-syntax.md?catalog-meta'
import { meta as useIdAccessibleLinksMeta } from './learn/use-id-accessible-links.md?catalog-meta'
import { meta as useStateMeta } from './learn/use-state.md?catalog-meta'
import { meta as useTransitionPendingActionMeta } from './learn/use-transition-pending-action.md?catalog-meta'
import { meta as useDeferredValueStaleContentMeta } from './learn/use-deferred-value-stale-content.md?catalog-meta'
import { meta as activityHiddenStateRestorationMeta } from './learn/activity-hidden-state-restoration.md?catalog-meta'
import { meta as labConcurrentSearchWorkspaceMeta } from './learn/lab-concurrent-search-workspace.md?catalog-meta'
import { meta as formActionClientSubmissionMeta } from './learn/form-action-client-submission.md?catalog-meta'
import { meta as useActionStateResultQueueMeta } from './learn/use-action-state-result-queue.md?catalog-meta'
import { meta as useOptimisticPendingStateMeta } from './learn/use-optimistic-pending-state.md?catalog-meta'
import { meta as labActionReviewQueueMeta } from './learn/lab-action-review-queue.md?catalog-meta'
import { meta as useSyncExternalStoreSnapshotMeta } from './learn/use-sync-external-store-snapshot.md?catalog-meta'
import { meta as portalTreeAndDomPlacementMeta } from './learn/portal-tree-and-dom-placement.md?catalog-meta'
import { meta as hydrateRootMarkupIdentityMeta } from './learn/hydrate-root-markup-identity.md?catalog-meta'
import { meta as flushSyncDomCommitMeta } from './learn/flush-sync-dom-commit.md?catalog-meta'
import { meta as documentMetadataHoistingMeta } from './learn/document-metadata-hoisting.md?catalog-meta'
import { meta as declarativeStylesheetResourcesMeta } from './learn/declarative-stylesheet-resources.md?catalog-meta'
import { meta as declarativeAsyncScriptResourceMeta } from './learn/declarative-async-script-resource.md?catalog-meta'
import { meta as resourceHintsMeta } from './learn/resource-hints.md?catalog-meta'
import { meta as useInsertionEffectMeta } from './learn/use-insertion-effect.md?catalog-meta'
import { meta as labEmbeddedStatusPanelMeta } from './learn/lab-embedded-status-panel.md?catalog-meta'
import { meta as useResourceReadingMeta } from './learn/use-resource-reading.md?catalog-meta'
import { meta as useReducerMeta } from './learn/use-reducer.md?catalog-meta'
import { meta as effectDependenciesMeta } from './learn/effect-dependencies.md?catalog-meta'
import { meta as effectEventsMeta } from './learn/effect-events.md?catalog-meta'
import { meta as unnecessaryEffectsMeta } from './learn/unnecessary-effects.md?catalog-meta'
import { meta as useEffectMeta } from './learn/use-effect.md?catalog-meta'
import { meta as useImperativeHandleMeta } from './learn/use-imperative-handle.md?catalog-meta'
import { meta as useLayoutEffectMeta } from './learn/use-layout-effect.md?catalog-meta'
import { meta as useRefMeta } from './learn/use-ref.md?catalog-meta'
import { meta as viteReactProjectSetupMeta } from './learn/vite-react-project-setup.md?catalog-meta'

export const reactCoreContentEntries: CategoryContentEntryManifest[] = [
  {
    slug: 'vite-react-project-setup',
    meta: viteReactProjectSetupMeta,
    load: async () => (await import('./learn/vite-react-project-setup.md?content-entry')).default,
  },
  {
    slug: 'tsx-markup-syntax',
    meta: tsxMarkupSyntaxMeta,
    load: async () => (await import('./learn/tsx-markup-syntax.md?content-entry')).default,
  },
  {
    slug: 'tsx-expressions-and-attributes',
    meta: tsxExpressionsAndAttributesMeta,
    load: async () =>
      (await import('./learn/tsx-expressions-and-attributes.md?content-entry')).default,
  },
  {
    slug: 'function-components',
    meta: functionComponentsMeta,
    load: async () => (await import('./learn/function-components.md?content-entry')).default,
  },
  {
    slug: 'module-boundaries-and-component-tree',
    meta: moduleBoundariesAndComponentTreeMeta,
    load: async () =>
      (await import('./learn/module-boundaries-and-component-tree.md?content-entry')).default,
  },
  {
    slug: 'jsx-runtime-and-react-element',
    meta: jsxRuntimeAndReactElementMeta,
    load: async () =>
      (await import('./learn/jsx-runtime-and-react-element.md?content-entry')).default,
  },
  {
    slug: 'react-root-lifecycle',
    meta: reactRootLifecycleMeta,
    load: async () => (await import('./learn/react-root-lifecycle.md?content-entry')).default,
  },
  {
    slug: 'props',
    meta: propsMeta,
    load: async () => (await import('./learn/props.md?content-entry')).default,
  },
  {
    slug: 'children-and-composition',
    meta: childrenAndCompositionMeta,
    load: async () => (await import('./learn/children-and-composition.md?content-entry')).default,
  },
  {
    slug: 'conditional-rendering',
    meta: conditionalRenderingMeta,
    load: async () => (await import('./learn/conditional-rendering.md?content-entry')).default,
  },
  {
    slug: 'list-rendering-and-key',
    meta: listRenderingAndKeyMeta,
    load: async () => (await import('./learn/list-rendering-and-key.md?content-entry')).default,
  },
  {
    slug: 'lab-static-course-catalog',
    meta: labStaticCourseCatalogMeta,
    load: async () => (await import('./learn/lab-static-course-catalog.md?content-entry')).default,
  },
  {
    slug: 'component-purity',
    meta: componentPurityMeta,
    load: async () => (await import('./learn/component-purity.md?content-entry')).default,
  },
  {
    slug: 'event-handling',
    meta: eventHandlingMeta,
    load: async () => (await import('./learn/event-handling.md?content-entry')).default,
  },
  {
    slug: 'rules-of-hooks',
    meta: rulesOfHooksMeta,
    load: async () => (await import('./learn/rules-of-hooks.md?content-entry')).default,
  },
  {
    slug: 'use-state',
    meta: useStateMeta,
    load: async () => (await import('./learn/use-state.md?content-entry')).default,
  },
  {
    slug: 'render-commit-and-state-snapshot',
    meta: renderCommitAndStateSnapshotMeta,
    load: async () =>
      (await import('./learn/render-commit-and-state-snapshot.md?content-entry')).default,
  },
  {
    slug: 'immutable-state-updates',
    meta: immutableStateUpdatesMeta,
    load: async () => (await import('./learn/immutable-state-updates.md?content-entry')).default,
  },
  {
    slug: 'lab-task-editor',
    meta: labTaskEditorMeta,
    load: async () => (await import('./learn/lab-task-editor.md?content-entry')).default,
  },
  {
    slug: 'dom-props',
    meta: domPropsMeta,
    load: async () => (await import('./learn/dom-props.md?content-entry')).default,
  },
  {
    slug: 'use-id-accessible-links',
    meta: useIdAccessibleLinksMeta,
    load: async () => (await import('./learn/use-id-accessible-links.md?content-entry')).default,
  },
  {
    slug: 'react-forms',
    meta: reactFormsMeta,
    load: async () => (await import('./learn/react-forms.md?content-entry')).default,
  },
  {
    slug: 'state-ownership-and-thinking-in-react',
    meta: stateOwnershipAndThinkingInReactMeta,
    load: async () =>
      (await import('./learn/state-ownership-and-thinking-in-react.md?content-entry')).default,
  },
  {
    slug: 'lab-course-registration',
    meta: labCourseRegistrationMeta,
    load: async () => (await import('./learn/lab-course-registration.md?content-entry')).default,
  },
  {
    slug: 'state-structure',
    meta: stateStructureMeta,
    load: async () => (await import('./learn/state-structure.md?content-entry')).default,
  },
  {
    slug: 'lifting-state-up',
    meta: liftingStateUpMeta,
    load: async () => (await import('./learn/lifting-state-up.md?content-entry')).default,
  },
  {
    slug: 'state-preservation-and-reset',
    meta: statePreservationAndResetMeta,
    load: async () =>
      (await import('./learn/state-preservation-and-reset.md?content-entry')).default,
  },
  {
    slug: 'lab-multi-step-editor',
    meta: labMultiStepEditorMeta,
    load: async () => (await import('./learn/lab-multi-step-editor.md?content-entry')).default,
  },
  {
    slug: 'use-reducer',
    meta: useReducerMeta,
    load: async () => (await import('./learn/use-reducer.md?content-entry')).default,
  },
  {
    slug: 'context-providing-and-reading',
    meta: contextProvidingAndReadingMeta,
    load: async () =>
      (await import('./learn/context-providing-and-reading.md?content-entry')).default,
  },
  {
    slug: 'reducer-context-composition',
    meta: reducerContextCompositionMeta,
    load: async () =>
      (await import('./learn/reducer-context-composition.md?content-entry')).default,
  },
  {
    slug: 'state-sharing-boundary',
    meta: stateSharingBoundaryMeta,
    load: async () => (await import('./learn/state-sharing-boundary.md?content-entry')).default,
  },
  {
    slug: 'lab-shared-task-workspace',
    meta: labSharedTaskWorkspaceMeta,
    load: async () => (await import('./learn/lab-shared-task-workspace.md?content-entry')).default,
  },
  {
    slug: 'use-ref',
    meta: useRefMeta,
    load: async () => (await import('./learn/use-ref.md?content-entry')).default,
  },
  {
    slug: 'dom-refs',
    meta: domRefsMeta,
    load: async () => (await import('./learn/dom-refs.md?content-entry')).default,
  },
  {
    slug: 'ref-as-prop',
    meta: refAsPropMeta,
    load: async () => (await import('./learn/ref-as-prop.md?content-entry')).default,
  },
  {
    slug: 'portal-tree-and-dom-placement',
    meta: portalTreeAndDomPlacementMeta,
    load: async () =>
      (await import('./learn/portal-tree-and-dom-placement.md?content-entry')).default,
  },
  {
    slug: 'lab-accessible-dialog',
    meta: labAccessibleDialogMeta,
    load: async () => (await import('./learn/lab-accessible-dialog.md?content-entry')).default,
  },
  {
    slug: 'use-imperative-handle',
    meta: useImperativeHandleMeta,
    load: async () => (await import('./learn/use-imperative-handle.md?content-entry')).default,
  },
  {
    slug: 'use-effect',
    meta: useEffectMeta,
    load: async () => (await import('./learn/use-effect.md?content-entry')).default,
  },
  {
    slug: 'unnecessary-effects',
    meta: unnecessaryEffectsMeta,
    load: async () => (await import('./learn/unnecessary-effects.md?content-entry')).default,
  },
  {
    slug: 'effect-dependencies',
    meta: effectDependenciesMeta,
    load: async () => (await import('./learn/effect-dependencies.md?content-entry')).default,
  },
  {
    slug: 'effect-events',
    meta: effectEventsMeta,
    load: async () => (await import('./learn/effect-events.md?content-entry')).default,
  },
  {
    slug: 'custom-hooks',
    meta: customHooksMeta,
    load: async () => (await import('./learn/custom-hooks.md?content-entry')).default,
  },
  {
    slug: 'strict-mode-development-checks',
    meta: strictModeDevelopmentChecksMeta,
    load: async () =>
      (await import('./learn/strict-mode-development-checks.md?content-entry')).default,
  },
  {
    slug: 'lab-synchronized-chat-room',
    meta: labSynchronizedChatRoomMeta,
    load: async () => (await import('./learn/lab-synchronized-chat-room.md?content-entry')).default,
  },
  {
    slug: 'profiler-render-measurement',
    meta: profilerRenderMeasurementMeta,
    load: async () =>
      (await import('./learn/profiler-render-measurement.md?content-entry')).default,
  },
  {
    slug: 'use-memo-value-caching',
    meta: useMemoValueCachingMeta,
    load: async () => (await import('./learn/use-memo-value-caching.md?content-entry')).default,
  },
  {
    slug: 'memo-component-bailout',
    meta: memoComponentBailoutMeta,
    load: async () => (await import('./learn/memo-component-bailout.md?content-entry')).default,
  },
  {
    slug: 'use-callback-function-identity',
    meta: useCallbackFunctionIdentityMeta,
    load: async () =>
      (await import('./learn/use-callback-function-identity.md?content-entry')).default,
  },
  {
    slug: 'lab-render-performance',
    meta: labRenderPerformanceMeta,
    load: async () => (await import('./learn/lab-render-performance.md?content-entry')).default,
  },
  {
    slug: 'use-layout-effect',
    meta: useLayoutEffectMeta,
    load: async () => (await import('./learn/use-layout-effect.md?content-entry')).default,
  },
  {
    slug: 'error-boundary-render-failures',
    meta: errorBoundaryRenderFailuresMeta,
    load: async () =>
      (await import('./learn/error-boundary-render-failures.md?content-entry')).default,
  },
  {
    slug: 'lazy-component-code-splitting',
    meta: lazyComponentCodeSplittingMeta,
    load: async () =>
      (await import('./learn/lazy-component-code-splitting.md?content-entry')).default,
  },
  {
    slug: 'suspense-fallback-boundary',
    meta: suspenseFallbackBoundaryMeta,
    load: async () => (await import('./learn/suspense-fallback-boundary.md?content-entry')).default,
  },
  {
    slug: 'use-resource-reading',
    meta: useResourceReadingMeta,
    load: async () => (await import('./learn/use-resource-reading.md?content-entry')).default,
  },
  {
    slug: 'lab-lazy-report-viewer',
    meta: labLazyReportViewerMeta,
    load: async () => (await import('./learn/lab-lazy-report-viewer.md?content-entry')).default,
  },
  {
    slug: 'use-transition-pending-action',
    meta: useTransitionPendingActionMeta,
    load: async () =>
      (await import('./learn/use-transition-pending-action.md?content-entry')).default,
  },
  {
    slug: 'use-deferred-value-stale-content',
    meta: useDeferredValueStaleContentMeta,
    load: async () =>
      (await import('./learn/use-deferred-value-stale-content.md?content-entry')).default,
  },
  {
    slug: 'activity-hidden-state-restoration',
    meta: activityHiddenStateRestorationMeta,
    load: async () =>
      (await import('./learn/activity-hidden-state-restoration.md?content-entry')).default,
  },
  {
    slug: 'lab-concurrent-search-workspace',
    meta: labConcurrentSearchWorkspaceMeta,
    load: async () =>
      (await import('./learn/lab-concurrent-search-workspace.md?content-entry')).default,
  },
  {
    slug: 'form-action-client-submission',
    meta: formActionClientSubmissionMeta,
    load: async () =>
      (await import('./learn/form-action-client-submission.md?content-entry')).default,
  },
  {
    slug: 'use-action-state-result-queue',
    meta: useActionStateResultQueueMeta,
    load: async () =>
      (await import('./learn/use-action-state-result-queue.md?content-entry')).default,
  },
  {
    slug: 'use-optimistic-pending-state',
    meta: useOptimisticPendingStateMeta,
    load: async () =>
      (await import('./learn/use-optimistic-pending-state.md?content-entry')).default,
  },
  {
    slug: 'lab-action-review-queue',
    meta: labActionReviewQueueMeta,
    load: async () => (await import('./learn/lab-action-review-queue.md?content-entry')).default,
  },
  {
    slug: 'use-sync-external-store-snapshot',
    meta: useSyncExternalStoreSnapshotMeta,
    load: async () =>
      (await import('./learn/use-sync-external-store-snapshot.md?content-entry')).default,
  },
  {
    slug: 'hydrate-root-markup-identity',
    meta: hydrateRootMarkupIdentityMeta,
    load: async () =>
      (await import('./learn/hydrate-root-markup-identity.md?content-entry')).default,
  },
  {
    slug: 'flush-sync-dom-commit',
    meta: flushSyncDomCommitMeta,
    load: async () => (await import('./learn/flush-sync-dom-commit.md?content-entry')).default,
  },
  {
    slug: 'document-metadata-hoisting',
    meta: documentMetadataHoistingMeta,
    load: async () => (await import('./learn/document-metadata-hoisting.md?content-entry')).default,
  },
  {
    slug: 'declarative-stylesheet-resources',
    meta: declarativeStylesheetResourcesMeta,
    load: async () =>
      (await import('./learn/declarative-stylesheet-resources.md?content-entry')).default,
  },
  {
    slug: 'declarative-async-script-resource',
    meta: declarativeAsyncScriptResourceMeta,
    load: async () =>
      (await import('./learn/declarative-async-script-resource.md?content-entry')).default,
  },
  {
    slug: 'resource-hints',
    meta: resourceHintsMeta,
    load: async () => (await import('./learn/resource-hints.md?content-entry')).default,
  },
  {
    slug: 'use-insertion-effect',
    meta: useInsertionEffectMeta,
    load: async () => (await import('./learn/use-insertion-effect.md?content-entry')).default,
  },
  {
    slug: 'lab-embedded-status-panel',
    meta: labEmbeddedStatusPanelMeta,
    load: async () => (await import('./learn/lab-embedded-status-panel.md?content-entry')).default,
  },
]
