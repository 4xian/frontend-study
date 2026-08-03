# Vue Core 中级课程：动态组件与 KeepAlive 调研

> 查证日期：2026-07-31
> 适用版本：Vue 3.5.40
> 资料范围：Vue 官方中英文动态组件与 KeepAlive 指南、内置组件与组合式 API、
> `vuejs/core` v3.5.40 固定标签源码，以及 W3C 可访问性规范。

## 冻结结论

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.dynamic-components-keep-alive` |
| 标题 | `动态组件与 KeepAlive` |
| 阶段 | `intermediate` |
| 唯一直接前置 | `vue.core.learn.intermediate.transitions` |
| 线性位置 | “过渡效果”之后，“Teleport”之前 |
| 下一课 | `vue.core.learn.intermediate.teleport`，继续保持 `planned` |
| 唯一公开 Demo ID | `vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo` |
| 易错点数量 | 恰好 8 个 |
| 适用版本 | Vue 3.5.40 |
| 预计时长 | 60 分钟 |
| 课程长路径 | `/learn/vue/core/intermediate/dynamic-components-keep-alive` |
| 实施前总量 | Vue 三条学习路线 `19 available / 41 planned` |
| 实施后总量 | Vue 三条学习路线 `20 available / 40 planned` |

本批只为学习路线新增“动态组件与 KeepAlive”课程、唯一公开 Demo、目录接入和现有 390px
长路径验证。已有 `vue.core.reference.built-ins.keep-alive` 及其 Reference Demo 保持原样，不能借本批
修改或重写。`vue.core.learn.intermediate.teleport` 仍为下一课且保持 `planned`；不创建 Teleport
课程正文，不把 planned 课程加入 `related` 或可导航的“下一篇”。

## 调研边界与证据状态

本调研通过 Tavily 只定位和提取一手来源：Vue 官方中英文站点、`vuejs/core` v3.5.40 固定源码、
`vuejs/docs` 官方原始 Markdown 和 W3C 规范。没有使用社区文章、搜索摘要或二手教程作为结论依据。
版本敏感的缓存键、名称过滤、LRU、激活/停用和延迟写缓存机制，以 v3.5.40 源码为准。

本地仓库同时确认：

- `package-lock.json` 中安装的 `vue` 精确为 `3.5.40`。
- `transitions` 已是 intermediate 的最后一个 available 条目。
- `dynamic-components-keep-alive` 与紧随其后的 `teleport` 仍为 planned。
- 当前 Vue Core 为 `19 available / 12 planned`；Vue Router 与 Pinia 共 29 个 planned，因此三条
  Vue 学习路线合计 `19 available / 41 planned`。本批只开放一个条目后为
  `20 available / 40 planned`。

## 当前仓库审查

### Catalog 与课程顺序

`src/content/catalog/manifests/vue-core-track.ts` 的 `built-ins-and-transitions` 分类顺序已经冻结：

1. `vue.core.learn.intermediate.transitions`：`available`。
2. `vue.core.learn.intermediate.dynamic-components-keep-alive`：本批从 `planned` 转为 `available`。
3. `vue.core.learn.intermediate.teleport`：继续 `planned`。

因此本课唯一 prerequisite 是 `vue.core.learn.intermediate.transitions`。实施后，上一课出现可导航的
“下一篇：动态组件与 KeepAlive”；本课末尾没有可导航下一篇，因为 Teleport 尚未开放。正文只能用
普通文本预告 Teleport，不能创建失效链接或把 planned 条目放进 `related`。

### Schema 与资产注册

课程继续使用 `defineLessonMeta()` 与 `defineLesson()`：

- metadata 必须包含 `id`、`type`、`title`、`summary`、ecosystem/module/collection、level、
  prerequisites、related、tags、sources、appliesTo、verifiedAt、estimatedMinutes。
- 正文包含非空 `objectives`、`blocks`、`recap`，练习写入 `exercises` 或结构化 exercise block。
- “易错使用提示”标题后紧跟一个 `pitfalls` block；恰好 8 项，每项都有 description、
  consequence、wrong 与 correct。
- Demo 的公开 ID 由 `src/content/demos/` 下相对路径自动派生，不修改 registry glob 或解析逻辑。
- 允许把三种状态面板放进 Demo 的 `parts/` 子目录；额外深度不匹配公开 Demo glob，这些文件不是
  第二组 Demo，也不得出现在公开 Demo ID 断言中。

### 现有 KeepAlive Reference 的职责边界

`src/content/entries/reference/vue/core/built-ins/keep-alive.ts` 已负责速查：

- `KeepAliveProps`、`MatchPattern` 与 `include` / `exclude` / `max` 类型。
- 缓存身份、LRU、`onActivated()` / `onDeactivated()` 和最小源码摘录。
- 五个结构化 Reference 易错点与缓存/非缓存对比 Demo。

新课程不能把 Reference 复制成更长的 API 清单。课程的主线是：先从动态组件切换和实例身份出发，
观察默认卸载造成的状态重置，再引入 KeepAlive、缓存策略和活动生命周期，最后用一个可操作实验台
验证“保留、重建、淘汰”三种结果。详细 prop 签名仍通过 `related` 返回现有 Reference。

## 官方事实

### 动态组件的公开语义

- `<component :is="...">` 在多个组件或原生元素间动态选择当前渲染类型。
- `:is` 可以接收已注册组件名称字符串，也可以直接接收导入的组件对象。
- `is` 前没有 `:` 时是静态 attribute，表达式不会被求值。
- 动态组件被替换时，默认会卸载旧实例；再次切回会创建带初始状态的新实例。
- DOM 内模板的 `is="vue:ComponentName"` 是修复原生元素内容模型限制的另一条能力，不应和
  SFC 中的 `<component :is="...">` 混为一谈。

来源（访问日期：2026-07-31）：

- [Vue 中文组件基础：动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)
- [Vue English Components Basics: Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)
- [Vue 中文组件基础：DOM 内模板解析注意事项](https://cn.vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)

### KeepAlive 的公开语义

- `<KeepAlive>` 缓存动态切换后变为非活动状态的组件实例，而不是销毁它们。
- 任一时刻只能有一个活动组件实例作为 KeepAlive 的直接子节点；条件分支可以存在，但运行时只能
  命中一个组件分支。
- KeepAlive 本身不是业务数据持久化、离线存储或路由缓存策略；被 `max` 淘汰、父级卸载或缓存
  范围改变后，局部状态仍可能消失。
- KeepAlive 可以放在 Transition 内组合使用；本课沿用前置课程的 `mode="out-in"`，但不重复讲
  六个过渡类或 Transition API。

来源（访问日期：2026-07-31）：

- [Vue 中文 KeepAlive 指南：基本使用](https://cn.vuejs.org/guide/built-ins/keep-alive.html#basic-usage)
- [Vue English KeepAlive Guide: Basic Usage](https://vuejs.org/guide/built-ins/keep-alive.html#basic-usage)
- [Vue 内置组件 API：KeepAlive](https://cn.vuejs.org/api/built-in-components.html#keepalive)

### include、exclude 与组件名称

- `include` 和 `exclude` 支持英文逗号分隔字符串、正则表达式，以及由字符串/正则组成的数组。
- 匹配目标是被缓存组件自己的 `name`，不是 tab ID、route name、URL、显示标题或父模板标签。
- 正则和数组是 JavaScript 值，模板中必须用 `v-bind`，例如 `:include="/Panel$/"`。
- 从 Vue 3.2.34 起，使用 `<script setup>` 的 SFC 可从文件名自动推断 `name`；需要稳定公共名称时
  仍可用 `defineOptions({ name: 'EditorPanel' })` 显式冻结。
- include/exclude 动态变化时，v3.5.40 在当前渲染完成后的 post-flush watcher 中清理不再匹配的
  缓存，避免在当前 VNode 更新前提前卸载活动分支。

来源（访问日期：2026-07-31）：

- [Vue 中文 KeepAlive 指南：包含/排除](https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude)
- [Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)

### max、缓存键与 LRU

- `max` 是最多缓存的组件实例数，可传 number 或 string。
- v3.5.40 优先使用 VNode 的显式 `key` 作为缓存键；没有 key 时用具体组件类型。
- 同一组件类型需要并存多份业务实例时，应使用稳定业务 ID 区分 key；持续变化的 key 会制造新缓存项。
- runtime 以 `Map<CacheKey, VNode>` 保存缓存、以 `Set<CacheKey>` 的插入顺序维护最近使用顺序。
  缓存命中时先删除再追加 key；超过 max 时淘汰 Set 中最早的一项，即 LRU。
- 被淘汰项走正常卸载，所以“曾经访问过”不等于“整个会话永久保留”。

来源（访问日期：2026-07-31）：

- [Vue 中文 KeepAlive 指南：最大缓存实例数](https://cn.vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)
- [Vue English KeepAlive Guide: Max Cached Instances](https://vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)
- [Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)

### 激活、停用与最终卸载

- 首次挂载缓存树时调用 `onActivated()`，每次从缓存重新插回 DOM 后也调用。
- 切走并移入缓存时调用 `onDeactivated()`，最终卸载缓存树时也会调用。
- 两个钩子同时作用于缓存根组件及其后代，不能把后代回调误解成重复挂载。
- 可见时才需要的轮询、媒体播放或订阅，应在 activated 启动、deactivated 暂停；需要永久释放的
  资源仍可保留 unmounted 清理，但它不能替代每次停用处理。

来源（访问日期：2026-07-31）：

- [Vue 中文 KeepAlive 指南：缓存实例的生命周期](https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance)
- [Vue 组合式 API：onActivated / onDeactivated](https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated)
- [Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)

## 学习目标

完成本课后，学习者应能：

1. 用 `<component :is="...">` 在导入的 SFC 组件对象之间切换。
2. 区分组件类型、VNode key、组件实例和局部状态四个概念。
3. 预测默认动态切换为什么会重建实例并重置局部状态。
4. 用 KeepAlive 只缓存确实需要恢复的活动子组件。
5. 用组件 `name` 正确配置 include/exclude，并正确绑定正则或数组。
6. 用稳定业务 key 区分同类型的多实例，避免缓存项无限增长。
7. 解释 `max` 的 LRU 淘汰语义和局部缓存不等于持久化的边界。
8. 用 `onActivated()` / `onDeactivated()` 管理仅在可见期运行的外部活动。
9. 按正确嵌套顺序组合 Transition 与 KeepAlive，并完整降级 reduced motion。
10. 通过唯一 Demo 稳定验证状态保留、无缓存重建和 `max=2` 淘汰。

## 正文编排

课程 `blocks` 必须按以下顺序组织，不得把源码、易错点或 Demo 提前打断概念链：

1. **问题入口**：三种工作面板为什么需要切换，以及“隐藏 DOM”与“切换组件实例”的差别。
2. **动态组件**：`<component :is>` 的组件对象/名称两种输入与静态 `is` 陷阱。
3. **身份模型**：组件 type、稳定 key、实例和局部状态之间的关系。
4. **默认切换**：切走即卸载、切回重新创建；先让学习者看到状态重置。
5. **KeepAlive 基本使用**：唯一活动子组件、停用/激活和状态恢复。
6. **缓存范围**：include/exclude 按组件 name 匹配，正则/数组必须动态绑定。
7. **缓存容量**：key 选择、`max` 与 LRU，解释为什么缓存不是持久化。
8. **活动生命周期**：mounted/unmounted 与 activated/deactivated 的职责分离。
9. **与 Transition 组合**：固定为 `Transition > KeepAlive > component`，沿用上一课并降级 motion。
10. **易错使用提示**：恰好呈现下文 8 项，不增删、不合并。
11. **源码推导**：动态类型解析、隐藏容器、延迟写缓存、名称过滤与 LRU。
12. **适用场景与高级用法**：工作区、向导、昂贵视图、同类型多实例和外部持久状态。
13. **唯一 Demo**：依序验证缓存保留、关闭缓存重建、`max=2` LRU 淘汰和重置。
14. **练习、回顾与下一课预告**：Teleport 只标为 planned；到此停止。

## 核心教学示例

### 动态组件：让状态选择组件类型

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import EditorPanel from './EditorPanel.vue'
import PreviewPanel from './PreviewPanel.vue'

type PanelId = 'editor' | 'preview'

const activePanelId = ref<PanelId>('editor')
const panels = {
  editor: EditorPanel,
  preview: PreviewPanel,
}
const activePanel = computed(() => panels[activePanelId.value])
</script>

<template>
  <button type="button" @click="activePanelId = 'editor'">编辑</button>
  <button type="button" @click="activePanelId = 'preview'">预览</button>
  <component :is="activePanel" />
</template>
```

