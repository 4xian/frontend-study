import type { DemoAssetManifest, ReactComponentModule } from '@/common/content/demo-registry'

type ConfigureStoreDemoModule = {
  createConfigureStoreDemo: () => ReactComponentModule['default']
}

type ProviderDemoModule = {
  createProviderDemo: () => ReactComponentModule['default']
}

type CreateSliceDemoModule = {
  createCreateSliceDemo: () => ReactComponentModule['default']
}

type ActionAndPayloadDemoModule = {
  createActionAndPayloadDemo: () => ReactComponentModule['default']
}

type ReducerAndImmerDemoModule = {
  createReducerAndImmerDemo: () => ReactComponentModule['default']
}

type UseSelectorDemoModule = {
  createUseSelectorDemo: () => ReactComponentModule['default']
}

type UseDispatchDemoModule = {
  createUseDispatchDemo: () => ReactComponentModule['default']
}

type TypedHooksDemoModule = {
  createTypedHooksDemo: () => ReactComponentModule['default']
}

type MultipleSlicesRootStateDemoModule = {
  createMultipleSlicesRootStateDemo: () => ReactComponentModule['default']
}

type StateOwnershipDemoModule = {
  createStateOwnershipDemo: () => ReactComponentModule['default']
}

type ReduxDevToolsDemoModule = {
  createReduxDevToolsDemo: () => ReactComponentModule['default']
}

type FeatureFolderOrganizationDemoModule = {
  createFeatureFolderDemo: () => ReactComponentModule['default']
}

type TaskFilterPanelDemoModule = {
  createTaskFilterPanelDemo: () => ReactComponentModule['default']
}

type ShoppingCartStateCenterDemoModule = {
  createShoppingCartStateCenterDemo: () => ReactComponentModule['default']
}

type SelectorDemoModule = {
  createSelectorDemo: () => ReactComponentModule['default']
}

type CreateSelectorDemoModule = {
  createCreateSelectorDemo: () => ReactComponentModule['default']
}

type UseSelectorResultIdentityDemoModule = {
  createUseSelectorResultIdentityDemo: () => ReactComponentModule['default']
}

type ThunkAsyncLogicDemoModule = {
  createThunkAsyncLogicDemo: () => ReactComponentModule['default']
}

type CreateAsyncThunkDemoModule = {
  createCreateAsyncThunkDemo: () => ReactComponentModule['default']
}

type AsyncLifecycleStateDemoModule = {
  createAsyncLifecycleStateDemo: () => ReactComponentModule['default']
}

type AsyncErrorRejectWithValueDemoModule = {
  createAsyncErrorRejectWithValueDemo: () => ReactComponentModule['default']
}

type AsyncCancelConditionDemoModule = {
  createAsyncCancelConditionDemo: () => ReactComponentModule['default']
}

type ExtraReducersActionMatcherDemoModule = {
  createExtraReducersActionMatcherDemo: () => ReactComponentModule['default']
}

type MiddlewareChainDemoModule = {
  createMiddlewareChainDemo: () => ReactComponentModule['default']
}

type DefaultMiddlewareChecksDemoModule = {
  createDefaultMiddlewareChecksDemo: () => ReactComponentModule['default']
}

type ListenerMiddlewareDemoModule = {
  createListenerMiddlewareDemo: () => ReactComponentModule['default']
}

type NormalizedStateDemoModule = {
  createNormalizedStateDemo: () => ReactComponentModule['default']
}

type CreateEntityAdapterDemoModule = {
  createCreateEntityAdapterDemo: () => ReactComponentModule['default']
}

type AsyncContentManagementWorkspaceDemoModule = {
  createAsyncContentManagementWorkspaceDemo: () => ReactComponentModule['default']
}

type DemoSourceFile = {
  name: string
  load: () => Promise<string>
}

const configureStoreFactories = import.meta.glob<ConfigureStoreDemoModule>(
  './demos/configure-store/*.tsx',
)
const providerFactories = import.meta.glob<ProviderDemoModule>('./demos/provider/*.tsx')
const createSliceFactories = import.meta.glob<CreateSliceDemoModule>('./demos/create-slice/*.tsx')
const actionAndPayloadFactories = import.meta.glob<ActionAndPayloadDemoModule>(
  './demos/action-and-payload/*.tsx',
)
const reducerAndImmerFactories = import.meta.glob<ReducerAndImmerDemoModule>(
  './demos/reducer-and-immer/*.tsx',
)
const useSelectorFactories = import.meta.glob<UseSelectorDemoModule>('./demos/use-selector/*.tsx')
const useDispatchFactories = import.meta.glob<UseDispatchDemoModule>('./demos/use-dispatch/*.tsx')
const typedHooksFactories = import.meta.glob<TypedHooksDemoModule>(
  './demos/typescript-pretyped-hooks/*.tsx',
)
const multipleSlicesRootStateFactories = import.meta.glob<MultipleSlicesRootStateDemoModule>(
  './demos/multiple-slices-root-state/*.tsx',
)
const stateOwnershipFactories = import.meta.glob<StateOwnershipDemoModule>(
  './demos/state-ownership/*.tsx',
)
const reduxDevToolsFactories = import.meta.glob<ReduxDevToolsDemoModule>(
  './demos/redux-devtools/*.tsx',
)
const featureFolderOrganizationFactories = import.meta.glob<FeatureFolderOrganizationDemoModule>(
  './demos/feature-folder-organization/*.tsx',
)
const taskFilterPanelFactories = import.meta.glob<TaskFilterPanelDemoModule>(
  './demos/task-filter-panel/*.tsx',
)
const shoppingCartStateCenterFactories = import.meta.glob<ShoppingCartStateCenterDemoModule>(
  './demos/shopping-cart-state-center/*.tsx',
)
const selectorFactories = import.meta.glob<SelectorDemoModule>('./demos/selector/*.tsx')
const createSelectorFactories = import.meta.glob<CreateSelectorDemoModule>(
  './demos/create-selector/*.tsx',
)
const useSelectorResultIdentityFactories = import.meta.glob<UseSelectorResultIdentityDemoModule>(
  './demos/use-selector-result-identity-and-subscription/*.tsx',
)
const thunkAsyncLogicFactories = import.meta.glob<ThunkAsyncLogicDemoModule>(
  './demos/thunk-async-logic/*.tsx',
)
const createAsyncThunkFactories = import.meta.glob<CreateAsyncThunkDemoModule>(
  './demos/create-async-thunk/*.tsx',
)
const asyncLifecycleStateFactories = import.meta.glob<AsyncLifecycleStateDemoModule>(
  './demos/async-lifecycle-state/*.tsx',
)
const asyncErrorRejectWithValueFactories = import.meta.glob<AsyncErrorRejectWithValueDemoModule>(
  './demos/async-error-reject-with-value/*.tsx',
)
const asyncCancelConditionFactories = import.meta.glob<AsyncCancelConditionDemoModule>(
  './demos/async-cancel-condition/*.tsx',
)
const extraReducersActionMatcherFactories = import.meta.glob<ExtraReducersActionMatcherDemoModule>(
  './demos/extra-reducers-action-matcher/*.tsx',
)
const middlewareChainFactories = import.meta.glob<MiddlewareChainDemoModule>(
  './demos/middleware-chain/*.tsx',
)
const defaultMiddlewareChecksFactories = import.meta.glob<DefaultMiddlewareChecksDemoModule>(
  './demos/default-middleware-checks/*.tsx',
)
const listenerMiddlewareFactories = import.meta.glob<ListenerMiddlewareDemoModule>(
  './demos/listener-middleware/*.tsx',
)
const normalizedStateFactories = import.meta.glob<NormalizedStateDemoModule>(
  './demos/normalized-state/*.tsx',
)
const createEntityAdapterFactories = import.meta.glob<CreateEntityAdapterDemoModule>(
  './demos/create-entity-adapter/*.tsx',
)
const asyncContentManagementWorkspaceFactories =
  import.meta.glob<AsyncContentManagementWorkspaceDemoModule>(
    './demos/async-content-management-workspace/*.tsx',
  )
