import type { DemoAssetManifest, ReactComponentModule } from '@/common/content/demo-registry'

type FirstStoreDemoModule = {
  createFirstStoreDemo: () => ReactComponentModule['default']
}

type StateAndActionsDemoModule = {
  createStateAndActionsDemo: () => ReactComponentModule['default']
}

type SetStateUpdatesDemoModule = {
  createSetStateUpdatesDemo: () => ReactComponentModule['default']
}

type GetCurrentStateDemoModule = {
  createGetCurrentStateDemo: () => ReactComponentModule['default']
}

type ComponentSubscriptionDemoModule = {
  createComponentSubscriptionDemo: () => ReactComponentModule['default']
}

type SelectorDemoModule = {
  createSelectorDemo: () => ReactComponentModule['default']
}

type ObjectAndArrayUpdatesDemoModule = {
  createObjectAndArrayUpdatesDemo: () => ReactComponentModule['default']
}

type TypescriptStoreDemoModule = {
  createTypescriptStoreDemo: () => ReactComponentModule['default']
}

type StateOwnershipDemoModule = {
  createStateOwnershipDemo: () => ReactComponentModule['default']
}

type TaskFilterDemoModule = {
  createTaskFilterDemo: () => ReactComponentModule['default']
}

type ShoppingCartDemoModule = {
  createShoppingCartDemo: () => ReactComponentModule['default']
}

type AtomicSelectorDemoModule = {
  createAtomicSelectorDemo: () => ReactComponentModule['default']
}

type SelectorResultStabilityDemoModule = {
  createSelectorResultStabilityDemo: () => ReactComponentModule['default']
}

type UseShallowDemoModule = {
  createUseShallowDemo: () => ReactComponentModule['default']
}

type DerivedStateDemoModule = {
  createDerivedStateDemo: () => ReactComponentModule['default']
}

type AsyncActionDemoModule = {
  createAsyncActionDemo: () => ReactComponentModule['default']
}

type StateResetDemoModule = {
  createStateResetDemo: () => ReactComponentModule['default']
}

type PersistDemoModule = {
  createPersistDemo: () => ReactComponentModule['default']
}

type DevtoolsDemoModule = {
  createDevtoolsDemo: () => ReactComponentModule['default']
}

type SubscribeDemoModule = {
  createSubscribeDemo: () => ReactComponentModule['default']
}

type SlicesPatternDemoModule = {
  createSlicesPatternDemo: () => ReactComponentModule['default']
}

type PreferencesCenterDemoModule = {
  createPreferencesCenterDemo: () => ReactComponentModule['default']
}

type ContentWorkspaceDemoModule = {
  createContentWorkspaceDemo: () => ReactComponentModule['default']
}

type VanillaStoreDemoModule = {
  createVanillaStoreDemo: () => ReactComponentModule['default']
}

type ContextScopeDemoModule = {
  createContextScopeDemo: () => ReactComponentModule['default']
}

type StoreFactoryDemoModule = {
  createStoreFactoryDemo: () => ReactComponentModule['default']
}

type AdvancedTypescriptDemoModule = {
  createAdvancedTypescriptDemo: () => ReactComponentModule['default']
}

type SubscribeWithSelectorDemoModule = {
  createSubscribeWithSelectorDemo: () => ReactComponentModule['default']
}

type MiddlewareCompositionDemoModule = {
  createMiddlewareCompositionDemo: () => ReactComponentModule['default']
}

type ImmerMiddlewareDemoModule = {
  createImmerMiddlewareDemo: () => ReactComponentModule['default']
}

type PersistVersionMigrationDemoModule = {
  createPersistVersionMigrationDemo: () => ReactComponentModule['default']
}

type ZustandTestingDemoModule = {
  createZustandTestingDemo: () => ReactComponentModule['default']
}

type SsrAndHydrationDemoModule = {
  createSsrAndHydrationDemo: () => ReactComponentModule['default']
}

type MultiInstanceEditorDemoModule = {
  createMultiInstanceEditorDemo: () => ReactComponentModule['default']
}

type ClientStatePlatformDemoModule = {
  createClientStatePlatformDemo: () => ReactComponentModule['default']
}

