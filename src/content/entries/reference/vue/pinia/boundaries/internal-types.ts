/**
 * Pinia 4.0.2 restricted internal types watchlist。
 * 只解释发布物中的 internal 类型及公开替代，不在应用代码中导入这些类型。
 */
import { defineReference, defineReferenceMeta, type ContentBlock } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia'

interface InternalTypeDefinition {
  heading: string
  name: string
  officialUrl: string
  fixedSource: string
  publicSignature: string
  publicAlternative: string
}

const internalTypeDefinitions: readonly InternalTypeDefinition[] = [
  {
    heading: 'Internal Store On Action Listener Context',
    name: '_StoreOnActionListenerContext',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/interfaces/StoreOnActionListenerContext.html',
    fixedSource:
      '`src/types.ts` 组合 action name、store、args、after 与 onError 的内部泛型上下文。',
    publicSignature: '`StoreOnActionListenerContext`、`StoreOnActionListener` 与 `$onAction()`',
    publicAlternative: '让 `$onAction()` 回调直接推断，或使用 `StoreOnActionListenerContext`。',
  },
  {
    heading: 'Internal Store With State',
    name: '_StoreWithState',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html',
    fixedSource:
      '`src/types.ts` 汇集 `$state/$patch/$reset/$subscribe/$dispose` 的内部 Store 基座。',
    publicSignature: '`Store`、`StoreGeneric` 与 `StoreDefinition` 的实例返回值',
    publicAlternative: '使用 `ReturnType<typeof useStore>`、`Store` 或 `StoreGeneric`。',
  },
  {
    heading: 'Internal Subscription Callback Mutation Base',
    name: '_SubscriptionCallbackMutationBase',
    officialUrl:
      'https://pinia.vuejs.org/api/pinia/interfaces/SubscriptionCallbackMutationBase.html',
    fixedSource: '`src/types.ts` 为三种公开 mutation 分支提供 type、storeId 与 dev-only events。',
    publicSignature: '`SubscriptionCallbackMutationDirect/PatchObject/PatchFunction`',
    publicAlternative: '使用公开联合 `SubscriptionCallbackMutation<S>` 做分支收窄。',
  },
  {
    heading: 'Internal Actions Tree',
    name: '_ActionsTree',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/ActionsTree.html',
    fixedSource: '`src/types.ts` 以字符串到 `_Method` 的记录作为内部 action 默认约束。',
    publicSignature: '`StoreDefinition`、`StoreGeneric`、`StoreOnActionListener`',
    publicAlternative: '让 `defineStore()` 推断 actions，读取时使用 `StoreActions<SS>`。',
  },
  {
    heading: 'Internal Deep Partial',
    name: '_DeepPartial',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/DeepPartial.html',
    fixedSource: '`src/types.ts` 递归放宽 `$patch()` object 与 patch-object payload 的字段。',
    publicSignature: '`Store.$patch()`、`SubscriptionCallbackMutationPatchObject<S>`',
    publicAlternative: '直接让 `$patch({ ... })` 校验输入，订阅侧使用公开 patch-object 类型。',
  },
  {
    heading: 'Internal Extract Actions From Setup Store',
    name: '_ExtractActionsFromSetupStore',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore.html',
    fixedSource: '`src/types.ts` 从 Setup Store 返回对象挑出 action，供定义返回类型内部组装。',
    publicSignature: '`SetupStoreDefinition`、Setup 形式 `defineStore()`',
    publicAlternative: '从 Store 实例读取 `StoreActions<ReturnType<typeof useStore>>`。',
  },
  {
    heading: 'Internal Extract Actions From Setup Store Keys',
    name: '_ExtractActionsFromSetupStore_Keys',
    officialUrl:
      'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractActionsFromSetupStore_Keys.html',
    fixedSource: '`src/types.ts` 用 key remapping 选择 Setup Store 返回对象中的函数键。',
    publicSignature: 'Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreActions<SS>`',
    publicAlternative: '让 `defineStore()` 推断；消费结果时使用 `StoreActions<SS>`。',
  },
  {
    heading: 'Internal Extract Getters From Setup Store',
    name: '_ExtractGettersFromSetupStore',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore.html',
    fixedSource: '`src/types.ts` 从 Setup Store 返回对象挑出 computed getters。',
    publicSignature: '`SetupStoreDefinition`、Setup 形式 `defineStore()`',
    publicAlternative: '从 Store 实例读取 `StoreGetters<ReturnType<typeof useStore>>`。',
  },
  {
    heading: 'Internal Extract Getters From Setup Store Keys',
    name: '_ExtractGettersFromSetupStore_Keys',
    officialUrl:
      'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractGettersFromSetupStore_Keys.html',
    fixedSource: '`src/types.ts` 用 key remapping 选择 Setup Store 返回对象中的 ComputedRef 键。',
    publicSignature: 'Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreGetters<SS>`',
    publicAlternative: '让 `defineStore()` 推断；消费结果时使用 `StoreGetters<SS>`。',
  },
  {
    heading: 'Internal Extract State From Setup Store',
    name: '_ExtractStateFromSetupStore',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore.html',
    fixedSource: '`src/types.ts` 从 Setup Store 返回对象挑出既非方法也非 computed 的 state。',
    publicSignature: '`SetupStoreDefinition`、Setup 形式 `defineStore()`',
    publicAlternative: '从 Store 实例读取 `StoreState<ReturnType<typeof useStore>>`。',
  },
  {
    heading: 'Internal Extract State From Setup Store Keys',
    name: '_ExtractStateFromSetupStore_Keys',
    officialUrl:
      'https://pinia.vuejs.org/api/pinia/type-aliases/ExtractStateFromSetupStore_Keys.html',
    fixedSource: '`src/types.ts` 用 key remapping 排除方法与 ComputedRef 键。',
    publicSignature: 'Setup 形式 `defineStore()`、`SetupStoreDefinition`、`StoreState<SS>`',
    publicAlternative: '让 `defineStore()` 推断；消费结果时使用 `StoreState<SS>`。',
  },
  {
    heading: 'Internal Getters Tree',
    name: '_GettersTree',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/GettersTree.html',
    fixedSource: '`src/types.ts` 表达 Options getter 的 state 参数或无参 getter 内部约束。',
    publicSignature: '`Store`、`StoreDefinition`、map helpers 的泛型约束',
    publicAlternative: '在 `defineStore()` 中声明 getters，并用 `StoreGetters<SS>` 读取结果。',
  },
  {
    heading: 'Internal Map Actions Object Return',
    name: '_MapActionsObjectReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsObjectReturn.html',
    fixedSource: '`src/mapHelpers.ts` 按 object mapper 的新键名重组 action 返回类型。',
    publicSignature: '`mapActions(useStore, { localName: actionName })`',
    publicAlternative: '直接调用 `mapActions()` object overload，让调用结果自行推断。',
  },
  {
    heading: 'Internal Map Actions Return',
    name: '_MapActionsReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapActionsReturn.html',
    fixedSource: '`src/mapHelpers.ts` 保留 array overload 选中的 action 键与函数签名。',
    publicSignature: '`mapActions(useStore, [actionName])`',
    publicAlternative: '直接调用 `mapActions()` array overload，让调用结果自行推断。',
  },
  {
    heading: 'Internal Map State Object Return',
    name: '_MapStateObjectReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapStateObjectReturn.html',
    fixedSource: '`src/mapHelpers.ts` 把 object mapper 转为 Options API computed getter 集合。',
    publicSignature: '`mapState(useStore, { localName: stateOrGetter })`',
    publicAlternative: '直接调用 `mapState()` object overload，让调用结果自行推断。',
  },
  {
    heading: 'Internal Map State Return',
    name: '_MapStateReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapStateReturn.html',
    fixedSource: '`src/mapHelpers.ts` 把 array overload 的 state/getter 键转为 computed getter。',
    publicSignature: '`mapState(useStore, [stateOrGetter])`',
    publicAlternative: '直接调用 `mapState()` array overload，让调用结果自行推断。',
  },
  {
    heading: 'Internal Map Writable State Object Return',
    name: '_MapWritableStateObjectReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateObjectReturn.html',
    fixedSource: '`src/mapHelpers.ts` 为 object mapper 生成 computed getter/setter 对。',
    publicSignature: '`mapWritableState(useStore, { localName: stateName })`',
    publicAlternative: '直接调用 `mapWritableState()` object overload，让结果自行推断。',
  },
  {
    heading: 'Internal Map Writable State Return',
    name: '_MapWritableStateReturn',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/MapWritableStateReturn.html',
    fixedSource: '`src/mapHelpers.ts` 为 array overload 生成选中 state 的 getter/setter 对。',
    publicSignature: '`mapWritableState(useStore, [stateName])`',
    publicAlternative: '直接调用 `mapWritableState()` array overload，让结果自行推断。',
  },
  {
    heading: 'Internal Method',
    name: '_Method',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/Method.html',
    fixedSource: '`src/types.ts` 提供可推断参数与返回值的最宽内部函数约束。',
    publicSignature: '`StoreOnActionListener`、`StoreActions<SS>` 与 Setup Store action 推断链',
    publicAlternative: '为业务 action 写明确函数类型，或使用 `StoreActions<SS>`。',
  },
  {
    heading: 'Internal Spread',
    name: '_Spread',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/Spread.html',
    fixedSource: '`src/mapHelpers.ts` 递归合并多个 `_StoreObject`，形成 mapStores 返回对象。',
    publicSignature: '`mapStores(...stores)`',
    publicAlternative: '直接调用 `mapStores()`，不要手写它的递归交叉类型。',
  },
  {
    heading: 'Internal Store Object',
    name: '_StoreObject',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/StoreObject.html',
    fixedSource: '`src/mapHelpers.ts` 把单个 StoreDefinition 转为带 suffix 的 computed 属性。',
    publicSignature: '`mapStores()` 返回对象中的单个 Store 项',
    publicAlternative: '使用 `mapStores()` 与公开 `MapStoresCustomization`。',
  },
  {
    heading: 'Internal Store With Actions',
    name: '_StoreWithActions',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithActions.html',
    fixedSource:
      '`src/types.ts` 映射 action 的参数与返回值；固定声明只定义并导出该 alias，`Store` 直接交叉 `A`。',
    publicSignature: '无；固定 `pinia.d.ts` 未由其他公开签名引用',
    publicAlternative: '使用 `Store`、`StoreActions<SS>` 或具体 Store 的返回类型。',
  },
  {
    heading: 'Internal Store With Getters',
    name: '_StoreWithGetters',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/StoreWithGetters.html',
    fixedSource: '`src/types.ts` 合并 readonly 与 writable computed getter 的展开结果。',
    publicSignature: '`Store`',
    publicAlternative: '使用 `Store`、`StoreGetters<SS>` 或具体 Store 的返回类型。',
  },
  {
    heading: 'Internal Unwrap All',
    name: '_UnwrapAll',
    officialUrl: 'https://pinia.vuejs.org/api/pinia/type-aliases/UnwrapAll.html',
    fixedSource: '`src/types.ts` 逐键 UnwrapRef；`src/storeToRefs.ts` 用它识别 state ref 形态。',
    publicSignature: '`storeToRefs(store)` 返回值',
    publicAlternative: '调用 `storeToRefs()`，或使用 `StoreState<SS>` 等公开类型。',
  },
]

