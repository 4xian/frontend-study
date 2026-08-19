# State 保留与重置调研记录

## 知识点合同

- 课程 ID：`react.core.learn.intermediate.state-preservation-and-reset`
- 标题：State 保留与重置
- 学习层级：本科范围的 React 中级基础
- 核验日期：`2026-08-16`
- 官方文档基线：React `19.2`
- 研究状态：官方事实、课程推导、边界和高风险错误已冻结

本课只解释一个问题：React 如何根据 render tree 中的组件位置、组件类型和可选的 `key`，决定保留
还是重建局部 State。课程的中心判断是：默认情况下，前后两次 render 在同一父级位置继续呈现同一
组件类型时，React 保留该位置的 State；节点被移除、组件类型改变，或 `key` 改变时，旧身份及其
对应的 State 会被销毁并创建新的身份。

必须覆盖以下内容：

1. State 由 React 保存，并与组件在 render tree 中的位置关联。
2. “位置”是树结构中相对父级的地址，不是 JSX 文件行号、变量名、DOM 像素坐标或显示文字。
3. 同一位置的同一组件类型在重新 render 时保留 State；Prop、样式、业务名称和条件表达式的写法
   不会单独改变默认身份。
4. 同类型组件位于不同位置时，各自拥有隔离的 State。
5. 组件从树中移除后，旧 State 被销毁；重新添加时从初始值建立新 State。
6. 同一位置换成另一种组件类型时，旧组件及其整个子树的 State 会重置；祖先类型改变也可能重置
   该祖先下的整棵子树。
7. 在父组件内部定义子组件函数会在每次父级 render 时产生新的函数类型，可能导致意外重置。
8. `key` 可以成为位置身份的一部分；同一位置的 key 改变会创建新身份，重建该边界及其后代 State
   和 DOM。
9. `key` 只在同一父级的兄弟节点中要求唯一，不是全局标识，也不会作为普通 prop 传入组件。
10. 稳定业务 ID 适合表达“这是另一个编辑实例”；随机值、每次 render 改变的值和不稳定的数组索引
    不能承担稳定身份。
11. 整棵子树重置与只清空某个字段是不同的数据建模决策；只有当产品概念上的身份确实改变时才重置
    整棵编辑子树。

明确不在本课展开：Reducer、Context、Effect 生命周期、Ref、缓存、路由保留、Activity、外部 Store、
远程请求、持久化、列表协调算法和性能优化。列表只保留理解 `key` 作用域、稳定性和身份连续性所需
的最小边界；表单只用于说明整棵编辑子树何时应重置，不承担完整表单状态管理课程。

## 调研问题

1. State 由谁保存，怎样和屏幕上的组件实例对应？
2. React 所说的位置是 JSX 代码位置，还是返回树中的结构位置？
3. 同位置同类型、同位置不同类型、节点移除和祖先改变分别会发生什么？
4. 为什么改变 Prop 或条件分支的写法通常不会重置 State？
5. 为什么并列同类型组件不会共享 State？
6. 为什么父组件内部声明的子组件函数会导致 State 意外丢失？
7. `key` 如何加入身份判断，key 改变的重建边界有多大？
8. key 的唯一性作用域为何是同一 parent 的 siblings？
9. 为什么业务 ID 要作为普通 prop 传递，不能从 `props.key` 读取？
10. 何时用 key 重置表单，何时应保持 State 或只调整一部分 State？
11. 如何避免把 key 当成缓存、刷新按钮或每个业务对象的永久 State 存储？

## 研究方式与证据边界

本次使用已知的 React 官方一手 URL，直接通过 `curl -L --fail --silent --show-error` 读取官方
Markdown 原文；没有采用搜索摘要、社区文章、二手教程或模型总结作为证据。核对页面如下：

| 来源 | 核对目的 |
| --- | --- |
| React Versions | 确认当前官方文档版本口径和版本归档规则 |
| Preserving and Resetting State | 核对位置、类型、条件分支、移除、祖先、嵌套定义和 key 的公开规则 |
| State: A Component's Memory | 核对 State 的实例隔离和“同一组件渲染两次各有一份 State” |
| `useState` Reference | 核对改变 key 时重建组件及全部 children，以及递增版本重置表单 |
| You Might Not Need an Effect | 核对整棵 State 重置与只调整部分 State 的边界 |
| Rendering Lists | 核对 sibling 作用域、稳定 key、index、随机 key 和 key 不进入 props |

官方页面的可复现原文锚点已记录在“官方来源卡”和各结论表格中。固定版本源码、Fiber 字段、协调器
函数名、卸载顺序和 DOM diff 的内部步骤不作为公共合同；本记录只采用 React 官方公开文档明确说明
的行为。