const firstStoreFactories = import.meta.glob<FirstStoreDemoModule>('./demos/first-store/*.tsx')
const stateAndActionsFactories = import.meta.glob<StateAndActionsDemoModule>(
  './demos/state-and-actions/*.tsx',
)
const setStateUpdatesFactories = import.meta.glob<SetStateUpdatesDemoModule>(
  './demos/set-state-updates/*.tsx',
)
const getCurrentStateFactories = import.meta.glob<GetCurrentStateDemoModule>(
  './demos/get-current-state/*.tsx',
)
const componentSubscriptionFactories = import.meta.glob<ComponentSubscriptionDemoModule>(
  './demos/component-subscription/*.tsx',
)
const selectorFactories = import.meta.glob<SelectorDemoModule>('./demos/selector/*.tsx')
const objectAndArrayUpdatesFactories = import.meta.glob<ObjectAndArrayUpdatesDemoModule>(
  './demos/object-and-array-updates/*.tsx',
)
const typescriptStoreFactories = import.meta.glob<TypescriptStoreDemoModule>(
  './demos/typescript-store/*.tsx',
)
const stateOwnershipFactories = import.meta.glob<StateOwnershipDemoModule>(
  './demos/state-ownership/*.tsx',
)
const taskFilterFactories = import.meta.glob<TaskFilterDemoModule>('./demos/task-filter/*.tsx')
const shoppingCartFactories = import.meta.glob<ShoppingCartDemoModule>(
  './demos/shopping-cart/*.tsx',
)
const atomicSelectorFactories = import.meta.glob<AtomicSelectorDemoModule>(
  './demos/atomic-selector/*.tsx',
)
const selectorResultStabilityFactories = import.meta.glob<SelectorResultStabilityDemoModule>(
  './demos/selector-result-stability/*.tsx',
)
const useShallowFactories = import.meta.glob<UseShallowDemoModule>('./demos/use-shallow/*.tsx')
const derivedStateFactories = import.meta.glob<DerivedStateDemoModule>(
  './demos/derived-state/*.tsx',
)
const asyncActionFactories = import.meta.glob<AsyncActionDemoModule>('./demos/async-action/*.tsx')
const stateResetFactories = import.meta.glob<StateResetDemoModule>('./demos/state-reset/*.tsx')
const persistFactories = import.meta.glob<PersistDemoModule>('./demos/persist/*.tsx')
const devtoolsFactories = import.meta.glob<DevtoolsDemoModule>('./demos/devtools/*.tsx')
const subscribeFactories = import.meta.glob<SubscribeDemoModule>('./demos/subscribe/*.tsx')
const slicesPatternFactories = import.meta.glob<SlicesPatternDemoModule>(
  './demos/slices-pattern/*.tsx',
)
const preferencesCenterFactories = import.meta.glob<PreferencesCenterDemoModule>(
  './demos/preferences-center/*.tsx',
)
const contentWorkspaceFactories = import.meta.glob<ContentWorkspaceDemoModule>(
  './demos/content-workspace/*.tsx',
)
const vanillaStoreFactories = import.meta.glob<VanillaStoreDemoModule>(
  './demos/vanilla-store/*.tsx',
)
const contextScopeFactories = import.meta.glob<ContextScopeDemoModule>(
  './demos/context-scope/*.tsx',
)
const storeFactoryFactories = import.meta.glob<StoreFactoryDemoModule>(
  './demos/store-factory/*.tsx',
)
const advancedTypescriptFactories = import.meta.glob<AdvancedTypescriptDemoModule>(
  './demos/advanced-typescript/*.tsx',
)
const subscribeWithSelectorFactories = import.meta.glob<SubscribeWithSelectorDemoModule>(
  './demos/subscribe-with-selector/*.tsx',
)
const middlewareCompositionFactories = import.meta.glob<MiddlewareCompositionDemoModule>(
  './demos/middleware-composition/*.tsx',
)
const immerMiddlewareFactories = import.meta.glob<ImmerMiddlewareDemoModule>(
  './demos/immer-middleware/*.tsx',
)
const persistVersionMigrationFactories = import.meta.glob<PersistVersionMigrationDemoModule>(
  './demos/persist-version-migration/*.tsx',
)
const zustandTestingFactories = import.meta.glob<ZustandTestingDemoModule>(
  './demos/zustand-testing/*.tsx',
)
const ssrAndHydrationFactories = import.meta.glob<SsrAndHydrationDemoModule>(
  './demos/ssr-and-hydration/*.tsx',
)
const multiInstanceEditorFactories = import.meta.glob<MultiInstanceEditorDemoModule>(
  './demos/multi-instance-editor/*.tsx',
)
const clientStatePlatformFactories = import.meta.glob<ClientStatePlatformDemoModule>(
  './demos/client-state-platform/*.tsx',
)
const demoSources = import.meta.glob<string>('./demos/**/*.tsx', {
  query: '?raw',
  import: 'default',
})
const demoStyleSources = import.meta.glob<string>('./demos/**/*.css', {
  query: '?raw',
  import: 'default',
})

const firstStoreSourceFiles = [
  {
    name: 'first-store-demo.tsx',
    load: demoSources['./demos/first-store/first-store-demo.tsx']!,
  },
  {
    name: 'first-store-demo.css',
    load: demoStyleSources['./demos/first-store/first-store-demo.css']!,
  },
] as const

const stateAndActionsSourceFiles = [
  {
    name: 'state-and-actions-demo.tsx',
    load: demoSources['./demos/state-and-actions/state-and-actions-demo.tsx']!,
  },
  {
    name: 'state-and-actions-demo.css',
    load: demoStyleSources['./demos/state-and-actions/state-and-actions-demo.css']!,
  },
] as const

const setStateUpdatesSourceFiles = [
  {
    name: 'set-state-updates-demo.tsx',
    load: demoSources['./demos/set-state-updates/set-state-updates-demo.tsx']!,
  },
  {
    name: 'set-state-updates-demo.css',
    load: demoStyleSources['./demos/set-state-updates/set-state-updates-demo.css']!,
  },
] as const

const getCurrentStateSourceFiles = [
  {
    name: 'get-current-state-demo.tsx',
    load: demoSources['./demos/get-current-state/get-current-state-demo.tsx']!,
  },
  {
    name: 'get-current-state-demo.css',
    load: demoStyleSources['./demos/get-current-state/get-current-state-demo.css']!,
  },
] as const

const componentSubscriptionSourceFiles = [
  {
    name: 'component-subscription-demo.tsx',
    load: demoSources['./demos/component-subscription/component-subscription-demo.tsx']!,
  },
  {
    name: 'component-subscription-demo.css',
    load: demoStyleSources['./demos/component-subscription/component-subscription-demo.css']!,
  },
] as const

const selectorSourceFiles = [
  {
    name: 'selector-demo.tsx',
    load: demoSources['./demos/selector/selector-demo.tsx']!,
  },
  {
    name: 'selector-demo.css',
    load: demoStyleSources['./demos/selector/selector-demo.css']!,
  },
] as const

const objectAndArrayUpdatesSourceFiles = [
  {
    name: 'object-and-array-updates-demo.tsx',
    load: demoSources['./demos/object-and-array-updates/object-and-array-updates-demo.tsx']!,
  },
  {
    name: 'object-and-array-updates-demo.css',
    load: demoStyleSources['./demos/object-and-array-updates/object-and-array-updates-demo.css']!,
  },
] as const

const typescriptStoreSourceFiles = [
  {
    name: 'typescript-store-demo.tsx',
    load: demoSources['./demos/typescript-store/typescript-store-demo.tsx']!,
  },
  {
    name: 'typescript-store-demo.css',
    load: demoStyleSources['./demos/typescript-store/typescript-store-demo.css']!,
  },
] as const

const stateOwnershipSourceFiles = [
  {
    name: 'state-ownership-demo.tsx',
    load: demoSources['./demos/state-ownership/state-ownership-demo.tsx']!,
  },
  {
    name: 'state-ownership-demo.css',
    load: demoStyleSources['./demos/state-ownership/state-ownership-demo.css']!,
  },
] as const

