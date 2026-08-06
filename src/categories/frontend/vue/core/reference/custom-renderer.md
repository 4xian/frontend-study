---
id: vue.core.reference.advanced.custom-renderer
type: reference
title: Vue 自定义渲染器 API 速查
summary: 用平台 host operations 接入 Vue runtime-core，并区分底层 render、应用 createApp 与 hydration 能力边界
domain: frontend
technology: vue
module: core
related:
  - vue.core.reference.advanced.render-function
  - vue.core.reference.application.create-app
  - vue.core.reference.advanced.server-rendering
  - vue.core.learn.advanced.render-functions-vnodes
tags:
  - createRenderer
  - runtime-core
  - host operations
  - render
  - createApp
  - hydration
appliesTo: Vue 3.5.40
verifiedAt: 2026-08-03
sources:
  - title: Vue 自定义渲染器 API
    url: https://cn.vuejs.org/api/custom-renderer.html
  - title: Vue 3.5.40 renderer 契约与实现
    url: https://github.com/vuejs/core/blob/fa2885d8c48768d26f1666a01bd540ffe3b20f9b/packages/runtime-core/src/renderer.ts
group: advanced
signature: |-
  /** 创建连接 Vue runtime-core 与目标平台的渲染器。 */
  function createRenderer<HostNode, HostElement>(
    options: RendererOptions<HostNode, HostElement>,
  ): {
    render: RootRenderFunction<HostElement>
    createApp: CreateAppFunction<HostElement>
  }
anchors:
  - createRenderer()
  - Host operations 契约
  - 返回的 render 与 createApp
  - Hydration 能力边界
  - 易错使用提示
  - 源码推导与适用场景
---

# Vue 自定义渲染器 API 速查

## createRenderer()

`createRenderer(hostOptions)` 把 Vue runtime-core 的组件、响应式更新和 VNode patch 算法连接到目标平台。Vue 不直接操作 HostNode，而是把创建、插入、删除、文本、属性与树关系全部委托给 host operations。返回值只有底层 `render` 和绑定同一渲染器的 `createApp`；它不会把目标平台自动变成 DOM，也不会替平台实现节点语义。

:::tip
自定义渲染器通常应封装成平台包，并从该包导出 `render`、`createApp` 和所需的 `@vue/runtime-core` API。业务组件不应直接依赖 host 节点细节。
:::

## Host operations 契约

最小契约需要创建 element、text、comment，按 anchor 插入或移动节点，删除节点，分别更新文本节点与元素文本，更新属性，并准确返回 parent 与 next sibling。可选能力包括 querySelector、scope id、节点克隆和静态内容插入；只有平台确实支持对应语义时才应提供。下面的内存树示例展示核心关系，不代表 DOM、Canvas 或终端的完整生产实现。

~~~~ts
import { createRenderer } from '@vue/runtime-core'

interface HostBase {
  parent: HostElement | null
}

interface HostElement extends HostBase {
  kind: 'element'
  type: string
  children: HostNode[]
  text: string
  props: Record<string, unknown>
}

interface HostLeaf extends HostBase {
  kind: 'text' | 'comment'
  text: string
}

type HostNode = HostElement | HostLeaf

const hostOptions = {
  /** 创建目标平台的元素节点。 */
  createElement(type: string): HostElement {
    return { kind: 'element', type, children: [], text: '', props: {}, parent: null }
  },
  /** 创建目标平台的文本节点。 */
  createText(text: string): HostLeaf {
    return { kind: 'text', text, parent: null }
  },
  /** 创建用于片段边界等场景的注释节点。 */
  createComment(text: string): HostLeaf {
    return { kind: 'comment', text, parent: null }
  },
  /** 在 anchor 前插入节点，并支持移动既有节点。 */
  insert(node: HostNode, parent: HostElement, anchor: HostNode | null = null) {
    if (node === anchor) return
    if (node.parent) {
      const previousIndex = node.parent.children.indexOf(node)
      if (previousIndex >= 0) node.parent.children.splice(previousIndex, 1)
    }
    const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(anchorIndex < 0 ? parent.children.length : anchorIndex, 0, node)
    parent.text = ''
    node.parent = parent
  },
  /** 从当前父节点删除节点。 */
  remove(node: HostNode) {
    if (!node.parent) return
    const index = node.parent.children.indexOf(node)
    if (index >= 0) node.parent.children.splice(index, 1)
    node.parent = null
  },
  /** 更新单个文本或注释节点。 */
  setText(node: HostNode, text: string) {
    node.text = text
  },
  /** 用纯文本替换元素的全部子节点。 */
  setElementText(element: HostElement, text: string) {
    for (const child of element.children) child.parent = null
    element.children = []
    element.text = text
  },
  /** 按平台规则设置或移除属性。 */
  patchProp(element: HostElement, key: string, _previous: unknown, next: unknown) {
    if (next == null) delete element.props[key]
    else element.props[key] = next
  },
  /** 返回节点当前的父元素。 */
  parentNode(node: HostNode) {
    return node.parent
  },
  /** 返回节点当前的下一兄弟节点。 */
  nextSibling(node: HostNode) {
    if (!node.parent) return null
    const index = node.parent.children.indexOf(node)
    return index < 0 ? null : node.parent.children[index + 1] ?? null
  },
}

