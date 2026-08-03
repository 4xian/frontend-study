# Vue Core 高级课程：异步组件与 Suspense 调研

> 查证日期：2026-08-01  
> 适用版本：Vue 3.5.40  
> 资料范围：Vue 官方中文与英文文档、Vue 内置组件 API、`vuejs/docs` 官方
> Markdown、`vuejs/core` v3.5.40 固定标签源码。外部资料通过 Tavily 定位与提取，社区文章、
> 问答和 issue 讨论不作为结论依据。

## 冻结建议

| 项目 | 建议值 |
| --- | --- |
| 课程 ID | `vue.core.learn.advanced.async-components-suspense` |
| 标题 | 异步组件与 Suspense |
| 阶段 / 分类 | `advanced` / `async-and-errors` |
| 唯一直接前置 | `vue.core.learn.intermediate.teleport` |
| 唯一公开 Demo ID | `vue.core.learn.advanced.async-components-suspense.suspense-boundary-lab-demo` |
| 易错点 | 8 个高质量候选 |
| 预计时长 | 65 分钟 |
| 实施前总量 | Vue 三条学习路线 `21 available / 39 planned` |
| 实施后总量 | Vue 三条学习路线 `22 available / 38 planned` |

本课对应 manifest 中已经存在的“异步组件与 Suspense”，不是新增另一篇同名课程。课程应同时解释
`defineAsyncComponent()` 与 `<Suspense>` 的职责，但以 Suspense 边界的公开行为为主线。现有
`<Suspense>` Reference 和 Reference Demo 继续承担 API 速查职责，本批不得修改或复制它们。

## 一手来源

