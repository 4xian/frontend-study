---
id: react.core.learn.advanced.activity-hidden-state-restoration
type: lesson
title: Activity 隐藏与状态恢复
summary: 在不卸载子树的前提下隐藏界面，保留 State 与 DOM，并在显隐切换时正确管理 Effect。
domain: frontend
technology: react
module: core
stage: advanced
level: advanced
estimatedMinutes: 85
prerequisites:
  - react.core.learn.advanced.use-deferred-value-stale-content
related:
  - react.core.learn.intermediate.state-preservation-and-reset
  - react.core.learn.intermediate.use-effect
  - react.core.learn.advanced.suspense-fallback-boundary
tags:
  - React
  - Activity
  - State preservation
  - DOM preservation
  - Effect cleanup
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能写出 Activity 的导入、Props、mode 默认值与 name 的用途。
  - 能区分条件卸载、手工 CSS 隐藏与 Activity hidden 的行为。
  - 能根据树位置、组件类型和 key 判断 State 与 DOM 能否恢复。
  - 能解释 hidden 时 Effect cleanup、visible 时重新建立 Effect 的过程。
  - 能说明初始 hidden、隐藏更新与嵌套 Activity 的公开规则。
  - 能根据可访问性和资源成本判断界面是否适合长期保留。
recap:
  - Activity 是 React 19.2 的稳定组件，mode 可为 visible 或 hidden，省略时默认为 visible。
  - hidden 使用 display none 隐藏宿主 DOM，同时保留同一树身份下的 State 与 DOM。
  - hidden 会清理后代 Effect，visible 会重新建立 Effect，持续资源的所有权应放在边界外。
  - 初始 hidden 可以低优先级预渲染，隐藏子树也会低优先级响应 props 与 State 更新。
  - hidden 不会自动释放 DOM、暂停媒体、恢复焦点或提供无限容量的保留策略。
sources:
  - title: React Activity
    url: https://react.dev/reference/react/Activity
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 导入、Props、visible 与 hidden、State 和 DOM 保留
      - Effect 清理与重建、hidden 更新、初始预渲染和媒体边界
  - title: React 19.2
    url: https://react.dev/blog/2025/10/01/react-19-2#activity
    sourceType: release-note
    appliesTo: React 19.2
    claims:
      - Activity 的稳定引入版本、公开模式与 hidden 更新优先级
  - title: React 19.2.8 Activity tests
    url: https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/Activity-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 初始 hidden、显隐切换、嵌套边界与 hidden 宿主 DOM 更新的实现旁证
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - State 与组件树位置、组件类型和 key 的身份关系
  - title: React 19.2 TypeScript declarations
    url: https://unpkg.com/@types/react@19.2.18/index.d.ts
    sourceType: source-code
    appliesTo: '@types/react 19.2.18'
    claims:
      - ActivityProps、mode 默认值、name、children 与 Activity 类型
  - title: W3C programmatically hidden definition
    url: https://www.w3.org/WAI/standards-guidelines/act/rules/8fc3b6/#programmatically-hidden
    sourceType: specification
    appliesTo: W3C ACT Rules
    claims:
      - display none 内容不进入可访问性树
---

# Activity 隐藏与状态恢复

## 一、学习目标

- 写出 `Activity` 的导入方式、Props 类型、`mode` 默认值与 `name` 的用途。
- 区分条件卸载、手工 `display: none` 与 `<Activity mode="hidden">`。
- 判断显隐切换后，组件 State、宿主 DOM 和浏览器持有的临时值是否能够恢复。
- 解释 hidden 时 Effect cleanup、visible 时 Effect setup 的生命周期。
- 说明初始 hidden 预渲染、隐藏更新与嵌套边界的公开规则。
- 根据可访问性和资源成本选择适合 Activity 的界面。

## 二、为什么需要

标签页编辑器、侧栏工作区和分步表单经常只是暂时离开视线。条件渲染能彻底移除界面，但用户返回时，
局部 State、未提交草稿和滚动位置也会一起丢失。手工设置 `display: none` 可以保留 DOM，却不会暂停
隐藏子树中的 Effect，也不会改变隐藏更新的处理优先级。