课程使用导入的组件对象，避免把全局注册名称当成默认前提。这里的响应式值是 `activePanelId`；
组件定义表本身保持普通顶层常量，不需要被深层响应式代理。

### 默认行为与缓存行为对照

```vue
<!-- 默认：切走卸载，切回创建新实例 -->
<component :is="activePanel" :key="activePanelId" />

<!-- 缓存：切走停用，切回复用同一实例 -->
<KeepAlive :max="2">
  <component :is="activePanel" :key="activePanelId" />
</KeepAlive>
```

`key` 使用稳定的面板 ID。对不同组件类型而言，没有 key 时组件类型本身也可成为缓存键；示例仍
显式给出业务 ID，使学习者能继续理解“同一类型的多个文档 tab”场景。不得用随机数或时间戳。

### 与 Transition 的固定嵌套

```vue
<Transition name="panel" mode="out-in">
  <KeepAlive :max="2">
    <component :is="activePanel" :key="activePanelId" />
  </KeepAlive>
</Transition>
```

Transition 管理活动视图的进入/离开，KeepAlive 管理实例是否缓存。课程只复用 `mode="out-in"`；
六个类、结束检测和快速反向取消仍属于上一课与 Transition Reference。

### 活动期资源管理

```ts
import { onActivated, onDeactivated } from 'vue'

/** 在面板进入活动状态时恢复轮询。 */
function startPolling(): void {
  // 建立幂等的轮询或订阅
}

/** 在面板停用或最终卸载时暂停轮询。 */
function stopPolling(): void {
  // 释放当前活动句柄
}

onActivated(startPolling)
onDeactivated(stopPolling)
```