## 版本说明

### 官方版本口径

React 官方 `versions` 页面把 `19.2` 标为 latest version，并说明文档在同一 major 内持续更新，不
为每个 minor 或 patch 发布独立文档版本。因此本记录写作“React 官方文档 19.2，核验于 2026-08-16”，
不声称存在独立的 `19.2.8` 官方文档快照。

### 公共行为与内部实现

“State 与 render tree 位置关联”“同位置同类型保留”“不同类型或 key 改变重置”是官方公开教学规则，
可以作为课程心智模型。实现未来可以调整，但课程不应依赖 Fiber 节点字段、协调器遍历顺序或未公开
生命周期顺序。

## 官方来源卡

| ID | 官方来源 | URL 与锚点 | 支撑的结论 |
| --- | --- | --- | --- |
| `react-versions` | React Versions | https://react.dev/versions#latest-version | 当前 latest 为 `19.2`；文档按 major 维护，不为每个 minor/patch 发布独立版本。 |
| `react-preserving-position` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#state-is-tied-to-a-position-in-the-tree | State 由 React 保存，并按组件在 render tree 中的位置关联。 |
| `react-preserving-same` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state | 同一位置的同一组件类型保留 State；React 看返回树而不是 JSX 条件写法。 |
| `react-preserving-different` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state | 同一位置换成不同组件类型会销毁旧 State；不同类型会重置整个子树。 |
| `react-preserving-nested` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#pitfall | 父组件内部定义组件函数会每次 render 产生不同函数类型，导致 State 重置；组件应在顶层定义。 |
| `react-preserving-key` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key | key 可用于任意组件；key 是 position 的一部分；不同 key 的组件不共享 State。 |
| `react-preserving-form` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key | `Chat key={to.id}` 会在收件人改变时从头创建 Chat 及其子树，并重新创建 DOM。 |
| `react-state-memory` | State: A Component's Memory | https://react.dev/learn/state-a-components-memory#state-is-isolated-and-private | 同一组件渲染在两个位置时，各实例拥有隔离、私有的 State。 |
| `react-use-state-key` | `useState` Reference | https://react.dev/reference/react/useState#resetting-state-with-a-key | 改变 key 会从头重建组件和全部 children；递增 `version` 可表达确定性的表单重置。 |
| `react-effect-reset` | You Might Not Need an Effect | https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes | 整树身份改变时使用 key；逐层 Effect 清空会先渲染旧值再二次渲染，局部调整是另一种取舍。 |
| `react-list-keys` | Rendering Lists | https://react.dev/learn/rendering-lists#rules-of-keys | key 只需在 siblings 中唯一且不能随 render 改变；index 和随机 key 会导致错配或重建；key 不进入 props。 |

## 官方事实

### 1. State 由 React 保存，并绑定到 render tree 的位置

React 官方说明，开发者容易以为 State“住在”组件函数内部，但实际由 React 保存。React 根据组件在
render tree 中所处的位置，把每一份 State 关联到正确的组件实例。

这里的位置是树结构地址：某个节点相对于父节点是第几个孩子、它的父级结构是什么，以及该节点的
组件类型是什么。它不是 JSX 文件的行号，不是变量名，不是函数调用的 JavaScript 栈位置，也不是
浏览器经过 CSS 布局后的像素坐标。

这条事实是后续所有保留与重置判断的基础。看到一个输入框仍出现在同一块屏幕区域，不能直接推出
它仍是同一个 State 实例；必须比较前后返回树的结构和类型。

### 2. 同一组件渲染在不同位置时，State 各自隔离

React 官方的 State 教程说明，同一个组件渲染两次时，每个屏幕实例都拥有完全隔离的 State。两个
`<Counter />` 组件类型相同，但如果分别位于父组件的第一个和第二个子位置，点击其中一个不会改变
另一个。

因此“组件类型相同”不等于“共享 State”。类型必须和位置一起判断；State 也不会因为复用了同一个
组件函数、同一个 JSX 表达式或同一个显示文字而自动共享。

### 3. 同一位置继续渲染同一组件类型时，默认保留 State

只要前后 render 在同一父级位置继续呈现相同组件类型，React 会保留该位置的局部 State。父组件因
自身 State 更新而重新 render，不会自动让位置上的子组件从初始值开始。

例如 `Counter` 的 `person`、颜色或显示文本发生改变，只要 `Counter` 仍在相同树位置，计数 State
仍属于同一个实例。保留是默认规则，不需要复制旧 State，也不需要用 Effect 把旧值同步到新 render。

### 4. Prop 改变不是默认身份改变

React 官方示例在相同位置给 `Counter` 传入不同 `isFancy` 或不同 `person`，计数仍然保留。Prop 是
传给组件的数据，不是默认的组件身份键。

