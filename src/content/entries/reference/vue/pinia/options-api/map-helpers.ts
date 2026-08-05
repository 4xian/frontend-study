/**
 * Pinia 参考：Options API 映射 helper、suffix 与迁移边界。
 * 结论固定到 pinia@4.0.2 与 commit ae4e3b2。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

const fixedSourceBase =
  'https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia'

export const meta = defineReferenceMeta({
  id: 'vue.pinia.reference.options-api.map-helpers',
  type: 'reference',
  title: 'Options API 映射 Helpers',
  summary: '查询 mapStores、state/action 映射、可写 setter、suffix 与迁移边界',
  ecosystem: 'vue',
  module: 'pinia',
  collection: 'options-api',
  related: [
    'vue.pinia.reference.core.pinia-instance',
    'vue.pinia.reference.stores.define-store',
    'vue.pinia.reference.stores.store-shape',
    'vue.pinia.reference.stores.store-to-refs',
    'vue.pinia.learn.basics.setup-first-store',
  ],
  tags: [
    'Pinia',
    'Options API',
    'mapState',
    'mapWritableState',
    'mapActions',
    'mapStores',
    'mapGetters',
  ],
  sources: [
    {
      title: 'Pinia API：MapStoresCustomization',
      url: 'https://pinia.vuejs.org/api/pinia/interfaces/MapStoresCustomization.html',
    },
    {
      title: 'Pinia API：mapActions',
      url: 'https://pinia.vuejs.org/api/pinia/functions/mapActions.html',
    },
    {
      title: 'Pinia API：mapState',
      url: 'https://pinia.vuejs.org/api/pinia/functions/mapState.html',
    },
    {
      title: 'Pinia API：mapStores',
      url: 'https://pinia.vuejs.org/api/pinia/functions/mapStores.html',
    },
    {
      title: 'Pinia API：mapWritableState',
      url: 'https://pinia.vuejs.org/api/pinia/functions/mapWritableState.html',
    },
    {
      title: 'Pinia API：setMapStoreSuffix',
      url: 'https://pinia.vuejs.org/api/pinia/functions/setMapStoreSuffix.html',
    },
    {
      title: 'Pinia API：mapGetters（deprecated）',
      url: 'https://pinia.vuejs.org/api/pinia/variables/mapGetters.html',
    },
    {
      title: 'Pinia Guide：Usage without setup()',
      url: 'https://pinia.vuejs.org/cookbook/options-api.html',
    },
    {
      title: 'Pinia Guide：State Usage with the Options API',
      url: 'https://pinia.vuejs.org/core-concepts/state.html#usage-with-the-options-api',
    },
    {
      title: 'Pinia 4.0.2：mapHelpers.ts 固定源码',
      url: fixedSourceBase + '/src/mapHelpers.ts',
    },
    {
      title: 'Pinia 4.0.2：types.ts 固定源码',
      url: fixedSourceBase + '/src/types.ts',
    },
    {
      title: 'Pinia 4.0.2：mapHelpers 官方测试',
      url: fixedSourceBase + '/__tests__/mapHelpers.spec.ts',
    },
  ],
  appliesTo: 'Pinia 4.0.2',
  verifiedAt: '2026-08-05',
  anchors: [
    '概述',
    'Map State',
    'Map Writable State',
    'Map Actions',
    'Map Stores',
    'Set Map Store Suffix',
    'Map Stores Customization',
    'Options API 形状与 Mapper',
    'Deprecated Map Getters',
    '全局 Suffix 与类型同步',
    'Evidence 边界',
    '易错使用提示',
    '源码推导与适用场景',
  ],
})

export default defineReference({
  meta,
  signature: [
    'interface MapStoresCustomization {}',
    '',
    'declare function mapState<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G extends _GettersTree<S> | Record<string, ComputedRef>,',
    '  A,',
    '  KeyMapper extends Record<',
    '    string,',
    '    keyof S | keyof G | ((store: Store<Id, S, G, A>) => any)',
    '  >,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):',
    '  _MapStateObjectReturn<Id, S, G, A, KeyMapper>',
    '',
    'declare function mapState<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G extends _GettersTree<S> | Record<string, ComputedRef>,',
    '  A,',
    '  Keys extends keyof S | keyof G,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keys: readonly Keys[]):',
    '  _MapStateReturn<S, G, Keys>',
    '',
    'declare function mapWritableState<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G,',
    '  A,',
    '  KeyMapper extends Record<string, _MapWritableStateKeys<S, G>>,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):',
    '  _MapWritableStateObjectReturn<S, G, KeyMapper>',
    '',
    'declare function mapWritableState<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G,',
    '  A,',
    '  Keys extends _MapWritableStateKeys<S, G>,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keys: readonly Keys[]):',
    '  Pick<_MapWritableStateReturn<S, G, Keys>, Keys>',
    '',
    'declare function mapActions<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G extends _GettersTree<S>,',
    '  A,',
    '  KeyMapper extends Record<string, keyof A>,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keyMapper: KeyMapper):',
    '  _MapActionsObjectReturn<A, KeyMapper>',
    '',
    'declare function mapActions<',
    '  Id extends string,',
    '  S extends StateTree,',
    '  G extends _GettersTree<S>,',
    '  A,',
    '>(useStore: StoreDefinition<Id, S, G, A>, keys: Array<keyof A>):',
    '  _MapActionsReturn<A>',
    '',
    'declare function mapStores<Stores extends any[]>(',
    '  ...stores: [...Stores]',
    '): _Spread<Stores>',
    '',
    'declare function setMapStoreSuffix(',
    "  suffix: MapStoresCustomization extends Record<'suffix', infer Suffix>",
    '    ? Suffix',
    '    : string,',
    '): void',
    '',
    '/** @deprecated use mapState() instead. */',
    'declare const mapGetters: typeof mapState',
  ].join('\n'),
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '这些 helper 把 Pinia StoreDefinition 转成 Options API 的 computed 或 methods 选项。generated function 执行时都通过 useStore(this.$pinia) 取得当前组件所属 Pinia，而不是捕获某个全局 active singleton。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '下划线 return 与 constraint 类型只还原发布声明，不是推荐 import。应用通常只导入 mapState、mapWritableState、mapActions、mapStores 与 setMapStoreSuffix。',
    },
    { type: 'heading', content: 'Map State' },
    {
      type: 'text',
      content:
        'mapState() 返回可 spread 到 computed 的 getter object。array 形状映射 state 或 getter 并保留 key；object 形状可以改名，也可用 function mapper 从整个 Store 计算组件值。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: [
        'computed: {',
        "  ...mapState(useAccountStore, ['name', 'displayName']),",
        '  ...mapState(useAccountStore, {',
        "    accountName: 'name',",
        '    greeting(store) {',
        '      return this.prefix + store.displayName',
        '    },',
        '  }),',
        '}',
      ].join('\n'),
    },
    {
      type: 'text',
      content:
        'function mapper 通过 mapper.call(this, store) 执行。TypeScript 不会自动推导其中的组件 this；需要组件字段时使用普通 method shorthand，不要使用 arrow function 期待 this。',
    },
    { type: 'heading', content: 'Map Writable State' },
    {
      type: 'text',
      content:
        'mapWritableState() 返回带 get 与 setter 的 computed descriptors，放在 computed。setter 直接赋值到 Store property，不代理 action，也不自动提供 validation、transaction 或业务事件。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: [
        'computed: {',
        "  ...mapWritableState(useProfileStore, ['name']),",
        "  ...mapWritableState(useProfileStore, { formName: 'name' }),",
        '}',
      ].join('\n'),
    },
    {
      type: 'text',
      content:
        'readonly getter 不可写；state 与具有 setter 的 writable computed 才能映射。固定官方测试同时覆盖 array、object alias 和 Setup Store writable computed。',
    },
    { type: 'heading', content: 'Map Actions' },
    {
      type: 'text',
      content:
        'mapActions() 返回可 spread 到 methods 的 method wrappers。array 直接保留 action 名；object 只建立组件方法名到 action 名的映射，并透传 arguments 与 return value，不接受 mapState 那种自定义 function mapper。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: [
        'methods: {',
        "  ...mapActions(useCartStore, ['checkout']),",
        "  ...mapActions(useCartStore, { submitOrder: 'checkout' }),",
        '}',
      ].join('\n'),
    },
    { type: 'heading', content: 'Map Stores' },
    {
      type: 'text',
      content:
        'mapStores(useUserStore, useCartStore) 使用 rest Store definitions，并默认生成 userStore 与 cartStore computed getter。每个 getter 执行时调用 useStore(this.$pinia)，因此组件必须由 app.use(pinia) 获得 $pinia。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: ['computed: {', '  ...mapStores(useUserStore, useCartStore),', '}'].join('\n'),
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        '不要把 [useUserStore, useCartStore] 作为唯一参数。固定开发构建会对 array fallback 发出诊断 warning，官方形状是逐个传入。',
    },
    { type: 'heading', content: 'Set Map Store Suffix' },
    {
      type: 'text',
      content:
        'setMapStoreSuffix(suffix) 修改 mapHelpers 模块级 suffix，默认值是 Store，也允许空字符串。它只影响后续 mapStores() 调用；已经生成的 mapping object key 在 helper 调用时已经冻结，不会被重命名。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: [
        "setMapStoreSuffix('_store')",
        '',
        'const stores = mapStores(useUserStore)',
        '// stores.user_store',
      ].join('\n'),
    },
    { type: 'heading', content: 'Map Stores Customization' },
    {
      type: 'text',
      content:
        'MapStoresCustomization 是用于 declaration merging 的空 interface。它只影响 mapStores 返回 key 的类型推导，runtime 不读取 augmentation；mapStoreSuffix 与 _Spread 等内部 helper 不进入稳定索引。',
    },
    { type: 'heading', content: 'Options API 形状与 Mapper' },
    {
      type: 'table',
      headers: ['helper', 'Options API 位置', 'mapper 形状', '执行上下文'],
      rows: [
        ['mapState', 'computed', 'array / object / function', 'useStore(this.$pinia)'],
        ['mapWritableState', 'computed', 'array / object', 'get 与直接赋值 setter'],
        ['mapActions', 'methods', 'array / object alias', '透传 arguments 与 return value'],
        ['mapStores', 'computed', 'rest definitions', '按 Store id 与 suffix 生成 key'],
      ],
    },
    {
      type: 'text',
      content:
        '这些函数服务 Options API 形状：state/getter 属于 computed，action 属于 methods，整个 Store 也以 computed getter 暴露。它们不会把组件局部逻辑复制进 Store，也不会改变 StoreDefinition。',
    },
    { type: 'heading', content: 'Deprecated Map Getters' },
    {
      type: 'tip',
      style: 'warning',
      content:
        'mapGetters 是 mapState 的同一 runtime value alias，官方 API 与 Guide 已标记 deprecated。保留相同参数，把 import 与调用名替换为 mapState()；该 warning 属于 restricted 账本，不进入 41 项 stable Overview。',
    },
    {
      type: 'compare',
      labels: ['deprecated', 'replacement'],
      before:
        "import { mapGetters } from 'pinia'\ncomputed: { ...mapGetters(useStore, ['total']) }",
      after: "import { mapState } from 'pinia'\ncomputed: { ...mapState(useStore, ['total']) }",
    },
    { type: 'heading', content: '全局 Suffix 与类型同步' },
    {
      type: 'code',
      lang: 'ts',
      content: [
        "import 'pinia'",
        '',
        "declare module 'pinia' {",
        '  export interface MapStoresCustomization {',
        "    suffix: '_store'",
        '  }',
        '}',
        '',
        "setMapStoreSuffix('_store')",
      ].join('\n'),
    },
    {
      type: 'text',
      content:
        'augmentation 与 runtime setMapStoreSuffix() 必须使用同一个 literal。global .d.ts 先 import pinia，避免覆盖模块声明。suffix 是同一 mapHelpers 模块内所有 app 共用的全局启动配置，不是 per-component 或 per-request state。',
    },
    { type: 'heading', content: 'Evidence 边界' },
    {
      type: 'text',
      content:
        '固定 mapHelpers.ts 与官方测试支撑 array/object/function mapper、this.$pinia、setter、suffix 与 deprecated alias 的上游事实。本站 focused seam 只证明 Reference catalog、正文与 anchors。',
    },
    {
      type: 'text',
      content:
        '本页没有运行真实 Options API SFC、suffix isolation 或浏览器交互，也没有证明不同 app 拥有独立 suffix；这些 runtime 证据均为 Deferred/not-run。',
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '把 helper 放错 Options 区域',
          description: 'state/getter 是 computed，action 是 methods。',
          consequence: '组件选项类型与调用语义错误。',
          wrong: {
            lang: 'ts',
            content: "methods: { ...mapState(useStore, ['name']) }",
          },
          correct: {
            lang: 'ts',
            content:
              "computed: { ...mapState(useStore, ['name']) }\nmethods: { ...mapActions(useStore, ['save']) }",
          },
        },
        {
          title: '把 Store definitions 包成 array',
          description: 'mapStores 使用 rest definitions。',
          consequence: '开发环境出现 warning，依赖不稳定 fallback。',
          wrong: { lang: 'ts', content: 'mapStores([useUserStore, useCartStore])' },
          correct: { lang: 'ts', content: 'mapStores(useUserStore, useCartStore)' },
        },
        {
          title: '在 function mapper 中用 arrow 读取 this',
          description: 'arrow 不接收 mapper.call 提供的组件上下文。',
          consequence: 'this 不指向当前 Options API 组件。',
          wrong: { lang: 'ts', content: 'label: (store) => this.prefix + store.name' },
          correct: {
            lang: 'ts',
            content: 'label(store) {\n  return this.prefix + store.name\n}',
          },
        },
        {
          title: '把 mapActions object 当 function mapper',
          description: 'object value 只能是 action key。',
          consequence: '函数被误当作 Store action 名。',
          wrong: { lang: 'ts', content: 'mapActions(useStore, { save: (store) => store.save() })' },
          correct: { lang: 'ts', content: "mapActions(useStore, { saveForm: 'save' })" },
        },
        {
          title: '映射 readonly getter 为可写值',
          description: 'readonly getter 没有 setter。',
          consequence: '产生类型错误或不可写行为。',
          wrong: { lang: 'ts', content: "mapWritableState(useStore, ['total'])" },
          correct: { lang: 'ts', content: "mapWritableState(useStore, ['draftName'])" },
        },
        {
          title: '把 writable setter 当作 action',
          description: 'setter 直接给 Store property 赋值。',
          consequence: '绕过业务 validation 与 transaction。',
          wrong: { lang: 'ts', content: 'this.draftName = uncheckedValue' },
          correct: { lang: 'ts', content: 'this.updateDraftName(validatedValue)' },
        },
        {
          title: '期待 suffix 追溯重命名',
          description: 'mapping key 在 mapStores() 调用时生成。',
          consequence: '已有 userStore key 保持旧名称。',
          wrong: {
            lang: 'ts',
            content: "const mapped = mapStores(useUserStore)\nsetMapStoreSuffix('_store')",
          },
          correct: {
            lang: 'ts',
            content: "setMapStoreSuffix('_store')\nconst mapped = mapStores(useUserStore)",
          },
        },
        {
          title: '只同步 suffix 的类型或 runtime',
          description: 'declaration merging 与模块变量相互独立。',
          consequence: 'TypeScript key 与运行时 key 分叉。',
          wrong: { lang: 'ts', content: "interface MapStoresCustomization { suffix: '_store' }" },
          correct: {
            lang: 'ts',
            content:
              "interface MapStoresCustomization { suffix: '_store' }\nsetMapStoreSuffix('_store')",
          },
        },
        {
          title: '动态切换模块级 suffix',
          description: '同一 mapHelpers 模块内所有 app 共用该值。',
          consequence: 'mapping key 随调用顺序变化。',
          wrong: { lang: 'ts', content: 'setMapStoreSuffix(currentComponentSuffix)' },
          correct: { lang: 'ts', content: '// 应用 bootstrap 中只设置一次 suffix' },
        },
        {
          title: '继续推荐 mapGetters',
          description: '它是 deprecated 的 mapState alias。',
          consequence: '新代码继续依赖 restricted surface。',
          wrong: { lang: 'ts', content: "import { mapGetters } from 'pinia'" },
          correct: { lang: 'ts', content: "import { mapState } from 'pinia'" },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [
        {
          title: '1. State 映射属于 computed',
          content:
            'mapState 的 array 与 object 分支都返回 getter function，并调用 useStore(this.$pinia)；适用于 Options API 读取 state 与 getter。',
        },
        {
          title: '2. Function mapper 保留组件上下文',
          content:
            '源码以 call(this, store) 执行 mapper；适用于结合 Store 与组件局部字段计算展示值。',
        },
        {
          title: '3. Action 映射属于 methods',
          content:
            'mapActions wrapper 透传参数与返回值，object 只做别名；适用于组件 methods 过渡层。',
        },
        {
          title: '4. Writable 映射是直接 setter',
          content:
            'mapWritableState 生成 get 与 set，固定测试还覆盖 Setup writable computed；适用于简单表单双向绑定。',
        },
        {
          title: '5. Stores 使用 rest definitions',
          content:
            'mapStores 立即按 Store id 与 suffix 生成 getter key，并通过 this.$pinia 取实例；适用于访问整个 Store surface。',
        },
        {
          title: '6. Suffix 是模块级配置',
          content:
            'setMapStoreSuffix() 直接修改模块变量，只影响后续 helper 调用；适用于应用 bootstrap 的单点配置。',
        },
        {
          title: '7. 类型 suffix 不改变 runtime',
          content:
            'MapStoresCustomization 只参与 conditional type，runtime 不读取声明；适用于维护 global.d.ts 与启动代码的一致 literal。',
        },
        {
          title: '8. mapGetters 是名称迁移',
          content:
            '固定源码令 mapGetters 与 mapState identity 相同，官方页面标记 deprecated；适用于无行为变化地迁移旧 Options API。',
        },
      ],
    },
  ],
  notes: [
    'restricted mapGetters 只在本页给出迁移 warning，不进入 stable Overview。',
    '真实 Options API SFC、suffix isolation 与浏览器 runtime 均保持 Deferred/not-run。',
  ],
})