const taskFilterSourceFiles = [
  {
    name: 'task-filter-demo.tsx',
    load: demoSources['./demos/task-filter/task-filter-demo.tsx']!,
  },
  {
    name: 'task-filter-demo.css',
    load: demoStyleSources['./demos/task-filter/task-filter-demo.css']!,
  },
] as const

const shoppingCartSourceFiles = [
  {
    name: 'shopping-cart-demo.tsx',
    load: demoSources['./demos/shopping-cart/shopping-cart-demo.tsx']!,
  },
  {
    name: 'shopping-cart-demo.css',
    load: demoStyleSources['./demos/shopping-cart/shopping-cart-demo.css']!,
  },
] as const

const atomicSelectorSourceFiles = [
  {
    name: 'atomic-selector-demo.tsx',
    load: demoSources['./demos/atomic-selector/atomic-selector-demo.tsx']!,
  },
  {
    name: 'atomic-selector-demo.css',
    load: demoStyleSources['./demos/atomic-selector/atomic-selector-demo.css']!,
  },
] as const

const selectorResultStabilitySourceFiles = [
  {
    name: 'selector-result-stability-demo.tsx',
    load: demoSources['./demos/selector-result-stability/selector-result-stability-demo.tsx']!,
  },
  {
    name: 'selector-result-stability-demo.css',
    load: demoStyleSources['./demos/selector-result-stability/selector-result-stability-demo.css']!,
  },
] as const

const useShallowSourceFiles = [
  {
    name: 'use-shallow-demo.tsx',
    load: demoSources['./demos/use-shallow/use-shallow-demo.tsx']!,
  },
  {
    name: 'use-shallow-demo.css',
    load: demoStyleSources['./demos/use-shallow/use-shallow-demo.css']!,
  },
] as const

const derivedStateSourceFiles = [
  {
    name: 'derived-state-demo.tsx',
    load: demoSources['./demos/derived-state/derived-state-demo.tsx']!,
  },
  {
    name: 'derived-state-demo.css',
    load: demoStyleSources['./demos/derived-state/derived-state-demo.css']!,
  },
] as const

const asyncActionSourceFiles = [
  {
    name: 'async-action-demo.tsx',
    load: demoSources['./demos/async-action/async-action-demo.tsx']!,
  },
  {
    name: 'async-action-demo.css',
    load: demoStyleSources['./demos/async-action/async-action-demo.css']!,
  },
] as const

const stateResetSourceFiles = [
  {
    name: 'state-reset-demo.tsx',
    load: demoSources['./demos/state-reset/state-reset-demo.tsx']!,
  },
  {
    name: 'state-reset-demo.css',
    load: demoStyleSources['./demos/state-reset/state-reset-demo.css']!,
  },
] as const

const persistSourceFiles = [
  {
    name: 'persist-demo.tsx',
    load: demoSources['./demos/persist/persist-demo.tsx']!,
  },
  {
    name: 'persist-demo.css',
    load: demoStyleSources['./demos/persist/persist-demo.css']!,
  },
] as const

const devtoolsSourceFiles = [
  {
    name: 'devtools-demo.tsx',
    load: demoSources['./demos/devtools/devtools-demo.tsx']!,
  },
  {
    name: 'devtools-demo.css',
    load: demoStyleSources['./demos/devtools/devtools-demo.css']!,
  },
] as const

const subscribeSourceFiles = [
  {
    name: 'subscribe-demo.tsx',
    load: demoSources['./demos/subscribe/subscribe-demo.tsx']!,
  },
  {
    name: 'subscribe-demo.css',
    load: demoStyleSources['./demos/subscribe/subscribe-demo.css']!,
  },
] as const

const slicesPatternSourceFiles = [
  {
    name: 'slices-pattern-demo.tsx',
    load: demoSources['./demos/slices-pattern/slices-pattern-demo.tsx']!,
  },
  {
    name: 'slices-pattern-demo.css',
    load: demoStyleSources['./demos/slices-pattern/slices-pattern-demo.css']!,
  },
] as const

const preferencesCenterSourceFiles = [
  {
    name: 'preferences-center-demo.tsx',
    load: demoSources['./demos/preferences-center/preferences-center-demo.tsx']!,
  },
  {
    name: 'preferences-center-demo.css',
    load: demoStyleSources['./demos/preferences-center/preferences-center-demo.css']!,
  },
] as const

const contentWorkspaceSourceFiles = [
  {
    name: 'content-workspace-demo.tsx',
    load: demoSources['./demos/content-workspace/content-workspace-demo.tsx']!,
  },
  {
    name: 'content-workspace-demo.css',
    load: demoStyleSources['./demos/content-workspace/content-workspace-demo.css']!,
  },
] as const

const vanillaStoreSourceFiles = [
  {
    name: 'vanilla-store-demo.tsx',
    load: demoSources['./demos/vanilla-store/vanilla-store-demo.tsx']!,
  },
  {
    name: 'vanilla-store-demo.css',
    load: demoStyleSources['./demos/vanilla-store/vanilla-store-demo.css']!,
  },
] as const

const contextScopeSourceFiles = [
  {
    name: 'context-scope-demo.tsx',
    load: demoSources['./demos/context-scope/context-scope-demo.tsx']!,
  },
  {
    name: 'context-scope-demo.css',
    load: demoStyleSources['./demos/context-scope/context-scope-demo.css']!,
  },
] as const

const storeFactorySourceFiles = [
  {
    name: 'store-factory-demo.tsx',
    load: demoSources['./demos/store-factory/store-factory-demo.tsx']!,
  },
  {
    name: 'store-factory-demo.css',
    load: demoStyleSources['./demos/store-factory/store-factory-demo.css']!,
  },
] as const

const advancedTypescriptSourceFiles = [
  {
    name: 'advanced-typescript-demo.tsx',
    load: demoSources['./demos/advanced-typescript/advanced-typescript-demo.tsx']!,
  },
  {
    name: 'advanced-typescript-demo.css',
    load: demoStyleSources['./demos/advanced-typescript/advanced-typescript-demo.css']!,
  },
] as const

