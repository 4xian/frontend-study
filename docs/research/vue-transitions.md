# Vue Core 中级课程：过渡效果调研

> 查证日期：2026-07-31  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文 Transition / TransitionGroup 指南与内置组件 API、
> `vuejs/core` v3.5.40 固定标签源码，以及本地安装的官方 `vue@3.5.40` 构建和类型声明。

## 冻结结论

| 项目 | 冻结值 |
| --- | --- |
| 课程 ID | `vue.core.learn.intermediate.transitions` |
| 标题 | `过渡效果` |
| 阶段 | `intermediate` |
| 唯一直接前置 | `vue.core.learn.intermediate.provide-inject` |
| 线性位置 | “依赖注入”之后，“动态组件与 KeepAlive”之前 |
| 唯一 Demo ID | `vue.core.learn.intermediate.transitions.transition-state-lab-demo` |
| 易错点数量 | 8 个 |
| 适用版本 | Vue 3.5.40 |
| 预计时长 | 55 分钟 |
| 课程长路径 | `/learn/vue/core/intermediate/transitions` |
| 实施前总量 | Vue 三条学习路线 `18 available / 42 planned` |
| 实施后总量 | Vue 三条学习路线 `19 available / 41 planned` |

本批只实现“过渡效果”课程、唯一 Demo、目录与现有 390px 长路径接入。现有
`vue.core.reference.built-ins.transition` 及其
`vue.core.reference.built-ins.transition.transition-demo` 保持不变。
`vue.core.learn.intermediate.dynamic-components-keep-alive` 仍为下一课且保持 `planned`；本批不创建
动态组件或 KeepAlive 课程文件，也不把它提前加入可导航 related。

## 调研边界与证据状态

主进程已通过 Tavily 在 `cn.vuejs.org` 与 `github.com/vuejs/core` 官方域定位并提取资料，
成功核对中文 Transition / TransitionGroup 指南、内置组件 API，以及 `vuejs/core` v3.5.40 的
`BaseTransition.ts`、`Transition.ts` 与 `TransitionGroup.ts`。搜索只用于定位和提取一手来源，
没有把社区文章或搜索摘要直接当作技术结论。

可复核证据来自三层：

1. Tavily 提取的 Vue 官方指南、API 与固定标签源码，用于核对公开语义和版本实现。
2. `package-lock.json` 与 `node_modules/vue/package.json`，两者均确认安装版本为 `3.5.40`。
3. 官方 npm 包内 `@vue/runtime-core`、`@vue/runtime-dom` 的 3.5.40 类型声明与构建代码，用于核对
   `BaseTransition`、六类、结束检测、取消流程、mode 和 `TransitionGroup` 的 keyed / FLIP 行为。

所有技术结论均在下文链接到拥有该行为的一手官方页面或 v3.5.40 固定源码；版本敏感的运行机制
以 `vuejs/core` v3.5.40 为准。

## 当前仓库审查

### Catalog 与课程顺序

`src/content/catalog/manifests/vue-core-track.ts` 已把本课放在 `built-ins-and-transitions` 分类首位：

1. `vue.core.learn.intermediate.transitions`：当前 `planned`。
2. `vue.core.learn.intermediate.dynamic-components-keep-alive`：保持 `planned`。
3. `vue.core.learn.intermediate.teleport`：保持 `planned`。

本课前一个已上线条目是 `vue.core.learn.intermediate.provide-inject`。当前 Vue Core 有
`18 available / 13 planned`，Vue Router 与 Pinia 合计另有 29 个 planned，因此三条 Vue 学习路线
当前总计 `18 available / 42 planned`。只把本课转为 available 后，总数精确变为
`19 available / 41 planned`，总课程数仍为 60。

### Schema 与课程模板

课程必须使用 `defineLessonMeta()` 与 `defineLesson()`，并满足：

- metadata 含 `id`、`type`、`title`、`summary`、ecosystem/module/collection、level、
  prerequisites、related、tags、sources、appliesTo、verifiedAt、estimatedMinutes。
- 正文含非空 `objectives`、`blocks`、`recap`；练习写入 `exercises` 或结构化 exercise block。
- “易错使用提示”标题后紧跟一个 `pitfalls` block；每项必须有 title、description、consequence、
  wrong 和 correct，数量在 1 至 10 之间。
- Demo block 的 ID 由 `src/content/demos/` 下相对路径自动派生；无需修改 registry 实现。

### 现有 Reference 的职责边界

现有 `src/content/entries/reference/vue/core/built-ins/transition.ts` 已承担 API 速查职责：

- `TransitionProps` / `TransitionGroupProps` 类型签名和核心 props。
- 六个过渡类与 `TransitionGroup` 的稳定 key、`tag`、`moveClass`、FLIP。
- 五个结构化易错点和最小源码实现。
- Reference Demo 对比 `v-if` fade 与 `mode="out-in"`。

新课程不能复制 Reference 成一份更长的 API 表。课程应从“哪些状态变化需要过渡”出发，形成
触发条件、VNode 身份、列表身份、降级与稳定验证的学习路径；API 细节通过 related 回到现有
Reference。不得借本批修正 Reference 的 34px 高按钮、注释格式、样式或内容。

## 官方事实

### Transition 的职责与触发条件

- `<Transition>` 为它的单个元素或组件子节点提供进入和离开效果，本身不会额外渲染 DOM 容器。
- 官方列出的触发方式包括 `v-if`、`v-show`、动态组件切换，以及改变特殊 `key` 造成的节点替换。
- 原地更新同一 VNode 的文本或属性不是进入/离开；需要切换身份时必须让 `type` 或 `key` 改变。
- 一个 `<Transition>` 只接受一个非注释子节点；列表或多个同级项使用 `<TransitionGroup>`。