const demoSources = import.meta.glob<string>('./demos/**/*.tsx', {
  query: '?raw',
  import: 'default',
})
const demoTypeSources = import.meta.glob<string>('./demos/**/*.ts', {
  query: '?raw',
  import: 'default',
})
const demoStyleSources = import.meta.glob<string>('./demos/**/*.css', {
  query: '?raw',
  import: 'default',
})

const configureStoreSourceFiles = [
  {
    name: 'configure-store-demo.tsx',
    load: demoSources['./demos/configure-store/configure-store-demo.tsx']!,
  },
  {
    name: 'configure-store-demo.css',
    load: demoStyleSources['./demos/configure-store/configure-store-demo.css']!,
  },
] as const

const providerSourceFiles = [
  {
    name: 'provider-demo.tsx',
    load: demoSources['./demos/provider/provider-demo.tsx']!,
  },
  {
    name: 'provider-demo.css',
    load: demoStyleSources['./demos/provider/provider-demo.css']!,
  },
] as const

const createSliceSourceFiles = [
  {
    name: 'create-slice-demo.tsx',
    load: demoSources['./demos/create-slice/create-slice-demo.tsx']!,
  },
  {
    name: 'create-slice-demo.css',
    load: demoStyleSources['./demos/create-slice/create-slice-demo.css']!,
  },
] as const

const actionAndPayloadSourceFiles = [
  {
    name: 'action-and-payload-demo.tsx',
    load: demoSources['./demos/action-and-payload/action-and-payload-demo.tsx']!,
  },
  {
    name: 'action-and-payload-demo.css',
    load: demoStyleSources['./demos/action-and-payload/action-and-payload-demo.css']!,
  },
] as const

const reducerAndImmerSourceFiles = [
  {
    name: 'reducer-and-immer-demo.tsx',
    load: demoSources['./demos/reducer-and-immer/reducer-and-immer-demo.tsx']!,
  },
  {
    name: 'reducer-and-immer-demo.css',
    load: demoStyleSources['./demos/reducer-and-immer/reducer-and-immer-demo.css']!,
  },
] as const

const useSelectorSourceFiles = [
  {
    name: 'use-selector-demo.tsx',
    load: demoSources['./demos/use-selector/use-selector-demo.tsx']!,
  },
  {
    name: 'use-selector-demo.css',
    load: demoStyleSources['./demos/use-selector/use-selector-demo.css']!,
  },
] as const

const useDispatchSourceFiles = [
  {
    name: 'use-dispatch-demo.tsx',
    load: demoSources['./demos/use-dispatch/use-dispatch-demo.tsx']!,
  },
  {
    name: 'use-dispatch-demo.css',
    load: demoStyleSources['./demos/use-dispatch/use-dispatch-demo.css']!,
  },
] as const

const typedHooksSourceFiles = [
  {
    name: 'typed-hooks-store.ts',
    load: demoTypeSources['./demos/typescript-pretyped-hooks/typed-hooks-store.ts']!,
  },
  {
    name: 'typed-hooks.ts',
    load: demoTypeSources['./demos/typescript-pretyped-hooks/typed-hooks.ts']!,
  },
  {
    name: 'typed-hooks-demo.tsx',
    load: demoSources['./demos/typescript-pretyped-hooks/typed-hooks-demo.tsx']!,
  },
  {
    name: 'typed-hooks-demo.css',
    load: demoStyleSources['./demos/typescript-pretyped-hooks/typed-hooks-demo.css']!,
  },
] as const

const multipleSlicesRootStateSourceFiles = [
  {
    name: 'multiple-slices-root-state-store.ts',
    load: demoTypeSources[
      './demos/multiple-slices-root-state/multiple-slices-root-state-store.ts'
    ]!,
  },
  {
    name: 'multiple-slices-root-state-hooks.ts',
    load: demoTypeSources[
      './demos/multiple-slices-root-state/multiple-slices-root-state-hooks.ts'
    ]!,
  },
  {
    name: 'multiple-slices-root-state-demo.tsx',
    load: demoSources['./demos/multiple-slices-root-state/multiple-slices-root-state-demo.tsx']!,
  },
  {
    name: 'multiple-slices-root-state-demo.css',
    load: demoStyleSources[
      './demos/multiple-slices-root-state/multiple-slices-root-state-demo.css'
    ]!,
  },
] as const

