---
id: vue.core.reference.advanced.custom-elements
type: reference
title: Vue 自定义元素 API 速查
summary: 用 defineCustomElement 创建可注册的原生自定义元素，并正确处理宿主访问、Shadow DOM 与 Vue 3.5 配置边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.application.create-app
  - vue.core.reference.composition.provide-inject
  - vue.core.reference.advanced.custom-directives
  - vue.core.reference.advanced.render-function
tags:
  - defineCustomElement
  - useHost
  - useShadowRoot
  - this.$host
  - Web Components
  - Shadow DOM
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue 自定义元素 API
    url: https://cn.vuejs.org/api/custom-elements.html
  - title: Vue 3.5.40 自定义元素实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-dom/src/apiCustomElement.ts
  - title: Vue 3.5.40 组件公共实例宿主映射
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/componentPublicInstance.ts
group: advanced
signature: |-
  /** 创建原生 HTMLElement 构造器。 */
  function defineCustomElement(
    component: ComponentOptions | ComponentOptions['setup'],
    options?: CustomElementOptions,
  ): { new (props?: object): HTMLElement }

  /** 读取当前 Vue 自定义元素的宿主。 */
  function useHost(): HTMLElement | null

  /** 读取当前 Vue 自定义元素的 shadow root。 */
  function useShadowRoot(): ShadowRoot | null

  interface ComponentPublicInstance {
    readonly $host: Element | null
  }
anchors:
  - defineCustomElement()
  - useHost()
  - useShadowRoot()
  - this.$host
  - 3.5+ 配置选项
  - 易错使用提示
  - 源码推导与适用场景
---

# Vue 自定义元素 API 速查

## 一、defineCustomElement()

`defineCustomElement()` 接受与 `defineComponent()` 相近的组件定义或 setup 函数，但返回的是 `HTMLElement` 子类构造器，不会自动向浏览器注册标签。调用方仍需用 `customElements.define()` 把构造器绑定到包含连字符的标签名。使用 SFC 时还要启用 custom element 模式，使组件样式编译为可注入的 `styles` 字符串。

~~~~ts
import { defineCustomElement, h } from 'vue'

const StatusBadge = defineCustomElement({
  props: {
    active: Boolean,
  },
  styles: [':host { display: inline-block }'],
  /** 根据 active prop 渲染状态文本。 */
  setup(props) {
    return () => h('span', props.active ? '在线' : '离线')
  },
})

customElements.define('status-badge', StatusBadge)
~~~~

:::tip
返回的构造器也可通过 `new StatusBadge({ active: true })` 创建实例，但自定义元素通常仍应先注册，再由 HTML、`document.createElement()` 或框架模板按标签名创建。
:::

## 二、useHost()

`useHost()` 自 Vue 3.5 起返回当前 Vue 自定义元素的宿主元素，也就是页面中的自定义标签本身。它依赖活动组件实例上的 custom element 关联，只应在 `defineCustomElement()` 组件的同步 `setup()` 上下文调用；普通 Vue 组件、模块顶层或延迟回调中会得到 `null`，开发环境还会给出警告。

~~~~ts
import { defineCustomElement, h, useHost } from 'vue'

const HostAwareElement = defineCustomElement({
  /** 在 setup 上下文读取并标记宿主元素。 */
  setup() {
    const host = useHost()
    host?.toggleAttribute('data-vue-element', true)
    return () => h('span', host?.tagName.toLowerCase())
  },
})
~~~~

## 三、useShadowRoot()

`useShadowRoot()` 自 Vue 3.5 起读取当前宿主的 `shadowRoot`。默认配置下它返回 Vue 创建的开放 shadow root；当组件设置 `shadowRoot: false` 时返回 `null`。它与 `useHost()` 具有相同的 setup 上下文限制，且只提供访问能力，不负责清理调用方创建的 observer、listener 或其他资源。

~~~~ts
import { defineCustomElement, h, onMounted, useShadowRoot } from 'vue'

const ShadowAwareElement = defineCustomElement({
  /** 挂载后读取当前 shadow root 的宿主标签名。 */
  setup() {
    const root = useShadowRoot()
    onMounted(() => {
      console.log(root?.host.tagName)
    })
    return () => h('span', 'Shadow DOM ready')
  },
})
~~~~

## 四、this.$host

