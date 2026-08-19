# Suspense fallback 边界调研

## 一、研究范围与版本

- 核验日期：`2026-08-17`。
- React 文档系列：`19.2`。React 官方版本页将 `19.2` 标为最新文档系列。[S9]
- 仓库锁定运行时：`react@19.2.8`、`react-dom@19.2.8`；React 官方仓库的
  `v19.2.8` tag 中，`packages/react/package.json` 也声明版本为 `19.2.8`。[S6]
- 仓库锁定类型：`@types/react@19.2.18`、`@types/react-dom@19.2.4`。本稿只用
  `@types/react@19.2.18` 核对 `Suspense` 与 `lazy` 的公开 TS 签名。[S7]
- 研究主线：最近父级边界、同一边界共同 reveal、嵌套边界、已显示内容的保护边界，以及
  `lazy` pending / rejection 与 Error Boundary 的必要接口。
- 不展开：`use` 读取异步资源、非紧急更新 API 的具体写法、数据框架、服务端流式渲染、
  Selective Hydration、RSC、样式和媒体资源等待。

已知官方 URL 足以覆盖本课公共合同，因此本次直接读取官方页面、固定文档提交、固定运行时 tag
与精确版本类型声明，没有用搜索摘要或社区文章支撑结论。

## 二、本地资产盘点

以下本地文件只用于确认现有教学衔接，不作为 React 公共语义的证据：

- `src/categories/frontend/react/core/learn/suspense-fallback-boundary.md` 已用 `lazy` 作为挂起源，
  讲解最近边界、共同 reveal、嵌套 reveal、Effect 请求不自动触发 Suspense。
- `src/categories/frontend/react/core/demos/suspense-fallback-boundary/suspense-fallback-boundary-demo.tsx`
  在模块顶层声明三个 lazy 组件；首次外层/内层 reveal 使用前两个，再次挂起路径使用第三个新版检查器。
- 同目录的 `suspense-gates.tsx` 用三个可控 Promise 放行本地动态导入；
  `suspense-summary.tsx`、`suspense-inspector.tsx` 与 `suspense-inspector-revision.tsx` 提供摘要、
  初版检查器和再次挂起后的新版检查器；CSS 只负责展示。
- `src/categories/frontend/react/core/demo-manifest.ts` 登记 Demo 及六个同源文件；
  `entry-manifest.ts` 登记正文 slug 与 loader；`react-core-track.ts` 包含同一稳定课程 ID。
- 现有正文只把已显示内容再次挂起的处理指向后续课程。React 19.2 的默认重显行为、边界位置能
  保护哪些已显示内容，以及 lazy rejection 必须交给 Error Boundary 的接口，需要由本稿补足事实依据。

## 三、官方来源卡

