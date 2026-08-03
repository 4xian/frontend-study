# Vue Core 中级课程：Teleport 调研

> 查证日期：2026-08-01
> 适用版本：Vue 3.5.40
> 资料范围：Vue 官方中文与英文 Teleport 指南、内置组件 API、`vuejs/docs` 官方 Markdown、
> `vuejs/core` v3.5.40 固定标签源码，以及实现模态交互所必需的 W3C WAI-ARIA / WCAG 规范。

## 冻结结论

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.teleport` |
| 标题 | `Teleport` |
| 阶段 | `intermediate` |
| 唯一直接前置 | `vue.core.learn.intermediate.dynamic-components-keep-alive` |
| 线性位置 | “动态组件与 KeepAlive”之后；本批到此结束 |
| 唯一公开 Demo ID | `vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo` |
| 易错点数量 | 恰好 8 个 |
| 适用版本 | Vue 3.5.40 |
| 预计时长 | 60 分钟 |
| 课程长路径 | `/learn/vue/core/intermediate/teleport` |
| 实施前总量 | Vue 三条学习路线 `20 available / 40 planned` |
| 实施后总量 | Vue 三条学习路线 `21 available / 39 planned` |

本批只新增 Teleport 课程、唯一公开 Demo、目录接入和该课的 390 × 844 Playwright 回归。
`src/content/entries/reference/vue/core/built-ins/teleport.ts` 与其
`vue.core.reference.built-ins.teleport.teleport-demo` 必须保持不改。不会实现 Suspense，也不会开始
任何 Suspense 或其后续课程；课程末尾不得出现可导航的“下一篇”。

## 调研边界与证据状态

本调研通过 Tavily 定位和提取一手材料，技术结论只采用 Vue 官方中文/英文文档、`vuejs/docs`、
`vuejs/core` v3.5.40 固定源码及必要 W3C 规范。搜索结果只用于找到原文，社区文章和摘要不作为
依据。

已核对的本地事实：

- `vue-core-track.ts` 已按 `transitions`、`dynamic-components-keep-alive`、`teleport` 排列该分类；
  前两项为 `available`，Teleport 为本批唯一 `planned` 项。
- 三条 Vue 学习路线当前精确为 `20 available / 40 planned`；仅把 Teleport 变为 available 后，
  精确为 `21 available / 39 planned`。
- 现有 Teleport Reference 已覆盖公开 props、目标时机、逻辑树、共享目标及五项速查易错点；课程
  只组织学习路径、真实对话框边界与可回归实验，不把 Reference 重写成课程正文。
- `vue@3.5.40` 是本仓库锁定版本。`defer` 的源码行为和文档均以此版本为准。

## 当前仓库审查

### Catalog 与课程顺序

`src/content/catalog/manifests/vue-core-track.ts` 的 `built-ins-and-transitions` 分类顺序必须保持：

1. `vue.core.learn.intermediate.transitions`：已开放。
2. `vue.core.learn.intermediate.dynamic-components-keep-alive`：已开放，是本课唯一 prerequisite。
3. `vue.core.learn.intermediate.teleport`：本批从 planned 变为 available。

实施后，动态组件与 KeepAlive 课程出现可导航的“下一篇：Teleport”。Teleport 作为当前路线末项，
不得提供任何下一课链接。Suspense 的 Reference 虽已存在，但不是本课的 related，也不是本批课程
实现对象。

### Schema、课程模板与资产注册

课程必须使用 `defineLessonMeta()` 和 `defineLesson()`，并延续已上线中级课程模板：

- metadata 含 `id`、`type`、`title`、`summary`、ecosystem/module/collection、level、
  prerequisites、related、tags、sources、appliesTo、verifiedAt、estimatedMinutes。
- 正文含非空 `objectives`、`blocks` 和 `recap`；练习使用 `exercises` 或结构化 exercise block。
- “易错使用提示”标题后紧跟一个 `pitfalls` block；8 项均必须给出 title、description、
  consequence、wrong 和 correct。
- 唯一公开 Demo ID 由 `src/content/demos/` 下的相对路径派生，不修改 registry glob、schema 或
  router。该 Demo 不需要私有 `parts/` 子组件。
- 后续所有新增方法上方写规范中文注释；文件保持在约 1000 行以内。

### Reference 的职责边界

`src/content/entries/reference/vue/core/built-ins/teleport.ts` 已承担 API 速查职责：

- `TeleportProps` 中的 `to`、`disabled`、`defer` 及 3.5+ 标记。
- 默认目标时机、`defer` 同 tick 限制、逻辑树与 DOM 位置、同目标追加顺序。
- 现有 Reference Demo 的原地裁剪与传送到 `body` 对比。
- 5 个 Reference pitfalls 及最小源码摘录。

新课程不能修订该 Reference、其 Demo、样式、按钮尺寸或既有文案。课程从上一课“组件实例是否缓存”
转向“组件逻辑归属不变，而渲染结果可位于另一处 DOM”，以真实可访问对话框的决策与回归路径组织内容。

## 官方事实

### Teleport 改变 DOM 位置，而非组件关系

- `<Teleport>` 将其插槽内容渲染到另一个 DOM 位置，适合脱离祖先 `overflow`、`transform`、
  局部层叠上下文等布局约束的覆盖层。
- 它只改变渲染后的 DOM 结构。被传送组件依然是声明 Teleport 的组件的逻辑后代；props、emit、
  provide/inject 和 Vue Devtools 父子关系不迁移到目标 DOM 所属组件。
- 因而状态应继续由逻辑父组件拥有。目标节点只是 DOM 容器，不能借此从“目标组件”取得注入或
  改变事件上报路径。

来源：

- [Vue 中文 Teleport 指南：基本使用与搭配组件](https://cn.vuejs.org/guide/built-ins/teleport.html)
- [Vue English Teleport Guide: Basic Usage and Using with Components](https://vuejs.org/guide/built-ins/teleport.html)
- [Vue Teleport 官方 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/built-ins/teleport.md)

### `to`：CSS selector 或实际 `HTMLElement`

`to` 是必填目标，其公开类型为 `string | HTMLElement`。字符串由渲染器的 `querySelector` 解析，
所以可以是 `body`、`#modal-root`、`.overlay-root` 或 `[data-teleport-host]`；实际元素对象也可直接
传入。课程以稳定且已存在的 `body` 作为 Demo target，正文必须同时解释两种输入形式。

