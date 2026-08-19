---
id: vue.core.learn.advanced.plugins
type: lesson
title: 插件
summary: 用 app.use() 安装类型化应用能力，并保持幂等、应用隔离与卸载清理
domain: frontend
technology: vue
module: core
related:
  - vue.core.learn.advanced.render-functions-vnodes
  - vue.core.learn.intermediate.provide-inject
  - vue.core.learn.advanced.custom-directives
  - vue.core.reference.application.create-app
tags:
  - 插件
  - app.use
  - Plugin
  - install
  - options
  - Provide / Inject
  - 应用实例
  - 幂等安装
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-01
sources:
  - title: Vue 中文插件指南
    url: https://cn.vuejs.org/guide/reusability/plugins.html
  - title: Vue 中文应用实例 API
    url: https://cn.vuejs.org/api/application.html
  - title: Vue 中文创建一个应用
    url: https://cn.vuejs.org/guide/essentials/application.html
  - title: Vue 中文组件注册指南
    url: https://cn.vuejs.org/guide/components/registration.html
  - title: Vue 中文自定义指令指南
    url: https://cn.vuejs.org/guide/reusability/custom-directives.html
  - title: Vue TypeScript：Provide / Inject
    url: https://cn.vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
  - title: Vue TypeScript：扩展全局属性
    url: https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties
  - title: Vue 插件指南官方 Markdown
    url: https://github.com/vuejs/docs/blob/main/src/guide/reusability/plugins.md
  - title: Vue 3.5.40 apiCreateApp.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiCreateApp.ts
  - title: Vue 3.5.40 apiCreateApp 官方测试
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/__tests__/apiCreateApp.spec.ts
  - title: Vue 3.5.40 apiInject.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiInject.ts
  - title: Vue 3.5.40 componentPublicInstance.ts
    url: https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/componentPublicInstance.ts
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - vue.core.learn.advanced.render-functions-vnodes
objectives:
  - 判断一个需求应由插件、组件、组合式函数还是自定义指令承担
  - 写出类型化对象插件，并解释函数插件与对象插件共享的 install 协议
  - 用 app.use(plugin, options) 在 mount() 前完成安装
  - 用 InjectionKey<T>、app.provide() 和消费组合式函数公开应用服务
  - 说明全局属性、全局组件和全局指令各自的适用边界与代价
  - 预测同一插件身份重复用于一个 app 与用于两个 app 时的安装次数
  - 识别模块级可变服务造成的跨应用污染，并改为每次 install 创建服务
  - 用 app.onUnmount() 清理插件建立的应用级副作用
recap:
  - 插件是应用级安装协议，只承载启动时统一安装且被多处消费的能力
  - 对象插件提供 install()，函数插件本身承担同一安装协议
  - Plugin<[Options]> 约束安装输入，普通 options 不会自动成为响应式配置
  - 应用应在 mount() 前通过 app.use() 完成插件与其他资源配置
  - 应用级服务首选 app.provide()、InjectionKey<T> 与显式消费组合式函数
  - 全局属性、全局组件和全局指令只用于真正普遍且职责匹配的能力
  - 同一 app 按插件身份幂等安装，同一身份仍可在不同 app 各安装一次并保持服务隔离
  - 插件建立的应用级监听、订阅或连接要用 app.onUnmount() 登记清理
---

# 插件

## 一、正文大纲

上一课从渲染函数与 VNode 观察组件树，本课把视角提升到应用实例。学习重点是判断哪些能力值得在应用启动时统一安装，再用 app.use()、类型化 options 与 Provide / Inject 建立显式契约，最后用同一插件在两个应用中的结果理解幂等、隔离和清理。

## 二、插件是应用级安装协议

插件不是所有复用逻辑的默认容器。它适合需要在应用启动时统一安装、并被应用内多处消费的能力；单个界面仍由组件负责，可复用有状态逻辑优先使用组合式函数，只有必须直接操作普通元素 DOM 的行为才考虑自定义指令。

| 需求 | 首选能力 | 判断依据 |
| --- | --- | --- |
| 单个完整界面与交互 | 组件 | 用 props、emits 与 slots 建立局部契约 |
| 跨组件复用有状态逻辑 | 组合式函数 | 调用方显式导入并获得状态与命令 |
| 直接操作普通元素 DOM | 自定义指令 | 行为与具体元素生命周期绑定 |
| 启动时统一安装的应用服务 | 插件 | 需要应用级配置并被多处消费 |

