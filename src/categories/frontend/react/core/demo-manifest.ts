import type { DemoAssetManifest, ReactComponentModule } from '@/common/content/demo-registry'

const demoPath = './demos/lifecycle-probe/lifecycle-probe.tsx'
const demoComponents = import.meta.glob<ReactComponentModule>('./demos/**/*.tsx')
const demoSources = import.meta.glob<string>('./demos/**/*.tsx', {
  query: '?raw',
  import: 'default',
})
const demoTypeScriptSources = import.meta.glob<string>('./demos/**/*.ts', {
  query: '?raw',
  import: 'default',
})
const demoStyleSources = import.meta.glob<string>('./demos/**/*.css', {
  query: '?raw',
  import: 'default',
})
const demoHtmlSources = import.meta.glob<string>('./demos/**/*.html', {
  query: '?raw',
  import: 'default',
})

/** 读取 public 中由 Demo 真正执行的同源静态源码。 */
async function loadPublicDemoSource(sourcePath: string): Promise<string> {
  const response = await fetch(sourcePath)
  if (!response.ok) throw new Error(`无法读取 Demo 静态源码：${sourcePath}`)
  return response.text()
}

const moduleBoundariesSourceFiles = [
  {
    name: 'module-boundaries-and-component-tree-demo.tsx',
    load: demoSources[
      './demos/module-boundaries-and-component-tree/module-boundaries-and-component-tree-demo.tsx'
    ]!,
  },
  {
    name: 'course-header.tsx',
    load: demoSources['./demos/module-boundaries-and-component-tree/course-header.tsx']!,
  },
  {
    name: 'published-lesson.tsx',
    load: demoSources['./demos/module-boundaries-and-component-tree/published-lesson.tsx']!,
  },
  {
    name: 'draft-lesson.tsx',
    load: demoSources['./demos/module-boundaries-and-component-tree/draft-lesson.tsx']!,
  },
  {
    name: 'course-meta.ts',
    load: demoTypeScriptSources['./demos/module-boundaries-and-component-tree/course-meta.ts']!,
  },
] as const

const labStaticCourseCatalogSourceFiles = [
  {
    name: 'course-data.ts',
    load: demoTypeScriptSources['./demos/lab-static-course-catalog/course-data.ts']!,
  },
  {
    name: 'catalog-frame.tsx',
    load: demoSources['./demos/lab-static-course-catalog/catalog-frame.tsx']!,
  },
  {
    name: 'course-list.tsx',
    load: demoSources['./demos/lab-static-course-catalog/course-list.tsx']!,
  },
  {
    name: 'lab-static-course-catalog-demo.tsx',
    load: demoSources['./demos/lab-static-course-catalog/lab-static-course-catalog-demo.tsx']!,
  },
  {
    name: 'lab-static-course-catalog-demo.css',
    load: demoStyleSources['./demos/lab-static-course-catalog/lab-static-course-catalog-demo.css']!,
  },
] as const

const labTaskEditorSourceFiles = [
  {
    name: 'task-data.ts',
    load: demoTypeScriptSources['./demos/lab-task-editor/task-data.ts']!,
  },
  {
    name: 'task-composer.tsx',
    load: demoSources['./demos/lab-task-editor/task-composer.tsx']!,
  },
  {
    name: 'task-list.tsx',
    load: demoSources['./demos/lab-task-editor/task-list.tsx']!,
  },
  {
    name: 'lab-task-editor-demo.tsx',
    load: demoSources['./demos/lab-task-editor/lab-task-editor-demo.tsx']!,
  },
  {
    name: 'lab-task-editor-demo.css',
    load: demoStyleSources['./demos/lab-task-editor/lab-task-editor-demo.css']!,
  },
] as const

const domPropsSourceFiles = [
  {
    name: 'dom-props-demo.tsx',
    load: demoSources['./demos/dom-props/dom-props-demo.tsx']!,
  },
  {
    name: 'dom-props-demo.css',
    load: demoStyleSources['./demos/dom-props/dom-props-demo.css']!,
  },
] as const

const useIdAccessibleLinksSourceFiles = [
  {
    name: 'use-id-accessible-links-demo.tsx',
    load: demoSources['./demos/use-id-accessible-links/use-id-accessible-links-demo.tsx']!,
  },
  {
    name: 'use-id-accessible-links-demo.css',
    load: demoStyleSources['./demos/use-id-accessible-links/use-id-accessible-links-demo.css']!,
  },
] as const

const reactFormsSourceFiles = [
  {
    name: 'react-forms-demo.tsx',
    load: demoSources['./demos/react-forms/react-forms-demo.tsx']!,
  },
  {
    name: 'react-forms-demo.css',
    load: demoStyleSources['./demos/react-forms/react-forms-demo.css']!,
  },
] as const

const productTableSourceFiles = [
  {
    name: 'product-table-demo.tsx',
    load: demoSources['./demos/product-table/product-table-demo.tsx']!,
  },
  {
    name: 'product-table-demo.css',
    load: demoStyleSources['./demos/product-table/product-table-demo.css']!,
  },
] as const

const labCourseRegistrationSourceFiles = [
  {
    name: 'course-data.ts',
    load: demoTypeScriptSources['./demos/lab-course-registration/course-data.ts']!,
  },
  {
    name: 'course-filters.tsx',
    load: demoSources['./demos/lab-course-registration/course-filters.tsx']!,
  },
  {
    name: 'course-list.tsx',
    load: demoSources['./demos/lab-course-registration/course-list.tsx']!,
  },
  {
    name: 'registration-fields.tsx',
    load: demoSources['./demos/lab-course-registration/registration-fields.tsx']!,
  },
  {
    name: 'lab-course-registration-demo.tsx',
    load: demoSources['./demos/lab-course-registration/lab-course-registration-demo.tsx']!,
  },
  {
    name: 'lab-course-registration-demo.css',
    load: demoStyleSources['./demos/lab-course-registration/lab-course-registration-demo.css']!,
  },
] as const

const stateStructureSourceFiles = [
  {
    name: 'state-model-demo.tsx',
    load: demoSources['./demos/state-structure/state-model-demo.tsx']!,
  },
  {
    name: 'state-model-demo.css',
    load: demoStyleSources['./demos/state-structure/state-model-demo.css']!,
  },
] as const

const liftingStateUpSourceFiles = [
  {
    name: 'synced-inputs-demo.tsx',
    load: demoSources['./demos/lifting-state-up/synced-inputs-demo.tsx']!,
  },
  {
    name: 'synced-inputs-demo.css',
    load: demoStyleSources['./demos/lifting-state-up/synced-inputs-demo.css']!,
  },
] as const

const statePreservationAndResetSourceFiles = [
  {
    name: 'state-preservation-demo.tsx',
    load: demoSources['./demos/state-preservation-and-reset/state-preservation-demo.tsx']!,
  },
  {
    name: 'state-preservation-demo.css',
    load: demoStyleSources['./demos/state-preservation-and-reset/state-preservation-demo.css']!,
  },
] as const

const labMultiStepEditorSourceFiles = [
  {
    name: 'editor-data.ts',
    load: demoTypeScriptSources['./demos/lab-multi-step-editor/editor-data.ts']!,
  },
  {
    name: 'editor-steps.tsx',
    load: demoSources['./demos/lab-multi-step-editor/editor-steps.tsx']!,
  },
  {
    name: 'editor-workspace.tsx',
    load: demoSources['./demos/lab-multi-step-editor/editor-workspace.tsx']!,
  },
  {
    name: 'lab-multi-step-editor-demo.tsx',
    load: demoSources['./demos/lab-multi-step-editor/lab-multi-step-editor-demo.tsx']!,
  },
  {
    name: 'lab-multi-step-editor-demo.css',
    load: demoStyleSources['./demos/lab-multi-step-editor/lab-multi-step-editor-demo.css']!,
  },
] as const

const useReducerSourceFiles = [
  {
    name: 'task-board-demo.tsx',
    load: demoSources['./demos/use-reducer/task-board-demo.tsx']!,
  },
  {
    name: 'task-board-demo.css',
    load: demoStyleSources['./demos/use-reducer/task-board-demo.css']!,
  },
] as const

const contextProvidingAndReadingSourceFiles = [
  {
    name: 'context-providing-and-reading-demo.tsx',
    load: demoSources[
      './demos/context-providing-and-reading/context-providing-and-reading-demo.tsx'
    ]!,
  },
  {
    name: 'context-providing-and-reading-demo.css',
    load: demoStyleSources[
      './demos/context-providing-and-reading/context-providing-and-reading-demo.css'
    ]!,
  },
] as const

const reducerContextCompositionSourceFiles = [
  {
    name: 'task-context-demo.tsx',
    load: demoSources['./demos/reducer-context-composition/task-context-demo.tsx']!,
  },
  {
    name: 'task-context-demo.css',
    load: demoStyleSources['./demos/reducer-context-composition/task-context-demo.css']!,
  },
] as const