`Activity` 把这些行为组合成一个 React 边界：界面可以不可见，但仍保留在组件树中；React 隐藏宿主
DOM、清理后代 Effect，并在界面重新可见时恢复原来的 State 与 DOM，再建立新一轮 Effect。

它解决的是“暂时隐藏后恢复同一子树”，不是“把任意数量的界面永久留在内存”。是否使用 Activity，
取决于恢复价值是否高于保留 DOM、State 和隐藏更新的资源成本。

## 三、公开 API 与类型

### 1. 从 React 导入稳定组件

React 19.2 使用稳定名称 `Activity`：

```tsx
import { Activity } from 'react'

;<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Workspace />
</Activity>
```

`Activity` 是 React 边界，不是宿主 DOM 元素。它不会额外生成 `<activity>` 标签；真正显示或隐藏的是
后代中的宿主元素。

### 2. Props 与 TypeScript 形状

React 19.2 的类型声明可以概括为：

```ts
interface ActivityProps {
  mode?: 'hidden' | 'visible' | undefined
  name?: string | undefined
  children: ReactNode
}

const Activity: ExoticComponent<ActivityProps>
```

| Prop       | 是否必填 | 含义                                                   |
| ---------- | -------- | ------------------------------------------------------ |
| `children` | 是       | 需要显隐并保留的 React 子树                            |
| `mode`     | 否       | 只接受 `'visible'` 或 `'hidden'`，省略时为 `'visible'` |
| `name`     | 否       | 供 React DevTools 和 instrumentation 识别边界的名称    |

`name` 不是 DOM `id`，不会替代 `aria-label`、`aria-labelledby` 或可见文本。需要 DOM 定位或无障碍名称
时，仍应把对应属性写在真实宿主元素上。

### 3. `mode` 是模式值，不是布尔值

业务状态通常是布尔值，但 `mode` 需要明确映射为字符串联合类型：

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'} name="草稿工作区">
  <DraftWorkspace />
</Activity>
```

省略 `mode` 等价于 `mode="visible"`，不能用省略属性表示 hidden。显式写出映射还能让阅读者直接看到
业务布尔值和 Activity 模式之间的关系。

## 四、`visible` 与 `hidden` 的行为

### 1. `visible` 正常显示并运行 Effect

`mode="visible"` 时，后代按普通可见内容渲染，宿主 DOM 可见，Effect 正常建立，更新也按可见内容
处理。首次 render 时省略 `mode`，结果同样是 visible。

### 2. `hidden` 同时改变三类行为

切换到 `mode="hidden"` 后，React 会：

1. 使用 `display: none` 隐藏后代宿主 DOM，但不删除这些节点。
2. 清理后代 Effect，执行已经注册的 cleanup。
3. 让隐藏子树的后续更新低于可见内容处理。

hidden 不是冻结快照。后代仍可接收新 props，也可以响应 State 更新，只是 React 优先完成可见内容的
工作。因此可以依赖最终结果，不能依赖固定的提交时刻。

### 3. 三种隐藏方式的区别

| 方式                 | State | 宿主 DOM   | Effect                      | 后续更新               |
| -------------------- | ----- | ---------- | --------------------------- | ---------------------- |
| 条件渲染为 false     | 销毁  | 删除       | cleanup，恢复时重新创建     | 子树不存在，不再更新   |
| 手工 `display: none` | 保留  | 保留并隐藏 | 继续运行                    | 按普通可见子树处理     |
| Activity hidden      | 保留  | 保留并隐藏 | cleanup，visible 时重新建立 | 仍可更新，但优先级较低 |

以下两段代码虽然都让界面看不见，组件身份却不同：

```tsx
// false 时移除 Workspace。
{
  isOpen && <Workspace />
}

