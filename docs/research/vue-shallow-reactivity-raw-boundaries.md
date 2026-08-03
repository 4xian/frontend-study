# Vue 浅层响应式与原始对象边界调研

> 查证日期：2026-08-02<br>
> 适用版本：Vue 3.5.40<br>
> 资料范围：Vue 中文官方响应式进阶 API、性能指南，`vuejs/core@v3.5.40` 固定标签的
> `reactive.ts`、`ref.ts`、`baseHandlers.ts` 及官方测试。外部资料只通过 Tavily 定位和提取；
> 博客、问答、issue 推测、未固定的 `main` 分支和本地既有正文不作为技术结论依据。

## 已冻结实施契约

| 项目 | 冻结值 |
| --- | --- |
| 批次 | Vue Core 第二十七批 |
| 课程 ID | `vue.core.learn.advanced.shallow-reactivity-raw-boundaries` |
| 标题 | 浅层响应式与原始对象边界 |
| 阶段 / 分类 | `advanced` / `reactivity-boundaries` |
| 唯一直接前置 | `vue.core.learn.intermediate.teleport` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.shallow-reactivity-raw-boundaries.shallow-reactivity-boundary-lab-demo` |
| 易错点 | 8 个，每项含错误与正确示范 |
| 源码推导 | 8 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 70 分钟 |
| 后续课程 | `vue.core.learn.advanced.custom-ref-triggering` |

课程不把浅层 API 描述为普通状态的默认性能开关。教学重点是建立清楚的状态边界：Vue 只观察
哪一层、一次写入是否经过代理、对象身份是否仍然唯一，以及何时应该替换根引用或显式通知。

## 一手来源

### 公开文档契约

- [Vue 中文响应式 API：进阶](https://cn.vuejs.org/api/reactivity-advanced.html)：
  `shallowRef()`、`triggerRef()`、`shallowReactive()`、`toRaw()` 与 `markRaw()` 的公开语义、
  适用场景和警告。
- [Vue 中文性能优化指南](https://cn.vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures)：
  只有大型、深层且按不可变方式更新的数据才可能从浅层 API 中受益；更新必须替换根状态。
- [`vuejs/docs` 响应式进阶 Markdown](https://github.com/vuejs/docs/blob/main/src/api/reactivity-advanced.md)：
  用于交叉核对根级追踪、ref 不解包、持久 raw 引用警告与 identity hazard 的原始措辞。

### Vue 3.5.40 固定源码与官方测试

- [`ref.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/ref.ts)：
  `shallowRef()` 的 `createRef(value, true)` 分支、`RefImpl` 的值保存与根身份比较，以及
  `triggerRef()` 对依赖的显式通知。
- [`reactive.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/reactive.ts)：
  `shallowReactive()` 的独立 handler / WeakMap、`toRaw()` 递归取回原对象和 `markRaw()` 的
  根对象跳过标记。
- [`baseHandlers.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/src/baseHandlers.ts)：
  getter 先追踪根属性，再在 shallow 分支原样返回，跳过 ref 解包与嵌套对象代理化。
- [`ref.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/ref.spec.ts)：
  官方测试验证 shallow ref 内部值不是 reactive、根替换会触发、深改后必须 `triggerRef()`。
- [`shallowReactive.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/shallowReactive.spec.ts)：
  官方测试验证嵌套对象保持 raw、已有 reactive 值保持 reactive、根 ref 不解包及集合根操作。