const subscribeWithSelectorSourceFiles = [
  {
    name: 'subscribe-with-selector-demo.tsx',
    load: demoSources['./demos/subscribe-with-selector/subscribe-with-selector-demo.tsx']!,
  },
  {
    name: 'subscribe-with-selector-demo.css',
    load: demoStyleSources['./demos/subscribe-with-selector/subscribe-with-selector-demo.css']!,
  },
] as const

const middlewareCompositionSourceFiles = [
  {
    name: 'middleware-composition-demo.tsx',
    load: demoSources['./demos/middleware-composition/middleware-composition-demo.tsx']!,
  },
  {
    name: 'middleware-composition-demo.css',
    load: demoStyleSources['./demos/middleware-composition/middleware-composition-demo.css']!,
  },
] as const

const immerMiddlewareSourceFiles = [
  {
    name: 'immer-middleware-demo.tsx',
    load: demoSources['./demos/immer-middleware/immer-middleware-demo.tsx']!,
  },
  {
    name: 'immer-middleware-demo.css',
    load: demoStyleSources['./demos/immer-middleware/immer-middleware-demo.css']!,
  },
] as const

const persistVersionMigrationSourceFiles = [
  {
    name: 'persist-version-migration-demo.tsx',
    load: demoSources['./demos/persist-version-migration/persist-version-migration-demo.tsx']!,
  },
  {
    name: 'persist-version-migration-demo.css',
    load: demoStyleSources['./demos/persist-version-migration/persist-version-migration-demo.css']!,
  },
] as const

const zustandTestingSourceFiles = [
  {
    name: 'zustand-testing-demo.tsx',
    load: demoSources['./demos/zustand-testing/zustand-testing-demo.tsx']!,
  },
  {
    name: 'zustand-testing-demo.css',
    load: demoStyleSources['./demos/zustand-testing/zustand-testing-demo.css']!,
  },
] as const

const ssrAndHydrationSourceFiles = [
  {
    name: 'ssr-and-hydration-demo.tsx',
    load: demoSources['./demos/ssr-and-hydration/ssr-and-hydration-demo.tsx']!,
  },
  {
    name: 'ssr-and-hydration-demo.css',
    load: demoStyleSources['./demos/ssr-and-hydration/ssr-and-hydration-demo.css']!,
  },
] as const

const multiInstanceEditorSourceFiles = [
  {
    name: 'multi-instance-editor-demo.tsx',
    load: demoSources['./demos/multi-instance-editor/multi-instance-editor-demo.tsx']!,
  },
  {
    name: 'multi-instance-editor-demo.css',
    load: demoStyleSources['./demos/multi-instance-editor/multi-instance-editor-demo.css']!,
  },
] as const

const clientStatePlatformSourceFiles = [
  {
    name: 'client-state-platform-demo.tsx',
    load: demoSources['./demos/client-state-platform/client-state-platform-demo.tsx']!,
  },
  {
    name: 'client-state-platform-demo.css',
    load: demoStyleSources['./demos/client-state-platform/client-state-platform-demo.css']!,
  },
] as const

/** 为 React 宿主加载第一个 Store 观察组件。 */
async function loadFirstStoreComponent(): Promise<ReactComponentModule> {
  const { createFirstStoreDemo } =
    await firstStoreFactories['./demos/first-store/first-store-demo.tsx']!()
  return { default: createFirstStoreDemo() }
}

/** 为 React 宿主加载 State 与 Action 观察组件。 */
async function loadStateAndActionsComponent(): Promise<ReactComponentModule> {
  const { createStateAndActionsDemo } =
    await stateAndActionsFactories['./demos/state-and-actions/state-and-actions-demo.tsx']!()
  return { default: createStateAndActionsDemo() }
}

/** 为 React 宿主加载 set 状态更新观察组件。 */
async function loadSetStateUpdatesComponent(): Promise<ReactComponentModule> {
  const { createSetStateUpdatesDemo } =
    await setStateUpdatesFactories['./demos/set-state-updates/set-state-updates-demo.tsx']!()
  return { default: createSetStateUpdatesDemo() }
}

/** 为 React 宿主加载 get 当前状态观察组件。 */
async function loadGetCurrentStateComponent(): Promise<ReactComponentModule> {
  const { createGetCurrentStateDemo } =
    await getCurrentStateFactories['./demos/get-current-state/get-current-state-demo.tsx']!()
  return { default: createGetCurrentStateDemo() }
}

/** 为 React 宿主加载组件订阅观察组件。 */
async function loadComponentSubscriptionComponent(): Promise<ReactComponentModule> {
  const { createComponentSubscriptionDemo } =
    await componentSubscriptionFactories[
      './demos/component-subscription/component-subscription-demo.tsx'
    ]!()
  return { default: createComponentSubscriptionDemo() }
}

/** 为 React 宿主加载 Selector 观察组件。 */
async function loadSelectorComponent(): Promise<ReactComponentModule> {
  const { createSelectorDemo } = await selectorFactories['./demos/selector/selector-demo.tsx']!()
  return { default: createSelectorDemo() }
}

/** 为 React 宿主加载对象与数组更新观察组件。 */
async function loadObjectAndArrayUpdatesComponent(): Promise<ReactComponentModule> {
  const { createObjectAndArrayUpdatesDemo } =
    await objectAndArrayUpdatesFactories[
      './demos/object-and-array-updates/object-and-array-updates-demo.tsx'
    ]!()
  return { default: createObjectAndArrayUpdatesDemo() }
}

/** 为 React 宿主加载 TypeScript Store 观察组件。 */
async function loadTypescriptStoreComponent(): Promise<ReactComponentModule> {
  const { createTypescriptStoreDemo } =
    await typescriptStoreFactories['./demos/typescript-store/typescript-store-demo.tsx']!()
  return { default: createTypescriptStoreDemo() }
}

/** 为 React 宿主加载状态所有权观察组件。 */
async function loadStateOwnershipComponent(): Promise<ReactComponentModule> {
  const { createStateOwnershipDemo } =
    await stateOwnershipFactories['./demos/state-ownership/state-ownership-demo.tsx']!()
  return { default: createStateOwnershipDemo() }
}

