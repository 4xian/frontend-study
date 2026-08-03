# Vue Core 中级课程：依赖注入调研

> 查证日期：2026-07-31  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文依赖注入指南、组合式 API、TypeScript 指南、应用实例 API，
> 以及 `vuejs/core` v3.5.40 `apiInject.ts`。Tavily 仅用于定位资料，所有结论均回到一手来源核验。

## 冻结结论

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.provide-inject` |
| 标题 | `依赖注入` |
| 阶段 | `intermediate` |
| 前置课程 | `vue.core.learn.intermediate.composables` |
| 线性位置 | “组合式函数”之后，“过渡效果”之前 |
| 唯一 Demo ID | `vue.core.learn.intermediate.provide-inject.dependency-scope-lab-demo` |
| 易错点数量 | 8 个 |
| 适用版本 | Vue 3.5.40 |
| 预计时长 | 50 分钟 |

本批只新增课程、唯一 Demo、目录与长路径接入。现有
`vue.core.reference.composition.provide-inject` 保持不变；过渡效果、动态组件、KeepAlive、插件实现、
SSR 应用工厂和状态管理均不在本批实现范围。

## 课程定位

上一课已经把有状态逻辑封装进组合式函数。本课继续解决所有权问题：当依赖属于一段组件子树，
而实际消费组件隔着若干不关心该依赖的中间层时，应该由祖先提供依赖，由后代按稳定 key 注入。

课程必须先帮助新手判断 Props、组合式函数、Provide / Inject 和 Store 的边界：

| 问题 | 首选工具 | 原因 |
| --- | --- | --- |
| 直接父子公开输入 | Props | 依赖关系应在组件调用处可见 |
| 同一组件或多个组件复用算法 | 组合式函数 | 复用的是有状态逻辑，不自动共享状态 |
| 一段组件子树共享上下文 | Provide / Inject | 中间层无需逐级转发，但作用域仍由组件树限定 |
| 无共同祖先或跨页面共享业务状态 | Store | 需要显式的应用级所有权与调试能力 |

不得把“少写 Props”当作使用依赖注入的唯一理由，也不得宣称 Provide / Inject 是完整的状态管理方案。

## 官方事实

### 提供与查找

- `provide(key, value)` 为当前组件的后代提供任意值，key 可以是字符串或 Symbol。
- `inject(key)` 从当前组件的父链开始查找；多个祖先使用同一个 key 时，最近提供者生效。
- 当前组件不能注入自己刚提供的值。当前实例的 provide 只对后代可见。
- 根组件还可回退到 `app.provide()` 的应用级依赖。
- 组件内 `provide()` 和 `inject()` 都必须在 `setup()` 的同步执行阶段调用。

来源：

- [Vue 依赖注入指南](https://cn.vuejs.org/guide/components/provide-inject)
- [组合式 API：依赖注入](https://cn.vuejs.org/api/composition-api-dependency-injection)

### 响应式与所有权

- `provide()` 不会把普通变量自动变成响应式值。
- 提供 ref 时，注入方得到同一个 ref，不会自动解包，因此响应式连接得以保留。
- 官方建议把修改响应式状态的逻辑留在提供方，并把修改函数与状态一起提供。
- 若注入方不应直接写入状态，可以提供 `readonly(ref)`，同时保留由提供方实现的命令。

来源：[Vue 依赖注入指南：和响应式数据配合使用](https://cn.vuejs.org/guide/components/provide-inject#working-with-reactivity)。

### Key、类型与缺省值

- `InjectionKey<T>` 是带泛型约束的 Symbol，可同步 provide 与 inject 两端的 TypeScript 类型。
- 字符串 key 的注入结果需要显式泛型，并且仍可能为 `undefined`。
- 没有匹配提供者时，可传普通默认值。
- 默认值本身是函数时，它默认被当成值；只有第三个参数为 `true` 时才作为工厂执行。
- 工厂默认值只在未找到 key 时调用，适合延迟创建成本较高且每个消费实例独立的对象。

来源：

- [TypeScript 与组合式 API：为 provide / inject 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
- [组合式 API：inject()](https://cn.vuejs.org/api/composition-api-dependency-injection.html#inject)

### 应用上下文

- `app.provide()` 在应用挂载前提供应用级依赖，插件可用它向整个应用公开服务。
- Vue 3.3+ 的 `app.runWithContext()` 只在回调同步执行期间建立应用注入上下文。
- `runWithContext()` 不是跨 `await` 保存上下文的异步容器。

来源：[应用实例 API](https://cn.vuejs.org/api/application.html#app-provide)。

## 学习目标

完成课程后，学习者应能：

1. 根据依赖所有者与消费范围，在 Props、组合式函数、Provide / Inject 和 Store 之间做选择。
2. 使用共享的 `InjectionKey<T>` 建立类型安全且不会碰撞的依赖契约。
3. 在祖先的 setup 同步阶段提供依赖，在任意深度后代同步注入。
4. 提供 `readonly` 响应式状态和由提供方实现的修改命令。
5. 解释为什么普通值不会响应更新，ref 注入后为什么不会自动解包。
6. 处理缺失提供者，并区分函数默认值与默认值工厂。
7. 预测同 key 嵌套提供者的最近匹配结果，并识别当前组件不能注入自身提供值。
8. 区分组件级 provide、`app.provide()` 和 `app.runWithContext()` 的生命周期边界。
9. 根据 Vue 源码的原型链实现推导嵌套作用域、覆盖和测试替身等用法。
10. 通过唯一 Demo 验证跨层注入、根级更新、局部覆盖和命令所有权。

## 正文编排

课程正文按以下顺序展开：

1. 从 prop drilling 场景判断依赖是否属于组件子树。
2. 建立 `InjectionKey<Context>`，把 key 与契约放在独立模块。
3. 祖先提供只读状态与修改命令，中间组件不接触依赖。
4. 深层后代注入并显式处理缺失提供者。
5. 用嵌套同 key 提供者解释最近匹配和作用域覆盖。
6. 解释响应式值、普通快照与对象身份。
7. 讲清普通默认值、函数值和默认值工厂。
8. 区分组件级、应用级和 setup 外受控上下文。
9. 展示 8 个易错点。
10. 单独展示源码推导、高级使用场景、练习、清单与回顾。

## 核心教学示例

### 类型安全的上下文

```ts
import type { InjectionKey, Ref } from 'vue'