这意味着从 `customer={alice}` 切换为 `customer={bob}`，如果组件类型和位置都没有改变，编辑器中的
未提交草稿可能继续存在。该结果并非 React 自动判断“两个客户相同”，而是默认身份规则没有收到显式
的身份变化信息。

### 5. JSX 条件写法和源码行号不决定身份

官方明确指出，React 关心的是最终返回的 UI 树，而不是条件写在函数的哪一行。以下两种写法都可以
让 React 在同一父级位置看到同一个 `Counter`：

```tsx
/** 在同一树位置根据属性切换 Counter 的显示方式。 */
function ScorePanel({ enabled }: { enabled: boolean }) {
  return <div>{enabled ? <Counter tone="strong" /> : <Counter tone="quiet" />}</div>
}
```

```tsx
/** 在两个 return 分支中返回结构相同的 Counter。 */
function ScorePanelWithReturns({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return <div><Counter tone="strong" /></div>
  }
  return <div><Counter tone="quiet" /></div>
}
```

两次返回树都可以被描述为“根节点的第一个子节点是 `div`，它的第一个子节点是 `Counter`”。因此
条件分支的源码位置变化不是重置 State 的理由。这个“变量名和 JSX 行号不是身份”的说法是对官方
返回树规则的课程化推导，不是 React 单独定义的 API 名称。

### 6. 从 render tree 移除组件会销毁 State

官方示例让第二个计数器暂时不再渲染，然后再次添加。组件从树中移除时，React 丢弃该位置的 State；
之后重新添加时，即使组件类型相同，也会创建新实例并使用初始化值。

“不渲染”与“仍挂在树中但视觉上不可见”不是同一件事。本课只讨论条件渲染造成的树移除，不把隐藏、
缓存、路由保留或 Activity 等其他机制混为一谈。

### 7. 同一位置换成不同组件类型会重置 State

如果一个位置上一轮是 `Counter`，下一轮是 `<p>` 或另一个 React 组件，React 会移除原来的 `Counter`
并销毁其 State。之后切回 `Counter` 时，React 创建的是新实例，旧计数不会自动恢复。

“组件类型”包括宿主元素类型和 React 组件函数类型。不能只比较它们是否都显示在同一块卡片、是否都
有相同的文字，必须比较返回树中对应节点的类型。

### 8. 祖先类型变化会重置祖先下的整个子树

即使叶子仍然叫 `DraftField`，如果它的祖先从 `section` 换成 `div`，旧祖先节点被移除时，祖先下的
子树也会被重置。叶子组件名字相同不能跨越已被替换的祖先继承 State。

这个规则解释了一个常见误判：开发者只搜索条件两侧是否都有 `<Input />`，却没有比较 Input 上方的
包装结构。身份检查必须从目标 State 向上检查，找到第一个被移除或类型改变的祖先。

### 9. 父组件内嵌套定义的组件函数会产生不稳定类型

React 官方的 Pitfall 示例在父组件函数内部声明 `MyTextField`。父组件每次 render 时都会执行该声明，
得到一个新的函数对象。虽然函数名和 JSX 位置相同，React 收到的组件类型已经不同，于是重置该位置
以及其下方的 State。

错误写法：

```tsx
/** 错误示例：父级每次 render 都会重新创建 DraftField 类型。 */
function Editor() {
  /** 错误示例：不要在组件内部定义组件函数。 */
  function DraftField() {
    const [text, setText] = useState('')
    return <input value={text} onChange={(event) => setText(event.currentTarget.value)} />
  }

  return <DraftField />
}
```

正确写法是把组件放到模块顶层，通过 Prop 传入需要的数据：

```tsx
interface DraftFieldProps {
  initialValue: string
}

/** 在模块顶层声明稳定的草稿字段组件类型。 */
function DraftField({ initialValue }: DraftFieldProps) {
  const [text, setText] = useState(initialValue)
  return <input value={text} onChange={(event) => setText(event.currentTarget.value)} />
}

/** 通过普通 Prop 向稳定组件传递父级数据。 */
function EditorShell() {
  return <DraftField initialValue="" />
}
```

### 10. key 可以成为位置身份的一部分

React 官方强调，key 不只用于列表。默认情况下，React 可以按同一 parent 中的顺序识别“第一个”或
“第二个”组件；给组件指定 key 后，key 会成为位置身份的一部分。

同一 JSX 位置中的两个分支可以使用不同 key：

```tsx
/** 用业务身份区分同一视觉位置上的两个计分实例。 */
function Scoreboard({ isPlayerA }: { isPlayerA: boolean }) {
  return isPlayerA
    ? <Counter key="Taylor" person="Taylor" />
    : <Counter key="Sarah" person="Sarah" />
}
```