const stateOwnershipSourceFiles = [
  {
    name: 'state-ownership-store.ts',
    load: demoTypeSources['./demos/state-ownership/state-ownership-store.ts']!,
  },
  {
    name: 'state-ownership-hooks.ts',
    load: demoTypeSources['./demos/state-ownership/state-ownership-hooks.ts']!,
  },
  {
    name: 'state-ownership-demo.tsx',
    load: demoSources['./demos/state-ownership/state-ownership-demo.tsx']!,
  },
  {
    name: 'state-ownership-demo.css',
    load: demoStyleSources['./demos/state-ownership/state-ownership-demo.css']!,
  },
] as const

const reduxDevToolsSourceFiles = [
  {
    name: 'redux-devtools-store.ts',
    load: demoTypeSources['./demos/redux-devtools/redux-devtools-store.ts']!,
  },
  {
    name: 'redux-devtools-hooks.ts',
    load: demoTypeSources['./demos/redux-devtools/redux-devtools-hooks.ts']!,
  },
  {
    name: 'redux-devtools-demo.tsx',
    load: demoSources['./demos/redux-devtools/redux-devtools-demo.tsx']!,
  },
  {
    name: 'redux-devtools-demo.css',
    load: demoStyleSources['./demos/redux-devtools/redux-devtools-demo.css']!,
  },
] as const

const featureFolderOrganizationSourceFiles = [
  {
    name: 'app/store.ts',
    load: demoTypeSources['./demos/feature-folder-organization/app/store.ts']!,
  },
  {
    name: 'app/hooks.ts',
    load: demoTypeSources['./demos/feature-folder-organization/app/hooks.ts']!,
  },
  {
    name: 'features/tasks/tasksSlice.ts',
    load: demoTypeSources['./demos/feature-folder-organization/features/tasks/tasksSlice.ts']!,
  },
  {
    name: 'features/tasks/TasksPanel.tsx',
    load: demoSources['./demos/feature-folder-organization/features/tasks/TasksPanel.tsx']!,
  },
  {
    name: 'feature-folder-demo.tsx',
    load: demoSources['./demos/feature-folder-organization/feature-folder-demo.tsx']!,
  },
  {
    name: 'feature-folder-demo.css',
    load: demoStyleSources['./demos/feature-folder-organization/feature-folder-demo.css']!,
  },
] as const

const taskFilterPanelSourceFiles = [
  {
    name: 'app/store.ts',
    load: demoTypeSources['./demos/task-filter-panel/app/store.ts']!,
  },
  {
    name: 'app/hooks.ts',
    load: demoTypeSources['./demos/task-filter-panel/app/hooks.ts']!,
  },
  {
    name: 'features/tasks/tasksSlice.ts',
    load: demoTypeSources['./demos/task-filter-panel/features/tasks/tasksSlice.ts']!,
  },
  {
    name: 'features/tasks/TasksPanel.tsx',
    load: demoSources['./demos/task-filter-panel/features/tasks/TasksPanel.tsx']!,
  },
  {
    name: 'task-filter-panel-demo.tsx',
    load: demoSources['./demos/task-filter-panel/task-filter-panel-demo.tsx']!,
  },
  {
    name: 'task-filter-panel-demo.css',
    load: demoStyleSources['./demos/task-filter-panel/task-filter-panel-demo.css']!,
  },
] as const

const shoppingCartStateCenterSourceFiles = [
  {
    name: 'app/store.ts',
    load: demoTypeSources['./demos/shopping-cart-state-center/app/store.ts']!,
  },
  {
    name: 'app/hooks.ts',
    load: demoTypeSources['./demos/shopping-cart-state-center/app/hooks.ts']!,
  },
  {
    name: 'features/cart/products.ts',
    load: demoTypeSources['./demos/shopping-cart-state-center/features/cart/products.ts']!,
  },
  {
    name: 'features/cart/cartSlice.ts',
    load: demoTypeSources['./demos/shopping-cart-state-center/features/cart/cartSlice.ts']!,
  },
  {
    name: 'features/cart/CartPanel.tsx',
    load: demoSources['./demos/shopping-cart-state-center/features/cart/CartPanel.tsx']!,
  },
  {
    name: 'shopping-cart-state-center-demo.tsx',
    load: demoSources['./demos/shopping-cart-state-center/shopping-cart-state-center-demo.tsx']!,
  },
  {
    name: 'shopping-cart-state-center-demo.css',
    load: demoStyleSources[
      './demos/shopping-cart-state-center/shopping-cart-state-center-demo.css'
    ]!,
  },
] as const

const selectorSourceFiles = [
  {
    name: 'app/store.ts',
    load: demoTypeSources['./demos/selector/app/store.ts']!,
  },
  {
    name: 'app/hooks.ts',
    load: demoTypeSources['./demos/selector/app/hooks.ts']!,
  },
  {
    name: 'features/inventory/inventorySlice.ts',
    load: demoTypeSources['./demos/selector/features/inventory/inventorySlice.ts']!,
  },
  {
    name: 'features/inventory/selectors.ts',
    load: demoTypeSources['./demos/selector/features/inventory/selectors.ts']!,
  },
  {
    name: 'features/inventory/InventoryPanel.tsx',
    load: demoSources['./demos/selector/features/inventory/InventoryPanel.tsx']!,
  },
  {
    name: 'selector-demo.tsx',
    load: demoSources['./demos/selector/selector-demo.tsx']!,
  },
  {
    name: 'selector-demo.css',
    load: demoStyleSources['./demos/selector/selector-demo.css']!,
  },
] as const

const createSelectorSourceFiles = [
  {
    name: 'create-selector-demo.tsx',
    load: demoSources['./demos/create-selector/create-selector-demo.tsx']!,
  },
  {
    name: 'create-selector-demo.css',
    load: demoStyleSources['./demos/create-selector/create-selector-demo.css']!,
  },
] as const

