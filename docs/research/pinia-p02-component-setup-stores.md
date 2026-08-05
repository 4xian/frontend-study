# Pinia 4.0.2 P02：组件接入与 Setup Store 官方调研

> 核验日期：2026-08-05（Asia/Shanghai）
>
> 批次边界：仅 `P02 / L05-L06`
>
> 固定版本：[`pinia@4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
>
> 固定 commit：
> [`ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1`](https://github.com/vuejs/pinia/commit/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1)
>
> P0 计划快照：`docs/research/pinia-course-plan.md`，调研时 SHA-256 为
> `b1e05516c3fcaff5324f076c444380db70781dd15890d1e24dcceccec9f0ad87`
>
> 资料口径：Pinia / Vue 官方文档，以及上述固定 commit 的 Pinia 源码与官方测试。
> 外部资料通过 Tavily 实时检索并回到一手来源核验；本文不采用博客、问答、视频、第三方库、
> 浮动 `main` 源码或社区讨论作为事实依据。

## 研究结论

1. Pinia store 本身是响应式对象；直接访问 `store.count`、`store.doubleCount` 可以持续追踪，
   但把 state 或 getter 直接解构为局部绑定，会断开该绑定与 store 属性的响应联系。
2. `storeToRefs(store)` 的公开契约是提取 state、getters 和插件添加的 state，并忽略 methods 与
   非响应式属性。固定源码的实际筛选条件是 computed、ref 或 reactive；固定测试同时确认插件
   返回的 ref 会被提取、普通值会被忽略，且调用 `storeToRefs()` 本身不会立即求值 getter。
3. action 不需要也不应进入 `storeToRefs()`。可以直接从 store 解构 action；固定源码的 action
   wrapper 在失去调用方 `this` 时回退到所属 store，固定测试也覆盖了强制错误 `this` 的调用。
4. Setup Store 的公开映射是 `ref -> state`、`computed -> getter`、`function -> action`。固定源码还把
   `reactive` 对象归为 state；返回的普通非响应值只会成为普通公开属性，不会成为受管理的 state。
5. Setup Store 必须返回全部应由 Pinia 管理的 state。官方明确警告：隐藏 state 或把 state 做成
   readonly 会破坏 SSR、Devtools 和其他插件的正常工作。
6. Setup Store 可以使用 `inject()`、`useRoute()` 等应用上下文能力，但官方明确要求不要把 route
   或应用注入值返回为 store 属性。否则，响应式外部对象可能被固定源码识别成 state，混入
   序列化、hydration、Devtools 和插件可见面。
7. Setup Store 没有可依赖的内建 `$reset()`，必须自行实现并返回。固定 4.0.2 源码中，未自定义时
   开发环境会抛错、生产分支是空操作，不能把任一行为当作重置成功。
8. Setup Store 内同步创建的 watcher 属于 store 自己的 effect scope，不属于任意消费组件。
   组件卸载不会自动销毁 store；`store.$dispose()` 才会停止该 scope，但不会删除已有 state。

## P02 冻结范围

| 课程 | 冻结值 |
| --- | --- |
| L05 | `vue.pinia.learn.basics.component-store-to-refs` |
| L05 标题 | `组件接入与 storeToRefs` |
| L05 前置 | L01-L04 |
| L05 唯一 Demo | `vue.pinia.learn.basics.component-store-to-refs.pinia-store-to-refs-lab-demo` |
| L06 | `vue.pinia.learn.intermediate.setup-stores` |
| L06 标题 | `Setup Store` |
| L06 前置 | L01-L05 |
| L06 唯一 Demo | `vue.pinia.learn.intermediate.setup-stores.pinia-setup-store-contract-lab-demo` |
| 批次发布 | L05-L06 与同一 focused Gate 原子进入 `available` |
| 后续状态 | L07-L14 继续 `planned` |
| 停止边界 | P02 Gate 后停止，不进入 P03 Store 组合 |

本文只为后续课程正文、Demo 和验收提供事实底稿，不修改 manifest、entry、Demo、测试、计划或
Reference，也不把尚未运行的浏览器验收写成已通过。

## L05：组件接入与 `storeToRefs()`

### 1. 直接访问与直接解构不是同一种响应性语义

Pinia 官方“Using the store”说明 store 是由 `reactive()` 包装的对象，组件可以直接读写其 state，
也可以直接读取 getter。与普通 Vue reactive 对象一样，依赖追踪发生在属性访问处：

```ts
const store = useCounterStore()

// 持续通过 store proxy 读取，模板或 computed 能追踪后续变化。
const currentCount = computed(() => store.count)

// 这里只读取一次当前值；局部绑定不再跟随 store.count 或 store.doubleCount。
const { count: countSnapshot, doubleCount: doubleSnapshot } = store
```

Vue 官方对 reactive 限制的表述更精确：解构 primitive 属性后，局部变量不再触发源对象的
proxy get / set；如果解构值本身是对象，继续修改该对象的内部属性仍可能是响应式的，但局部绑定
仍不会跟随源属性被整体替换。因此课程应演示 number/string getter 的清晰快照，不把“所有嵌套对象
瞬间完全失去响应性”写成绝对结论。

**公开契约来源：** [Using the store](https://pinia.vuejs.org/core-concepts/#using-the-store)、
[Vue reactive 的限制](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)。

### 2. `storeToRefs()` 提取什么

官方 API 的稳定表述是：返回包含全部 state、getters、plugin-added state 的 refs 对象；它类似
`toRefs()`，但专门面向 Pinia store，因此完全忽略 methods 和 non-reactive properties。

| store 上的属性形态 | `storeToRefs()` 结果 | 课程含义 |
| --- | --- | --- |
| Options / Setup state | 包含，对应可读写 ref | 解构后继续跟随 store |
| getter / computed | 包含，对应 computed ref | 保留缓存、依赖与 setter 语义 |
| 插件返回的 ref/reactive state | 包含 | 可展示 plugin-added reactive field |
| action / 普通 function | 忽略 | action 直接从 store 解构 |
| 插件返回的普通 number/string/object | 忽略 | 非响应式扩展不应伪装成 ref |
| Setup Store 返回的 `null` 等非响应值 | 忽略 | 不会因遍历而报错或产生 ref |

固定 `storeToRefs.ts` 先对 store 使用 `toRaw()`，再遍历其可枚举键：带 computed effect 的值被包装为
computed ref；其他 `isRef()` 或 `isReactive()` 值通过 `toRef(store, key)` 暴露；其余键不进入结果。
这解释了 methods 与普通值为何被忽略，也解释了插件添加的响应式键为何可以被发现。

`storeToRefs.spec.ts` 额外固定了四个课程可观察事实：

1. Options Store 与 Setup Store 的 state/getter 都会得到 refs。
2. 插件返回的 `pluginN: ref(20)` 会出现，`shared: 10` 不会出现。
3. writable computed 的 setter 会被保留。
4. 仅调用 `storeToRefs()` 不会立即触发 lazy getter 求值。

**公开契约来源：** [`storeToRefs()` API](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html)。

**固定 4.0.2 依据：**
[`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)、
[`storeToRefs.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts)。

### 3. action 保持可调用的正确方式

正确组合是“state/getter 用 `storeToRefs()`，action 直接解构”：

```ts
const store = useCounterStore()
const { count, doubleCount } = storeToRefs(store)
const { increment } = store
```

Pinia 官方明确说明 actions 绑定到 store，因此可以解构。固定 `store.ts` 中的 wrapper 调用原 action
时使用 `fn.apply(this && this.$id === $id ? this : store, args)`；解构调用没有合格的 store `this`，
于是回退到闭包捕获的所属 store。`actions.spec.ts` 还验证了 `store.toggle.call(null)` 仍以 store 为
上下文执行。

这不是“任意方法脱离对象后都会自动绑定”的 JavaScript 规则，而是 Pinia 对 action 的包装契约。
插件覆盖普通方法时也不能擅自推广这一结论。

**公开契约来源：** [Using the store](https://pinia.vuejs.org/core-concepts/#using-the-store)。

**固定 4.0.2 依据：**
[`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)、
[`actions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts)。

### 4. 插件字段的两个独立问题

“能被 `storeToRefs()` 提取”和“是可序列化的正式 plugin state”不能混为一谈：

- `storeToRefs()` 的运行时过滤只关心属性是否是 computed/ref/reactive。
- Pinia 插件指南要求需要 hydration 的新 state 同时加入 `store` 与 `store.$state`；加入 `$state` 才能
  被 Devtools 和 SSR 序列化使用。
- 因此 P02 Demo 可以用一个插件返回的 ref 与一个普通值证明筛选语义，但正文必须说明完整插件
  state 所有权属于 P04，不在 P02 展开插件持久化、reset 扩展或 hydration 实现。

**公开契约来源：** [Plugins: Adding new state](https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state)。

### 5. L05 可直接采用的误区

1. **误区：** `const { count } = store` 等同于 `const count = computed(() => store.count)`。
   **纠正：** 前者只保存当前解包值，后者在 getter 中持续访问 store 属性。
2. **误区：** getter 是特殊方法，所以直接解构后仍会重新计算。
   **纠正：** store proxy 读取时已经得到当前 getter 值；应通过 store 属性或 `storeToRefs()` 保持联系。
3. **误区：** `storeToRefs()` 也会返回 action ref。
   **纠正：** methods 被明确忽略，action 直接从 store 解构。
4. **误区：** action 能解构是因为所有 JavaScript 方法都会自动绑定。
   **纠正：** 这是 Pinia action wrapper 的行为，不是语言通则。
5. **误区：** 所有插件字段都会进入 `storeToRefs()`。
   **纠正：** 固定实现只接受 computed/ref/reactive；普通值被忽略。
6. **误区：** 被 `storeToRefs()` 找到就代表该插件字段会参与 SSR 序列化。
   **纠正：** 正式插件 state 还必须按插件指南同步进 `store.$state`。
7. **误区：** 调用 `storeToRefs()` 会立刻把所有 getters 全部求值。
   **纠正：** 固定上游测试确认 getter 保持 lazy。
8. **误区：** 为保留响应性可以写 `ref(store.count)`。
   **纠正：** 这会创建另一份以当前值初始化的 state；使用 `storeToRefs()` 或精确 `computed()`。

### 6. L05 编号源码/测试推导

1. `storeToRefs()` 必须读取 raw store，才能看到 setup 返回的原始 ref/computed，而不是 reactive proxy
   已自动解包的值；`store.ts` 在组装后同步赋值给 `toRaw(store)` 也是为此服务。
2. computed 分支只创建代理 getter/setter，没有读取 `.value`，所以提取阶段不应触发原 getter；
   `storeToRefs.spec.ts` 对该行为有直接断言。
3. 插件 ref 与普通值在相同插件返回对象中得到不同结果，证明筛选依据是响应性形态，而不是“是否
   来自插件”这一来源标签。
4. action wrapper 对不合格 `this` 回退到所属 store，因此解构 action 仍能调用其他 action、getter
   和 state；但课程不得把这一推导扩展到任意插件普通方法。

## L06：Setup Store

### 1. 返回值形态决定 Pinia 分类

Pinia 官方把 Setup Store 类比组件的 Composition API setup，并给出三项映射。固定源码补充了
`reactive` state 与普通值的运行时边界：

| setup 返回值 | Pinia 分类 | 是否进入 `$state` | 课程用法 |
| --- | --- | --- | --- |
| `ref()` | state | 是 | primitive / object state |
| `reactive()` | state | 是 | 需要整体保持 identity 的对象 state |
| `computed()` | getter | 否 | 缓存派生值 |
| 普通 function | action | 否 | 命令与业务操作 |
| `ref(() => {})` | state | 是 | payload 是 function，不等同于 action |
| 普通 primitive / plain object | 不归类为 state/getter/action | 否 | 不受 Pinia state 管理；不应用来伪装 state |

`storeSetup.spec.ts` 直接断言 Setup Store 的 `$state` 只有 `name`、`counter`，不含 computed
`double` 或 action `increment`；另一条测试确认 ref 内保存 function 时，该 ref 仍属于 state。
因此分类依据是返回容器的形态，而不是值的业务名称或 payload 类型。

**公开契约来源：** [Setup Stores](https://pinia.vuejs.org/core-concepts/#setup-stores)。

**固定 4.0.2 依据：**
[`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)、
[`storeSetup.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)。

### 2. 必须返回全部 state

官方文档对此不是可选风格建议，而是明确限制：Pinia 要把 Setup Store state 识别出来，就必须返回
全部 state；不能保留 private state；不完整返回或把 state 变为 readonly 会破坏 SSR、Devtools 和
其他插件。

固定 `store.ts` 说明原因：它只遍历 setup 函数的返回对象，遇到 ref/reactive 后才把该键同步到
`pinia.state.value[$id]`，执行初始 hydration，并登记 HMR state。没有返回的 ref 对 Pinia 的这条
管理链路不可见。

课程措辞应保持两层：

- **官方公开契约：** 返回全部 state，不使用 private/readonly store state。
- **固定源码推导：** 返回对象是 state 识别、root state 同步和 hydration 的扫描入口。

不要把“闭包里有一个普通常量”误判为隐藏 state；只有希望响应式变化且由 Pinia 管理的 ref/reactive
才属于这里的全部 state 要求。

### 3. `inject()`、`useRoute()` 与 SSR 风险

Setup Store 可以在应用上下文中使用 `inject()`，也可以调用 `useRoute()`。固定
`storeSetup.spec.ts` 通过 `app.use(pinia)`、`app.provide()` 和 store 内 `inject()` 证明应用级注入可用。

官方同时给出更重要的反面规则：不要把 `route` 或 `appProvided` 返回出去，因为它们不属于 store，
组件可以直接使用 `useRoute()` / `inject()`。固定源码使该风险具体化：route 是 reactive 对象时，
如果从 setup 返回，会命中 `isReactive(prop)` state 分支，继而进入 Pinia root state 与 hydration
路径。这会把路由上下文误建模为 store 自有 state。

SSR 课程边界需要明确：

1. 官方说明 Setup Store 可自由使用 composable，但 SSR 下会更复杂。
2. SSR 会序列化并在客户端 hydration Pinia root state；需要安全转义，并在客户端首次
   `useStore()` 前恢复。
3. `skipHydrate()` 的公开用途之一是标记“setup store 返回但不是真 state”的 router 等对象，
   但 P02 的首选教法仍是遵守 core concepts：不要返回 route / injected context。
4. P02 只解释风险，不实现真实 SSR、hydration、请求级 Pinia、router 注入或 `skipHydrate()` 教程；
   这些属于后续专门边界。

**公开契约来源：** [Setup Stores](https://pinia.vuejs.org/core-concepts/#setup-stores)、
[Dealing with Composables](https://pinia.vuejs.org/cookbook/composables.html)、
[SSR](https://pinia.vuejs.org/ssr/)、
[`skipHydrate()`](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html)。

**固定 4.0.2 依据：**
[`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)、
[`storeSetup.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)。

### 4. Setup Store 必须自定义 `$reset()`

官方 State 指南要求 Setup Store 自己声明并返回 `$reset()`，逐项把 state 恢复到该 store 定义的
基线。课程应展示显式 reset，而不是直接替换 ref、调用不存在的 Option Store state factory，或假设
Pinia 能推断任意 setup 闭包的初始值。

固定 `store.ts` 只为 Options Store 实现“重新调用 `state()` 再 `$patch()`”的内建 reset。Setup
Store 未覆盖 `$reset` 时，开发分支抛出“不实现 `$reset()`”错误，生产分支为空操作；从 setup
返回同名 action 后，组装阶段才用自定义实现覆盖该占位行为。

```ts
const count = ref(0)
const query = ref('')

/** 把本 store 拥有的全部 state 恢复到显式基线。 */
function $reset() {
  count.value = 0
  query.value = ''
}

return { count, query, $reset }
```

**公开契约来源：** [State: Resetting the state](https://pinia.vuejs.org/core-concepts/state.html#resetting-the-state)。

**固定 4.0.2 依据：**
[`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)。