// 始终保留同一 Activity，只切换模式。
;<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Workspace />
</Activity>
```

## 五、State 与 DOM 的恢复条件

### 1. State 仍由树身份决定

Activity 保留 State 的前提是同一父级位置、同一组件类型和同一 key。切换 `mode` 不会改变这些身份，
所以局部 State 可以继续存在：

```tsx
/** 保存工作区内部的编辑次数。 */
function Workspace() {
  const [editCount, setEditCount] = useState(0)

  return <button onClick={() => setEditCount((count) => count + 1)}>编辑 {editCount} 次</button>
}
```

如果隐藏前是“编辑 3 次”，恢复 visible 后仍是 3。Activity 没有创建第二套 State 机制，只是在 hidden
期间保留原来的树身份。

### 2. 宿主 DOM 与浏览器临时状态会保留

hidden 不删除宿主节点，所以浏览器保存在节点上的临时状态也可能继续存在。未受控输入框是最直接的
例子：

```tsx
/** 使用 DOM 保存未受控草稿。 */
function DraftEditor() {
  return <textarea defaultValue="" />
}
```

用户输入的当前 `value` 位于 textarea DOM 上。hidden 后节点仍连接在文档中，visible 时能恢复同一节点
和同一段草稿。受控输入框不能单独证明 DOM 身份，因为 React 可以把 State 中的 value 写入新节点，
产生相同的可见文本。

DOM 保留还可能保留滚动位置、文本选择或媒体播放位置，但这些都是浏览器拥有的节点状态。Activity
只保证节点保留，不保证每一种浏览器状态都自动暂停、恢复或获得焦点。

### 3. 改变身份仍会重置

以下操作会按普通 React 规则创建新子树：

- 条件移除整个 Activity 后再添加；
- 改变 Activity 或后代组件的 `key`；
- 在同一位置换成不同组件类型；
- 把子树移动到不同的父级位置。

需要明确丢弃草稿时，可以有意更换 key；需要恢复草稿时，应保持位置、类型和 key 稳定。

## 六、Effect 生命周期与资源所有权

### 1. hidden 运行 cleanup，visible 重新 setup

边界内 Effect 的生命周期可以写成：

```text
visible -> Effect setup
hidden  -> Effect cleanup，State 与 DOM 保留
visible -> 新一轮 Effect setup
```

恢复时不会继续旧 Effect 实例，而是重新执行 Effect 函数。Effect 必须返回对称 cleanup，才能避免旧
订阅、连接或监听器与恢复后的新实例同时存在。

```tsx
/** 在工作区可见期间连接同步服务。 */
function WorkspaceConnection() {
  useEffect(() => {
    const connection = connectWorkspace()
    return () => connection.disconnect()
  }, [])

  return <section>同步状态</section>
}
```

### 2. 必须持续的资源放在边界外

如果某个订阅在界面隐藏时也必须持续运行，它的所有权就不应位于 Activity 后代：

```tsx
/** 在 Activity 外持有需要持续运行的订阅。 */
function WorkspaceOwner({ isOpen }: { isOpen: boolean }) {
  useEffect(() => {
    const unsubscribe = subscribeToWorkspace()
    return unsubscribe
  }, [])

  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <WorkspaceView />
    </Activity>
  )
}
```

只服务于可见界面的资源可以留在边界内；跨显隐持续存在的资源应提升到边界外。判断依据是资源的业务
生命周期，而不是代码写在哪个组件更方便。

### 3. DOM 自身行为需要显式处理

Activity 清理 React Effect，不会自动停止保留 DOM 自己的行为。媒体节点可能继续播放，因此需要在
Effect cleanup 中显式暂停：

```tsx
/** 在 Activity 隐藏时暂停保留的媒体节点。 */
function Video() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    return () => video?.pause()
  }, [])

  return <video ref={videoRef} src="/intro.mp4" controls />
}
```

节点仍然存在，所以播放位置可以保留；cleanup 负责停止播放。两者并不矛盾。

## 七、初始 hidden 与隐藏更新

### 1. 初始 hidden 可以低优先级预渲染

Activity 首次就为 hidden 时，后代仍可以在较低优先级 render，但不会建立 Effect：

```tsx
<Activity mode="hidden">
  <Workspace />
</Activity>
```

当它切换为 visible 时，React 显示已经准备的宿主 DOM，并建立 Effect。预渲染没有固定完成时间；界面
可能在浏览器空闲后才准备好，因此验证时应等待目标 DOM 条件。

### 2. 纯文本后代可能没有可保留的 DOM

Activity 需要对宿主元素应用隐藏样式。后代只有纯文本时，hidden 状态可能不输出可检查的 DOM：

```tsx
// 纯文本没有宿主元素可应用 display: none。
<Activity mode="hidden">预备内容</Activity>

