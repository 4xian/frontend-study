/**
 * 知识点：响应式工具函数合集（unref / toValue / isRef / isReactive / isReadonly / isProxy / toRaw / markRaw）
 * 查证来源（2026-07-26）：
 * - https://vuejs.org/api/reactivity-utilities（isRef、unref、toValue、isProxy、isReactive、isReadonly 签名与判定范围）
 * - https://vuejs.org/api/reactivity-advanced（toRaw、markRaw 签名、逃生舱警告与嵌套 identity hazard）
 * - https://vuejs.org/api/utility-types（MaybeRef / MaybeRefOrGetter，3.3+）
 * - https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts 与 ref.ts（工具函数最小源码实现，2026-07-27）
 * 查证工具：context7（/websites/vuejs_api）+ tavily-extract 提取整页对照；
 * isReactive 对 readonly(reactive(x)) 返回 true、isProxy(ref(0)) 返回 false 等边界经本地 Vue 3 运行实测确认。
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'vue.core.reference.reactivity.utils',
  type: 'reference',
  title: '响应式工具函数',
  summary:
    'unref、toValue、isRef、isReactive、isReadonly、isProxy、toRaw、markRaw 八个工具函数的紧凑速查',
  ecosystem: 'vue',
  module: 'core',
  collection: 'reactivity',
  related: [
    'vue.core.reference.reactivity.ref',
    'vue.core.reference.reactivity.reactive',
    'vue.core.reference.reactivity.readonly',
    'vue.core.reference.reactivity.to-ref',
  ],
  tags: ['unref', 'toValue', 'isRef', 'isReactive', 'isReadonly', 'isProxy', 'toRaw', 'markRaw'],
  sources: [
    { title: 'Vue 响应式 API：工具', url: 'https://vuejs.org/api/reactivity-utilities.html' },
    { title: 'Vue 响应式 API：进阶', url: 'https://vuejs.org/api/reactivity-advanced.html' },
    { title: 'Vue 工具类型', url: 'https://vuejs.org/api/utility-types.html' },
    {
      title: 'Vue 3.5.40 reactive.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts',
    },
    {
      title: 'Vue 3.5.40 ref.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-28',
  anchors: [
    'unref()',
    'toValue()',
    'isRef()',
    'isReactive()',
    'isReadonly()',
    'isProxy()',
    'toRaw()',
    'markRaw()',
    '易错使用提示',
  ],
})

export default defineReference({
  meta,
  signature: `function unref<T>(ref: T | Ref<T>): T
function toValue<T>(source: T | Ref<T> | (() => T)): T
function isRef<T>(value: Ref<T> | unknown): value is Ref<T>
function isReactive(value: unknown): boolean
function isReadonly(value: unknown): boolean
function isProxy(value: unknown): boolean
function toRaw<T>(proxy: T): T
function markRaw<T extends object>(value: T): Raw<T>`,
  blocks: [
    { type: 'heading', content: '总览' },
    {
      type: 'text',
      content:
        '本页汇总 8 个响应式工具函数：两个取值工具（`unref`、`toValue`）、四个判断工具（`isRef`、`isReactive`、`isReadonly`、`isProxy`）和两个进阶逃生舱（`toRaw`、`markRaw`）。它们不创建响应式状态，只围绕已有的 ref 与代理做取值、判断和转换。',
    },
    {
      type: 'table',
      headers: ['API', '作用', '返回值'],
      rows: [
        ['unref(val)', '是 ref 则取 .value，否则原样返回', '内部值'],
        ['toValue(src)', '值 / ref / getter 统一取值（3.3+）', '最终值'],
        ['isRef(r)', '是否为 ref 对象', 'boolean（类型守卫）'],
        ['isReactive(v)', '是否为 reactive() / shallowReactive() 代理', 'boolean'],
        ['isReadonly(v)', '是否为只读对象（含无 set 的 computed）', 'boolean'],
        ['isProxy(v)', '是否为 reactive / readonly 及其 shallow 变体代理', 'boolean'],
        ['toRaw(proxy)', '取回代理背后的原始对象', '原始对象'],
        ['markRaw(obj)', '标记对象永不被转为代理', '对象本身'],
      ],
    },
    { type: 'heading', content: 'unref()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function unref<T>(ref: T | Ref<T>): T`,
    },
    {
      type: 'text',
      content:
        '如果参数是 ref，返回其内部值；否则原样返回参数本身。它是 `val = isRef(val) ? val.value : val` 的语法糖，常用于 composable 中统一处理"可能是 ref 也可能是普通值"的参数（即 `MaybeRef<T>` 类型）。',
    },
    { type: 'heading', content: 'toValue()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function toValue<T>(source: T | Ref<T> | (() => T)): T`,
    },
    {
      type: 'text',
      content:
        '3.3+ 新增。将值 / ref / getter 规范化为值，与 `unref()` 类似，区别是额外支持 getter：参数是函数时会调用它并返回其返回值。配合 `MaybeRefOrGetter<T>` 类型，是 composable 参数归一化的推荐写法。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `toValue(1)        // 1
toValue(ref(1))   // 1
toValue(() => 1)  // 1`,
    },
    { type: 'heading', content: 'isRef()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function isRef<T>(r: Ref<T> | unknown): r is Ref<T>`,
    },
    {
      type: 'text',
      content:
        '检查值是否为 ref 对象。返回类型是类型谓词（type predicate），因此可以直接当 TypeScript 类型守卫用：`if (isRef(foo))` 分支内 `foo` 会被收窄为 `Ref` 类型，可安全访问 `.value`。',
    },
    { type: 'heading', content: 'isReactive()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function isReactive(value: unknown): boolean`,
    },
    {
      type: 'text',
      content:
        '检查对象是否为 `reactive()` 或 `shallowReactive()` 创建的代理。注意一个隐藏行为：如果 `readonly()` 包裹的是一个 reactive 代理，`isReactive` 对这个只读代理同样返回 `true`（见下方 demo 第 5 项）。',
    },
    { type: 'heading', content: 'isReadonly()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function isReadonly(value: unknown): boolean`,
    },
    {
      type: 'text',
      content:
        '检查值是否为只读对象。`readonly()` 与 `shallowReadonly()` 创建的代理都算，没有 `set` 函数的 `computed()` ref 也算。只读对象的属性值可以变化（源数据变了它会跟着变），只是不能通过这个对象直接赋值。',
    },
    { type: 'heading', content: 'isProxy()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function isProxy(value: any): boolean`,
    },
    {
      type: 'text',
      content:
        '检查对象是否为 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理，即前两个判断的并集。注意 ref 不在此列：`isProxy(ref(0))` 为 `false`，判断 ref 只能用 `isRef`。',
    },
    {
      type: 'demo',
      id: 'vue.core.reference.reactivity.utils.reactivity-utils',
      description:
        '预置七种值，逐一查看 isRef / isReactive / isReadonly / isProxy / toRaw 的判断结果',
      playground: true,
    },
    { type: 'heading', content: 'toRaw()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function toRaw<T>(proxy: T): T`,
    },
    {
      type: 'text',
      content:
        '返回 Vue 代理（`reactive()`、`readonly()`、`shallowReactive()`、`shallowReadonly()` 四种）背后的原始对象。这是一个逃生舱：临时读取时不产生代理访问与依赖追踪的开销，写入时不触发变更通知。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const foo = {}
const reactiveFoo = reactive(foo)

console.log(toRaw(reactiveFoo) === foo) // true`,
    },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '用 `unref()` 解析 getter',
          description:
            '把 `unref()` 和 3.3+ 的 `toValue()` 当成同义词。`unref()` 只在输入是 ref 时读取 `.value`，普通函数会被原样返回；`toValue()` 才会额外调用 getter。',
          consequence:
            '业务函数拿到函数对象而不是 getter 的返回值，比较、请求参数或序列化结果错误。',
          wrong: {
            lang: 'ts',
            content:
              'const id = ref(1)\nconst value = unref(() => id.value)\n// value 是函数，不是 1',
          },
          correct: {
            lang: 'ts',
            content: 'const id = ref(1)\nconst value = toValue(() => id.value)',
          },
        },
        {
          title: '用 `isReadonly()` 推断“它一定是对象代理”',
          description:
            '`isReadonly()` 判断的是只读语义，不是值的完整种类；没有 setter 的 computed ref 也被标记为 readonly。',
          consequence:
            '代码进入“只读对象代理”分支后按普通对象枚举或调用对象 API，实际值却是 ref，导致逻辑误判。',
          wrong: {
            lang: 'ts',
            content: 'if (isReadonly(value)) {\n  sendObject(Object.keys(value))\n}',
          },
          correct: {
            lang: 'ts',
            content:
              'if (isRef(value) && isReadonly(value)) {\n  sendValue(value.value)\n} else if (isProxy(value) && isReadonly(value)) {\n  sendObject(Object.keys(value))\n}',
          },
        },
        {
          title: '长期保存并写入 `toRaw()` 返回值',
          description:
            '把 `toRaw()` 当成“解除代理但保留响应式连接”。官方只把它定义为临时逃生口；原始对象的写入绕过代理拦截。',
          consequence:
            '原始对象已经变化，但依赖代理的模板、computed 和 watcher 没有收到通知；同时持有 raw 与 proxy 还会混淆身份比较。',
          wrong: {
            lang: 'ts',
            content: 'const state = reactive({ count: 0 })\nconst raw = toRaw(state)\nraw.count++',
          },
          correct: {
            lang: 'ts',
            content:
              'const state = reactive({ count: 0 })\ninspectOnce(toRaw(state)) // 临时读取后丢弃 raw\nstate.count++ // 写入仍走代理',
          },
        },
        {
          title: '认为 `markRaw()` 会递归标记整棵对象树',
          description:
            '`markRaw()` 的退出转换只作用于被标记的根对象；未标记的嵌套对象之后放入 reactive 容器，仍会被转换为代理。',
          consequence:
            '同一个嵌套对象同时出现 raw 和 proxy 两种身份，`===`、Map key 或依赖对象身份的去重逻辑失败。',
          wrong: {
            lang: 'ts',
            content:
              'const raw = markRaw({ nested: {} })\nconst state = reactive({ nested: raw.nested })\nconsole.log(raw.nested === state.nested) // false',
          },
          correct: {
            lang: 'ts',
            content:
              'const nested = markRaw({})\nconst raw = markRaw({ nested })\nconst state = reactive({ nested })\nconsole.log(raw.nested === state.nested) // true',
          },
        },
      ],
    },
    { type: 'heading', content: 'markRaw()' },
    {
      type: 'code',
      lang: 'ts',
      content: `function markRaw<T extends object>(value: T): T`,
    },
    {
      type: 'text',
      content:
        '标记一个对象，使它永远不会被转为代理，返回对象本身。典型用途：不应被代理的复杂第三方类实例、Vue 组件对象，或渲染大型不可变列表时跳过代理转换以提升性能。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const foo = markRaw({})
console.log(isReactive(reactive(foo))) // false

// 嵌套在其他 reactive 对象内时同样生效
const bar = reactive({ foo })
console.log(isReactive(bar.foo)) // false`,
    },
    {
      type: 'tip',
      style: 'warning',
      content:
        'markRaw 的退出转换只作用于根级别：把一个未被标记的嵌套对象放进 reactive 对象后再取出，拿到的仍是代理版本。于是同一个对象会出现"原始版"与"代理版"两个身份，依赖对象同一性的比较会失败——官方称之为 identity hazard（身份陷阱）。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `const foo = markRaw({ nested: {} })
const bar = reactive({
  // foo 被标记了，但 foo.nested 没有
  nested: foo.nested,
})

console.log(foo.nested === bar.nested) // false，同一对象出现了两个版本`,
    },
    { type: 'heading', content: '最小源码实现' },
    {
      type: 'text',
      content:
        '这 8 个函数在源码里几乎都是几行代码，秘密全在几个内部标记属性上：`__v_isRef` 是 RefImpl 上的真实属性；`__v_isReactive`、`__v_isReadonly`、`__v_raw` 则不存在于任何对象上，而是 Proxy get 拦截识别到这些特殊 key 时动态返回的"暗号"——所以普通对象查这些属性得到 undefined，代理对象则由 handler 按自己的身份作答。`markRaw` 就是给对象定义 `__v_skip: true`，reactive() 创建代理前会检查它。',
    },
    {
      type: 'code',
      lang: 'ts',
      content: `// 精简自 vuejs/core v3.5.40 packages/reactivity/src/reactive.ts、ref.ts
// 判断类：读内部标记（代理的标记由 Proxy get 拦截动态应答）
export function isRef(r: any): boolean {
  return r ? r.__v_isRef === true : false
}

export function isReadonly(value: any): boolean {
  return !!(value && value.__v_isReadonly)
}

export function isReactive(value: any): boolean {
  if (isReadonly(value)) {
    // readonly(reactive(x))：剥掉只读壳，看里面那层是不是 reactive
    return isReactive(value.__v_raw)
  }
  return !!(value && value.__v_isReactive)
}

export function isProxy(value: any): boolean {
  // 四种代理的 get 拦截都会应答 __v_raw；ref 不是 Proxy，所以是 false
  return value ? !!value.__v_raw : false
}

// 取值类
export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? (ref as Ref<T>).value : ref
}

export function toValue<T>(source: T | Ref<T> | (() => T)): T {
  return typeof source === 'function' ? (source as () => T)() : unref(source)
}

// 逃生舱类
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as any).__v_raw
  return raw ? toRaw(raw) : observed // 递归：readonly(reactive(x)) 剥两层
}

export function markRaw<T extends object>(value: T): T {
  // 打上 __v_skip 标记；reactive() 创建代理前会检查并跳过
  Object.defineProperty(value, '__v_skip', { value: true })
  return value
}

// Proxy get 拦截中应答暗号的对应片段（见 baseHandlers）：
// if (key === '__v_isReactive') return !isReadonly
// if (key === '__v_isReadonly') return isReadonly
// if (key === '__v_raw') return target`,
    },
    {
      type: 'tip',
      style: 'info',
      content:
        '源码细节印证了两个边界行为：isReactive 遇到只读代理会先经 __v_raw 剥壳再判断，所以 isReactive(readonly(reactive(x))) 为 true；而 ref 不是 Proxy、不应答 __v_raw，所以 isProxy(ref(0)) 为 false。',
    },
  ],
})