:::tip
Vue 官方列出的插件用途包括注册组件或指令、提供可注入资源、添加全局属性，或组合这些能力。开放的安装范围不等于应该把局部能力全部提升为全局资源。
:::

## 三、在 mount() 前通过 app.use() 安装

app.use(plugin, ...options) 让当前应用执行插件安装协议，并返回同一个应用实例。插件可能注册资源或提供根组件首次 setup 就要注入的服务，因此标准顺序是创建应用、安装插件、完成其他配置，最后 mount()。本课用逐行调用清楚展示顺序，不把链式写法当作重点。

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'
import { lessonPlugin } from './lesson-plugin'

const app = createApp(App)

app.use(lessonPlugin, { label: '课程中心' })
app.mount('#app')
~~~~

:::warning
不要在 mount() 后才补装插件。本课不承诺已经创建的组件会重新获得后来注册的 provide、组件、指令或全局属性。
:::

## 四、对象插件与函数插件共享安装协议

对象插件由 install() 方法承担安装，函数插件本身就是 install function。两种形状的第一个参数都是当前 app，其余参数都来自 app.use()；它们没有运行结果上的等级差异。需要稳定命名的库级导出时适合对象插件，只有一个窄安装动作且函数名已足够清楚时适合函数插件。

~~~~ts
import type { Plugin } from 'vue'

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
~~~~

一个插件应向消费者提供一个稳定身份。不要只为展示语法而把同一能力同时导出为对象和函数两套插件，否则安装去重与消费选择都会变得含糊。

## 五、用 Plugin&lt;[Options]&gt; 固定当前应用的安装输入

Vue 会把 app.use() 的尾随参数原样交给安装函数。正式插件优先传一个具名 options 对象，并用 Plugin&lt;[LessonPluginOptions]&gt; 同时约束调用端与 install 端。options 只属于这一次、这个应用的安装输入；普通对象不会因为传给插件就自动成为响应式配置。

~~~~ts
interface LessonPluginOptions {
  label: string
}

const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 使用当前应用的安装输入创建服务。 */
  install(app, options) {
    const service = { label: options.label }
    app.provide(lessonServiceKey, service)
  },
}

app.use(lessonPlugin, { label: '课程应用 A' })
~~~~

:::tip
如果配置需要在运行期变化，服务应明确公开响应式状态或更新命令。再次调用 app.use() 不是更新已经安装插件的配置接口。
:::

## 六、用 Provide / Inject 暴露显式服务

应用级服务首选 app.provide()。根组件和后代都能通过同一个 InjectionKey&lt;T&gt; 注入服务，提供端与消费端共享类型契约；消费组合式函数集中处理插件缺失，也避免每个组件重复非空断言。

~~~~ts
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
~~~~

某个子树还可以用同一 InjectionKey 提供局部替身或实现。更近的 provider 会覆盖该子树中的应用默认值，而不会改写插件提供给其他分支的服务。

## 七、全局属性、组件与指令各有边界

| 暴露面 | 适合用途 | 默认边界 |
| --- | --- | --- |
| app.provide() | Composition API 显式注入的服务、客户端或配置 | 本课首选，配合 InjectionKey&lt;T&gt; |
| globalProperties | 模板或 Options API 中真正普遍的 $name 能力 | 谨慎使用，并补 ComponentCustomProperties 类型扩展 |
| app.component() | 插件套件中几乎处处可用的少量公共组件 | 普通业务组件保持局部导入 |
| app.directive() | 套件提供且必须直接操作普通 DOM 元素的行为 | 能由组件或模板表达时不注册全局指令 |

globalProperties 不会在 &lt;script setup&gt; 的模块作用域中创建词法变量；模板或 Options API 使用的全局属性还需要 ComponentCustomProperties 模块扩展。组件自己的同名属性优先于全局属性。全局组件也会隐藏依赖并不利于未使用组件从生产产物中移除，因此插件不应默认批量注册整个目录。