interface LessonContext {
  mode: Readonly<Ref<string>>
  toggleMode: () => void
}

export const lessonContextKey: InjectionKey<LessonContext> = Symbol('lesson-context')
```

### 提供方保留修改权

```ts
const mode = ref('完整讲解')

/** 由依赖所有者切换讲解模式。 */
function toggleMode() {
  mode.value = mode.value === '完整讲解' ? '关键提示' : '完整讲解'
}

provide(lessonContextKey, {
  mode: readonly(mode),
  toggleMode,
})
```

### 注入方显式建立边界

```ts
const lessonContext = inject(lessonContextKey)

if (!lessonContext) {
  throw new Error('LessonConsumer 必须位于 LessonProvider 后代中')
}
```

这比在每个使用点写 `inject(key)!` 更清晰：缺少提供者是组件契约错误，应在注入边界立即失败。

## 易错使用提示

### 1. 为了少写一层 Props 就隐藏直接父子的公开输入

Provide / Inject 适合跨越不关心依赖的中间组件。如果直接父组件创建子组件并拥有其输入，Props 更能让
组件契约在模板中可见。

错误示范：

```ts
// 父子只有一层，却把子组件必需标题藏进上下文
provide('title', title)
```

正确示范：

```vue
<CourseCard :title="title" />
```

### 2. 使用字符串 key 并假定值一定存在、类型一定正确

字符串可能碰撞，也不能在提供方和注入方之间同步类型；找不到 key 时结果仍为 `undefined`。

错误示范：

```ts
const context = inject('lesson-context')
context.mode.value
```

正确示范：

```ts
const context = inject(lessonContextKey)
if (!context) throw new Error('缺少 LessonContext 提供者')
```

### 3. 提供普通值后期待后代自动响应变化

`provide()` 保存调用当下传入的值，不会替普通变量建立响应式连接。

错误示范：

```ts
let mode = '完整讲解'
provide(modeKey, mode)
mode = '关键提示'
```

正确示范：

```ts
const mode = ref('完整讲解')
provide(modeKey, readonly(mode))
mode.value = '关键提示'
```

### 4. 让任意注入方直接改共享 ref

注入到同一个 ref 并不代表每个后代都应该拥有写权限。修改入口分散会破坏业务约束。

错误示范：

```ts
provide(countKey, count)
inject(countKey)!.value += 1
```

正确示范：

```ts
provide(counterKey, {
  count: readonly(count),
  increment: () => count.value += 1,
})
```

### 5. 在同一组件 provide 后立即 inject 自己的值

`inject()` 从父链开始查找；当前组件刚提供的值只对后代可见。

错误示范：

```ts
provide(themeKey, 'dark')
const ownTheme = inject(themeKey)
```

正确示范：

```ts
const theme = ref('dark')
provide(themeKey, readonly(theme))

