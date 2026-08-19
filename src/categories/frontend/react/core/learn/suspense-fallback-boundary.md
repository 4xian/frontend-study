---
id: react.core.learn.advanced.suspense-fallback-boundary
type: lesson
title: Suspense fallback 边界
summary: 用最近边界组织共同与嵌套 reveal，并保护等待期间仍需可见的界面区域。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 80
prerequisites:
  - react.core.learn.advanced.lazy-component-code-splitting
related:
  - react.core.learn.advanced.lazy-component-code-splitting
  - react.core.learn.advanced.error-boundary-render-failures
tags:
  - React
  - Suspense
  - fallback
  - reveal
  - lazy
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能解释为什么挂起子树会激活最近的父级 Suspense 边界。
  - 能判断一个 fallback 会替换哪一整片子树。
  - 能说明同一边界如何协调 children 一起 reveal。
  - 能用嵌套边界让外层内容先显示、内层内容后显示。
  - 能解释已显示内容再次挂起时为什么默认重显 fallback。
  - 能用边界位置保护必须持续可见的内容。
  - 能区分 Suspense fallback 与普通 Effect loading State。
  - 能区分 lazy pending 的等待边界与 rejection 的错误边界。
recap:
  - 后代在 render 时挂起，最近的父级 Suspense 显示 fallback。
  - fallback 替换边界内整棵子树，边界位置也定义共同 reveal 的内容组。
  - 嵌套边界把一个大 reveal 单元拆成可逐步显示的层次。
  - 已显示内容再次挂起时默认会重显当前边界的 fallback。
  - 边界外或更外层已 reveal 的内容不会被内层 fallback 替换。
  - lazy 代码加载可以激活 Suspense，Effect 或事件中的普通请求不会自动激活它。
  - 资源就绪后由 React 重试挂起树，成功提交后才用真实内容替换 fallback。
  - lazy Promise rejection 进入 Error Boundary，不会变成另一种 Suspense fallback。
sources:
  - title: Suspense
    url: https://react.dev/reference/react/Suspense
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 最近父级边界、fallback 替换范围、共同 reveal 与嵌套 reveal
      - 首次挂起重试和普通 Effect 请求不会自动激活 Suspense
  - title: lazy
    url: https://react.dev/reference/react/lazy
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - lazy 组件代码 pending 时由 Suspense 提供等待 UI
      - loader Promise rejection 交给最近的 Error Boundary
  - title: Component - Error Boundary
    url: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 渲染路径错误由 Error Boundary 提供失败 UI

---

# Suspense fallback 边界

## 一、学习目标

- 判断一个 lazy 后代挂起时，哪一个 Suspense 会显示 fallback。
- 根据边界位置说明 pending 时哪片内容被替换。
- 用单一边界把相关内容组织成共同 reveal 的单元。
- 用嵌套边界把较大的等待过程拆成渐进 reveal。
- 解释已显示内容再次挂起时为什么默认会重新出现 fallback。
- 用边界位置让页头、工具栏、摘要等稳定内容在局部等待期间继续可见。
- 识别普通 loading State 为什么不是 Suspense 反馈环。
- 区分 lazy 的 pending、resolved 与 rejected 三条边界路径。

## 二、为什么需要

当组件代码在第一次 render 时尚未准备好，页面需要一个等待界面，但“在哪里显示等待界面”同样重要。
边界太高，一个局部面板可能替换整个主要区域；边界太低，用户又会看到缺少上下文的零碎占位。

Suspense 的职责不是让 Promise 变快，而是把“哪些内容一起等待、哪些内容可以先显示”写进 React 树。
因此边界位置既决定 fallback 的替换范围，也决定资源就绪后的 reveal 粒度。

还要考虑已经显示的内容。一个边界完成 reveal 后，后续更新如果让它再次挂起，React 默认会重新显示
fallback。若页头、工具栏或当前摘要不应该因此消失，就要把它们放在可能挂起的边界之外，或增加更靠近
异步区域的内层边界。等待体验首先是组件树边界问题，不是换一个 spinner 文案就能解决的问题。

## 三、核心概念

### 1. 最近的父级边界接管挂起