~~~~ts
const lessonPlugin: Plugin = {
  /** 只注册插件契约中真正普遍的状态标记。 */
  install(app) {
    app.component('LessonStatusBadge', LessonStatusBadge)
  },
}

// 其他业务组件仍在使用位置显式导入。
import LessonEditor from './LessonEditor.vue'
~~~~

## 八、同一应用按插件身份幂等安装

同一 app 对同一个插件多次调用 app.use()，安装函数只执行一次。Vue 3.5.40 按对象或函数身份判断“同一个”，不比较插件名、源码或 options 内容；第二次 options 不会更新第一次的安装结果。

~~~~ts
const lessonPlugin = createLessonPlugin()

app.use(lessonPlugin, { label: '第一次安装' })
app.use(lessonPlugin, { label: '不会重新安装' })
~~~~

| 两次 use() 的插件值 | 身份关系 | install 执行次数 |
| --- | --- | --- |
| 同一个对象变量 | 相同 | 1 次 |
| 同一个函数变量 | 相同 | 1 次 |
| 工厂两次返回的新对象 | 不同 | 2 次 |
| 内容相同的两个函数字面量 | 不同 | 2 次 |

:::warning
保存并复用稳定插件引用。需要运行期更新时调用服务的明确命令，不要把重复 use() 当作重新配置或安装失败后的重试 API。
:::

## 九、多个应用各有安装与资源作用域

同一页面可以创建多个 Vue 应用，每个应用都拥有自己的配置、全局资源和安装记录。因此同一个插件身份在应用 A 安装一次后，仍会在应用 B 再安装一次；A 的 options、provide、组件、指令和全局属性不会自动进入 B。

~~~~ts
const lessonPlugin = createLessonPlugin()
const appA = createApp(RootA)
const appB = createApp(RootB)

appA.use(lessonPlugin, { label: '应用 A' })
appA.use(lessonPlugin, { label: '这次被去重' })
appB.use(lessonPlugin, { label: '应用 B' })
~~~~

可观察结果是 install 总共执行两次：A 一次、B 一次。但插件模块内的可变变量不会被 Vue 自动隔离。每个应用的可变服务必须在当次 install 中创建，再由当前 app 提供。

~~~~ts
const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 为当前应用创建并提供独立服务。 */
  install(app, options) {
    const service = reactive({ label: options.label })
    app.provide(lessonServiceKey, service)
  },
}
~~~~

## 十、用 app.onUnmount() 清理应用级副作用

插件若添加窗口监听器、订阅或客户端连接，应在 install 中用 app.onUnmount() 登记清理。它跟随整个应用实例；组件的 onUnmounted() 则只跟随某个组件实例。多个应用分别安装时，也要分别登记并分别释放自己的副作用。

~~~~ts
const resizePlugin: Plugin = {
  /** 为当前应用安装并登记窗口监听。 */
  install(app) {
    /** 通知服务当前视口发生变化。 */
    const handleResize = () => resizeService.refresh()

    window.addEventListener('resize', handleResize)
    app.onUnmount(() => window.removeEventListener('resize', handleResize))
  },
}
~~~~

:::tip
注册与移除必须使用同一个函数身份。应用 A 的 unmount() 只清理 A 登记的回调，不应影响仍在运行的应用 B。
:::

## 十一、从 Vue 3.5.40 源码解释可观察结果

:::steps
### Plugin 联合两种安装器形状

apiCreateApp.ts 把插件定义为含 install 的对象或安装函数，并用泛型 options 保留尾随参数类型。适合用 Plugin&lt;[Options]&gt; 同时约束 app.use() 与 install 两端。

### app.use() 先分派对象 install，再分派函数插件

固定实现先判断 plugin.install 是否为函数，不满足时才判断 plugin 本身是否为函数；合法分支都收到当前 app 与全部 options。适合诊断导出值是否符合公开插件形状。

### 幂等集合按身份记录且不读取 options

每个 app 的内部 WeakSet 按对象或函数引用命中已安装插件，不读取名称、options 或插件内部字段。适合排查插件工厂或测试装配为何产生重复副作用。

### 安装身份先于 install 执行进入集合

固定实现先记录 plugin，再调用安装函数；若 install 抛错，同一 app 的同一身份仍被视作已经应用。适合提醒安装前先同步校验必需 options，但不能把该顺序宣传为跨版本重试契约。