/** 为 React 宿主加载任务筛选器观察组件。 */
async function loadTaskFilterComponent(): Promise<ReactComponentModule> {
  const { createTaskFilterDemo } =
    await taskFilterFactories['./demos/task-filter/task-filter-demo.tsx']!()
  return { default: createTaskFilterDemo() }
}

/** 为 React 宿主加载购物车观察组件。 */
async function loadShoppingCartComponent(): Promise<ReactComponentModule> {
  const { createShoppingCartDemo } =
    await shoppingCartFactories['./demos/shopping-cart/shopping-cart-demo.tsx']!()
  return { default: createShoppingCartDemo() }
}

/** 为 React 宿主加载原子 Selector 观察组件。 */
async function loadAtomicSelectorComponent(): Promise<ReactComponentModule> {
  const { createAtomicSelectorDemo } =
    await atomicSelectorFactories['./demos/atomic-selector/atomic-selector-demo.tsx']!()
  return { default: createAtomicSelectorDemo() }
}

/** 为 React 宿主加载选择结果稳定性观察组件。 */
async function loadSelectorResultStabilityComponent(): Promise<ReactComponentModule> {
  const { createSelectorResultStabilityDemo } =
    await selectorResultStabilityFactories[
      './demos/selector-result-stability/selector-result-stability-demo.tsx'
    ]!()
  return { default: createSelectorResultStabilityDemo() }
}

/** 为 React 宿主加载 useShallow 观察组件。 */
async function loadUseShallowComponent(): Promise<ReactComponentModule> {
  const { createUseShallowDemo } =
    await useShallowFactories['./demos/use-shallow/use-shallow-demo.tsx']!()
  return { default: createUseShallowDemo() }
}

/** 为 React 宿主加载派生状态观察组件。 */
async function loadDerivedStateComponent(): Promise<ReactComponentModule> {
  const { createDerivedStateDemo } =
    await derivedStateFactories['./demos/derived-state/derived-state-demo.tsx']!()
  return { default: createDerivedStateDemo() }
}

/** 为 React 宿主加载异步 Action 观察组件。 */
async function loadAsyncActionComponent(): Promise<ReactComponentModule> {
  const { createAsyncActionDemo } =
    await asyncActionFactories['./demos/async-action/async-action-demo.tsx']!()
  return { default: createAsyncActionDemo() }
}

/** 为 React 宿主加载状态重置观察组件。 */
async function loadStateResetComponent(): Promise<ReactComponentModule> {
  const { createStateResetDemo } =
    await stateResetFactories['./demos/state-reset/state-reset-demo.tsx']!()
  return { default: createStateResetDemo() }
}

/** 为 React 宿主加载 persist 观察组件。 */
async function loadPersistComponent(): Promise<ReactComponentModule> {
  const { createPersistDemo } = await persistFactories['./demos/persist/persist-demo.tsx']!()
  return { default: createPersistDemo() }
}

/** 为 React 宿主加载 DevTools 观察组件。 */
async function loadDevtoolsComponent(): Promise<ReactComponentModule> {
  const { createDevtoolsDemo } = await devtoolsFactories['./demos/devtools/devtools-demo.tsx']!()
  return { default: createDevtoolsDemo() }
}

/** 为 React 宿主加载 subscribe 观察组件。 */
async function loadSubscribeComponent(): Promise<ReactComponentModule> {
  const { createSubscribeDemo } =
    await subscribeFactories['./demos/subscribe/subscribe-demo.tsx']!()
  return { default: createSubscribeDemo() }
}

/** 为 React 宿主加载 Slices Pattern 观察组件。 */
async function loadSlicesPatternComponent(): Promise<ReactComponentModule> {
  const { createSlicesPatternDemo } =
    await slicesPatternFactories['./demos/slices-pattern/slices-pattern-demo.tsx']!()
  return { default: createSlicesPatternDemo() }
}

/** 为 React 宿主加载偏好设置中心观察组件。 */
async function loadPreferencesCenterComponent(): Promise<ReactComponentModule> {
  const { createPreferencesCenterDemo } =
    await preferencesCenterFactories['./demos/preferences-center/preferences-center-demo.tsx']!()
  return { default: createPreferencesCenterDemo() }
}

/** 为 React 宿主加载内容管理工作区观察组件。 */
async function loadContentWorkspaceComponent(): Promise<ReactComponentModule> {
  const { createContentWorkspaceDemo } =
    await contentWorkspaceFactories['./demos/content-workspace/content-workspace-demo.tsx']!()
  return { default: createContentWorkspaceDemo() }
}

/** 为 React 宿主加载 Vanilla Store 观察组件。 */
async function loadVanillaStoreComponent(): Promise<ReactComponentModule> {
  const { createVanillaStoreDemo } =
    await vanillaStoreFactories['./demos/vanilla-store/vanilla-store-demo.tsx']!()
  return { default: createVanillaStoreDemo() }
}

/** 为 React 宿主加载 Context 作用域观察组件。 */
async function loadContextScopeComponent(): Promise<ReactComponentModule> {
  const { createContextScopeDemo } =
    await contextScopeFactories['./demos/context-scope/context-scope-demo.tsx']!()
  return { default: createContextScopeDemo() }
}

/** 为 React 宿主加载 Store Factory 观察组件。 */
async function loadStoreFactoryComponent(): Promise<ReactComponentModule> {
  const { createStoreFactoryDemo } =
    await storeFactoryFactories['./demos/store-factory/store-factory-demo.tsx']!()
  return { default: createStoreFactoryDemo() }
}

/** 为 React 宿主加载高级 TypeScript 观察组件。 */
async function loadAdvancedTypescriptComponent(): Promise<ReactComponentModule> {
  const { createAdvancedTypescriptDemo } =
    await advancedTypescriptFactories['./demos/advanced-typescript/advanced-typescript-demo.tsx']!()
  return { default: createAdvancedTypescriptDemo() }
}

/** 为 React 宿主加载 subscribeWithSelector 观察组件。 */
async function loadSubscribeWithSelectorComponent(): Promise<ReactComponentModule> {
  const { createSubscribeWithSelectorDemo } =
    await subscribeWithSelectorFactories[
      './demos/subscribe-with-selector/subscribe-with-selector-demo.tsx'
    ]!()
  return { default: createSubscribeWithSelectorDemo() }
}