当 key 从 `Taylor` 改为 `Sarah` 时，React 不再把它们当成同一个默认位置实例。旧 key 的 State 被销毁，
新 key 的 State 按初始化值创建；再次切回 Taylor 也不会自动恢复之前的 Taylor State，因为旧身份已经
被移除，而不是被 React 作为历史缓存保存。

### 11. key 改变会重建 key 边界及全部后代

React `useState` Reference 明确说明，改变 key 会让组件从头重建，包含它的全部 children。官方表单示例
进一步说明，`<Chat key={to.id} contact={to} />` 在收件人变化时会重建 Chat 及其树下的 State，并重新
创建 DOM 元素，而不是复用旧 DOM。

因此 key 不是只清理根组件某一个字段的 API。key 放在哪个节点，哪个节点及其后代就成为一起重建的
边界；边界外的 State 不因为内层 key 改变而自动清空。

### 12. key 的作用域是同一父级的 siblings

官方明确说明 key 不要求全局唯一，只需在同一个 parent 的兄弟节点中区分节点。同一 key 可以在不同
父级或不同数组中重复使用，因为它们属于不同的身份作用域。

这条规则不等于“任何重复 key 都没问题”：同一 parent 的 siblings 仍必须使用能区分它们的稳定 key。
课程只把该范围作为身份模型的一部分，不展开列表排序、插入和删除的协调细节。

### 13. key 必须稳定，不能在 render 中随机生成

React 官方列表文档说明，key 不能在 render 时不断变化。`Math.random()`、当前时间或 render 计数会让
前后 key 永远无法匹配，组件和 DOM 会被反复重新创建，用户输入也会丢失。

数组 index 只能表示“当前顺序中的位置”，当列表插入、删除或重排时，同一 index 可能指向另一条数据，
从而把 State 或 DOM 匹配给错误项。稳定数据 ID 比 index 更能表达对象身份。此处只取证身份连续性，
不把列表 key 作为独立课程主线。

### 14. key 是 React 的特殊提示，不是普通 prop

官方列表文档明确说明，组件不会收到 `key` prop。若组件需要读取业务 ID，必须显式传递普通 prop：

```tsx
/** 让 React 使用 key 区分身份，同时让组件通过普通 prop 读取业务 ID。 */
function ProfilePage({ userId }: { userId: string }) {
  return <Profile key={userId} userId={userId} />
}

/** 业务组件通过 userId 读取数据，而不是读取 props.key。 */
function Profile({ userId }: { userId: string }) {
  return <p>当前用户：{userId}</p>
}
```

`key` 控制 React 如何匹配组件，`userId` 才是组件业务合同的一部分。把两个概念混写会造成 ID 为
`undefined`、提交对象错误或调试信息缺失。

### 15. key 表单重置适用于概念身份改变

官方 `Chat` 示例中，切换收件人时不加 key 会保留输入；这可能让用户把给 Alice 写的草稿误发给 Bob。
将 `to.id` 作为 `Chat` 的 key 后，React 会把两个收件人视为两个独立的编辑组件，切换时清空输入。

这不是“key 让输入框刷新”的通用技巧，而是把“收件人变了，所以编辑实例也变了”明确写入组件身份。
客户、档案、文档等同类场景必须先确认业务上确实是不同编辑实例，再选择稳定 ID。

### 16. 重置全部 State 与调整部分 State 是两种决策

React 官方 “You Might Not Need an Effect” 对两种情况作了区分：

- 如果整个组件树都属于新的概念身份，可以在内部组件上使用新的 key，让整棵子树自动重建。
- 如果只需要调整一个选择或一个字段，不应为了方便而重建包含无关 State 的整棵子树；可以在事件中更新
  目标 State，或在 render 中计算派生值。

逐层用 Effect 清空整棵树会先把旧值 render 出来，再触发下一次 render，而且每个嵌套组件都要重复维护。
这条证据只用于明确取舍，不展开 Effect API。

## 课程推导

以下内容是基于官方公开规则的教学推导，必须在正文中和“官方事实”区分，不应写成 React 内部 API。

### 1. State 保留/重置的检查顺序

遇到输入、计数或展开状态意外保留或重置时，按下面顺序比较前后两棵返回树：

1. 找到拥有目标 State 的组件。
2. 从该组件向上确认父级结构是否仍存在。
3. 比较目标组件在相同父级中的结构位置。
4. 比较该位置的组件类型是否相同。
5. 若没有显式 key，位置与类型都匹配则默认保留；节点移除或类型改变则创建新实例。
6. 若有 key，再比较同一父级作用域中的 key；key 改变表示新的身份。
7. 若目标节点名字没变仍重置，检查第一个类型改变或被移除的祖先，以及是否存在嵌套组件定义。

