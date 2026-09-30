---
id: react.router.learn.advanced.navigation-blocking
type: lesson
title: 导航阻止
summary: 使用 useBlocker 在未保存的本地草稿将要离开当前路由时提供明确的继续或留下选择。
domain: frontend
technology: react
module: router
stage: advanced
level: advanced
estimatedMinutes: 60
prerequisites:
  - react.router.learn.basics.link-navigation
  - react.router.learn.basics.programmatic-navigation
  - react.router.learn.intermediate.form-navigation-form
  - react.router.learn.advanced.scroll-restoration
related:
  - react.router.learn.intermediate.navigation-pending-ui
  - react.router.learn.intermediate.action-results-and-form-validation
tags:
  - React Router
  - Data Mode
  - useBlocker
  - Navigation
  - Draft
  - Unsaved changes
appliesTo: React Router 8.3.0
verifiedAt: 2026-08-27
objectives:
  - 能说明 useBlocker 只处理单页应用内部导航，不能拦截刷新、关闭标签页或跨域跳转。
  - 能用脏状态和目标 location 编写只在真正离开编辑页时生效的阻止条件。
  - 能根据 unblocked、blocked 和 proceeding 三种状态组织确认界面。
  - 能使用 reset() 留在当前页面，并使用 proceed() 完成已拦截的导航。
  - 能在提交成功后消除脏状态，并为尚未处理的拦截选择明确的收束策略。
recap:
  - useBlocker 把是否阻止和用户确认分开：先给出条件，再由界面决定 reset 或 proceed。
  - blocked 时仍在当前 location；blocker.location 记录的是用户原本想去的目标。
  - reset 保留当前页面和草稿，proceed 只放行当前已拦截的一次内部导航。
  - 脏状态必须来自真实未保存的数据；窗口刷新和站外离开属于浏览器生命周期，不是 useBlocker 的能力范围。
sources:
  - title: React Router 8.3.0 Release
    url: https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0
    sourceType: release-note
    appliesTo: React Router 8.3.0
    claims:
      - React Router 8.3.0 是本课核验时的稳定发布版本，并对应固定 release 与 tag。
  - title: npm react-router Latest Metadata
    url: https://registry.npmjs.org/react-router/latest
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - npm latest 在核验时返回 8.3.0。
  - title: React Router 8.3.0 useBlocker API
    url: https://reactrouter.com/8.3.0/api/hooks/useBlocker
    sourceType: api-doc
    appliesTo: React Router 8.3.0
    claims:
      - useBlocker 接收 boolean 或 BlockerFunction，并返回带 state、location、proceed 和 reset 的 Blocker。
      - useBlocker 只处理 SPA 内部导航，不处理硬刷新或跨域导航。
  - title: React Router 8.3.0 Navigation Blocking How-to
    url: https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/navigation-blocking.md
    sourceType: official-reference
    appliesTo: React Router 8.3.0
    claims:
      - 未保存表单可以作为脏状态来源；blocked 后需要以自定义确认界面调用 reset 或 proceed。
      - action 成功后应清空已保存的表单，并收束仍处于 blocked 的选择。
  - title: React Router 8.3.0 useBlocker Source
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/hooks.tsx
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - useBlocker 通过 Data Router 上下文注册阻止条件，并将 boolean 适配为 BlockerFunction。
  - title: React Router 8.3.0 Navigation Blocking Tests
    url: https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/navigation-blocking-test.ts
    sourceType: source-code
    appliesTo: React Router 8.3.0
    claims:
      - 官方测试覆盖 PUSH、REPLACE 和 POP 导航在 blocked、proceeding、reset 后的状态与位置结果。
---

# 导航阻止

## 一、学习目标

- 说明 `useBlocker` 处理的导航范围，以及它与浏览器关闭、刷新之间的边界。
- 用未保存草稿作为脏状态，只在用户真正离开当前编辑 route 时阻止导航。
- 读取 `unblocked`、`blocked` 与 `proceeding`，把阻止条件和确认界面分开。
- 在 `blocked` 状态调用 `reset()` 留在页面，或调用 `proceed()` 放行当前目标。
- 在表单提交成功后清除脏状态，并正确收束仍未处理的导航选择。

## 二、为什么需要导航阻止

编辑文章、填写地址或修改配置时，用户可能在还没有保存的情况下点击侧边栏、浏览器后退或页面内链接。直接
离开会丢失本地输入；无论什么时候都弹出确认框又会让正常浏览变得笨重。