### 每次 createApp() 建立独立 context 与去重集合

每个 app context 都有各自的 globalProperties、components、directives 与 provides，安装集合也独立。适合同页多根、微前端和测试隔离，但应用状态仍要避免模块级可变单例。

### 根组件注入回退到应用级 provides

apiInject.ts 让根组件从 app context provides 查找，后代再沿父级 provides 查找；近处同 key provider 可覆盖局部子树。适合由插件提供默认服务、由测试或子树提供替身。

### 全局属性是公开实例查找链的后备项

componentPublicInstance.ts 在 setup state、data、props、ctx 等来源之后才回退到 globalProperties。适合解释局部同名值优先的结果，不应读取代理 cache 或组件内部实例。

### app.onUnmount() 回调列表属于当前应用

每个 app 拥有自己的 cleanup function 列表，unmount() 通过 Vue 错误处理通道调用它们。适合在多应用测试中分别断言监听、订阅或连接的清理次数。
:::

:::warning
installedPlugins、内部 WeakSet、app context、provides 原型链与公开实例属性查找顺序都只是 Vue 3.5.40 的实现证据。业务代码只能观察稳定结果，不能读取 app.&#95;context、组件内部实例或其他私有字段。
:::

## 十二、易错使用提示

:::pitfalls
### 绕过 app.use() 直接调用 install()

**触发条件：** 绕过 app.use() 直接调用 install()

**原因：** 直接调用会跳过应用的插件去重协议，也把调用方绑死在对象插件形状上。

**后果：** 相同应用可能重复注册资源或副作用，并失去函数插件与对象插件的统一入口。

**错误示例：**

~~~~ts
lessonPlugin.install(app, { label: '课程中心' })
lessonPlugin.install(app, { label: '重复安装' })
~~~~

**正确写法：**