- [`reactive.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/reactivity/__tests__/reactive.spec.ts)：
  `toRaw()`、`markRaw()`、代理判定与原始对象身份的官方回归行为。

公开 API 与实现事实必须分层表达。`ReactiveFlags`、`Dep`、各类 WeakMap、handler 实例与
`_rawValue` 都只用于解释 Vue 3.5.40 的可观察行为，业务代码不得读取或修改这些内部字段。

## 从基础到高级的教学顺序

1. 先画边界：深层响应式观察整棵按需访问的对象图，浅层 API 只把根访问作为通知边界。
2. 学习 `shallowRef()`：内部值原样保存，`.value` 根替换才自动触发。
3. 选择更新协议：不可变根替换是默认方案，受控原地批量修改才考虑一次 `triggerRef()`。
4. 学习 `shallowReactive()`：根属性读写响应式，嵌套对象与根 ref 值都原样暴露。
5. 避免混合树：浅层对象应放在状态树根部，不嵌进深层 reactive 图中制造不一致语义。
6. 区分 raw 与 proxy：`toRaw()` 是临时逃生口，不是解除代理后的新状态通道。
7. 使用 `markRaw()`：只为明确不应代理的根对象退出转换，并审计未标记的嵌套身份。
8. 最后用源码与测试解释根身份比较、显式触发、ref 不解包和 identity hazard。

## 必须准确覆盖的公开语义

### `shallowRef()` 只观察 `.value`

内部对象按原样保存，不会被转换为 reactive。深层属性修改确实改变了原对象，但不会因为这次写入
自动通知模板、computed、watch 或 watchEffect。整体替换 `.value` 才是默认更新协议。

```ts
const document = shallowRef({ title: '草稿' })

document.value.title = '已改但未通知'
document.value = { ...document.value, title: '根替换并通知' }
```

把深改后的同一对象重新赋给 `.value` 也不是根替换；Vue 对根身份做相等性判断，同一引用不会触发。

### `triggerRef()` 是一次显式通知，不是深层代理化

`triggerRef(shallow)` 会强制重新运行依赖这个 shallow ref 的副作用，因此它们下一次读取时可以看到
已经发生的内部修改。它不会把内部对象改造成 reactive，也不会替业务代码决定批量修改的事务边界。
优先使用不可变根替换；只有外部库或明确受控的原地批量更新才使用它。

### `shallowReactive()` 只观察根属性

根属性的 get / set 仍经过代理并参与追踪；返回的嵌套对象保持原样，修改嵌套字段不会自动触发。
根属性中的 ref 也不会自动解包，读取和修改都要保留 `.value`。

```ts
const count = ref(0)
const state = shallowReactive({ mode: 'draft', nested: { count: 0 }, count })

state.mode = 'published' // 根写入，触发
state.nested.count++ // 深层 raw 写入，不触发
state.count.value++ // ref 没有被根代理解包
```

### `toRaw()` 只适合临时观察或身份归一

它返回 Vue 代理背后的原始对象。通过 raw 写入会绕过代理拦截和通知；长期同时持有 raw / proxy
还会使严格相等、Map key 与去重规则变得含混。应在短小边界内读取或做身份归一，随后丢弃 raw，
业务写入继续走代理。

### `markRaw()` 只标记传入的根对象

被标记对象不会再被 Vue 转为代理，适合第三方类实例、已有独立状态协议的对象或明确不可变的大型
结构。它不递归标记嵌套值；未标记的嵌套对象若单独进入 reactive 容器，仍可能得到 proxy 版本，
形成 raw 与 proxy 两个不同身份。

## 从 Vue 3.5.40 源码推导的 8 个结论

1. **浅层 Ref 与普通 Ref 共用 `RefImpl`。** `shallowRef(value)` 只把 `true` 传给
   `createRef()`；两者共享 `.value` 的追踪和根值变化判断，因此差异集中在内部值是否转换。
2. **shallow 分支直接保存输入身份。** `RefImpl` 构造器在 shallow 模式把 `_rawValue` 与
   `_value` 都设为输入值，跳过 `toRaw()` 与 `toReactive()`；适合持有外部状态快照或类实例。
3. **同一根引用重新赋值不会补发更新。** setter 仍通过 `hasChanged()` 比较根值；深改对象后再
   `state.value = state.value` 不会触发。应创建新根或显式 `triggerRef()`。
4. **`triggerRef()` 直接通知当前 Ref 的依赖。** 固定实现不执行值比较，也不转换内部对象；它是
   当前边界的一次强制通知，而不是开启深层追踪。
5. **浅层 reactive 有独立代理缓存。** `shallowReactive()` 使用 shallow handler 和独立 WeakMap，
   同一原对象可以同时获得深层与浅层代理；不要依赖二者严格相等。
6. **根读取仍会 track。** `baseHandlers.ts` 在 shallow 提前返回之前已对根 key 执行追踪；省掉的
   是嵌套代理化和嵌套访问拦截，不是根响应式能力。
7. **shallow getter 原样返回根 ref。** 提前返回发生在 ref 解包逻辑之前，解释了官方测试中
   `shallowReactive({ count: ref(0) }).count` 仍然是 Ref。
8. **raw 边界只由根标记和代理链解析组成。** `markRaw()` 给传入根对象设置跳过标记，`toRaw()`
   沿 Vue 的 RAW 链递归取回原对象；两者都不会递归规范化整个对象图的身份。

## 易错点冻结清单

以下 8 项必须在课程正文用结构化 `pitfalls` 呈现，并给出错误与正确示范：

1. 深改 `shallowRef` 后等待自动通知，正确做法是不可变地替换根值。
2. 深改后把同一对象重新赋给 `.value`，正确做法是创建新根或受控调用 `triggerRef()`。
3. 每次细小写入都调用 `triggerRef()`，正确做法是把一组原地修改合并成一次语义提交。
4. 深改 `shallowReactive` 的嵌套对象，正确做法是替换对应根属性。
5. 忘记 shallow reactive 的根 ref 不解包，正确做法是显式访问 `.value`。
6. 把 shallow reactive 嵌入深层 reactive 树，正确做法是在根边界使用一致模式。
7. 长期持有并写入 `toRaw()` 结果，正确做法是临时读取后丢弃，写入继续走 proxy。
8. 认为 `markRaw()` 递归标记，正确做法是标记真正的身份根或用稳定业务 ID 比较嵌套值。

## Demo 冻结契约

Demo 用可观察快照而不是直接把一次组件重渲染等同于依赖触发：

- `shallowRef` 区域同时显示原对象当前标题、watchEffect 最近观察标题和运行次数。
- 深改后原对象变化，但观察快照与次数不变；`triggerRef()` 后快照同步且次数加一。
- 根替换自动同步快照并加一次运行次数。
- `shallowReactive` 区域分别验证嵌套修改不触发、根属性修改与根对象替换会触发。
- 身份区域验证 shallow 内部值不是 reactive、`toRaw(proxy) === original`、markRaw 根保持 raw，
  并展示未标记嵌套对象进入 reactive 后的 identity hazard。
- 所有命令使用原生 button，可键盘操作，双轴至少 44px。
- 390px、200% 文本下无截断、重叠或页面横向滚动；不使用动画，reduced motion 下行为一致。
- CSS 禁止 `grid` 与 `gap`。

## E2E 冻结契约

只写一条连续路径，不使用固定等待：

1. 从 Teleport 的下一篇进入，验证标题、前后篇与唯一 Demo 已解析。
2. 深改 shallow ref，断言 raw 当前值改变而观察快照与 effect 次数不变。
3. 显式 trigger 后断言快照同步；根替换后断言自动触发。
4. 深改 shallow reactive 的嵌套对象，断言观察快照不变；随后根更新与根替换各触发一次。
5. 断言四个身份诊断结果、44px 触控尺寸、键盘焦点、200% 布局和 reduced motion。
6. 全程收集 console error / warning 与 page error，并要求为空。

页面可达性依赖共享 manifest 把本条目切换为 `available` 并更新前后篇；本独占批次不得修改共享
manifest，因此独立 E2E 失败时必须区分接线未完成和本批实现错误。

## 明确不覆盖

- 不把浅层 API 宣传为所有状态的默认优化，也不虚构固定性能收益。
- 不实现 CustomRef 或 EffectScope；它们属于后续独立课程。
- 不通过 raw 引用修改演示状态，不把 `triggerRef()` 当作普通 reactive 对象的通用刷新函数。
- 不读取 Vue 内部 `Dep`、WeakMap、ReactiveFlags 或私有字段。
- 不新增依赖、共享注册代码、manifest 或构建配置。