// 当前组件直接使用 theme，后代才调用 inject(themeKey)
```

### 6. 认为嵌套同 key 的值会自动合并

最近提供者会完整遮蔽远层同 key 值，不存在对象字段级合并。

错误示范：

```ts
// 祖先提供 { locale: 'zh-CN', density: 'comfortable' }
provide(settingsKey, { density: 'compact' })
// 后代错误期待 locale 仍来自祖先
```

正确示范：

```ts
const parent = inject(settingsKey)
if (!parent) throw new Error('缺少父级设置')

provide(settingsKey, {
  ...parent,
  density: 'compact',
})
```

只有业务确实需要继承字段时才显式组合；默认语义是 key 级覆盖。

### 7. 混淆函数默认值与默认值工厂

第二个参数是函数时，默认仍把函数本身作为注入值；第三个参数为 `true` 才会执行工厂。

错误示范：

```ts
const service = inject(serviceKey, () => new Service())
// service 是函数，不是 Service 实例
```

正确示范：

```ts
const service = inject(serviceKey, () => new Service(), true)
```

如果依赖类型本来就是函数，则不要传第三个参数。

### 8. 在模块作用域、事件回调或 await 后临时调用 inject

组件内注入必须在 setup 同步阶段完成。应先同步取得依赖，再在异步逻辑中使用已取得的值。

错误示范：

```ts
export const service = inject(serviceKey)

await loadData()
const lateService = inject(serviceKey)
```

正确示范：

```ts
const service = inject(serviceKey)

async function run() {
  await loadData()
  service?.refresh()
}
```

setup 外的库代码若需要应用级依赖，只能在明确的 `app.runWithContext()` 同步回调中读取。

## 源码推导

来源：[`vuejs/core` v3.5.40 `apiInject.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts)。

### 写时创建 provides 原型层

组件实例默认复用父级 `provides`。当前组件第一次调用 provide 时，Vue 才执行等价于：

```ts
if (parentProvides === provides) {
  provides = currentInstance.provides = Object.create(parentProvides)
}

provides[key] = value
```

由此可推导：

1. 没有提供新依赖的中间组件几乎不需要建立自己的依赖表。
2. 属性原型链天然实现向上查找与最近提供者覆盖。
3. 覆盖发生在整个 key 上，不会递归合并对象。
4. 同一个 Symbol 实例才是同一个 key；描述文字相同的两个 `Symbol('x')` 仍互不匹配。

### inject 从父级上下文起步

组件场景下，inject 读取父实例的 provides，而不是当前实例刚写入的 provides。这说明“组件同时读取祖先值，
再为后代提供同 key 局部覆盖”是有效模式；但它必须先把祖先值当作输入，再显式构造完整的局部契约。

### 默认工厂只在缺失时执行

源码先用 `key in provides` 判断是否命中，只有未命中且传入默认值时才处理默认值工厂。由此可推导：

- 默认工厂适合延迟创建可选服务或测试替身。
- 提供者显式提供 `undefined` 仍算 key 命中，不会回退到默认工厂。
- 工厂的创建次数属于每次 inject 调用，不是自动应用单例。

### 应用上下文不是异步上下文

inject 还会检查 `currentApp`，供 `app.runWithContext()` 使用。源码没有保存 Promise 链上下文，因此只能把
同步取得的依赖带入后续异步任务，不能在 await 后重新 inject。

## 高级使用场景

1. **组件库上下文：** 表单、Tabs、菜单由父容器提供注册表和状态，深层子项注入；公开 Props 仍保留
   每个子项自身输入。
2. **局部主题或语言覆盖：** 应用层提供默认值，某一子树用同 key 提供完整局部上下文，离开子树后
   自动回到祖先值。
3. **只读状态加领域命令：** 提供 `readonly` 状态和 `save()`、`select()` 等命令，把校验与修改入口留在
   依赖所有者。
4. **插件服务：** 插件通过 `app.provide()` 提供路由、遥测或客户端服务；组件消费方只依赖
   `InjectionKey` 契约。
5. **可选能力与测试替身：** 可选依赖使用默认工厂；组件测试可在挂载边界提供同 key 替身，而不修改
   组件内部实现。
6. **组合式函数封装注入边界：** `useLessonContext()` 同步 inject 并统一处理缺失错误，让叶子组件不重复
   非空检查。该函数复用的是读取契约，不改变依赖所有权。

## 唯一 Demo 规格

### 文件与公开 ID

```text
src/content/demos/vue/core/learn/intermediate/provide-inject/
├── dependency-scope-lab-demo.vue
├── dependency-context.ts
└── parts/
    ├── DependencyBranch.vue
    └── DependencyConsumer.vue
```

只有 `dependency-scope-lab-demo.vue` 位于公开 glob 深度，唯一公开 ID 为：

```text
vue.core.learn.intermediate.provide-inject.dependency-scope-lab-demo
```

`dependency-context.ts` 与 `parts/*` 不得注册为公开 Demo。

### 交互契约