### 2. “同一个业务对象”与“同一个 React 实例”不是同一个问题

React 的默认规则只能依据返回树的位置和类型匹配组件。它不会从 `person`、`customer` 或 `documentId`
等 Prop 自动推断业务语义。产品需要先回答：切换数据后，用户是否仍在编辑同一个概念对象？

- 如果仍是同一编辑实例，只更新 Props，保留草稿和局部 State 通常是合理的。
- 如果是另一个客户、收件人、档案或文档，需要让编辑器身份随稳定 ID 改变，避免旧草稿进入新对象。
- 如果只是明确的“重新开始”按钮，可以使用递增的 `version` 表达一次确定性的重置命令。

### 3. key 是身份合同，不是通用刷新按钮

稳定 `customer.id` 的变化表达“业务对象变了”；稳定递增 `version` 的变化表达“用户请求重新初始化”。
随机 key、时间戳和每次 render 改变的计数没有稳定语义，会把正常更新误变成组件和 DOM 的持续重建。

key 也不是缓存。切换 `Taylor` 到 `Sarah` 再切回 Taylor 时，之前的 Taylor State 不会因为 key 文本相同
就自动恢复；旧 Taylor 身份已经被销毁，新 Taylor 身份需要再次初始化。

### 4. key 边界必须与状态所有权边界一致

如果草稿、校验提示和子表单都属于同一个客户编辑实例，key 可以放在编辑器子树根部；如果导航、客户
列表选择或跨客户筛选器应保留，就不能把 key 放到它们共同的祖先上。

key 越靠上，重建范围越大。课程示例应同时展示“key 边界内重置”和“边界外继续保留”，让学习者知道
key 的作用范围，而不是把整个页面作为刷新对象。

### 5. 表单初始值只在新实例建立时读取

`useState(initialValue)` 的初始值用于建立该组件实例。对于同一位置同一类型的已存在实例，后续 Prop
改变不会自动重新读取初始值；这正是“未加 key 的编辑器保留旧草稿”的来源。

改变 key 会创建新实例，新实例才会按当前 Prop 重新读取初始值。若表单草稿必须跨对象切换保留，不能
只依赖 key；草稿应由更高层的明确所有者按对象 ID 建模，再传给编辑器。这里不指定外部 Store 或具体
状态库，只说明 key 重置与草稿持久需求互相冲突时必须先澄清数据归属。

### 6. “保留”通常是默认选择，“重置”必须有业务理由

React 官方指出默认保留通常正是开发者想要的行为。保留适用于：

- 同一对象的标签、样式、排序或辅助 Prop 改变；
- 条件只改变展示内容，返回树的位置和类型连续；
- 用户暂时切换面板但仍希望返回时看到未提交草稿；
- 只需清空一个字段，其他局部 State 仍属于当前编辑实例。

重置适用于：

- 切换到概念上完全不同的编辑对象；
- 用户明确点击“重新开始/重置表单”；
- 子树内多个局部 State 必须同时回到新对象初始值。

“用户看到了不同名称”不是充分理由；必须有清晰的身份或产品行为合同。

## 结果矩阵

| 前后变化 | 位置/类型/key 判断 | State 结果 | 教学结论 |
| --- | --- | --- | --- |
| 同位置 `Counter`，只改变 Prop | 位置相同、类型相同、无 key 变化 | 保留 | Prop 描述数据，不自动改变身份 |
| 条件表达式两侧都返回同位置 `Counter` | 返回树匹配 | 保留 | JSX 行号和分支写法不是身份 |
| 两个并列 `Counter` | 类型相同但位置不同 | 各自独立 | 类型相同不等于共享 State |
| 条件为假，节点从树中移除 | 旧位置消失 | 销毁；重新添加时初始化 | 不渲染不是暂时冻结实例 |
| `Counter` 改成 `p` | 位置相同但类型不同 | 旧 State 销毁 | 视觉位置不能替代类型匹配 |
| `section > DraftField` 改成 `div > DraftField` | 祖先类型变化 | 整个子树重置 | 从目标向上检查祖先 |
| 父组件内部重新声明 `DraftField` | 函数类型每次变化 | 该位置及后代重置 | 组件函数放在模块顶层 |
| 同位置 `key="A"` 改成 `key="B"` | key 身份变化 | key 边界及后代重建 | key 是显式身份，不是刷新按钮 |
| 同 parent 的 sibling 使用相同 key | 作用域内不唯一 | 匹配不可靠并产生警告/错误 | key 只需 sibling 内唯一 |
| key 每次 render 生成随机值 | key 永远不匹配 | 组件/DOM 反复重建 | 使用稳定数据 ID 或明确版本 |
| 只清空一个字段却给页面祖先换 key | 重建边界过大 | 无关 State 一并丢失 | 事件中更新目标 State |