| 编号 | 一手来源 | 固定方式 | 支撑内容 |
| --- | --- | --- | --- |
| S1 | [React `<Suspense>` Reference](https://react.dev/reference/react/Suspense) | React 文档 `19.2` | `children`/`fallback`、最近父级边界、共同与嵌套 reveal、首次挂起重试、再次挂起、Effect 不触发、300ms reveal 合并。 |
| S2 | [固定 `<Suspense>` 文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md) | `reactjs/react.dev@c7d6b700...` | 固定 S1 使用的公开规则文本。 |
| S3 | [React `lazy` Reference](https://react.dev/reference/react/lazy) | React 文档 `19.2` | loader pending 时挂起；resolve 后渲染 `default`；reject 时把原因抛给最近 Error Boundary。 |
| S4 | [固定 `lazy` 文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/lazy.md) | `reactjs/react.dev@c7d6b700...` | 固定 S3 使用的 pending、resolve、reject 公共合同。 |
| S5 | [ReactLazy.js](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js) | `facebook/react@v19.2.8` | lazy payload 的 pending、resolved、rejected 分支及非 resolved 分支抛出 payload；仅作源码核对。 |
| S6 | [React package.json](https://github.com/facebook/react/blob/v19.2.8/packages/react/package.json) | `facebook/react@v19.2.8` | 仓库运行时 patch 对应的官方版本身份。 |
| S7 | [`@types/react@19.2.18` 类型声明](https://unpkg.com/@types/react@19.2.18/index.d.ts) | npm 精确版本 | `SuspenseProps`、`Suspense`、`LazyExoticComponent` 与 `lazy(load)` 的 TS 签名。 |
| S8 | [React `Component` Reference：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | React 文档 `19.2` | 子树渲染错误由 Error Boundary 捕获并显示错误 UI。 |
| S9 | [React Versions](https://react.dev/versions) | 核验日在线页面 | React 官方当前文档系列为 `19.2`。 |

## 四、公共合同结论

### 1. `children` 挂起时切换到 `fallback`

`<Suspense fallback={fallback}>children</Suspense>` 包围真实 UI。`children` 在 render 时挂起，
该边界改为渲染 `fallback`；内容准备好并能成功 render 后，React 再切回 `children`。`fallback`
可以是任意 React node，但官方建议实际使用轻量占位 UI。[S1][S2]

精确版本类型声明与文档一致：`SuspenseProps.children` 和 `fallback` 都是 `ReactNode`，`Suspense`
是接收该 props 的 `ExoticComponent`。[S7]

### 2. 最近父级 Suspense 决定替换范围

挂起组件不必是 Suspense 的直接 child。React 查找组件树中最近的父级 Suspense；中间经过普通组件
不会改变捕获关系。激活后被 fallback 替换的是该边界包围的整棵 UI，不是只有挂起叶子。[S1][S2]

因此，边界外的页头、导航、工具栏等不会因这个局部边界激活而被它替换。边界位置是保护已显示 UI
最直接的结构工具：需要持续可见、持续可操作的内容应位于可能挂起的边界之外。[S1][S2]

如果当前 `fallback` 自己也挂起，当前边界不能显示它，React 会继续激活最近的上层 Suspense。
fallback 应优先使用同步、轻量且不依赖同一异步链的内容。[S1][S2]

### 3. 同一边界协调共同 reveal

React 默认把一个 Suspense 内的整棵树当成一个单元。即使只有一个后代挂起，边界内的全部内容也会
一起被 fallback 替换；所需代码和数据全部准备好后，整组内容一起显示。[S1][S2]

共同 reveal 是 UI 分组合同，不是请求并行合同。它不保证内部资源同一时刻完成，只保证边界不会在
该组仍有内容挂起时提交不完整的真实 UI。[S1][S2]

React 19.2 还规定：从上次 reveal 起最多每 300ms reveal 一次，窗口内就绪的边界会一起显示。
因此可靠验证应观察边界结构、状态顺序和最终 DOM，不应把某个 Promise resolve 后的精确毫秒数
当成固定时序。[S1][S2]

### 4. 嵌套边界改变 reveal 粒度

当外层一部分内容可以先显示、另一部分可以稍后显示时，可给后者增加内层 Suspense。后代挂起时，
最近边界优先接管；外层要求满足后，外层内容与内层 fallback 可以一起显示，内层真实内容准备好后
再替换自己的 fallback。[S1][S2]

```tsx
<Suspense fallback={<WorkspaceSkeleton />}>
  <LazySummary />
  <Suspense fallback={<InspectorSkeleton />}>
    <LazyInspector />
  </Suspense>
</Suspense>
```

上述结构可观察为：外层 fallback -> 摘要加内层 fallback -> 摘要加真实检查器。官方同时提醒，
边界粒度不应细于希望用户经历的加载顺序；是否嵌套应由视觉与理解顺序决定，而不是由组件文件数量
决定。[S1][S2]

### 5. 已显示内容默认可能被 fallback 再次替换

Suspense 已经显示真实内容后，如果该边界再次挂起，React 默认会再次显示 fallback。造成挂起的更新
若由 `startTransition` 或 `useDeferredValue` 标记则存在例外；本稿只记录这个接口边界，不展开这些
API 的用法。[S1][S2]

如果 React 因再次挂起而隐藏已显示内容，会清理该内容树的 layout Effects；内容再次显示时重新触发
layout Effects，避免隐藏期间继续测量不可见布局。[S1][S2]

“保护已显示内容”需要区分两层含义：

1. **结构保护**：把不应消失的 UI 移出可能激活的 Suspense，或用内层边界只替换局部区域。
   这是本稿可以完整说明的做法。[S1][S2]
2. **更新语义保护**：让已经显示的旧内容在某类更新期间继续可见，属于上述非紧急更新 API 的职责。
   本稿只说明默认行为与接口，不给出其实现细节。[S1][S2]

### 6. 首次 mount 前挂起不会保留那次 render State

组件首次 mount 尚未成功就挂起时，React 不保留那次 render 的 State。内容就绪后，React 从头重试
挂起树。因而不能依赖“尚未提交的 lazy 子树中的本地 State”跨过首次 fallback 阶段。[S1][S2]

这条规则不等于“切换到 fallback 总会丢失所有已显示 State”。已显示内容再次挂起是另一种情形，
应按上一节的默认重显规则理解。[S1][S2]

### 7. `lazy` pending 与 rejection 进入不同边界

`lazy(load)` 在组件外声明。首次尝试渲染返回的组件时才调用 `load`；loader Promise pending 时，
lazy 组件挂起，由最近 Suspense 提供等待 UI。Promise resolve 后，React 读取返回模块的 `default`
组件并重试渲染。[S3][S4]

精确版本类型为：

```ts
function lazy<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
): LazyExoticComponent<T>
```

这证明仓库 TS 入口要求 loader 返回带 `default` 组件的 Promise；类型声明本身不定义运行时 reveal
时机，时机仍以 React Reference 为准。[S7]

loader Promise **reject** 时不是“继续 pending”。React 会抛出 rejection reason，交给最近的
Error Boundary；Suspense fallback 只表达尚未就绪，不能代替错误 UI。[S3][S4][S8]

```tsx
<ErrorBoundary fallback={<LoadError />}>
  <Suspense fallback={<ReportSkeleton />}>
    <LazyReport />
  </Suspense>
</ErrorBoundary>
```

Suspense 与 Error Boundary 可以按产品需要分别分层：前者控制等待替换范围，后者控制失败替换范围。
上述结论只要求二者接口正确相接，不展开 Error Boundary 自身实现。[S3][S4][S8]

### 8. Effect 与事件 Promise 不会自动激活 Suspense

Suspense 不检测 Effect 或事件处理器中开始的异步操作。组件在 Effect 中请求数据时，即使外面包了
Suspense，也仍需自己的 loading State；这个 Promise 不会自动让 Suspense 显示 fallback。[S1][S2]

本稿唯一采用的稳定触发载体是 `lazy` 组件代码 pending。其他资源读取接口和框架集成不在此处展开。

## 五、固定源码与类型推导

### 推导一：lazy 的 pending 与 rejection 不是同一种状态

1. **官方事实：** React `v19.2.8` 的 `ReactLazy.js` 在首次初始化后把未完成 thenable 记录为
   pending；resolve 时记录模块对象，reject 时记录错误。初始化器只在 resolved 分支返回
   `moduleObject.default`，其余分支抛出所记录的 payload。[S5]
2. **课程推导：** pending payload 能使渲染挂起并由 Suspense 提供等待 UI；rejected payload 是错误，
   应由 Error Boundary 提供失败 UI。这个区分与公开 `lazy` Reference 完全一致。[S3][S4][S5]
3. **边界：** `_status`、`_payload`、`_result` 与数值状态是内部实现，不是可依赖的公共 API；课程只
   教 pending / resolve / reject 的公开行为，不暴露或读取这些字段。[S5]

### 推导二：类型只能证明输入形状，不能证明边界时序

1. **官方事实：** `@types/react@19.2.18` 把 `fallback` 声明为 `ReactNode`，把 `lazy` loader 声明为
   `() => Promise<{ default: T }>`。[S7]
2. **课程推导：** TS 示例应返回默认导出的组件，并可给 fallback 传入普通 JSX；这能在编译期得到
   直接反馈。[S7]
3. **边界：** 类型没有表达最近边界、共同 reveal、嵌套顺序、再次挂起或 300ms 合并；这些行为必须
   由 React Reference 与真实 DOM 观察确认。[S1][S2][S7]

## 六、高质量易错点

### 1. 误以为 fallback 只替换挂起叶子

**错误名称：** 把 Suspense 当作叶子遮罩。

**触发条件：** 工具栏与 lazy 面板位于同一边界内，却预期 pending 时工具栏继续显示。

**原因：** Suspense 把边界内整棵树视为 reveal 单元，不只替换触发挂起的组件。

**后果：** 一个局部模块 pending 时，边界内已经可用的操作区也被大范围 fallback 替换。

**错误示例：**

```tsx
<Suspense fallback={<PanelSkeleton />}>
  <Toolbar />
  <LazyPanel />
</Suspense>
```

**正确示例：**

```tsx
<Toolbar />
<Suspense fallback={<PanelSkeleton />}>
  <LazyPanel />
</Suspense>
```

**适用版本：** React 19.2。

**来源：** [S1](https://react.dev/reference/react/Suspense)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#revealing-content-together-at-once)。

### 2. 期待同一边界内的内容分批出现

**错误名称：** 把共同 reveal 误解成各自 reveal。

**触发条件：** 两个完成时间不同的 lazy 组件共用一个 Suspense，却期待先完成者先显示。

**原因：** 单一 Suspense 默认协调边界内整组内容一起显示。

**后果：** 先准备好的内容仍被外层 fallback 隐藏，实际加载顺序与界面设计不符。

**错误示例：**

```tsx
<Suspense fallback={<WorkspaceSkeleton />}>
  <LazySummary />
  <LazyInspector />
</Suspense>
```

**正确示例：**

```tsx
<Suspense fallback={<WorkspaceSkeleton />}>
  <LazySummary />
  <Suspense fallback={<InspectorSkeleton />}>
    <LazyInspector />
  </Suspense>
</Suspense>
```

**适用版本：** React 19.2。

**来源：** [S1](https://react.dev/reference/react/Suspense#revealing-content-together-at-once)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#revealing-nested-content-as-it-loads)。

### 3. 为每个组件机械增加边界

**错误名称：** 用组件数量决定 Suspense 粒度。

**触发条件：** 不先定义希望用户看到的加载顺序，就给每个叶子各包一个 fallback。

**原因：** Suspense 边界表达的是一起显示或逐步显示的视觉单元，而不是文件或组件计数。

**后果：** 页面出现碎片化的 spinner 和缺少上下文的局部跳变。

**错误示例：**

```tsx
<Suspense fallback={<TinySpinner />}><LazyAvatar /></Suspense>
<Suspense fallback={<TinySpinner />}><LazyName /></Suspense>
```

**正确示例：**

```tsx
<Suspense fallback={<ProfileHeaderSkeleton />}>
  <LazyAvatar />
  <LazyName />
</Suspense>
```

**适用版本：** React 19.2。

**来源：** [S1](https://react.dev/reference/react/Suspense#revealing-nested-content-as-it-loads)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#revealing-nested-content-as-it-loads)。

### 4. 让当前 fallback 自己也挂起

**错误名称：** 异步 fallback 上移等待范围。

**触发条件：** 当前 Suspense 的 fallback 内渲染一个尚未加载的 lazy 组件。

**原因：** 当前边界无法显示一个也在挂起的 fallback，只能继续激活最近的父级 Suspense。

**后果：** 预期的局部占位不出现，更大的上层区域被替换；若没有合适的父级边界，界面没有预期的
局部等待反馈。

**错误示例：**

```tsx
<Suspense fallback={<LazyLoadingCard />}>
  <LazyPanel />
</Suspense>
```

**正确示例：**

```tsx
<Suspense fallback={<p role="status">正在加载面板...</p>}>
  <LazyPanel />
</Suspense>
```

**适用版本：** React 19.2。

**来源：** [S1](https://react.dev/reference/react/Suspense#props)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#props)。

### 5. 把边界内已显示内容当成默认受保护

**错误名称：** 忽略再次挂起时的 fallback 重显。

**触发条件：** 一个已经显示真实内容的 Suspense 后来再次挂起，并假定现有内容一定继续可见。

**原因：** React 默认会重新显示该边界的 fallback；非紧急更新 API 造成的例外不等于所有更新都受
保护。

**后果：** 页面标题、当前结果或操作区意外消失，layout Effects 还会在隐藏时清理、重显时重建。

**错误示例：**

```tsx
<Suspense fallback={<PageSkeleton />}>
  <PageHeader />
  <CurrentResult />
  <LazyInspector reportId={reportId} />
</Suspense>
```

**正确示例：**

```tsx
<PageHeader />
<CurrentResult />
<Suspense fallback={<InspectorSkeleton />}>
  <LazyInspector reportId={reportId} />
</Suspense>
```

**适用版本：** React 19.2；示例只采用边界位置提供结构保护，不展开非紧急更新 API。

**来源：** [S1](https://react.dev/reference/react/Suspense#caveats)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#caveats)。

### 6. 认为 Effect 中的 Promise 会触发 Suspense

**错误名称：** 用普通 Effect loading 冒充 Suspense 挂起。

**触发条件：** 在 Effect 或事件处理器中启动异步操作，只在组件外包 Suspense，不写自己的 loading
分支。

**原因：** Suspense 不检测 Effect 或事件处理器中的异步操作。

**后果：** fallback 从不出现；真实内容只能依靠组件自己的 State 更新。

**错误示例：**

```tsx
function EffectReport() {
  const [report, setReport] = useState<string | null>(null)

  useEffect(() => {
    loadReport().then(setReport)
  }, [])

  return report === null ? null : <p>{report}</p>
}

<Suspense fallback={<ReportSkeleton />}>
  <EffectReport />
</Suspense>
```

**正确示例：**

```tsx
const LazyReport = lazy(() => import('./Report'))

<Suspense fallback={<ReportSkeleton />}>
  <LazyReport />
</Suspense>
```

**适用版本：** React 19.2；正确示例只证明 lazy 代码 pending 的稳定接口。

**来源：** [S1](https://react.dev/reference/react/Suspense#what-activates-a-suspense-boundary)、
[S2](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md#what-activates-a-suspense-boundary)。

### 7. 用 Suspense fallback 处理 lazy rejection

**错误名称：** 混淆等待 UI 与失败 UI。

**触发条件：** lazy loader Promise reject，只配置 Suspense，却期待 loading fallback 变成错误提示。

**原因：** pending 时 lazy 组件挂起；reject 时 React 抛出 rejection reason，由最近 Error Boundary
处理。

**后果：** loading fallback 不能承担失败恢复；没有合适 Error Boundary 时，错误会继续向上传播。

**错误示例：**

```tsx
<Suspense fallback={<ReportSkeleton />}>
  <LazyReport />
</Suspense>
```

**正确示例：**

```tsx
<ErrorBoundary fallback={<LoadError />}>
  <Suspense fallback={<ReportSkeleton />}>
    <LazyReport />
  </Suspense>
</ErrorBoundary>
```

**适用版本：** React 19.2；`@types/react@19.2.18` 的 lazy 注释也明确记录 rejection 接口。

**来源：** [S3](https://react.dev/reference/react/lazy#parameters)、
[S4](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/lazy.md#parameters)、
[S8](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)。

## 七、可直接采用的判断规则

1. 先决定 pending 时哪些 UI 必须继续可见，再把 Suspense 放在它们下面。
2. 同一边界表示一起 reveal；需要分阶段显示时才增加内层边界。
3. fallback 必须能同步提交；它若挂起，会把等待范围推向父级边界。
4. 已显示内容位于被激活边界内时，默认可能再次被 fallback 替换；结构保护依赖边界位置。
5. lazy pending 交给 Suspense，lazy rejection 交给 Error Boundary，二者不能互相替代。
6. Effect 或事件 Promise 不会自动触发 Suspense。
7. 首次 mount 前挂起的 render 会从头重试，不依赖那次未提交的本地 State。

## 八、来源

- [React `<Suspense>` Reference](https://react.dev/reference/react/Suspense)
- [固定 `<Suspense>` 文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Suspense.md)
- [React `lazy` Reference](https://react.dev/reference/react/lazy)
- [固定 `lazy` 文档源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/lazy.md)
- [React `v19.2.8` `ReactLazy.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactLazy.js)
- [React `v19.2.8` package.json](https://github.com/facebook/react/blob/v19.2.8/packages/react/package.json)
- [`@types/react@19.2.18` 类型声明](https://unpkg.com/@types/react@19.2.18/index.d.ts)
- [React `Component` Reference：Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Versions](https://react.dev/versions)
