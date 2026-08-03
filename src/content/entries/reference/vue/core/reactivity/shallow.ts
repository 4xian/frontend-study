/**
 * 知识点：shallowRef() / shallowReactive()
 * 查证来源（2026-07-26）：
 * - https://vuejs.org/api/reactivity-advanced（shallowRef/shallowReactive/triggerRef 签名与行为示例）
 * - https://vuejs.org/guide/best-practices/performance（Reduce Reactivity Overhead：大型不可变结构场景）
 * - https://vuejs.org/guide/extras/reactivity-in-depth（外部状态管理集成、useImmer 组合式示例）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts 与 baseHandlers.ts（shallow 分支最小源码实现，2026-07-27）
 * 查证工具：context7（/websites/vuejs_api、/websites/vuejs_guide）、GitHub vuejs/core v3.5.40 源码
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.reactivity.shallow',
  type: 'reference',
  title: 'shallowRef() / shallowReactive()',
  summary:
    '深层响应式的浅层版本：shallowRef 只追踪 .value 本身的访问与替换，shallowReactive 只让根级属性响应式，内部值原样存储不做深层转换',
  ecosystem: 'vue',
  module: 'core',
  collection: 'reactivity',
  related: [
    'vue.core.reference.reactivity.ref',
    'vue.core.reference.reactivity.reactive',
    'vue.core.reference.reactivity.readonly',
  ],
  tags: ['shallowRef', 'shallowReactive', 'triggerRef', 'reactivity'],
  sources: [
    { title: 'Vue 响应式 API：进阶', url: 'https://vuejs.org/api/reactivity-advanced.html' },
    { title: 'Vue 性能最佳实践', url: 'https://vuejs.org/guide/best-practices/performance.html' },
    { title: 'Vue 深入响应式系统', url: 'https://vuejs.org/guide/extras/reactivity-in-depth.html' },
    {
      title: 'Vue 3.5.40 ref.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts',
    },
    {
      title: 'Vue 3.5.40 baseHandlers.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: [
    'shallowRef()',
    'shallowReactive()',
    'triggerRef()',
    '适用场景',
    '浅层响应',
    '易错使用提示',
  ],
})

export default defineReference({
  meta,
  signature:
    'function shallowRef<T>(value: T): ShallowRef<T>\nfunction shallowReactive<T extends object>(target: T): T',
  blocks: [
    { type: 'heading', content: '概述' },
    {
      type: 'text',
      content:
        '`ref()` 和 `reactive()` 默认是深层响应式：对象无论嵌套多深都会被转换、追踪。浅层 API 是它们的"只到第一层"版本——`shallowRef()` 的内部值原样存储（stored as-is），只有 `.value` 属性本身的访问是响应式的；`shallowReactive()` 只让根级属性响应式，嵌套对象不会被转换，属性值中的 ref 也不会自动解包。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `function shallowRef<T>(value: T): ShallowRef<T>

function shallowReactive<T extends object>(target: T): T`,
    },
    { type: 'heading', content: 'shallowRef() 用法' },
    {
      type: 'text',
      content:
        '只有对 `.value` 的整体替换会触发更新；深层修改内部对象的属性时，值确实变了，但不会通知任何依赖它的副作用。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { shallowRef } from 'vue'

const state = shallowRef({ count: 1 })

// 不会触发更新
state.value.count = 2

// 会触发更新
state.value = { count: 2 }`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.reactivity.shallow.shallow-ref-demo',
      description: '深层修改不触发更新 vs 替换 .value 触发更新的现场对照，含 triggerRef 强制触发',
      playground: true,
    },
    { type: 'heading', content: 'shallowReactive() 用法' },
    {
      type: 'text',
      content:
        '与 `reactive()` 不同，`shallowReactive()` 没有深层转换：只有根级属性是响应式的。属性值原样存储——嵌套对象不是响应式代理（`isReactive` 返回 false），属性中的 ref 不会自动解包，访问仍需 `.value`。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { isReactive, shallowReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 },
})

// 修改根级属性：响应式
state.foo++

// 嵌套对象没有被转换
isReactive(state.nested) // false

// 非响应式：改了但不触发更新
state.nested.bar++`,
    },
    {
      type: 'demo',
      id: 'vue.core.reference.reactivity.shallow.shallow-reactive-demo',
      description: '根级属性修改触发更新，嵌套属性修改不触发；用 isReactive 验证嵌套对象未被转换',
      playground: true,
    },
    { type: 'heading', content: 'triggerRef()：强制触发' },
    {
      type: 'text',
      content:
        '`triggerRef()` 强制触发依赖于一个浅层 ref 的副作用。典型用法：对 shallowRef 的内部值做了深层变更之后，手动通知一次，让 watchEffect、模板等副作用重新执行。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `import { shallowRef, triggerRef, watchEffect } from 'vue'

const shallow = shallowRef({ greet: 'Hello, world' })

// 首次运行时打印 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 浅层 ref，深层变更不会触发副作用
shallow.value.greet = 'Hello, universe'

// 打印 "Hello, universe"
triggerRef(shallow)`,
    },
    { type: 'heading', content: '适用场景' },
    {
      type: 'text',
      content:
        '深层响应式对大型嵌套结构有代价：每次属性访问都伴随依赖追踪。浅层 API 是官方给出的性能逃生舱，典型场景有两类：1）大型不可变结构（如巨大的列表）——用 `shallowRef` 持有，把嵌套数据当作不可变的，更新时整体替换根值（`state.value = [...state.value, newItem]`）；2）与外部状态管理集成（如 Immer、RxJS）——外部库管理数据本身，Vue 只在 `.value` 被替换时感知变化，内部值保持原样不被代理。',
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '官方 Immer 集成范例就是这个思路：useImmer 用 shallowRef 持有状态，更新时以 produce 产出的新不可变对象整体替换 .value，兼得不可变数据的结构共享与 Vue 的响应式通知。',
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '源码里浅层 API 与深层 API 共用同一套实现，只差一个 `shallow` 布尔开关。`ref()` 与 `shallowRef()` 都返回 `RefImpl`，构造时 `shallow` 为 true 就跳过 `toReactive()` 转换、原样存储内部值；`shallowReactive()` 与 `reactive()` 共用同一个 Proxy handler 类，get 拦截在 `isShallow` 时提前返回结果，跳过"嵌套对象惰性递归转换"与"ref 解包"两步。`triggerRef()` 则是直接调用 ref 的 `dep.trigger()`，绕过值比较强制通知。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 packages/reactivity/src/ref.ts、baseHandlers.ts
// ref 与 shallowRef 共用 RefImpl，只差 shallow 开关
function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) return rawValue
  return new RefImpl(rawValue, shallow)
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

export function shallowRef(value?: unknown) {
  return createRef(value, true)
}

class RefImpl<T> {
  constructor(value: T, isShallow: boolean) {
    this._rawValue = isShallow ? value : toRaw(value)
    // 关键差异：shallow 时原样存储，不做 toReactive 深层转换
    this._value = isShallow ? value : toReactive(value)
  }
  // get/set 逻辑与 ref 完全相同：track / hasChanged + trigger
}

// triggerRef：绕过 hasChanged 比较，直接通知订阅者
export function triggerRef(ref: Ref) {
  ref.dep.trigger()
}

// shallowReactive 与 reactive 共用 handler，get 拦截提前返回
class BaseReactiveHandler {
  constructor(protected readonly _isShallow: boolean) {}

  get(target: object, key: string, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    track(target, key) // 根级属性依然追踪

    if (this._isShallow) {
      return res // 关键差异：到此为止——不解包 ref、不递归转换嵌套对象
    }

    if (isRef(res)) return res.value
    if (isObject(res)) return reactive(res)
    return res
  }
}`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '这解释了浅层 API 的性能来源：省掉的不是"追踪"本身（根级访问照常 track），而是嵌套对象的 Proxy 创建与嵌套属性访问时的逐层拦截开销。',
    },
    { type: 'heading', content: '与深层 API 对比' },
    {
      type: 'table',
      headers: ['特性', 'ref() / reactive()', 'shallowRef() / shallowReactive()'],
      rows: [
        ['转换深度', '深层：嵌套对象全部转为响应式代理', '仅根级：内部值 / 嵌套对象原样存储'],
        ['触发更新', '任意深度的属性修改都触发', '仅 .value 替换 / 根级属性修改触发'],
        ['ref 自动解包', 'reactive 属性中的 ref 自动解包', 'shallowReactive 属性中的 ref 不解包'],
        ['性能开销', '每层属性访问都伴随依赖追踪', '嵌套属性访问无追踪开销'],
        ['典型用途', '常规组件状态', '大型不可变结构、外部状态管理集成'],
      ],
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '深改 `shallowRef` 内部对象后等待自动更新',
          description:
            '把 shallowRef 当成“性能更好的普通 ref”。它只追踪 `.value` 的访问和替换，内部对象按原样保存，不做深层响应式转换。',
          consequence:
            '`state.value.count++` 已修改原始对象，但模板、computed 和 watcher 不会因此重跑。',
          wrong: {
            lang: 'ts',
            content: 'const state = shallowRef({ count: 0 })\nstate.value.count++',
          },
          correct: {
            lang: 'ts',
            content:
              'const state = shallowRef({ count: 0 })\nstate.value = { ...state.value, count: state.value.count + 1 }',
          },
        },
        {
          title: '把 `shallowReactive()` 当成深层响应式对象',
          description:
            'shallowReactive 仅使根级属性响应式；嵌套对象保持原样，根级 ref 属性也不会像深层 reactive 那样自动解包。',
          consequence:
            '修改 `state.nested.count` 不触发更新；把 `state.someRef` 当数字使用时实际拿到 ref 对象。',
          wrong: {
            lang: 'ts',
            content:
              'const state = shallowReactive({ nested: { count: 0 } })\nstate.nested.count++',
          },
          correct: {
            lang: 'ts',
            content:
              'const state = shallowReactive({ nested: { count: 0 } })\nstate.nested = { ...state.nested, count: state.nested.count + 1 }',
          },
        },
        {
          title: '把浅层代理嵌进深层响应式树',
          description:
            '误以为外层 `reactive()` 会补齐内部 shallowReactive 的深层转换。官方明确不建议把浅层结构嵌套在深层响应式对象中，因为它会制造不一致的响应语义。',
          consequence:
            '同一状态树中，一部分深改会触发、一部分不会触发；维护者很难从访问路径判断更新行为。',
          wrong: {
            lang: 'ts',
            content:
              'const child = shallowReactive({ nested: { count: 0 } })\nconst state = reactive({ child })',
          },
          correct: {
            lang: 'ts',
            content:
              '// shallow 状态保持为清晰的根级边界\nconst childState = shallowReactive({ nested: { count: 0 } })\n\n// 如果必须成为深层树的一部分，就统一使用 reactive\nconst state = reactive({ child: { nested: { count: 0 } } })',
          },
        },
      ],
    },
  ],
})