## 合并、保留、删除与边界建议

### 1. 从“位置身份”研究中保留

- State 由 React 保存，并与 render tree 位置关联。
- 同位置同类型保留、不同位置独立、移除后重新初始化。
- Prop、变量名、条件表达式和 JSX 源码行号不单独决定身份。
- 组件类型改变、祖先类型改变和嵌套定义函数导致子树重置。
- 用相同的树对照解释默认保留与默认重置。

### 2. 从“key 重置”研究中保留

- key 可以作用于普通组件，不只用于 `map` 列表。
- key 是父级 sibling 作用域中的位置身份组成部分。
- key 改变会重建组件、后代 State 和相关 DOM。
- `customer.id`、`userId` 等稳定业务身份适合编辑器边界；业务 ID 另作为普通 prop 传递。
- 使用 key 重置表单必须说明整棵子树都会重置，以及什么时候应保留而不是重置。
- 随机 key、时间戳、render 计数和不稳定 index 的身份风险必须保留为高频错误。

### 3. 合并时删除的重复内容

- 两份研究中重复的“同位置同类型保留”“不同类型重置”“Prop 不自动重置”只保留一份统一解释。
- 同一表单切换场景不重复作为两门课程；用一个“保留对照”和一个“key 重置对照”同时说明默认规则
  与显式身份。
- Effect 只保留整树重置的边界结论，不加入 Effect 清理教程、依赖数组或生命周期细节。
- 列表只保留 key 作用域、稳定 ID、index 和随机值的身份风险，不加入排序算法或列表性能课程。
- 不把旧课实现日志、浏览器视口、哈希、构建命令、审查结果、课程批次或生产状态写进知识合同。

### 4. 不应并入本课的知识点

- State 结构、派生值、提升 State、受控/非受控组件已有独立知识边界。
- Reducer、Context、Effect、Ref、缓存、路由、外部 Store 和持久化都有各自的公共规则。
- DOM 节点复用、Fiber 字段和协调器遍历属于内部实现，不作为本科课程公共合同。

## 高风险易错点

每个错误在课程正文中应包含触发条件、原因、后果、错误示例、正确方向和可观察验证；下面只冻结最
值得教学的错误，不为凑数量拆分同一个问题。

### 1. 以为 State 存在组件函数或 JSX 变量里

- 触发：复用同一组件函数或 JSX 表达式，期待多个位置共享一份 State。
- 原因：忽略 React 按树位置保存 State。
- 后果：并列实例互不影响，移除后重新添加却从初始值开始。
- 正确方向：先按位置识别组件实例；需要共享时使用已经定义好的状态所有者模型，不在本课扩展实现。
- 来源：`react-preserving-position`、`react-state-memory`。

### 2. 按 JSX 行号或条件分支判断身份

- 触发：条件两侧都写 `<Counter />`，却认为换了源码位置就会重置。
- 原因：React 比较前后返回树，不比较条件写法。
- 后果：切换分支后计数或输入仍保留，产品意图与默认行为不一致。
- 正确方向：比较父级位置和组件类型；若需要显式身份，使用稳定 key 并说明其边界。
- 来源：`react-preserving-same`。

### 3. 只改变对象 Prop，期待 State 自动重置

- 触发：从 `customer={alice}` 切换到 `customer={bob}`，没有改变位置身份。
- 原因：Prop 值不是默认身份键。
- 后果：Alice 的未提交草稿可能显示在 Bob 的编辑器中。
- 正确方向：先确定这是保留同一编辑实例，还是应使用 `key={customer.id}` 创建新的编辑实例。
- 来源：`react-preserving-same`、`react-preserving-form`。

### 4. 不渲染组件后期待恢复原 State

- 触发：使用 `visible && <DraftField />` 隐藏组件，再显示时期待输入仍在。
- 原因：条件为假时节点从 render tree 移除，旧 State 已销毁。
- 后果：重新显示后输入、计数和选择回到初始化值。
- 正确方向：若需求是隐藏但保留，不能把“移除”当成“保留实例”；应重新建模显示和状态的边界。
- 来源：`react-preserving-position`。

### 5. 只看叶子组件同名，忽略祖先类型改变

- 触发：两侧都包含 `DraftField`，但上层 `section` 与 `div` 发生替换。
- 原因：祖先被移除时，其整棵子树一起被销毁。
- 后果：叶子输入意外重置。
- 正确方向：沿组件树向上比较第一个结构变化点，而不是只搜索目标组件名。
- 来源：`react-preserving-different`。