`this.$host` 是 Vue 3.5 提供给 Options API 与 render 上下文的宿主引用，语义与 `useHost()` 对齐。它指向包裹组件输出的自定义元素，而 `this.$el` 指向当前组件渲染出的根节点；两者不能互换。普通组件没有 custom element 关联时，`this.$host` 为 `null`。

~~~~ts
import { defineCustomElement, h } from 'vue'

const OptionsElement = defineCustomElement({
  /** 挂载后为自定义元素宿主设置可查询状态。 */
  mounted() {
    this.$host?.setAttribute('data-mounted', '')
  },
  /** 渲染 shadow root 内部的真实根节点。 */
  render() {
    return h('button', '宿主之外的内部按钮')
  },
})
~~~~

## 五、3.5+ 配置选项

除既有的 `styles` 外，Vue 3.5 为自定义元素公开了 `configureApp`、`shadowRoot` 与 `nonce`。这些选项可写在组件定义中，也可作为 `defineCustomElement()` 的第二个参数传入。每个宿主实例都会创建自己的 Vue app；`configureApp` 在挂载前配置该实例，不能把它当成整个页面共享的一次性应用初始化。

| 选项 | 默认值 | 作用与边界 |
| --- | --- | --- |
| `styles` | `undefined` | 把内联 CSS 字符串注入 shadow root |
| `configureApp` | `undefined` | 在每个自定义元素 app 挂载前安装插件或配置 provide |
| `shadowRoot` | `true` | 设为 `false` 时直接渲染到宿主，且不注入 `styles` |
| `nonce` | `undefined` | 只给 Vue 注入的 shadow root `<style>` 设置 CSP nonce |

~~~~ts
const ServiceElement = defineCustomElement(ServicePanel, {
  /** 为每个自定义元素 app 安装所需插件。 */
  configureApp(app) {
    app.use(servicePlugin)
  },
  shadowRoot: true,
  nonce: styleNonce,
})

customElements.define('service-panel', ServiceElement)
~~~~

## 六、易错使用提示

:::pitfalls
### 把构造器创建当成浏览器注册

**触发条件：** 把构造器创建当成浏览器注册

**原因：** `defineCustomElement()` 只返回一个类，不会替调用方选择标签名或修改全局 CustomElementRegistry。

**后果：** HTML 中的标签不会升级为 Vue 自定义元素，setup、渲染与生命周期均不执行。

**错误示例：**

~~~~ts
const UserBadge = defineCustomElement(UserBadgeComponent)
document.body.innerHTML = '<user-badge></user-badge>'
~~~~

**正确写法：**

~~~~ts
const UserBadge = defineCustomElement(UserBadgeComponent)
customElements.define('user-badge', UserBadge)
~~~~

**验证方式：** 对照正确写法验证结果。

### 在普通组件或异步回调中调用 useHost()

**触发条件：** 在普通组件或异步回调中调用 useHost()

**原因：** `useHost()` 读取当前活动实例的 custom element 关联，普通组件和失去 setup 上下文的回调都没有该关联。

**后果：** 返回值为 null，随后直接访问 attribute 或 DOM API 会抛出运行时错误。

**错误示例：**

~~~~ts
/** 错误地在延迟回调中重新查询活动实例。 */
setTimeout(() => {
  useHost()!.setAttribute('data-ready', '')
})
~~~~

**正确写法：**