export const { render, createApp } = createRenderer<HostNode, HostElement>(hostOptions)
~~~~

| 职责 | 必需 operation | 关键语义 |
| --- | --- | --- |
| 创建 | `createElement / createText / createComment` | 返回可被后续操作识别的新节点 |
| 树变更 | `insert / remove` | anchor 定位、既有节点移动与父子关系同步 |
| 内容 | `setText / setElementText` | 区分叶子文本更新与元素子树替换 |
| 属性 | `patchProp` | 处理旧值、新值、删除与平台特有类型 |
| 遍历 | `parentNode / nextSibling` | 为替换、Fragment、组件与移动提供真实关系 |

## 返回的 render 与 createApp

`render(vnode, container)` 是低层根渲染入口：首次调用挂载，后续调用依据 container 保存的旧 VNode 做 patch，传入 `null` 则卸载旧树。`createApp(rootComponent)` 使用同一个 render 生成标准应用实例，提供 plugin、provide、全局组件和 unmount 等应用能力。两者是不同层级的入口，不应同时接管同一个 container。

~~~~ts
import { h } from '@vue/runtime-core'

const container = hostOptions.createElement('root')

render(h('scene', { title: '预览' }), container)
render(h('scene', { title: '已更新' }), container)
render(null, container)

const appContainer = hostOptions.createElement('root')
const app = createApp(SceneRoot)
app.mount(appContainer)
app.unmount()
~~~~

## Hydration 能力边界

普通 `createRenderer()` 返回的公开 `Renderer` 只有 `render` 与 `createApp`，没有 `hydrate`。固定源码把 hydration 放在单独的 `createHydrationRenderer()` 路径，并只有该路径向内部传入 hydration functions。即使目标容器已经有节点，普通 renderer 也不会自动把它们认作服务端输出；不能据此宣称自定义平台支持 hydration。

:::warning
hydration 需要服务器输出协议、可遍历的既有节点、mismatch 处理和专用 renderer 协同。本页只记录 `createRenderer()` 的公开契约，不提供或承诺自定义 hydration 实现。
:::

## 易错使用提示

:::pitfalls
### 省略 parentNode 或 nextSibling 的真实关系

**触发条件：** 省略 parentNode 或 nextSibling 的真实关系

**原因：** renderer 会在组件更新、Fragment 删除、节点替换与移动时查询真实父节点和下一兄弟节点。

**后果：** 简单首次挂载可能通过，但更新或卸载会选择错误容器、跳过节点或破坏树结构。

**错误示例：**

~~~~ts
const hostOptions = {
  /** 用固定空值伪造树关系。 */
  parentNode() {
    return null
  },
  /** 用固定空值伪造兄弟关系。 */
  nextSibling() {
    return null
  },
}
~~~~

**正确写法：**