### 6. 在父组件内部定义有 State 的子组件

- 触发：父组件无关 State 更新后，嵌套输入内容消失。
- 原因：每次 render 创建新的子组件函数类型。
- 后果：子树重建、用户输入丢失，并产生不必要的重建成本。
- 正确方向：组件函数放在模块顶层，通过 Props 传递数据。
- 来源：`react-preserving-nested`。

### 7. 以为 key 只重置根组件，不影响 children

- 触发：给编辑器根组件换 key，却期待备注、校验提示和嵌套输入继续保留。
- 原因：key 改变会从头创建组件和全部 children。
- 后果：重置范围比预期更大。
- 正确方向：把 key 放在真正的身份根部；边界内状态一起重置，边界外状态才继续保留。
- 来源：`react-use-state-key`、`react-preserving-form`。

### 8. 每次 render 生成随机或时间 key

- 触发：`key={Math.random()}`、`Date.now()` 或 render 计数作为普通组件 key。
- 原因：前后 render 永远得不到可匹配的身份。
- 后果：每次更新都重建组件和 DOM，输入丢失。
- 正确方向：使用稳定的业务 ID；若用户明确请求重新开始，使用只在该事件改变的递增版本。
- 来源：`react-list-keys`、`react-use-state-key`。

### 9. 把 key 当成全局主键或从 props 读取 key

- 触发：不同父级使用相同 key 被误认为冲突，或在组件中读取 `props.key`。
- 原因：key 只在同一 parent 的 siblings 中参与匹配，也不会进入普通 props。
- 后果：生成不必要的全局命名空间，或得到 `undefined` 的业务 ID。
- 正确方向：在 sibling 作用域内保持稳定唯一，同时显式传递 `id`、`userId` 或对象 prop。
- 来源：`react-preserving-key`、`react-list-keys`。

### 10. 把 key 当成每个业务对象的历史缓存

- 触发：Taylor -> Sarah -> Taylor 后，期待 Taylor 的旧输入自动回来。
- 原因：旧 key 被移除时其 State 被销毁，React 不把它保存为业务缓存。
- 后果：把一次性组件身份误解为多对象草稿仓库。
- 正确方向：若草稿必须按对象保留，应由更高层按对象 ID 明确拥有和存储草稿，key 只能表达是否重建。
- 来源：`react-preserving-key`、`react-preserving-form`；“不能作为缓存”是对销毁/创建事实的课程推导。

### 11. 只想清空一个字段却替换过高的 key 边界

- 触发：清空搜索框时给页面或工作区祖先换 key。
- 原因：key 会重建该节点及所有后代。
- 后果：导航、筛选器和无关编辑状态一起丢失。
- 正确方向：事件中直接更新目标字段；只有整棵子树确实属于新身份时才改变 key。
- 来源：`react-effect-reset`、`react-use-state-key`。

### 12. 只因为名称变了就强制重置

- 触发：标签、显示名、语言或排序变化时立即增加 key。
- 原因：把展示数据变化误当成概念身份变化。
- 后果：用户本应保留的草稿和交互状态被清空。
- 正确方向：先判断用户是否仍在编辑同一个对象；同一实例只更新 Prop，保持默认 State 连续性。
- 来源：`react-preserving-same`；“同一对象”的判断属于课程数据建模推导。

## 建议正文的最小示例范围

课程正文可以用四个互相独立、可观察的 TSX 示例覆盖全部主线：

1. **同位置同类型保留：** 切换 `person` Prop，先增加计数，再观察计数保留。
2. **移除与类型变化重置：** 分别演示条件移除后重新添加、同一位置从 `Counter` 换成 `p` 后再切回。
3. **祖先与组件类型稳定性：** 演示包装元素类型改变和嵌套定义组件函数的错误原因；推荐组件放在顶层。
4. **表单保留与 key 重置对照：** 同一 `Editor` 分别使用普通 Prop 和稳定 `key={customer.id}`，说明
   key 边界内的 State 与 DOM 一起重建，`customerId` 仍通过普通 prop 传入。

示例代码只使用 `useState`、条件渲染、普通 Props 和 key，不加入请求、Effect、Reducer、Context、Ref、
缓存或外部 Store。每个函数定义上方写简体中文职责注释；运行代码和展示源码应保持同源。

## Demo 建议

建议使用一个组合 Demo，同时提供“默认保留”和“显式重置”两组可观察对照；不要把两个旧主题各自
复制成重复的 Demo。

1. **同位置保留区：** 一个计数器或短表单只切换普通 Prop。用户先输入或增加计数，再切换显示名称，
   结果仍保留。