const stateSharingBoundarySourceFiles = [
  {
    name: 'state-ownership-boundary-demo.tsx',
    load: demoSources['./demos/state-sharing-boundary/state-ownership-boundary-demo.tsx']!,
  },
  {
    name: 'state-ownership-boundary-demo.css',
    load: demoStyleSources['./demos/state-sharing-boundary/state-ownership-boundary-demo.css']!,
  },
] as const

const labSharedTaskWorkspaceSourceFiles = [
  {
    name: 'workspace-model.ts',
    load: demoTypeScriptSources['./demos/lab-shared-task-workspace/workspace-model.ts']!,
  },
  {
    name: 'workspace-provider.tsx',
    load: demoSources['./demos/lab-shared-task-workspace/workspace-provider.tsx']!,
  },
  {
    name: 'workspace-panels.tsx',
    load: demoSources['./demos/lab-shared-task-workspace/workspace-panels.tsx']!,
  },
  {
    name: 'lab-shared-task-workspace-demo.tsx',
    load: demoSources['./demos/lab-shared-task-workspace/lab-shared-task-workspace-demo.tsx']!,
  },
  {
    name: 'lab-shared-task-workspace-demo.css',
    load: demoStyleSources['./demos/lab-shared-task-workspace/lab-shared-task-workspace-demo.css']!,
  },
] as const

const refAsPropSourceFiles = [
  {
    name: 'ref-as-prop-demo.tsx',
    load: demoSources['./demos/ref-as-prop/ref-as-prop-demo.tsx']!,
  },
  {
    name: 'ref-as-prop-demo.css',
    load: demoStyleSources['./demos/ref-as-prop/ref-as-prop-demo.css']!,
  },
] as const

const useImperativeHandleSourceFiles = [
  {
    name: 'use-imperative-handle-demo.tsx',
    load: demoSources['./demos/use-imperative-handle/use-imperative-handle-demo.tsx']!,
  },
  {
    name: 'use-imperative-handle-demo.css',
    load: demoStyleSources['./demos/use-imperative-handle/use-imperative-handle-demo.css']!,
  },
] as const

const useLayoutEffectSourceFiles = [
  {
    name: 'prepaint-measurement-demo.tsx',
    load: demoSources['./demos/use-layout-effect/prepaint-measurement-demo.tsx']!,
  },
  {
    name: 'prepaint-measurement-demo.css',
    load: demoStyleSources['./demos/use-layout-effect/prepaint-measurement-demo.css']!,
  },
] as const

const useInsertionEffectSourceFiles = [
  {
    name: 'css-in-js-style-insertion-demo.tsx',
    load: demoSources['./demos/use-insertion-effect/css-in-js-style-insertion-demo.tsx']!,
  },
  {
    name: 'css-in-js-style-insertion-demo.css',
    load: demoStyleSources['./demos/use-insertion-effect/css-in-js-style-insertion-demo.css']!,
  },
] as const

const useEffectSourceFiles = [
  {
    name: 'use-effect-demo.tsx',
    load: demoSources['./demos/use-effect/use-effect-demo.tsx']!,
  },
  {
    name: 'use-effect-demo.css',
    load: demoStyleSources['./demos/use-effect/use-effect-demo.css']!,
  },
] as const

const effectCleanupSourceFiles = [
  {
    name: 'event-listener-symmetry-demo.tsx',
    load: demoSources['./demos/effect-cleanup/event-listener-symmetry-demo.tsx']!,
  },
  {
    name: 'event-listener-symmetry-demo.css',
    load: demoStyleSources['./demos/effect-cleanup/event-listener-symmetry-demo.css']!,
  },
] as const

const effectLifecycleSourceFiles = [
  {
    name: 'room-sync-process-demo.tsx',
    load: demoSources['./demos/effect-lifecycle/room-sync-process-demo.tsx']!,
  },
  {
    name: 'room-sync-process-demo.css',
    load: demoStyleSources['./demos/effect-lifecycle/room-sync-process-demo.css']!,
  },
] as const

const unnecessaryEffectsSourceFiles = [
  {
    name: 'render-and-event-boundary-demo.tsx',
    load: demoSources['./demos/unnecessary-effects/render-and-event-boundary-demo.tsx']!,
  },
  {
    name: 'render-and-event-boundary-demo.css',
    load: demoStyleSources['./demos/unnecessary-effects/render-and-event-boundary-demo.css']!,
  },
] as const

const effectDependenciesSourceFiles = [
  {
    name: 'dependency-map-demo.tsx',
    load: demoSources['./demos/effect-dependencies/dependency-map-demo.tsx']!,
  },
  {
    name: 'dependency-map-demo.css',
    load: demoStyleSources['./demos/effect-dependencies/dependency-map-demo.css']!,
  },
] as const

const effectObjectDependencySourceFiles = [
  {
    name: 'options-sync-demo.tsx',
    load: demoSources['./demos/removing-effect-dependencies/options-sync-demo.tsx']!,
  },
  {
    name: 'options-sync-demo.css',
    load: demoStyleSources['./demos/removing-effect-dependencies/options-sync-demo.css']!,
  },
] as const

const effectEventsSourceFiles = [
  {
    name: 'latest-notification-demo.tsx',
    load: demoSources['./demos/effect-events/latest-notification-demo.tsx']!,
  },
  {
    name: 'latest-notification-demo.css',
    load: demoStyleSources['./demos/effect-events/latest-notification-demo.css']!,
  },
] as const

const customHooksSourceFiles = [
  {
    name: 'independent-counters-demo.tsx',
    load: demoSources['./demos/custom-hooks/independent-counters-demo.tsx']!,
  },
  {
    name: 'independent-counters-demo.css',
    load: demoStyleSources['./demos/custom-hooks/independent-counters-demo.css']!,
  },
] as const

const strictModeDevelopmentChecksSourceFiles = [
  {
    name: 'resource-symmetry-demo.tsx',
    load: demoSources['./demos/strict-mode-development-checks/resource-symmetry-demo.tsx']!,
  },
  {
    name: 'resource-symmetry-demo.css',
    load: demoStyleSources['./demos/strict-mode-development-checks/resource-symmetry-demo.css']!,
  },
] as const

const labSynchronizedChatRoomSourceFiles = [
  {
    name: 'lab-synchronized-chat-room-demo.tsx',
    load: demoSources['./demos/lab-synchronized-chat-room/lab-synchronized-chat-room-demo.tsx']!,
  },
  {
    name: 'lab-synchronized-chat-room-demo.css',
    load: demoStyleSources[
      './demos/lab-synchronized-chat-room/lab-synchronized-chat-room-demo.css'
    ]!,
  },
] as const

const profilerRenderMeasurementSourceFiles = [
  {
    name: 'profiler-render-measurement-demo.tsx',
    load: demoSources['./demos/profiler-render-measurement/profiler-render-measurement-demo.tsx']!,
  },
  {
    name: 'profiler-render-measurement-demo.css',
    load: demoStyleSources[
      './demos/profiler-render-measurement/profiler-render-measurement-demo.css'
    ]!,
  },
] as const

const useMemoValueCachingSourceFiles = [
  {
    name: 'use-memo-value-caching-demo.tsx',
    load: demoSources['./demos/use-memo-value-caching/use-memo-value-caching-demo.tsx']!,
  },
  {
    name: 'use-memo-value-caching-demo.css',
    load: demoStyleSources['./demos/use-memo-value-caching/use-memo-value-caching-demo.css']!,
  },
] as const

const memoComponentBailoutSourceFiles = [
  {
    name: 'memo-component-bailout-demo.tsx',
    load: demoSources['./demos/memo-component-bailout/memo-component-bailout-demo.tsx']!,
  },
  {
    name: 'memo-component-bailout-demo.css',
    load: demoStyleSources['./demos/memo-component-bailout/memo-component-bailout-demo.css']!,
  },
] as const

const useCallbackFunctionIdentitySourceFiles = [
  {
    name: 'use-callback-function-identity-demo.tsx',
    load: demoSources[
      './demos/use-callback-function-identity/use-callback-function-identity-demo.tsx'
    ]!,
  },
  {
    name: 'use-callback-function-identity-demo.css',
    load: demoStyleSources[
      './demos/use-callback-function-identity/use-callback-function-identity-demo.css'
    ]!,
  },
] as const

const labRenderPerformanceSourceFiles = [
  {
    name: 'lab-render-performance-demo.tsx',
    load: demoSources['./demos/lab-render-performance/lab-render-performance-demo.tsx']!,
  },
  {
    name: 'lab-render-performance-demo.css',
    load: demoStyleSources['./demos/lab-render-performance/lab-render-performance-demo.css']!,
  },
] as const