const useSelectorResultIdentitySourceFiles = [
  {
    name: 'use-selector-result-identity-and-subscription-demo.tsx',
    load: demoSources[
      './demos/use-selector-result-identity-and-subscription/use-selector-result-identity-and-subscription-demo.tsx'
    ]!,
  },
  {
    name: 'use-selector-result-identity-and-subscription-demo.css',
    load: demoStyleSources[
      './demos/use-selector-result-identity-and-subscription/use-selector-result-identity-and-subscription-demo.css'
    ]!,
  },
] as const

const thunkAsyncLogicSourceFiles = [
  {
    name: 'thunk-async-logic-demo.tsx',
    load: demoSources['./demos/thunk-async-logic/thunk-async-logic-demo.tsx']!,
  },
  {
    name: 'thunk-async-logic-demo.css',
    load: demoStyleSources['./demos/thunk-async-logic/thunk-async-logic-demo.css']!,
  },
] as const

const createAsyncThunkSourceFiles = [
  {
    name: 'create-async-thunk-demo.tsx',
    load: demoSources['./demos/create-async-thunk/create-async-thunk-demo.tsx']!,
  },
  {
    name: 'create-async-thunk-demo.css',
    load: demoStyleSources['./demos/create-async-thunk/create-async-thunk-demo.css']!,
  },
] as const

const asyncLifecycleStateSourceFiles = [
  {
    name: 'async-lifecycle-state-demo.tsx',
    load: demoSources['./demos/async-lifecycle-state/async-lifecycle-state-demo.tsx']!,
  },
  {
    name: 'async-lifecycle-state-demo.css',
    load: demoStyleSources['./demos/async-lifecycle-state/async-lifecycle-state-demo.css']!,
  },
] as const

const asyncErrorRejectWithValueSourceFiles = [
  {
    name: 'async-error-reject-with-value-demo.tsx',
    load: demoSources[
      './demos/async-error-reject-with-value/async-error-reject-with-value-demo.tsx'
    ]!,
  },
  {
    name: 'async-error-reject-with-value-demo.css',
    load: demoStyleSources[
      './demos/async-error-reject-with-value/async-error-reject-with-value-demo.css'
    ]!,
  },
] as const

const asyncCancelConditionSourceFiles = [
  {
    name: 'async-cancel-condition-demo.tsx',
    load: demoSources['./demos/async-cancel-condition/async-cancel-condition-demo.tsx']!,
  },
  {
    name: 'async-cancel-condition-demo.css',
    load: demoStyleSources['./demos/async-cancel-condition/async-cancel-condition-demo.css']!,
  },
] as const

const extraReducersActionMatcherSourceFiles = [
  {
    name: 'extra-reducers-action-matcher-demo.tsx',
    load: demoSources[
      './demos/extra-reducers-action-matcher/extra-reducers-action-matcher-demo.tsx'
    ]!,
  },
  {
    name: 'extra-reducers-action-matcher-demo.css',
    load: demoStyleSources[
      './demos/extra-reducers-action-matcher/extra-reducers-action-matcher-demo.css'
    ]!,
  },
] as const

const middlewareChainSourceFiles = [
  {
    name: 'middleware-chain-demo.tsx',
    load: demoSources['./demos/middleware-chain/middleware-chain-demo.tsx']!,
  },
  {
    name: 'middleware-chain-demo.css',
    load: demoStyleSources['./demos/middleware-chain/middleware-chain-demo.css']!,
  },
] as const

const defaultMiddlewareChecksSourceFiles = [
  {
    name: 'default-middleware-checks-demo.tsx',
    load: demoSources['./demos/default-middleware-checks/default-middleware-checks-demo.tsx']!,
  },
  {
    name: 'default-middleware-checks-demo.css',
    load: demoStyleSources['./demos/default-middleware-checks/default-middleware-checks-demo.css']!,
  },
] as const

const listenerMiddlewareSourceFiles = [
  {
    name: 'listener-middleware-demo.tsx',
    load: demoSources['./demos/listener-middleware/listener-middleware-demo.tsx']!,
  },
  {
    name: 'listener-middleware-demo.css',
    load: demoStyleSources['./demos/listener-middleware/listener-middleware-demo.css']!,
  },
] as const

const normalizedStateSourceFiles = [
  {
    name: 'normalized-state-demo.tsx',
    load: demoSources['./demos/normalized-state/normalized-state-demo.tsx']!,
  },
  {
    name: 'normalized-state-demo.css',
    load: demoStyleSources['./demos/normalized-state/normalized-state-demo.css']!,
  },
] as const

const createEntityAdapterSourceFiles = [
  {
    name: 'create-entity-adapter-demo.tsx',
    load: demoSources['./demos/create-entity-adapter/create-entity-adapter-demo.tsx']!,
  },
  {
    name: 'create-entity-adapter-demo.css',
    load: demoStyleSources['./demos/create-entity-adapter/create-entity-adapter-demo.css']!,
  },
] as const

const asyncContentManagementWorkspaceSourceFiles = [
  {
    name: 'async-content-management-workspace-demo.tsx',
    load: demoSources[
      './demos/async-content-management-workspace/async-content-management-workspace-demo.tsx'
    ]!,
  },
  {
    name: 'async-content-management-workspace-demo.css',
    load: demoStyleSources[
      './demos/async-content-management-workspace/async-content-management-workspace-demo.css'
    ]!,
  },
] as const

/** 合并一组 Redux Demo 文件的真实源码。 */
async function loadDemoSource(sourceFiles: readonly DemoSourceFile[]): Promise<string> {
  const sources = await Promise.all(
    sourceFiles.map(async ({ name, load }) => ({
      name,
      source: await load(),
    })),
  )
  return sources.map(({ name, source }) => `// ${name}\n${source.trimEnd()}`).join('\n\n')
}

/** 合并 configureStore Demo 的组件与样式源码。 */
async function loadConfigureStoreSource(): Promise<string> {
  return loadDemoSource(configureStoreSourceFiles)
}

/** 合并 Provider Demo 的组件与样式源码。 */
async function loadProviderSource(): Promise<string> {
  return loadDemoSource(providerSourceFiles)
}

/** 合并 createSlice Demo 的组件与样式源码。 */
async function loadCreateSliceSource(): Promise<string> {
  return loadDemoSource(createSliceSourceFiles)
}