```vue
<!-- 选择器：目标在应用挂载前已由 index.html 提供 -->
<Teleport to="#modal-root">
  <DialogPanel />
</Teleport>

<!-- 元素对象：host 已存在，且只在客户端初始化后传入 -->
<Teleport :to="modalHost">
  <DialogPanel />
</Teleport>
```

`modalHost` 不是“稍后会出现的组件名”，而是一个已连接到文档的 `HTMLElement`。生产代码应让目标
拥有明确的创建者和生命周期；不应把空 ref、任意用户输入或未经验证的 selector 当作目标。

来源：

- [Vue 内置组件 API：Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)
- [Vue 3.5.40 Teleport.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)

### 默认目标时机与 `defer`

- 普通 Teleport 在挂载时解析 `to`。目标必须已经在 DOM 中；若目标同样由 Vue 渲染，必须先于该
  Teleport 挂载，理想情况下目标在整个 Vue 应用 DOM 树之外。
- `defer` 从 Vue 3.5 起可把目标解析推迟到当前 mount/update tick 的 post-render 阶段。这允许同一
  模板中、位置更靠后的 Vue 目标被找到。
- `defer` 不是轮询、订阅或重试。目标在请求完成、计时器或下一次 tick 才出现时，仍会失败并报告
  target 错误。
- 不能以“当前测试环境恰好先生成了目标”为契约。目标的创建顺序或同 tick 关系必须在模板和测试中
  明确表达。

```vue
<!-- 有效：二者在同一次挂载中创建 -->
<Teleport defer to="#late-dialog-host">
  <DialogPanel />
</Teleport>
<div id="late-dialog-host"></div>

<!-- 无效：目标要等未来异步状态才创建 -->
<Teleport defer to="#late-dialog-host">
  <DialogPanel />
</Teleport>
<div v-if="requestFinished" id="late-dialog-host"></div>
```

来源：