const errorBoundaryRenderFailuresSourceFiles = [
  {
    name: 'error-boundary-render-failures-demo.tsx',
    load: demoSources[
      './demos/error-boundary-render-failures/error-boundary-render-failures-demo.tsx'
    ]!,
  },
  {
    name: 'error-boundary-render-failures-demo.css',
    load: demoStyleSources[
      './demos/error-boundary-render-failures/error-boundary-render-failures-demo.css'
    ]!,
  },
] as const

const lazyComponentCodeSplittingSourceFiles = [
  {
    name: 'lazy-component-code-splitting-demo.tsx',
    load: demoSources[
      './demos/lazy-component-code-splitting/lazy-component-code-splitting-demo.tsx'
    ]!,
  },
  {
    name: 'lazy-course-panel.tsx',
    load: demoSources['./demos/lazy-component-code-splitting/lazy-course-panel.tsx']!,
  },
  {
    name: 'lazy-failure-panel.tsx',
    load: demoSources['./demos/lazy-component-code-splitting/lazy-failure-panel.tsx']!,
  },
  {
    name: 'lazy-load-count.ts',
    load: demoTypeScriptSources['./demos/lazy-component-code-splitting/lazy-load-count.ts']!,
  },
  {
    name: 'lazy-component-code-splitting-demo.css',
    load: demoStyleSources[
      './demos/lazy-component-code-splitting/lazy-component-code-splitting-demo.css'
    ]!,
  },
] as const

const suspenseFallbackBoundarySourceFiles = [
  {
    name: 'suspense-fallback-boundary-demo.tsx',
    load: demoSources['./demos/suspense-fallback-boundary/suspense-fallback-boundary-demo.tsx']!,
  },
  {
    name: 'suspense-gates.tsx',
    load: demoSources['./demos/suspense-fallback-boundary/suspense-gates.tsx']!,
  },
  {
    name: 'suspense-summary.tsx',
    load: demoSources['./demos/suspense-fallback-boundary/suspense-summary.tsx']!,
  },
  {
    name: 'suspense-inspector.tsx',
    load: demoSources['./demos/suspense-fallback-boundary/suspense-inspector.tsx']!,
  },
  {
    name: 'suspense-inspector-revision.tsx',
    load: demoSources['./demos/suspense-fallback-boundary/suspense-inspector-revision.tsx']!,
  },
  {
    name: 'suspense-fallback-boundary-demo.css',
    load: demoStyleSources[
      './demos/suspense-fallback-boundary/suspense-fallback-boundary-demo.css'
    ]!,
  },
] as const

const useResourceReadingSourceFiles = [
  {
    name: 'use-promise-reading-demo.tsx',
    load: demoSources['./demos/use-promise-reading/use-promise-reading-demo.tsx']!,
  },
  {
    name: 'report-resource.ts',
    load: demoTypeScriptSources['./demos/use-promise-reading/report-resource.ts']!,
  },
  {
    name: 'use-promise-reading-demo.css',
    load: demoStyleSources['./demos/use-promise-reading/use-promise-reading-demo.css']!,
  },
] as const

const labLazyReportViewerSourceFiles = [
  {
    name: 'lab-lazy-report-viewer-demo.tsx',
    load: demoSources['./demos/lab-lazy-report-viewer/lab-lazy-report-viewer-demo.tsx']!,
  },
  {
    name: 'lazy-report-panel.tsx',
    load: demoSources['./demos/lab-lazy-report-viewer/lazy-report-panel.tsx']!,
  },
  {
    name: 'report-resource.ts',
    load: demoTypeScriptSources['./demos/lab-lazy-report-viewer/report-resource.ts']!,
  },
  {
    name: 'report-module-loader.ts',
    load: demoTypeScriptSources['./demos/lab-lazy-report-viewer/report-module-loader.ts']!,
  },
  {
    name: 'lab-lazy-report-viewer-demo.css',
    load: demoStyleSources['./demos/lab-lazy-report-viewer/lab-lazy-report-viewer-demo.css']!,
  },
] as const

const startTransitionBackgroundUpdateSourceFiles = [
  {
    name: 'start-transition-background-update-demo.tsx',
    load: demoSources[
      './demos/start-transition-background-update/start-transition-background-update-demo.tsx'
    ]!,
  },
  {
    name: 'start-transition-background-update.ts',
    load: demoTypeScriptSources[
      './demos/start-transition-background-update/start-transition-background-update.ts'
    ]!,
  },
  {
    name: 'start-transition-background-update-demo.css',
    load: demoStyleSources[
      './demos/start-transition-background-update/start-transition-background-update-demo.css'
    ]!,
  },
] as const

const useTransitionPendingActionSourceFiles = [
  {
    name: 'use-transition-pending-action-demo.tsx',
    load: demoSources[
      './demos/use-transition-pending-action/use-transition-pending-action-demo.tsx'
    ]!,
  },
  {
    name: 'pending-action-gate.ts',
    load: demoTypeScriptSources['./demos/use-transition-pending-action/pending-action-gate.ts']!,
  },
  {
    name: 'use-transition-pending-action-demo.css',
    load: demoStyleSources[
      './demos/use-transition-pending-action/use-transition-pending-action-demo.css'
    ]!,
  },
] as const

const useDeferredValueStaleContentSourceFiles = [
  {
    name: 'use-deferred-value-stale-content-demo.tsx',
    load: demoSources[
      './demos/use-deferred-value-stale-content/use-deferred-value-stale-content-demo.tsx'
    ]!,
  },
  {
    name: 'deferred-result-resource.ts',
    load: demoTypeScriptSources[
      './demos/use-deferred-value-stale-content/deferred-result-resource.ts'
    ]!,
  },
  {
    name: 'use-deferred-value-stale-content-demo.css',
    load: demoStyleSources[
      './demos/use-deferred-value-stale-content/use-deferred-value-stale-content-demo.css'
    ]!,
  },
] as const

const activityHiddenStateRestorationSourceFiles = [
  {
    name: 'activity-hidden-state-restoration-demo.tsx',
    load: demoSources[
      './demos/activity-hidden-state-restoration/activity-hidden-state-restoration-demo.tsx'
    ]!,
  },
  {
    name: 'activity-hidden-state-restoration-demo.css',
    load: demoStyleSources[
      './demos/activity-hidden-state-restoration/activity-hidden-state-restoration-demo.css'
    ]!,
  },
] as const

const labConcurrentSearchWorkspaceSourceFiles = [
  {
    name: 'lab-concurrent-search-workspace-demo.tsx',
    load: demoSources[
      './demos/lab-concurrent-search-workspace/lab-concurrent-search-workspace-demo.tsx'
    ]!,
  },
  {
    name: 'concurrent-search-resource.ts',
    load: demoTypeScriptSources[
      './demos/lab-concurrent-search-workspace/concurrent-search-resource.ts'
    ]!,
  },
  {
    name: 'lab-concurrent-search-workspace-demo.css',
    load: demoStyleSources[
      './demos/lab-concurrent-search-workspace/lab-concurrent-search-workspace-demo.css'
    ]!,
  },
] as const

const formActionClientSubmissionSourceFiles = [
  {
    name: 'form-action-client-submission-demo.tsx',
    load: demoSources[
      './demos/form-action-client-submission/form-action-client-submission-demo.tsx'
    ]!,
  },
  {
    name: 'form-action-client-submission-demo.css',
    load: demoStyleSources[
      './demos/form-action-client-submission/form-action-client-submission-demo.css'
    ]!,
  },
] as const

const useActionStateResultQueueSourceFiles = [
  {
    name: 'action-state-result-queue-demo.tsx',
    load: demoSources['./demos/use-action-state-result-queue/action-state-result-queue-demo.tsx']!,
  },
  {
    name: 'action-state-result-queue-demo.css',
    load: demoStyleSources[
      './demos/use-action-state-result-queue/action-state-result-queue-demo.css'
    ]!,
  },
] as const

const useOptimisticPendingStateSourceFiles = [
  {
    name: 'use-optimistic-pending-state-demo.tsx',
    load: demoSources[
      './demos/use-optimistic-pending-state/use-optimistic-pending-state-demo.tsx'
    ]!,
  },
  {
    name: 'use-optimistic-pending-state-demo.css',
    load: demoStyleSources[
      './demos/use-optimistic-pending-state/use-optimistic-pending-state-demo.css'
    ]!,
  },
] as const

const labActionReviewQueueSourceFiles = [
  {
    name: 'lab-action-review-queue-demo.tsx',
    load: demoSources['./demos/lab-action-review-queue/lab-action-review-queue-demo.tsx']!,
  },
  {
    name: 'lab-action-review-queue-demo.css',
    load: demoStyleSources['./demos/lab-action-review-queue/lab-action-review-queue-demo.css']!,
  },
] as const

