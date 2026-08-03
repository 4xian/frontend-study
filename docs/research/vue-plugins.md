# Vue Core 高级课程：插件调研

> 查证日期：2026-08-01  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文插件、应用实例、应用创建、组件注册、自定义指令与 TypeScript
> 文档，`vuejs/docs` 官方 Markdown，以及 `vuejs/core@v3.5.40` 固定标签源码和官方测试。
> 外部资料只通过 Tavily 定位和提取；博客、问答、issue、Vue 2 文档、`main` 分支运行时实现和
> 现有课程正文不作为技术结论依据。

## 已冻结实施契约

| 项目 | 冻结值 |
| --- | --- |
| 批次 | Vue Core 第二十四批 |
| 课程 ID | `vue.core.learn.advanced.plugins` |
| 标题 | 插件 |
| 阶段 / 分类 | `advanced` / `extension-and-rendering` |
| 唯一直接前置 | `vue.core.learn.advanced.render-functions-vnodes` |
| manifest 位置 | “渲染函数与虚拟节点”之后；下一分类“性能与服务端渲染”之前 |
| 唯一公开 Demo ID | `vue.core.learn.advanced.plugins.plugin-installation-scope-lab-demo` |
| Demo 标题 | 同一插件，每个应用各安装一次 |
| 易错点 | 恰好 8 个，每项含错误与正确示范 |
| 源码推导 | 恰好 8 个，严格绑定 Vue 3.5.40 |
| 预计时长 | 65 分钟 |
| 实施前总量 | Vue 三条学习路线 `25 available / 35 planned` |
| 实施后总量 | Vue 三条学习路线 `26 available / 34 planned` |
| 后续课程 | `vue.core.learn.advanced.performance` 继续保持 `planned` |

本课对应 manifest 已有的 `vue.core.learn.advanced.plugins`，不是新增另一篇同名课程。上一课已经
解释渲染函数与 VNode，本课不继续下探 renderer；本课把视角提升到应用实例，回答三个问题：

1. 什么能力值得成为插件，什么能力应继续留在组件、组合式函数或局部指令中。
2. `app.use()` 如何识别对象插件与函数插件、传入 options，并按插件身份执行安装协议。
3. 插件如何通过应用级 Provide / Inject 暴露服务，并在多应用页面中保持隔离和可清理。

