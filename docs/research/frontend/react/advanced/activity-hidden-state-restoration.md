# Activity 隐藏与状态恢复研究记录

## 研究结论

- `<Activity>` 是 React 19.2 发布的稳定组件，从 `react` 直接导入。React 19.2 只公开
  `"visible"` 与 `"hidden"` 两种模式；省略 `mode` 时默认为 `"visible"`（S1-S5、S8）。
- `hidden` 会用 `display: none` 隐藏后代宿主 DOM、清理后代 Effects，并让隐藏内容的更新低于
  可见内容处理。后代仍能因新 props 或 State 更新而重新 render（S1-S4）。
- `hidden` 不是组件真实卸载。React 保留同一树身份下的组件 State 和宿主 DOM；恢复为 `visible`
  时显示先前 UI 并重新建立 Effects（S1、S2、S9）。
- Activity 也不等于手工切换 CSS。手工 `display: none` 只能改变视觉显示，不会提供 Effect
  cleanup、Effect 恢复和隐藏更新优先级合同（S1-S4）。
- 首次就以 `hidden` render 时，后代会在较低优先级预渲染，但不会建立 Effects。若内容只返回文本，
  hidden 状态可能不产生 DOM 输出，因为没有宿主元素可应用隐藏样式（S1、S2）。
- Activity 不替代 Suspense 或 Error Boundary。预渲染只能提前读取会激活 Suspense 的数据源；
  Effect 内发起的数据读取不会被 Activity 发现。render 错误仍按通用规则交给最近的 Error Boundary
  （S1、S2、S7、S10）。

适用版本固定为 React / React DOM `19.2.8`，公开文档语义固定到 React 19.2 文档快照。不要把这些
结论向 React 19.0、19.1 或未来新增模式直接外推。

## 调研方法与证据边界

1. 外部检索先使用 Tavily，限定 `react.dev`、React 官方 GitHub、npm 与 W3C，候选 URL 再回到
   官方页面、固定源码、官方测试或精确发布包核验。
2. React 公共合同以 Activity Reference 和 React 19.2 发布说明为准；源码与测试只用于固定
   `19.2.8` 的实现身份和旁证，不能把测试中的调度细节升级为长期 API 承诺。
3. `reactjs/react.dev` 固定到提交
   `383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a`；Activity 文档与 React 19.2 发布说明的 Git
   blob 分别为 `b521970b764d1b085a9d9c10c920c1d9f77a1413` 与
   `feee6cdb626042556d50bdc184183dff71a857b2`。
4. React / React DOM `19.2.8` 的 npm `gitHead` 均为
   `1dd4ecbdabf826f527fc9a58c05ea70375b7d170`，与固定源码和测试一致（S5-S7、S12）。
5. 可访问性结论只从 React 明确的 `display: none` 行为和 W3C 对程序化隐藏内容的定义推导；
   不声称 Activity 另有独立的焦点恢复合同（S1、S2、S11）。

## 一手来源卡