const useFormStatusParentScopeSourceFiles = [
  {
    name: 'use-form-status-parent-scope-demo.tsx',
    load: demoSources[
      './demos/use-form-status-parent-scope/use-form-status-parent-scope-demo.tsx'
    ]!,
  },
  {
    name: 'use-form-status-parent-scope-demo.css',
    load: demoStyleSources[
      './demos/use-form-status-parent-scope/use-form-status-parent-scope-demo.css'
    ]!,
  },
] as const

const useSyncExternalStoreSnapshotSourceFiles = [
  {
    name: 'use-sync-external-store-snapshot-demo.tsx',
    load: demoSources[
      './demos/use-sync-external-store-snapshot/use-sync-external-store-snapshot-demo.tsx'
    ]!,
  },
  {
    name: 'use-sync-external-store-snapshot-demo.css',
    load: demoStyleSources[
      './demos/use-sync-external-store-snapshot/use-sync-external-store-snapshot-demo.css'
    ]!,
  },
] as const

const portalTreeAndDomPlacementSourceFiles = [
  {
    name: 'portal-tree-and-dom-placement-demo.tsx',
    load: demoSources[
      './demos/portal-tree-and-dom-placement/portal-tree-and-dom-placement-demo.tsx'
    ]!,
  },
  {
    name: 'portal-tree-and-dom-placement-demo.css',
    load: demoStyleSources[
      './demos/portal-tree-and-dom-placement/portal-tree-and-dom-placement-demo.css'
    ]!,
  },
] as const

const labAccessibleDialogSourceFiles = [
  {
    name: 'lab-accessible-dialog-demo.tsx',
    load: demoSources['./demos/lab-accessible-dialog/lab-accessible-dialog-demo.tsx']!,
  },
  {
    name: 'lab-accessible-dialog-demo.css',
    load: demoStyleSources['./demos/lab-accessible-dialog/lab-accessible-dialog-demo.css']!,
  },
] as const

const hydrateRootMarkupIdentitySourceFiles = [
  {
    name: 'hydrate-root-markup-identity-demo.tsx',
    load: demoSources[
      './demos/hydrate-root-markup-identity/hydrate-root-markup-identity-demo.tsx'
    ]!,
  },
  {
    name: 'hydration-fixture.html',
    load: demoHtmlSources['./demos/hydrate-root-markup-identity/hydration-fixture.html']!,
  },
  {
    name: 'hydrate-root-markup-identity-demo.css',
    load: demoStyleSources[
      './demos/hydrate-root-markup-identity/hydrate-root-markup-identity-demo.css'
    ]!,
  },
] as const

const flushSyncDomCommitSourceFiles = [
  {
    name: 'flush-sync-dom-commit-demo.tsx',
    load: demoSources['./demos/flush-sync-dom-commit/flush-sync-dom-commit-demo.tsx']!,
  },
  {
    name: 'flush-sync-dom-commit-demo.css',
    load: demoStyleSources['./demos/flush-sync-dom-commit/flush-sync-dom-commit-demo.css']!,
  },
] as const

const documentMetadataHoistingSourceFiles = [
  {
    name: 'document-metadata-hoisting-demo.tsx',
    load: demoSources['./demos/document-metadata-hoisting/document-metadata-hoisting-demo.tsx']!,
  },
  {
    name: 'document-metadata-hoisting-demo.css',
    load: demoStyleSources[
      './demos/document-metadata-hoisting/document-metadata-hoisting-demo.css'
    ]!,
  },
] as const

const declarativeStylesheetResourcesSourceFiles = [
  {
    name: 'declarative-stylesheet-resources-demo.tsx',
    load: demoSources[
      './demos/declarative-stylesheet-resources/declarative-stylesheet-resources-demo.tsx'
    ]!,
  },
  {
    name: 'declarative-stylesheet-resources-demo.css',
    load: demoStyleSources[
      './demos/declarative-stylesheet-resources/declarative-stylesheet-resources-demo.css'
    ]!,
  },
] as const

const declarativeAsyncScriptResourceSourceFiles = [
  {
    name: 'declarative-async-script-resource-demo.tsx',
    load: demoSources[
      './demos/declarative-async-script-resource/declarative-async-script-resource-demo.tsx'
    ]!,
  },
  {
    name: 'async-script-fixture.html',
    load: demoHtmlSources['./demos/declarative-async-script-resource/async-script-fixture.html']!,
  },
  {
    name: 'async-script-resource-v1.js',
    load: () => loadPublicDemoSource('/react-course-fixtures/async-script-resource-v1.js'),
  },
  {
    name: 'async-script-resource-v2.js',
    load: () => loadPublicDemoSource('/react-course-fixtures/async-script-resource-v2.js'),
  },
  {
    name: 'async-script-event-opt-out.js',
    load: () => loadPublicDemoSource('/react-course-fixtures/async-script-event-opt-out.js'),
  },
  {
    name: 'declarative-async-script-resource-demo.css',
    load: demoStyleSources[
      './demos/declarative-async-script-resource/declarative-async-script-resource-demo.css'
    ]!,
  },
] as const

const resourceHintsSourceFiles = [
  {
    name: 'resource-hints-contract.ts',
    load: demoTypeScriptSources['./demos/resource-hints/resource-hints-contract.ts']!,
  },
  {
    name: 'resource-hints-demo.tsx',
    load: demoSources['./demos/resource-hints/resource-hints-demo.tsx']!,
  },
  {
    name: 'resource-hints-fixture.tsx',
    load: demoSources['./demos/resource-hints/resource-hints-fixture.tsx']!,
  },
  {
    name: 'resource-hints-fixture.html',
    load: demoHtmlSources['./demos/resource-hints/resource-hints-fixture.html']!,
  },
  {
    name: 'resource-hints-demo.css',
    load: demoStyleSources['./demos/resource-hints/resource-hints-demo.css']!,
  },
  {
    name: 'resource-hints-fixture.css',
    load: demoStyleSources['./demos/resource-hints/resource-hints-fixture.css']!,
  },
  {
    name: 'resource-hint-classic.js',
    load: () => loadPublicDemoSource('/react-course-fixtures/resource-hint-classic.js'),
  },
  {
    name: 'resource-hint-module.js',
    load: () => loadPublicDemoSource('/react-course-fixtures/resource-hint-module.js'),
  },
  {
    name: 'resource-hint-style.css',
    load: () => loadPublicDemoSource('/react-course-fixtures/resource-hint-style.css'),
  },
] as const

const labEmbeddedStatusPanelSourceFiles = [
  {
    name: 'embedded-status-store.ts',
    load: demoTypeScriptSources['./demos/lab-embedded-status-panel/embedded-status-store.ts']!,
  },
  {
    name: 'embedded-status-panel.tsx',
    load: demoSources['./demos/lab-embedded-status-panel/embedded-status-panel.tsx']!,
  },
  {
    name: 'embedded-status-host.html',
    load: demoHtmlSources['./demos/lab-embedded-status-panel/embedded-status-host.html']!,
  },
  {
    name: 'lab-embedded-status-panel-demo.tsx',
    load: demoSources['./demos/lab-embedded-status-panel/lab-embedded-status-panel-demo.tsx']!,
  },
  {
    name: 'lab-embedded-status-panel-demo.css',
    load: demoStyleSources['./demos/lab-embedded-status-panel/lab-embedded-status-panel-demo.css']!,
  },
] as const

type DemoSourceFile = {
  readonly name: string
  readonly load: () => Promise<string>
}