// 稳定宿主元素可以承载隐藏状态。
<Activity mode="hidden">
  <section>预备内容</section>
</Activity>
```

“没有文本节点可检查”不等于“后代没有 render”。需要验证 DOM 保留时，应让后代返回稳定宿主根。

### 3. hidden 子树仍会接收更新

父组件传入新 `revision`，或者隐藏子树自身收到 State 更新时，React 最终仍会 render 新值。公开规则只
说明这些更新低于可见内容处理，不保证同步提交、固定毫秒数或固定 render 次数。

```tsx
<Activity mode="hidden">
  <Workspace revision={revision} />
</Activity>
```

测试应等待 `data-revision` 最终更新，同时确认宿主元素仍为 `display: none`，而不是在 setter 调用后立即
读取 DOM。

### 4. 预渲染的数据边界

预渲染可以提前读取会在 render 期间挂起的数据源，例如由 Suspense 管理的稳定 Promise。只有进入
Effect 后才开始的请求不会被 Activity 预渲染发现，因为初始 hidden 不建立 Effect。Activity 负责显隐
和恢复，Suspense 负责 render 挂起时的 fallback；两者职责不同。

## 八、嵌套 Activity 与有效可见性

### 1. 隐藏祖先覆盖后代

内层 `mode="visible"` 不能穿透 hidden 祖先：

```tsx
<Activity mode="hidden">
  <Activity mode="visible">
    <Workspace />
  </Activity>
</Activity>
```

外层仍为 hidden，整个后代树就不可见。只有祖先链上的 Activity 都是 visible，内层边界才可能显示并
建立 Effect。

### 2. 每层边界只控制自己的子树

嵌套边界适合表达独立的可见区域，例如外层控制侧栏，内层控制侧栏中的预览。判断有效模式时，应从
当前边界向上检查所有祖先；不能只读取最内层的 `mode`。

隐藏更新的低优先级也只描述 Activity 后代中的工作，不能据此推断父级、兄弟节点或整个应用都被
降级。

## 九、可访问性与焦点边界

### 1. hidden 内容不进入可访问性树

Activity hidden 使用 `display: none`。被隐藏的宿主元素及其后代不会进入可访问性树，也不能通过键盘
Tab 顺序操作。这符合“当前不可用内容不应继续被辅助技术读到”的预期。

### 2. 恢复控件必须位于边界外

如果唯一的“显示”按钮放在 Activity 后代，它会和内容一起消失。控制按钮应位于边界外，并暴露受控
区域和当前状态：

```tsx
<button aria-controls="workspace" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
  显示工作区