~~~~ts
app.use(lessonPlugin, { label: '课程中心' })
app.use(lessonPlugin, { label: '会按身份去重' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 把新的工厂返回值误认为同一个插件

**触发条件：** 把新的工厂返回值误认为同一个插件

**原因：** 每次调用工厂都会产生新对象身份，内容相同也不会命中同一身份。

**后果：** 错误路径执行两次 install，重复建立资源或副作用。

**错误示例：**

~~~~ts
app.use(createLessonPlugin(), { label: '课程中心' })
app.use(createLessonPlugin(), { label: '课程中心' })
~~~~

**正确写法：**

~~~~ts
const lessonPlugin = createLessonPlugin()

app.use(lessonPlugin, { label: '课程中心' })
app.use(lessonPlugin, { label: '这次会被去重' })
~~~~

**验证方式：** 对照正确写法验证结果。

### 用重复 app.use() 更新 options

**触发条件：** 用重复 app.use() 更新 options

**原因：** 同一插件身份已经安装后，第二次 options 不会再进入安装函数。

**后果：** 服务仍保留第一次安装值，界面结果与第二次传参不一致。

**错误示例：**

~~~~ts
app.use(lessonPlugin, { label: '课程 A' })
app.use(lessonPlugin, { label: '课程 B' })
~~~~

**正确写法：**

~~~~ts
const app = createApp(App)

app.use(lessonPlugin, { label: '课程 B' })
app.mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 把模块级可变服务共享给所有应用

**触发条件：** 把模块级可变服务共享给所有应用

**原因：** 两个应用注入同一个可变对象，后安装应用会改写先安装应用的状态。

**后果：** 应用 B 的 options 泄漏到 A，任一应用的后续修改也会影响另一方。

**错误示例：**

~~~~ts
const sharedService = reactive({ label: '' })

const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 安装共享的模块级服务。 */
  install(app, options) {
    sharedService.label = options.label
    app.provide(lessonServiceKey, sharedService)
  },
}
~~~~

**正确写法：**

~~~~ts
const lessonPlugin: Plugin<[LessonPluginOptions]> = {
  /** 为当前应用创建并提供独立服务。 */
  install(app, options) {
    const service = reactive({ label: options.label })
    app.provide(lessonServiceKey, service)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 &lt;script setup&gt; 中把全局属性当作词法变量

**触发条件：** 在 &lt;script setup&gt; 中把全局属性当作词法变量

**原因：** globalProperties 只参与组件公开实例访问，不会声明模块作用域变量。

**后果：** 代码缺少明确来源并产生 TypeScript 未定义错误，也无法集中处理插件未安装。

**错误示例：**

~~~~ts
const title = $translate('lesson.title')
~~~~

**正确写法：**

~~~~ts
const translation = useTranslation()
const title = translation.translate('lesson.title')
~~~~

**验证方式：** 对照正确写法验证结果。

### 批量注册插件目录中的全部组件和行为

**触发条件：** 批量注册插件目录中的全部组件和行为

**原因：** 全局扫描会隐藏实际依赖，并把局部业务组件和行为提升为应用资源。

**后果：** 公开全局名称膨胀，未使用组件不利于从产物移除，维护者也难以追踪依赖。

**错误示例：**

~~~~ts
for (const [name, component] of Object.entries(allComponents)) {
  app.component(name, component)
}
~~~~

**正确写法：**

~~~~ts
const lessonPlugin: Plugin = {
  /** 只注册插件承诺全局可用的状态标记。 */
  install(app) {
    app.component('LessonStatusBadge', LessonStatusBadge)
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 在挂载后才安装插件

**触发条件：** 在挂载后才安装插件

**原因：** 根组件已经开始创建后才补应用配置和资源。

**后果：** 根组件首次 setup 无法注入服务，首次模板解析也看不到插件注册的全局资源。

**错误示例：**

~~~~ts
const app = createApp(App)
app.mount('#app')
app.use(lessonPlugin, { label: '太晚安装' })
~~~~

**正确写法：**

~~~~ts
const app = createApp(App)
app.use(lessonPlugin, { label: '课程中心' })
app.mount('#app')
~~~~

**验证方式：** 对照正确写法验证结果。

### 安装应用级副作用却不清理

**触发条件：** 安装应用级副作用却不清理

**原因：** 插件添加的窗口监听器在应用卸载后仍然保留。

**后果：** 已卸载应用继续响应外部事件，并遗留无效订阅或连接。

**错误示例：**

~~~~ts
const resizePlugin: Plugin = {
  /** 安装一个不会释放的监听器。 */
  install() {
    window.addEventListener('resize', resizeService.refresh)
  },
}
~~~~

**正确写法：**

~~~~ts
const resizePlugin: Plugin = {
  /** 安装并登记应用级清理。 */
  install(app) {
    /** 刷新视口服务。 */
    const handleResize = () => resizeService.refresh()

    window.addEventListener('resize', handleResize)
    app.onUnmount(() => window.removeEventListener('resize', handleResize))
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 十三、动手验证：同一插件，每个应用各安装一次

:::demo{id="vue.core.learn.advanced.plugins.plugin-installation-scope-lab-demo" playground="true"}
切换对象插件与函数插件，观察应用 A 重复 use 的去重结果、应用 B 的独立安装输入，以及两个应用各自的卸载清理
:::

:::exercise
### 选择暴露面

**要求：**

~~~~text
给出翻译服务、一个仅两页使用的业务组件和一个输入自动聚焦行为，分别选择 app.provide()、组件注册方式与指令注册方式，并说明理由。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
翻译服务在应用启动时统一安装且被多处消费，用 app.provide() 配合 InjectionKey；只在两页使用的业务组件保持局部导入；输入自动聚焦必须直接操作普通元素 DOM，但作用范围有限，因此用局部自定义指令。三者职责和消费范围不同，全部注册为全局资源会隐藏依赖并扩大命名与产物边界。
~~~~
:::

:::exercise
### 诊断多应用污染

**要求：**

~~~~text
给定插件模块级 reactive service，解释为何应用 B 的 options 会覆盖 A，并改成每次 install 创建服务；再预测 A 重复 use、B 单次 use 后的安装次数。
~~~~

**验收：**

~~~~text
完成题目要求。
~~~~

**参考答案：**

~~~~text
两个 app 原本注入同一个模块级对象，B 安装时会改写 A 已持有的值。把 reactive service 移进 install，并由当前 app provide；复用同一个插件身份时，A 的两次 use 只安装一次，B 的一次 use 再安装一次，总计两次。
~~~~
:::