当后代在 render 时挂起，React 会切换它上方最近的 Suspense：

```tsx
<PageHeader />
<Suspense fallback={<WorkspaceFallback />}>
  <WorkspaceToolbar />
  <LazyWorkspace />
</Suspense>
<PageFooter />
```

`LazyWorkspace` 的代码还在 pending 时，`WorkspaceToolbar` 和 `LazyWorkspace` 所在的整个边界区域都
由 `WorkspaceFallback` 替换。`PageHeader` 与 `PageFooter` 位于边界外，所以继续可见。触发组件不必
是 Suspense 的直接 child；React 树中的最近祖先边界才是判断依据。

### 2. 同一边界协调一组内容 reveal

单个 Suspense 会把它的 children 当成一个 reveal 单元：

```tsx
<Suspense fallback={<WorkspaceFallback />}>
  <LazySummary />
  <LazyInspector />
</Suspense>
```

只要这一组仍有必要内容没有准备好，边界就保持 fallback；成功重试后，这组 children 一起提交。不要
把 fallback 理解成只盖住那个挂起的叶子，它替换的是当前边界所包围的内容组。

### 3. 嵌套边界改变 reveal 粒度

如果摘要可以先读，而检查器可以稍后出现，就给检查器独立的内层边界：

```tsx
<Suspense fallback={<WorkspaceFallback />}>
  <LazySummary />
  <Suspense fallback={<InspectorFallback />}>
    <LazyInspector />
  </Suspense>
</Suspense>
```

这棵树可以经历三个清楚的状态：

1. 摘要还没就绪：显示外层 `WorkspaceFallback`。
2. 摘要就绪、检查器仍 pending：显示摘要与内层 `InspectorFallback`。
3. 检查器也就绪：真实检查器替换内层 fallback。

边界应该贴合希望用户看到的加载顺序，不需要机械地包住每一个组件。

### 4. 已显示内容再次挂起时默认重显 fallback

Suspense 不只用于首次显示。一个边界已经提交真实内容后，后续更新仍可能引入新的 lazy 组件或其他
挂起源。若这次 render 再次挂起，React 默认会把该边界切回 fallback：

```tsx
<Header />
<CurrentSummary />
<Suspense fallback={<InspectorSkeleton />}>
  {showRevision ? <LazyInspectorRevision /> : <Inspector />}
</Suspense>
```

这里切换到 `LazyInspectorRevision` 后，检查器区域可以重新显示 `InspectorSkeleton`，但 `Header` 与
`CurrentSummary` 位于边界外，继续可见。这是边界位置提供的结构保护：内层等待只替换内层内容。

如果 `Header`、摘要和检查器都放进同一个边界，再次挂起就会让整组内容一起被 fallback 替换。React
提供非紧急更新机制，使某些更新可以继续显示已经 reveal 的旧内容；这属于更新优先级的协作接口。
本课只建立 Suspense 的默认行为和边界判断，不展开这些更新 API 的状态模型。

### 5. reveal 是 React 重试成功后的提交

lazy loader Promise 就绪后，不是 Promise 自己删除 DOM 中的 fallback。React 会重新尝试渲染先前
挂起的树；只有这次 render 成功并提交后，真实 children 才替换 fallback。因此，资源请求完成只能
证明载体准备好了，最终可见内容才证明 reveal 已完成。

本课只观察状态顺序，不把 Promise 完成到 DOM 切换的精确毫秒数当成合同。调度可能合并相近的
reveal，边界结构和最终结果比计时阈值更稳定。

### 6. 边界位置同时决定等待范围和保护范围

放置 Suspense 前可以依次回答四个问题：

1. 哪个后代可能在 render 时挂起？
2. pending 时哪一片真实内容可以被占位 UI 替换？
3. 哪些内容必须继续可见或保持可操作？
4. 真实内容应一起出现，还是允许分阶段出现？

第一个问题找到触发源，第二和第三个问题确定边界位置，第四个问题决定是否嵌套。边界不是按组件文件
数量添加，也不是越多越好。它应与用户能够理解的一段等待过程一致。

## 四、API 合同与生命周期边界

### 1. `children` 与 `fallback`