导航阻止的判断应由两件事组成：当前页面是否确实存在未保存的变化，以及这次内部导航是否真的离开当前工作
上下文。`useBlocker` 负责暂缓 Data Router 的这一次导航；页面再向用户说明目标，并让用户明确选择继续离开
或继续编辑。

它不是浏览器级的离开保护。刷新、关闭标签页和跳转到其他站点不属于单页应用内部导航，`useBlocker` 不会
拦截它们。需要覆盖这些场景时，应按浏览器生命周期和产品的数据保存策略另行设计，不能把本 Hook 当成完整的
数据保护方案。

## 三、核心概念

### 1. 阻止条件只描述“是否暂缓”

`useBlocker` 接收一个布尔值，或接收一个返回布尔值的 `BlockerFunction`。函数形式会得到当前位置、目标位置
和历史动作，因此可以把“草稿不为空”与“路径发生变化”组合成一个业务条件：

```tsx
import { useCallback, useState } from 'react'
import { type BlockerFunction, useBlocker } from 'react-router'

function DraftEditor() {
  const [draft, setDraft] = useState('')
  const isDirty = draft.trim().length > 0

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
    [isDirty],
  )
  const blocker = useBlocker(shouldBlock)

  return <textarea value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
}
```

当用户只是更新当前页面内的局部 UI 时，不应把它伪装成一次 route 离开。相反，查询参数、hash、子 route 或
浏览器后退是否算“离开”，取决于产品是否会让这次变化丢失当前编辑上下文；可以利用 `nextLocation` 和
`historyAction` 写出对应的精确规则。

### 2. Blocker 是一次待确认导航的状态机

`useBlocker` 返回的对象把当前拦截过程表达为三个状态：

```text
unblocked
  | 用户带着未保存草稿发起内部导航
  v
blocked -- reset() --> unblocked（留在当前 location）
  |
  | proceed()
  v
proceeding --> 目标导航提交 --> unblocked
```

- `unblocked`：没有待确认的导航，此时 `proceed` 和 `reset` 不可用。
- `blocked`：Router 保留在当前 location，`blocker.location` 是本来要前往的目标；此时确认界面可以提供两个
  选择。
- `proceeding`：用户已确认离开，Router 正在完成原来的导航；导航结束后状态回到 `unblocked`。

不要自己保存一个“待去地址”的 state。`blocker.location` 已经属于当前阻止事务，确认时调用 `proceed()` 会沿用
原本的导航类型和目标。

### 3. reset 与 proceed 有不同的产品语义

`reset()` 取消本次待确认导航，输入仍保留在当前编辑页；适合“继续编辑”。`proceed()` 只放行当前被阻止的那
一次导航；适合用户明确选择“离开且丢弃未保存草稿”。两者都只应在 `blocker.state === 'blocked'` 时调用。

如果用户在确认前先保存了表单，成功结果通常会清除脏状态并调用 `reset()`，因为用户仍在当前页面。只有产品
明确要在保存成功后继续原目标时，才在仍为 `blocked` 的情况下调用 `proceed()`；它不是“保存成功”的通用
回调。

## 四、用法与示例

### 1. 让脏状态来自可保存的真实字段

脏状态应由还没有提交的数据推导，而不是在点击任意按钮时无条件设为 `true`：

```tsx
const [title, setTitle] = useState('')
const [body, setBody] = useState('')
const isDirty = title.trim().length > 0 || body.trim().length > 0

const shouldBlock = useCallback<BlockerFunction>(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
  [isDirty],
)

const blocker = useBlocker(shouldBlock)
```

初始值若来自 loader 或服务端快照，应比较“当前编辑值”与“最后一次已保存值”，而不是只检查字符串是否为空。
这样用户把字段改回原值时可以自然解除阻止，也不会把刚加载的内容误判为未保存。

### 2. 用可访问的页面内确认区呈现目标

确认区只在 `blocked` 时出现，并说明用户将要离开的目标。使用原生按钮，让键盘用户可以直接选择：

```tsx
{blocker.state === 'blocked' ? (
  <section aria-live="assertive" aria-labelledby="leave-confirmation-title">
    <h2 id="leave-confirmation-title">草稿尚未保存</h2>
    <p>准备前往：{blocker.location.pathname}</p>
    <button type="button" onClick={() => blocker.reset()}>
      继续编辑
    </button>
    <button type="button" onClick={() => blocker.proceed()}>
      放弃草稿并离开
    </button>
  </section>
) : null}
```