</button>
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <section id="workspace">工作区内容</section>
</Activity>
```

### 3. DOM 保留不等于焦点自动恢复

Activity 没有承诺自动保存或恢复键盘焦点。隐藏当前焦点所在区域时，界面应把焦点移动到仍可操作的
控制位置；重新显示后，是否把焦点送回工作区要由交互目标决定，并通过浏览器行为验证。

`name` 也不能提供无障碍名称。DevTools 标识、DOM 关联和焦点管理是三种不同责任。

## 十、资源成本与使用选择

### 1. 适合短期且数量有限的界面

Activity 适合以下条件同时成立的区域：

- 用户很可能很快返回；
- 恢复局部 State 或未受控 DOM 状态具有明确价值；
- hidden 时应停止边界内 Effect；
- 保留的子树数量和大小有明确上限。

常见例子是有限数量的标签页、侧栏、编辑器面板或分步表单。

### 2. 不适合需要彻底释放的内容

hidden 明确保留 DOM 和 State，后代也仍可能 render，因此不能把它描述成零开销。对于长期不再使用、
体积很大或数量不断增长的界面，真正卸载通常更符合资源释放目标。

Activity 也不提供跨页面刷新持久化、自动失效、容量限制或淘汰策略。需要跨真正卸载保存数据时，应把
数据放到具有明确生命周期的外部状态或持久化系统中。

### 3. 不要用 hidden 隐藏敏感数据

`display: none` 只改变可见性，不会从 DOM、React State 或内存中删除内容。权限控制和敏感数据隔离
必须在数据获取和渲染边界上完成，不能依赖 Activity hidden。

## 十一、Demo：观察隐藏与恢复

Demo 从 hidden 冷状态开始，边界外的控制区始终可用。按以下顺序操作可以分别观察每条合同：

1. 初始检查 DOM：稳定宿主根最终存在，computed display 为 `none`，Effect 尚未建立。
2. 显示工作区：Effect 建立，计数与未受控草稿处于初值。
3. 计数加一、输入草稿并检查 DOM：建立首次可见节点身份基线。
4. 隐藏工作区：Effect cleanup，节点仍连接，计数与草稿没有重置。
5. hidden 时更新父级 revision：等待子树 revision 最终追上，display 仍为 `none`，Effect 不重新建立。
6. 再次显示：同一节点恢复，计数、草稿和最新 revision 同时可见，Effect 建立新一轮实例。
7. 重建实验：改变 key，所有证据回到新的 hidden 冷状态。

外部 DOM 快照会同时读取连接状态、computed display、节点身份、子树 revision 和 textarea 当前 value，
避免把 React State、DOM 状态、Effect 生命周期与 prop 更新混为同一条证据。

:::demo{id="react.core.learn.advanced.activity-hidden-state-restoration.hidden-workspace-demo"}
:::

## 十二、易错使用提示

:::pitfalls

### 错误一：继续导入实验名称

**触发条件：** 参考早期实验文章，在 React 19.2 中导入 `unstable_Activity`。

**原因：** React 19.2 已使用稳定名称 `Activity`。

**后果：** 代码依赖错误的 API 名称，无法按当前公开类型使用。

**错误示例：**

```tsx
import { unstable_Activity as Activity } from 'react'
```

**正确写法：**

```tsx
import { Activity } from 'react'
```

**验证方式：** 检查 React 19.2 的公开导出与 TypeScript 声明，确认只使用稳定名称。

### 错误二：传入布尔值或省略后期待 hidden

**触发条件：** 把业务布尔值直接传给 `mode`，或者省略 `mode` 后期待内容隐藏。

**原因：** `mode` 只接受 `'visible'`、`'hidden'` 或 `undefined`，默认值是 `'visible'`。

**后果：** TypeScript 报错，或者实际内容保持可见。

**错误示例：**

```tsx
<Activity mode={isOpen}>
  <Panel />
</Activity>
```

**正确写法：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Panel />
</Activity>
```

**验证方式：** 检查类型结果，并分别在 `isOpen` 为 true 和 false 时读取 computed display。

### 错误三：移除边界后仍期待恢复 State

**触发条件：** 在 Activity 外层使用条件渲染移除整个边界。

**原因：** State 保留依赖同一 React 树身份；边界被移除就是真正卸载，不是 hidden。

**后果：** 再次创建时，组件 State 与 DOM 草稿都从初值开始。

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

**正确写法：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <Editor />
</Activity>
```

**验证方式：** 隐藏前修改局部计数和未受控草稿，恢复后分别检查两者是否仍在。

### 错误四：把手工 CSS 隐藏当成 Activity

**触发条件：** 只切换 `display: none`，却认为 Effect 已清理、隐藏更新已降低优先级。

**原因：** CSS 只控制视觉，不参与 React Effect 生命周期或更新调度。

**后果：** 隐藏区域中的订阅、连接或其他 Effect 仍可能继续运行。

**错误示例：**

```tsx
<section style={{ display: isOpen ? 'block' : 'none' }}>
  <LivePanel />
</section>
```

**正确写法：**

```tsx
<Activity mode={isOpen ? 'visible' : 'hidden'}>
  <LivePanel />
</Activity>
```

**验证方式：** hidden 后同时检查 computed display 和 Effect cleanup 记录。

### 错误五：依赖 hidden 子树中的 Effect 持续运行

**触发条件：** 把必须跨显隐持续运行的订阅放进 Activity 后代。

**原因：** hidden 会清理后代 Effect，visible 时才重新建立。

**后果：** 订阅在隐藏期间停止；若省略 cleanup，恢复后还可能出现重复订阅。

**错误示例：**

```tsx
<Activity mode="hidden">
  <GlobalSubscriptionOwner />
</Activity>
```

**正确写法：**

```tsx
<GlobalSubscriptionOwner />
<Activity mode="hidden">
  <WorkspaceConsumer />