/** 按声明顺序合并真实运行文件，并标出每段源码的文件名。 */
async function loadDemoSourceBundle(files: readonly DemoSourceFile[]): Promise<string> {
  const sources = await Promise.all(
    files.map(async ({ name, load }) => ({ name, source: await load() })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并模块边界 Demo 的全部运行模块，供源码区一次展开查看。 */
async function loadModuleBoundariesSource(): Promise<string> {
  const files = await Promise.all(
    moduleBoundariesSourceFiles.map(async ({ name, load }) => ({ name, source: await load() })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并静态课程目录 Demo 的全部运行源码，供源码区与运行时同源展示。 */
function loadLabStaticCourseCatalogSource(): Promise<string> {
  return loadDemoSourceBundle(labStaticCourseCatalogSourceFiles)
}

/** 合并任务编辑器 Demo 的全部运行源码，供源码区与运行时同源展示。 */
function loadLabTaskEditorSource(): Promise<string> {
  return loadDemoSourceBundle(labTaskEditorSourceFiles)
}

/** 合并 DOM Props Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadDomPropsSource(): Promise<string> {
  return loadDemoSourceBundle(domPropsSourceFiles)
}

/** 合并 useId Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadUseIdAccessibleLinksSource(): Promise<string> {
  return loadDemoSourceBundle(useIdAccessibleLinksSourceFiles)
}

/** 合并 React 表单 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadReactFormsSource(): Promise<string> {
  return loadDemoSourceBundle(reactFormsSourceFiles)
}

/** 合并商品筛选 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadProductTableSource(): Promise<string> {
  return loadDemoSourceBundle(productTableSourceFiles)
}

/** 合并课程报名 Demo 的全部运行源码，供源码区与运行时同源展示。 */
function loadLabCourseRegistrationSource(): Promise<string> {
  return loadDemoSourceBundle(labCourseRegistrationSourceFiles)
}

/** 合并 State 结构 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadStateStructureSource(): Promise<string> {
  return loadDemoSourceBundle(stateStructureSourceFiles)
}

/** 合并 State 提升 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadLiftingStateUpSource(): Promise<string> {
  return loadDemoSourceBundle(liftingStateUpSourceFiles)
}

/** 合并 State 保留与重置 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadStatePreservationAndResetSource(): Promise<string> {
  return loadDemoSourceBundle(statePreservationAndResetSourceFiles)
}

/** 合并多步骤编辑器 Demo 的全部运行源码，供源码区与运行时同源展示。 */
function loadLabMultiStepEditorSource(): Promise<string> {
  return loadDemoSourceBundle(labMultiStepEditorSourceFiles)
}

/** 合并 useReducer Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadUseReducerSource(): Promise<string> {
  return loadDemoSourceBundle(useReducerSourceFiles)
}

/** 合并 Context Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadContextProvidingAndReadingSource(): Promise<string> {
  return loadDemoSourceBundle(contextProvidingAndReadingSourceFiles)
}

/** 合并 Reducer 与 Context Demo 的 TSX 与 CSS 真实运行源码。 */
function loadReducerContextCompositionSource(): Promise<string> {
  return loadDemoSourceBundle(reducerContextCompositionSourceFiles)
}

/** 合并状态共享边界 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadStateSharingBoundarySource(): Promise<string> {
  return loadDemoSourceBundle(stateSharingBoundarySourceFiles)
}

/** 合并共享任务工作区 Demo 的全部运行源码，供源码区与运行时同源展示。 */
function loadLabSharedTaskWorkspaceSource(): Promise<string> {
  return loadDemoSourceBundle(labSharedTaskWorkspaceSourceFiles)
}

/** 合并 ref 作为 prop Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadRefAsPropSource(): Promise<string> {
  return loadDemoSourceBundle(refAsPropSourceFiles)
}

/** 合并 useImperativeHandle Demo 的组件与样式源码。 */
function loadUseImperativeHandleSource(): Promise<string> {
  return loadDemoSourceBundle(useImperativeHandleSourceFiles)
}

/** 合并 useLayoutEffect Demo 的组件与样式源码。 */
function loadUseLayoutEffectSource(): Promise<string> {
  return loadDemoSourceBundle(useLayoutEffectSourceFiles)
}

/** 合并 useInsertionEffect Demo 的组件与样式源码。 */
function loadUseInsertionEffectSource(): Promise<string> {
  return loadDemoSourceBundle(useInsertionEffectSourceFiles)
}

/** 合并 useEffect 外部同步 Demo 的组件与样式源码。 */
function loadUseEffectSource(): Promise<string> {
  return loadDemoSourceBundle(useEffectSourceFiles)
}

/** 合并 Effect cleanup Demo 的组件与样式源码。 */
function loadEffectCleanupSource(): Promise<string> {
  return loadDemoSourceBundle(effectCleanupSourceFiles)
}

/** 合并 Effect 生命周期 Demo 的组件与样式源码。 */
function loadEffectLifecycleSource(): Promise<string> {
  return loadDemoSourceBundle(effectLifecycleSourceFiles)
}

/** 合并不需要 Effect Demo 的组件与样式源码。 */
function loadUnnecessaryEffectsSource(): Promise<string> {
  return loadDemoSourceBundle(unnecessaryEffectsSourceFiles)
}

/** 合并 Effect 依赖 Demo 的组件与样式源码。 */
function loadEffectDependenciesSource(): Promise<string> {
  return loadDemoSourceBundle(effectDependenciesSourceFiles)
}

/** 合并 Effect 对象依赖 Demo 的组件与样式源码。 */
function loadEffectObjectDependencySource(): Promise<string> {
  return loadDemoSourceBundle(effectObjectDependencySourceFiles)
}

/** 合并 Effect Event Demo 的 TSX 与 CSS 真实运行源码。 */
function loadEffectEventsSource(): Promise<string> {
  return loadDemoSourceBundle(effectEventsSourceFiles)
}

/** 合并自定义 Hook Demo 的 TSX 与 CSS 真实运行源码。 */
function loadCustomHooksSource(): Promise<string> {
  return loadDemoSourceBundle(customHooksSourceFiles)
}

/** 合并 StrictMode Demo 的 TSX 与 CSS 真实运行源码。 */
function loadStrictModeDevelopmentChecksSource(): Promise<string> {
  return loadDemoSourceBundle(strictModeDevelopmentChecksSourceFiles)
}

/** 合并可切换聊天室 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadLabSynchronizedChatRoomSource(): Promise<string> {
  return loadDemoSourceBundle(labSynchronizedChatRoomSourceFiles)
}

/** 合并 Profiler 测量 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadProfilerRenderMeasurementSource(): Promise<string> {
  return loadDemoSourceBundle(profilerRenderMeasurementSourceFiles)
}

/** 合并 useMemo 值缓存 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadUseMemoValueCachingSource(): Promise<string> {
  return loadDemoSourceBundle(useMemoValueCachingSourceFiles)
}

/** 合并 memo 组件跳过渲染 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadMemoComponentBailoutSource(): Promise<string> {
  return loadDemoSourceBundle(memoComponentBailoutSourceFiles)
}

/** 合并 useCallback 函数身份 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadUseCallbackFunctionIdentitySource(): Promise<string> {
  return loadDemoSourceBundle(useCallbackFunctionIdentitySourceFiles)
}

/** 合并渲染性能诊断实战 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadLabRenderPerformanceSource(): Promise<string> {
  return loadDemoSourceBundle(labRenderPerformanceSourceFiles)
}

/** 合并 Error Boundary Demo 的 TSX 与 CSS 真实运行源码。 */
function loadErrorBoundaryRenderFailuresSource(): Promise<string> {
  return loadDemoSourceBundle(errorBoundaryRenderFailuresSourceFiles)
}

/** 合并 lazy Demo 的全部运行文件，供源码区一次展开查看。 */
function loadLazyComponentCodeSplittingSource(): Promise<string> {
  return loadDemoSourceBundle(lazyComponentCodeSplittingSourceFiles)
}

/** 合并 Suspense fallback Demo 的全部运行模块，供源码区一次展开查看。 */
async function loadSuspenseFallbackBoundarySource(): Promise<string> {
  const files = await Promise.all(
    suspenseFallbackBoundarySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 use 资源读取 Demo 的全部运行模块，供源码区一次展开查看。 */
async function loadUseResourceReadingSource(): Promise<string> {
  const files = await Promise.all(
    useResourceReadingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并异步报告查看器 Demo 的 TSX、TS 与 CSS 真实运行源码。 */
async function loadLabLazyReportViewerSource(): Promise<string> {
  const files = await Promise.all(
    labLazyReportViewerSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 startTransition Demo 的全部运行源码，供源码区一次展开查看。 */
function loadStartTransitionBackgroundUpdateSource(): Promise<string> {
  return loadDemoSourceBundle(startTransitionBackgroundUpdateSourceFiles)
}

/** 合并 useTransition Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseTransitionPendingActionSource(): Promise<string> {
  return loadDemoSourceBundle(useTransitionPendingActionSourceFiles)
}

/** 合并 useDeferredValue Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseDeferredValueStaleContentSource(): Promise<string> {
  return loadDemoSourceBundle(useDeferredValueStaleContentSourceFiles)
}

/** 合并 Activity Demo 的全部运行源码，供源码区一次展开查看。 */
function loadActivityHiddenStateRestorationSource(): Promise<string> {
  return loadDemoSourceBundle(activityHiddenStateRestorationSourceFiles)
}

/** 合并并发搜索工作区 Demo 的全部运行源码，供源码区同源展示。 */
function loadLabConcurrentSearchWorkspaceSource(): Promise<string> {
  return loadDemoSourceBundle(labConcurrentSearchWorkspaceSourceFiles)
}

/** 合并客户端 Form Action Demo 的全部运行源码，供源码区一次展开查看。 */
function loadFormActionClientSubmissionSource(): Promise<string> {
  return loadDemoSourceBundle(formActionClientSubmissionSourceFiles)
}

/** 合并 useActionState Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseActionStateResultQueueSource(): Promise<string> {
  return loadDemoSourceBundle(useActionStateResultQueueSourceFiles)
}

/** 合并 useOptimistic Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseOptimisticPendingStateSource(): Promise<string> {
  return loadDemoSourceBundle(useOptimisticPendingStateSourceFiles)
}

/** 合并异步审核队列 Demo 的全部运行源码，供源码区一次展开查看。 */
function loadLabActionReviewQueueSource(): Promise<string> {
  return loadDemoSourceBundle(labActionReviewQueueSourceFiles)
}

/** 合并 useFormStatus Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseFormStatusParentScopeSource(): Promise<string> {
  return loadDemoSourceBundle(useFormStatusParentScopeSourceFiles)
}

/** 合并 useSyncExternalStore Demo 的全部运行源码，供源码区一次展开查看。 */
function loadUseSyncExternalStoreSnapshotSource(): Promise<string> {
  return loadDemoSourceBundle(useSyncExternalStoreSnapshotSourceFiles)
}

/** 合并 Portal 树与 DOM 落点 Demo 的全部运行源码，供源码区一次展开查看。 */
async function loadPortalTreeAndDomPlacementSource(): Promise<string> {
  const files = await Promise.all(
    portalTreeAndDomPlacementSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并可访问对话框 Demo 的组件与样式源码，供源码区与运行时同源展示。 */
function loadLabAccessibleDialogSource(): Promise<string> {
  return loadDemoSourceBundle(labAccessibleDialogSourceFiles)
}

/** 合并 hydrateRoot Demo 的 TSX、HTML fixture 与 CSS，供源码区与运行时同源展示。 */
async function loadHydrateRootMarkupIdentitySource(): Promise<string> {
  const files = await Promise.all(
    hydrateRootMarkupIdentitySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return files.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 flushSync Demo 的 TSX 与 CSS，供源码区与运行时同源展示。 */
function loadFlushSyncDomCommitSource(): Promise<string> {
  return loadDemoSourceBundle(flushSyncDomCommitSourceFiles)
}

/** 合并文档元数据提升 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadDocumentMetadataHoistingSource(): Promise<string> {
  return loadDemoSourceBundle(documentMetadataHoistingSourceFiles)
}

/** 合并声明式样式资源 Demo 的 TSX 与 CSS 真实运行源码。 */
function loadDeclarativeStylesheetResourcesSource(): Promise<string> {
  return loadDemoSourceBundle(declarativeStylesheetResourcesSourceFiles)
}

/** 合并声明式异步脚本资源 Demo 与实际同源静态脚本源码。 */
function loadDeclarativeAsyncScriptResourceSource(): Promise<string> {
  return loadDemoSourceBundle(declarativeAsyncScriptResourceSourceFiles)
}

/** 合并资源提示父页面、独立 realm 与同源静态资源的真实运行源码。 */
function loadResourceHintsSource(): Promise<string> {
  return loadDemoSourceBundle(resourceHintsSourceFiles)
}

/** 合并嵌入式状态面板的 Store、组件、宿主页、控制器与样式源码。 */
function loadLabEmbeddedStatusPanelSource(): Promise<string> {
  return loadDemoSourceBundle(labEmbeddedStatusPanelSourceFiles)
}

export const reactCoreDemoAssets: DemoAssetManifest[] = [
  {
    id: 'react.core.admission.lifecycle-probe',
    title: 'React 生命周期探针',
    runtime: 'react',
    loadComponent: demoComponents[demoPath]!,
    loadSource: demoSources[demoPath]!,
  },
  {
    id: 'react.core.learn.basics.tsx-markup-syntax.markup-structure-demo',
    title: 'TSX 标记与 Fragment',
    runtime: 'react',
    loadComponent: demoComponents['./demos/tsx-markup-syntax/tsx-markup-syntax-demo.tsx']!,
    loadSource: demoSources['./demos/tsx-markup-syntax/tsx-markup-syntax-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.tsx-expressions-and-attributes.expression-attributes-demo',
    title: 'TSX 表达式与属性示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/tsx-expressions-and-attributes/tsx-expressions-and-attributes-demo.tsx'
      ]!,
    loadSource:
      demoSources[
        './demos/tsx-expressions-and-attributes/tsx-expressions-and-attributes-demo.tsx'
      ]!,
  },
  {
    id: 'react.core.learn.basics.jsx-runtime-and-react-element.element-model-demo',
    title: 'JSX Runtime 与 React Element 示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/jsx-runtime-and-react-element/jsx-runtime-and-react-element-demo.tsx'
      ]!,
    loadSource:
      demoSources['./demos/jsx-runtime-and-react-element/jsx-runtime-and-react-element-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.react-root-lifecycle.root-lifecycle-demo',
    title: 'React Root 与页面入口示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/react-root-lifecycle/react-root-lifecycle-demo.tsx']!,
    loadSource: demoSources['./demos/react-root-lifecycle/react-root-lifecycle-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.function-components.pure-component-demo',
    title: '函数组件',
    runtime: 'react',
    loadComponent: demoComponents['./demos/function-components/function-components-demo.tsx']!,
    loadSource: demoSources['./demos/function-components/function-components-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.module-boundaries-and-component-tree.tree-comparison-demo',
    title: '模块依赖树与 React render tree 对照',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/module-boundaries-and-component-tree/module-boundaries-and-component-tree-demo.tsx'
      ]!,
    loadSource: loadModuleBoundariesSource,
  },
  {
    id: 'react.core.learn.basics.props.input-contract-demo',
    title: 'Props 输入合同示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/props/props-demo.tsx']!,
    loadSource: demoSources['./demos/props/props-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.children-and-composition.composition-boundaries-demo',
    title: 'children 与组合边界示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/children-and-composition/children-and-composition-demo.tsx']!,
    loadSource: demoSources['./demos/children-and-composition/children-and-composition-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.conditional-rendering.branch-selection-demo',
    title: '条件分支与 ReactNode 结果对照',
    runtime: 'react',
    loadComponent: demoComponents['./demos/conditional-rendering/conditional-rendering-demo.tsx']!,
    loadSource: demoSources['./demos/conditional-rendering/conditional-rendering-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.list-rendering-and-key.data-identity-demo',
    title: '数组转换与稳定 key 示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/list-rendering-and-key/list-rendering-and-key-demo.tsx']!,
    loadSource: demoSources['./demos/list-rendering-and-key/list-rendering-and-key-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.lab-static-course-catalog.static-catalog-demo',
    title: '静态课程目录',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-static-course-catalog/lab-static-course-catalog-demo.tsx']!,
    loadSource: loadLabStaticCourseCatalogSource,
  },
  {
    id: 'react.core.learn.basics.component-purity.local-mutation-demo',
    title: '组件纯度与局部修改',
    runtime: 'react',
    loadComponent: demoComponents['./demos/component-purity/component-purity-demo.tsx']!,
    loadSource: demoSources['./demos/component-purity/component-purity-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.event-handling.propagation-control-demo',
    title: '事件传播与默认行为对照',
    runtime: 'react',
    loadComponent: demoComponents['./demos/event-handling/event-handling-demo.tsx']!,
    loadSource: demoSources['./demos/event-handling/event-handling-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.use-state.state-hook-demo',
    title: 'useState 状态变量与 setter 对照',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-state/use-state-demo.tsx']!,
    loadSource: demoSources['./demos/use-state/use-state-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.render-commit-and-state-snapshot.snapshot-demo',
    title: 'Render 与 State 快照示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/render-commit-and-state-snapshot/render-commit-and-state-snapshot-demo.tsx'
      ]!,
    loadSource:
      demoSources[
        './demos/render-commit-and-state-snapshot/render-commit-and-state-snapshot-demo.tsx'
      ]!,
  },
  {
    id: 'react.core.learn.basics.immutable-state-updates.immutable-state-demo',
    title: '对象与数组 State 不可变更新',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/immutable-state-updates/immutable-state-updates-demo.tsx']!,
    loadSource: demoSources['./demos/immutable-state-updates/immutable-state-updates-demo.tsx']!,
  },
  {
    id: 'react.core.learn.basics.lab-task-editor.task-editor-demo',
    title: '任务编辑器',
    runtime: 'react',
    loadComponent: demoComponents['./demos/lab-task-editor/lab-task-editor-demo.tsx']!,
    loadSource: loadLabTaskEditorSource,
  },
  {
    id: 'react.core.learn.basics.dom-props.dom-props-demo',
    title: 'DOM Props 映射与透传示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/dom-props/dom-props-demo.tsx']!,
    loadSource: loadDomPropsSource,
  },
  {
    id: 'react.core.learn.basics.use-id-accessible-links.accessible-field-demo',
    title: 'useId 可访问关联示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-id-accessible-links/use-id-accessible-links-demo.tsx']!,
    loadSource: loadUseIdAccessibleLinksSource,
  },
  {
    id: 'react.core.learn.basics.react-forms.form-values-demo',
    title: 'React 表单当前值与提交数据',
    runtime: 'react',
    loadComponent: demoComponents['./demos/react-forms/react-forms-demo.tsx']!,
    loadSource: loadReactFormsSource,
  },
  {
    id: 'react.core.learn.basics.product-table-demo',
    title: '筛选商品的 State 所有权',
    runtime: 'react',
    loadComponent: demoComponents['./demos/product-table/product-table-demo.tsx']!,
    loadSource: loadProductTableSource,
  },
  {
    id: 'react.core.learn.basics.lab-course-registration.course-registration-demo',
    title: '课程报名',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-course-registration/lab-course-registration-demo.tsx']!,
    loadSource: loadLabCourseRegistrationSource,
  },
  {
    id: 'react.core.learn.intermediate.state-structure.state-model-demo',
    title: 'State 结构与派生结果',
    runtime: 'react',
    loadComponent: demoComponents['./demos/state-structure/state-model-demo.tsx']!,
    loadSource: loadStateStructureSource,
  },
  {
    id: 'react.core.learn.intermediate.lifting-state-up.synced-inputs-demo',
    title: 'State 提升与值所有权示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/lifting-state-up/synced-inputs-demo.tsx']!,
    loadSource: loadLiftingStateUpSource,
  },
  {
    id: 'react.core.learn.intermediate.state-preservation-and-reset.state-preservation-demo',
    title: 'State 保留与重置示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/state-preservation-and-reset/state-preservation-demo.tsx']!,
    loadSource: loadStatePreservationAndResetSource,
  },
  {
    id: 'react.core.learn.intermediate.lab-multi-step-editor.multi-step-editor-demo',
    title: '多步骤编辑器',
    runtime: 'react',
    loadComponent: demoComponents['./demos/lab-multi-step-editor/lab-multi-step-editor-demo.tsx']!,
    loadSource: loadLabMultiStepEditorSource,
  },
  {
    id: 'react.core.learn.intermediate.use-reducer.task-board-demo',
    title: 'useReducer、Action 与纯 reducer',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-reducer/task-board-demo.tsx']!,
    loadSource: loadUseReducerSource,
  },
  {
    id: 'react.core.learn.intermediate.context-providing-and-reading.context-tree-demo',
    title: 'Context 树读取示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/context-providing-and-reading/context-providing-and-reading-demo.tsx'
      ]!,
    loadSource: loadContextProvidingAndReadingSource,
  },
  {
    id: 'react.core.learn.intermediate.reducer-context-composition.task-context-demo',
    title: 'Reducer 与 Context 任务工作区示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/reducer-context-composition/task-context-demo.tsx']!,
    loadSource: loadReducerContextCompositionSource,
  },
  {
    id: 'react.core.learn.intermediate.state-sharing-boundary.state-ownership-boundary-demo',
    title: '状态共享边界示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/state-sharing-boundary/state-ownership-boundary-demo.tsx']!,
    loadSource: loadStateSharingBoundarySource,
  },
  {
    id: 'react.core.learn.intermediate.lab-shared-task-workspace.shared-task-workspace-demo',
    title: '共享任务工作区',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-shared-task-workspace/lab-shared-task-workspace-demo.tsx']!,
    loadSource: loadLabSharedTaskWorkspaceSource,
  },
  {
    id: 'react.core.learn.intermediate.use-ref.mutable-value-buffer-demo',
    title: 'Ref 工作值与 State 公开快照示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-ref/use-ref-demo.tsx']!,
    loadSource: demoSources['./demos/use-ref/use-ref-demo.tsx']!,
  },
  {
    id: 'react.core.learn.intermediate.dom-refs.host-node-actions-demo',
    title: 'DOM Ref 宿主节点操作示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/dom-refs/dom-refs-demo.tsx']!,
    loadSource: demoSources['./demos/dom-refs/dom-refs-demo.tsx']!,
  },
  {
    id: 'react.core.learn.intermediate.dom-refs.dynamic-node-map-demo',
    title: 'Callback Ref 动态节点索引示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/callback-refs/callback-refs-demo.tsx']!,
    loadSource: demoSources['./demos/callback-refs/callback-refs-demo.tsx']!,
  },
  {
    id: 'react.core.learn.intermediate.ref-as-prop.transparent-input-ref-demo',
    title: 'ref 作为 prop 透明转交示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/ref-as-prop/ref-as-prop-demo.tsx']!,
    loadSource: loadRefAsPropSource,
  },
  {
    id: 'react.core.learn.advanced.portal-tree-and-dom-placement.portal-placement-demo',
    title: 'Portal React 树语义与 DOM 落点示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/portal-tree-and-dom-placement/portal-tree-and-dom-placement-demo.tsx'
      ]!,
    loadSource: loadPortalTreeAndDomPlacementSource,
  },
  {
    id: 'react.core.learn.intermediate.lab-accessible-dialog.accessible-dialog-demo',
    title: '可访问课程公告对话框',
    runtime: 'react',
    loadComponent: demoComponents['./demos/lab-accessible-dialog/lab-accessible-dialog-demo.tsx']!,
    loadSource: loadLabAccessibleDialogSource,
  },
  {
    id: 'react.core.learn.intermediate.use-imperative-handle.restricted-input-handle-demo',
    title: 'useImperativeHandle 受限命令接口示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-imperative-handle/use-imperative-handle-demo.tsx']!,
    loadSource: loadUseImperativeHandleSource,
  },
  {
    id: 'react.core.learn.intermediate.use-effect.external-mode-widget-demo',
    title: 'useEffect 外部模式同步示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-effect/use-effect-demo.tsx']!,
    loadSource: loadUseEffectSource,
  },
  {
    id: 'react.core.learn.intermediate.use-effect.effect-cleanup-event-listener-symmetry-demo',
    title: 'Effect 清理事件监听对称示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/effect-cleanup/event-listener-symmetry-demo.tsx']!,
    loadSource: loadEffectCleanupSource,
  },
  {
    id: 'react.core.learn.intermediate.use-effect.effect-lifecycle-room-sync-process-demo',
    title: 'Effect 生命周期房间同步过程示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/effect-lifecycle/room-sync-process-demo.tsx']!,
    loadSource: loadEffectLifecycleSource,
  },
  {
    id: 'react.core.learn.intermediate.unnecessary-effects.render-and-event-boundary-demo',
    title: '不需要 Effect 的 Render 与事件边界示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/unnecessary-effects/render-and-event-boundary-demo.tsx']!,
    loadSource: loadUnnecessaryEffectsSource,
  },
  {
    id: 'react.core.learn.intermediate.effect-dependencies.dependency-map-demo',
    title: 'Effect 完整依赖清单示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/effect-dependencies/dependency-map-demo.tsx']!,
    loadSource: loadEffectDependenciesSource,
  },
  {
    id: 'react.core.learn.intermediate.effect-dependencies.options-sync-demo',
    title: 'Effect 对象依赖稳定化示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/removing-effect-dependencies/options-sync-demo.tsx']!,
    loadSource: loadEffectObjectDependencySource,
  },
  {
    id: 'react.core.learn.intermediate.effect-events.latest-notification-demo',
    title: 'Effect Event 最新通知示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/effect-events/latest-notification-demo.tsx']!,
    loadSource: loadEffectEventsSource,
  },
  {
    id: 'react.core.learn.intermediate.custom-hooks.independent-counters-demo',
    title: '自定义 Hook 独立计数示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/custom-hooks/independent-counters-demo.tsx']!,
    loadSource: loadCustomHooksSource,
  },
  {
    id: 'react.core.learn.intermediate.strict-mode-development-checks.resource-symmetry-demo',
    title: 'StrictMode 资源对称性示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/strict-mode-development-checks/resource-symmetry-demo.tsx']!,
    loadSource: loadStrictModeDevelopmentChecksSource,
  },
  {
    id: 'react.core.learn.intermediate.lab-synchronized-chat-room.lab-synchronized-chat-room-demo',
    title: '可切换聊天室连接生命周期示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-synchronized-chat-room/lab-synchronized-chat-room-demo.tsx']!,
    loadSource: loadLabSynchronizedChatRoomSource,
  },
  {
    id: 'react.core.learn.advanced.profiler-render-measurement.commit-duration-demo',
    title: 'Profiler Commit 渲染测量示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/profiler-render-measurement/profiler-render-measurement-demo.tsx']!,
    loadSource: loadProfilerRenderMeasurementSource,
  },
  {
    id: 'react.core.learn.advanced.use-memo-value-caching.value-cache-demo',
    title: 'useMemo 值缓存与依赖变化示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-memo-value-caching/use-memo-value-caching-demo.tsx']!,
    loadSource: loadUseMemoValueCachingSource,
  },
  {
    id: 'react.core.learn.advanced.memo-component-bailout.parent-update-demo',
    title: 'memo 组件跳过渲染示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/memo-component-bailout/memo-component-bailout-demo.tsx']!,
    loadSource: loadMemoComponentBailoutSource,
  },
  {
    id: 'react.core.learn.intermediate.use-layout-effect.prepaint-measurement-demo',
    title: 'useLayoutEffect 绘制前测量示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-layout-effect/prepaint-measurement-demo.tsx']!,
    loadSource: loadUseLayoutEffectSource,
  },
  {
    id: 'react.core.learn.advanced.use-callback-function-identity.callback-bailout-demo',
    title: 'useCallback 函数身份对照示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/use-callback-function-identity/use-callback-function-identity-demo.tsx'
      ]!,
    loadSource: loadUseCallbackFunctionIdentitySource,
  },
  {
    id: 'react.core.learn.advanced.lab-render-performance.render-diagnosis-demo',
    title: '渲染性能诊断对照实验',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-render-performance/lab-render-performance-demo.tsx']!,
    loadSource: loadLabRenderPerformanceSource,
  },
  {
    id: 'react.core.learn.advanced.error-boundary-render-failures.local-fallback-recovery-demo',
    title: 'Error Boundary 局部隔离与恢复示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/error-boundary-render-failures/error-boundary-render-failures-demo.tsx'
      ]!,
    loadSource: loadErrorBoundaryRenderFailuresSource,
  },
  {
    id: 'react.core.learn.advanced.lazy-component-code-splitting.on-demand-panel-demo',
    title: 'lazy 模块缓存与组件 State 生命周期示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/lazy-component-code-splitting/lazy-component-code-splitting-demo.tsx'
      ]!,
    loadSource: loadLazyComponentCodeSplittingSource,
  },
  {
    id: 'react.core.learn.advanced.suspense-fallback-boundary.nested-reveal-demo',
    title: 'Suspense 最近边界与嵌套 reveal 示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/suspense-fallback-boundary/suspense-fallback-boundary-demo.tsx']!,
    loadSource: loadSuspenseFallbackBoundarySource,
  },
  {
    id: 'react.core.learn.advanced.use-resource-reading.resource-reading-demo',
    title: 'use 读取 Context 与 Promise 示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/use-promise-reading/use-promise-reading-demo.tsx']!,
    loadSource: loadUseResourceReadingSource,
  },
  {
    id: 'react.core.learn.advanced.lab-lazy-report-viewer.lazy-report-viewer-demo',
    title: '异步报告查看器边界分层示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-lazy-report-viewer/lab-lazy-report-viewer-demo.tsx']!,
    loadSource: loadLabLazyReportViewerSource,
  },
  {
    id: 'react.core.learn.advanced.use-transition-pending-action.background-update-demo',
    title: 'startTransition 后台视图与普通输入示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/start-transition-background-update/start-transition-background-update-demo.tsx'
      ]!,
    loadSource: loadStartTransitionBackgroundUpdateSource,
  },
  {
    id: 'react.core.learn.advanced.use-transition-pending-action.pending-action-demo',
    title: 'useTransition pending Action 生命周期示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/use-transition-pending-action/use-transition-pending-action-demo.tsx'
      ]!,
    loadSource: loadUseTransitionPendingActionSource,
  },
  {
    id: 'react.core.learn.advanced.use-deferred-value-stale-content.stale-results-demo',
    title: 'useDeferredValue 陈旧结果示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/use-deferred-value-stale-content/use-deferred-value-stale-content-demo.tsx'
      ]!,
    loadSource: loadUseDeferredValueStaleContentSource,
  },
  {
    id: 'react.core.learn.advanced.activity-hidden-state-restoration.hidden-workspace-demo',
    title: 'Activity 隐藏与状态恢复示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/activity-hidden-state-restoration/activity-hidden-state-restoration-demo.tsx'
      ]!,
    loadSource: loadActivityHiddenStateRestorationSource,
  },
  {
    id: 'react.core.learn.advanced.lab-concurrent-search-workspace.concurrent-search-demo',
    title: '并发搜索工作区状态协作示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/lab-concurrent-search-workspace/lab-concurrent-search-workspace-demo.tsx'
      ]!,
    loadSource: loadLabConcurrentSearchWorkspaceSource,
  },
  {
    id: 'react.core.learn.advanced.form-action-client-submission.client-action-demo',
    title: '客户端 Form Action 提交与成功重置示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/form-action-client-submission/form-action-client-submission-demo.tsx'
      ]!,
    loadSource: loadFormActionClientSubmissionSource,
  },
  {
    id: 'react.core.learn.advanced.use-action-state-result-queue.result-queue-demo',
    title: 'useActionState 结果排队示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-action-state-result-queue/action-state-result-queue-demo.tsx']!,
    loadSource: loadUseActionStateResultQueueSource,
  },
  {
    id: 'react.core.learn.advanced.use-optimistic-pending-state.optimistic-items-demo',
    title: 'useOptimistic 临时条目成功与回滚示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-optimistic-pending-state/use-optimistic-pending-state-demo.tsx']!,
    loadSource: loadUseOptimisticPendingStateSource,
  },
  {
    id: 'react.core.learn.advanced.lab-action-review-queue.review-workflow-demo',
    title: '异步审核队列状态协作示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-action-review-queue/lab-action-review-queue-demo.tsx']!,
    loadSource: loadLabActionReviewQueueSource,
  },
  {
    id: 'react.core.learn.advanced.form-action-client-submission.parent-form-status-demo',
    title: 'useFormStatus 提交状态与父表单作用域示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-form-status-parent-scope/use-form-status-parent-scope-demo.tsx']!,
    loadSource: loadUseFormStatusParentScopeSource,
  },
  {
    id: 'react.core.learn.advanced.use-sync-external-store-snapshot.external-store-snapshot-demo',
    title: 'useSyncExternalStore 缓存快照与订阅清理示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/use-sync-external-store-snapshot/use-sync-external-store-snapshot-demo.tsx'
      ]!,
    loadSource: loadUseSyncExternalStoreSnapshotSource,
  },
  {
    id: 'react.core.learn.advanced.hydrate-root-markup-identity.hydration-fixture-demo',
    title: 'hydrateRoot 标记接管与 Root 生命周期示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/hydrate-root-markup-identity/hydrate-root-markup-identity-demo.tsx']!,
    loadSource: loadHydrateRootMarkupIdentitySource,
  },
  {
    id: 'react.core.learn.advanced.flush-sync-dom-commit.synchronous-inspection-demo',
    title: 'flushSync 同步 DOM 读取边界示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/flush-sync-dom-commit/flush-sync-dom-commit-demo.tsx']!,
    loadSource: loadFlushSyncDomCommitSource,
  },
  {
    id: 'react.core.learn.advanced.document-metadata-hoisting.isolated-document-demo',
    title: '文档元数据提升隔离示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/document-metadata-hoisting/document-metadata-hoisting-demo.tsx']!,
    loadSource: loadDocumentMetadataHoistingSource,
  },
  {
    id: 'react.core.learn.advanced.declarative-stylesheet-resources.isolated-resource-demo',
    title: '声明式样式资源隔离示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/declarative-stylesheet-resources/declarative-stylesheet-resources-demo.tsx'
      ]!,
    loadSource: loadDeclarativeStylesheetResourcesSource,
  },
  {
    id: 'react.core.learn.advanced.declarative-async-script-resource.isolated-script-demo',
    title: '声明式异步脚本资源隔离示例',
    runtime: 'react',
    loadComponent:
      demoComponents[
        './demos/declarative-async-script-resource/declarative-async-script-resource-demo.tsx'
      ]!,
    loadSource: loadDeclarativeAsyncScriptResourceSource,
  },
  {
    id: 'react.core.learn.advanced.resource-hints.isolated-realm-demo',
    title: '资源提示 API 隔离示例',
    runtime: 'react',
    loadComponent: demoComponents['./demos/resource-hints/resource-hints-demo.tsx']!,
    loadSource: loadResourceHintsSource,
  },
  {
    id: 'react.core.learn.intermediate.use-insertion-effect.css-in-js-style-insertion-demo',
    title: 'useInsertionEffect 运行时样式插入示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/use-insertion-effect/css-in-js-style-insertion-demo.tsx']!,
    loadSource: loadUseInsertionEffectSource,
  },
  {
    id: 'react.core.learn.advanced.lab-embedded-status-panel.host-integration-demo',
    title: '嵌入式状态面板宿主集成示例',
    runtime: 'react',
    loadComponent:
      demoComponents['./demos/lab-embedded-status-panel/lab-embedded-status-panel-demo.tsx']!,
    loadSource: loadLabEmbeddedStatusPanelSource,
  },
]