/** 为 React 宿主加载中间件组合观察组件。 */
async function loadMiddlewareCompositionComponent(): Promise<ReactComponentModule> {
  const { createMiddlewareCompositionDemo } =
    await middlewareCompositionFactories[
      './demos/middleware-composition/middleware-composition-demo.tsx'
    ]!()
  return { default: createMiddlewareCompositionDemo() }
}

/** 为 React 宿主加载 Immer Middleware 观察组件。 */
async function loadImmerMiddlewareComponent(): Promise<ReactComponentModule> {
  const { createImmerMiddlewareDemo } =
    await immerMiddlewareFactories['./demos/immer-middleware/immer-middleware-demo.tsx']!()
  return { default: createImmerMiddlewareDemo() }
}

/** 为 React 宿主加载持久化版本迁移观察组件。 */
async function loadPersistVersionMigrationComponent(): Promise<ReactComponentModule> {
  const { createPersistVersionMigrationDemo } =
    await persistVersionMigrationFactories[
      './demos/persist-version-migration/persist-version-migration-demo.tsx'
    ]!()
  return { default: createPersistVersionMigrationDemo() }
}

/** 为 React 宿主加载 Zustand 测试观察组件。 */
async function loadZustandTestingComponent(): Promise<ReactComponentModule> {
  const { createZustandTestingDemo } =
    await zustandTestingFactories['./demos/zustand-testing/zustand-testing-demo.tsx']!()
  return { default: createZustandTestingDemo() }
}

/** 为 React 宿主加载 SSR 与 Hydration 观察组件。 */
async function loadSsrAndHydrationComponent(): Promise<ReactComponentModule> {
  const { createSsrAndHydrationDemo } =
    await ssrAndHydrationFactories['./demos/ssr-and-hydration/ssr-and-hydration-demo.tsx']!()
  return { default: createSsrAndHydrationDemo() }
}

/** 为 React 宿主加载多实例编辑器观察组件。 */
async function loadMultiInstanceEditorComponent(): Promise<ReactComponentModule> {
  const { createMultiInstanceEditorDemo } =
    await multiInstanceEditorFactories[
      './demos/multi-instance-editor/multi-instance-editor-demo.tsx'
    ]!()
  return { default: createMultiInstanceEditorDemo() }
}

/** 为 React 宿主加载客户端状态平台观察组件。 */
async function loadClientStatePlatformComponent(): Promise<ReactComponentModule> {
  const { createClientStatePlatformDemo } =
    await clientStatePlatformFactories[
      './demos/client-state-platform/client-state-platform-demo.tsx'
    ]!()
  return { default: createClientStatePlatformDemo() }
}