根 Demo 提供完整上下文：

- `owner = 根课程区`
- `mode = 完整讲解`
- `revision = 0`
- `mode` 与 `revision` 以 readonly refs 提供
- `toggleMode()` 由根提供方修改状态并把 revision 加一

渲染两条分支：

1. **继承分支：** 中间组件不转发上下文，深层消费方解析到根课程区。
2. **局部覆盖分支：** 中间组件先读取祖先上下文，再为后代提供同 key 的完整局部上下文；初始
   `owner = 局部练习区`、`mode = 重点复习`、`revision = 0`。

两个消费方都注入同一个 `InjectionKey`，显示来源、模式、修订次数和可选依赖的默认工厂结果，并通过
注入命令请求各自提供方切换模式。

### 可复跑断言

1. 初始继承分支显示“根课程区 / 完整讲解 / 0”，局部分支显示“局部练习区 / 重点复习 / 0”。
2. 两条分支都显示可选依赖默认值“使用本地默认提示”。
3. 点击根级控制：继承分支变为“关键提示 / 1”，局部分支保持不变。
4. 点击继承分支命令：根级与继承分支回到“完整讲解 / 2”，局部分支保持不变。
5. 点击局部分支命令：局部分支变为“自由探索 / 1”，根级保持不变。
6. 再点击根级控制：继承分支变为“关键提示 / 3”，局部分支仍为“自由探索 / 1”。
7. 控制台无 warning/error，唯一 Demo 正常解析，不出现 missing 占位。
8. 390px 下两分支纵向排列，无横向滚动；按钮至少 44px 高。
9. 200% 文本大小下标题、状态和值可换行，不溢出或遮挡。

### 样式约束

- 只使用 flex、margin 和 padding 组织布局，不使用 CSS `grid` 或 `gap`。
- 外层实验区不创建装饰卡片；两条并列分支可作为同级重复卡片。
- 不使用远程资源、随机值、时间戳、网络请求或动画计数。
- 不修改全局 token，不新增图标依赖。

## 课程 metadata

```ts
{
  id: 'vue.core.learn.intermediate.provide-inject',
  type: 'lesson',
  title: '依赖注入',
  summary: '用类型安全的 Provide / Inject 在组件子树中共享只读状态与修改命令',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.composables'],
  related: [
    'vue.core.learn.intermediate.composables',
    'vue.core.learn.basics.props',
    'vue.core.reference.composition.provide-inject',
    'vue.core.reference.reactivity.readonly',
    'vue.core.reference.application.create-app',
  ],
  tags: ['Provide', 'Inject', 'InjectionKey', '依赖注入', 'readonly', '组件上下文'],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 50,
}
```

sources 至少包含：

1. Vue 依赖注入指南。
2. Vue 组合式 API：依赖注入。
3. Vue TypeScript 组合式 API 指南。
4. Vue 应用实例 API。
5. `vuejs/core` v3.5.40 `apiInject.ts`。

## 接入与验收

### 红灯接缝

先修改现有最小接缝并确认失败：

- `src/content/catalog/vue-core-track.spec.ts`
  - 中级顺序新增第 18 课。
  - 总数从 17 变为 18。
  - prerequisite 与 related 必须等于冻结值。
- `src/content/interactive/registry.spec.ts`
  - 中级公开 Demo 列表新增唯一 ID。
  - `parts.DependencyBranch`、`parts.DependencyConsumer` 与 `dependency-context` 均不得公开。

红灯只能来自课程缺失与 Demo 未注册，不能由无关失败造成。

### 实现与接入

- 新增课程正文和唯一 Demo。
- manifest 将课程从 planned 改为 available，不保留 title/summary 兜底字段。
- 进度长路径从“组合式函数”进入“依赖注入”，执行冻结交互序列。
- 实施计划更新为 `18 available / 42 planned` 和 Gate 6 前十六批。
- “过渡效果”及后续课程保持 planned。

### 最终验证

- focused Vitest 红绿一致。
- 全量 Vitest、type-check、lint、format:check、build、`git diff --check` 全部通过。
- 新文件不存在 CSS `grid`、`gap`、`row-gap`、`column-gap`。
- 使用用户现有 `localhost:5173` 服务完成 390px 长路径，不启动第二个服务。
- Standards / Spec 双轴复审为 PASS / 0 finding。

## 明确排除

- 不修改现有 Provide / Inject Reference 或 Reference Demo。
- 不进入过渡效果、动态组件、KeepAlive、Teleport、Suspense。
- 不实现插件安装流程、完整 `app.runWithContext()` Demo 或 SSR 应用工厂。
- 不引入 Pinia、事件总线、全局单例或第三方依赖注入容器。
- 不新增第二个 Demo、原理动画、全局样式或兼容路由。