`reset()` 后确认区消失，地址和表单值都不变；`proceed()` 后先进入 `proceeding`，随后由 Router 提交原目标。
确认区不要自行调用 `navigate(blocker.location)`，否则会丢失原导航的 `replace`、历史动作或 state。

### 3. 在保存结果到来时收束待确认选择

导航型表单或 `fetcher.Form` 成功后，先让已保存快照接管，再处理仍未决定的导航：

```tsx
useEffect(() => {
  if (!fetcher.data?.ok) return

  setIsDirty(false)
  if (blocker.state === 'blocked') {
    blocker.reset()
  }
}, [blocker, fetcher.data])
```

上例把“保存后留在当前页”作为产品规则，因此使用 `reset()`。若保存完成后应自动前往用户之前点击的页面，条件
仍然是 `blocked`，只是把该调用换成 `blocker.proceed()`。两种策略都必须清楚地反馈给用户，不能因为请求成功
就静默改变地址。

### 4. 明确浏览器级离开的边界

`useBlocker` 的条件只会参与由 Router 管理的 SPA 导航。不要用页面内 Demo 的表现推断它能保护浏览器刷新、
关闭标签页或外部链接。需要降低这类风险时，优先减少未保存窗口，例如自动保存、草稿恢复或清晰的保存状态；
浏览器离开提示只是受浏览器限制的补充手段。

## 五、用法示例或 Demo

:::demo{id="react.router.learn.advanced.navigation-blocking.navigation-blocking-demo"}
Demo 从空白草稿开始，直接进入“工作区概览”不会被阻止。输入标题或正文后再点击同一链接，观察当前地址保持
`/editor`、状态变为 `blocked`，确认区显示目标 `/workspace`。点击“继续编辑”会保留草稿并留在编辑页；再次
触发后点击“放弃草稿并离开”会完成原导航。清空或保存草稿后，导航又会直接通过。
:::

## 六、易错使用提示

:::pitfalls
### 错误：只要页面挂载就阻止所有导航

**触发条件：** 把 `useBlocker(true)` 放进编辑页，却没有检查未保存数据。

**原因：** 阻止条件没有表达真正的数据风险，正常浏览也被视为离开危险。

**后果：** 用户每次切换页面都要确认，确认框最终会被习惯性忽略。

**错误示例：**

```tsx
const blocker = useBlocker(true)
```

**正确写法：**

```tsx
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
)
```

**验证方式：** 空草稿与已保存草稿可以直接导航；输入未保存内容后，只有离开编辑 route 才出现确认区。

### 错误：在 blocked 之外调用 proceed 或 reset

**触发条件：** 把 `blocker.proceed()` 放在普通保存按钮中，或不判断状态就调用 `reset()`。

**原因：** 这两个函数只代表当前一次已经被阻止的导航；没有待确认导航时不存在可放行或取消的事务。

**后果：** 类型会暴露函数不可用，且代码把保存流程和导航流程错误地耦合。

**错误示例：**

```tsx
function save() {
  saveDraft()
  blocker.proceed()
}
```

**正确写法：**

```tsx
if (blocker.state === 'blocked') {
  blocker.reset()
}
```

**验证方式：** 在没有发起导航时保存草稿，确认页面保持当前位置；触发拦截后再选择继续编辑，确认状态回到
`unblocked`。

### 错误：确认离开时重新 navigate 到目标地址

**触发条件：** 从 `blocker.location.pathname` 拼出字符串，再调用 `navigate()`。

**原因：** 新导航不是原来那次被拦截的导航，可能丢失 `replace`、location state 或历史动作。

**后果：** 后退栈、地址 state 或原先的导航语义会与用户最初操作不一致。

**错误示例：**

```tsx
function leave() {
  navigate(blocker.location.pathname)
}
```

**正确写法：**

```tsx
function leave() {
  if (blocker.state === 'blocked') blocker.proceed()
}
```

**验证方式：** 分别用 Link、replace 导航和浏览器后退触发阻止，确认放行后都延续用户原来的导航方式。

### 错误：保存成功后只清空字段，不收束 blocked 状态

**触发条件：** 用户先点击离开，确认区出现后改为提交表单；action 成功时只执行 `form.reset()`。

**原因：** 已拦截的导航仍是一个待处理事务，字段变为空不会替它自动作出“留下”或“离开”的选择。