来源：

- [中文 Transition 指南：Transition 组件](https://cn.vuejs.org/guide/built-ins/transition.html#the-transition-component)
- [内置组件 API：Transition](https://cn.vuejs.org/api/built-in-components.html#transition)
- [Vue 3.5.40 BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)

### 六个 CSS 类与一次完整过渡

默认 `name="v"` 时，Vue 在进入和离开阶段管理六个类；`name="panel"` 时前缀对应变为
`panel-*`。

| 类 | 语义 | 典型职责 |
| --- | --- | --- |
| `*-enter-from` | 进入起点 | 初始透明度或位移 |
| `*-enter-active` | 整个进入阶段 | transition / animation 配置 |
| `*-enter-to` | 进入终点 | 最终可见状态 |
| `*-leave-from` | 离开起点 | 当前可见状态 |
| `*-leave-active` | 整个离开阶段 | transition / animation 配置 |
| `*-leave-to` | 离开终点 | 最终透明度或位移 |

runtime-dom 3.5.40 在进入前添加 from 与 active，经过两次 `requestAnimationFrame` 后撤掉 from、
加入 to；离开流程会先强制一次 reflow，再通过同一个双 `requestAnimationFrame` 的 `nextFrame()`
切换到 leave-to。结束后清理类，离开节点的真实移除由完成回调触发。

来源：

- [中文 Transition 指南：基于 CSS 的过渡效果](https://cn.vuejs.org/guide/built-ins/transition.html#css-based-transitions)
- [Vue 3.5.40 Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)

### name、mode、appear 与节点身份

- `name` 决定六类的前缀，默认是 `v`；自定义 `name="panel"` 后应使用 `panel-*` 类。
- 默认模式允许新旧节点同时存在。`mode="out-in"` 先让旧节点完整离开，再插入新节点；
  `mode="in-out"` 先进入新节点，再延迟旧节点离开。
- `mode` 只在旧、新 VNode 身份不同的切换上有意义。给同标签状态节点稳定且不同的 `key`，可以
  明确告诉 Vue 这是一次替换而不是原地 patch。
- 默认初次挂载不执行进入过渡；显式 `appear` 才复用进入类和钩子处理初次渲染。

来源：

- [中文 Transition 指南：初次渲染与过渡模式](https://cn.vuejs.org/guide/built-ins/transition.html)
- [Vue 3.5.40 BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)
- [Vue 3.5.40 Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)

### type、duration 与 CSS 自动结束检测

- 默认 `css: true` 时，Vue 读取计算样式并监听 `transitionend` 或 `animationend`；没有有效 CSS
  时立即完成。
- 同一元素同时存在 CSS transition 与 animation 时，可用 `type="transition"` 或
  `type="animation"` 指定 Vue 应等待哪一类结束事件。
- 嵌套后代有 delay 时，Vue 不会遍历整棵后代树推断业务上的最后结束点；应用应通过
  `duration` 显式给出完整进入/离开毫秒数。
- `duration` 可为单个 number，也可分开写 `{ enter, leave }`。显式时长走固定 timeout 分支。

来源：

- [中文 Transition 指南：同时使用 transition 和 animation](https://cn.vuejs.org/guide/built-ins/transition.html#using-transitions-and-animations-together)
- [中文 Transition 指南：嵌套过渡与显式时长](https://cn.vuejs.org/guide/built-ins/transition.html#nested-transitions-and-explicit-transition-durations)
- [Vue 3.5.40 Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)

### TransitionGroup、稳定 key 与移动

- `<TransitionGroup>` 管理多个元素或组件的插入、移除和位置移动，每个非文本子项都必须有唯一且
  稳定的 key。
- 它默认渲染 Fragment；需要 `ul`、`div` 等实际容器时显式传 `tag`。
- `TransitionGroupProps` 从 `TransitionProps` 中省略 `mode`；列表项不支持整体 in-out / out-in
  顺序模式。
- 进入/离开类加在各个列表项上，而不是 `tag` 容器上。
- 更新前后，3.5.40 分别记录旧、新 `getBoundingClientRect()`；对发生位移的项先写反向
  `translate()`，强制 reflow 后清空内联 transform，再用 `name-move` 或 `moveClass` 过渡到新位置。
- runtime 会先检测 move class 是否真的包含 transform transition；没有则跳过移动动画，但列表的
  DOM 顺序仍会正常更新。

来源：

- [中文 TransitionGroup 指南](https://cn.vuejs.org/guide/built-ins/transition-group.html)
- [内置组件 API：TransitionGroup](https://cn.vuejs.org/api/built-in-components.html#transitiongroup)
- [Vue 3.5.40 TransitionGroup.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts)

### JavaScript 钩子与取消

- 可使用 `before-enter`、`enter`、`after-enter`、`enter-cancelled`，以及对应 leave / appear 钩子。
- 只写一个参数的 enter / leave hook 被当作同步 hook；接收第二个 `done` 参数时，调用方必须在
  异步动画真正完成后调用它。
- 使用纯 JavaScript 动画时应设置 `:css="false"`，避免 Vue 再做 CSS 检测。
- 快速反向切换时，3.5.40 会先执行当前元素保存的 enter / leave 回调，并转入 cancelled 分支；
  完成回调内部有只执行一次保护。

来源：

- [中文 Transition 指南：JavaScript 钩子](https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks)
- [Vue 3.5.40 BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)
- [Vue 3.5.40 Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)

### 性能与 reduced motion 的课程约束

Vue 官方建议优先过渡 `transform` 和 `opacity`：它们通常不会影响文档流布局，并可由 GPU 加速。
本项目另有更严格的可访问性验收：Demo 必须在 `prefers-reduced-motion: reduce` 下移除空间位移和
可感知时长，但隐藏、显示、切换身份、重排、状态文本和键盘操作必须完整可用。后者是项目交付
契约，不声称是 Vue runtime 自动提供的行为。

来源：

- [中文 Transition 指南：性能考量](https://cn.vuejs.org/guide/built-ins/transition.html#performance-considerations)

## 学习目标

完成课程后，学习者应能：

1. 判断一次 UI 变化是节点进入/离开、身份替换，还是同节点原地更新。
2. 用 `v-if`、`v-show` 或稳定 `key` 触发符合意图的 `<Transition>`。
3. 解释六个 CSS 类的职责，并用 `name` 编写最小 opacity / transform 过渡。
4. 根据视觉与交互需求选择默认、`out-in` 或 `in-out` 模式。
5. 区分 `appear` 与后续进入，不误以为初始挂载默认播放。
6. 用 `type`、`duration` 或 JavaScript `done` 明确结束边界。
7. 用 `<TransitionGroup>`、稳定业务 key 与 move class 处理列表插入、删除和重排。
8. 从 v3.5.40 源码解释两帧切类、延迟移除、取消回调和 FLIP 位移。
9. 优先选择 opacity / transform，并为 reduced motion 提供功能完整的静态降级。
10. 以最终 DOM 与语义状态验证过渡，不依赖固定 sleep、临时类名或截图时刻。
11. 通过唯一 Demo 验证 presence、keyed identity、out-in 与列表移动的共同身份模型。

## 正文编排

课程正文按以下顺序展开：

1. 从“页面状态已经正确，为什么还需要过渡”建立过渡的反馈职责。
2. 用 `v-if` 隐藏/显示解释节点进入与离开，不先堆 props 表。
3. 画出六个类在进入、离开两条时间线中的职责。
4. 用 `name` 和 opacity / transform 写最小 CSS 过渡。
5. 对比同节点文本 patch 与 `key` 改变后的身份替换，再用 `mode="out-in"` 组织互斥视图。
6. 依次补充 `appear`、`v-show`、type 与 duration，明确初次渲染和结束边界。
7. 从单节点过渡迁移到 `TransitionGroup`，讲清稳定业务 key、tag 与 move class。
8. 最后讲 JavaScript hooks、`:css="false"`、`done` 与取消边界。
9. 展示恰好 8 个不凑数的易错提示。
10. 单独展示源码推导和高级场景分组，不把实现细节混入入门路径。
11. 运行唯一 Demo 的稳定交互序列，并切换 reduced motion 验证功能降级。
12. 完成练习、回顾、Reference 链接与下一课预告；到此停止。

## 核心教学示例

### presence：让条件节点进入与离开

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

/** 切换通知是否存在于 DOM。 */
function toggleNotice(): void {
  visible.value = !visible.value
}
</script>

<template>
  <button type="button" @click="toggleNotice">
    {{ visible ? '隐藏通知' : '显示通知' }}
  </button>
  <Transition name="notice">
    <p v-if="visible">资料已保存</p>
  </Transition>
</template>

<style scoped>
.notice-enter-active,
.notice-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
```

按钮先改变真实业务状态，Transition 只负责状态变化的视觉反馈；去掉 Transition 后，隐藏与显示仍
必须正确工作。

### identity：用 key 与 out-in 切换互斥视图

```vue
<Transition name="view" mode="out-in">
  <section :key="activeView">
    {{ activeView === 'summary' ? '摘要视图' : '详细视图' }}
  </section>
</Transition>
```

同一个 `section` 只有在 key 改变时才形成旧、新 VNode。`out-in` 让旧视图先离开，从而避免两个
互斥状态同时占据布局；它不是数据加载机制，也不缓存组件状态。

### collection：用稳定业务 key 过渡列表

```vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">
    {{ topic.label }}
  </li>
</TransitionGroup>
```

```css
.topic-enter-active,
.topic-leave-active,
.topic-move {
  transition: opacity 180ms ease, transform 180ms ease;
}

.topic-enter-from,
.topic-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.topic-leave-active {
  position: absolute;
}
```

列表身份来自 `topic.id`，不是当前下标。离开项绝对定位是常见的布局手段，使剩余项目可以立即移动
到新位置；是否采用它取决于实际容器布局，不应当写成 runtime 强制要求。

## 易错使用提示

### 1. 把 Transition 当成多个同级节点的动画容器

**说明：** `<Transition>` 只协调一个非注释元素或组件。多个列表项应使用
`<TransitionGroup>`，否则开发环境会警告，移动过渡也没有正确所有者。

错误示范：

```vue
<Transition name="topic">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</Transition>
```

正确示范：

```vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</TransitionGroup>
```

**后果：** 开发环境产生单子节点警告，列表项的插入、离开和位置移动也无法形成完整协调过渡。

来源：[Transition 单子节点](https://cn.vuejs.org/guide/built-ins/transition.html#the-transition-component)、
[BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)。

### 2. 只更新同一节点文字，却期待一次 leave / enter

**说明：** 原地文本 patch 不会替换 VNode。确实需要状态交接动画时，应给互斥状态稳定且不同的
key；如果只需数值更新，则不要为了“触发动画”随意制造节点身份。

错误示范：

```vue
<Transition name="status">
  <p>{{ status.label }}</p>
</Transition>
```

正确示范：

```vue
<Transition name="status" mode="out-in">
  <p :key="status.id">{{ status.label }}</p>
</Transition>
```

**后果：** 错误写法只 patch 文本，不会运行成对的 leave / enter 类和钩子，视觉内容会直接跳变。

来源：[使用 key 触发过渡](https://cn.vuejs.org/guide/built-ins/transition.html#transitions-with-the-key-attribute)。

### 3. 在 TransitionGroup 中使用下标或变化中的值作 key

**说明：** FLIP 必须知道更新前后的哪个 VNode 是同一业务项。数组下标会随插入、删除和排序漂移，
随机值或时间戳则让每次渲染都成为全量替换。

错误示范：

```vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="(topic, index) in topics" :key="index">{{ topic.label }}</li>
</TransitionGroup>
```

正确示范：

```vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</TransitionGroup>
```

**后果：** DOM 与组件局部状态可能被复用给错误业务项，FLIP 也无法稳定匹配更新前后的同一项目。

来源：[TransitionGroup 进入/离开与列表移动](https://cn.vuejs.org/guide/built-ins/transition-group.html)、
[TransitionGroup.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts)。

### 4. 给 TransitionGroup 设置 mode 或假定它总会生成 div

**说明：** `TransitionGroupProps` 不含 mode；多个列表项不能整体套用 out-in / in-out。Vue 3 中默认
容器是 Fragment，需要语义容器时显式传 `tag`。

错误示范：

```vue
<TransitionGroup name="topic" mode="out-in">
  <article v-for="topic in topics" :key="topic.id">{{ topic.label }}</article>
</TransitionGroup>
```

正确示范：

```vue
<TransitionGroup name="topic" tag="ul">
  <li v-for="topic in topics" :key="topic.id">{{ topic.label }}</li>
</TransitionGroup>
```

**后果：** `mode` 不会按预期串行列表过渡，依赖默认 `div` 的选择器、语义和布局也会失效。

来源：[TransitionGroup 与 Transition 的区别](https://cn.vuejs.org/guide/built-ins/transition-group.html#differences-from-transition)、
[TransitionGroup.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts)。

### 5. 认为初次渲染会自动执行 enter

**说明：** 默认情况下，Transition 在组件已经挂载后才处理后续进入。只有产品确实需要首屏出现
效果时才使用 `appear`；内容可见性不能依赖动画完成。

错误示范：

```vue
<Transition name="hero">
  <section>首次加载也会自动淡入</section>
</Transition>
```

正确示范：

```vue
<Transition name="hero" appear>
  <section>显式启用首次进入</section>
</Transition>
```

**后果：** 未声明 `appear` 时首屏节点直接显示，不会执行预期的初次进入类或 appear / enter 钩子。

来源：[Transition on Appear](https://cn.vuejs.org/guide/built-ins/transition.html#transition-on-appear)、
[BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)。

### 6. 同一元素同时使用 transition 和 animation，却不指定 type

**说明：** 两类 CSS 效果都存在时，Vue 自动选择的结束事件可能不是业务想等待的那一个，造成类
过早或过晚清理。

错误示范：

```vue
<Transition name="panel">
  <Panel v-if="open" />
</Transition>
```

```css
.panel-enter-active {
  animation: pop 400ms;
  transition: opacity 150ms;
}
```

正确示范：

```vue
<Transition name="panel" type="animation">
  <Panel v-if="open" />
</Transition>
```

**后果：** Vue 可能按错误事件类型清理类和完成钩子，使视觉效果与节点移除时机不同步。

来源：[同时使用 transition 和 animation](https://cn.vuejs.org/guide/built-ins/transition.html#using-transitions-and-animations-together)、
[Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)。

### 7. 内层有 delay，却让 Vue 猜整段嵌套过渡时长

**说明：** Vue 依据直接过渡元素检测结束，不会理解所有后代效果构成的业务时间线。嵌套延迟时应
显式给出 delay + duration 的总时长，进入和离开不同则分别声明。

错误示范：

```vue
<Transition name="nested">
  <section v-if="open"><PanelContent /></section>
</Transition>
```

正确示范：

```vue
<Transition name="nested" :duration="{ enter: 550, leave: 350 }">
  <section v-if="open"><PanelContent /></section>
</Transition>
```

**后果：** 外层类可能提前清理，离开节点也可能在内层延迟动画完成前被移除。

来源：[嵌套过渡与显式时长](https://cn.vuejs.org/guide/built-ins/transition.html#nested-transitions-and-explicit-transition-durations)、
[Transition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)。

### 8. 关闭 CSS 检测后，不在异步 JavaScript hook 调用 done

**说明：** `:css="false"` 后 Vue 不再等待 CSS。异步动画 hook 必须接收并在结束时调用 `done`。
只声明一个参数会被当作同步 hook；声明第二个参数却不调用 `done`，则会一直停在未完成状态。

错误示范：

```ts
/** 启动离开动画，但没有把完成状态交回 Vue。 */
function animateLeave(element: Element): void {
  animationLibrary.animate(element)
}
```

正确示范：

```ts
/** 启动离开动画，并在完成后通知 Vue。 */
function animateLeave(element: Element, done: () => void): void {
  animationLibrary.animate(element, { onComplete: done })
}
```

**后果：** 单参数错误写法会让离开节点在动画库完成前移除；接收但遗漏 `done` 则会让过渡挂起。

来源：[JavaScript 钩子](https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks)、
[BaseTransition.ts](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)。

## 源码推导

### runtime-core 与 runtime-dom 分工

`BaseTransition` 不关心 CSS。它把 VNode 的 beforeEnter、enter、leave、取消、延迟离开和真实 remove
组织成平台无关状态机。runtime-dom 的 `Transition` 是薄适配层：`resolveTransitionProps()` 把
name、六类、type、duration 和 DOM 事件检测翻译成 `BaseTransition` 能调用的 hooks。

由此可推导：

- 自定义 renderer 可以复用 BaseTransition，但 CSS 类和浏览器事件属于 runtime-dom。
- `:css="false"` 返回纯 base props，DOM 六类和自动结束检测不再接管生命周期。
- Transition 是视觉协调层，不拥有业务状态；没有 CSS 时 VNode 的插入、替换和移除仍然成立。

### 两帧切类不是公开测试时钟

`nextFrame()` 连续调用两次 `requestAnimationFrame`，让浏览器提交 from 状态后再切到 to。这个实现
解释了为什么 from/to 能形成样式差，但不构成课程测试可以写死的“32ms”。帧率、后台标签页、
reduced motion 和不同浏览器都会改变墙钟时间。

因此自动化必须等待最终 DOM 或语义状态，不能：

- `waitForTimeout(200)` 后猜动画结束。
- 断言某一毫秒恰好存在 `*-enter-from`。
- 用截图捕捉临时帧作为功能是否正确的唯一证据。

### 取消与快速反向切换

元素保存当前 enter / leave callback。新进入开始前，runtime 会取消尚未完成的 leave；leave 开始前
也会取消 enter。回调有 called guard，确保 after 与 cancelled 不会重复完成。

由此可推导：频繁点击切换按钮是合法输入。业务状态必须最终收敛到最后一次意图；课程 Demo 不应
通过禁用按钮或人为 timer 避开取消路径，也不应把精确钩子日志条数作为跨浏览器主契约。

### mode 是 VNode 替换调度

`out-in` 设置 `isLeaving` 并临时返回占位，旧节点 afterLeave 后才触发组件更新；`in-out` 则把旧
节点的 leave 推迟到新节点 enter 完成。两者都只在 `isSameVNodeType(old, next)` 为 false 时介入。

由此可推导：没有不同 type/key，就没有可排序的新旧节点；`mode` 不能把同节点属性更新变成两段
动画，也不能替代异步数据的 loading/error 状态管理。

### TransitionGroup 的 FLIP 边界

更新前保存旧坐标，更新后保存新坐标，再计算 `dx` / `dy` 并写反向 translate；reflow 后清空内联
transform，让 move class 接管回到新位置。这解释了：

- 稳定 key 是匹配更新前后同一项的前提。
- move class 必须包含 transform transition，否则 runtime 检测后跳过移动动画。
- reduced motion 可以让 move transition 失效，但 DOM 排序仍必须正确。
- 测试主要断言最终项目顺序，不应把中间内联 transform 当作公共 API。

## 高级使用场景分组

### A. presence 与持续挂载

- 临时通知、展开区、空态使用 `v-if`，离开完成后节点移除。
- 需要保留 DOM 和本地状态的面板可用 `v-show`；Transition 处理 display 切换，但语义上仍是同一
  节点，不应宣称发生了组件卸载。
- 首屏效果只有明确需要时使用 `appear`，不能让核心内容等待动画才可访问。

### B. identity 与互斥视图

- 同标签的状态文案、步骤页或图标可用稳定 key 表达“旧状态交给新状态”。
- `out-in` 适合不能同时出现的状态；`in-out` 适合优先保持内容连续、允许短时重叠的场景。
- 动态组件和 KeepAlive 的完整生命周期、缓存与激活停用属于下一课，本课只把它列作触发条件预告。

### C. collection 与列表移动

- 插入、删除、排序统一由稳定业务 ID 维护身份。
- move class 优先过渡 transform；若离开项阻塞剩余项移动，可在具体布局中对 leave-active 使用绝对
  定位，但需保证容器尺寸和焦点顺序仍正确。
- stagger 可以通过 JavaScript hook 和 item data 实现，但不是本课 Demo 的主路径，避免引入 timer
  和不稳定自动化。

### D. 可复用视觉契约与第三方动画

- 封装可复用过渡组件时透传 slot，视觉类名和时长应与组件职责绑定，不把业务状态藏进动画组件。
- 第三方动画库使用 `:css="false"` 和 done；快速反向时要支持取消或幂等完成。
- 自定义 class props 可接入已有 CSS 动画体系，但本课程以 name 约定为主，详细 prop 回到 Reference。

### E. 可访问性与稳定验证

- reduced motion 下移除 transform 位移和可感知 duration，状态变化、焦点与操作结果不变。
- 不用颜色或动画作为“已隐藏 / 已切换 / 已排序”的唯一反馈；提供可读状态文本。
- 自动化断言最终 DOM、可访问名称和稳定 data-state，不断言临时类或固定墙钟时间。

## 唯一 Demo 规格

### 文件与公开 ID

唯一公开 Demo 文件：

`src/content/demos/vue/core/learn/intermediate/transitions/transition-state-lab-demo.vue`

由 registry 约定自动生成唯一公开 ID：

`vue.core.learn.intermediate.transitions.transition-state-lab-demo`

不新增 `parts/` 子组件、第二个 Demo、原理动画、全局样式或第三方动画依赖。一个 SFC 足以展示三种
状态变化，避免为视觉效果引入额外模块边界。

### 教学场景

Demo 名为“过渡身份实验台”，包含三个同级区域，不创建卡片套卡片：

1. **存在区**：`v-if` 通知初始可见；按钮在“隐藏通知 / 显示通知”之间切换。
2. **身份区**：摘要与详情共用元素标签，以 `activeView` 作为 key，并用 `mode="out-in"` 切换。
3. **列表区**：`TransitionGroup tag="ol"` 渲染 Alpha、Beta、Gamma；“轮换顺序”执行确定的数组轮换，
   “重置实验”恢复初态。

页面永久显示一个 `role="status" aria-live="polite" aria-atomic="true"` 的结果摘要，例如
“通知：已显示；视图：摘要；顺序：Alpha → Beta → Gamma”。动画不是唯一反馈。

### 状态与方法骨架

```ts
type ViewId = 'summary' | 'details'

interface TopicItem {
  id: 'alpha' | 'beta' | 'gamma'
  label: string
}

const initialTopics: TopicItem[] = [
  { id: 'alpha', label: 'Alpha' },
  { id: 'beta', label: 'Beta' },
  { id: 'gamma', label: 'Gamma' },
]

const noticeVisible = ref(true)
const activeView = ref<ViewId>('summary')
const topics = ref<TopicItem[]>(initialTopics.map((item) => ({ ...item })))

/** 切换通知节点的存在状态。 */
function toggleNotice(): void {
  noticeVisible.value = !noticeVisible.value
}

/** 在摘要与详情身份之间切换。 */
function switchView(): void {
  activeView.value = activeView.value === 'summary' ? 'details' : 'summary'
}

/** 把最后一项稳定地轮换到列表首位。 */
function rotateTopics(): void {
  topics.value = [topics.value.at(-1)!, ...topics.value.slice(0, -1)]
}

/** 恢复三个实验区的初始业务状态。 */
function resetLab(): void {
  noticeVisible.value = true
  activeView.value = 'summary'
  topics.value = initialTopics.map((item) => ({ ...item }))
}
```

实现中每个新增方法定义上方都保留规范中文注释。不得使用 `setTimeout`、随机数、时间戳或动画完成
计数驱动业务状态。

### 稳定自动化契约

稳定定位与最终状态冻结为：

| 区域 | 稳定定位 | 初态 | 操作后的最终状态 |
| --- | --- | --- | --- |
| Demo 根 | `.transition-state-lab-demo` | 恰好一个 | 始终存在 |
| 通知状态 | `[data-state="notice"]` | `已显示` | 隐藏后 `已隐藏`，显示后 `已显示` |
| 通知节点 | `[data-testid="transition-notice"]` | 可见 | 隐藏完成后 count 0 |
| 当前视图 | `[data-state="active-view"]` | `摘要视图` | 切换后 `详细视图` |
| keyed 节点 | `[data-testid="keyed-view"]` | `data-view="summary"` | `data-view="details"` |
| 列表 | `[data-testid="transition-topic-list"]` | Alpha/Beta/Gamma | 一次轮换后 Gamma/Alpha/Beta |
| 汇总 | `[data-state="transition-summary"]` | 三项初态 | 与最终 DOM 一致 |

交互序列：

1. 进入课程，确认唯一 Demo 正常解析，`.demo-box .missing` 为 0，控制台无 warning/error。
2. 点击“隐藏通知”，使用 Playwright 自动等待通知节点 count 变为 0，并断言状态文本为“已隐藏”。
3. 点击“显示通知”，等待通知节点可见，状态文本恢复“已显示”。
4. 点击“切换到详细视图”，等待 keyed 节点 `data-view="details"` 且文本为“详细视图”。
5. 点击“轮换顺序”，直接断言列表项最终 DOM 顺序为 Gamma、Alpha、Beta。
6. 再轮换一次，最终顺序为 Beta、Gamma、Alpha；不读取中间 transform。
7. 点击“重置实验”，通知、视图与列表全部恢复初态。
8. 快速连续切换通知两次，最终业务状态与最后一次意图一致，无重复节点和 console error。
9. 以 `page.emulateMedia({ reducedMotion: 'reduce' })` 重新执行 2 至 7，所有功能断言保持一致。
10. 至少用键盘激活一次主按钮，并按 `status` role 断言完整结果摘要。

自动化禁止 `waitForTimeout()`、硬编码动画毫秒、断言临时 `*-enter-*` / `*-leave-*` 类或以截图
时刻判断完成。Playwright locator 自带的条件等待就是反馈环；CSS 时长只影响等待多久，不改变断言。

### Demo 样式与 reduced motion

- 只使用 flex、flex-wrap、margin 和 padding 排列控制区，不使用 CSS Grid 或 `gap` 属性。
- 三个区域是同一实验台中的无嵌套 section；不为每个状态再包一层装饰卡片。
- 所有按钮使用 `<button type="button">`，具有完整可见命令、键盘焦点样式和至少 44px 高度。
- flex 子项设 `min-width: 0`；标题、状态和按钮文字允许换行，不设置会截断长文本的固定高度。
- 视觉属性优先 opacity 与 transform；列表 leave-active 若使用 absolute，必须让容器不塌陷。
- reduced motion 下取消所有空间位移和列表 move，transition-duration 降为近零或直接 none；最终
  display、DOM 移除、keyed 替换和列表排序仍照常完成。

建议的降级规则：

```css
@media (prefers-reduced-motion: reduce) {
  .lab-enter-active,
  .lab-leave-active,
  .topic-enter-active,
  .topic-leave-active,
  .topic-move {
    transition: none;
  }

  .lab-enter-from,
  .lab-leave-to,
  .topic-enter-from,
  .topic-leave-to {
    opacity: 1;
    transform: none;
  }
}
```

### 390px 与 200% 文本验收

- 视口固定为 390 × 844；三个实验区和全部控制项严格单列，页面级无横向滚动。
- `document.documentElement.scrollWidth <= window.innerWidth`。
- 所有按钮实测 `getBoundingClientRect().height >= 44`，按钮名称在换行后仍完整可见。
- 对 Demo 内 h3、h4、p、li、状态输出与 button 注入 `font-size: 200% !important`；每个元素边界仍
  落在 Demo 根边界内，`scrollWidth <= clientWidth` 且 `scrollHeight <= clientHeight`。
- 文本放大后，状态与控制不重叠；列表标签不遮挡序号；focus outline 不被 overflow 裁切。
- normal motion 和 reduced motion 两种媒体条件均重复无横向滚动与最终状态断言。
- 颜色、位移和透明度都不是唯一状态信号；屏幕阅读器能从按钮名和汇总文本理解结果。

## 练习

### 练习一：修复不触发的状态切换

给定一个 `<p>{{ status.label }}</p>`，要求让 `ready` 与 `failed` 之间用 `out-in` 交接，但相同状态的
文案更新仍原地 patch。答案要点：key 使用稳定 `status.id`，不能使用 `Date.now()` 或整段 label。

### 练习二：修复错误列表身份

给定按 index 作为 key 的可排序课程列表，插入一项后观察错误复用。改为业务 `course.id`，补上
move class，并解释自动化为什么断言最终 DOM 顺序而非中间 transform。

### 练习三：实现功能完整的 reduced motion

为一个带位移的通知过渡增加 `prefers-reduced-motion: reduce`。验收不是“动画看起来更短”，而是：
位移取消、通知仍能隐藏/显示、状态文本更新、按钮可键盘操作、自动化无需改变业务断言。

练习不要求实现动态组件、KeepAlive、第三方动画库或新的 Demo。

## 课程 metadata

```ts
export const meta = defineLessonMeta({
  id: 'vue.core.learn.intermediate.transitions',
  type: 'lesson',
  title: '过渡效果',
  summary: '用稳定节点身份组织进入、离开和列表移动，并为 reduced motion 完整降级',
  ecosystem: 'vue',
  module: 'core',
  collection: 'intermediate',
  level: 'intermediate',
  prerequisites: ['vue.core.learn.intermediate.provide-inject'],
  related: [
    'vue.core.learn.intermediate.provide-inject',
    'vue.core.learn.basics.conditional-list-rendering',
    'vue.core.learn.intermediate.lifecycle-update-timing',
    'vue.core.reference.built-ins.transition',
  ],
  tags: [
    'Transition',
    'TransitionGroup',
    'CSS transition',
    '节点身份',
    '列表过渡',
    'reduced motion',
  ],
  sources: [
    {
      title: 'Vue 中文 Transition 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/transition',
    },
    {
      title: 'Vue 中文 TransitionGroup 指南',
      url: 'https://cn.vuejs.org/guide/built-ins/transition-group',
    },
    {
      title: 'Vue 内置组件 API：Transition / TransitionGroup',
      url: 'https://cn.vuejs.org/api/built-in-components',
    },
    {
      title: 'Vue 3.5.40 BaseTransition.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts',
    },
    {
      title: 'Vue 3.5.40 Transition.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts',
    },
    {
      title: 'Vue 3.5.40 TransitionGroup.ts',
      url: 'https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts',
    },
  ],
  appliesTo: 'Vue 3.5.40',
  verifiedAt: '2026-07-31',
  estimatedMinutes: 55,
})
```

上述 ID、唯一 prerequisite、related 四项及顺序、唯一 Demo ID、易错点数量和 55 分钟均为冻结
契约。planned 的动态组件与 KeepAlive 只在正文结尾预告，不进入 prerequisites 或 related。

## 正文结构化块要求

课程实现至少包含：

- `objectives`：使用本调研“学习目标”，可压缩措辞，不删除身份、列表、降级与稳定验证目标。
- `blocks`：正文顺序严格遵循本调研“正文编排”。
- `demo`：唯一 ID，description 说明 presence、keyed identity 与列表重排，`playground: true`。
- `pitfalls`：恰好 8 项，每项转换为 schema 的 description、consequence、wrong、correct。
- `exercise`：至少覆盖 key 修复、稳定列表身份和 reduced motion 三类中的两类。
- `recap`：覆盖触发条件、六类、key/mode、TransitionGroup、结束边界和 reduced motion。

建议 recap：

1. Transition 处理单节点的进入、离开和身份替换，不拥有业务状态。
2. from/active/to 描述两端状态与整个过渡阶段。
3. key 决定同标签节点是否是新身份，mode 决定新旧身份的交接顺序。
4. TransitionGroup 要求稳定业务 key，以 FLIP 处理位置移动，并且没有 mode。
5. type、duration 与 done 解决“Vue 应何时认为过渡结束”。
6. reduced motion 可以移除视觉移动，但不能破坏状态与交互。
7. 自动化等待最终 DOM 与语义状态，不等待固定毫秒或临时类。

## 最小 TDD 接缝

实现时先建立两个最小红灯，不为八个易错点分别添加测试。

### 红灯一：课程 catalog 契约

修改 `src/content/catalog/vue-core-track.spec.ts`：

- intermediate 顺序在 provide-inject 后新增 `vue.core.learn.intermediate.transitions`。
- track `total` 从 18 变为 19。
- prerequisite 精确为 `['vue.core.learn.intermediate.provide-inject']`。
- related 精确等于 metadata 冻结的四项，且每个 ID 都能解析。
- 新课程的相邻前项是 provide-inject；不能断言 planned 的动态课程已有正文或 neighbor。

先运行 focused Vitest，失败只能来自课程条目缺失或 manifest 仍为 planned。

### 红灯二：唯一 Demo 公开面

修改 `src/content/interactive/registry.spec.ts`：

- 中级公开 Demo 列表新增
  `vue.core.learn.intermediate.transitions.transition-state-lab-demo`。
- `resolveDemo()` 对该 ID 非 null。
- 不新增或公开 parts、第二个 basename Demo 或原理动画。

先运行 focused Vitest，失败只能来自 Demo 文件尚不存在。

### 绿灯与最小回归

添加课程、唯一 Demo 并把 manifest 单项转为 available 后，重跑同一 focused 命令。不要用快照记录
过渡临时 class，也不要用 fake timer 模拟浏览器帧。

随后只在现有 `tests/e2e/progress.spec.ts` 的 390px 长路径末尾追加本课，不另建一条重复 E2E：

1. 在依赖注入课程点击“下一篇：过渡效果”。
2. 到达 `/learn/vue/core/intermediate/transitions`，唯一 Demo 正常解析。
3. 执行稳定自动化契约的隐藏、显示、视图切换、两次列表轮换和重置。
4. 验证按钮高度、390px 无横向滚动、200% 文本不溢出。
5. reduced motion 下复跑主交互终态。
6. 最后确认无“下一篇：动态组件与 KeepAlive”可导航链接，因为下一课仍为 planned。

## 实现与集成清单

后续实施只需评估和修改以下文件：

- `src/content/entries/learn/vue/core/intermediate/transitions.ts`：课程 metadata、目标、正文、练习、
  recap 与唯一 Demo block。
- `src/content/demos/vue/core/learn/intermediate/transitions/transition-state-lab-demo.vue`：唯一 Demo。
- `src/content/catalog/manifests/vue-core-track.ts`：只把 transitions 从 planned 改为 available，并删除
  该 planned 项上的 title/summary 兜底字段。
- `src/content/catalog/vue-core-track.spec.ts`：19 课顺序、prerequisite、related 与可解析性。
- `src/content/interactive/registry.spec.ts`：唯一公开 Demo ID。
- `tests/e2e/progress.spec.ts`：在既有 390px 长路径末尾追加本课稳定交互。
- `docs/重构实施计划.md`：实施和验证完成后更新为 `19 available / 41 planned` 及下一批状态。

无需修改：

- `src/content/schema/*`。
- `src/content/interactive/registry.ts` 或 glob 规则。
- `src/content/entries/reference/vue/core/built-ins/transition.ts`。
- `src/content/demos/vue/core/reference/built-ins/transition/transition-demo.vue`。
- 全局样式、router 实现、动态组件 / KeepAlive、Teleport、Suspense 或其他课程。

## 长路径进入方式

课程 available 后有三种合法入口：

1. 从 `/learn/vue/core/intermediate/provide-inject` 点击“下一篇：过渡效果”，这是现有 390px
   Playwright 长路径应使用的入口。
2. 从 `/learn/vue/core` 的中级课程总览进入“内置组件与过渡”分类，再选择“过渡效果”。
3. 直接刷新 `/learn/vue/core/intermediate/transitions`，验证稳定深链接和正文异步加载。

课程页 related 可回到“依赖注入”“条件渲染与列表渲染”“生命周期与更新时机”及现有 Transition
Reference。下一课仍 planned，因此当前课程完成后没有可导航的 dynamic-components-keep-alive 正文。

## 最终验证建议

实施批次完成后按最小到完整顺序验证：

1. focused `vue-core-track.spec.ts` 红灯后绿灯。
2. focused `interactive/registry.spec.ts` 红灯后绿灯。
3. 全量 Vitest、`npm run type-check`、`npm run lint`、`npm run format:check`。
4. `npm run build` 与 `git diff --check`；这是 Vue/Vite 项目，不适用纯 HTML 禁止构建规则。
5. 使用用户已经运行的本地服务执行现有 390px Playwright 长路径；不要为验证启动第二个服务。
6. normal motion 与 reduced motion 下都执行同一终态断言，无固定 sleep。
7. 静态搜索新课程与 Demo，不存在 CSS `grid`、`gap`、`row-gap`、`column-gap`。
8. 检查所有新增方法定义上方有规范中文注释。
9. 核对三条 Vue 学习路线精确为 `19 available / 41 planned`。
10. Standards / Spec 双轴复审目标为 PASS / 0 finding。

本调研任务本身不运行构建、不启动服务、不打开页面，也不修改实现文件。

## 明确排除与停止边界

- 不修改现有 Transition / TransitionGroup Reference 或 Reference Demo。
- 不进入 `vue.core.learn.intermediate.dynamic-components-keep-alive`，该课保持 planned。
- 不实现动态组件、KeepAlive、Teleport、Suspense、路由过渡或跨路由状态缓存。
- 不引入第三方动画库、Web Animations API 封装、stagger timer 或新的全局 motion tokens。
- 不新增第二个 Demo、parts 子组件、原理动画、兼容路由或 Schema 类型。
- 不把本课完成写成 Gate 6、Vue Core 中级或全部内置组件课程关闭。
- 完成 `19 available / 41 planned`、长路径和本课验证后立即停止，只报告下一课仍 planned。

## 固定来源清单

### Vue 官方中文文档

- [Transition 指南](https://cn.vuejs.org/guide/built-ins/transition.html)：触发条件、六类、CSS/
  animation、mode、appear、key、JavaScript hooks、复用与性能。
- [TransitionGroup 指南](https://cn.vuejs.org/guide/built-ins/transition-group.html)：与 Transition 的差异、
  stable key、进入离开、move class、FLIP 与 stagger 示例。
- [内置组件 API：Transition](https://cn.vuejs.org/api/built-in-components.html#transition)：props、事件与
  单子节点契约。
- [内置组件 API：TransitionGroup](https://cn.vuejs.org/api/built-in-components.html#transitiongroup)：
  `tag`、`moveClass` 与无 mode 的公开类型。

### vuejs/core v3.5.40 固定源码

- [`packages/runtime-core/src/components/BaseTransition.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/BaseTransition.ts)：单子节点、state、mode、hooks、取消、延迟 leave 与真实 remove。
- [`packages/runtime-dom/src/components/Transition.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/Transition.ts)：六类、两帧切类、reflow、type、duration、CSS end 检测。
- [`packages/runtime-dom/src/components/TransitionGroup.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-dom/src/components/TransitionGroup.ts)：key 警告、tag、move class、位置记录与 FLIP。