2. **移除/类型区：** 一个子组件可被移除并重新添加；另一个控件在同一位置切换宿主元素或组件类型，
   结果从初始值重新建立。
3. **key 表单区：** 同一客户选择器下并列展示“无 key”和 `key={customer.id}` 两个编辑器。切换客户
   后，无 key 版本保留旧草稿，key 版本回到新客户的初始值；同时显示说明 key 边界内的子状态会一起重建。
4. **边界提示：** 业务 ID 作为普通 `customerId` 或对象 Prop 传入；不要在运行 Demo 中放置随机 key、
   嵌套组件定义、Effect 清空或错误用法按钮。嵌套定义可以留在正文静态错误示例中。

Demo 的源码应从一个实际运行的 TSX 文件读取并展示，交互只改变本知识点相关的 State。验证重点是输入
值、计数值和 key 对照的 DOM 身份是否符合预期，而不是展示内部协调器细节。

## 适用边界与数据建模

### 应保留 State

- 同一个客户/文档/会话编辑实例只改变显示属性、排序、标签或校验方式。
- 条件两侧返回相同结构和类型，用户希望切换回来继续编辑。
- 只需要清空一个字段或调整一个选择，其他 State 仍属于当前实例。
- 暂时隐藏视图但产品要求返回后保留草稿；此时不能把从树中移除误当成保留。

### 应使用 key 重建边界

- 切换到概念上独立的客户、收件人、档案或文档编辑实例。
- 整棵局部表单的 State 都必须由新对象初始数据建立。
- 用户明确点击“重新开始”或“重置全部”，并且重置边界已定义。
- 有稳定业务 ID，或有只在明确重置事件中变化的递增版本。

### 不应使用 key 代替数据建模

- 需要同时保留多个对象的未提交草稿；key 不提供按对象保存的历史 State。
- 只有少数字段需要调整；整树重建会造成不必要的数据丢失。
- key 值来自随机数、时间、render 次数或会不断改变的显示文本。
- 需要跨页面、刷新或会话持久化；这属于明确的数据所有权和持久化问题，不是 key 的能力。
- 业务 ID 可能重复、不稳定或尚未确定；应先解决对象身份，再决定组件身份边界。

## 研究验收矩阵

| 验收项 | 一手来源 | 结论状态 |
| --- | --- | --- |
| State 由 React 保存并绑定到 render tree 位置 | `react-preserving-position` | 已核对 |
| 同位置同类型保留，Prop 和 JSX 分支不单独重置 | `react-preserving-same` | 已核对 |
| 不同位置的同类型实例 State 隔离 | `react-state-memory` | 已核对 |
| 移除后重新添加从初始值开始 | `react-preserving-position` | 已核对 |
| 同一位置不同类型重置整个子树 | `react-preserving-different` | 已核对 |
| 祖先类型变化影响整棵子树 | `react-preserving-different` | 已核对 |
| 嵌套组件函数导致每次 render 类型改变 | `react-preserving-nested` | 已核对 |
| key 可用于普通组件并成为位置的一部分 | `react-preserving-key` | 已核对 |
| key 改变重建 State、children 和 DOM | `react-preserving-form`、`react-use-state-key` | 已核对 |
| key 只在 parent siblings 中要求唯一 | `react-preserving-key`、`react-list-keys` | 已核对 |
| key 不进入 props | `react-list-keys` | 已核对 |
| 整树重置与局部调整的边界 | `react-effect-reset` | 已核对 |
| React 官方最新文档版本为 19.2 | `react-versions` | 已核对 |

## 参考资料

1. [React Versions](https://react.dev/versions#latest-version) - 官方版本口径和 major/minor/patch 文档规则。
2. [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - 位置、类型、条件分支、移除、嵌套定义、key 和表单重置。
3. [State: A Component's Memory](https://react.dev/learn/state-a-components-memory#state-is-isolated-and-private) - 同一组件不同位置的 State 隔离。
4. [`useState`](https://react.dev/reference/react/useState#resetting-state-with-a-key) - key 改变时从头创建组件及其 children。
5. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes) - 整树重置与局部 State 调整的取舍。
6. [Rendering Lists](https://react.dev/learn/rendering-lists#rules-of-keys) - sibling 作用域、稳定 key、index、随机 key 和 key prop 边界。

## 课程范围结论

位置身份、类型匹配、State 默认保留、移除/替换重置、key 显式身份和表单重置共同组成一个完整的
“State 保留与重置”知识点，不需要拆成两门互相重复的课。列表只作为 key 作用域和稳定性的证据边界；
Effect、Reducer、Context、外部状态和持久化不应被带入正文。完成本课时，学习者应能根据前后 render
tree 和业务身份判断 State 应保留、局部调整还是重建整棵子树。