~~~~ts
const hostOptions = {
  /** 返回节点当前父元素。 */
  parentNode(node: HostNode) {
    return node.parent
  },
  /** 从父元素的 children 计算下一兄弟。 */
  nextSibling(node: HostNode) {
    const index = node.parent?.children.indexOf(node) ?? -1
    return index < 0 ? null : node.parent!.children[index + 1] ?? null
  },
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 insert 实现成只会追加的新建操作

**触发条件：** 把 insert 实现成只会追加的新建操作

**原因：** `insert(node, parent, anchor)` 同时承担首次插入、按 anchor 定位和既有节点移动。

**后果：** keyed 列表重排产生重复节点或错误顺序，Fragment 和 Teleport 的锚点位置也会失真。

**错误示例：**

~~~~ts
/** 忽略 anchor，且不移除节点的旧位置。 */
function insert(node: HostNode, parent: HostElement) {
  parent.children.push(node)
}
~~~~

**正确写法：**

~~~~ts
/** 把节点移动到 anchor 前，并同步父子关系。 */
function insert(node: HostNode, parent: HostElement, anchor: HostNode | null) {
  detach(node)
  const index = anchor ? parent.children.indexOf(anchor) : parent.children.length
  parent.children.splice(index < 0 ? parent.children.length : index, 0, node)
  node.parent = parent
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 混用 setText 与 setElementText

**触发条件：** 混用 setText 与 setElementText

**原因：** `setText` 更新 text/comment 叶子；`setElementText` 必须用文本替换元素原有子树。

**后果：** 旧子节点仍被平台保留，Vue 的 VNode 已认为它们不存在，后续 patch 与卸载无法对应。

**错误示例：**

~~~~ts
/** 只写 text，却保留元素的旧 children。 */
function setElementText(element: HostElement, text: string) {
  element.text = text
}
~~~~

**正确写法：**

~~~~ts
/** 清除旧子树后写入元素文本。 */
function setElementText(element: HostElement, text: string) {
  for (const child of element.children) child.parent = null
  element.children = []
  element.text = text
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把 patchProp 当成无条件对象赋值

**触发条件：** 把 patchProp 当成无条件对象赋值

**原因：** `patchProp` 接收 prevValue 与 nextValue，平台需要自行实现删除、事件解绑、类型转换等语义。

**后果：** null 值残留为伪属性，旧 listener 或资源不释放，平台节点状态与 VNode 分离。

**错误示例：**

~~~~ts
/** 把 null 也保存为有效属性。 */
function patchProp(element: HostElement, key: string, _prev: unknown, next: unknown) {
  element.props[key] = next
}
~~~~

**正确写法：**

~~~~ts
/** 按平台规则移除或替换属性。 */
function patchProp(element: HostElement, key: string, prev: unknown, next: unknown) {
  if (isListener(key)) updateListener(element, key, prev, next)
  else if (next == null) delete element.props[key]
  else element.props[key] = next
}
~~~~

**验证方式：** 对照正确写法验证结果。

### 把已有节点容器等同于 hydration renderer

**触发条件：** 把已有节点容器等同于 hydration renderer

**原因：** 普通 `createRenderer()` 没有 hydrate 入口，也没有获得源码中的 hydration functions。

**后果：** 首次 render 按普通挂载或 patch 契约工作，既有平台节点不会被可靠复用，可能重复或被替换。

**错误示例：**

~~~~ts
const { createApp } = createRenderer(hostOptions)
// 容器有预渲染节点，所以普通 mount 会自动 hydration。
createApp(App).mount(preRenderedContainer)
~~~~

**正确写法：**

~~~~ts
const renderer = createRenderer(hostOptions)
// 只声明当前实际具备的客户端挂载能力。
renderer.createApp(App).mount(emptyContainer)
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 源码推导与适用场景

:::steps
### 1. runtime-core 不直接触碰 HostNode

`RendererNode` 在源码中只是通用对象，patch 闭包把平台操作解构为 hostInsert、hostRemove 等函数。自定义 renderer 的核心价值是翻译平台节点语义，而不是重写 Vue 的组件模型。

### 2. 核心树关系 operation 是更新正确性的基础

源码在节点替换、组件子树更新、Fragment 删除和 next host node 查找中持续调用 `parentNode` 与 `nextSibling`。它们不是仅供优化的可选查询，必须反映当前真实树。

### 3. insert 同时承担创建后的放置与节点移动

元素挂载、Fragment 锚点、静态节点与 keyed 重排最终都会调用 hostInsert，并传入目标 container 与 anchor。适配层必须让同一节点移动而非复制，才能保持 VNode identity。

### 4. render 以 container.&#95;vnode 维持根级增量更新

根 render 会用 container 保存的旧 VNode 调用 patch；传入 null 时先 unmount 旧树，再清空该引用。它适合低层、单容器的命令式渲染入口，不是无状态 append API。

### 5. createApp 复用同一 render 构建应用层

renderer 返回时用 `createAppAPI(render, hydrate)` 生成 createApp，因此应用的 mount 与 unmount 仍走同一组 host operations。需要插件、provide 和应用生命周期时应选择 createApp。

### 6. hydration 由另一条 renderer 构造路径注入

`createRenderer()` 只把 options 传给 baseCreateRenderer；源码中的 `createHydrationRenderer()` 才额外传入 createHydrationFunctions 并返回 hydrate。普通自定义 renderer 不应声明未实现的 hydration 能力。
:::