`<Suspense>` 的核心 Props 是 `children` 和 `fallback`。`children` 是希望最终显示的真实 UI；当它在
render 时挂起，`fallback` 暂时代替这一整组内容。两者都可以是 React node：

```tsx
<Suspense fallback={<ReportSkeleton />}>
  <ReportWorkspace />
</Suspense>
```

fallback 应该轻量、同步且始终能够提交。若 fallback 自己也挂起，当前边界无法显示它，React 会继续
寻找更上层的 Suspense。不要让局部等待 UI 再依赖同一条尚未完成的 lazy 链路。

### 2. 哪些操作会激活 Suspense

本课使用的稳定触发源是 `lazy` 组件代码 pending：

```tsx
const LazyReport = lazy(() => import('./report'))
```

第一次尝试 render `LazyReport` 时，loader Promise 尚未完成，最近的 Suspense 显示 fallback。普通
Effect 或事件处理器里的 Promise 不会被 Suspense 自动检测：

```tsx
useEffect(() => {
  loadReport().then(setReport)
}, [])
```

后一段代码需要组件自己维护 loading State。即使外面包着 Suspense，也不会因为这个 Effect 正在等待而
自动显示 fallback。普通条件渲染可以是合理方案，但不能把它描述成 Suspense 行为。

### 3. 首次挂起不会保留未提交的 State

组件首次 mount 尚未成功就挂起时，React 不保留那次未提交 render 的 State。资源就绪后，React 从头
重试这棵挂起树。因而不要在尚未提交的 lazy 子树中建立“等待期间必须累积”的临时状态，再期待 reveal
后继续使用它。

这条规则只描述首次 mount 前的挂起。已经显示的内容后来再次挂起，应按“默认重显 fallback”的规则
理解，不能把两种场景混成“Suspense 总会重置 State”。

### 4. 再次隐藏时的布局 Effect

如果 React 因再次挂起而隐藏已经显示的内容，会清理该内容树的 layout Effects；内容准备好并再次显示
时，再重新运行这些 layout Effects。这样，测量 DOM 布局的逻辑不会在内容不可见时继续使用失效位置。

这不表示普通 Effect 都会因为 fallback 自动执行同样的重连序列，也不应把 Effect 次数作为本课的主要
边界证据。本课以可见 DOM、最近 fallback 和 reveal 顺序作为稳定观察结果。

### 5. pending、resolved 与 rejected 是三条结果路径

lazy loader 仍在 pending 时，组件挂起并进入 Suspense；Promise resolved 后，React 读取模块的默认
导出并重试；Promise rejected 时，React 把拒绝原因抛给最近的 Error Boundary：

```text
pending  -> 最近的 Suspense fallback
resolved -> React 重试并提交真实 children
rejected -> 最近的 Error Boundary fallback
```

等待 UI 和失败 UI 可以包围同一片业务内容，但职责不同：

```tsx
<ErrorBoundary fallback={<LoadError />}>
  <Suspense fallback={<ReportSkeleton />}>
    <LazyReport />
  </Suspense>
</ErrorBoundary>
```

Suspense 不会把 rejection 自动改写成错误文案；Error Boundary 也不负责 pending 时的占位。

## 五、用法与示例

下面的 Demo 声明三个顶层 lazy 组件：首次 reveal 路径使用摘要和初版检查器，第三个新版检查器用于
演示已显示内容再次挂起。三个 loader 都只解析本地静态模块，并在用户点击对应“就绪”按钮前保持
pending。这样可以稳定观察边界行为，不依赖网络速度、timer 或浏览器缓存。

:::demo{id="react.core.learn.advanced.suspense-fallback-boundary.nested-reveal-demo"}
:::

Demo 还包含一个已经显示内容再次挂起的路径。摘要与检查器都 reveal 后，切换到尚未就绪的新版检查器，
内层 fallback 会再次出现；摘要位于内层边界之外，因此持续可见。这个结果同时说明默认重显和结构保护。

### 1. 观察顺序