~~~~ts
const ReadyElement = defineCustomElement({
  /** 在有效的 setup 上下文读取宿主。 */
  setup() {
    const host = useHost()
    host?.setAttribute('data-ready', '')
    return () => 'Ready'
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 关闭 Shadow DOM 后断言 useShadowRoot() 非空

**触发条件：** 关闭 Shadow DOM 后断言 useShadowRoot() 非空

**原因：** `useShadowRoot()` 直接返回宿主的 shadowRoot；`shadowRoot: false` 时这个值按契约就是 null。

**后果：** light DOM 模式下组件在 setup 阶段因空值属性访问而失败，无法完成首次挂载。

**错误示例：**

~~~~ts
const LightElement = defineCustomElement({
  shadowRoot: false,
  /** 错误地假定 light DOM 仍有 shadow root。 */
  setup() {
    useShadowRoot()!.append(document.createElement('style'))
  },
})
~~~~

**正确写法：**

~~~~ts
const LightElement = defineCustomElement({
  shadowRoot: false,
  /** 在 light DOM 模式读取真实宿主。 */
  setup() {
    const host = useHost()
    host?.classList.add('light-element')
    return () => 'Light DOM'
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 混淆 this.$host 与 this.$el

**触发条件：** 混淆 this.$host 与 this.$el

**原因：** `$host` 是页面中的自定义标签，`$el` 是 Vue 组件当前渲染树的根节点。

**后果：** 外部 attribute 被写到 shadow root 内部节点，宿主选择器与 Web Component 消费方无法观察到状态。

**错误示例：**

~~~~ts
/** 错误地把内部根节点当成宿主。 */
mounted() {
  this.$el.setAttribute('data-ready', '')
}
~~~~

**正确写法：**

~~~~ts
/** 明确修改自定义元素宿主。 */
mounted() {
  this.$host?.setAttribute('data-ready', '')
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 期待主应用配置自动流入自定义元素

**触发条件：** 期待主应用配置自动流入自定义元素

**原因：** 每个 Vue 自定义元素实例都会创建独立 app，页面上已有 `createApp()` 的插件和 provide 不会自动共享。

**后果：** 元素内部的 inject、全局组件或 globalProperties 在独立消费页面中缺失。

**错误示例：**

~~~~ts
createApp(App).use(servicePlugin).mount('#app')
const ServiceElement = defineCustomElement(ServicePanel)
~~~~

**正确写法：**

~~~~ts
const ServiceElement = defineCustomElement(ServicePanel, {
  /** 为自定义元素自己的 app 安装插件。 */
  configureApp(app) {
    app.use(servicePlugin)
  },
})
~~~~

**验证方式：** 对照正确写法验证结果。

### 在 light DOM 模式期待 styles 与 nonce 自动注入

**触发条件：** 在 light DOM 模式期待 styles 与 nonce 自动注入

**原因：** `styles` 与 `nonce` 服务于 Vue 创建的 shadow root 样式标签；关闭 shadow root 后不会注入这些样式。

**后果：** 组件失去预期样式，宿主上的 nonce attribute 也不会替代真正 `<style>` 的 CSP nonce。

**错误示例：**

~~~~ts
defineCustomElement(Panel, {
  shadowRoot: false,
  nonce: styleNonce,
  styles: ['button { color: red }'],
})
~~~~

**正确写法：**

~~~~ts
import './panel-element.css'

const PanelElement = defineCustomElement(Panel, {
  shadowRoot: false,
})
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 七、源码推导与适用场景

:::steps
### 1. 返回值是原生元素构造器而不是 Vue app

`defineCustomElement()` 在固定源码中创建继承 `VueElement` 的类，而 `VueElement` 的基类在浏览器中是 `HTMLElement`。因此它适合发布 Web Component 构造器，注册仍属于浏览器 API。

### 2. Shadow DOM 只有显式 false 才关闭

构造函数以 `shadowRoot !== false` 判断并创建 `mode: open` 的 shadow root，否则把宿主自身设为渲染根。默认隔离和 light DOM 是两条明确路径，调用方应按实际配置处理 null。

### 3. Attribute 与 property 通过声明的 props 对接

实现先读取现有 attributes，再用 MutationObserver 跟踪变化；声明为 Number 的 attribute 会转换，property 赋值则通过生成的 getter/setter 更新并按可表示类型反射。复杂对象应使用 property，而不是假定 attribute 保留对象身份。

### 4. 组件 emit 会跨越为原生 CustomEvent

自定义元素路径会拦截组件 `emit`，在宿主上派发原始名称和必要的连字符名称，参数数组放入 `detail`。它适合 Web Component 消费方用 `addEventListener()` 订阅，而不是依赖 Vue 父组件事件链。

### 5. configureApp 在每个宿主实例挂载前执行

源码为每个元素创建 app，先继承嵌套 Vue 自定义元素的 provide 上下文，再调用 `configureApp`，最后挂载。它适合安装该元素真正需要的插件或依赖，不适合承载页面级单例初始化。

### 6. 三种宿主访问最终读取同一 custom element 关联

`useHost()` 读取当前实例的 `ce`，`useShadowRoot()` 再读取该宿主的 shadowRoot；公共实例映射也把 `$host` 指向 `instance.ce`。三者都只在 Vue 自定义元素实例中有真实宿主语义。
:::