**后果：** 界面可能继续显示过期确认区，用户不知道保存后最终会停在哪里。

**错误示例：**

```tsx
if (fetcher.data?.ok) {
  formRef.current?.reset()
}
```

**正确写法：**

```tsx
if (fetcher.data?.ok && blocker.state === 'blocked') {
  formRef.current?.reset()
  blocker.reset()
}
```

**验证方式：** 在确认区出现后完成一次成功提交，确认脏状态、确认区和最终地址都符合产品定义的保存后策略。

### 错误：把 useBlocker 当成刷新和站外跳转保护

**触发条件：** 依赖 `useBlocker` 保护关闭标签页、地址栏刷新或跳到其他域名。

**原因：** 这些不属于 Router 控制的 SPA 导航。

**后果：** 用户可能在没有任何提示时失去未保存输入。

**错误示例：**

```tsx
useBlocker(isDirty)
// 误以为浏览器刷新也会被阻止
```

**正确写法：**

```tsx
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname,
)
// 刷新、关闭标签页和站外跳转另由浏览器生命周期与保存策略处理。
```

**验证方式：** 分开测试页面内 Link 与浏览器刷新；只把前者作为 `useBlocker` 的验收范围。
:::

## 七、源码推导与适用场景

1. **官方事实：** React Router 8.3.0 的 `useBlocker` 通过 Data Router 上下文注册阻止条件；传入布尔值时会先
   适配为函数，函数形式得到当前 location、目标 location 和历史动作。
2. **官方事实：** 固定版本 Router 测试分别覆盖 PUSH、REPLACE 与 POP 的阻止行为。`proceed()` 会让状态进入
   `proceeding` 并完成原导航；`reset()` 回到 `unblocked` 且保留当前 location。
3. **课程推导：** 确认界面应消费 `blocker.location` 并调用 blocker 自己的操作，而不是重建另一套导航。这样
   拦截条件只负责风险判断，界面只负责用户决定，原导航语义仍由 Router 保留。
4. **适用边界：** 这适合已知有未保存本地输入的内部路由切换。它不替代自动保存、服务端草稿、浏览器离开提示或
   多窗口同步策略；这些问题需要根据数据价值和浏览器能力独立处理。

## 八、练习

:::exercise
### 练习目标

**要求：** 创建包含 `/editor` 与 `/preview` 的 Data Router。编辑页有标题和正文两个受控字段，比较当前字段值
与一份最后保存快照。仅当值有差异且目标 pathname 不同才阻止导航。确认区显示 `blocker.location.pathname`，
提供“继续编辑”和“保存后离开”两条路径；后者要先模拟 action 成功，再在 `blocked` 状态调用 `proceed()`。

**验收：** 初始或保存后的编辑页可以直接进入预览；有改动时点击 Link 或后退会保持当前地址并显示目标；选择
继续编辑后字段不变、状态回到 `unblocked`；选择保存后离开时，原目标和原导航方式被保留；刷新页面不被误判为
`useBlocker` 已覆盖的场景。
:::

## 九、本节小结

- `useBlocker` 只暂缓 Data Router 管理的内部导航，不能保护刷新、关闭或跨域离开。
- 阻止条件应同时表达真实脏状态和真正离开当前编辑上下文的导航。
- `blocked` 时仍在当前地址，`blocker.location` 保存待确认目标；`reset()` 留下，`proceed()` 放行原导航。
- 保存成功后必须清除脏状态，并明确选择重置还是继续当前已拦截的导航。
- 确认 UI 不应手写第二次 `navigate`，应让 Router 保留原来的位置、历史动作和 state。

## 十、参考资料

- [React Router 8.3.0 useBlocker API](https://reactrouter.com/8.3.0/api/hooks/useBlocker) - 公共签名、状态、
  `location`、`proceed()`、`reset()` 与 SPA 边界。
- [Navigation Blocking How-to](https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@8.3.0/docs/how-to/navigation-blocking.md) - 脏表单、确认 UI 与保存成功后的收束策略。
- [useBlocker 源码](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/lib/hooks.tsx) -
  Data Router 上下文与 boolean/function 条件适配。
- [导航阻止 Router 测试](https://github.com/remix-run/react-router/blob/react-router%408.3.0/packages/react-router/__tests__/router/navigation-blocking-test.ts) -
  PUSH、REPLACE、POP、`proceed()` 与 `reset()` 的固定版本行为。
- [React Router 8.3.0 Release](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0) - 本课适用的稳定发布版本。