/** 合并 Action 与 Payload Demo 的组件与样式源码。 */
async function loadActionAndPayloadSource(): Promise<string> {
  return loadDemoSource(actionAndPayloadSourceFiles)
}

/** 合并 Reducer 与 Immer Demo 的组件与样式源码。 */
async function loadReducerAndImmerSource(): Promise<string> {
  return loadDemoSource(reducerAndImmerSourceFiles)
}

/** 合并 useSelector Demo 的组件与样式源码。 */
async function loadUseSelectorSource(): Promise<string> {
  return loadDemoSource(useSelectorSourceFiles)
}

/** 合并 useDispatch Demo 的组件与样式源码。 */
async function loadUseDispatchSource(): Promise<string> {
  return loadDemoSource(useDispatchSourceFiles)
}

/** 合并 TypeScript 预类型 Hooks Demo 的真实源码。 */
async function loadTypedHooksSource(): Promise<string> {
  return loadDemoSource(typedHooksSourceFiles)
}

/** 合并多 Slice 与 RootState Demo 的真实源码。 */
async function loadMultipleSlicesRootStateSource(): Promise<string> {
  return loadDemoSource(multipleSlicesRootStateSourceFiles)
}

/** 合并状态所有权 Demo 的真实源码。 */
async function loadStateOwnershipSource(): Promise<string> {
  return loadDemoSource(stateOwnershipSourceFiles)
}

/** 合并 Redux DevTools Demo 的真实源码。 */
async function loadReduxDevToolsSource(): Promise<string> {
  return loadDemoSource(reduxDevToolsSourceFiles)
}

/** 合并 Feature 目录组织 Demo 的嵌套源码。 */
async function loadFeatureFolderOrganizationSource(): Promise<string> {
  return loadDemoSource(featureFolderOrganizationSourceFiles)
}

/** 合并任务筛选面板 Demo 的嵌套源码。 */
async function loadTaskFilterPanelSource(): Promise<string> {
  return loadDemoSource(taskFilterPanelSourceFiles)
}

/** 合并购物车状态中心 Demo 的嵌套源码。 */
async function loadShoppingCartStateCenterSource(): Promise<string> {
  return loadDemoSource(shoppingCartStateCenterSourceFiles)
}

/** 合并 Selector Demo 的嵌套源码。 */
async function loadSelectorSource(): Promise<string> {
  return loadDemoSource(selectorSourceFiles)
}

/** 合并 createSelector Demo 的组件与样式源码。 */
async function loadCreateSelectorSource(): Promise<string> {
  return loadDemoSource(createSelectorSourceFiles)
}

/** 合并 useSelector 结果身份与订阅 Demo 的组件和样式源码。 */
async function loadUseSelectorResultIdentitySource(): Promise<string> {
  return loadDemoSource(useSelectorResultIdentitySourceFiles)
}

/** 合并 Thunk 异步流程 Demo 的组件和样式源码。 */
async function loadThunkAsyncLogicSource(): Promise<string> {
  return loadDemoSource(thunkAsyncLogicSourceFiles)
}

/** 合并 createAsyncThunk 结果观察 Demo 的组件和样式源码。 */
async function loadCreateAsyncThunkSource(): Promise<string> {
  return loadDemoSource(createAsyncThunkSourceFiles)
}

/** 合并异步生命周期状态 Demo 的组件和样式源码。 */
async function loadAsyncLifecycleStateSource(): Promise<string> {
  return loadDemoSource(asyncLifecycleStateSourceFiles)
}

/** 合并异步错误分流 Demo 的组件和样式源码。 */
async function loadAsyncErrorRejectWithValueSource(): Promise<string> {
  return loadDemoSource(asyncErrorRejectWithValueSourceFiles)
}

/** 合并异步取消 Demo 的组件和样式源码。 */
async function loadAsyncCancelConditionSource(): Promise<string> {
  return loadDemoSource(asyncCancelConditionSourceFiles)
}

/** 合并 extraReducers 与 matcher Demo 的组件和样式源码。 */
async function loadExtraReducersActionMatcherSource(): Promise<string> {
  return loadDemoSource(extraReducersActionMatcherSourceFiles)
}

/** 合并 Middleware 执行链 Demo 的组件与样式源码。 */
async function loadMiddlewareChainSource(): Promise<string> {
  return loadDemoSource(middlewareChainSourceFiles)
}

/** 合并默认 Middleware 检查 Demo 的组件与样式源码。 */
async function loadDefaultMiddlewareChecksSource(): Promise<string> {
  return loadDemoSource(defaultMiddlewareChecksSourceFiles)
}

/** 合并 Listener Middleware Demo 的组件与样式源码。 */
async function loadListenerMiddlewareSource(): Promise<string> {
  return loadDemoSource(listenerMiddlewareSourceFiles)
}

/** 合并标准化状态 Demo 的组件与样式源码。 */
async function loadNormalizedStateSource(): Promise<string> {
  return loadDemoSource(normalizedStateSourceFiles)
}

/** 合并 createEntityAdapter Demo 的组件与样式源码。 */
async function loadCreateEntityAdapterSource(): Promise<string> {
  return loadDemoSource(createEntityAdapterSourceFiles)
}

/** 合并异步内容管理工作区 Demo 的组件与样式源码。 */
async function loadAsyncContentManagementWorkspaceSource(): Promise<string> {
  return loadDemoSource(asyncContentManagementWorkspaceSourceFiles)
}

/** 为 React 宿主加载独立的 configureStore 观察组件。 */
async function loadConfigureStoreComponent(): Promise<ReactComponentModule> {
  const { createConfigureStoreDemo } =
    await configureStoreFactories['./demos/configure-store/configure-store-demo.tsx']!()
  return { default: createConfigureStoreDemo() }
}

/** 为 React 宿主加载带 Provider 的作用域观察组件。 */
async function loadProviderComponent(): Promise<ReactComponentModule> {
  const { createProviderDemo } = await providerFactories['./demos/provider/provider-demo.tsx']!()
  return { default: createProviderDemo() }
}