示例强调幂等：`onActivated()` 包括首次挂载，不能假定它只在第二次显示后调用；
`onDeactivated()` 也包括最终卸载，清理函数应允许安全重复进入生命周期。

## 易错使用提示

### 1. 把动态表达式写成静态 is 字符串

`is="panels[activePanelId]"` 不会读取变量，而是把整段文本当作静态名称。按钮虽更新状态，实际
渲染类型不会按映射切换。

错误示范：

```vue
<component is="panels[activePanelId]" />
```

正确示范：

```vue
<component :is="panels[activePanelId]" />
```

**后果：** 出现无法解析的组件/元素或始终渲染固定类型，动态切换失效。

来源：[Vue 中文组件基础：动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)
（访问日期：2026-07-31）。

### 2. 不使用 KeepAlive，却期待切回后局部状态仍在

默认动态切换会卸载旧实例；切回后得到全新实例。需要保留的是组件局部状态时，应明确包裹唯一
活动动态组件；需要长期可靠保存的数据应放到组件外。

错误示范：

```vue
<component :is="activePanel" />
```

正确示范：

```vue
<KeepAlive>
  <component :is="activePanel" />
</KeepAlive>
```

**后果：** 切回后表单、局部计数或滚动相关组件状态恢复初值。

来源：[Vue 中文 KeepAlive 指南：基本使用](https://cn.vuejs.org/guide/built-ins/keep-alive.html#basic-usage)
（访问日期：2026-07-31）。

### 3. 在 KeepAlive 中同时放多个活动直接子组件

KeepAlive 不是同时展示多个面板的通用容器；任一时刻只能有一个活动组件实例作为直接子节点。

错误示范：

```vue
<KeepAlive>
  <EditorPanel />
  <PreviewPanel />
</KeepAlive>
```

正确示范：

```vue
<KeepAlive>
  <component :is="activePanel" />
</KeepAlive>
```

**后果：** 开发环境出现单组件子节点警告，并放弃预期的缓存路径。

来源：[Vue 内置组件 API：KeepAlive](https://cn.vuejs.org/api/built-in-components.html#keepalive)
（访问日期：2026-07-31）。

### 4. 用 tab ID、显示标题或 route name 配置 include

include/exclude 匹配的是被缓存组件的 `name`，不是上层业务标识。本课不进入路由缓存，但要明确
route name 即使与标签相似，也不会自动成为组件 name。

错误示范：

```vue
<!-- activePanelId 是 editor，但组件 name 是 EditorPanel -->
<KeepAlive include="editor">
  <component :is="activePanel" />
</KeepAlive>
```

正确示范：

```vue
<!-- EditorPanel.vue -->
<script setup lang="ts">
defineOptions({ name: 'EditorPanel' })
</script>

<!-- Parent.vue -->
<KeepAlive include="EditorPanel">
  <component :is="activePanel" />
</KeepAlive>
```

**后果：** 目标组件没有进入缓存，或本应排除的组件仍保留，实际策略与配置表面不一致。

来源：[Vue 中文 KeepAlive 指南：包含/排除](https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude)
（访问日期：2026-07-31）。

### 5. 把正则写成未绑定的普通字符串

`include="/Panel$/"` 是普通字符串，不是 RegExp。正则和数组必须通过 `v-bind` 传入 JavaScript 值。

错误示范：

```vue
<KeepAlive include="/Panel$/">
  <component :is="activePanel" />
</KeepAlive>
```

正确示范：

```vue
<KeepAlive :include="/Panel$/">
  <component :is="activePanel" />
</KeepAlive>
```

**后果：** 过滤规则无法匹配 `EditorPanel` 等名称，组件意外重建。

来源：[Vue 中文 KeepAlive 指南：包含/排除](https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude)
（访问日期：2026-07-31）。

### 6. 给缓存子组件使用持续变化的 key

v3.5.40 有显式 key 时直接把它作为缓存键。时间戳或随机数会为每次渲染制造新身份，而不是刷新
现有缓存项的最近使用顺序。

错误示范：

```vue
<KeepAlive :max="10">
  <component :is="activePanel" :key="Date.now()" />
</KeepAlive>
```

正确示范：

```vue
<KeepAlive :max="10">
  <component :is="activePanel" :key="activePanelId" />
</KeepAlive>
```

**后果：** 局部状态仍会频繁重置，缓存不断新增并更快淘汰其他有效实例。

来源：[Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)
（访问日期：2026-07-31）。

### 7. 把 max 当成永久保存承诺

`max` 限制缓存实例总数；超过后按 LRU 淘汰并卸载。重要草稿不能只存在于组件局部缓存。

错误示范：

```vue
<!-- 错误地假设访问过的所有草稿都永久保留 -->
<KeepAlive :max="2">
  <component :is="activeDocument" :key="documentId" />
</KeepAlive>
```

正确示范：

```vue
<!-- 持久草稿由外部状态拥有，KeepAlive 只优化返回体验 -->
<KeepAlive :max="2">
  <component :is="activeDocument" :key="documentId" :draft="drafts[documentId]" />
</KeepAlive>
```

**后果：** 返回最久未访问的页面时实例已重建，未外部保存的局部草稿丢失。

来源：[Vue 中文 KeepAlive 指南：最大缓存实例数](https://cn.vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)
（访问日期：2026-07-31）。

### 8. 只用 mounted/unmounted 管理可见期资源

缓存组件切走时只是 deactivated，不会立刻 unmounted。只在 unmounted 停止轮询会让不可见面板继续
工作；只在 mounted 启动也不能表达每次恢复活动。

错误示范：

```ts
onMounted(startPolling)
onUnmounted(stopPolling)
```

正确示范：

```ts
onActivated(startPolling)
onDeactivated(stopPolling)
```

**后果：** 隐藏面板继续请求、播放或订阅，多次切换后产生重复活动和资源浪费。

来源：[Vue 中文 KeepAlive 指南：缓存实例的生命周期](https://cn.vuejs.org/guide/built-ins/keep-alive.html#lifecycle-of-cached-instance)
（访问日期：2026-07-31）。

## 源码推导

### 动态类型解析

v3.5.40 的 `resolveDynamicComponent()` 对字符串先按当前组件/应用的组件注册表解析，找不到时回退
为原字符串；组件对象直接返回。空值会转成 `NULL_DYNAMIC_COMPONENT`，VNode 创建阶段把它归一为
注释节点。因此业务上“没有选择”应显式渲染空态，不应依赖传入 undefined 后的内部注释节点。

来源（访问日期：2026-07-31）：

- [Vue 3.5.40 resolveAssets.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts)
- [Vue 3.5.40 vnode.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts)

### KeepAlive 是 renderer 协作组件

KeepAlive 通过 `__isKeepAlive` 标记让 renderer 走特殊路径。它从 renderer context 获得
`move`、`patch` 和 `unmount` 等内部能力，建立一个未插入真实页面的 `storageContainer`：停用时把
组件 DOM 子树移入该容器，激活时再移回真实容器并 patch 到最新 VNode。实例没有在每次切换时销毁，
但它仍留在组件树中，所以 activated/deactivated 会传播到缓存树后代。

适用推导：缓存适合重建成本高、返回频繁、局部交互状态有短期价值的视图；不活动期间仍占内存，
也可能保留事件或资源，因此不是“所有动态组件默认都包 KeepAlive”的理由。

来源（访问日期：2026-07-31）：

- [Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)
- [Vue 3.5.40 renderer.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)

### 缓存在组件完成渲染后写入

render 阶段只记录 `pendingCacheKey`。`cacheSubtree()` 在 mounted/updated 后把已经渲染完成的真实
子树放入 `cache`；命中时把缓存 VNode 的 `el` 和 `component` 复用给新 VNode，再刷新 key 的 LRU
顺序。这解释了为什么测试只应观察公开 DOM、状态与生命周期，不读取内部 Map、shapeFlag 或隐藏
容器，也不把“点击后同步一行代码内已写缓存”当成公开时序承诺。

来源：[Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)
（访问日期：2026-07-31）。

### 名称过滤和当前活动项清理

源码对异步包装器会优先读取已解析内部组件的 name；普通组件使用 `getComponentName()`。
include/exclude 变化触发 post-flush 清理。若待清理项就是当前活动 VNode，runtime 先重置 keep-alive
标记而不在当前 render 中强行卸载，之后再走正常卸载路径。

本课不教授异步组件或 Suspense；这里只用该分支说明名称过滤属于实际组件身份，不是显示标签。

来源（访问日期：2026-07-31）：

- [Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)
- [Vue 3.5.40 component.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)

### LRU 是有限体验优化，不是持久层

新 key 追加进 `Set`；命中 key 时删除后重新追加；超出 max 时取 `keys.values().next().value` 淘汰。
这个最小机制只回答“哪些组件实例暂时保留”。它不提供序列化、跨刷新恢复、服务端同步、错误恢复或
缓存版本迁移。高级应用必须把不可丢失数据交给外部状态或持久层。

来源：[Vue 3.5.40 KeepAlive.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)
（访问日期：2026-07-31）。

## 适用场景与高级用法

### 适合使用

- 在编辑、预览、设置等少量工作面板之间频繁往返，并希望短期保留光标附近的局部 UI 状态。
- 多步骤向导暂时离开某一步后返回，允许局部组件实例在当前页面生命周期内保留。
- 初始化成本较高的图表、预览或筛选面板，停用期间能正确暂停外部活动。
- 同一组件类型打开多个文档 tab，用稳定文档 ID 作为 key，并设置合理 max。

### 不适合使用

- 不可丢失草稿、购物车、权限或服务端数据；这些需要组件外部状态和明确持久化。
- 组件很轻、很少返回，缓存只会增加内存和生命周期复杂度。
- 需要同时展示多个组件；普通父布局即可，KeepAlive 只拥有唯一活动直接子组件。
- 只想隐藏同一个实例且不切换组件类型；可先评估 `v-show`，不要用缓存替代简单显隐。

### 高级用法边界

- 动态 include/exclude 适合用户权限或工作区模式变化，但必须用稳定组件 name，并接受缓存被清理。
- `max` 应按内存成本与返回频率设置；不冻结“越大越好”的数值规则。
- 同类型多实例必须用稳定业务 key；组件 type 只能区分不同组件定义。
- 与 Transition 组合时保持 `Transition > KeepAlive > component`，reduced motion 只取消视觉运动，
  不改变缓存、切换、状态文本或键盘流程。
- 嵌套 KeepAlive、异步组件、Suspense、SSR 和路由视图缓存留给各自专题，本课不展开。

## 唯一 Demo 规格

### 文件与公开 ID

唯一公开 Demo 文件：

`src/content/demos/vue/core/learn/intermediate/dynamic-components-keep-alive/component-cache-lab-demo.vue`

由 registry 约定自动生成唯一公开 ID：

`vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo`

允许三个仅供该 Demo 导入的私有面板：

- `parts/EditorPanel.vue`
- `parts/PreviewPanel.vue`
- `parts/SettingsPanel.vue`

`parts/` 不匹配公开 glob，不产生额外 Demo ID。不得新增第二个顶层 Demo、原理动画、全局样式、
第三方依赖或网络请求。

### 教学场景与状态

Demo 名为“组件缓存实验台”，包含一个连续工具界面，不使用卡片套卡片：

1. 三个原生按钮切换“编辑 / 预览 / 设置”，按钮用 `aria-pressed` 暴露当前选择。
2. 三个面板都是不同的导入 SFC，并各自拥有从 0 开始的局部计数。
3. 初始 `cacheEnabled = true`，KeepAlive 固定 `:max="2"`，活动面板为 editor。
4. “关闭缓存 / 开启缓存”按钮切换缓存模式；切换模式会销毁旧分支，不能宣称旧缓存继续存在。
5. “重置实验”恢复缓存开启、editor 活动，并通过稳定 `cacheEpoch` 重建 KeepAlive，使全部局部计数
   确定地回到 0。
6. 活动面板外层用上一课的 Transition `mode="out-in"`；所有业务终态独立于动画是否启用。
7. 永久可见的 `role="status" aria-live="polite" aria-atomic="true"` 汇总当前面板、缓存开关和
   容量，例如“当前：编辑；缓存：开启；最多缓存：2”。局部计数使用带可读标签的 `<output>`。

### 状态与方法骨架

```ts
type PanelId = 'editor' | 'preview' | 'settings'

interface PanelOption {
  id: PanelId
  label: string
  component: Component
}

const panels: PanelOption[] = [
  { id: 'editor', label: '编辑', component: EditorPanel },
  { id: 'preview', label: '预览', component: PreviewPanel },
  { id: 'settings', label: '设置', component: SettingsPanel },
]

const activePanelId = ref<PanelId>('editor')
const cacheEnabled = ref(true)
const cacheEpoch = ref(0)

const activePanel = computed(() => panels.find((panel) => panel.id === activePanelId.value)!)

/** 切换到指定工作面板。 */
function selectPanel(panelId: PanelId): void {
  activePanelId.value = panelId
}

/** 切换组件实例缓存模式。 */
function toggleCache(): void {
  cacheEnabled.value = !cacheEnabled.value
}

/** 恢复实验初态并清空当前 KeepAlive 缓存。 */
function resetLab(): void {
  activePanelId.value = 'editor'
  cacheEnabled.value = true
  cacheEpoch.value += 1
}
```

每个新增方法定义上方保留规范中文注释。不得使用 `Date.now()`、随机数、timer 或访问 KeepAlive
内部实例来“清缓存”；`cacheEpoch` 只在显式重置操作时递增，作为声明式重建边界。

### 稳定 selector 契约

| 区域 | 稳定定位 | 初态 | 操作后的最终状态 |
| --- | --- | --- | --- |
| Demo 根 | `.component-cache-lab-demo` | 恰好一个 | 始终存在 |
| 面板选择 | `[data-panel-option="editor|preview|settings"]` | editor 为 `aria-pressed="true"` | 与最后选择一致 |
| 缓存开关 | `[data-testid="cache-toggle"]` | `aria-pressed="true"`、文本“关闭缓存” | 关闭时为 false、文本“开启缓存” |
| 活动面板 | `[data-testid="active-panel"]` | `data-panel="editor"` | 与最后选择一致且恰好一个 |
| 局部计数 | `[data-state="local-count"]` | `0` | 缓存命中保留，重建/淘汰后回到 0 |
| 增量按钮 | `[data-testid="increment-local-count"]` | 可用 | 每次激活精确加 1 |
| 汇总状态 | `[data-state="cache-summary"]` | 当前编辑、缓存开启、max 2 | 与最终业务状态一致 |
| 重置按钮 | `[data-testid="reset-cache-lab"]` | 可用 | editor、缓存开启、计数 0 |

不要选择 Transition 临时 class、内部隐藏容器、VNode、组件 uid 或由渲染顺序生成的 selector。

### 确定性交互序列

1. 进入课程，确认唯一 Demo 正常解析，`.demo-box .missing` 为 0，控制台无 warning/error。
2. editor 初态计数 0；键盘聚焦“局部计数 +1”并按 Enter，计数变 1。
3. 切到 preview，确认新面板计数 0；再切回 editor，缓存开启时计数仍为 1。
4. 点击“关闭缓存”，当前 editor 重新创建且计数为 0；在 editor 加到 1，切 preview 再切回 editor，
   确认再次为 0。
5. 点击“重置实验”，确认缓存开启、editor 活动、计数 0。
6. 在 editor 加到 1，依次切 preview、settings。由于 `max=2`，editor 成为最久未访问项并被淘汰；
   切回 editor 后计数为 0。
7. 重置，再按 editor -> preview -> editor 访问，证明未超过容量时 editor 状态保留。
8. 快速连续选择 preview、settings、editor，最终只有 editor 活动，汇总与最后意图一致，无重复节点。
9. `page.emulateMedia({ reducedMotion: 'reduce' })` 后完整复跑 2 至 7，业务断言完全相同。
10. 至少用 Space 激活一次缓存按钮，用 Enter 激活一次面板或计数按钮；焦点可见且没有键盘陷阱。

自动化不得使用 `waitForTimeout()`、固定动画毫秒、截图时刻、内部缓存 Map 或临时
`*-enter-*` / `*-leave-*` class 判断功能完成。Playwright 按最终可见状态和 locator 条件自动等待。

### Demo 样式与 reduced motion

- 只使用 flex、flex-wrap、margin 和 padding 排列，不使用 CSS Grid 或 `gap` / `row-gap` /
  `column-gap`。
- Demo 是一个连续实验台；面板可有边界，但不创建卡片套卡片或装饰性浮层。
- 所有交互使用原生 `<button type="button">`，具有可见焦点样式和至少 44px × 44px 触控区域。
- flex 子项设置 `min-width: 0`；长按钮名、状态和面板文本允许换行，不用固定高度或省略号隐藏。
- Transition 只过渡 opacity 和小幅 transform，不用 layout 属性驱动动画。
- `prefers-reduced-motion: reduce` 下 transition 设为 none，from/to 位移清零；组件切换、缓存、
  LRU、状态文本和焦点顺序必须保持不变。

建议降级规则：

```css
@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }

  .panel-enter-from,
  .panel-leave-to {
    opacity: 1;
    transform: none;
  }
}
```

来源：[W3C Media Queries Level 5：prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)
（访问日期：2026-07-31）。

### 390px、200% 文本、触控与键盘契约

- 视口固定为 390 × 844；控制区允许换行并在窄屏变成单列，页面级无横向滚动。
- 断言 `document.documentElement.scrollWidth <= window.innerWidth`。
- Demo 内每个 button 的 `getBoundingClientRect()` 宽、高均至少 44 CSS px；可见文字换行后仍完整。
- 对 Demo 内 h3、h4、p、label、button、output 和状态节点注入 `font-size: 200% !important`；每个
  目标 `scrollWidth <= clientWidth`、`scrollHeight <= clientHeight`，边界不越过 Demo 根。
- 200% 文本下控件与输出不重叠，焦点环不被 overflow 裁切，页面仍能单方向滚动阅读。
- 所有功能可通过 Tab、Shift+Tab、Enter 与 Space 操作，不要求方向键或特定按键时序。
- `aria-pressed`、活动面板 heading、局部计数 output 和完整 live status 共同传达状态；颜色、动画、
  DOM 是否移动都不是唯一反馈。
- normal motion 和 reduced motion 两种条件下重复相同键盘、终态、溢出和触控尺寸断言。

官方依据（访问日期：2026-07-31）：

- [WCAG 2.2：Resize Text 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)：
  200% 文本不得丢失内容或功能。
- [WCAG 2.2：Reflow 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)：
  放大和窄视口避免二维滚动；本项目 390px 验收是具体工程契约。
- [WCAG 2.2：Target Size Enhanced 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)：
  44 × 44 CSS px 目标；本 Demo 统一采用该更严格尺寸。
- [WCAG 2.2：Keyboard 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)：
  所有功能可通过键盘且不要求特定按键时序。
- [WCAG 2.2：Status Messages 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)：
  状态更新可由辅助技术获知而无需移动焦点。

## 练习

### 练习一：从状态重置到按需缓存

给定 editor/preview 动态切换和 editor 局部输入。先说明切回后为什么重置，再只给活动动态组件包
KeepAlive，使输入恢复。补充一句哪些数据仍不应只依赖组件缓存。

### 练习二：修复名称过滤与不稳定 key

给定 `include="editor"`、组件名 `EditorPanel` 和 `:key="Date.now()"`。改为按组件 name 匹配，并
使用稳定 `document.id`。解释 name 决定缓存范围、key 决定缓存实例身份，两者不是同一概念。

### 练习三：验证 LRU 与活动生命周期

用 `max=2` 依次访问 A、B、C、A，记录 A 的局部计数为什么重置；再为一个轮询面板补充
`onActivated()` / `onDeactivated()`，确保停用时没有继续活动。测试只断言公开结果，不读取内部 Map。

练习不要求修改 KeepAlive Reference，也不实现 Teleport、Suspense、异步组件、路由缓存或持久层。

## 课程 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.dynamic-components-keep-alive',
  type: 'lesson',
  title: '动态组件与 KeepAlive',
  summary: '用动态组件组织互斥视图，并用可控缓存保留实例状态和管理活动生命周期',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.transitions'],
  related: [
    'vue.core.learn.intermediate.transitions',
    'vue.core.learn.basics.component-basics',
    'vue.core.learn.intermediate.lifecycle-update-timing',
    'vue.core.reference.built-ins.keep-alive',
  ],
  tags: [
    '动态组件',
    'KeepAlive',
    '组件身份',
    '缓存',
    'LRU',
    'onActivated',
    'onDeactivated',
  ],
  sources: [
    {
      title: 'Vue 中文组件基础：动态组件',
      url: 'https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components',
    },
    {
      title: 'Vue 中文 KeepAlive 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/keep-alive.html',
    },
    {
      title: 'Vue 内置组件 API：KeepAlive',
      url: 'https://cn.vuejs.org/api/built-in-components.html#keepalive',
    },
    {
      title: 'Vue 组合式 API：onActivated / onDeactivated',
      url: 'https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated',
    },
    {
      title: 'Vue 3.5.40 KeepAlive.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts',
    },
    {
      title: 'Vue 3.5.40 resolveAssets.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 60,
})
```

上述 ID、唯一 prerequisite、related 四项及顺序、唯一公开 Demo ID、恰好 8 个易错点和 60 分钟
均为冻结契约。Teleport 仍 planned，不进入 prerequisite、related、sources 或当前实现文件。

## 正文结构化块要求

- `objectives`：覆盖动态类型、身份、默认重建、缓存策略、LRU、活动生命周期和稳定验证。
- `blocks`：严格遵循“正文编排”，先行为再机制，不把源码段放到入门概念之前。
- `demo`：只出现唯一公开 ID，description 明确保留、重建与 LRU，`playground: true`。
- `pitfalls`：恰好 8 项，逐项转换为 description、consequence、wrong、correct，不添加第九项。
- `exercise`：至少落地三个练习中的两个，必须覆盖缓存身份或生命周期。
- `recap`：覆盖 `:is`、type/key/instance、默认卸载、唯一子节点、name 过滤、LRU、activated /
  deactivated、Transition 组合和缓存非持久化边界。

建议 recap：

1. `<component :is>` 选择组件类型，静态 `is` 不会求值表达式。
2. 默认切换会卸载旧实例；KeepAlive 才让非活动实例停用并可恢复。
3. type/key 决定缓存身份，include/exclude 的组件 name 决定缓存范围。
4. max 使用 LRU 淘汰，缓存不能承担不可丢失数据的持久化。
5. activated/deactivated 管理可见期活动，并同时覆盖首次挂载/最终卸载边界。
6. Transition 管视觉交接，KeepAlive 管实例缓存，reduced motion 不改变业务终态。
7. 自动化只断言公开 DOM、语义状态和确定交互，不读取 runtime 内部缓存。

## 最小 TDD 接缝

实现时只建立两个 focused 红灯和一条现有 E2E 延伸，不为 8 个易错点分别加测试。

### 红灯一：课程 catalog 契约

修改 `src/content/catalog/vue-core-track.spec.ts`：

- intermediate 公开顺序在 transitions 后新增本课程，track total 从 19 变为 20。
- prerequisite 精确为 `['vue.core.learn.intermediate.transitions']`。
- related 精确等于 metadata 冻结的四项，且每个 ID 都能解析。
- transitions 的 next 变成本课，本课没有 available next；不得把 planned teleport 解析为正文。

focused Vitest 的预期红因只能是条目尚未实现或 manifest 仍为 planned。

### 红灯二：唯一 Demo 公开面

修改 `src/content/interactive/registry.spec.ts`：

- 中级公开 Demo 列表只新增
  `vue.core.learn.intermediate.dynamic-components-keep-alive.component-cache-lab-demo`。
- `resolveDemo()` 对该 ID 非 null。
- `parts/EditorPanel.vue`、`PreviewPanel.vue`、`SettingsPanel.vue` 不形成公开 ID。
- 不新增第二个顶层 Demo 或原理动画。

### 绿灯与最小回归

添加课程、Demo/私有 parts，并把 manifest 单项转为 available 后，重跑同一 focused 命令。随后只在
现有 `tests/e2e/progress.spec.ts` 的 390px 长路径末尾追加本课：

1. 从 transitions 点击“下一篇：动态组件与 KeepAlive”。
2. 到达 `/learn/vue/core/intermediate/dynamic-components-keep-alive`，唯一 Demo 正常解析。
3. 依次执行缓存保留、关闭缓存重建、max=2 LRU、重置和快速切换。
4. normal/reduced motion 下重复主交互终态和键盘操作。
5. 验证 390px、200% 文本、44px × 44px 目标、状态可读与无横向滚动。
6. 确认页面没有可导航“下一篇：Teleport”，因为下一课仍 planned。

## 实现与集成清单

后续实施只需评估并修改：

- `src/content/entries/learn/vue/core/intermediate/dynamic-components-keep-alive.ts`：metadata、正文、
  8 个 pitfalls、练习、recap 与唯一 Demo block。
- `src/content/demos/vue/core/learn/intermediate/dynamic-components-keep-alive/component-cache-lab-demo.vue`：
  唯一公开 Demo。
- 同目录 `parts/EditorPanel.vue`、`parts/PreviewPanel.vue`、`parts/SettingsPanel.vue`：私有状态面板。
- `src/content/catalog/manifests/vue-core-track.ts`：只把本课从 planned 改为 available，并删除该
  planned 项上的 title/summary 兜底字段；teleport 不变。
- `src/content/catalog/vue-core-track.spec.ts`：20 课顺序、prerequisite、related 与 neighbor。
- `src/content/interactive/registry.spec.ts`：唯一公开 Demo ID。
- `tests/e2e/progress.spec.ts`：延长现有 390px 路径，不新建重复长路径。
- `docs/重构实施计划.md`：实施和全部验证完成后更新为 `20 available / 40 planned`。

无需修改：

- `src/content/schema/*`、`src/content/interactive/registry.ts` 或 registry glob。
- `src/content/entries/reference/vue/core/built-ins/keep-alive.ts` 及其 Reference Demo。
- Transition / TransitionGroup Reference 或上一课实现。
- Teleport、Suspense、Router 课程、全局样式或路由实现。

## 长路径进入方式

课程 available 后有三种合法入口：

1. 从 `/learn/vue/core/intermediate/transitions` 点击“下一篇：动态组件与 KeepAlive”，这是现有
   390px Playwright 长路径应采用的入口。
2. 从 `/learn/vue/core` 的中级课程总览进入“内置组件与过渡”，再选择本课。
3. 直接刷新 `/learn/vue/core/intermediate/dynamic-components-keep-alive`，验证稳定深链接和异步加载。

related 可回到“过渡效果”“组件基础”“生命周期与更新时机”和现有 KeepAlive Reference。Teleport
仍 planned，所以本课完成后没有可导航下一篇。

## 最终验证建议

实施批次完成后按最小到完整顺序验证：

1. focused `vue-core-track.spec.ts` 红灯后绿灯。
2. focused `interactive/registry.spec.ts` 红灯后绿灯。
3. 全量 Vitest、`npm run type-check`、`npm run lint`、`npm run format:check`。
4. `npm run build` 与 `git diff --check`；本仓库是 Vue/Vite 项目，不是纯 HTML 项目。
5. 使用用户已运行的本地服务执行现有 390px Playwright 长路径，不主动启动第二个服务或打开页面。
6. normal/reduced motion 下执行同一终态断言，无固定 sleep、无内部缓存断言。
7. 静态检查新增前端样式不存在 CSS `grid`、`gap`、`row-gap`、`column-gap`。
8. 检查所有新增方法定义上方有规范中文注释，各文件不超过约 1000 行。
9. 核对三条 Vue 学习路线精确为 `20 available / 40 planned`，Teleport 仍 planned。
10. Standards / Spec 双轴复审目标为 PASS / 0 finding。

本调研任务本身不运行构建、不启动服务、不打开页面，也不修改任何实现文件。

## 明确排除与停止边界

- 不修改现有 KeepAlive Reference、Reference Demo 或其既有五个 pitfalls。
- 不实现 `vue.core.learn.intermediate.teleport`，它继续保持 planned。
- 不实现 Teleport、Suspense、异步组件、SSR、嵌套 KeepAlive 或路由缓存。
- 不把 KeepAlive 描述为 Pinia、持久化、跨刷新恢复或路由页面缓存方案。
- 不修改 router、Schema、registry glob、全局样式或上一课 Transition 实现。
- 不新增第二个公开 Demo、原理动画、第三方依赖、网络请求、随机数或 timer。
- 不把本课完成写成 Vue Core 中级、Stage 6 或全部内置组件课程关闭。
- 达到 `20 available / 40 planned`、完成本课长路径并确认 Teleport 仍 planned 后立即停止。

## 固定来源清单

以下每项均于 2026-07-31 访问。

### Vue 官方中文与英文文档

- [中文组件基础：动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)：
  `component :is`、组件对象/名称和默认卸载。
- [English Components Basics: Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)：
  英文语义交叉核对。
- [中文 KeepAlive 指南](https://cn.vuejs.org/guide/built-ins/keep-alive.html)：基本缓存、名称过滤、
  max 与缓存生命周期。
- [English KeepAlive Guide](https://vuejs.org/guide/built-ins/keep-alive.html)：英文语义交叉核对。
- [内置组件 API：KeepAlive](https://cn.vuejs.org/api/built-in-components.html#keepalive)：公开 props、
  唯一活动直接子组件、Transition 组合。
- [组合式 API：onActivated / onDeactivated](https://cn.vuejs.org/api/composition-api-lifecycle.html#onactivated)：
  活动与停用生命周期签名。
- [Vue KeepAlive 官方原始 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/built-ins/keep-alive.md)：
  指南原始内容复核。

### vuejs/core v3.5.40 固定源码

- [`KeepAlive.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/KeepAlive.ts)：
  renderer 协作、隐藏容器、cache/keys、名称过滤、延迟写缓存、LRU 与生命周期。
- [`resolveAssets.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/helpers/resolveAssets.ts)：
  `resolveDynamicComponent()` 的名称/对象/空值解析。
- [`vnode.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/vnode.ts)：
  空动态类型的 VNode 归一和组件 VNode 身份。
- [`component.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/component.ts)：
  组件名称解析。
- [`renderer.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/renderer.ts)：
  kept-alive VNode 的 activate/deactivate 渲染路径。

### W3C 可访问性规范

- [Resize Text 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)：200% 文本。
- [Reflow 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)：窄视口重排。
- [Target Size Enhanced 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)：
  44 × 44 CSS px。
- [Keyboard 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)：键盘可操作。
- [Status Messages 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)：状态通知。
- [Media Queries Level 5：prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)：
  减少非必要运动的用户偏好。