</Activity>
```

**验证方式：** 确认持续资源的所有者位于边界外，边界内 Effect 的 setup 与 cleanup 成对出现。

### 错误六：认为 DOM 保留会自动停止媒体

**触发条件：** Activity 后代包含正在播放的 video 或 audio，隐藏时没有显式停止。

**原因：** 媒体 DOM 仍存在，浏览器拥有的播放行为不会因 Effect cleanup 自动停止。

**后果：** 用户看不到媒体，但音视频仍可能在后台播放。

**错误示例：**

```tsx
/** 渲染没有隐藏清理逻辑的媒体。 */
function Video() {
  return <video src="/intro.mp4" controls />
}
```

**正确写法：**

```tsx
/** 在 Activity 隐藏时暂停保留的媒体节点。 */
function Video() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    return () => video?.pause()
  }, [])

  return <video ref={videoRef} src="/intro.mp4" controls />
}
```

**验证方式：** 隐藏边界后检查媒体已暂停，同时确认节点与当前播放位置仍保留。

### 错误七：同步断言 hidden 更新已经提交

**触发条件：** 调用更新后立即读取 hidden DOM，并要求它已经变化。

**原因：** hidden 更新低于可见内容处理，公开规则不保证同步提交或固定耗时。

**后果：** 验证依赖设备和调度时机，结果不稳定。

**错误示例：**

```tsx
setRevision(2)
expect(panel.dataset.revision).toBe('2')
```

**正确写法：**

```tsx
setRevision(2)
await waitFor(() => {
  expect(panel.dataset.revision).toBe('2')
})
```

**验证方式：** 等待最终 DOM 条件，再确认 revision 更新、display 仍为 `none` 且 Effect 没有重新建立。

### 错误八：用纯文本后代验证 hidden DOM

**触发条件：** Activity 只包含字符串，却期待 hidden 时一定存在文本节点供检查。

**原因：** 纯文本没有宿主元素可应用隐藏样式，hidden 时可能不输出 DOM。

**后果：** 把正确行为误判为 Activity 没有预渲染。

**错误示例：**

```tsx
<Activity mode="hidden">预备内容</Activity>
```

**正确写法：**

```tsx
<Activity mode="hidden">
  <section data-testid="activity-content">预备内容</section>
</Activity>
```

**验证方式：** 使用稳定宿主根检查 `display: none`、连接状态和后续属性更新。

### 错误九：把开发环境次数当成固定合同

**触发条件：** 在开发 Strict Mode 中统计 Effect setup 和 cleanup 总次数，并写成固定断言。

**原因：** Strict Mode 可能执行额外检查来暴露缺失 cleanup，这不是 Activity 的固定次数规则。

**后果：** 断言在不同运行模式下不稳定，也掩盖真正需要验证的生命周期顺序。

**错误示例：**

```tsx
expect(effectSetups).toBe(1)
```

**正确写法：**

```tsx
expect(events).toContain('cleanup:hidden')
expect(events.at(-1)).toBe('setup:visible')
```

**验证方式：** 验证 hidden 最终完成 cleanup、visible 最终重新 setup，不规定开发环境总次数。

### 错误十：把恢复控件放进 hidden 边界

**触发条件：** 唯一的“显示”按钮本身位于会被隐藏的 Activity 后代中。

**原因：** hidden 后代使用 `display: none`，不会留在可访问性树或键盘 Tab 顺序中。

**后果：** 用户无法操作该按钮恢复内容。

**错误示例：**

```tsx
<Activity mode="hidden">
  <button onClick={showPanel}>显示面板</button>
  <Panel />