1. 初始工作区未挂载，首次路径的两个 loader 调用次数都是 `0`，新版 loader 尚未调用。
2. 点击“开始加载”，外层 fallback 替换整个工作区；边界外控制区仍可操作。
3. 点击“摘要就绪”，摘要显示出来，检查器区域由内层 fallback 接管。
4. 点击“检查器就绪”，真实检查器替换内层 fallback，完成 reveal。
5. 点击“加载新版检查器”，确认旧检查器被内层 fallback 替换，但摘要继续可见。
6. 点击“新版检查器就绪”，确认新版内容只替换内层 fallback。
7. 检查三个 loader 均只调用一次，边界变化没有重复创建已缓存的 lazy 类型。
8. 点击“重新开始”创建新的页面环境，再次得到确定的初始状态。

## 六、易错使用提示

:::pitfalls
### 错误一：以为 fallback 只替换挂起的叶子

**触发条件：** 把工具栏、摘要和 lazy 面板放进同一个边界，却预期只有 lazy 面板消失。

**原因：** Suspense 把边界内 children 作为一个 reveal 单元。

**后果：** pending 时比预期更多的已知内容被 fallback 替换。

**错误示例：**

```tsx
<Suspense fallback={<Spinner />}>
  <Toolbar />
  <LazyPanel />
</Suspense>
```

**正确写法：**

```tsx
<Toolbar />
<Suspense fallback={<PanelSkeleton />}>
  <LazyPanel />
</Suspense>
```

**验证方式：** 让 lazy 面板保持 pending，检查工具栏是否仍在边界外可见。

### 错误二：在每个组件外机械添加边界

**触发条件：** 不考虑视觉加载顺序，为每个叶子都创建独立 fallback。

**原因：** 边界粒度应该表达哪些内容一起出现，而不是组件文件数量。

**后果：** 页面出现碎片化、缺少上下文的占位切换。

**错误示例：**

```tsx
<Suspense fallback={<TinySpinner />}>
  <Avatar />
</Suspense>
<Suspense fallback={<TinySpinner />}>
  <DisplayName />
</Suspense>
```

**正确写法：**

```tsx
<Suspense fallback={<ProfileHeaderSkeleton />}>
  <Avatar />
  <DisplayName />
</Suspense>
```

**验证方式：** 写出期望的 reveal 顺序，再检查每个边界是否正好对应一个可理解的内容组。

### 错误三：用 Effect loading 冒充 Suspense

**触发条件：** 在 Effect 或事件处理器中启动请求，并认为 Suspense 会自动发现 pending Promise。

**原因：** 普通 Effect 请求发生在 commit 后，不会自动激活 Suspense。

**后果：** 边界不会显示 fallback，页面仍需要自己维护 `isLoading` 条件分支。

**错误示例：**

```tsx
useEffect(() => {
  fetch('/report').then(loadReport)
}, [])
```

**正确写法：**

```tsx
const LazyReport = lazy(() => import('./LazyReport'))

<Suspense fallback={<ReportSkeleton />}>
  <LazyReport />
</Suspense>
```

**验证方式：** 确认当前触发源是在 render 阶段挂起的 lazy 组件，而不是手工 loading State。

### 错误四：让 fallback 自己也依赖 lazy 内容

**触发条件：** 当前边界的 fallback 内又渲染尚未就绪的 lazy 组件。

**原因：** 当前边界无法用一个同样挂起的 fallback 完成展示，需要继续向上寻找边界。

**后果：** 实际等待界面的范围上移，与设计的局部边界不一致。

**错误示例：**

```tsx
<Suspense fallback={<LazyLoadingCard />}>
  <LazyPanel />
</Suspense>
```

**正确写法：**

```tsx
<Suspense fallback={<p role="status">正在加载面板...</p>}>
  <LazyPanel />
</Suspense>
```

**验证方式：** fallback 只使用同步、轻量、始终可提交的本地内容。

### 错误五：期待同一边界内的内容各自 reveal

**触发条件：** 两个完成时间不同的 lazy 组件共用一个 Suspense，却预期先完成的组件先显示。

**原因：** 同一边界默认把 children 作为一个共同 reveal 单元。

**后果：** 先准备好的内容仍被外层 fallback 替换，实际出现顺序与界面设计不一致。

**错误示例：**