/** 为 React 宿主加载 createSlice 动作生成观察组件。 */
async function loadCreateSliceComponent(): Promise<ReactComponentModule> {
  const { createCreateSliceDemo } =
    await createSliceFactories['./demos/create-slice/create-slice-demo.tsx']!()
  return { default: createCreateSliceDemo() }
}

/** 为 React 宿主加载 Action 与 Payload 观察组件。 */
async function loadActionAndPayloadComponent(): Promise<ReactComponentModule> {
  const { createActionAndPayloadDemo } =
    await actionAndPayloadFactories['./demos/action-and-payload/action-and-payload-demo.tsx']!()
  return { default: createActionAndPayloadDemo() }
}

/** 为 React 宿主加载 Reducer 与 Immer 观察组件。 */
async function loadReducerAndImmerComponent(): Promise<ReactComponentModule> {
  const { createReducerAndImmerDemo } =
    await reducerAndImmerFactories['./demos/reducer-and-immer/reducer-and-immer-demo.tsx']!()
  return { default: createReducerAndImmerDemo() }
}

/** 为 React 宿主加载 useSelector 订阅观察组件。 */
async function loadUseSelectorComponent(): Promise<ReactComponentModule> {
  const { createUseSelectorDemo } =
    await useSelectorFactories['./demos/use-selector/use-selector-demo.tsx']!()
  return { default: createUseSelectorDemo() }
}

/** 为 React 宿主加载 useDispatch 事件派发组件。 */
async function loadUseDispatchComponent(): Promise<ReactComponentModule> {
  const { createUseDispatchDemo } =
    await useDispatchFactories['./demos/use-dispatch/use-dispatch-demo.tsx']!()
  return { default: createUseDispatchDemo() }
}

/** 为 React 宿主加载 TypeScript 预类型 Hooks 组件。 */
async function loadTypedHooksComponent(): Promise<ReactComponentModule> {
  const { createTypedHooksDemo } =
    await typedHooksFactories['./demos/typescript-pretyped-hooks/typed-hooks-demo.tsx']!()
  return { default: createTypedHooksDemo() }
}

/** 为 React 宿主加载多 Slice 与 RootState 观察组件。 */
async function loadMultipleSlicesRootStateComponent(): Promise<ReactComponentModule> {
  const { createMultipleSlicesRootStateDemo } =
    await multipleSlicesRootStateFactories[
      './demos/multiple-slices-root-state/multiple-slices-root-state-demo.tsx'
    ]!()
  return { default: createMultipleSlicesRootStateDemo() }
}

/** 为 React 宿主加载状态所有权观察组件。 */
async function loadStateOwnershipComponent(): Promise<ReactComponentModule> {
  const { createStateOwnershipDemo } =
    await stateOwnershipFactories['./demos/state-ownership/state-ownership-demo.tsx']!()
  return { default: createStateOwnershipDemo() }
}

/** 为 React 宿主加载 Redux DevTools 观察组件。 */
async function loadReduxDevToolsComponent(): Promise<ReactComponentModule> {
  const { createReduxDevToolsDemo } =
    await reduxDevToolsFactories['./demos/redux-devtools/redux-devtools-demo.tsx']!()
  return { default: createReduxDevToolsDemo() }
}

/** 为 React 宿主加载 Feature 目录组织观察组件。 */
async function loadFeatureFolderOrganizationComponent(): Promise<ReactComponentModule> {
  const { createFeatureFolderDemo } =
    await featureFolderOrganizationFactories[
      './demos/feature-folder-organization/feature-folder-demo.tsx'
    ]!()
  return { default: createFeatureFolderDemo() }
}

/** 为 React 宿主加载任务筛选面板组件。 */
async function loadTaskFilterPanelComponent(): Promise<ReactComponentModule> {
  const { createTaskFilterPanelDemo } =
    await taskFilterPanelFactories['./demos/task-filter-panel/task-filter-panel-demo.tsx']!()
  return { default: createTaskFilterPanelDemo() }
}

/** 为 React 宿主加载购物车状态中心组件。 */
async function loadShoppingCartStateCenterComponent(): Promise<ReactComponentModule> {
  const { createShoppingCartStateCenterDemo } =
    await shoppingCartStateCenterFactories[
      './demos/shopping-cart-state-center/shopping-cart-state-center-demo.tsx'
    ]!()
  return { default: createShoppingCartStateCenterDemo() }
}

/** 为 React 宿主加载 Selector 库存查询工作台。 */
async function loadSelectorComponent(): Promise<ReactComponentModule> {
  const { createSelectorDemo } = await selectorFactories['./demos/selector/selector-demo.tsx']!()
  return { default: createSelectorDemo() }
}

/** 为 React 宿主加载 createSelector 缓存观察台。 */
async function loadCreateSelectorComponent(): Promise<ReactComponentModule> {
  const { createCreateSelectorDemo } =
    await createSelectorFactories['./demos/create-selector/create-selector-demo.tsx']!()
  return { default: createCreateSelectorDemo() }
}

/** 为 React 宿主加载 useSelector 结果身份与订阅观察台。 */
async function loadUseSelectorResultIdentityComponent(): Promise<ReactComponentModule> {
  const { createUseSelectorResultIdentityDemo } =
    await useSelectorResultIdentityFactories[
      './demos/use-selector-result-identity-and-subscription/use-selector-result-identity-and-subscription-demo.tsx'
    ]!()
  return { default: createUseSelectorResultIdentityDemo() }
}

/** 为 React 宿主加载 Thunk 异步流程观察台。 */
async function loadThunkAsyncLogicComponent(): Promise<ReactComponentModule> {
  const { createThunkAsyncLogicDemo } =
    await thunkAsyncLogicFactories['./demos/thunk-async-logic/thunk-async-logic-demo.tsx']!()
  return { default: createThunkAsyncLogicDemo() }
}

/** 为 React 宿主加载 createAsyncThunk 结果观察台。 */
async function loadCreateAsyncThunkComponent(): Promise<ReactComponentModule> {
  const { createCreateAsyncThunkDemo } =
    await createAsyncThunkFactories['./demos/create-async-thunk/create-async-thunk-demo.tsx']!()
  return { default: createCreateAsyncThunkDemo() }
}