/** 合并第一个 Store Demo 的真实组件与样式源码。 */
async function loadFirstStoreSource(): Promise<string> {
  const sources = await Promise.all(
    firstStoreSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 State 与 Action Demo 的真实组件与样式源码。 */
async function loadStateAndActionsSource(): Promise<string> {
  const sources = await Promise.all(
    stateAndActionsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 set 状态更新 Demo 的真实组件与样式源码。 */
async function loadSetStateUpdatesSource(): Promise<string> {
  const sources = await Promise.all(
    setStateUpdatesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 get 当前状态 Demo 的真实组件与样式源码。 */
async function loadGetCurrentStateSource(): Promise<string> {
  const sources = await Promise.all(
    getCurrentStateSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并组件订阅 Demo 的真实组件与样式源码。 */
async function loadComponentSubscriptionSource(): Promise<string> {
  const sources = await Promise.all(
    componentSubscriptionSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Selector Demo 的真实组件与样式源码。 */
async function loadSelectorSource(): Promise<string> {
  const sources = await Promise.all(
    selectorSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并对象与数组更新 Demo 的真实组件与样式源码。 */
async function loadObjectAndArrayUpdatesSource(): Promise<string> {
  const sources = await Promise.all(
    objectAndArrayUpdatesSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 TypeScript Store Demo 的真实组件与样式源码。 */
async function loadTypescriptStoreSource(): Promise<string> {
  const sources = await Promise.all(
    typescriptStoreSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并状态所有权 Demo 的真实组件与样式源码。 */
async function loadStateOwnershipSource(): Promise<string> {
  const sources = await Promise.all(
    stateOwnershipSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并任务筛选器 Demo 的真实组件与样式源码。 */
async function loadTaskFilterSource(): Promise<string> {
  const sources = await Promise.all(
    taskFilterSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并购物车 Demo 的真实组件与样式源码。 */
async function loadShoppingCartSource(): Promise<string> {
  const sources = await Promise.all(
    shoppingCartSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并原子 Selector Demo 的真实组件与样式源码。 */
async function loadAtomicSelectorSource(): Promise<string> {
  const sources = await Promise.all(
    atomicSelectorSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并选择结果稳定性 Demo 的真实组件与样式源码。 */
async function loadSelectorResultStabilitySource(): Promise<string> {
  const sources = await Promise.all(
    selectorResultStabilitySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 useShallow Demo 的真实组件与样式源码。 */
async function loadUseShallowSource(): Promise<string> {
  const sources = await Promise.all(
    useShallowSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并派生状态 Demo 的真实组件与样式源码。 */
async function loadDerivedStateSource(): Promise<string> {
  const sources = await Promise.all(
    derivedStateSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并异步 Action Demo 的真实组件与样式源码。 */
async function loadAsyncActionSource(): Promise<string> {
  const sources = await Promise.all(
    asyncActionSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并状态重置 Demo 的真实组件与样式源码。 */
async function loadStateResetSource(): Promise<string> {
  const sources = await Promise.all(
    stateResetSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 persist Demo 的真实组件与样式源码。 */
async function loadPersistSource(): Promise<string> {
  const sources = await Promise.all(
    persistSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 DevTools Demo 的真实组件与样式源码。 */
async function loadDevtoolsSource(): Promise<string> {
  const sources = await Promise.all(
    devtoolsSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 subscribe Demo 的真实组件与样式源码。 */
async function loadSubscribeSource(): Promise<string> {
  const sources = await Promise.all(
    subscribeSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Slices Pattern Demo 的真实组件与样式源码。 */
async function loadSlicesPatternSource(): Promise<string> {
  const sources = await Promise.all(
    slicesPatternSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并偏好设置中心 Demo 的真实组件与样式源码。 */
async function loadPreferencesCenterSource(): Promise<string> {
  const sources = await Promise.all(
    preferencesCenterSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并内容管理工作区 Demo 的真实组件与样式源码。 */
async function loadContentWorkspaceSource(): Promise<string> {
  const sources = await Promise.all(
    contentWorkspaceSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Vanilla Store Demo 的真实组件与样式源码。 */
async function loadVanillaStoreSource(): Promise<string> {
  const sources = await Promise.all(
    vanillaStoreSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Context 作用域 Demo 的真实组件与样式源码。 */
async function loadContextScopeSource(): Promise<string> {
  const sources = await Promise.all(
    contextScopeSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Store Factory Demo 的真实组件与样式源码。 */
async function loadStoreFactorySource(): Promise<string> {
  const sources = await Promise.all(
    storeFactorySourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并高级 TypeScript Demo 的真实组件与样式源码。 */
async function loadAdvancedTypescriptSource(): Promise<string> {
  const sources = await Promise.all(
    advancedTypescriptSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 subscribeWithSelector Demo 的真实组件与样式源码。 */
async function loadSubscribeWithSelectorSource(): Promise<string> {
  const sources = await Promise.all(
    subscribeWithSelectorSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并中间件组合 Demo 的真实组件与样式源码。 */
async function loadMiddlewareCompositionSource(): Promise<string> {
  const sources = await Promise.all(
    middlewareCompositionSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Immer Middleware Demo 的真实组件与样式源码。 */
async function loadImmerMiddlewareSource(): Promise<string> {
  const sources = await Promise.all(
    immerMiddlewareSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并持久化版本迁移 Demo 的真实组件与样式源码。 */
async function loadPersistVersionMigrationSource(): Promise<string> {
  const sources = await Promise.all(
    persistVersionMigrationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 Zustand 测试 Demo 的真实组件与样式源码。 */
async function loadZustandTestingSource(): Promise<string> {
  const sources = await Promise.all(
    zustandTestingSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 SSR 与 Hydration Demo 的真实组件与样式源码。 */
async function loadSsrAndHydrationSource(): Promise<string> {
  const sources = await Promise.all(
    ssrAndHydrationSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并多实例编辑器 Demo 的真实组件与样式源码。 */
async function loadMultiInstanceEditorSource(): Promise<string> {
  const sources = await Promise.all(
    multiInstanceEditorSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并客户端状态平台 Demo 的真实组件与样式源码。 */
async function loadClientStatePlatformSource(): Promise<string> {
  const sources = await Promise.all(
    clientStatePlatformSourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

export const reactZustandDemoAssets: DemoAssetManifest[] = [
  {
    id: 'react.zustand.learn.basics.first-store.first-store-demo',
    title: '第一个 Store 观察器',
    runtime: 'react',
    loadComponent: loadFirstStoreComponent,
    loadSource: loadFirstStoreSource,
  },
  {
    id: 'react.zustand.learn.basics.state-and-actions.state-and-actions-demo',
    title: 'State 与 Action 工作区',
    runtime: 'react',
    loadComponent: loadStateAndActionsComponent,
    loadSource: loadStateAndActionsSource,
  },
  {
    id: 'react.zustand.learn.basics.set-state-updates.set-state-updates-demo',
    title: 'set 状态更新工作区',
    runtime: 'react',
    loadComponent: loadSetStateUpdatesComponent,
    loadSource: loadSetStateUpdatesSource,
  },
  {
    id: 'react.zustand.learn.basics.get-current-state.get-current-state-demo',
    title: 'get 当前状态工作区',
    runtime: 'react',
    loadComponent: loadGetCurrentStateComponent,
    loadSource: loadGetCurrentStateSource,
  },
  {
    id: 'react.zustand.learn.basics.component-subscription.component-subscription-demo',
    title: '组件订阅工作区',
    runtime: 'react',
    loadComponent: loadComponentSubscriptionComponent,
    loadSource: loadComponentSubscriptionSource,
  },
  {
    id: 'react.zustand.learn.basics.selector.selector-demo',
    title: 'Selector 工作区',
    runtime: 'react',
    loadComponent: loadSelectorComponent,
    loadSource: loadSelectorSource,
  },
  {
    id: 'react.zustand.learn.basics.object-and-array-updates.object-and-array-updates-demo',
    title: '对象与数组更新工作区',
    runtime: 'react',
    loadComponent: loadObjectAndArrayUpdatesComponent,
    loadSource: loadObjectAndArrayUpdatesSource,
  },
  {
    id: 'react.zustand.learn.basics.typescript-store.typescript-store-demo',
    title: 'TypeScript Store 工作区',
    runtime: 'react',
    loadComponent: loadTypescriptStoreComponent,
    loadSource: loadTypescriptStoreSource,
  },
  {
    id: 'react.zustand.learn.basics.state-ownership.state-ownership-demo',
    title: '状态所有权工作区',
    runtime: 'react',
    loadComponent: loadStateOwnershipComponent,
    loadSource: loadStateOwnershipSource,
  },
  {
    id: 'react.zustand.learn.basics.task-filter.task-filter-demo',
    title: '任务筛选器工作区',
    runtime: 'react',
    loadComponent: loadTaskFilterComponent,
    loadSource: loadTaskFilterSource,
  },
  {
    id: 'react.zustand.learn.basics.shopping-cart.shopping-cart-demo',
    title: '购物车状态工作区',
    runtime: 'react',
    loadComponent: loadShoppingCartComponent,
    loadSource: loadShoppingCartSource,
  },
  {
    id: 'react.zustand.learn.intermediate.atomic-selector.atomic-selector-demo',
    title: '原子 Selector 工作区',
    runtime: 'react',
    loadComponent: loadAtomicSelectorComponent,
    loadSource: loadAtomicSelectorSource,
  },
  {
    id: 'react.zustand.learn.intermediate.selector-result-stability.selector-result-stability-demo',
    title: 'Selector 结果稳定性工作区',
    runtime: 'react',
    loadComponent: loadSelectorResultStabilityComponent,
    loadSource: loadSelectorResultStabilitySource,
  },
  {
    id: 'react.zustand.learn.intermediate.use-shallow.use-shallow-demo',
    title: 'useShallow 工作区',
    runtime: 'react',
    loadComponent: loadUseShallowComponent,
    loadSource: loadUseShallowSource,
  },
  {
    id: 'react.zustand.learn.intermediate.derived-state.derived-state-demo',
    title: '派生状态工作区',
    runtime: 'react',
    loadComponent: loadDerivedStateComponent,
    loadSource: loadDerivedStateSource,
  },
  {
    id: 'react.zustand.learn.intermediate.async-action.async-action-demo',
    title: '异步 Action 工作区',
    runtime: 'react',
    loadComponent: loadAsyncActionComponent,
    loadSource: loadAsyncActionSource,
  },
  {
    id: 'react.zustand.learn.intermediate.state-reset.state-reset-demo',
    title: '状态重置工作区',
    runtime: 'react',
    loadComponent: loadStateResetComponent,
    loadSource: loadStateResetSource,
  },
  {
    id: 'react.zustand.learn.intermediate.persist.persist-demo',
    title: 'persist 持久化工作区',
    runtime: 'react',
    loadComponent: loadPersistComponent,
    loadSource: loadPersistSource,
  },
  {
    id: 'react.zustand.learn.intermediate.devtools.devtools-demo',
    title: 'DevTools 调试工作区',
    runtime: 'react',
    loadComponent: loadDevtoolsComponent,
    loadSource: loadDevtoolsSource,
  },
  {
    id: 'react.zustand.learn.intermediate.subscribe.subscribe-demo',
    title: 'subscribe 订阅工作区',
    runtime: 'react',
    loadComponent: loadSubscribeComponent,
    loadSource: loadSubscribeSource,
  },
  {
    id: 'react.zustand.learn.intermediate.slices-pattern.slices-pattern-demo',
    title: 'Slices Pattern 工作区',
    runtime: 'react',
    loadComponent: loadSlicesPatternComponent,
    loadSource: loadSlicesPatternSource,
  },
  {
    id: 'react.zustand.learn.intermediate.preferences-center.preferences-center-demo',
    title: '偏好设置中心工作区',
    runtime: 'react',
    loadComponent: loadPreferencesCenterComponent,
    loadSource: loadPreferencesCenterSource,
  },
  {
    id: 'react.zustand.learn.intermediate.content-workspace.content-workspace-demo',
    title: '内容管理工作区',
    runtime: 'react',
    loadComponent: loadContentWorkspaceComponent,
    loadSource: loadContentWorkspaceSource,
  },
  {
    id: 'react.zustand.learn.advanced.vanilla-store.vanilla-store-demo',
    title: 'Vanilla Store 工作区',
    runtime: 'react',
    loadComponent: loadVanillaStoreComponent,
    loadSource: loadVanillaStoreSource,
  },
  {
    id: 'react.zustand.learn.advanced.context-scope.context-scope-demo',
    title: 'Context 作用域工作区',
    runtime: 'react',
    loadComponent: loadContextScopeComponent,
    loadSource: loadContextScopeSource,
  },
  {
    id: 'react.zustand.learn.advanced.store-factory.store-factory-demo',
    title: 'Store Factory 工作区',
    runtime: 'react',
    loadComponent: loadStoreFactoryComponent,
    loadSource: loadStoreFactorySource,
  },
  {
    id: 'react.zustand.learn.advanced.advanced-typescript.advanced-typescript-demo',
    title: '高级 TypeScript 工作区',
    runtime: 'react',
    loadComponent: loadAdvancedTypescriptComponent,
    loadSource: loadAdvancedTypescriptSource,
  },
  {
    id: 'react.zustand.learn.advanced.subscribe-with-selector.subscribe-with-selector-demo',
    title: 'subscribeWithSelector 工作区',
    runtime: 'react',
    loadComponent: loadSubscribeWithSelectorComponent,
    loadSource: loadSubscribeWithSelectorSource,
  },
  {
    id: 'react.zustand.learn.advanced.middleware-composition.middleware-composition-demo',
    title: '中间件组合工作区',
    runtime: 'react',
    loadComponent: loadMiddlewareCompositionComponent,
    loadSource: loadMiddlewareCompositionSource,
  },
  {
    id: 'react.zustand.learn.advanced.immer-middleware.immer-middleware-demo',
    title: 'Immer Middleware 工作区',
    runtime: 'react',
    loadComponent: loadImmerMiddlewareComponent,
    loadSource: loadImmerMiddlewareSource,
  },
  {
    id: 'react.zustand.learn.advanced.persist-version-migration.persist-version-migration-demo',
    title: '持久化版本迁移工作区',
    runtime: 'react',
    loadComponent: loadPersistVersionMigrationComponent,
    loadSource: loadPersistVersionMigrationSource,
  },
  {
    id: 'react.zustand.learn.advanced.zustand-testing.zustand-testing-demo',
    title: 'Zustand 测试工作区',
    runtime: 'react',
    loadComponent: loadZustandTestingComponent,
    loadSource: loadZustandTestingSource,
  },
  {
    id: 'react.zustand.learn.advanced.ssr-and-hydration.ssr-and-hydration-demo',
    title: 'SSR 与 Hydration 工作区',
    runtime: 'react',
    loadComponent: loadSsrAndHydrationComponent,
    loadSource: loadSsrAndHydrationSource,
  },
  {
    id: 'react.zustand.learn.advanced.multi-instance-editor.multi-instance-editor-demo',
    title: '多实例编辑器工作区',
    runtime: 'react',
    loadComponent: loadMultiInstanceEditorComponent,
    loadSource: loadMultiInstanceEditorSource,
  },
  {
    id: 'react.zustand.learn.advanced.client-state-platform.client-state-platform-demo',
    title: '客户端状态平台工作区',
    runtime: 'react',
    loadComponent: loadClientStatePlatformComponent,
    loadSource: loadClientStatePlatformSource,
  },
]