来源：[Vue 插件指南](https://cn.vuejs.org/guide/reusability/plugins.html)、
[应用实例 API：`app.use()`](https://cn.vuejs.org/api/application.html#app-use)、
[创建一个 Vue 应用：多个应用实例](https://cn.vuejs.org/guide/essentials/application.html#multiple-application-instances)。

## 一手来源

### 公开文档契约

- [Vue 中文插件指南](https://cn.vuejs.org/guide/reusability/plugins.html)：插件的两种形状、安装参数、
  `app.component()`、`app.directive()`、`app.provide()` 与 `app.config.globalProperties` 的常见用途。
- [Vue 中文应用实例 API](https://cn.vuejs.org/api/application.html)：`app.use()` 的安装与去重语义、
  `app.provide()`、`app.component()`、`app.directive()`、`app.onUnmount()` 和全局属性的公开签名。
- [Vue 中文创建应用指南](https://cn.vuejs.org/guide/essentials/application.html)：应用配置应在
  `mount()` 前完成，以及多个应用实例各自拥有配置和全局资源作用域。
- [Vue 中文组件注册指南](https://cn.vuejs.org/guide/components/registration.html#local-registration)：
  全局组件对产物移除和依赖可见性的代价，局部注册的默认边界。
- [Vue 中文自定义指令指南](https://cn.vuejs.org/guide/reusability/custom-directives.html#introduction)：
  指令只负责普通元素的底层 DOM 访问逻辑，组件和组合式函数仍有各自职责。
- [Vue 中文 TypeScript：Provide / Inject](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)：
  `InjectionKey<T>` 同步提供端与消费端的类型。
- [Vue 中文 TypeScript：扩展全局属性](https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)：
  `ComponentCustomProperties` 模块扩展及声明文件接入要求。
- [`vuejs/docs` 插件指南 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/reusability/plugins.md)：
  官网英文原始 Markdown，用于交叉核对插件形状和四类常见用途。
- [`vuejs/docs` 应用 API Markdown](https://github.com/vuejs/docs/blob/main/src/api/application.md)：
  官网英文原始 Markdown，用于交叉核对应用方法的公开签名与返回值。

### Vue 3.5.40 固定源码与官方测试

- [`apiCreateApp.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)：
  `Plugin` 类型、应用上下文、`app.use()` 去重与分派、资源注册、应用级 provide 和卸载清理。
- [`apiCreateApp.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts)：
  函数插件、对象插件、options 透传、重复安装警告与注入结果的官方回归测试。
- [`apiInject.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts)：
  根组件如何回退到应用上下文中的 provides，以及后代的原型链查找。
- [`apiInject.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiInject.spec.ts)：
  应用级 provide、组件级覆盖、默认值和注入上下文的官方回归测试。
- [`componentPublicInstance.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentPublicInstance.ts)：
  组件公开实例读取 `globalProperties` 的顺序与局部同名属性优先级。
- [`componentPublicInstance.spec.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentPublicInstance.spec.ts)：
  全局属性可见、局部覆盖且不改写应用全局值的官方回归测试。

公开文档与源码事实必须分层表达。`installedPlugins`、内部 `WeakSet`、应用 context 对象、
`provides` 原型链和公开实例代理的属性查找顺序是 Vue 3.5.40 的实现证据，不是业务代码可导入的
公共 API。课程只能通过稳定结果观察它们，不能读取 `app._context`、组件内部实例或其他下划线字段。

## 从基础到高级的教学顺序

正文固定按以下 10 段推进，不按 API 名称堆砌：

1. **定位：** 插件是应用级安装协议，不是所有复用逻辑的默认容器。
2. **安装入口：** `app.use(plugin, ...options)` 在 `mount()` 前完成应用配置。
3. **两种形状：** 对象插件提供 `install()`；函数插件本身就是 install function。
4. **类型与 options：** 用 `Plugin<[Options]>` 固定安装参数，并把 options 当作当前应用的安装输入。
5. **首选暴露面：** 用 `app.provide()` 和 `InjectionKey<T>` 给 Composition API 消费者提供显式服务。
6. **其他暴露面：** 全局属性、组件与指令只用于真正遍布应用的能力，并分别承担明确职责。
7. **幂等：** 同一插件身份在同一应用只安装一次；去重不按名称、源码或 options 内容判断。
8. **多应用：** 同一插件身份可在不同应用各安装一次，每个应用拥有自己的配置与资源作用域。
9. **生命周期：** 插件创建的应用级副作用用 `app.onUnmount()` 登记清理。
10. **源码模型：** 用 v3.5.40 的分派、context、provide 回退和公开实例查找解释可观察结果。

来源：[Vue 插件指南](https://cn.vuejs.org/guide/reusability/plugins.html)、
[应用实例 API](https://cn.vuejs.org/api/application.html)、
[创建一个 Vue 应用](https://cn.vuejs.org/guide/essentials/application.html)、
[`apiCreateApp.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

## 必须准确覆盖的公开语义

### 1. 插件是应用级能力的安装协议

Vue 没有限制插件只能完成一种工作。官方列出的常见用途是：注册全局组件或指令、提供可注入资源、
添加组件全局属性，或把这些能力组合成一个库。这个开放范围不等于所有复用逻辑都应成为插件：

- 单个组件的视图与交互仍由组件负责。
- 可复用的有状态逻辑优先使用组合式函数。
- 必须直接操作普通元素 DOM 的复用逻辑才考虑自定义指令。
- 需要在应用启动时统一安装、且被多处消费的能力才进入插件。

来源：[Vue 插件指南：介绍](https://cn.vuejs.org/guide/reusability/plugins.html#introduction)、
[Vue 自定义指令：介绍](https://cn.vuejs.org/guide/reusability/custom-directives.html#introduction)。

### 2. `app.use()` 接受对象插件或函数插件

公开协议可以简化为：

```ts
interface App {
  use(plugin: Plugin, ...options: unknown[]): this
}

type ObjectPlugin = {
  install(app: App, ...options: unknown[]): unknown
}

type FunctionPlugin = (app: App, ...options: unknown[]) => unknown
```

对象插件由 `install()` 承担安装；函数插件本身承担相同职责。两者的第一个参数都是当前应用实例，
其余参数来自 `app.use()`。`app.use()` 返回同一个应用实例，因此可以继续链式配置；课程示例仍采用
逐行调用，优先展示清楚的安装顺序。

来源：[应用实例 API：`app.use()`](https://cn.vuejs.org/api/application.html#app-use)、
[`Plugin` 类型 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 3. 对象插件适合命名安装能力，函数插件适合单一窄安装动作

两种形状没有运行结果上的等级差异。课程冻结以下选择规则：

- 需要清晰导出一个“插件对象”、未来还要附带库级类型或其他静态导出时，用对象插件。
- 安装逻辑只有一个窄动作且函数名已经能表达意图时，用函数插件。
- 不为展示两种语法而把一个插件同时导出两套身份；消费者只应选择一个稳定导出。

```ts
import type { App, Plugin } from 'vue'

interface LessonPluginOptions {
  label: string
}

const objectPlugin: Plugin<[LessonPluginOptions]> = {
  /** 为当前应用安装课程服务。 */
  install(app, options) {
    app.provide(lessonServiceKey, { label: options.label })
  },
}

/** 为当前应用安装同一份窄能力。 */
const functionPlugin: Plugin<[LessonPluginOptions]> = (app, options) => {
  app.provide(lessonServiceKey, { label: options.label })
}
```

来源：[Vue 插件指南：插件的两种形状](https://cn.vuejs.org/guide/reusability/plugins.html#introduction)、
[`Plugin` 类型 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 4. options 是安装参数，不是全局单例

Vue 将 `app.use(plugin, ...options)` 的尾随参数原样交给安装函数。课程的正式代码只传一个具名 options
对象，避免位置参数失去含义，并用 `Plugin<[LessonPluginOptions]>` 让调用方获得静态约束。

```ts
interface LessonPluginOptions {
  label: string
}

app.use(lessonPlugin, { label: '课程应用 A' })
```

options 属于这次、这个应用的安装输入。插件若要允许运行期修改，应明确提供响应式服务或命令；不能
因为安装时收到普通对象，就宣称其字段会自动成为响应式配置。

来源：[Vue 插件指南：传递选项](https://cn.vuejs.org/guide/reusability/plugins.html#writing-a-plugin)、
[`app.use()` options 透传 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)、
[`apiCreateApp.spec.ts` 的 options 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts)。

### 5. 应用级服务首选 Provide / Inject

插件可通过 `app.provide()` 让根组件及所有后代注入服务。TypeScript 项目使用导出的
`InjectionKey<T>`，使提供端与消费端共享同一类型契约；消费组合式函数还应统一处理缺失 provider，
避免每个组件重复非空断言。

```ts
import { inject } from 'vue'
import type { InjectionKey } from 'vue'

interface LessonService {
  label: string
}

export const lessonServiceKey = Symbol('lesson-service') as InjectionKey<LessonService>

/** 获取已经由插件安装的课程服务。 */
export function useLessonService(): LessonService {
  const service = inject(lessonServiceKey)
  if (!service) throw new Error('Lesson plugin is not installed')
  return service
}
```

这里的显式错误是公开消费契约的一部分，不是泛化的防御代码。插件未安装时，继续运行会让课程服务
没有语义；集中失败比散落的 `!` 更清楚。

来源：[Vue 插件指南：插件中的 Provide / Inject](https://cn.vuejs.org/guide/reusability/plugins.html#provide-inject-with-plugins)、
[TypeScript：为 Provide / Inject 标注类型](https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)、
[`apiInject.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts)。

### 6. 全局属性、组件与指令各有严格边界

| 暴露面 | 适合用途 | 默认边界 |
| --- | --- | --- |
| `app.provide()` | Composition API 可显式注入的服务、客户端或配置 | 本课首选，使用 `InjectionKey<T>` |
| `app.config.globalProperties` | 模板或 Options API 中真正普遍的 `$name` 能力 | 谨慎使用，并补 `ComponentCustomProperties` 类型扩展 |
| `app.component()` | 插件套件中几乎处处可用的少量公共组件 | 普通业务组件保持局部导入 |
| `app.directive()` | 套件提供、且必须直接操作普通 DOM 元素的行为 | 能由组件或模板表达时不注册全局指令 |

全局属性与组件自己的同名属性冲突时，组件自己的属性优先。全局组件即使没有实际使用也不利于从
生产产物中移除，并会隐藏组件依赖；因此插件不能把整个组件目录批量注册成默认行为。

来源：[应用实例 API：全局属性](https://cn.vuejs.org/api/application.html#app-config-globalproperties)、
[TypeScript：扩展全局属性](https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)、
[Vue 组件注册：全局注册的代价](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[Vue 自定义指令：使用时机](https://cn.vuejs.org/guide/reusability/custom-directives.html#when-to-use-custom-directives)。

### 7. 幂等按“同一应用中的同一插件身份”判断

官方保证：同一应用对同一个插件多次调用 `app.use()`，插件只安装一次。这里的“同一个”在
Vue 3.5.40 中是对象或函数身份，不比较插件名、代码内容或 options。

```ts
const plugin = createLessonPlugin()

app.use(plugin, { label: '第一次' })
app.use(plugin, { label: '第二次不会重新安装' })
```

第二次 options 不会更新第一次安装结果。若需要运行期变更，服务本身必须公开明确的更新命令，
不能把重复 `use()` 当作重新配置 API。

来源：[应用实例 API：重复使用只安装一次](https://cn.vuejs.org/api/application.html#app-use)、
[`installedPlugins` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)、
[`apiCreateApp.spec.ts` 重复安装测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts)。

### 8. 多个应用实例各自拥有安装与资源作用域

`createApp()` 允许同一页面存在多个应用，每个应用各自拥有配置和全局资源作用域。因此同一个插件
身份在应用 A 安装一次、在应用 B 也安装一次；A 的 options、provide、全局属性、组件和指令注册
不会自动进入 B。

```ts
const plugin = createLessonPlugin()
const appA = createApp(RootA)
const appB = createApp(RootB)

appA.use(plugin, { label: '应用 A' })
appA.use(plugin, { label: '这次被去重' })
appB.use(plugin, { label: '应用 B' })
```

可观察结果是安装函数总共执行两次：A 一次、B 一次。这不等于插件模块内任意可变变量都会自动
隔离；插件作者必须把每个应用的可变服务放进当次 install 创建的对象，再通过该 app 暴露。

来源：[创建一个 Vue 应用：多个应用实例](https://cn.vuejs.org/guide/essentials/application.html#multiple-application-instances)、
[`createAppContext()` 与 `installedPlugins` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 9. 安装应在 `mount()` 前完成

Vue 官方要求在应用配置和资源注册完成后再调用 `mount()`。插件可能注册组件、指令、provide 或
全局属性，所以标准启动顺序固定为：创建应用、安装插件、完成其他配置、最后挂载。

```ts
const app = createApp(App)

app.use(lessonPlugin, { label: '课程中心' })
app.mount('#app')
```

课程不演示挂载后安装，也不承诺挂载后已有组件会重新获得插件能力。

来源：[创建一个 Vue 应用：挂载应用](https://cn.vuejs.org/guide/essentials/application.html#mounting-the-app)。

### 10. 应用级副作用必须登记卸载清理

插件若添加窗口监听器、订阅或其他应用级副作用，应在 install 中调用 `app.onUnmount()` 登记清理。
这与组件的 `onUnmounted()` 分工不同：前者跟随整个应用实例，后者跟随某个组件实例。

```ts
const resizePlugin: Plugin = {
  /** 为当前应用安装并登记窗口监听。 */
  install(app) {
    /** 通知服务当前视口发生变化。 */
    const handleResize = () => resizeService.refresh()

    window.addEventListener('resize', handleResize)
    app.onUnmount(() => window.removeEventListener('resize', handleResize))
  },
}
```

来源：[应用实例 API：`app.onUnmount()`](https://cn.vuejs.org/api/application.html#app-onunmount)、
[`pluginCleanupFns` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

## 高质量易错点：恰好 8 个

### 1. 绕过 `app.use()` 直接调用 `install()`

**错误示范：** 直接调用跳过应用的插件去重协议，也把调用方绑死在对象插件形状上。

```ts
lessonPlugin.install(app, { label: '课程中心' })
lessonPlugin.install(app, { label: '重复安装' })
```

**正确示范：** 始终让应用实例执行安装协议。

```ts
app.use(lessonPlugin, { label: '课程中心' })
app.use(lessonPlugin, { label: '会按身份去重' })
```

**可观察后果：** 正确路径中，同一插件身份在同一应用的 install 只执行一次。

来源：[应用实例 API：`app.use()`](https://cn.vuejs.org/api/application.html#app-use)、
[`app.use()` 分派与去重 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 2. 把新的工厂返回值误认为“同一个插件”

**错误示范：** 每次调用工厂都会产生新对象身份，因此两次都会安装。

```ts
app.use(createLessonPlugin(), { label: '课程中心' })
app.use(createLessonPlugin(), { label: '课程中心' })
```

**正确示范：** 保存一个稳定插件身份并复用。

```ts
const lessonPlugin = createLessonPlugin()

app.use(lessonPlugin, { label: '课程中心' })
app.use(lessonPlugin, { label: '这次会被去重' })
```

**可观察后果：** 错误路径执行两次 install；正确路径只执行一次。

来源：[`installedPlugins` 的身份集合 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 3. 用重复 `app.use()` 更新 options

**错误示范：** 第二次 options 不会进入已安装插件。

```ts
app.use(lessonPlugin, { label: '课程 A' })
app.use(lessonPlugin, { label: '课程 B' })
```

**正确示范：** 首次安装传入初始配置；需要运行期变化时，调用服务的明确命令。

```ts
const app = createApp(App)

app.use(lessonPlugin, { label: '课程 B' })
app.mount('#app')
```

**可观察后果：** 错误路径仍保留第一次安装值；正确路径在首次安装前确定最终安装配置。若需求确实是
运行期更新，插件必须另行定义并实现服务命令，本课不把重复 `use()` 伪装成更新接口。

来源：[应用实例 API：重复使用只安装一次](https://cn.vuejs.org/api/application.html#app-use)、
[创建一个 Vue 应用：挂载顺序](https://cn.vuejs.org/guide/essentials/application.html#mounting-the-app)。

### 4. 把模块级可变服务共享给所有应用

**错误示范：** 两个应用注入同一个可变对象，A 的修改会泄漏到 B。

```ts
const sharedService = reactive({ label: '' })

const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 安装共享的模块级服务。 */
  install(app, options) {
    sharedService.label = options.label
    app.provide(lessonServiceKey, sharedService)
  },
}
```

**正确示范：** 每次 install 为当前应用创建服务。

```ts
const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 为当前应用创建并提供独立服务。 */
  install(app, options) {
    const service = reactive({ label: options.label })
    app.provide(lessonServiceKey, service)
  },
}
```

**可观察后果：** 正确路径中，应用 A 与 B 可以显示不同 label，修改一方不影响另一方。

来源：[创建一个 Vue 应用：多个应用实例](https://cn.vuejs.org/guide/essentials/application.html#multiple-application-instances)、
[`createAppContext()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 5. 在 `<script setup>` 里把全局属性当作词法变量

**错误示范：** `globalProperties` 不会向模块作用域声明一个 TypeScript 变量。

```ts
const title = $translate('lesson.title')
```

**正确示范：** Composition API 通过类型化注入显式取得服务。

```ts
const translation = useTranslation()
const title = translation.translate('lesson.title')
```

若库确实为模板或 Options API 暴露 `$translate`，还必须扩展 `ComponentCustomProperties`；该类型扩展
不能代替运行时安装，运行时安装也不能代替类型声明。

**可观察后果：** 正确路径有明确 import、安装缺失错误和静态类型，不依赖隐式组件代理上下文。

来源：[Vue 插件指南：全局属性](https://cn.vuejs.org/guide/reusability/plugins.html#writing-a-plugin)、
[TypeScript：扩展全局属性](https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)。

### 6. 把插件目录中的全部组件和行为注册为全局资源

**错误示范：** 批量扫描并全局注册所有组件和指令，隐藏实际依赖并扩大产物。

```ts
for (const [name, component] of Object.entries(allComponents)) {
  app.component(name, component)
}
```

**正确示范：** 只注册插件契约中真正普遍的一个资源，其余继续局部导入。

```ts
const lessonPlugin: Plugin = {
  /** 只注册插件承诺全局可用的状态标记。 */
  install(app) {
    app.component('LessonStatusBadge', LessonStatusBadge)
  },
}
```

全局指令同理，并且只应用于必须直接操作普通 DOM 元素的逻辑。

**可观察后果：** 正确路径的公开全局名称更少，使用方仍能从 import 看出大部分依赖。

来源：[Vue 组件注册：全局注册的代价](https://cn.vuejs.org/guide/components/registration.html#local-registration)、
[Vue 自定义指令：使用时机](https://cn.vuejs.org/guide/reusability/custom-directives.html#when-to-use-custom-directives)。

### 7. 在挂载后才安装插件

**错误示范：** 根组件已经开始创建后才补应用资源。

```ts
const app = createApp(App)
app.mount('#app')
app.use(lessonPlugin, { label: '太晚安装' })
```

**正确示范：** 所有应用配置和资源注册完成后再挂载。

```ts
const app = createApp(App)
app.use(lessonPlugin, { label: '课程中心' })
app.mount('#app')
```

**可观察后果：** 正确路径让根组件首次 setup 时就能 inject 服务，并让首次模板解析看到全局资源。

来源：[创建一个 Vue 应用：挂载顺序](https://cn.vuejs.org/guide/essentials/application.html#mounting-the-app)。

### 8. 安装应用级副作用却不清理

**错误示范：** 应用卸载后窗口监听器仍保留。

```ts
const resizePlugin: Plugin = {
  /** 安装一个不会释放的监听器。 */
  install() {
    window.addEventListener('resize', resizeService.refresh)
  },
}
```

**正确示范：** 用同一个函数身份注册和移除，并跟随应用卸载。

```ts
const resizePlugin: Plugin = {
  /** 安装并登记应用级清理。 */
  install(app) {
    /** 刷新视口服务。 */
    const handleResize = () => resizeService.refresh()

    window.addEventListener('resize', handleResize)
    app.onUnmount(() => window.removeEventListener('resize', handleResize))
  },
}
```

**可观察后果：** 正确路径每个已安装应用在 `app.unmount()` 时各清理一次。

来源：[应用实例 API：`app.onUnmount()`](https://cn.vuejs.org/api/application.html#app-onunmount)、
[`pluginCleanupFns` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

## Vue 3.5.40 源码推导：恰好 8 个

以下结论只解释 Vue 3.5.40；业务代码不得读取对应内部字段。

### 1. `Plugin` 是对象安装器与函数安装器的联合类型

`apiCreateApp.ts` 将对象插件定义为具有 `install` 的对象，将函数插件定义为安装函数，并用泛型
options 保留尾随参数类型。`Plugin<[LessonPluginOptions]>` 因而能把 `app.use()` 与 install 两端约束
为同一 options tuple。

**适用场景：** 发布 TypeScript 插件或编写课程 Demo 时，用类型约束阻止漏传、错传安装参数。

来源：[`Plugin` 类型 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 2. `app.use()` 先看对象的 `install`，再看插件本身是否为函数

固定实现先判断 `plugin.install` 是否为函数；不满足时才把 plugin 本身作为函数调用。合法分支都收到
当前 app 和全部尾随 options，非法形状只在开发环境发出警告。

**适用场景：** 诊断“插件没有安装”时，先核对默认导出是否真的是函数或含函数型 `install` 的对象，
不要从组件注入端倒推猜测。

来源：[`app.use()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)、
[`apiCreateApp.spec.ts` 的 use 测试](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts)。

### 3. 幂等集合按对象或函数身份记录，不读取 options

每个 app 内部持有 `WeakSet`；命中已有 plugin 时不再调用安装函数。集合不读取名称、options 或插件
内部字段，因此相同源码产生的新对象会再次安装，同一身份的新 options 则被忽略。

**适用场景：** 插件工厂、热重载外壳或测试装配出现重复副作用时，先检查传给 `use()` 的引用是否稳定。

来源：[`installedPlugins` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 4. 安装身份在执行 install 前就进入集合

固定实现先 `installedPlugins.add(plugin)`，随后调用对象的 `install()` 或函数插件。如果安装函数抛错，
同一 app 再用同一插件身份调用 `use()` 仍会被视为已经应用。这是版本绑定的实现推导，不是公开的
重试 API。

**适用场景：** 安装逻辑先同步校验必需 options，再以最小步骤注册能力；不要把“捕获后再次 use 同一
插件”设计成恢复策略。需要重建时，由应用工厂创建新的 app，并由调用方明确处理原失败实例。

来源：[`app.use()` 的 add 与调用顺序 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

### 5. 每次 `createApp()` 都建立独立 context 与去重集合

`createApp()` 内部创建新的 app context 和 `installedPlugins`。context 初始化各自的
`globalProperties`、components、directives 与 provides，因此同一个插件身份可在两个 app 各安装一次，
注册结果也按 app 隔离。

**适用场景：** 微前端、小部件页、测试隔离或同页多个 Vue 根节点中，为每个 app 传入自己的 options，
不要依赖模块级可变单例承载应用状态。

来源：[`createAppContext()` 与 `createAppAPI()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)、
[创建一个 Vue 应用：多个应用实例](https://cn.vuejs.org/guide/essentials/application.html#multiple-application-instances)。

### 6. 根组件注入会回退到应用级 provides

`apiInject.ts` 对根组件使用 vnode 的 app context provides；后代组件则从父级 provides 查找。组件
自己 provide 时，固定实现以父 provides 为原型创建新对象，所以更近的同 key provider 可以覆盖
祖先或应用级值，而不改写原提供者。

**适用场景：** 插件提供应用默认服务，某个测试或局部子树用同一 `InjectionKey` 提供替身或局部实现。

来源：[`apiInject.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts)、
[`apiInject.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiInject.spec.ts)。

### 7. 全局属性是公开实例查找链的后备项

`componentPublicInstance.ts` 先检查 setup state、data、props、ctx 和公开属性等来源，再回退到当前 app
context 的 `globalProperties`。这解释了官方“组件自己的同名属性优先”的公开结果。

**适用场景：** 诊断模板中 `$service` 被局部同名值遮蔽时，检查组件公开上下文；不要修改运行时代理
或读取内部 access cache。

来源：[应用实例 API：全局属性冲突](https://cn.vuejs.org/api/application.html#app-config-globalproperties)、
[`componentPublicInstance.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentPublicInstance.ts)、
[`componentPublicInstance.spec.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/componentPublicInstance.spec.ts)。

### 8. `app.onUnmount()` 的回调列表属于当前应用

每次 createApp 都创建自己的 cleanup function 列表；`app.onUnmount()` 向该列表登记回调，
`app.unmount()` 通过 Vue 错误处理通道调用它们。应用 A 卸载不会执行应用 B 的回调。

**适用场景：** 插件持有窗口监听、订阅、观察器或客户端连接时，按安装应用登记清理，并在多应用
测试中分别断言清理次数。

来源：[应用实例 API：`app.onUnmount()`](https://cn.vuejs.org/api/application.html#app-onunmount)、
[`pluginCleanupFns` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts)。

## 可验证学习目标

完成本课后，学习者必须能够：

1. 判断一个需求应由插件、组件、组合式函数还是自定义指令承担。
2. 写出类型化对象插件，并解释函数插件与对象插件共享的 install 协议。
3. 用 `app.use(plugin, options)` 在 `mount()` 前完成安装。
4. 用 `InjectionKey<T>`、`app.provide()` 和消费组合式函数公开应用服务。
5. 说明全局属性、全局组件和全局指令各自的适用边界与代价。
6. 预测同一插件身份重复用于一个 app 与用于两个 app 时的安装次数。
7. 识别模块级可变服务造成的跨应用污染，并改为每次 install 创建服务。
8. 用 `app.onUnmount()` 清理插件建立的应用级副作用。

## 唯一 Demo 待实现规格

### 唯一公开 Demo

| 字段 | 冻结值 |
| --- | --- |
| Demo ID | `vue.core.learn.advanced.plugins.plugin-installation-scope-lab-demo` |
| 文件 | `src/content/demos/vue/core/learn/advanced/plugins/plugin-installation-scope-lab-demo.vue` |
| 根 class | `.plugin-installation-scope-lab-demo` |
| 模式 | 对象插件 / 函数插件，使用语义明确的分段控件 |
| 子应用 | 同一 SFC 内创建应用 A 与应用 B，各挂载到独立 host ref |
| 主命题 | A 重复 use 同一身份仍安装一次；同一身份在 B 再安装一次；options 和清理均按应用隔离 |

Demo 是一项真实 `createApp()` / `app.use()` 实验，不模拟安装计数。主页面中的 Demo 组件只负责创建
和释放两个嵌套子应用；子应用不访问主应用的内部 context。

### 固定类型与插件形状

```ts
interface LessonPluginOptions {
  appId: 'app-a' | 'app-b'
  label: string
  onInstall: (appId: LessonPluginOptions['appId']) => void
  onCleanup: (appId: LessonPluginOptions['appId']) => void
}

interface LessonService {
  appId: LessonPluginOptions['appId']
  label: string
}

const lessonServiceKey = Symbol('lesson-service') as InjectionKey<LessonService>
```

对象模式创建恰好一个对象插件身份，函数模式创建恰好一个函数插件身份。两种 install 实现都只做
三件事：调用 `onInstall(appId)`、`app.provide(lessonServiceKey, { appId, label })`、通过
`app.onUnmount()` 调用 `onCleanup(appId)`。不得加入全局属性、全局组件或指令，以免唯一 Demo 同时
承担四种暴露面。

### 固定初始状态

- 默认选中“对象插件”。
- 应用 A options 固定为 `{ appId: 'app-a', label: '课程应用 A' }`。
- 应用 B options 固定为 `{ appId: 'app-b', label: '课程应用 B' }`。
- 尚未创建子应用，A / B host 均显示“未运行”。
- 安装次数固定显示 `A 0 / B 0 / 总计 0`，清理次数显示 `A 0 / B 0`。
- 只有“运行安装实验”可用；“卸载两个应用”初始禁用。
- 不自动运行、不自动聚焦，不读取网络、存储、时间、随机值或环境信息。

### 固定交互

1. 学习者保留“对象插件”，用键盘触发“运行安装实验”。
2. Demo 创建一个稳定 plugin 对象，再依次创建 app A 与 app B。
3. app A 在挂载前对同一 plugin 身份调用两次 `use()`；两次都传 A options。
4. app B 在挂载前对同一 plugin 身份调用一次 `use()`；传 B options。
5. 两个子应用分别 inject 服务并显示“课程应用 A / app-a”和“课程应用 B / app-b”。
6. 汇总显示 `A 安装 1 次，B 安装 1 次，总计 2 次`，并明确 A 的第二次 use 已去重。
7. 学习者触发“卸载两个应用”，两个 app 各执行一次 cleanup；host 恢复“已卸载”。
8. 学习者切换到“函数插件”并再次运行；结果仍为每个 app 安装一次、总计两次。

重新运行前必须先卸载仍存活的子应用，再清零当前轮次计数。切换插件模式时若子应用仍存活，也先
卸载并回到未运行状态；不得让上一轮清理计数混入下一轮。

### 稳定公开契约

- Demo 根：`.plugin-installation-scope-lab-demo`。
- 模式组：`data-testid="plugin-kind"`，两个原生 button 分别为“对象插件”“函数插件”，使用
  `aria-pressed` 表示当前值。
- 运行按钮：`data-testid="run-installation"`。
- 卸载按钮：`data-testid="unmount-apps"`。
- 应用 A host：`data-testid="plugin-app-a-host"`。
- 应用 B host：`data-testid="plugin-app-b-host"`。
- 每个子应用根：`data-testid="plugin-consumer"`，并带 `data-app-id="app-a|app-b"`。
- 安装汇总：`data-testid="installation-summary"`，使用 `role="status"` 与 `aria-live="polite"`。
- 清理汇总：`data-testid="cleanup-summary"`，使用 `role="status"` 与 `aria-live="polite"`。
- 去重说明：`data-testid="dedupe-result"`。

### 实现约束

- 恰好一个公开 Demo ID；插件、两个子应用 root 和 `InjectionKey` 都定义在同一 SFC。
- 所有新增方法定义上方写规范、简洁的中文注释。
- 真实调用 `createApp()`、同一 app 的重复 `use()`、跨 app 的同一插件身份和 `app.unmount()`。
- 对象 / 函数模式各创建一个稳定身份；单轮运行中不得为 A、B 分别创建 plugin。
- 子应用必须通过 `inject(lessonServiceKey)` 读取 label，不从父 Demo props 直接回显 options。
- `onBeforeUnmount()` 必须释放仍存活的两个子应用，避免离开课程后遗留应用资源。
- 不读取 `app._context`、组件 uid、内部实例、WeakSet 或任何下划线字段。
- 不把开发环境重复安装 warning 当作唯一断言；页面可观察计数才是 Demo 契约。
- 不注册全局组件、指令或全局属性，不访问主应用 registry、router 或 Pinia。
- 布局只使用 flex，间距由 margin 与 padding 管理；不新增全局样式或样式 token。
- 390px 与 200% 文本下允许自然换行，不截断、不重叠、不产生横向滚动。
- 所有按钮双轴至少 44px，键盘焦点清晰；模式按钮尺寸固定，状态变化不推动布局跳动。
- Demo 不需要动画，不添加 transition、animation 或 transform；reduced motion 下结果不变。

### 最小 E2E 契约

只新增一条长路径测试，不拆分相似用例：

1. 从“渲染函数与虚拟节点”点击“下一篇：插件”，确认 URL、标题、上一篇链接；插件没有下一篇，
   因为 `performance` 仍为 planned。
2. 断言页面恰好一个 `.plugin-installation-scope-lab-demo`，唯一 Demo 已解析，且没有
   `.demo-box .missing`。
3. 断言默认“对象插件”、两个 host 未运行、安装与清理计数全为零、卸载按钮禁用。
4. 用键盘 Tab 到“运行安装实验”并按 Enter；断言 A / B 注入得到各自 appId 和 label。
5. 断言 A、B 各安装一次、总计两次，且去重说明明确 A 调用了两次 use 但只安装一次。
6. 用键盘触发“卸载两个应用”，断言 A、B host 已卸载，清理各一次，卸载按钮恢复禁用。
7. 切换“函数插件”，再运行完整实验并重复安装次数、options 隔离和卸载清理断言。
8. 在 390 x 844 viewport 下检查全部按钮双轴至少 44px、焦点可见、页面无横向滚动。
9. 重新加载后将 Demo 的标题、说明、按钮、host 内容和状态文本放大到 200%，复跑对象插件主路径；
   断言文本与控件无截断，两个 host 与汇总区互不重叠。
10. `page.emulateMedia({ reducedMotion: 'reduce' })` 后复跑函数插件主路径；断言没有主动 transition、
    animation 或 transform，安装与清理结果不变。
11. 全程收集 console error、console warning 与 pageerror；error 和 pageerror 最终为空。每次成功运行
    安装实验必须精确出现一条 `Plugin has already been applied to target app.` 预期 warning，warning
    总数必须等于成功运行次数；除该精确文本外的 warning 最终为空。
12. 所有等待使用 locator 状态，不使用固定 `waitForTimeout()`。

相邻测试同步冻结为：现有 `tests/e2e/render-functions-vnodes.spec.ts` 只把该课“无下一篇”的断言改为
可见且可点击的“下一篇：插件”；不得重写上一课的 VNode 身份交互、响应式或无障碍检查。

## 已冻结 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.advanced.plugins',
  type: 'lesson',
  title: '插件',
  summary: '用 app.use() 安装类型化应用能力，并保持幂等、应用隔离与卸载清理',
  ecosystem: 'vue',
  module: 'core',
  collection: 'advanced',
  level: 'advanced',
  prerequisites: ['vue.core.learn.advanced.render-functions-vnodes'],
  related: [
    'vue.core.learn.advanced.render-functions-vnodes',
    'vue.core.learn.intermediate.provide-inject',
    'vue.core.learn.advanced.custom-directives',
    'vue.core.reference.application.create-app',
  ],
  tags: [
    '插件',
    'app.use',
    'Plugin',
    'install',
    'options',
    'Provide / Inject',
    '应用实例',
    '幂等安装',
  ],
  sources: [
    {
      title: 'Vue 中文插件指南',
      url: 'https://cn.vuejs.org/guide/reusability/plugins.html',
    },
    {
      title: 'Vue 中文应用实例 API',
      url: 'https://cn.vuejs.org/api/application.html',
    },
    {
      title: 'Vue 中文创建一个应用',
      url: 'https://cn.vuejs.org/guide/essentials/application.html',
    },
    {
      title: 'Vue 中文组件注册指南',
      url: 'https://cn.vuejs.org/guide/components/registration.html',
    },
    {
      title: 'Vue 中文自定义指令指南',
      url: 'https://cn.vuejs.org/guide/reusability/custom-directives.html',
    },
    {
      title: 'Vue TypeScript：Provide / Inject',
      url: 'https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject',
    },
    {
      title: 'Vue TypeScript：扩展全局属性',
      url: 'https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties',
    },
    {
      title: 'Vue 插件指南官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/reusability/plugins.md',
    },
    {
      title: 'Vue 3.5.40 apiCreateApp.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts',
    },
    {
      title: 'Vue 3.5.40 apiCreateApp 官方测试',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts',
    },
    {
      title: 'Vue 3.5.40 apiInject.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts',
    },
    {
      title: 'Vue 3.5.40 componentPublicInstance.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentPublicInstance.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 65,
})
```

上述 ID、summary、唯一 prerequisite、related 顺序、tags、sources、唯一 Demo ID、65 分钟、恰好
8 个易错点和 8 个源码推导均为本批冻结值。实现不得增加第二个公开 Demo。

## 正文块与练习冻结

正文应包含 8 个 objectives、恰好 8 个 pitfalls、一个 8 项 steps 源码推导、唯一 Demo、两个块内
exercise、一个课后 exercises 条目和 8 条 recap。顶层 block 数量不机械复制上一课，但必须按“从基础
到高级的教学顺序”完整覆盖。

块内练习冻结为：

1. **选择暴露面：** 给出翻译服务、一个仅两页使用的业务组件和一个输入自动聚焦行为，分别选择
   `app.provide()`、局部组件导入与局部自定义指令；答案必须解释为何不把三者全部注册为全局资源。
2. **诊断多应用污染：** 给出插件模块级 reactive service 的代码，解释为何应用 B 的 options 覆盖 A，
   改成每次 install 创建服务，并预测 A 重复 use、B 单次 use 后的安装次数。

课后 exercises 条目冻结为：“为一个应用级 API 客户端设计插件契约：写出 `Plugin<[Options]>`、
`InjectionKey<Service>`、安装前置校验、每应用服务工厂和 `app.onUnmount()` 清理；列出哪些能力不应
放入 `globalProperties`。”

recap 固定覆盖：插件定位、两种形状、options、挂载前安装、Provide / Inject、全局资源边界、同应用
身份幂等 / 多应用隔离、卸载清理，共 8 条。

## 导航与目录冻结

- `vue.core.learn.advanced.render-functions-vnodes.next` 上线后指向本课。
- 本课 `previous` 指向 `vue.core.learn.advanced.render-functions-vnodes`。
- 本课 `next` 为 `undefined`；planned 的 `vue.core.learn.advanced.performance` 不进入可点击邻接。
- manifest 只把 plugins 的 planned descriptor 改为 available entry，不改变分类和 topic 顺序。
- Vue Core 上线后精确为 `26 available / 5 planned`；Vue Router 仍为 `0 / 15`，Pinia 仍为
  `0 / 14`，三条 Vue 学习路线合计 `26 available / 34 planned`，总规划数保持 60。
- 上一批研究文档中的 `25 / 35` 是其历史完成态，不回写或改写。

## 本批最小实施范围

新增：

- `docs/research/vue-plugins.md`
- `src/content/entries/learn/vue/core/advanced/plugins.ts`
- `src/content/demos/vue/core/learn/advanced/plugins/plugin-installation-scope-lab-demo.vue`
- `tests/e2e/plugins.spec.ts`

修改：

- `src/content/catalog/manifests/vue-core-track.ts`
- `src/content/catalog/vue-core-track.spec.ts`
- `src/content/interactive/registry.spec.ts`
- `tests/e2e/render-functions-vnodes.spec.ts`
- `docs/重构实施计划.md`

除此之外不修改任何正式文件。`src/content/interactive/registry.ts` 的固定六层 glob 已覆盖目标 Demo，
不得修改 registry 实现或增加更深目录。

## 明确非目标与停止边界

- 本批只发布一课、一个公开 Demo 和一条最小 E2E；达到 `26 / 34` 后立即停止。
- 不进入 `vue.core.learn.advanced.performance`、SSR、hydration、自定义 renderer 或编译器插件。
- 不修改现有 `vue.core.reference.application.create-app` 或任何 Reference / Reference Demo。
- 不实现插件发布、npm 打包、双构建格式、`package.json` exports、版本兼容矩阵或文档站生成。
- 不引入 Vue Router、Pinia、国际化库、网络客户端、事件总线或第三方插件系统。
- 不教授全局 mixin、`optionMergeStrategies`、Vue 2 `Vue.use()` 或 `Vue.prototype` 迁移专题。
- 不读取或展示 `app._context`、内部 WeakSet、组件 uid、公开实例 cache 或其他私有字段。
- 不把安装失败后的同身份去重实现推导宣传为跨版本重试契约。
- 不新增全局组件、全局指令或全局属性到本学习应用；这些只在正文说明边界。
- 不修改 router、schema、registry glob、全局样式、token 或 `main.ts`。
- 不启动新的开发服务器、不主动打开页面、不提交代码。
- 不用 current-browser smoke 替代冻结的键盘、390px、200% 文本、44px、reduced-motion 与错误收集 E2E。

## 自检结论

1. 技术事实只采用 Vue 官方文档、`vuejs/docs` 与 `vuejs/core@v3.5.40` 固定源码、测试。
2. manifest 位置、前置、邻接和 `25 / 35 -> 26 / 34` 数量与当前仓库一致。
3. 教学顺序从插件定位、公开安装协议推进到幂等、多应用、清理和固定源码解释。
4. 恰好 8 个易错点均包含错误示范、正确示范、可观察后果和一手来源，没有相近条目凑数。
5. 恰好 8 个源码推导均给出适用场景，并标记内部事实不得成为业务调用面。
6. 唯一 Demo 真实创建两个 app，直接证明两种插件形状、options、同应用去重、跨应用安装和清理。
7. E2E 冻结键盘、390px、200% 文本、44px、无溢出、reduced motion、console 和 pageerror 证据。
8. 文档没有前端布局代码；Demo 布局只使用 flex，间距由 margin 与 padding 管理，不引入无关样式。
9. 实施文件范围和停止边界已经列明，Reference、performance、SSR 与应用基础设施保持不变。