- [Vue 中文 Teleport 指南：延迟解析](https://cn.vuejs.org/guide/built-ins/teleport.html#deferred-teleport)
- [Vue English Teleport Guide: Deferred Teleport](https://vuejs.org/guide/built-ins/teleport.html#deferred-teleport)
- [Vue 3.5.40 Teleport.ts：`queuePostRenderEffect`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)

### `disabled` 保留原地内容，且可动态切换

`disabled` 为 true 时，内容保留在声明位置而不移动到目标；该 prop 可以动态改变，适合桌面覆盖层
与窄屏行内面板使用同一份状态和模板的场景。它不创建第二个组件实例，也不改变逻辑父子关系，只
改变渲染 children 的实际容器。

模板 attribute 未绑定时是字符串。v3.5.40 的 `isTeleportDisabled()` 把任何真值和空字符串视作
禁用，故 `disabled="false"` 仍然为真；必须绑定布尔值。

```vue
<!-- 错误：非空字符串为真 -->
<Teleport to="body" disabled="false"><DialogPanel /></Teleport>

<!-- 正确：传入 boolean -->
<Teleport to="body" :disabled="renderInline"><DialogPanel /></Teleport>
```

来源：

- [Vue 中文 Teleport 指南：禁用 Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html#disabling-teleport)
- [Vue 内置组件 API：Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)
- [Vue 3.5.40 Teleport.ts：`isTeleportDisabled`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)

### 多个 Teleport 共享目标是追加，不是弹层管理器

多个 Teleport 可以写入同一 target。Vue 对每一个挂载执行简单追加，较晚挂载的内容位于较早挂载的
内容之后。这里的顺序是挂载顺序，不是业务优先级、z-index 规则、焦点顺序，也不能泛化为每一次
源码声明顺序都永久决定层级。

需要弹层栈、互斥、优先级、焦点恢复或读屏顺序时，业务层应拥有一个有序数组，并由**一个**
Teleport 渲染该数组；不要让彼此无感知的 Teleport 实例争夺层级。

```vue
<!-- 不把两个独立追加结果误当为完整的弹层栈 -->
<Teleport to="#layers"><ConfirmDialog /></Teleport>
<Teleport to="#layers"><AlertDialog /></Teleport>

<!-- 业务数据决定顺序；一个 Teleport 输出整个层 -->
<Teleport to="#layers">
  <DialogLayer v-for="layer in orderedLayers" :key="layer.id" :layer="layer" />
</Teleport>
```

来源：[Vue 中文 Teleport 指南：多个 Teleport 共享目标](https://cn.vuejs.org/guide/built-ins/teleport.html#multiple-teleports-on-the-same-target)。

### 与 Transition 的组合

Teleport 解决实际 DOM 位置；Transition 解决节点进入与离开的视觉交接。官方明确允许两者组合以
创建带动画的模态框，但不会新增 Teleport 专属动画语义。课程固定使用“Teleport 外层、Transition
包裹条件 dialog 节点”的结构；上一课已负责六类、mode、结束检测和 keyed identity 的完整教学。

```vue
<Teleport to="body">
  <Transition name="dialog">
    <section v-if="open" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <h2 id="dialog-title">移到 body 的对话框</h2>
      <button type="button" @click="close">关闭</button>
    </section>
  </Transition>
</Teleport>
```

动画只能补充视觉反馈。normal motion 与 reduced motion 都必须有相同的打开、关闭、焦点和状态
终态，测试不能等待固定毫秒或断言临时 `*-enter-*` / `*-leave-*` class。

来源：

- [Vue 中文 Teleport 指南：基本使用](https://cn.vuejs.org/guide/built-ins/teleport.html)
- [Vue 中文 Transition 指南](https://cn.vuejs.org/guide/built-ins/transition.html)
- [W3C Media Queries Level 5：`prefers-reduced-motion`](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

### 模态可访问性边界

Teleport 不会把任意内容自动变成模态框，也不自动处理焦点、Escape、焦点恢复、背景不可交互或可访问
名称。只有满足 W3C Dialog (Modal) Pattern 的完整语义时，才可给对话框声明 `aria-modal="true"`：

- 对话框有 `role="dialog"`、可访问名称（本课用 `aria-labelledby`）及至少一个可见关闭路径。
- 打开后焦点进入对话框；Tab 和 Shift+Tab 留在其可聚焦后代中；Escape 关闭；关闭后焦点通常回到
  触发按钮。
- 对话框外的整个应用对所有用户都不可交互且在视觉上被遮蔽。Demo 的 overlay 模式可把 `#app`
  设为原生 `inert`，再把对话框 Teleport 到 `body`；关闭或卸载时必须撤销 inert。
- `disabled` 行内模式不是模态框：应使用普通 `role="region"` / 标题，不设 `aria-modal`，也不制造
  假焦点陷阱。它的教学目的仅是比较 DOM 位置，不是冒充移动端模态。

不得只加 `role="dialog"` 和 `aria-modal` 就宣称完成无障碍，也不得用 `aria-hidden="true"` 包裹住
dialog 本身。W3C APG 特别指出，若使用 `aria-hidden` 隐藏背景，dialog 不能处在该隐藏节点内；将
目标作为 `body` 的直接层可避免该结构冲突，但不会替代焦点和背景交互管理。

来源：

- [W3C WAI-ARIA APG：Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA 1.2：`aria-modal`](https://www.w3.org/TR/wai-aria-1.2/#aria-modal)
- [WCAG 2.2：Keyboard 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)

## 学习目标

完成本课后，学习者应能：

1. 解释 Teleport 为什么只移动 DOM 位置而不改变组件逻辑树、props、事件和注入关系。
2. 用 CSS selector 或已存在的 `HTMLElement` 作为 `to`，并为目标创建时机建立明确契约。
3. 区分默认目标解析与 `defer` 的“同一 mount/update tick”范围，不把它当成异步等待。
4. 动态切换 `disabled`，并解释为什么 `disabled="false"` 仍会禁用传送。
5. 预测多个同目标 Teleport 的追加顺序，并将层级、互斥和焦点交给业务层管理。
6. 按“Teleport + Transition”职责分离组合覆盖层与视觉交接。
7. 区分 Teleport 与可访问模态框，完成打开、焦点、键盘、关闭、恢复焦点和背景 inert 的最低闭环。
8. 使用稳定的公开 selector，在 390px、200% 文本、44px 触控和 reduced motion 下验证同一业务终态。

## 正文编排

课程 `blocks` 严格按下列顺序组织，先建立可观察行为，再解释渲染器与边界：

1. **问题入口**：上一课缓存实例，本课仍让同一逻辑组件管理状态，却把覆盖层 DOM 移离受裁剪祖先。
2. **双树模型**：组件逻辑树与实际 DOM 位置不同；props、emit、provide/inject 仍沿逻辑树工作。
3. **`to` 与目标所有权**：selector / HTMLElement、目标须先存在、由谁创建和拥有 target。
4. **`defer` 的窄时机**：同 tick 的后置目标可用，异步未来目标不可用。
5. **`disabled` 的响应式位置切换**：overlay 与行内语义的分离，以及布尔绑定陷阱。
6. **共享 target**：简单追加、挂载顺序与“一个有序 layer 管理器”的业务边界。
7. **Transition 组合**：Teleport 管位置，Transition 管条件节点的视觉交接；reduced motion 不改变状态。
8. **模态可访问性**：Teleport 不等于 dialog；overlay 模式与 inline 模式分别使用真实语义。
9. **易错使用提示**：恰好呈现下文 8 项，不增删、不合并。
10. **源码推导**：字符串目标解析、主锚点/目标锚点、`disabled` 容器切换与 `defer` 的 post-render 调度。
11. **唯一 Demo**：先验证 body 中的 overlay，再验证行内 disabled 模式、逻辑事件和键盘闭环。
12. **练习、回顾与停止边界**：只回到现有 related；不开始 Suspense 或任何后续课程。

## 核心教学示例

### 用逻辑父组件管理被传送的对话框

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const confirmed = ref(false)
</script>

<template>
  <button type="button" @click="open = true">打开设置</button>

  <Teleport to="body">
    <section v-if="open" class="dialog" role="dialog" aria-modal="true" aria-labelledby="title">
      <h2 id="title">设置</h2>
      <button type="button" @click="confirmed = true">确认</button>
      <button type="button" @click="open = false">关闭</button>
    </section>
  </Teleport>

  <p>确认次数：{{ Number(confirmed) }}</p>
</template>
```

`section` 在 `body` 下，但 `open` 与 `confirmed` 仍是当前 SFC 的状态。若将确认内容拆为子组件，
它发出的 `confirm` 事件仍由此处逻辑父组件接收；`inject()` 也仍从逻辑祖先解析。

### 让目标创建顺序成为代码的一部分

```html
<!-- index.html：应用挂载前就存在，适合跨路由的统一层 -->
<div id="app"></div>
<div id="modal-root"></div>
```

```vue
<!-- 任意课程页组件：只消费已存在的目标 -->
<Teleport to="#modal-root">
  <DialogPanel />
</Teleport>
```

不要把这个例子改为同一组件稍后由异步 `v-if` 创建的 `#modal-root`。若确实要让同一同步模板中较后的
元素作为目标，才使用下面的 `defer`：

```vue
<Teleport defer to="#same-tick-host">
  <DialogPanel />
</Teleport>
<div id="same-tick-host"></div>
```

### 按模式选择 DOM 位置，同时选择正确语义

```vue
<Teleport to="body" :disabled="renderInline">
  <section
    v-if="open"
    :role="renderInline ? 'region' : 'dialog'"
    :aria-modal="renderInline ? undefined : 'true'"
    aria-labelledby="settings-title"
  >
    <h2 id="settings-title">设置</h2>
    <button type="button" @click="close">关闭</button>
  </section>
</Teleport>
```

`disabled` 只决定位置，不保证语义仍然正确。覆盖层模式要完成 modal 交互闭环；行内模式是内容区，
不应声称自己阻断了整页背景。

### 一个有序的业务层，而不是多个无协调 Teleport

```vue
<Teleport to="#overlay-root">
  <section v-for="layer in orderedLayers" :key="layer.id" :data-layer="layer.id">
    {{ layer.title }}
  </section>
</Teleport>
```

`orderedLayers` 是业务数据。对话框栈、优先级、焦点恢复与 z-index 由它的 owner 维护；Teleport 只把
最终 DOM 输出到既有容器，不能替代该状态模型。

## 易错使用提示

实现时必须把以下 8 项逐项转成课程 `pitfalls` block，不能新增第九项。

### 1. 目标还未存在就挂载普通 Teleport

**错误假设 / 原因：** 认为 `to="#modal-root"` 会等待随后由同一页面创建的节点。默认挂载立即解析
selector。

```vue
<!-- 错误：host 的创建依赖未来状态 -->
<Teleport to="#modal-root"><DialogPanel /></Teleport>
<div v-if="hostReady" id="modal-root"></div>
```

```html
<!-- 正确：应用前已存在的 host -->
<div id="app"></div>
<div id="modal-root"></div>
```

**后果：** 开发环境报告无法定位 target，内容不会稳定进入预期容器。

**来源：** [Vue Teleport 指南](https://cn.vuejs.org/guide/built-ins/teleport.html)、
[Teleport.ts v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)。

### 2. 把 `defer` 当成异步重试

**错误假设 / 原因：** 以为 `defer` 能等待接口、计时器或下一个 tick 创建 target。它只推迟到同一
mount/update tick 的其他部分完成。

```vue
<!-- 错误：requestFinished 在未来才变为 true -->
<Teleport defer to="#late-host"><DialogPanel /></Teleport>
<div v-if="requestFinished" id="late-host"></div>
```

```vue
<!-- 正确：同一次模板挂载时出现 -->
<Teleport defer to="#late-host"><DialogPanel /></Teleport>
<div id="late-host"></div>
```

**后果：** 看似使用 defer，实际仍会报告目标错误；依赖网络速度的测试会偶发失败。

**来源：** [Vue Teleport 指南：延迟解析](https://cn.vuejs.org/guide/built-ins/teleport.html#deferred-teleport)、
[Teleport.ts v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)。

### 3. 用 `disabled="false"` 期待传送仍启用

**错误假设 / 原因：** 未绑定的 attribute 是字符串，非空字符串 `"false"` 是真值。

```vue
<!-- 错误 -->
<Teleport to="body" disabled="false"><DialogPanel /></Teleport>
```

```vue
<!-- 正确 -->
<Teleport to="body" :disabled="false"><DialogPanel /></Teleport>
```

**后果：** DOM 留在原地，裁剪或层叠问题仍在，且表面上难以看出 prop 类型错误。

**来源：** [Vue 内置组件 API：Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)、
[Teleport.ts v3.5.40：`isTeleportDisabled`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)。

### 4. 把目标 DOM 所属组件当成新的逻辑父组件

**错误假设 / 原因：** 看到子节点被移动到 `#theme-host`，便期待它从该 host 的 Vue 组件获得 inject
或把事件交给该组件。

```vue
<!-- 错误期待：DialogContent 从 #theme-host 对应组件取得 provide -->
<Teleport to="#theme-host"><DialogContent /></Teleport>
```

```vue
<!-- 正确：依赖和事件仍由逻辑父组件拥有 -->
<Teleport to="#theme-host">
  <DialogContent @close="open = false" />
</Teleport>
```

**后果：** inject 解析不到预期值，或引入不必要的全局状态和重复事件转发。

**来源：** [Vue Teleport 指南：搭配组件使用](https://cn.vuejs.org/guide/built-ins/teleport.html#using-with-components)。

### 5. 把同目标追加当成 z-index、焦点和业务顺序

**错误假设 / 原因：** 多个 Teleport 会自动替换旧弹层、根据重要性排序或形成焦点栈。官方只保证简单
追加，较晚挂载项位于较早挂载项之后。

```vue
<!-- 错误：两处独立 Teleport 没有共享的业务排序 -->
<Teleport to="#layers"><ConfirmDialog /></Teleport>
<Teleport to="#layers"><AlertDialog /></Teleport>
```

```vue
<!-- 正确：业务层统一给出稳定顺序 -->
<Teleport to="#layers">
  <DialogLayer v-for="layer in orderedLayers" :key="layer.id" :layer="layer" />
</Teleport>
```

**后果：** DOM、读屏与焦点返回顺序可能和真正的优先级冲突，关闭一个层后也无法可靠恢复上一个层。

**来源：** [Vue Teleport 指南：多个 Teleport 共享目标](https://cn.vuejs.org/guide/built-ins/teleport.html#multiple-teleports-on-the-same-target)。

### 6. 认为 Teleport 自动实现可访问模态框

**错误假设 / 原因：** 内容移到 `body` 后就加 `aria-modal="true"`，却没有移入焦点、焦点循环、
Escape、关闭后恢复焦点及背景不可交互。

```vue
<!-- 错误：只有 aria 声明，没有兑现 modal 承诺 -->
<Teleport to="body">
  <section v-if="open" role="dialog" aria-modal="true">...</section>
</Teleport>
```

```vue
<!-- 正确：打开时 focusDialog，关闭时 restoreTrigger，并令背景 inert -->
<Teleport to="body">
  <section v-if="open" role="dialog" aria-modal="true" @keydown="handleDialogKeydown">
    ...
  </section>
</Teleport>
```

**后果：** 键盘用户会离开对话框，读屏用户会得到错误的“背景不可用”承诺，关闭后也可能失去焦点。

**来源：** [W3C Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)、
[WAI-ARIA `aria-modal`](https://www.w3.org/TR/wai-aria-1.2/#aria-modal)。

### 7. 把 Transition 放在错误职责边界，或让 reduced motion 改变业务结果

**错误假设 / 原因：** 期待 Transition 直接“动画 Teleport”，或用动画结束计时决定何时关闭。

```vue
<!-- 错误：把 Teleport 本身当成要进入/离开的节点 -->
<Transition><Teleport to="body"><DialogPanel /></Teleport></Transition>
```

```vue
<!-- 正确：传送后由 Transition 管理条件 dialog 节点 -->
<Teleport to="body">
  <Transition name="dialog"><DialogPanel v-if="open" /></Transition>
</Teleport>
```

**后果：** 动画不稳定，reduced motion 下可能漏掉关闭、焦点恢复或状态更新；测试被固定时间耦合。

**来源：** [Vue Teleport 指南](https://cn.vuejs.org/guide/built-ins/teleport.html)、
[Vue Transition 指南](https://cn.vuejs.org/guide/built-ins/transition.html)、
[Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)。

### 8. 用 renderer 锚点、临时 class 或截图时刻断言传送成功

**错误假设 / 原因：** 读取 Vue 注释锚点、VNode 内部字段或 `dialog-enter-active`，以为这是稳定的
公开契约。

```ts
// 错误：依赖实现细节和不确定时刻
expect(await page.locator('comment=teleport start')).toHaveCount(1)
await page.waitForTimeout(180)
```

```ts
// 正确：操作公开控件，断言最终位置、语义与业务状态
await page.getByTestId('open-teleport-dialog').press('Enter')
await expect(page.getByRole('dialog', { name: 'Teleport 对话框实验' })).toBeVisible()
await expect(page.locator('[data-state="render-location"]')).toHaveText('DOM：body')
```

**后果：** 渲染器优化、motion 偏好或速度变化会造成脆弱测试，无法证明用户能完成打开和关闭任务。

**来源：** [Teleport.ts v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)、
[Vue Transition 指南](https://cn.vuejs.org/guide/built-ins/transition.html)。

## 源码推导

以下内容只用于解释，不可成为 Demo 或 E2E 的 selector：

1. `resolveTarget()` 对字符串 `to` 调用 renderer 的 `querySelector`；找不到目标且 Teleport 未禁用时，
   开发环境发出 target 警告。非字符串 `to` 作为 renderer element 使用。
2. 初次处理 Teleport 时，渲染器在声明位置放置主锚点，在目标容器准备 target anchor。children 根据
   `disabled` 挂到主容器或目标容器。
3. `disabled` 或 target 改变时，运行时移动已有 DOM，而不是把 Teleport 的逻辑组件树重新挂到
   target 所属组件下。
4. `defer` 将 `mountToTarget` 放入 post-render 队列；同一周期结束时仍解析不到 target，便不会跨未来
   tick 继续等待。
5. 多个 Teleport 分别在同一 target 插入自己的 anchor 与 children，因此公开结果是追加，而非共享
   的业务排序算法。

来源：[Vue 3.5.40 `Teleport.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)。

## 唯一 Demo 规格

### 文件与公开 ID

```text
src/content/demos/vue/core/learn/intermediate/teleport/
└─ teleport-dialog-lab-demo.vue
```

唯一公开 Demo ID：

```text
vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo
```

该文件同时是运行入口和 source 面板来源。不新增第二个顶层 Demo、私有 parts、原理动画、全局 target
文件或独立 dialog library。

### 教学场景与状态

Demo 是一个“Teleport 对话框实验台”，而不是第二个 Reference 示例。状态只包含：

- `open`：对话框是否显示，初始 `false`。
- `renderInline`：是否禁用 Teleport、让内容留在课程 Demo 内，初始 `false`。
- `closeCount`：子对话框通过逻辑父组件事件关闭的次数，初始 `0`。
- `triggerElement`：打开前的触发按钮，仅用于关闭后恢复焦点，不作为渲染状态或 selector。

overlay 模式使用 `<Teleport to="body">`，目标先天存在。打开时将 `#app` 置为 `inert`，在 Teleport
中的 dialog 可见后焦点移到关闭按钮；Escape、取消、确认均关闭并撤销 inert，再把焦点还给 trigger。
行内模式使用同一个 `<Teleport :disabled="renderInline">`，但呈现为非模态 `region`，不设
`aria-modal`，不设置 `#app` inert，也不实现焦点陷阱。

这两个模式的共享部分是逻辑状态与关闭事件；它们不共享错误的“modal”承诺。

### 状态与方法骨架

```ts
const open = ref(false)
const renderInline = ref(false)
const closeCount = ref(0)
const triggerElement = ref<HTMLElement | null>(null)

/** 记录触发元素并打开对话框。 */
function openDialog(event: MouseEvent): void {
  triggerElement.value = event.currentTarget as HTMLElement
  open.value = true
}

/** 切换 Teleport 是否保留内容在声明位置。 */
function toggleRenderMode(): void {
  renderInline.value = !renderInline.value
}

/** 关闭实验对话框并恢复打开前的焦点。 */
function closeDialog(): void {
  open.value = false
  closeCount.value += 1
}
```

实际实现必须在 `nextTick()` 后聚焦 Teleport 内部的关闭按钮，并通过 `onBeforeUnmount()` 确保异常离开
页面时撤销 `#app` 的 inert 状态。焦点陷阱只在 overlay/modal 模式开启；使用原生 `<button>`，不做
自定义按钮或计时器。

### 稳定 selector 契约

| 区域 | 稳定定位 | 初态 | 操作后的最终状态 |
| --- | --- | --- | --- |
| Demo 根 | `.teleport-dialog-lab-demo` | 恰好一个 | 始终存在 |
| 打开按钮 | `[data-testid="open-teleport-dialog"]` | 可用，焦点可见 | 关闭后重新获得焦点 |
| 位置开关 | `[data-testid="teleport-inline-toggle"]` | `aria-pressed="false"` | true 时下一次打开为行内模式 |
| DOM 位置摘要 | `[data-state="render-location"]` | `DOM：body` | 切换后为 `DOM：原地` |
| 逻辑事件摘要 | `[data-state="parent-close-count"]` | `0` | 每次确认/取消/Escape 关闭后精确加 1 |
| overlay 对话框 | `[data-testid="teleport-overlay-dialog"]` | 不存在 | body 下恰好一个，`role="dialog"` |
| 行内内容区 | `[data-testid="teleport-inline-panel"]` | 不存在 | Demo 根内恰好一个，`role="region"` |
| 关闭按钮 | `[data-testid="teleport-dialog-close"]` | 不存在 | overlay 打开后获焦；关闭后消失 |
| 确认按钮 | `[data-testid="teleport-dialog-confirm"]` | 不存在 | keyboard 可操作并关闭 |
| 课程状态 | `[data-state="teleport-summary"]` | overlay、关闭次数 0 | 与 mode、open 与 closeCount 一致 |

不要定位 Teleport 注释锚点、Vue uid、Transition 临时 class、组件内部 ref 或截图像素。对 overlay 位置，
可以断言公开 dialog 元素的 `parentElement === document.body`；对行内位置，断言其位于 Demo 根内。

### 确定性交互与 E2E 契约

1. 从动态组件与 KeepAlive 的“下一篇：Teleport”进入课程，确认没有“下一篇”链接、唯一 Demo
   正常解析、`.demo-box .missing` 为 0、console 无 warning/error。
2. 初态为 overlay、关闭次数 0。使用 Enter 打开，确认 role 为 dialog、名称为“Teleport 对话框实验”、
   `#app` 有 inert，dialog 是 `body` 的直接子元素，关闭按钮获焦。
3. 用 Tab / Shift+Tab 在关闭和确认等 dialog 控件间循环；按 Escape 后 dialog 消失，`#app` 不再 inert，
   触发按钮获焦，关闭次数为 1。
4. 再次打开，使用确认按钮关闭，证明 Teleport 内部事件仍由课程逻辑父组件更新摘要，关闭次数为 2。
5. 在关闭状态以 Space 切换“原地渲染”，`aria-pressed` 变为 true、位置摘要为“DOM：原地”。打开后只
   出现 region，位于 Demo 根内，没有 `aria-modal`，`#app` 不带 inert；关闭后焦点仍回到 trigger。
6. 再切回 overlay，快速执行打开、Escape、打开、确认。最终没有残留 dialog / region / inert，关闭
   次数与动作一致，始终只存在一个活动内容区。
7. 在 normal motion 和 `page.emulateMedia({ reducedMotion: 'reduce' })` 下完整重复 2 至 6。两种
   条件只允许视觉时长不同，DOM 位置、焦点、关闭次数和 keyboard 终态必须完全相同。
8. 在 390 × 844 下检查无页面级横向滚动；把 Demo 内文字注入 200% 后，控件和状态不截断、不越界。
9. 量测每个 Demo 原生 button 的宽高均至少 44 CSS px；全部核心功能可用 Tab、Shift+Tab、Enter、
   Space 与 Escape 完成。

不得使用 `waitForTimeout()`、固定动画毫秒、内联 style 的未公开细节或 DOM 快照时刻。Playwright 通过
locator、可见状态、焦点状态与最终文本自动等待。

### Demo 样式与 reduced motion

- 只使用 flex、flex-wrap、margin、padding、min-width 和正常文档流排版；禁止 CSS Grid 和任何
  `gap` / `row-gap` / `column-gap`。
- Demo 是连续实验台，控制区不使用装饰性浮层或卡片套卡片。overlay 才可使用遮罩和 dialog 面板。
- 原生 button 具备可见 focus ring、至少 44 × 44 CSS px 触控面积；flex 子项设 `min-width: 0`，
  长中文文案可换行，不使用固定高度或省略号截断。
- 动画只过渡 opacity 与轻微 transform，绝不把对话框的实际打开、关闭、inert 或焦点处理延迟到
  `transitionend`。
- `prefers-reduced-motion: reduce` 下 transition 设为 none、位移归零。overlay / inline 切换、事件
  更新、Escape 与焦点恢复不变。

```css
@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active {
    transition: none;
  }

  .dialog-enter-from,
  .dialog-leave-to {
    opacity: 1;
    transform: none;
  }
}
```

### 390px、200% 文本、触控与键盘契约

- 视口固定为 390 × 844，`document.documentElement.scrollWidth <= window.innerWidth`。
- 对 Demo 内 h3、h4、p、button、`[role="status"]`、dialog / region 标题与说明注入
  `font-size: 200% !important`；每个目标的 `scrollWidth <= clientWidth`、
  `scrollHeight <= clientHeight`，且边界不越过 Demo 根或当前 overlay。
- 关闭、确认、切换模式和打开按钮均测量到至少 44 × 44 CSS px。44px 是本项目采用的严格工程契约。
- overlay 打开时，焦点进入 dialog，Tab / Shift+Tab 不离开 dialog，Escape 可关闭；行内模式不伪造
  modal focus trap，但所有按钮仍可键盘操作。
- `role="status" aria-live="polite" aria-atomic="true"` 摘要传达当前模式与关闭次数；仅 DOM 移动、
  颜色或动画不能作为状态的唯一反馈。

依据：

- [WCAG 2.2 Resize Text 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [WCAG 2.2 Reflow 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Target Size Enhanced 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- [WCAG 2.2 Keyboard 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [WCAG 2.2 Status Messages 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## 练习

### 练习一：把 DOM 位置和状态所有权分开

给出一个 `ConfirmPanel`，其中确认按钮 emit `confirm`。将它包入 `Teleport to="body"`，但保持
`confirmedCount` 在原 SFC 中。解释为什么目标 body 不会成为它的逻辑父组件，以及 confirm 如何更新
原 SFC 的状态。

### 练习二：修复目标时机和错误布尔值

给出 `defer` 配合 `v-if="requestFinished"` 的 target，及 `disabled="false"`。把稳定 host 移至
应用挂载前，或改成同 tick 的 defer 用法；再将 disabled 改为 boolean 绑定。说明两个问题分别是
时间边界与属性类型边界。

### 练习三：审查一个“看起来像 modal”的覆盖层

给出只含 `role="dialog" aria-modal="true"` 的 Teleport。补充可访问名称、打开聚焦、Tab / Shift+Tab、
Escape、关闭恢复焦点与背景 inert；再说明为何 `disabled` 行内模式必须删去 `aria-modal`，而不是复用
覆盖层声明。

练习不实现弹层栈库、全局 overlay service、SSR target、路由 modal、Suspense、异步组件或第三方
无障碍库。

## 课程 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.teleport',
  type: 'lesson',
  title: 'Teleport',
  summary: '保持组件逻辑归属不变，把覆盖层 DOM 放到正确位置，并建立目标时机与模态交互边界',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.dynamic-components-keep-alive'],
  related: [
    'vue.core.learn.intermediate.dynamic-components-keep-alive',
    'vue.core.learn.intermediate.transitions',
    'vue.core.reference.composition.provide-inject',
    'vue.core.reference.built-ins.teleport',
  ],
  tags: [
    'Teleport',
    'to',
    'disabled',
    'defer',
    '逻辑组件树',
    '模态对话框',
    '焦点管理',
    'reduced motion',
  ],
  sources: [
    {
      title: 'Vue 中文 Teleport 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/teleport.html',
    },
    {
      title: 'Vue English Teleport Guide',
      url: 'https://vuejs.org/guide/built-ins/teleport.html',
    },
    {
      title: 'Vue 内置组件 API：Teleport',
      url: 'https://cn.vuejs.org/api/built-in-components.html#teleport',
    },
    {
      title: 'Vue Teleport 官方 Markdown',
      url: 'https://github.com/vuejs/docs/blob/main/src/guide/built-ins/teleport.md',
    },
    {
      title: 'Vue 3.5.40 Teleport.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts',
    },
    {
      title: 'W3C Dialog (Modal) Pattern',
      url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-08-01',
  estimatedMinutes: 60,
})
```

上述课程 ID、唯一 prerequisite、四个 related 的内容和顺序、唯一公开 Demo ID、8 个 pitfalls、60 分钟
与 `20/40 -> 21/39` 均为冻结契约。Suspense 不得加入 prerequisite、related、正文 Demo、实现文件或
测试范围。

## 正文结构化块要求

- `objectives`：覆盖双树、两种 `to`、目标时机、defer、disabled、追加顺序、Transition、modal 边界
  和稳定验证。
- `blocks`：严格遵循“正文编排”；Reference 的 API 细节只链接回现有 Reference，不复制其完整内容。
- `demo`：只出现 `vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo`，description 明示
  `body` overlay、disabled 行内模式、逻辑事件和焦点恢复，`playground: true`。
- `pitfalls`：恰好 8 项，逐项采用上文的错误、正确与后果；不合并为泛泛的“使用 Teleport 注意事项”。
- `exercise`：至少落地三项中的两项，必须包含目标时机或 modal 无障碍边界。
- `recap`：覆盖 `to`、目标存在、defer 同 tick、disabled 布尔、逻辑树、共享 target、Transition、
  modal 与 reduced motion。

建议 recap：

1. Teleport 移动 DOM，不移动组件逻辑父子、state、props、emit 或 provide/inject。
2. `to` 可以是 selector 或 HTMLElement，但 target 的存在时机是调用方契约。
3. `defer` 仅推迟至当前 mount/update tick 的 post-render 阶段，不能等待异步未来。
4. `disabled` 是布尔 prop；启用时可传送，禁用时保留原地，二者共享组件逻辑状态。
5. 同目标 Teleport 只追加；顺序、层级与焦点需要一个有序的业务 owner。
6. Teleport 管位置，Transition 管视觉节点；reduced motion 不改变交互终态。
7. Teleport 不等于 modal。`aria-modal` 只有在焦点和背景交互边界都真实成立时才可使用。
8. 自动化只验证公开 DOM、语义、焦点与最终业务状态，不读取 renderer 锚点或等待固定时长。

## 最小 TDD 接缝

只建立两个 focused 红灯、一条课程 E2E；不要为每个 pitfall 建一个重复测试。

### 红灯一：课程 catalog 契约

修改 `src/content/catalog/vue-core-track.spec.ts`：

- intermediate 的公开顺序在 dynamic-components-keep-alive 后新增 Teleport，track total 从 20 变为 21。
- prerequisite 精确为 `['vue.core.learn.intermediate.dynamic-components-keep-alive']`。
- related 精确为 metadata 冻结的四项并按顺序比较；每项都能由 `learningCatalog.getEntry()` 解析。
- dynamic-components-keep-alive 的 next 成为 Teleport；Teleport 没有 available next，不得把 Suspense
  Reference 或 planned 项伪装为课程 neighbor。

先运行 focused Vitest。红灯只能由课程文件未创建或 manifest 仍为 planned 引起。

### 红灯二：唯一 Demo 公开面

修改 `src/content/interactive/registry.spec.ts`：

- 中级公开 Demo 列表只新增
  `vue.core.learn.intermediate.teleport.teleport-dialog-lab-demo`。
- `resolveDemo()` 对该 ID 非 null。
- 不新增第二个 basename Demo、`parts/`、原理动画或 Reference Demo 注册。

先运行 focused Vitest。红灯只能来自唯一 Demo 文件尚不存在。

### 绿灯与最小回归

添加课程、唯一 Demo 并将 manifest 单项改为 available 后，重跑相同 focused 命令。随后新增
`tests/e2e/teleport.spec.ts`，以 390 × 844 从动态组件与 KeepAlive 的下一篇进入本课，执行上面的
“确定性交互与 E2E 契约”。该文件是一个完整课程回归，不复制旧 Reference Demo 的裁剪比较，也不
把 Suspense 加进长路径。

## 实现与集成清单

后续实施只需修改或新增以下文件：

- `src/content/entries/learn/vue/core/intermediate/teleport.ts`：课程 metadata、目标、正文、8 个
  pitfalls、练习、recap 与唯一 Demo block。
- `src/content/demos/vue/core/learn/intermediate/teleport/teleport-dialog-lab-demo.vue`：唯一公开 Demo、
  overlay / inline 语义、焦点和 reduced-motion 样式。
- `src/content/catalog/manifests/vue-core-track.ts`：仅把 Teleport 从 planned 改为 available，并移除
  planned 项的 title/summary 兜底字段。
- `src/content/catalog/vue-core-track.spec.ts`：21 课顺序、prerequisite、related 与末项 neighbor。
- `src/content/interactive/registry.spec.ts`：唯一公开 Demo ID。
- `tests/e2e/teleport.spec.ts`：390px、200% 文本、44px、keyboard、overlay/inline、normal/reduced
  motion 的公开回归。
- `docs/重构实施计划.md`：只有课程实现和全部验证完成后，更新为 `21 available / 39 planned` 与
  Teleport 批次状态。

无需修改：

- `src/content/schema/*`、`src/content/interactive/registry.ts`、router 或全局样式。
- `src/content/entries/reference/vue/core/built-ins/teleport.ts` 和其 Reference Demo。
- 动态组件与 KeepAlive、Transition、Provide/Inject、Suspense 或任何其他课程实现。
- `index.html`。课程 Demo 以 `body` 为 overlay target，不能为本课引入新的全局 host。
- 任何第三方 dialog、focus-trap、animation 或 overlay 依赖。

## 长路径进入方式

课程 available 后有三种合法入口：

1. 从 `/learn/vue/core/intermediate/dynamic-components-keep-alive` 点击“下一篇：Teleport”；这是本课
   390px Playwright 回归的唯一路线入口。
2. 从 `/learn/vue/core` 的中级课程总览进入“内置组件与过渡”，选择 Teleport。
3. 直接刷新 `/learn/vue/core/intermediate/teleport`，验证稳定深链接与正文异步加载。

related 只回到“动态组件与 KeepAlive”“过渡效果”“依赖注入 Reference”和“Teleport Reference”。
本课结束后没有下一篇，不创建指向 Suspense 或任何 planned 条目的链接。

## 最终验证建议

实施批次完成后按最小到完整顺序验证：

1. focused `vue-core-track.spec.ts`：先红后绿。
2. focused `interactive/registry.spec.ts`：先红后绿。
3. `tests/e2e/teleport.spec.ts`：390px、double text、44px、normal/reduced motion、keyboard 与焦点
   恢复均通过，且 console / pageerror 为空。
4. 全量 Vitest、`npm run type-check`、`npm run lint`、`npm run format:check`、`npm run build` 与
   `git diff --check`。
5. 静态检查新增前端样式没有 CSS `grid`、`gap`、`row-gap`、`column-gap`；所有新增方法都有中文注释。
6. 核对三条 Vue 学习路线精确为 `21 available / 39 planned`，Teleport Reference 未改变，Suspense
   仍未实现。
7. Standards / Spec 双轴复审目标为 PASS / 0 finding。

本调研任务本身不运行构建、不启动服务、不打开页面，也不修改任何实现文件。

## 明确排除与停止边界

- 不修改 Teleport Reference、Reference Demo、Reference pitfalls 或任何 Reference manifest。
- 不实现 Suspense、异步组件、SSR / hydration Teleport、router modal、全局 overlay service、弹层栈
  框架或跨路由焦点管理。
- 不创建第二个公开 Demo、私有 parts、原理动画、全局 modal host、第三方依赖、网络请求、timer 或
  随机数。
- 不把 `defer` 扩写为异步 target 重试，也不把 Teleport 描述为状态持久化、焦点管理库或自动 modal。
- 不修改 router、schema、registry glob、全局样式、KeepAlive / Transition / Provide-Inject 课程。
- 不把本课完成写成 Vue Core 中级、全部内置组件或任何 Gate 已关闭。
- 完成 `21 available / 39 planned`、本课 E2E 和 Reference 未改核对后立即停止。

## 固定来源清单

以下来源均于 2026-08-01 通过 Tavily 定位并直接核对。

### Vue 官方中文与英文文档

- [中文 Teleport 指南](https://cn.vuejs.org/guide/built-ins/teleport.html)：基础用法、组件逻辑关系、
  disabled、同 target 追加、defer、Transition 组合。
- [English Teleport Guide](https://vuejs.org/guide/built-ins/teleport.html)：同一公开语义的英文交叉核对。
- [内置组件 API：Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)：`to` 的
  `string | HTMLElement`、`disabled` 和 3.5+ `defer`。
- [Teleport 官方 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/built-ins/teleport.md)：指南
  原文与同 tick 限制复核。
- [Vue Transition 指南](https://cn.vuejs.org/guide/built-ins/transition.html)：Transition 的条件节点和
  reduced-motion 组合边界。

### vuejs/core v3.5.40 固定源码

- [`Teleport.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Teleport.ts)：
  `TeleportProps`、`resolveTarget()`、`isTeleportDisabled()`、主/目标锚点、位置移动与 defer 的
  post-render 调度。

### 必要 W3C 规范

- [WAI-ARIA APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)：dialog
  名称、初始焦点、Tab / Shift+Tab、Escape、焦点恢复和背景不可交互。
- [WAI-ARIA 1.2 `aria-modal`](https://www.w3.org/TR/wai-aria-1.2/#aria-modal)：modal 声明的语义边界。
- [WCAG 2.2 Resize Text 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)：200% 文本。
- [WCAG 2.2 Reflow 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)：窄视口避免二维滚动。
- [WCAG 2.2 Target Size Enhanced 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)：
  44 × 44 CSS px。
- [WCAG 2.2 Keyboard 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)：键盘可操作且不
  要求特定按键时序。
- [WCAG 2.2 Status Messages 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)：
  无需移动焦点的状态传达。
- [Media Queries Level 5：`prefers-reduced-motion`](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)：
  最小化非必要运动的用户偏好。