- [Vue 中文 Suspense 指南](https://cn.vuejs.org/guide/built-ins/suspense.html)：实验性状态、
  异步依赖、插槽、重新挂起、事件、错误处理、组件组合与嵌套边界。
- [Vue English Suspense Guide](https://vuejs.org/guide/built-ins/suspense.html)：与中文指南交叉核对
  公开语义。
- [Vue 内置组件 API：Suspense](https://cn.vuejs.org/api/built-in-components.html#suspense)：
  `timeout`、`suspensible`、三个事件和两个插槽。
- [Vue Suspense 官方 Markdown](https://github.com/vuejs/docs/blob/main/src/guide/built-ins/suspense.md)：
  官网原始内容和嵌套边界说明。
- [Vue 中文异步组件指南](https://cn.vuejs.org/guide/components/async.html)：
  `defineAsyncComponent()`、加载/错误状态、3.5+ 延迟水合与 Suspense 关联。
- [Vue 3.5.40 `Suspense.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)：
  分支、依赖计数、事件、timeout、嵌套边界与 hydration 实现。
- [Vue 3.5.40 `apiAsyncComponent.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts)：
  异步组件的 `suspensible` 默认值、SSR 分支和 hydration strategy。
- [Vue 3.5.40 `ssrRenderSuspense.ts`](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrRenderSuspense.ts)：
  官方 server renderer 对 Suspense 的服务端输出边界。

## 必须准确覆盖的公开语义

### 1. Suspense 协调组件渲染依赖，不拦截任意 Promise

`<Suspense>` 会等待默认插槽组件树中的两类异步依赖：

1. 返回 Promise 的 `async setup()`，包括 `<script setup>` 顶层 `await`。
2. 默认 `suspensible: true` 的异步组件。

在普通 `onMounted()`、点击回调或 store action 中开始的请求，不会因为位于 Suspense 后代中就自动
登记到边界。课程必须把“组件渲染阶段的异步依赖”与“任意业务异步状态”分开，避免把 Suspense
教授成通用请求管理器。

```vue
<!-- 会成为 Suspense 依赖 -->
<script setup lang="ts">
const profile = await loadProfile()
</script>
```

```ts
// 不会成为 Suspense 依赖
const profile = ref<Profile>()

onMounted(async () => {
  profile.value = await loadProfile()
})
```

来源：[异步依赖](https://cn.vuejs.org/guide/built-ins/suspense.html#async-dependencies)、
[`registerDep()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L713-L776)。

### 2. `defineAsyncComponent()` 与边界的职责

`defineAsyncComponent()` 接受返回 Promise 的 loader；异步包装组件只在实际渲染时调用 loader，并
把 props 与 slots 传给解析后的内部组件。它适合拆分组件代码，不能单独代表数据已经预取完成。

异步组件默认 `suspensible: true`。父链存在 Suspense 时，组件成为该边界的依赖，统一加载状态由
边界处理。设置 `suspensible: false` 才让异步组件退出边界控制并独立管理自己的加载状态。课程应
把这个选择解释为“一个 owner 负责加载体验”，不要同时依赖局部 loading 与父级 fallback。

来源：[异步组件指南](https://cn.vuejs.org/guide/components/async.html)、
[Suspense 的异步组件说明](https://cn.vuejs.org/guide/built-ins/suspense.html#async-components)、
[`suspensible = true` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts)。

### 3. `#default` 与 `#fallback` 都必须单根

Suspense 有 `#default` 和 `#fallback` 两个插槽，两个插槽都只允许一个直接子节点。初次渲染时，
Vue 先在隐藏容器中渲染 default 分支：

- 没遇到异步依赖时，边界直接 resolved，显示 default。
- 遇到依赖时，边界 pending，真实容器显示 fallback。
- 所有已登记依赖解析后，完整 default 分支一次性移入真实容器。

```vue
<Suspense>
  <main>
    <AsyncProfile />
    <AsyncActivity />
  </main>

  <template #fallback>
    <section aria-busy="true">正在准备页面...</section>
  </template>
</Suspense>
```

来源：[加载中状态](https://cn.vuejs.org/guide/built-ins/suspense.html#loading-state)、
[Suspense API](https://cn.vuejs.org/api/built-in-components.html#suspense)、
[`normalizeSuspenseSlot()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L856-L900)。

### 4. resolved 后只有 default 根替换才会重新 pending

边界首次 resolved 后，不会因为原有根节点内部后来出现任意深层异步依赖而自动重新显示 fallback。
只有 default 插槽的根 VNode 被替换，边界才重新进入 pending。课程 Demo 应通过改变根组件的 `key`
创建明确的根替换，不能把偶然的深层更新描述成边界契约。

重新 pending 时，旧 default 内容会先保留；fallback 是否出现取决于 `timeout`。因此“进入 pending”
和“正在显示 fallback”是两个不同状态。

来源：[加载中状态与根替换](https://cn.vuejs.org/guide/built-ins/suspense.html#loading-state)、
[`patchSuspense()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)。

### 5. `timeout` 只决定 fallback 显示时机

`timeout` 的单位是毫秒，只在已 resolved 边界因 default 根替换再次 pending 时，控制继续展示旧
default 多久后切到 fallback：

- `timeout="0"`：立即展示 fallback。
- 正数：到期前保留旧 default；若新分支提前完成，直接切到新 default，不触发 fallback。
- 未提供：保持旧 default，直到新分支解析完成。

它不是 loader 或网络请求的超时，不会取消 Promise、触发 AbortController、生成错误，也不会替代
`defineAsyncComponent()` 自己的 timeout 选项。

Vue 3.5.40 在创建 Suspense boundary 时把 `vnode.props.timeout` 转为数字并缓存到 boundary；更新同一
boundary 的 timeout prop 不会重新读取该值。本课 Demo 因此使用两个创建时就分别固定为 `0` 和
`1200` 的边界，不依赖动态更新 timeout。

来源：[Suspense timeout](https://cn.vuejs.org/guide/built-ins/suspense.html#loading-state)、
[`timeout` 分支 v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts#L383-L417)。

### 6. `pending`、`fallback`、`resolve` 是三个独立事件

- `pending`：边界进入 pending 时触发。
- `fallback`：fallback 分支实际开始展示时触发。
- `resolve`：新 default 分支完成解析并成为活动分支时触发。

正数 timeout 下，新 default 可能在 fallback 出现前完成，形成 `pending -> resolve`，不会出现
`fallback`。因此不要用一个 boolean 把三个事件当作相同含义；Demo 应把当前 phase 与事件日志
分开，测试真实事件序列。

来源：[Suspense 事件](https://cn.vuejs.org/guide/built-ins/suspense.html#events)、
[`onPending` / `onFallback` / `onResolve` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)。

### 7. 嵌套 Suspense 必须明确 owner

Vue 3.3 起，嵌套 Suspense 可以通过内层 `suspensible` 把异步依赖处理交给父边界：父边界接管依赖
和事件，内层只作为解析与 patch 边界。没有 `suspensible` 时，父边界把内层当同步组件，内层显示
自己的 fallback；多个边界可能分别 patch，并出现短暂空节点或多段 loading。

```vue
<Suspense>
  <AsyncShell>
    <Suspense suspensible>
      <AsyncSection />
      <template #fallback><SectionSkeleton /></template>
    </Suspense>
  </AsyncShell>
  <template #fallback><PageSkeleton /></template>
</Suspense>
```

课程只需要让学习者能选择“父边界统一等待”或“子边界独立 fallback”，不扩展成任意层级的生产级
loading orchestration。

来源：[嵌套使用](https://cn.vuejs.org/guide/built-ins/suspense.html#nested-suspense)、
[官方 Markdown：Nested Suspense](https://github.com/vuejs/docs/blob/main/src/guide/built-ins/suspense.md)、
[`parentSuspense` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)。

### 8. Suspense 不是错误边界

Suspense 没有 `#error` 插槽，fallback 只代表“仍在等待”，不代表“加载失败”。异步 setup 或 loader
错误仍进入 Vue 的组件错误处理链；应在 Suspense 的父组件使用 `onErrorCaptured()` /
`errorCaptured`，或在应用层使用 `app.config.errorHandler`。

```vue
<ErrorBoundary>
  <Suspense>
    <AsyncDashboard />
    <template #fallback><DashboardSkeleton /></template>
  </Suspense>
</ErrorBoundary>
```

本课只教授职责分离和错误传播方向；具体错误状态、重试、错误上报与捕获返回值由下一篇“错误处理”
课程负责。

来源：[Suspense 错误处理](https://cn.vuejs.org/guide/built-ins/suspense.html#error-handling)、
[`onErrorCaptured()`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)、
[`handleError()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)。

### 9. 与 RouterView、Transition、KeepAlive 组合时顺序有意义

官方示例的结构是 `RouterView > Transition > KeepAlive > Suspense > component`。课程只解释这个
组合顺序的职责，不在当前 Demo 引入 Router。还要明确 Vue Router 路由配置中的动态 import 是路由
懒加载，不等于 `defineAsyncComponent()`，所以不会仅凭路由懒加载本身触发 Suspense；路由组件后代
真正的 async setup 或异步组件仍可成为边界依赖。

来源：[与其他组件组合](https://cn.vuejs.org/guide/built-ins/suspense.html#combining-with-other-components)。

### 10. Vue 3.5.40 仍明确标记为实验性

官方中文与英文指南都明确说明 Suspense 是实验性功能，不保证最终进入稳定状态，稳定前 API 可能
变化。课程必须把所有细节绑定到 Vue 3.5.40，并建议业务封装边界，而不是把当前事件、组合顺序或
嵌套行为写成永久兼容承诺。

来源：[Vue 中文 Suspense 指南](https://cn.vuejs.org/guide/built-ins/suspense.html)、
[Vue English Suspense Guide](https://vuejs.org/guide/built-ins/suspense.html)。

### 11. SSR 与 hydration 是独立验证边界

Vue 3.5.40 的官方 `ssrRenderSuspense()` 保持同步：存在 default renderer 时直接渲染 default，
否则只输出注释占位；它不会读取或输出 fallback 插槽。因此不能把 plain Vue server renderer 描述成
“服务端先流式发送 fallback，再替换为 default”。

客户端 `Suspense.ts` 的 `hydrateSuspense()` 会先建立 `isHydrating` 边界，并按 `ssContent` 尝试
hydrate，再依据客户端登记的依赖决定 resolve。源码注释同时承认客户端无法仅从当前 DOM 确认服务端
落在哪种分支；这不是自动修复 hydration mismatch 的承诺。

`apiAsyncComponent.ts` 也把“受 Suspense 控制”和“处于 SSR component setup”分成两个条件。Vue
3.5+ 的异步组件 `hydrate` strategy 只适用于 SSR，决定客户端何时 hydrate 已有服务端 DOM；它与
Suspense 的 fallback timeout 不是同一概念。

因此本仓库的 Vite SPA Demo 只能验证客户端挂载行为，不得把结果外推为 SSR、流式 HTML 或 hydration
保证。完整 SSR / hydration 实验保留给 `vue.core.learn.advanced.ssr-hydration`，届时必须使用真实
服务端渲染与客户端水合反馈环。

来源：[`ssrRenderSuspense()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/server-renderer/src/helpers/ssrRenderSuspense.ts)、
[`hydrateSuspense()` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/components/Suspense.ts)、
[`apiAsyncComponent.ts` v3.5.40](https://github.com/vuejs/core/blob/v3.5.40/packages/runtime-core/src/apiAsyncComponent.ts)、
[异步组件：延迟水合](https://cn.vuejs.org/guide/components/async.html#lazy-hydration)。

## 可验证学习目标

完成本课后，学习者应能：

1. 区分 async setup、可挂起异步组件和普通生命周期请求，判断哪一种会进入 Suspense 依赖计数。
2. 用单根 default / fallback 构建边界，并描述首次 pending 到 resolve 的可观察 DOM 变化。
3. 解释 resolved 边界只有在 default 根替换时重新 pending，并用稳定 `key` 明确触发根替换。
4. 区分 `pending`、`fallback`、`resolve` 三个事件，预测不同 timeout 下的事件序列。
5. 解释 Suspense timeout 只控制 fallback 时机，不会取消请求或产生错误。
6. 在“父边界统一等待”和“子边界独立 fallback”之间选择，并正确使用内层 `suspensible`。
7. 把等待状态与错误状态分开，将错误交给组件错误捕获链而非不存在的 `#error` 插槽。
8. 说明 Suspense 的实验性版本边界，并拒绝从客户端 Demo 推导 SSR / hydration 结论。

## 推荐正文编排

1. **问题引入**：多个嵌套组件分别加载时，为什么局部 spinner 会产生碎片化体验。
2. **依赖识别**：async setup、顶层 await、异步组件与普通业务 Promise 的边界。
3. **异步组件 owner**：`defineAsyncComponent()`、默认 `suspensible: true` 与退出父边界控制。
4. **双插槽与单根**：default 隐藏解析、fallback 展示、全部依赖完成后统一 reveal。
5. **第一次挂载**：依赖计数与最慢依赖决定 resolve 时机。
6. **重新进入 pending**：只有根替换；深层新增依赖不会自动回退。
7. **timeout 决策**：立即 fallback、保留旧内容、在超时前完成三种结果。
8. **事件序列**：分别记录 pending / fallback / resolve，不把它们压成一个 loading boolean。
9. **嵌套边界**：独立 fallback 与 `suspensible` 转交父边界的取舍。
10. **错误职责**：没有 error slot；只预告下一篇错误处理课程。
11. **组合顺序**：只解释官方 RouterView / Transition / KeepAlive / Suspense 示例和路由懒加载边界。
12. **实验性与 SSR 边界**：版本标记、客户端演示的证据范围。
13. **Demo、练习与回顾**：只验证公开 DOM、事件与业务状态。

## 易错点候选

课程可采用以下 8 项；每项都能给出错误示范、正确示范与可观察后果，不需要为数量扩写低价值条目。

### 1. 期待 `onMounted()` 请求触发 fallback

**错误：**

```ts
onMounted(async () => {
  data.value = await loadData()
})
```

**正确：** 若请求确实属于渲染前置条件，放入 async setup / 顶层 await；若它属于挂载后的刷新，保留
独立 loading 状态，不交给 Suspense。

**后果：** 边界直接 resolved，fallback 不显示，页面出现空数据或另一套局部 loading。

### 2. 在父 Suspense 中仍期待异步组件的局部 loading 独立显示

**错误：** 同时配置 `loadingComponent`，又把默认可挂起的异步组件放进父边界，并期待两套 loading
按各自时机出现。

**正确：** 选择唯一 owner；由父 Suspense 统一处理，或显式设置 `suspensible: false` 让组件独立处理。

**后果：** 实际加载界面与设计不一致，delay / timeout 的归属难以判断。

### 3. 在任一插槽放多个直接子节点

**错误：**

```vue
<Suspense>
  <Header />
  <AsyncMain />
  <template #fallback><Spinner /><p>加载中</p></template>
</Suspense>
```

**正确：** default 与 fallback 各增加一个语义合适的单根容器。

**后果：** 开发环境警告，边界无法得到预期的完整分支。

### 4. resolved 后期待任意深层依赖重新显示 fallback

**错误：** 只改变深层组件内部状态，却断言外层 Suspense 会 pending。

**正确：** 如果产品确实需要整页重新等待，应明确替换 default 根，例如改变根组件的 `key`；否则
让深层组件维护自己的局部状态。

**后果：** fallback 不出现，测试和真实界面状态相互矛盾。

### 5. 把 Suspense `timeout` 当作网络超时

**错误：** 期待 `:timeout="3000"` 自动取消 fetch 或进入错误页面。

**正确：** 用 AbortController / 请求层策略处理网络取消；Suspense timeout 只决定旧 default 何时让位
给 fallback。

**后果：** 请求继续运行，也不会凭空出现错误状态。

### 6. 用 `pending` 直接代表 fallback 已经可见

**错误：** `@pending="showingFallback = true"`。

**正确：** pending 表示等待中，fallback 事件才表示 fallback 实际展示；resolve 负责结束新分支解析。

**后果：** 正数 timeout 下，业务状态显示“fallback 已出现”，DOM 却仍是旧 default。

### 7. 嵌套边界没有决定谁拥有依赖和事件

**错误：** 随意嵌套多个 Suspense，并假设父边界自动等待所有子边界。

**正确：** 要统一等待时给内层加 `suspensible`；要独立 fallback 时不加，并接受它是独立 patch 周期。

**后果：** 出现多段 loading、短暂空内容或事件计数与预期不一致。

### 8. 把 fallback 或 `#error` 当成错误边界

**错误：** 编写不存在的 `#error` 插槽，或让 fallback 文案同时表示加载失败。

**正确：** 父组件通过 `onErrorCaptured()` / `errorCaptured` 捕获错误，等待态与失败态使用不同状态机。

**后果：** Promise 拒绝后不会进入预想的错误插槽，用户得不到可信反馈。

## 可实施 Demo 交互契约

### 定位

唯一 Demo 是“Suspense 双边界实验台”，通过两个固定边界验证客户端初次等待、根替换、timeout 与
事件。它不复刻现有 Reference 的“双异步组件等待最慢者”展示，也不承担错误处理或 SSR 教学。

### 固定状态

- `immediateRound`：`timeout="0"` 边界的 default 根版本号，初始 `1`。
- `delayedRound`：`timeout="1200"` 边界的 default 根版本号，初始 `1`。
- `immediatePhase` / `delayedPhase`：分别由对应边界事件更新为 `pending`、`fallback` 或
  `resolved`。
- `eventLog`：统一记录公开事件对应的边界、`pending`、`fallback`、`resolve` 与本边界 round，
  不记录内部 `deps`、uid 或 vnode；界面阶段另以 `resolved` 表示解析完成。
- 两个边界各自使用固定约 500ms 完成的 async setup；只用于本地确定性演示，不模拟真实网络。

### 固定交互

1. 初次进入时，两个固定边界都完成各自的初次挂载，随后分别显示“第 1 轮内容”。
2. 点击“立即显示后备内容”，只增加 `immediateRound`。该边界固定 `timeout="0"`，根替换后立即
   显示 fallback，约 500ms 后显示新 round；新增事件顺序为 pending、fallback、resolve。
3. 点击“保留旧内容”，只增加 `delayedRound`。该边界固定 `timeout="1200"`，约 500ms 的
   新分支在 timeout 前完成；pending 期间旧 round 保持可见，随后直接显示新 round；新增事件顺序为
   pending、resolve，不出现 fallback。
4. “清空事件”清空统一日志，不重建任一边界，也不改变两个 round。
5. 每个边界的 phase、当前内容、fallback 和日志分别使用 `role="status"` 或稳定 `data-testid`，但避免多个
   live region 同时播报同一变化。

### 实现约束

- default / fallback 各自单根。
- 使用两个独立 Suspense boundary，分别在创建时固定 `timeout="0"` 与 `timeout="1200"`；不提供
  timeout 切换控件，也不动态修改 timeout prop。
- async setup 组件可以由 `defineComponent()` 创建；每个新增方法上方写规范中文注释。
- 不读取 `vnode.suspense`、内部 deps、Vue uid、注释锚点或私有实例字段。
- 样式只用 flex、margin 和 padding，不使用 `grid`、`gap`、`row-gap` 或 `column-gap`。
- 390px、200% 文本下按钮、状态和日志不重叠；命令按钮至少 44px 高。
- Demo 不依赖动画时长；若增加视觉过渡，reduced motion 下保持相同事件和 DOM 终态。

### 最小 E2E 契约

只需一条长路径测试：

1. 从上一课 Teleport 进入本课，确认课程标题、唯一 Demo 和上一课导航。
2. 等待立即边界和延迟边界都完成初次 resolved，再清空统一日志。
3. 只重载 `timeout="0"` 的立即边界，断言其 fallback 实际可见、另一个边界不变，以及
   pending -> fallback -> resolve 顺序。
4. 只重载 `timeout="1200"` 的延迟边界，断言 pending 时旧内容保留、立即边界不变，解析后直接
   更新，以及 pending -> resolve 且没有新增 fallback。
5. 在 390 × 844、200% 文本和 reduced motion 下复核相同路径；使用可观察状态等待，不使用固定
   `waitForTimeout()`。

## 内容与导航建议

- prerequisite：`vue.core.learn.intermediate.teleport`，保持当前可用课程的线性入口。
- related 建议固定为：
  1. `vue.core.learn.intermediate.dynamic-components-keep-alive`
  2. `vue.core.learn.intermediate.transitions`
  3. `vue.core.reference.application.define-async-component`
  4. `vue.core.reference.built-ins.suspense`
- 不把仍为 planned 的“错误处理”加入可点击 related；正文结尾只用普通文本预告。
- Teleport 从“没有下一篇”改为可导航到本课；本课作为当前 available 末篇，不产生下一篇链接。

## 明确停止边界

本调研只为“异步组件与 Suspense”课程提供实施契约。后续实施到下列条件后立即停止：

- 只新增一篇课程、一个公开 Demo 和一条最小 E2E，并更新必要 manifest、registry 测试、track 测试与
  实施计划状态。
- 不修改现有 `<Suspense>` Reference、Reference Demo、Reference pitfalls、schema、router、registry
  glob、全局样式或任何其他课程正文。
- 不实现下一篇“错误处理”；不实现重试器、错误上报、路由加载、Nuxt、streaming SSR、服务端数据
  预取或 hydration strategy 实验。
- 不把客户端 Vite Demo 的结果描述为 SSR / hydration 证据。
- 不保证实验性 Suspense 在 Vue 3.5.40 之后保持同一 API。

## 验收清单

1. 所有技术事实可回到上文一手来源；正文标记 Vue 3.5.40 与实验性状态。
2. 课程只登记 async setup 与可挂起异步组件，不声称监听任意 Promise。
3. default / fallback 单根，timeout 与网络超时明确分开。
4. 三个事件的语义和两条事件序列均可通过 Demo 观察。
5. nested `suspensible` 的 owner 语义与错误处理边界准确。
6. 恰好一个公开 Demo；不与 Reference Demo 重复。
7. 易错提示采用 8 个真实问题，不凑数。
8. 三条 Vue 路线精确从 `21 available / 39 planned` 更新为 `22 available / 38 planned`。
9. 390px、200% 文本、键盘、reduced motion 与触控尺寸验证通过。
10. 达到本批目标后停止，不进入错误处理或 SSR / hydration 课程。