const internalTypeBlocks = internalTypeDefinitions.flatMap<ContentBlock>((definition) => [
  { type: 'heading', content: definition.heading },
  {
    type: 'table',
    headers: ['名称', 'sourceTag', '固定源码说明', '所在公开签名', '公开替代'],
    rows: [
      [
        definition.name,
        'internal',
        definition.fixedSource,
        definition.publicSignature,
        definition.publicAlternative,
      ],
    ],
  },
])

export const meta = defineReferenceMeta({
  id: 'vue.pinia.reference.boundaries.internal-types',
  type: 'reference',
  title: 'Pinia Internal Types Watchlist',
  summary: '集中查询 Pinia 4.0.2 的 24 个 internal 类型、所在公开签名与稳定替代',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'boundaries',
  related: [
    'vue.pinia.reference.stores.store-shape',
    'vue.pinia.reference.stores.store-to-refs',
    'vue.pinia.reference.observation.subscriptions',
    'vue.pinia.reference.options-api.map-helpers',
  ],
  tags: [
    'Pinia',
    'internal',
    'restricted',
    'watchlist',
    ...internalTypeDefinitions.map(({ name }) => name),
  ],
  sources: [
    {
      title: 'Pinia API 根索引',
      url: 'https://pinia.vuejs.org/api/pinia/',
    },
    {
      title: 'Pinia 4.0.2：types.ts 固定源码',
      url: `${fixedSourceBase}/src/types.ts`,
    },
    {
      title: 'Pinia 4.0.2：mapHelpers.ts 固定源码',
      url: `${fixedSourceBase}/src/mapHelpers.ts`,
    },
    {
      title: 'Pinia 4.0.2：storeToRefs.ts 固定源码',
      url: `${fixedSourceBase}/src/storeToRefs.ts`,
    },
    ...internalTypeDefinitions.map(({ name, officialUrl }) => ({
      title: `Pinia API：${name}`,
      url: officialUrl,
    })),
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  anchors: [
    '概述',
    ...internalTypeDefinitions.map(({ heading }) => heading),
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: `restricted watchlist: 3 internal interfaces + 21 internal type aliases
stable Reference Overview: 41 / 41（本页不进入稳定分母）`,
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '本页只登记 Pinia 4.0.2 根发布物仍导出的 24 个 internal 类型。它们解释公开 Store、订阅、Setup Store 推断、map helpers 与 storeToRefs 的声明如何组装，但 sourceTag 始终是 internal，不属于 41 个稳定 Reference 项。',
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'sourceTag: internal。应用代码不要 import 下列名称；发布物可导出不等于兼容性承诺。应优先使用每项列出的公开类型、helper 或具体 Store 推断结果。',
    },
    ...internalTypeBlocks,
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 internal 导出当成稳定应用契约',
          description: '根声明文件导出了 internal 名称，但注释仍明确标为 internal only。',
          consequence: 'Pinia 升级可改变条件类型结构，应用公共类型随之破坏。',
          wrong: {
            lang: 'ts',
            content: `type AppStore = _StoreWithState<'app', State, {}, {}>`,
          },
          correct: { lang: 'ts', content: 'type AppStore = ReturnType<typeof useAppStore>' },
        },
        {
          title: '手写 map helper 返回类型',
          description: 'helper overload 已负责键重命名、getter 与 setter 的精确推断。',
          consequence: 'suffix、writable getter 或 object mapper 变化时本地类型立即漂移。',
          wrong: { lang: 'ts', content: 'type CountMap = _MapStateReturn<State, Getters>' },
          correct: { lang: 'ts', content: "const countMap = mapState(useCounterStore, ['count'])" },
        },
        {
          title: '订阅只依赖 internal base',
          description: 'base 没有三种公开 mutation 分支的精确 type 与 payload 差异。',
          consequence: 'patch object payload 与不同 events 形态无法正确收窄。',
          wrong: {
            lang: 'ts',
            content: 'function inspect(mutation: _SubscriptionCallbackMutationBase) {}',
          },
          correct: {
            lang: 'ts',
            content: 'function inspect(mutation: SubscriptionCallbackMutation<State>) {}',
          },
        },
        {
          title: '复制 Setup Store 提取条件',
          description: 'state、getters 与 actions 的分组规则属于 defineStore 的类型实现。',
          consequence: 'ComputedRef、方法或未来返回形态变化时，复制类型与运行时 Store 不一致。',
          wrong: { lang: 'ts', content: 'type State = _ExtractStateFromSetupStore<SetupReturn>' },
          correct: { lang: 'ts', content: 'type State = StoreState<ReturnType<typeof useStore>>' },
        },
        {
          title: '把 internal 类型数量加入稳定完成度',
          description: '24 项属于独立 watchlist，不能进入公开 41 项 Overview。',
          consequence: '覆盖率分母从 41 被错误扩大，稳定与 restricted 边界失真。',
          wrong: { lang: 'text', content: '稳定 Reference：41 + 24 = 65' },
          correct: {
            lang: 'text',
            content: '稳定 Reference：41 / 41；restricted：26 / 26 documented',
          },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. 发布物导出与稳定性是两条轴',
          content:
            '`dist/pinia.d.ts` 的 export clause 证明 24 个名称可从根入口解析；各声明的 internal 注释决定本站仍把它们留在 restricted watchlist。',
        },
        {
          title: '2. Store 公共类型由多个 internal 片段组装',
          content:
            '`Store` 交叉组合 state、getters 与 actions 内部片段。应用应依赖最终公开 Store 或具体 useStore 返回类型，而不是任一中间片段。',
        },
        {
          title: '3. Setup Store 提取属于 defineStore 推断链',
          content:
            '三组 keys 与三组 Pick 类型把 Setup 返回对象分为 state、computed getters 与 methods，再交给 SetupStoreDefinition；公开 StoreState、StoreGetters、StoreActions 已提供消费侧出口。',
        },
        {
          title: '4. Map helper internal 类型只服务 overload 返回值',
          content:
            '`mapStores()`、`mapState()`、`mapActions()` 与 `mapWritableState()` 的公开函数签名暴露输入和推断结果；内部映射类型会随 overload 实现演进，不需要成为应用显式注解。',
        },
        {
          title: '5. storeToRefs 隐藏 ref 展开细节',
          content:
            '`_UnwrapAll` 只参与 storeToRefs 的内部 state 识别。应用调用 `storeToRefs()`，不要从 Pinia 根入口显式导入 `StoreToRefs`。',
        },
      ],
    },
  ],
  notes: [
    '本页 24 项均为 sourceTag: internal，不进入稳定 41 项 Reference Overview。',
    '连同 piniaSymbol 与 deprecated mapGetters，restricted coverage 为 26 / 26 documented。',
    '升级 Pinia 后必须重新核对根 export clause、internal 注释和公开替代。',
  ],
})