/** 为 React 宿主加载异步生命周期状态台。 */
async function loadAsyncLifecycleStateComponent(): Promise<ReactComponentModule> {
  const { createAsyncLifecycleStateDemo } =
    await asyncLifecycleStateFactories[
      './demos/async-lifecycle-state/async-lifecycle-state-demo.tsx'
    ]!()
  return { default: createAsyncLifecycleStateDemo() }
}

/** 为 React 宿主加载异步错误分流台。 */
async function loadAsyncErrorRejectWithValueComponent(): Promise<ReactComponentModule> {
  const { createAsyncErrorRejectWithValueDemo } =
    await asyncErrorRejectWithValueFactories[
      './demos/async-error-reject-with-value/async-error-reject-with-value-demo.tsx'
    ]!()
  return { default: createAsyncErrorRejectWithValueDemo() }
}

/** 为 React 宿主加载异步取消与条件观察台。 */
async function loadAsyncCancelConditionComponent(): Promise<ReactComponentModule> {
  const { createAsyncCancelConditionDemo } =
    await asyncCancelConditionFactories[
      './demos/async-cancel-condition/async-cancel-condition-demo.tsx'
    ]!()
  return { default: createAsyncCancelConditionDemo() }
}

/** 为 React 宿主加载 extraReducers 与 matcher 观察台。 */
async function loadExtraReducersActionMatcherComponent(): Promise<ReactComponentModule> {
  const { createExtraReducersActionMatcherDemo } =
    await extraReducersActionMatcherFactories[
      './demos/extra-reducers-action-matcher/extra-reducers-action-matcher-demo.tsx'
    ]!()
  return { default: createExtraReducersActionMatcherDemo() }
}

/** 为 React 宿主加载 Middleware 执行链观察台。 */
async function loadMiddlewareChainComponent(): Promise<ReactComponentModule> {
  const { createMiddlewareChainDemo } =
    await middlewareChainFactories['./demos/middleware-chain/middleware-chain-demo.tsx']!()
  return { default: createMiddlewareChainDemo() }
}

/** 为 React 宿主加载默认 Middleware 检查观察台。 */
async function loadDefaultMiddlewareChecksComponent(): Promise<ReactComponentModule> {
  const { createDefaultMiddlewareChecksDemo } =
    await defaultMiddlewareChecksFactories[
      './demos/default-middleware-checks/default-middleware-checks-demo.tsx'
    ]!()
  return { default: createDefaultMiddlewareChecksDemo() }
}

/** 为 React 宿主加载 Listener Middleware 观察台。 */
async function loadListenerMiddlewareComponent(): Promise<ReactComponentModule> {
  const { createListenerMiddlewareDemo } =
    await listenerMiddlewareFactories['./demos/listener-middleware/listener-middleware-demo.tsx']!()
  return { default: createListenerMiddlewareDemo() }
}

/** 为 React 宿主加载标准化状态观察台。 */
async function loadNormalizedStateComponent(): Promise<ReactComponentModule> {
  const { createNormalizedStateDemo } =
    await normalizedStateFactories['./demos/normalized-state/normalized-state-demo.tsx']!()
  return { default: createNormalizedStateDemo() }
}

/** 为 React 宿主加载 createEntityAdapter 观察台。 */
async function loadCreateEntityAdapterComponent(): Promise<ReactComponentModule> {
  const { createCreateEntityAdapterDemo } =
    await createEntityAdapterFactories[
      './demos/create-entity-adapter/create-entity-adapter-demo.tsx'
    ]!()
  return { default: createCreateEntityAdapterDemo() }
}

/** 为 React 宿主加载异步内容管理工作区。 */
async function loadAsyncContentManagementWorkspaceComponent(): Promise<ReactComponentModule> {
  const { createAsyncContentManagementWorkspaceDemo } =
    await asyncContentManagementWorkspaceFactories[
      './demos/async-content-management-workspace/async-content-management-workspace-demo.tsx'
    ]!()
  return { default: createAsyncContentManagementWorkspaceDemo() }
}