```tsx
<Suspense fallback={<WorkspaceSkeleton />}>
  <LazySummary />
  <LazyInspector />
</Suspense>
```

**正确写法：**

```tsx
<Suspense fallback={<WorkspaceSkeleton />}>
  <LazySummary />
  <Suspense fallback={<InspectorSkeleton />}>
    <LazyInspector />
  </Suspense>
</Suspense>
```

**验证方式：** 先只让摘要就绪；若需要摘要先显示，就应看到摘要与内层 fallback，而不是继续看到外层
fallback。

### 错误六：认为已经 reveal 的内容一定保持可见

**触发条件：** 一个边界已经显示真实内容，后续更新引入新的挂起源，却假定旧内容不会再被 fallback
替换。

**原因：** 已显示边界再次挂起时，React 默认会重新显示该边界的 fallback。

**后果：** 边界内的标题、摘要或操作区意外消失；若有 layout Effects，它们还会随隐藏和重显执行清理与
重建。

**错误示例：**

```tsx
<Suspense fallback={<PageSkeleton />}>
  <PageHeader />
  <CurrentSummary />
  <LazyInspector reportId={reportId} />
</Suspense>
```

**正确写法：**

```tsx
<PageHeader />
<CurrentSummary />
<Suspense fallback={<InspectorSkeleton />}>
  <LazyInspector reportId={reportId} />
</Suspense>
```

**验证方式：** 在真实内容显示后切换到另一个 pending lazy 组件，确认只有允许替换的内层区域重显
fallback，必须持续可见的内容位于边界外。

### 错误七：用 Suspense fallback 处理加载失败

**触发条件：** lazy loader Promise 被拒绝，只配置 Suspense，却期待 loading fallback 自动变成失败
提示。

**原因：** pending 会挂起并激活 Suspense；rejection 是错误，会被抛给最近的 Error Boundary。

**后果：** loading UI 不能完成失败隔离和恢复；没有合适的 Error Boundary 时，错误继续向上传播。

**错误示例：**

```tsx
<Suspense fallback={<ReportSkeleton />}>
  <LazyReport />
</Suspense>
```

**正确写法：**

```tsx
<ErrorBoundary fallback={<LoadError />}>
  <Suspense fallback={<ReportSkeleton />}>
    <LazyReport />
  </Suspense>
</ErrorBoundary>
```

**验证方式：** 分别让 loader 保持 pending 和进入 rejected，确认前者显示 Suspense fallback，后者显示
Error Boundary 的失败 UI。
:::

## 七、源码推导与适用场景

### 1. 官方事实

1. `children` render 挂起时，最近父级 Suspense 用 fallback 替换其边界内整组内容。
2. 单一边界协调共同 reveal；嵌套边界允许外层先 reveal、内层继续等待。
3. 首次 mount 前挂起的 State 不会被保留，资源就绪后 React 从头重试挂起树。
4. 已显示边界再次挂起时默认重显 fallback；如果因此隐藏内容，layout Effects 会清理并在重显时重建。
5. lazy pending、resolved 与 rejected 分别进入等待、成功重试与错误传播路径。
6. React 19.2 可能把距离上一次 reveal 300ms 窗口内就绪的边界一起显示，精确毫秒数不是稳定验收条件。

### 2. 课程推导

边界设计可以用“持续可见内容、允许替换内容、共同出现内容、分阶段出现内容”四类需求推导：

- 页头、导航、关键工具栏和已经可读的摘要若必须持续可见，应位于可能挂起的局部边界之外。
- 必须作为完整语义单元出现的内容放在同一 Suspense 内，共用一个能够表达整组结构的 fallback。
- 可以先理解的外层内容与可稍后出现的细节适合嵌套边界，内层 fallback 应保留足够上下文。
- 一个区域已经 reveal 后仍可能再次挂起，设计稿应同时画出首次 fallback 和再次 fallback 的范围。
- 等待状态与失败状态分开设计；pending 不应显示错误语气，rejected 不应无限停留在 loading 文案。

### 3. 适用场景

适合使用 Suspense 边界的场景包括按需加载的报告面板、低频设置区、分阶段出现的详情与检查器，以及由
支持 Suspense 的框架提供的异步 UI。共同点是：render 阶段存在 React 能识别的挂起源，并且可以明确
画出等待期间的替换区域。