| 编号 | 一手来源                                                                                                                                                                                               | 固定版本                            | 支撑结论                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| S1   | [React `<Activity>` Reference](https://react.dev/reference/react/Activity)                                                                                                                             | React 文档 19.2                     | 导入、props、两种模式、默认值、DOM/State/Effect、hidden 更新、首次 hidden、纯文本、媒体与 Suspense 数据源边界。 |
| S2   | [固定 Activity 文档源码](https://api.github.com/repos/reactjs/react.dev/contents/src/content/reference/react/Activity.md?ref=383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a)                                 | `reactjs/react.dev@383a1e9239c8...` | 固定 S1 的公开文字，避免浮动官网无记录变化。                                                                    |
| S3   | [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2#activity)                                                                                                                           | React 19.2                          | 稳定发布、`visible`/`hidden`、hidden 更新推迟、典型用途与未来模式边界。                                         |
| S4   | [固定 React 19.2 发布说明源码](https://api.github.com/repos/reactjs/react.dev/contents/src/content/blog/2025/10/01/react-19-2.md?ref=383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a)                         | `reactjs/react.dev@383a1e9239c8...` | 固定引入版本和发布语义。                                                                                        |
| S5   | [React `ReactClient.js`](https://api.github.com/repos/facebook/react/contents/packages/react/src/ReactClient.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170)                                          | React 19.2.8                        | `Activity` 从 React 客户端入口稳定导出。                                                                        |
| S6   | [React Activity 官方测试](https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/Activity-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170)                  | React 19.2.8                        | 首次 hidden 不建立 layout Effect、显隐时清理/重建、hidden 插入和更新仍隐藏的 patch 旁证。                       |
| S7   | [React Activity/Suspense 官方测试](https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/ActivitySuspense-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170) | React 19.2.8                        | hidden 预渲染可挂起并继续准备的 patch 旁证；不据此承诺内部调度顺序。                                            |
| S8   | [`@types/react@19.2.18` `index.d.ts`](https://unpkg.com/@types/react@19.2.18/index.d.ts)                                                                                                               | `@types/react` 19.2.18              | `ActivityProps`、`mode`、`children`、`name` 与 `Activity` 的精确 TypeScript 形状。                              |
| S9   | [React State 保留与重置](https://react.dev/learn/preserving-and-resetting-state)                                                                                                                       | React 文档 19.2                     | State 与树位置、组件类型和 key 绑定。                                                                           |
| S10  | [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)                                                                                   | React 文档 19.2                     | render 错误由最近的 Error Boundary 提供 fallback；Activity 不是错误边界。                                       |
| S11  | [W3C WAI 对程序化隐藏内容的定义](https://www.w3.org/WAI/standards-guidelines/act/rules/8fc3b6/#programmatically-hidden)                                                                                | W3C ACT Rule                        | `display: none` 的元素及后代不进入可访问性树。                                                                  |
| S12  | [React 19.2.8 npm 元数据](https://registry.npmjs.org/react/19.2.8)、[React DOM 19.2.8 npm 元数据](https://registry.npmjs.org/react-dom/19.2.8)                                                         | npm 19.2.8                          | 运行时 patch 与固定 `gitHead` 对齐。                                                                            |

## 本地版本核对

核验日期：`2026-08-17`。

| 包                 | `package.json` | `package-lock.json` | `node_modules` |
| ------------------ | -------------- | ------------------- | -------------- |
| `react`            | `19.2.8`       | `19.2.8`            | `19.2.8`       |
| `react-dom`        | `19.2.8`       | `19.2.8`            | `19.2.8`       |
| `@types/react`     | `19.2.18`      | `19.2.18`           | `19.2.18`      |
| `@types/react-dom` | `19.2.4`       | `19.2.4`            | `19.2.4`       |

本地 `React.version` 为 `19.2.8`，`React.Activity` 存在并显示为 `Symbol(react.activity)`。这只固定
本地运行时身份；公开用法仍以 S1-S4 和 S8 为准。

## 公共 API 与类型

### 导入与最小语法

稳定 API 使用命名导入：

```tsx
import { Activity } from 'react'

/** 根据外部可见状态保留或隐藏侧栏工作区。 */
export function SidebarArea({ isOpen }: { isOpen: boolean }) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <Sidebar />
    </Activity>
  )
}
```

早期实验文章中的 `unstable_Activity` 不适用于 React 19.2 稳定 API。Activity 是 React 边界，
不要把它当作会额外生成 `<activity>` 宿主标签的普通包装组件（S1-S5）。

### Props 与精确类型

`@types/react@19.2.18` 的相关声明为：

```ts
interface ActivityProps {
  mode?: 'hidden' | 'visible' | undefined
  name?: string | undefined
  children: ReactNode
}

const Activity: ExoticComponent<ActivityProps>
```

- `children`：需要显隐和恢复的 UI，类型为 `ReactNode`。
- `mode`：可选，只接受 `"visible"` 或 `"hidden"`；省略时为 `"visible"`。
- `name`：精确类型包中存在的可选 DevTools/instrumentation 名称。当前 Activity Reference 的 Props
  表只列 `children` 与 `mode`，因此不把 `name` 当作显隐语义的一部分。

当前类型声明在 `Activity` 上标注 `@version 19.2.0`，与发布说明的稳定引入版本一致（S3、S4、S8）。

## `visible` 与 `hidden` 行为

### `visible`

`mode="visible"` 时，后代正常显示、建立 Effects，并按普通可见内容处理更新。省略 `mode` 也会进入
这一模式（S1-S4）。

### `hidden`

`mode="hidden"` 同时改变三类行为：

1. **DOM 可见性**：React 对后代宿主 DOM 应用 `display: none`，但不销毁这些 DOM 节点。
2. **Effect 生命周期**：React 运行后代 Effects 已注册的 cleanup；正确提供 cleanup 的订阅或同步逻辑
   不会在隐藏期间继续运行。
3. **更新优先级**：后代仍会因 props 或 State 变化重新 render，但 React 优先处理可见内容。

因此以下写法不等价：

```tsx
// 条件为 false 时真正移除子树。
{
  isOpen && <Workspace />
}

// 始终保留同一边界，只改变其可见模式。
;<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Workspace />
</Activity>
```

同样，下面的 CSS 写法不会清理或重建 Effects，也不会改变 React 的更新优先级：

```tsx
<section style={{ display: isOpen ? 'block' : 'none' }}>
  <Workspace />
</section>
```

### State 与 DOM 的保留条件

Activity 的恢复能力仍服从 React 的树身份规则：同一父级位置、同一组件类型和同一 key 才是同一
子树。切换 `mode` 可以保留 State；条件移除整个 Activity、改变 key、换组件类型或换树位置仍会按
普通规则重置 State 和 DOM（S1、S2、S9）。

DOM 保留还意味着浏览器拥有的临时状态可以保留，例如未受控 `<textarea>` 的当前输入值、选择状态
或 `<video>` 的播放位置。它也意味着 DOM 自身的行为不会因 React 清理 Effects 就自动停止（S1、S2）。

### 两条生命周期路径

首次就是 hidden：

```text
首次 render(hidden)
  -> 后代在较低优先级 render
  -> 宿主 DOM 最终保持 display: none
  -> 不建立 Effects
  -> visible 时显示 DOM 并建立 Effects
```

先 visible 再切换：

```text
visible
  -> State、DOM、Effects 均正常
hidden
  -> DOM 隐藏，State/DOM 保留，Effects cleanup
visible
  -> 恢复原 State/DOM，Effects 重新建立
```

这两条路径都不能用固定毫秒数、固定 render 次数或开发环境中的固定 Effect 次数描述。React 只公开
相对优先级和最终生命周期语义（S1-S4、S6）。

### hidden 内容更新

hidden 后代不是冻结快照。父组件传入新 props 或隐藏子树自身收到 State 更新时，React 仍会 render
它，只是优先处理可见内容。React 19.2 发布说明进一步表述为：hidden 更新会推迟到 React 没有其他
工作时处理（S1-S4）。

可依赖的是“更新最终能够反映在保留的隐藏子树中”；不可依赖的是：

- 调用更新后同步读取 DOM 就一定得到新值；
- hidden 更新在多少毫秒内完成；
- 相对某个可见更新的精确 render 顺序；
- 具体调度实现或 render 次数。

React 19.2.8 官方测试还覆盖了已 hidden 子树中的新 DOM 插入和属性更新：新增或更新后的宿主节点
仍保持隐藏（S6）。这用于验证当前 patch，不扩展为内部机制教学。

## Suspense、错误与更新边界

### Suspense

首次 hidden 预渲染可以提前读取会激活 Suspense 的数据源，例如用 `use` 读取的稳定 Promise。Activity
不会发现 Effect 内才开始的数据读取，因此不能把普通 `useEffect` 请求描述成 Activity 预取（S1、S2）。

Activity 管理可见性、State/DOM 保留、Effect 生命周期和 hidden 更新优先级；Suspense 管理 render
期间的挂起与 fallback。公开合同之外，不承诺 hidden 挂起的内部重试顺序、精确 fallback 时机或
调度细节（S1、S2、S7）。

### Error Boundary

Activity 不是 Error Boundary，也没有公开的“吞掉 hidden render 错误”合同。组件在 render 中抛错时，
按 React 通用规则由最近的 Error Boundary 决定 fallback；没有边界时，错误可能移除对应 UI（S10）。

### 更新边界

hidden 的较低优先级只描述 Activity 后代中的工作；不能据此声称父级、兄弟节点或整个应用都被降级。
公开文档也没有要求切换 `mode` 必须包在 Transition 中。这里只保留这两条边界，不展开其他并发 API。

## 适用场景与不适用场景

### 适用

- 数量有限、很可能很快再次显示的侧栏、标签页或工作区，需要恢复本地 State。
- 需要保留未受控表单草稿、媒体位置等短期 DOM 状态，同时在隐藏时停止 React Effects。
- 首次显示前希望以较低优先级准备 UI，并且读取源本身支持 Suspense。
- 显隐切换频繁，而真正卸载造成的状态丢失不符合交互目标。

### 不适用

- 需要跨真正卸载、页面刷新或新会话持久化的数据；Activity 只保留当前 React 树中的身份。
- 需要彻底释放 DOM、组件 State 或关联资源的内容；hidden 明确保留 DOM，且后代仍可能 render。
- 需要隐藏后继续运行订阅或 Effect 的所有权；应把持续运行的所有权放到 Activity 边界外。
- 数量无上限或长期不再使用的隐藏子树；保留 DOM 和 State 仍会占用资源。
- 只是为了隐藏敏感信息；`display: none` 不等于从 DOM 或内存中删除内容。

资源取舍可以从公开事实直接推导：保留 DOM/State 能减少恢复时的重建，但不会提供内存回收、容量
限制或自动淘汰。隐藏内容也仍能 render，因此不能把 `hidden` 描述成“零开销”（S1-S4）。

## 可访问性边界

- Activity hidden 使用 `display: none`；按 W3C 对程序化隐藏内容的定义，隐藏宿主元素及其后代不进入
  可访问性树（S1、S2、S11）。
- 控制显示的按钮必须位于 Activity 边界外，否则内容隐藏后，用户无法依靠边界内的控件自行恢复。
- 可见控制应暴露当前状态，例如对受控区域使用 `aria-expanded` 和 `aria-controls`，不能只用颜色表示。
- Activity Reference 没有承诺自动保存或恢复键盘焦点。切换前后需要由界面明确管理并实际验证焦点，
  不应把 State/DOM 保留误写成焦点恢复保证。

## 确定性 Demo 建议

### 观察目标

使用一个边界外控制区和一个边界内工作区，同时观察四类证据：

1. `mode` 与工作区 computed `display`；
2. React State 计数器；
3. 未受控 `<textarea>` 草稿；
4. Effect setup/cleanup 事件日志。

父组件另提供 `revision` prop，并允许在 hidden 时更新它，用于证明隐藏子树仍能接收更新。

### 状态序列

| 步骤 | 操作                     | 可观察结果                                                                   |
| ---- | ------------------------ | ---------------------------------------------------------------------------- |
| 1    | 初始 `hidden`            | 稳定宿主根最终存在且 `display: none`；没有 Effect setup。                    |
| 2    | 切到 `visible`           | 工作区显示；Effect setup；计数与草稿为初值。                                 |
| 3    | 计数加一并输入草稿       | React State 与浏览器 DOM 状态都发生变化。                                    |
| 4    | 切到 `hidden`            | 工作区不可见；Effect cleanup；计数与草稿没有因显隐切换被重置。               |
| 5    | hidden 时更新 `revision` | 等待隐藏宿主根最终显示新 revision；仍为 `display: none`，Effect 不重新建立。 |
| 6    | 再切到 `visible`         | 恢复计数和草稿，显示最新 revision，并重新建立 Effect。                       |

### 确定性限制

- Activity 后代必须有稳定宿主根；不用纯文本后代充当 DOM 保留证据。
- 不使用网络、timer、随机数、日期、性能时钟或 CPU 忙循环。
- 不在 Demo 中引入 Suspense、Error Boundary 或其他并发 API；这些只保留公开选择边界。
- hidden 更新等待最终 DOM 条件，不用同步断言、固定 sleep 或耗时阈值。
- Effect 只记录 setup/cleanup，不承担计数或草稿存储；事件日志放在边界外。
- 开发 Strict Mode 可能额外执行 Effect 检查。Demo 应验证事件先后语义，不能把开发环境总次数写成
  Activity 固定合同。
- 显示控制始终留在边界外，并明确展示当前模式，保证键盘用户可以恢复内容。

## 高价值易错项

### 错误 1：继续导入实验名称

**触发条件：** 参考早期实验文章，在 React 19.2 中导入 `unstable_Activity`。

**原因：** React 19.2 已把稳定组件公开为 `Activity`；固定客户端入口和类型声明都导出该名称。

**后果：** 代码依赖错误的 API 名称，无法按当前稳定类型和文档使用。

**错误示例：**

```tsx
import { unstable_Activity as Activity } from 'react'
```

**正确示例：**

```tsx
import { Activity } from 'react'
```

**适用版本：** React 19.2.x；核验 patch 为 19.2.8。

**来源：** S3-S5、S8。

### 错误 2：把布尔值直接传给 `mode`，或省略后期待 hidden

**触发条件：** 把业务布尔值直接传给 `mode`，或认为省略 `mode` 会隐藏内容。

**原因：** `mode` 只接受 `"visible"`、`"hidden"` 或 `undefined`；默认值是 `"visible"`。

**后果：** TypeScript 报错，或实际内容保持可见。

**错误示例：**

```tsx
<Activity mode={isOpen}>
  <Panel />
</Activity>
```

**正确示例：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Panel />
</Activity>
```

**适用版本：** React 19.2.x；`@types/react` 19.2.18。

**来源：** S1-S4、S8。

### 错误 3：条件移除整个 Activity 后仍期待恢复 State

**触发条件：** 在 Activity 外层使用 `&&` 或三元表达式移除整个边界。

**原因：** State 保留依赖同一 React 树身份；边界被移除就不再是 hidden，而是真正卸载。

**后果：** 再次创建时，组件 State 和 DOM 草稿从初值开始。

**错误示例：**

```tsx
{
  isOpen && (
    <Activity>
      <Editor />
    </Activity>
  )
}
```

**正确示例：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Editor />
</Activity>
```

**适用版本：** React 19.2.x。

**来源：** S1、S2、S9。

### 错误 4：把手工 CSS 隐藏当成 Activity 等价物

**触发条件：** 只切换 `display: none`，却宣称订阅已清理且隐藏更新已降级。

**原因：** CSS 只改变视觉；Activity 还管理 Effect 生命周期与更新优先级。

**后果：** 隐藏组件的订阅或其他 Effects 仍继续运行，资源和行为与预期不符。

**错误示例：**

```tsx
<section style={{ display: isOpen ? 'block' : 'none' }}>
  <LivePanel />
</section>
```

**正确示例：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <LivePanel />
</Activity>
```

**适用版本：** React 19.2.x。

**来源：** S1-S4。

### 错误 5：依赖 hidden 后 Effect 继续运行

**触发条件：** 把必须持续运行的订阅放在 Activity 后代中，并把正确 cleanup 后的暂停误判为异常。

**原因：** hidden 会清理后代 Effects；再次 visible 时才重新建立。

**后果：** 正确 cleanup 的订阅会在隐藏期间暂停；若为避免暂停而省略 cleanup，旧订阅可能泄漏，并在
恢复后与新订阅重复运行。

**错误示例：**

```tsx
/** 在会被隐藏的工作区中订阅持续数据。 */
function HiddenLivePanel() {
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(handleUpdate)
    return unsubscribe
  }, [])

  return <LivePanel />
}

;<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <HiddenLivePanel />
</Activity>
```

**正确示例：**

```tsx
/** 在 Activity 边界外持有必须持续的订阅。 */
function LivePanelOwner({ isOpen }: { isOpen: boolean }) {
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(handleUpdate)
    return unsubscribe
  }, [])

  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <LivePanel />
    </Activity>
  )
}
```

若订阅只服务于可见 UI，则保留在 Activity 后代并正确返回 cleanup 即可。

**适用版本：** React 19.2.x。

**来源：** S1-S4。

### 错误 6：认为 DOM 保留会自动停止媒体

**触发条件：** Activity 后代包含正在播放的 `<video>` 或 `<audio>`，隐藏时没有显式停止。

**原因：** 媒体 DOM 仍存在；浏览器拥有的播放行为不会因 React 清理 Effects 自动停止。

**后果：** 用户看不到媒体，但音视频仍可能在后台播放。

**错误示例：**

```tsx
/** 渲染没有隐藏清理逻辑的媒体。 */
export function Video() {
  return <video src="/intro.mp4" controls />
}
```

**正确示例：**

```tsx
/** 渲染在 Activity 隐藏时主动暂停的媒体。 */
export function Video() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    return () => video?.pause()
  }, [])

  return <video ref={videoRef} src="/intro.mp4" controls />
}
```

**适用版本：** React 19.2.x；浏览器 DOM 媒体行为。

**来源：** S1、S2。

### 错误 7：同步断言 hidden 更新已经提交

**触发条件：** 调用 State 更新后立即读取 hidden DOM，并要求它已经变化。

**原因：** hidden 更新低于可见内容处理，公开合同不保证同步提交或固定耗时。

**后果：** 测试偶发失败，或把特定环境的调度结果误写成 API 规则。

**错误示例：**

```tsx
setRevision(2)
expect(panel.dataset.revision).toBe('2')
```

**正确示例：**

```tsx
setRevision(2)
await waitFor(() => {
  expect(panel.dataset.revision).toBe('2')
})
```

**适用版本：** React 19.2.x。

**来源：** S1-S4、S6。

### 错误 8：用纯文本后代验证 hidden DOM

**触发条件：** 组件只返回字符串，却期待 hidden 时一定存在文本节点供检查。

**原因：** 纯文本没有宿主元素可应用 Activity 的隐藏样式；官方 caveat 明确允许 hidden 时不输出 DOM。

**后果：** 把正确行为误判为“Activity 没有预渲染”。

**错误示例：**

```tsx
<Activity mode="hidden">hidden text</Activity>
```

**正确示例：**

```tsx
<Activity mode="hidden">
  <section data-testid="activity-content">hidden text</section>
</Activity>
```

**适用版本：** React 19.2.x。

**来源：** S1、S2。

### 错误 9：把开发 Strict Mode 的次数当成生产合同

**触发条件：** 在开发 Strict Mode 中统计 Effect setup/cleanup 总次数，并写成 Activity 固定次数。

**原因：** Strict Mode 会主动执行额外的显隐相关检查，以暴露缺失 cleanup；这不是生产总次数合同。

**后果：** 断言在不同构建模式中不稳定，也掩盖真正应验证的 cleanup/setup 顺序。

**错误示例：**

```tsx
expect(effectSetups).toBe(1)
```

**正确示例：**

```tsx
expect(events).toContain('cleanup:hide')
expect(events.at(-1)).toBe('setup:show')
```

**适用版本：** React 19.2.x；开发 Strict Mode。

**来源：** S1、S2。

### 错误 10：把恢复控件放进 hidden 边界

**触发条件：** 唯一的“显示”按钮本身位于会被隐藏的 Activity 后代中。

**原因：** hidden 后代使用 `display: none`，不会留在可访问性树中。

**后果：** 键盘和辅助技术用户无法操作该按钮恢复内容。

**错误示例：**

```tsx
<Activity mode="hidden">
  <button onClick={showPanel}>显示面板</button>
  <Panel />
</Activity>
```

**正确示例：**

```tsx
<button aria-controls="panel" aria-expanded={isOpen} onClick={showPanel}>
  显示面板
</button>
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <section id="panel">
    <Panel />
  </section>
</Activity>
```

**适用版本：** React 19.2.x；使用 `display: none` 的浏览器环境。

**来源：** S1、S2、S11。

## 练习建议

1. 预测计数为 `1`、未受控 textarea 已输入草稿后，执行 `visible -> hidden -> visible` 时，State、
   DOM 与 Effect 分别发生什么。
2. 比较条件卸载、手工 `display: none` 与 Activity hidden，分别填写 State、DOM、Effect 和更新优先级。
3. 初始以 hidden render，解释为什么后代可以 render，但 Effect 不建立。
4. hidden 时把父级 revision 从 `1` 更新为 `2`，解释为什么只能等待最终结果，不能规定同步完成。
5. 说明为什么 `<video>` 的播放位置可以保留，但播放行为需要 cleanup。
6. 解释为什么 `key` 改变会让 Activity 中原本可恢复的 State 和 DOM 重置。

## 不展开的内容

- 缓存框架、自动淘汰与容量策略；
- 路由集成与页面导航体系；
- RSC、SSR 与 hydration 优化；
- ViewTransition 与动画；
- 内部 lane、Fiber、Offscreen 数据结构或调度算法；
- 固定 render 次数、固定毫秒阈值与性能百分比；
- Activity 未来可能新增但 React 19.2 尚未公开的模式。

这些内容不影响当前可依赖的本科范围：两种公开模式、State/DOM 保留、Effect 清理与恢复、hidden
更新优先级，以及可观察的使用边界。

## 参考资料

- [React `<Activity>` Reference](https://react.dev/reference/react/Activity)
- [固定 Activity 文档源码](https://api.github.com/repos/reactjs/react.dev/contents/src/content/reference/react/Activity.md?ref=383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a)
- [React 19.2 发布说明](https://react.dev/blog/2025/10/01/react-19-2#activity)
- [固定 React 19.2 发布说明源码](https://api.github.com/repos/reactjs/react.dev/contents/src/content/blog/2025/10/01/react-19-2.md?ref=383a1e9239c8c084a16a19daa4fc2a7ad04e2a3a)
- [React 19.2.8 公共导出源码](https://api.github.com/repos/facebook/react/contents/packages/react/src/ReactClient.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170)
- [React 19.2.8 Activity 官方测试](https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/Activity-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170)
- [React 19.2.8 Activity/Suspense 官方测试](https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/ActivitySuspense-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170)
- [`@types/react@19.2.18` 类型声明](https://unpkg.com/@types/react@19.2.18/index.d.ts)
- [React State 保留与重置](https://react.dev/learn/preserving-and-resetting-state)
- [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [W3C WAI 对程序化隐藏内容的定义](https://www.w3.org/WAI/standards-guidelines/act/rules/8fc3b6/#programmatically-hidden)