</Activity>
```

**正确写法：**

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

**验证方式：** hidden 时用键盘确认外部按钮仍可聚焦，并能切换回 visible。
:::

## 十三、源码推导与适用场景

### 1. 公共导出与类型

React 19.2 的客户端入口公开导出 `Activity`；TypeScript 声明把它定义为接收 `ActivityProps` 的
`ExoticComponent`。`mode` 的联合类型和默认值、必填 `children`、可选 `name` 都属于可直接核对的
公开表面。

### 2. 官方行为与实现旁证

官方 Reference 规定 visible/hidden、`display: none`、State/DOM 保留、Effect cleanup 与重建、hidden
更新和初始预渲染。React 19.2.8 的官方测试还覆盖初始 hidden 不建立 Effect、显隐切换、嵌套边界，
以及 hidden 子树插入或更新宿主 DOM 后仍保持隐藏。

测试用于确认当前版本实现符合公开行为，不能把内部 lane、Fiber 结构、精确 render 顺序或调度次数当成
长期 API 承诺。

### 3. 从合同推导使用选择

State 与 DOM 保留意味着恢复快，也意味着资源没有被释放；Effect cleanup 意味着隐藏 UI 的同步过程会
暂停，也意味着持续资源必须移到边界外。由此可以得到三个直接判断：

1. 短期、有限、恢复价值高的界面适合 Activity。
2. 长期不用、数量增长或必须释放资源的界面应真正卸载。
3. 需要跨卸载或刷新保存的数据必须交给具有明确生命周期的外部状态或持久化系统。

## 十四、练习

:::exercise

### 练习一：记录完整显隐序列

**要求：** 让 Demo 从 hidden 开始，依次执行显示、计数加一、输入草稿、检查 DOM、隐藏、更新 revision、
再次检查 DOM 和显示。记录每一步的 mode、State、textarea value、节点身份、Effect setup/cleanup 与
revision。

**验收：** 能分别说明 React State、浏览器 DOM 状态、Effect 生命周期和 prop 更新的结果，并确认
hidden 不等于卸载。
:::

:::exercise

### 练习二：比较三种隐藏方式

**要求：** 为条件卸载、手工 `display: none` 与 Activity hidden 分别填写 State、DOM、Effect 和后续
更新四列，再为“短期编辑器”“持续全局订阅”“长期不用的大型面板”选择处理方式。

**验收：** 能根据恢复目标、Effect 所有权和资源释放要求作出选择，而不是只比较视觉结果。
:::

:::exercise

### 练习三：修复嵌套与可访问性问题

**要求：** 给定“外层 hidden、内层 visible、显示按钮位于内层”的结构，调整祖先模式和按钮位置，补上
`aria-controls`、`aria-expanded` 与稳定宿主根。

**验收：** hidden 时外部按钮仍可通过键盘操作；祖先恢复 visible 后内层才显示；宿主根可用于检查
computed display 和节点身份。
:::

## 十五、本节小结

- `Activity` 是 React 19.2 的稳定组件，`mode` 可为 visible 或 hidden，省略时默认为 visible。
- hidden 使用 `display: none` 隐藏宿主 DOM，保留同一树身份下的 State、DOM 和未受控临时值。
- hidden 会清理后代 Effect，visible 会重新建立；需要持续的资源应由边界外组件持有。
- 初始 hidden 可以低优先级预渲染，隐藏子树仍会低优先级响应 props 与 State 更新。
- 隐藏祖先覆盖整个后代树；恢复控件必须留在边界外，焦点恢复需要单独设计。
- Activity 适合数量有限、短期隐藏且恢复价值高的界面，不提供资源释放、自动淘汰或持久化。

## 十六、参考资料

- [React `<Activity>`](https://react.dev/reference/react/Activity) - 导入、Props、visible/hidden、
  State/DOM、Effect、hidden 更新、初始预渲染、纯文本和媒体边界。
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2#activity) - Activity 的稳定引入版本、公开模式
  与 hidden 更新优先级。
- [React 19.2.8 Activity tests](https://api.github.com/repos/facebook/react/contents/packages/react-reconciler/src/__tests__/Activity-test.js?ref=1dd4ecbdabf826f527fc9a58c05ea70375b7d170) -
  初始 hidden、显隐切换、嵌套边界与 hidden 宿主 DOM 更新的固定版本旁证。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - State 与树位置、
  组件类型和 key 的身份规则。
- [`@types/react@19.2.18`](https://unpkg.com/@types/react@19.2.18/index.d.ts) - `ActivityProps`、`mode`、
  `name`、`children` 与 `Activity` 类型。
- [W3C programmatically hidden](https://www.w3.org/WAI/standards-guidelines/act/rules/8fc3b6/#programmatically-hidden) -
  `display: none` 内容与可访问性树的关系。