如果异步操作只发生在 Effect 或事件处理器中，普通 loading State 更直接；如果所有内容必须同时理解，
不要为了视觉变化强行拆成多个嵌套边界；如果某个组件极小且总与首屏同时使用，也没有必要只为它创建
独立的 lazy 与 Suspense 结构。

### 4. 使用边界

本课不实现数据 Promise 缓存、远程请求层、服务端流式渲染或资源调度框架，也不展开非紧急更新 API 的
状态模型。它们可以成为 Suspense 的挂起源或保护机制，但不会改变本课建立的判断顺序：先识别挂起源，
再确定最近边界、替换范围、reveal 分组和再次挂起范围。

## 八、练习

:::exercise
### 练习目标

**要求：** 在 Demo 的检查器内部再加入一个“审查备注”lazy 区域，并为它增加第三层 Suspense。先写出
四个预期阶段，再实现对应边界；控制按钮仍放在所有边界之外，不使用 timer 或远程请求。

**验收：** 摘要就绪后不再被内层 pending 隐藏；检查器就绪后，只有审查备注区域显示自己的
fallback；最后一层就绪后全部真实内容可见。解释为什么第三层边界改变的是 reveal 粒度，而不是资源
本身的加载速度。
:::

:::exercise
### 练习二：重新放置工具栏边界

**要求：** 把一个可操作工具栏分别放在外层 Suspense 内部和外部，保持 lazy 面板 pending，记录两种
结构下工具栏是否可见、是否可操作。为 fallback 写出能表达整个替换区域的骨架。

**验收：** 能说明最近边界为什么替换整组 children，并选择一种让关键操作在局部等待期间继续可用的
结构。
:::

:::exercise
### 练习三：合并共同 reveal

**要求：** 将两个原本位于独立 Suspense 的强相关摘要合并到一个边界。先只放行其中一个 loader，再
放行另一个，观察第一次放行后真实内容是否出现。

**验收：** 第一个模块单独就绪时仍显示共同 fallback；两个模块都就绪后一起 reveal，且能解释这不是
两个请求必须同时完成。
:::

:::exercise
### 练习四：验证再次挂起的替换范围

**要求：** 在真实检查器已经显示后切换到另一个模块顶层声明的 lazy 检查器，让新 loader 保持 pending。
分别把摘要放在内层边界外和内层边界内，比较 fallback 重显范围。

**验收：** 能观察到已显示内容再次挂起时默认重显 fallback；摘要位于内层边界外时保持可见，位于边界
内时随整组内容一起被替换。
:::

:::exercise
### 练习五：分开等待与失败 UI

**要求：** 为同一个 lazy 区域画出 pending、resolved、rejected 三种状态树，并分别标注 Suspense、真实
children 与 Error Boundary fallback 的责任。只需使用本地可控 Promise，不依赖远程网络。

**验收：** pending 时显示等待 UI，resolved 后提交真实内容，rejected 时进入错误 UI；不能让 Suspense
fallback 同时承担失败语义。
:::

## 九、本节小结

- render 时挂起的后代会激活最近的父级 Suspense。
- fallback 替换边界内的整组 children，边界外内容继续可见。
- 同一边界协调一组内容共同 reveal，嵌套边界可以形成渐进 reveal。
- 已显示边界再次挂起时默认会重显 fallback；结构保护依赖边界位置。
- 边界外或更外层已经显示的内容不会被内层 fallback 替换。
- 资源就绪后 React 重试并提交真实内容，不能用请求完成代替 DOM 证据。
- 普通 Effect 或事件请求不会自动激活 Suspense；本课只复用 lazy 代码加载。
- lazy pending 交给 Suspense，rejection 交给 Error Boundary。

## 十、参考资料

- [Suspense](https://react.dev/reference/react/Suspense) - 最近边界、fallback、共同与嵌套 reveal。
- [lazy](https://react.dev/reference/react/lazy) - 代码加载挂起与 Suspense 等待外壳。
- [Component - Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) -
  lazy rejection 的失败 UI 边界。