export const reactReduxDemoAssets: DemoAssetManifest[] = [
  {
    id: 'react.redux.learn.basics.configure-store.store-setup-demo',
    title: 'configureStore 状态观察器',
    runtime: 'react',
    loadComponent: loadConfigureStoreComponent,
    loadSource: loadConfigureStoreSource,
  },
  {
    id: 'react.redux.learn.basics.provider.provider-scope-demo',
    title: 'Provider 作用域观察器',
    runtime: 'react',
    loadComponent: loadProviderComponent,
    loadSource: loadProviderSource,
  },
  {
    id: 'react.redux.learn.basics.create-slice.create-slice-demo',
    title: 'createSlice 动作生成器',
    runtime: 'react',
    loadComponent: loadCreateSliceComponent,
    loadSource: loadCreateSliceSource,
  },
  {
    id: 'react.redux.learn.basics.action-and-payload.action-and-payload-demo',
    title: 'Action 与 Payload 观察器',
    runtime: 'react',
    loadComponent: loadActionAndPayloadComponent,
    loadSource: loadActionAndPayloadSource,
  },
  {
    id: 'react.redux.learn.basics.reducer-and-immer.reducer-and-immer-demo',
    title: 'Reducer 与 Immer 观察器',
    runtime: 'react',
    loadComponent: loadReducerAndImmerComponent,
    loadSource: loadReducerAndImmerSource,
  },
  {
    id: 'react.redux.learn.basics.use-selector.use-selector-demo',
    title: 'useSelector 订阅观察器',
    runtime: 'react',
    loadComponent: loadUseSelectorComponent,
    loadSource: loadUseSelectorSource,
  },
  {
    id: 'react.redux.learn.basics.use-dispatch.use-dispatch-demo',
    title: 'useDispatch 事件派发观察器',
    runtime: 'react',
    loadComponent: loadUseDispatchComponent,
    loadSource: loadUseDispatchSource,
  },
  {
    id: 'react.redux.learn.basics.typescript-pretyped-hooks.typed-hooks-demo',
    title: 'TypeScript 预类型 Hooks 观察器',
    runtime: 'react',
    loadComponent: loadTypedHooksComponent,
    loadSource: loadTypedHooksSource,
  },
  {
    id: 'react.redux.learn.basics.multiple-slices-root-state.multiple-slices-root-state-demo',
    title: '多 Slice 状态树观察器',
    runtime: 'react',
    loadComponent: loadMultipleSlicesRootStateComponent,
    loadSource: loadMultipleSlicesRootStateSource,
  },
  {
    id: 'react.redux.learn.basics.state-ownership.state-ownership-demo',
    title: '状态所有权观察器',
    runtime: 'react',
    loadComponent: loadStateOwnershipComponent,
    loadSource: loadStateOwnershipSource,
  },
  {
    id: 'react.redux.learn.basics.redux-devtools.redux-devtools-demo',
    title: 'Redux DevTools 观察器',
    runtime: 'react',
    loadComponent: loadReduxDevToolsComponent,
    loadSource: loadReduxDevToolsSource,
  },
  {
    id: 'react.redux.learn.basics.feature-folder-organization.feature-folder-demo',
    title: 'Feature 目录组织观察器',
    runtime: 'react',
    loadComponent: loadFeatureFolderOrganizationComponent,
    loadSource: loadFeatureFolderOrganizationSource,
  },
  {
    id: 'react.redux.learn.basics.task-filter-panel.task-filter-panel-demo',
    title: '任务筛选面板实战',
    runtime: 'react',
    loadComponent: loadTaskFilterPanelComponent,
    loadSource: loadTaskFilterPanelSource,
  },
  {
    id: 'react.redux.learn.basics.shopping-cart-state-center.shopping-cart-state-center-demo',
    title: '购物车状态中心实战',
    runtime: 'react',
    loadComponent: loadShoppingCartStateCenterComponent,
    loadSource: loadShoppingCartStateCenterSource,
  },
  {
    id: 'react.redux.learn.intermediate.selector.inventory-query-demo',
    title: 'Selector 库存查询工作台',
    runtime: 'react',
    loadComponent: loadSelectorComponent,
    loadSource: loadSelectorSource,
  },
  {
    id: 'react.redux.learn.intermediate.create-selector.memoization-observer-demo',
    title: 'createSelector 缓存观察台',
    runtime: 'react',
    loadComponent: loadCreateSelectorComponent,
    loadSource: loadCreateSelectorSource,
  },
  {
    id: 'react.redux.learn.intermediate.use-selector-result-identity-and-subscription.subscription-observer-demo',
    title: 'useSelector 结果身份与订阅观察台',
    runtime: 'react',
    loadComponent: loadUseSelectorResultIdentityComponent,
    loadSource: loadUseSelectorResultIdentitySource,
  },
  {
    id: 'react.redux.learn.intermediate.thunk-async-logic.workflow-observer-demo',
    title: '手写 Thunk 异步流程观察台',
    runtime: 'react',
    loadComponent: loadThunkAsyncLogicComponent,
    loadSource: loadThunkAsyncLogicSource,
  },
  {
    id: 'react.redux.learn.intermediate.create-async-thunk.result-observer-demo',
    title: 'createAsyncThunk 结果观察台',
    runtime: 'react',
    loadComponent: loadCreateAsyncThunkComponent,
    loadSource: loadCreateAsyncThunkSource,
  },
  {
    id: 'react.redux.learn.intermediate.async-lifecycle-state.request-state-demo',
    title: '异步生命周期状态台',
    runtime: 'react',
    loadComponent: loadAsyncLifecycleStateComponent,
    loadSource: loadAsyncLifecycleStateSource,
  },
  {
    id: 'react.redux.learn.intermediate.async-error-reject-with-value.error-channel-demo',
    title: '异步错误分流台',
    runtime: 'react',
    loadComponent: loadAsyncErrorRejectWithValueComponent,
    loadSource: loadAsyncErrorRejectWithValueSource,
  },
  {
    id: 'react.redux.learn.intermediate.async-cancel-condition.cancel-condition-demo',
    title: '异步取消与请求条件观察台',
    runtime: 'react',
    loadComponent: loadAsyncCancelConditionComponent,
    loadSource: loadAsyncCancelConditionSource,
  },
  {
    id: 'react.redux.learn.intermediate.extra-reducers-action-matcher.external-action-matcher-demo',
    title: 'extraReducers 与 Action Matcher 观察台',
    runtime: 'react',
    loadComponent: loadExtraReducersActionMatcherComponent,
    loadSource: loadExtraReducersActionMatcherSource,
  },
  {
    id: 'react.redux.learn.intermediate.middleware-chain.middleware-chain-observer-demo',
    title: 'Middleware 执行链观察台',
    runtime: 'react',
    loadComponent: loadMiddlewareChainComponent,
    loadSource: loadMiddlewareChainSource,
  },
  {
    id: 'react.redux.learn.intermediate.default-middleware-checks.default-middleware-checks-demo',
    title: '默认 Middleware 检查观察台',
    runtime: 'react',
    loadComponent: loadDefaultMiddlewareChecksComponent,
    loadSource: loadDefaultMiddlewareChecksSource,
  },
  {
    id: 'react.redux.learn.intermediate.listener-middleware.listener-middleware-demo',
    title: 'Listener Middleware 观察台',
    runtime: 'react',
    loadComponent: loadListenerMiddlewareComponent,
    loadSource: loadListenerMiddlewareSource,
  },
  {
    id: 'react.redux.learn.intermediate.normalized-state.normalized-state-demo',
    title: '标准化状态观察台',
    runtime: 'react',
    loadComponent: loadNormalizedStateComponent,
    loadSource: loadNormalizedStateSource,
  },
  {
    id: 'react.redux.learn.intermediate.create-entity-adapter.create-entity-adapter-demo',
    title: 'createEntityAdapter 实体集合观察台',
    runtime: 'react',
    loadComponent: loadCreateEntityAdapterComponent,
    loadSource: loadCreateEntityAdapterSource,
  },
  {
    id: 'react.redux.learn.intermediate.async-content-management-workspace.content-workspace-demo',
    title: '异步内容管理工作区',
    runtime: 'react',
    loadComponent: loadAsyncContentManagementWorkspaceComponent,
    loadSource: loadAsyncContentManagementWorkspaceSource,
  },
]