### 5. store 内 watcher 与消费组件不是同一生命周期

官方允许 Setup Store 内创建 watcher。固定 `store.ts` 在 Pinia effect scope 下为每个 store 创建
独立 `effectScope()`，并在该 scope 内执行 setup；因此 setup 同步创建的 watcher 由 store scope
收集。消费组件仅仅调用或读取 store，不会取得该 scope 的所有权。

`store.$dispose()` 会停止 store scope、清空 state/action subscriptions，并从 store registry 删除该
store。官方 API 特别说明它不会删除 `pinia.state.value[store.$id]`；如果之后再次使用该 store，旧
state 仍会被复用。整个隔离 Pinia 不再需要时，`disposePinia()` 才会停止 root effect scope，并清除
state、plugins 和 stores，且该 Pinia 之后不可再使用。

这与组件内调用 `$subscribe()` 的默认清理规则不同：组件 scope 中创建的普通订阅默认随组件卸载
取消；P02 Demo 要验证的是 **Setup Store 自己创建的 watcher**，不能用组件订阅替代。

**公开契约来源：**
[`$dispose()`](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose)、
[`disposePinia()`](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)。

**固定 4.0.2 依据：**
[`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)。

### 6. L06 可直接采用的误区

1. **误区：** Setup Store 只是把 Options Store 换一种文件写法，返回值形态没有运行时意义。
   **纠正：** Pinia 按 ref/reactive、computed、function 分类 state/getter/action。
2. **误区：** `ref(() => {})` 会因为 payload 是 function 而成为 action。
   **纠正：** ref 容器先命中 state 分支，上游测试确认它进入 `$state`。
3. **误区：** 没 return 的 ref 是“真正私有 state”，更安全。
   **纠正：** 官方明确禁止；Pinia 无法把它纳入 SSR、Devtools 和插件管理。
4. **误区：** 把返回的 state 包成 readonly 是推荐封装。
   **纠正：** 官方明确警告 readonly state 会破坏相关能力；通过 action 约定修改入口即可。
5. **误区：** 可以把 `useRoute()` 返回值一并 return，方便所有组件读取。
   **纠正：** route 不属于 store；官方要求组件直接使用 `useRoute()`。
6. **误区：** Setup Store 自动拥有与 Options Store 相同的 `$reset()`。
   **纠正：** 必须自行实现并返回；固定源码的默认分支不能执行重置。
7. **误区：** 最后一个消费组件卸载后 store 内 watcher 会自动停止。
   **纠正：** watcher 属于 store scope；显式 `$dispose()` 才停止该 scope。
8. **误区：** `$dispose()` 同时删除 state 并恢复初始值。
   **纠正：** 官方 API 明确说 state 仍保留；如再次使用会复用旧 state。
9. **误区：** Setup Store 能用 composable，就代表任意 composable 都天然 SSR-safe。
   **纠正：** 官方明确提示 SSR 会更复杂；外部 state、DOM 引用、router 和 hydration 需分别建模。

### 7. L06 编号源码/测试推导

1. `store.ts` 先在 store effect scope 内执行 setup，再扫描返回对象；所以“返回全部 state”既是
   官方规则，也直接决定 Pinia 能看到哪些 state。
2. ref/reactive 分支把 setup state 与 `pinia.state.value[$id]` 同步，并在有 initial state 时执行
   hydration；computed 与 function 不进入 `$state`。
3. `storeSetup.spec.ts` 对 `$state` 的精确断言证明 `double` 与 `increment` 不在 state；function ref
   的测试则证明分类依据是容器形态。
4. `runWithContext()` 与固定注入测试证明 app-level inject 可用；这不改变“不要返回外部上下文”
   的官方所有权规则。
5. 内建 `$reset` 只在 `isOptionsStore` 分支调用 state factory；Setup Store 必须以返回的同名 action
   提供实际实现。
6. `$dispose()` 直接调用 `scope.stop()`，因此可以结束 store 内 watcher；它只从 registry 删除 store，
   没有删除 root state，和官方 API 的“再次使用会复用旧 state”一致。

## 对课程正文与唯一 Demo 的约束

### L05 Demo 必须可观察

同一次 action 后并列显示：

- `store.count` / `store.doubleCount` 的当前值。
- 直接解构得到的 primitive state/getter 快照仍为初值。
- `storeToRefs()` 得到的 state/getter refs 已更新。
- 解构 action 仍能修改同一个 store。
- 插件注入的 reactive/ref 字段出现在结果中，普通非响应字段不存在。
- 仅创建 refs 时 getter 求值计数仍为 0，真正读取 getter ref 后才求值。

不要用第二份复制 state 制造“快照”，也不要用 internal `_p` 注入插件。后续实现应通过公开
`pinia.use()` 和隔离 mini-app 安装插件。

### L06 Demo 必须可观察

- 对照 Options Store 与 Setup Store 的 state/getter/action 映射。
- 自定义 `$reset()` 恢复明确基线，不调用 Setup Store 的默认占位实现。
- Setup Store 内 watcher 记录 state 变化。
- 卸载消费组件后继续修改 store，watcher 仍运行，证明它不属于消费组件。
- 调用 `store.$dispose()` 后再改变保留的 state，watcher 不再运行。
- 明示 `$dispose()` 停止 scope 但不删除 state；不要把它展示成 reset。

上述浏览器项来自 P02 冻结计划，本文没有启动页面或运行浏览器，状态仍是“待后续 P02 实施验证”。

## 证据分层与课程措辞

| 层级 | 可以写成什么 | 本文示例 |
| --- | --- | --- |
| 官方公开契约 | 默认课程正文结论 | action 可解构；`storeToRefs()` 忽略方法；Setup Store 返回全部 state |
| 固定 4.0.2 源码/测试推导 | 必须显式标版本 | getter 不在提取时求值；action wrapper 的 `this` 回退；生产 reset 占位为空操作 |
| 应用建模建议 | 只能写成建议 | route/injected context 留在使用点；用 action 约定 state 修改入口 |

不得把固定实现细节升级为未来版本承诺，也不得把应用建模建议写成 Pinia 强制架构。

## P02 明确排除范围

- 不进入 P03：不讲 Store 组合、跨 store getter/action、循环依赖或职责建模。
- 不进入 L10：不实现组件外使用、导航守卫、Router 集成或宿主 URL 行为。
- 不进入 P04：不讲完整插件设计、持久化、插件 reset 扩展或 `@pinia/testing`。
- 不进入 P05：不实现真实 SSR、hydration、HMR 或 Devtools 运行证据。
- `skipHydrate()` 只用于解释风险边界，不作为本批 API 教程或 Demo 功能。
- 不新增 package，不安装依赖，不改 manifest、课程正文、Demo、测试、计划、Reference 或搜索。
- 不启动开发服务器，不打开页面，不把未来浏览器 Gate 写成当前已通过。
- 不改变 P01 课程和 Demo；L07-L14 继续保持 `planned`。

## 一手来源

### Pinia 当前官方公开文档

- [Defining a Store / Using the store / Setup Stores](https://pinia.vuejs.org/core-concepts/)
- [`storeToRefs()`](https://pinia.vuejs.org/api/pinia/functions/storeToRefs.html)
- [State / Resetting the state](https://pinia.vuejs.org/core-concepts/state.html#resetting-the-state)
- [Plugins / Adding new state](https://pinia.vuejs.org/core-concepts/plugins.html#adding-new-state)
- [Dealing with Composables](https://pinia.vuejs.org/cookbook/composables.html)
- [Server Side Rendering](https://pinia.vuejs.org/ssr/)
- [`skipHydrate()`](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html)
- [`$dispose()`](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#dispose)
- [`disposePinia()`](https://pinia.vuejs.org/api/pinia/functions/disposePinia.html)

### Vue 当前官方公开文档

- [Reactivity Fundamentals / Limitations of `reactive()`](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive)
- [Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)

### Pinia 4.0.2 固定源码与官方测试

- [Release `v4.0.2`](https://github.com/vuejs/pinia/releases/tag/v4.0.2)
- [`storeToRefs.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/storeToRefs.ts)
- [`storeToRefs.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeToRefs.spec.ts)
- [`store.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/src/store.ts)
- [`storeSetup.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/storeSetup.spec.ts)
- [`actions.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/actions.spec.ts)
- [`state.spec.ts`](https://github.com/vuejs/pinia/blob/ae4e3b2ba6938b12296ae35ce8d49e36d89f8fd1/packages/pinia/__tests__/state.spec.ts)
