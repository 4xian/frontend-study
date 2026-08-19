# 使用 key 重置 State 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.resetting-state-with-key`
- 标题：使用 key 重置 State
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 官方文档基线：React `19.2`
- 仓库依赖基线：`react@19.2.8`、`react-dom@19.2.8`

本课只建立一条主线：`key` 如何把业务身份显式纳入组件位置，使 React 在 key 改变时把旧局部
State 子树视为旧实例并重建新实例。重点是对象或表单切换时的编辑状态边界，不是列表性能或状态
管理 API 的综合介绍。

必须覆盖：

1. 默认同位置、同组件类型会保留 State；`key` 可以显式改变这条身份判断。
2. 稳定的业务身份（例如 `customer.id`）作为 key 时，切换对象会重置该 key 边界内的局部 State。
3. key 改变会让旧组件及其全部子树重新创建，旧 State 和旧 DOM 不作为新树的复用对象。
4. 表单编辑器是高价值用例：切换收件人、客户或档案时，不能把上一个对象的未提交草稿带到下一个对象。
5. 稳定 key 与随机 key、数组索引 key 的身份风险必须区分；列表只讲与身份连续性直接相关的边界。
6. key 重置整棵子树与手动清空少量 State 是不同取舍，不能把 key 当作所有局部清空需求的通用替代。

明确排除：`useReducer`、Action、Context、Effect 清理生命周期、复杂列表优化、请求、Ref、缓存、
路由、外部 Store 和持久化。Effect 只作为“不要为了整树重置而逐层手动清空”的边界反例，列表只
覆盖稳定 ID、兄弟作用域、index 和随机 key 的必要身份风险。

## 调研问题与边界

1. 默认位置身份为什么会让同一编辑组件保留上一个对象的输入？
2. `key` 改变时，React 把 key 加到哪一个身份判断中？
3. 为什么同一 JSX 位置的两个不同 key 会是两个不会共享 State 的组件？
4. key 改变会重建组件自身，还是会重建它下面的完整子树和 DOM？
5. 为什么 `customer.id` 适合做编辑器 key，而显示名称、随机值或数组索引不稳定？
6. key 作用域为什么是同一 parent 的 siblings，而不是全局？
7. 为什么 `key` 不会进入组件的 props，需要另传 `id` 或 `customer`？
8. 什么时候应使用 key 重置整棵局部子树，什么时候只在事件处理中清空少数 State？
9. 如何用同一个源文件、DOM 身份和输入值证明 key 导致的是重建而非手动同步？
10. 本课是否仍是一个知识点，还是需要拆出列表 key 或表单状态管理课程？

研究边界固定为“显式组件身份与局部 State 重建”。列表 key 只用于说明稳定身份和错误重建，不能
扩展成列表协调、排序算法或性能优化课程。表单 Demo 只比较保留与重置两条路径，不引入 Effect、
Reducer、Context、Ref、请求或随机值。

## 研究方法与证据边界

1. 外部搜索严格使用 Tavily，完成 8 组 `tavily_search`，8/8 返回可靠的 `react.dev` 候选；未切换
   Exa、Parallel、Perplexity 或原生 Web 搜索。
2. 主流程完成 4 批 `tavily_extract`，涉及 6 个官方 URL，6/6 返回 `Raw Content`；后台只读复核
   完成 5 组 Tavily 查询与 4/4 个主 URL 抽取成功。两路证据均只用于发现和交叉检查。
3. 搜索摘要和社区页面不支撑结论。所有采用事实都回到 React 官方 `.md` 原文，并用
   `curl -L --fail --silent --show-error` 直接核验 8 个已知官方 URL，8/8 成功。
4. Tavily 抽取的 `Content` 字段显示为 `undefined`，但每批均返回对应 `Raw Content`；官方 `.md`
   标题、段落、代码和锚点均可读取。
5. React 官方版本页当前标记 `Latest version: 19.2`，并说明文档按 major 维护，不为每个 minor 或
   patch 发布独立文档。仓库精确依赖是 React / React DOM `19.2.8`。
6. RC2 计划文件的标题行仍写 TypeScript `7.0.2`，而当前 `package.json` 与 lockfile 为
   TypeScript `~6.0.0`、实际 `6.0.3`；这属于既有 staged 基线差异，与本课 key 公共语义无关，
   本记录不修改它，也不把它伪装成 React 文档版本。
7. “key 改变会重建旧边界”是 React 官方公开用法；本记录不把 Fiber 字段、协调器函数名、DOM
   diff 步骤或未公开生命周期顺序写成公共承诺。

## Tavily 查询日志

### Search

| ID | Tavily query | 官方候选与用途 | 结果 |
| --- | --- | --- | --- |
| Q1 | `site:react.dev/learn/preserving-and-resetting-state "Resetting state with a key" official React` | `Preserving and Resetting State`、`useState`、`Managing State`；发现 key 重置与表单边界 | 成功 |
| Q2 | `site:react.dev/learn/preserving-and-resetting-state "Resetting a form with a key" contact chat official React` | `Preserving and Resetting State`；发现 Chat/contact 编辑状态 | 成功 |
| Q3 | `site:react.dev/reference/react/useState "Resetting state with a key" recreate component children from scratch` | `useState`；发现 Form 与全子树重建 | 成功 |
| Q4 | `site:react.dev/learn/you-might-not-need-an-effect resetting all state when a prop changes key official React` | `You Might Not Need an Effect`；发现整树与局部调整取舍 | 成功 |
| Q5 | `site:react.dev/learn/rendering-lists key index random Math.random input lost official React` | `Rendering Lists`；发现稳定 ID、index、随机 key 风险 | 成功 |
| Q6 | `site:react.dev/versions React official latest version 19.2` | `React Versions`；发现文档版本基线 | 成功 |
| Q7 | `site:react.dev/learn/rendering-lists "Do not generate keys on the fly" index random` | `Rendering Lists`；复核规则和错误后果 | 成功 |
| Q8 | `site:react.dev/versions "19.2" "Latest Version"` | `React Versions`；复核 latest 版本 | 成功 |

后台只读复核补充了以下 5 组等价查询：`site:react.dev learn preserving and resetting state key reset
form chat contact`、`site:react.dev learn rendering lists random keys index key pitfalls`、
`site:react.dev key reset state manual clear state form object switching`、`site:react.dev key changes
component unmount mount cleanup recreated from scratch`、`site:react.dev "Resetting all state when a
prop changes" key event handler`。5/5 成功，未改变主证据集合。

### Extract

| 批次 | URL | 结果 | 提取重点 |
| --- | --- | --- | --- |
| E1 | `https://react.dev/versions`、`https://react.dev/learn/preserving-and-resetting-state` | 2/2 成功 | 19.2、key 作为 position 一部分、Chat 子树重建 |
| E2 | `https://react.dev/reference/react/useState`、`https://react.dev/learn/managing-state` | 2/2 成功 | `Form key={version}`、整棵 children 从头创建 |
| E3 | `https://react.dev/learn/you-might-not-need-an-effect` | 1/1 成功 | `Profile key={userId}`、整树与局部 State 的取舍 |
| E4 | `https://react.dev/learn/rendering-lists` | 1/1 成功 | stable ID、sibling 作用域、index/random key 后果 |

主流程 Tavily 抽取成功率为 6/6 URL、4/4 批次；后台复核为 4/4 主 URL；合并统计为主证据 URL
10/10 抽取成功。直接官方 `.md` 核验为 8/8 URL 成功。React 官方原文包含足够的代码和锚点，未采用
第三方文章或搜索摘要。

## 官方来源卡

| ID | React 官方来源 | URL 与锚点 | 本课采用的事实 |
| --- | --- | --- | --- |
| `react-versions` | React Versions | https://react.dev/versions#latest-version | `react.dev` 是最新 React 文档；当前 latest 为 `19.2`；文档按 major 更新，不发布每个 minor/patch 独立版本。 |
| `react-preserving-key` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key | key 可让 React 区分任意组件；key 是 position 的一部分，同一 JSX 位置的不同 key 不共享 State；旧实例移除、新实例创建。 |
| `react-preserving-form` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key | `Chat key={to.id}` 使收件人切换时 Chat 及下方 State 重新创建，并重建 DOM，输入清空。 |
| `react-use-state-key` | `useState` | https://react.dev/reference/react/useState#resetting-state-with-a-key | 不同 key 会从头重建 Form 及全部 children，State 重新初始化；递增 `version` 可作为显式重置版本。 |
| `react-no-effect-reset` | You Might Not Need an Effect | https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes | key 适合整树身份变化；逐层 Effect 清空先渲染 stale 值再二次 render，且嵌套 State 需逐个处理；只调部分 State 是另一种边界。 |
| `react-list-keys` | Rendering Lists | https://react.dev/learn/rendering-lists#rules-of-keys | key 只需 sibling 内唯一且不能在 render 中变化；稳定数据 ID 优于 index；随机 key 会重建所有组件/DOM 并丢输入。 |
| `react-list-why` | Rendering Lists | https://react.dev/learn/rendering-lists#why-does-react-need-keys | key 提供比数组位置更多的身份信息；排序、插入或删除后仍能匹配同一数据项。 |

## 版本说明

### 官方文档与仓库实现

截至 `2026-08-10`，React 官方版本页的 latest 为 `19.2`，并说明同一 major 内持续更新，不为每个
minor 或 patch 发布独立文档版本。本课因此写“React 官方文档 19.2，核验于 2026-08-10”。

仓库当前依赖基线为 `react@19.2.8`、`react-dom@19.2.8`，两者来自既有 staged 变更；研究文档不
修改依赖。公共 key 规则以 React 19.2 官方文档为准，交互 Demo 未来在 19.2.8 上验证，不声称存在
`19.2.8` 独立官方文档快照。

## 官方事实

### 1. 默认身份由位置与组件类型决定

React 默认会保留前后 render tree 中相匹配的组件。相同父级位置继续渲染相同组件类型时，局部 State
会保留；只改变 Props、业务对象名称或 JSX 条件写法，不会自动创建新的 State。这个前置规则解释了
为什么不加 key 的客户编辑器会把旧草稿带到新客户。

### 2. key 可成为位置身份的一部分

React 官方说明 key 不只用于列表，也可用于任意组件。默认情况下，React 会按组件在 parent 中的顺序
判断“第一个”“第二个”；指定 key 后，React 会把 key 纳入 position。相同 JSX 位置上分别使用
`key="Taylor"` 和 `key="Sarah"`，得到的是两个不会共享 State 的 Counter。

### 3. key 改变会销毁旧 State 并创建新 State

key 改变后，旧 key 对应的组件从该身份位置移除，新 key 对应的组件在同一视觉位置创建。旧局部 State
不会迁移给新 key；每次新 key 出现时按初始化值建立 State，每次旧 key 消失时其 State 被销毁。

### 4. key 边界包含完整子树和 DOM

React `useState` 参考明确说，key 改变会从头重建组件及其全部 children。Preserving 页面进一步说明
Chat 及其树下 State 会重新创建，React 也会重新创建 DOM 元素，而不是复用旧 DOM。课程用“旧子树
卸载并新建”作为可观察表述，但不承诺内部卸载函数顺序。

### 5. 稳定业务身份适合控制编辑子树

`<Chat key={to.id} contact={to} />` 把收件人 ID 作为 Chat 树的身份。客户、收件人、档案或文档等
概念上彼此独立的编辑对象，都可以用稳定唯一 ID 表达“切换后不是同一个编辑实例”。`key` 只用于
React 身份；组件若需要读取业务 ID，仍应接收单独的 `id` 或对象 prop。

### 6. key 的作用域是 parent 的 siblings

React 官方明确说 key 不需要全局唯一，只需要在同一 parent 的 sibling 中区分节点。两个不同父级或
不同数组可以复用相同 key；把 key 当全局数据库主键会扩大约束并制造错误假设。

### 7. 列表 key 需要稳定且与数据绑定

列表中，key 让 React 在数组项插入、删除或重排后继续识别同一数据项。可变列表使用数组 index 会在
顺序变化后把 State 和 DOM 对错项；`key={Math.random()}` 让 key 每次 render 都不匹配，导致所有
组件和 DOM 反复重建并丢失用户输入。列表只在这里作为身份连续性边界，不展开复杂列表优化。

### 8. key 不是组件 props

`key` 是 React 用来匹配的特殊提示，不会作为普通 prop 传进组件。需要在编辑器中显示或提交客户 ID
时，必须同时传 `customer={customer}` 或 `customerId={customer.id}`；不能读取 `props.key`。

## 课程推导

### 1. 身份检查顺序

遇到“切换对象后旧输入还在”或“切换后整个表单清空”的问题，按以下顺序判断：

1. 先问业务对象是否概念上是同一个编辑实例。
2. 若是同一实例，只改变 Props，不增加 key，让 State 继续保留。
3. 若是不同实例，选取稳定的业务 ID 作为 key，并把 key 放在需要重置的子树根部。
4. 让业务对象另作为普通 prop 传入，避免把 key 当业务数据读取。
5. key 改变后，预期边界内的所有后代 State 和 DOM 都重新初始化；边界外 State 保留。
6. 若只需要清空少数字段，先考虑事件处理器中的显式清空或 render 时派生，不要无意重建整棵子树。

这是一套基于官方公开规则的课程检查法，不是 React 内部协调器 API。

### 2. key 是身份合同，不是刷新按钮

稳定 `customer.id` 的变化表示“这是另一个客户的编辑实例”；递增 `version` 表示“用户明确请求重置
当前 Form”。两者都应只在语义确实变化时改变。随机 key、当前时间或 render 计数不是稳定身份，不能
把它们当通用刷新按钮。

### 3. key 边界要包住需要一起重置的状态

如果草稿、选中标签和本地校验提示都属于客户编辑器，key 应放在编辑器子树根部；如果页面导航或客户
列表状态需要跨客户保留，则 key 不应包住它们。外层可以接收普通 `customerId`，内层由实现细节决定
key，这也符合官方 Profile 示例的 API 边界。

## 基础用法

### 1. 用稳定业务 ID 重置编辑子树

```tsx
interface Customer {
  id: string
  name: string
  email: string
}

interface CustomerEditorProps {
  customer: Customer
}

/** 编辑当前客户的联系信息，并在编辑器子树内保存未提交草稿。 */
function CustomerEditor({ customer }: CustomerEditorProps) {
  const [email, setEmail] = useState(customer.email)

  return (
    <label>
      {customer.name} 的邮箱
      <input value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
    </label>
  )
}

/** 在客户身份改变时让 React 创建新的编辑器 State。 */
function CustomerPage({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

`customer.id` 不变时，编辑器仍是同一个身份，局部输入可以保留；ID 改变时，旧编辑器及其后代重新
创建，`useState(customer.email)` 重新取新客户的初始值。`key` 不会进入 `CustomerEditor` props，
所以客户资料仍通过 `customer` 传递。

### 2. 用递增版本显式重置当前 Form

```tsx
/** 展示一个包含多个局部字段的表单子树。 */
function ContactForm() {
  const [name, setName] = useState('')

  return <input aria-label="姓名" value={name} onChange={(event) => setName(event.currentTarget.value)} />
}

/** 只在用户明确点击重置时改变 Form 的身份版本。 */
function ResettableForm() {
  const [version, setVersion] = useState(0)

  return (
    <>
      <button type="button" onClick={() => setVersion((current) => current + 1)}>
        重置
      </button>
      <ContactForm key={version} />
    </>
  )
}
```

这个版本 key 与数据身份不同：它表达一次明确的“从初始值开始”命令。不要把 `Math.random()` 当作
版本；随机值会在每次 render 中产生新身份，破坏正常 State 保留。

### 3. 只清空少数字段时保留同一组件身份

```tsx
/** 保存可由用户事件直接清空的短消息草稿。 */
function MessageDraft() {
  const [text, setText] = useState('')

  return (
    <>
      <textarea value={text} onChange={(event) => setText(event.currentTarget.value)} />
      <button type="button" onClick={() => setText('')}>
        清空消息
      </button>
    </>
  )
}
```

这里没有身份切换，清空动作就是当前组件的业务事件。若只清空一个字段，直接更新那个 State 比给
整个编辑器换 key 更精确；key 只在整棵子树属于新身份时使用。

## 易错使用提示：10 个高价值 pitfalls

### 1. 只改变对象 Prop，却期待 State 自动重置

**触发条件：** 同一位置从 `customer={alice}` 切换为 `customer={bob}`，没有改变 key。

**原因：** 默认规则按位置和组件类型匹配；Prop 值变化不单独创建新组件身份。

**后果：** Bob 的编辑器可能显示 Alice 尚未提交的草稿。

**错误示例：**

```tsx
/** 错误：只换客户数据，编辑器仍占据同一默认身份位置。 */
function CustomerPage({ customer }: CustomerEditorProps) {
  return <CustomerEditor customer={customer} />
}
```

**正确写法：**

```tsx
/** 正确：稳定客户 ID 表示两个概念上不同的编辑实例。 */
function CustomerPage({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

**验证方式：** 在 Alice 编辑器输入非空草稿，切换 Bob；正确写法应显示 Bob 初始邮箱，且不携带 Alice
草稿。来源：`react-preserving-form`、`react-no-effect-reset`。

### 2. 把 key 当成列表专属，错过非列表组件的身份控制

**触发条件：** 认为只有 `map()` 结果可以使用 key，普通 `<CustomerEditor />` 不能使用 key。

**原因：** React 官方明确说 key 也可以让任意组件区分身份；列表只是最常见的入口。

**后果：** 通过逐字段同步或额外状态复制来修补本应由身份边界解决的表单残留问题。

**错误示例：**

```tsx
/** 错误：把“非列表”误当成不能使用 key 的理由。 */
function ProfilePage({ customer }: CustomerEditorProps) {
  return <CustomerEditor customer={customer} />
}
```

**正确写法：**

```tsx
/** 正确：key 可用于任意组件，明确客户编辑实例的身份。 */
function ProfilePage({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

**验证方式：** 同一 JSX 位置切换两个不同 ID，检查局部输入是否按 ID 重新初始化。来源：
`react-preserving-key`。

### 3. 以为 key 只重置根组件，不影响子树

**触发条件：** 只检查根表单的一个 State，认为嵌套备注、校验提示和子组件 State 会继续保留。

**原因：** key 改变会从头重建组件及其全部 children。

**后果：** 预期外的后代草稿、展开项或输入全部清空；也可能把昂贵的整棵子树无意重建。

**错误示例：**

```tsx
/** 错误：把 key 放在编辑器根部，却假设后代 State 不受影响。 */
function CustomerShell({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

**正确写法：**

```tsx
/** 正确：先把 key 边界内会一起重置的 State 明确列为设计结果。 */
function CustomerShell({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

**验证方式：** 在根字段和嵌套字段都输入内容，改变 key 后确认两者都回到初始值；若只需保留某个
后代状态，应把它移到 key 边界外或改用受控/共享方案。来源：`react-use-state-key`、
`react-preserving-form`。

### 4. 对象切换不加 key，导致旧表单草稿送给错误对象

**触发条件：** 联系人、客户或档案切换后，编辑器仍保留上一个对象的未提交输入。

**原因：** 同位置同类型默认保留 State；视觉上换了名称不等于组件身份改变。

**后果：** 用户可能把 Alice 的消息发送给 Bob，或把 Alice 的联系方式保存到 Bob。

**错误示例：**

```tsx
/** 错误：收件人改变但 Chat 身份没有改变。 */
function Messenger({ contact }: { contact: Customer }) {
  return <CustomerEditor customer={contact} />
}
```

**正确写法：**

```tsx
/** 正确：收件人 ID 改变时创建独立的编辑树。 */
function Messenger({ contact }: { contact: Customer }) {
  return <CustomerEditor key={contact.id} customer={contact} />
}
```

**验证方式：** 先输入 Alice 的草稿，再选择 Bob；正确写法的输入立即为空或为 Bob 初始值。来源：
`react-preserving-form`。

### 5. 用 Effect 逐层手动清空整棵子树

**触发条件：** 在 `userId` 或 `customerId` 变化时，为每个有 State 的组件添加 Effect 清空代码。

**原因：** 这会先以旧 State render，再执行 Effect 并触发下一次 render；嵌套 State 还需要逐层维护。

**后果：** 出现短暂 stale UI、重复渲染和分散的重置责任；遗漏一个后代就会留下旧状态。

**错误示例：**

```tsx
/** 错误：为了整树重置而在每个组件中复制 prop 变化清理逻辑。 */
function Profile({ userId }: { userId: string }) {
  const [comment, setComment] = useState('')
  useEffect(() => setComment(''), [userId])
  return <textarea value={comment} onChange={(event) => setComment(event.currentTarget.value)} />
}
```

**正确写法：**

```tsx
/** 正确：把用户身份作为内层编辑树的 key，统一重建其局部 State。 */
function ProfilePage({ userId }: { userId: string }) {
  return <Profile key={userId} userId={userId} />
}
```

**验证方式：** 比较切换前后的输入值和 render 次数；key 版本不需要为每个后代添加清空逻辑。来源：
`react-no-effect-reset`。本课不展开 Effect cleanup 生命周期。

### 6. 只想重置局部 State，却粗暴替换整棵 key 子树

**触发条件：** 只想清空一个搜索框，却给包含导航、筛选器和编辑器的祖先换 key。

**原因：** key 的语义是整棵边界的身份改变，会重置所有后代 State。

**后果：** 无关输入和展开状态丢失，交互范围超出需求。

**错误示例：**

```tsx
/** 错误：单字段清空却让整页编辑树随版本一起重建。 */
function EditorPage({ version }: { version: number }) {
  return <section key={version}><MessageDraft /></section>
}
```

**正确写法：**

```tsx
/** 正确：让字段自己的事件处理器只更新需要清空的 State。 */
function MessagePage() {
  return <MessageDraft />
}
```

**验证方式：** 清空目标字段后确认导航和无关表单值仍在；只有概念身份整体改变时才提升 key 边界。来源：
`react-no-effect-reset`、`react-use-state-key`。

### 7. 试图从组件 props 中读取 key

**触发条件：** 在组件内部写 `props.key` 或解构 `key`，希望拿到客户 ID。

**原因：** key 是 React 的特殊匹配提示，不会作为普通 prop 传入组件。

**后果：** 业务 ID 为 `undefined`，提交、标签或调试信息无法识别当前对象。

**错误示例：**

```tsx
/** 错误：key 不会出现在这个 props 对象中。 */
function CustomerEditorWithKey(props: CustomerEditorProps & { key?: string }) {
  return <p>{props.key}</p>
}
```

**正确写法：**

```tsx
interface CustomerViewProps extends CustomerEditorProps {
  customerId: string
}

/** 正确：key 控制 React 身份，customerId 负责业务读取。 */
function CustomerView({ customer, customerId }: CustomerViewProps) {
  return <p>{customerId}: {customer.email}</p>
}
```

**验证方式：** 读取 `customerId` 能显示稳定 ID，同时改变 key 仍会重置编辑子树。来源：`react-list-keys`。

### 8. 误以为 key 必须全局唯一

**触发条件：** 为应用中的所有组件生成互不重复的全局 key，或因不同 parent 复用 ID 而报错。

**原因：** key 只在同一 parent 的 siblings 中参与匹配，不是全局注册表。

**后果：** 生成复杂、不可读的 key，或错误地把不同树的业务 ID 绑定成一个全局命名空间。

**错误示例：**

```tsx
/** 错误：把两个不同 parent 的客户 ID 拼成全局 key。 */
function Dashboard({ customer }: CustomerEditorProps) {
  return <><aside><CustomerEditor key={`aside-${customer.id}`} customer={customer} /></aside><main><CustomerEditor key={`main-${customer.id}`} customer={customer} /></main></>
}
```

**正确写法：**

```tsx
/** 正确：同一 parent 内区分 sibling 即可，不同 parent 可各自使用业务 ID。 */
function Dashboard({ customer }: CustomerEditorProps) {
  return <><aside><CustomerEditor key={customer.id} customer={customer} /></aside><main><CustomerEditor key={customer.id} customer={customer} /></main></>
}
```

**验证方式：** 在两个不同 parent 下复用同一 ID，确认没有 sibling key 警告且两棵树身份互不干扰。来源：
`react-preserving-key`、`react-list-keys`。

### 9. 可变列表使用数组 index 作为 key

**触发条件：** 列表允许插入、删除、过滤或排序，却使用 `key={index}`。

**原因：** 顺序变化后同一个 index 指向不同数据，React 会把 State 和 DOM 匹配到错误项。

**后果：** 编辑输入、焦点或勾选状态看起来“跳到”另一个列表项，且错误难以定位。

**错误示例：**

```tsx
/** 错误：可排序客户列表用位置代替稳定客户身份。 */
function CustomerList({ customers }: { customers: Customer[] }) {
  return <ul>{customers.map((customer, index) => <li key={index}>{customer.name}</li>)}</ul>
}
```

**正确写法：**

```tsx
/** 正确：列表项 key 绑定数据中的稳定客户 ID。 */
function CustomerList({ customers }: { customers: Customer[] }) {
  return <ul>{customers.map((customer) => <li key={customer.id}>{customer.name}</li>)}</ul>
}
```

**验证方式：** 在首项前插入客户并检查原有编辑输入仍跟随原客户；若数据永远不会重排，才记录为什么
index 在该静态场景可接受。来源：`react-list-keys`。

### 10. 每次 render 生成随机 key

**触发条件：** 使用 `key={Math.random()}`、当前时间或 render 计数为普通组件或列表 key。

**原因：** 每次 render 都产生新 key，React 永远无法匹配前后身份。

**后果：** 组件和 DOM 每次重建，性能下降，列表中的用户输入丢失；正常更新也变成无意重置。

**错误示例：**

```tsx
/** 错误：随机 key 让每一次 render 都创建全新的编辑器身份。 */
function UnstableEditor({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={Math.random()} customer={customer} />
}
```

**正确写法：**

```tsx
/** 正确：使用稳定业务 ID，仅在客户身份改变时重置。 */
function StableEditor({ customer }: CustomerEditorProps) {
  return <CustomerEditor key={customer.id} customer={customer} />
}
```

**验证方式：** 在不改变客户的情况下触发父级无关 render；稳定 key 保留输入且 DOM 身份不变，随机 key
每次都丢失输入并更换 DOM。来源：`react-list-keys`。如果需要手动重置，使用官方示例中的递增
`version`，不要使用随机值。

### 易错点适用版本与来源

| 错误名称 | 适用版本 | 来源 |
| --- | --- | --- |
| 只改变对象 Prop，却期待 State 自动重置 | React 19.2 | Preserving and Resetting State |
| 把 key 当成列表专属，错过非列表组件身份控制 | React 19.2 | Preserving and Resetting State、useState |
| 以为 key 只重置根组件，不影响子树 | React 19.2 | useState |
| 对象切换不加 key，导致旧表单草稿送给错误对象 | React 19.2 | Preserving and Resetting State |
| 用 Effect 逐层手动清空整棵子树 | React 19.2 | You Might Not Need an Effect |
| 只想重置局部 State，却替换整棵 key 子树 | React 19.2 | You Might Not Need an Effect |
| 试图从组件 props 中读取 key | React 19.2 | Rendering Lists |
| 误以为 key 必须全局唯一 | React 19.2 | Rendering Lists |
| 可变列表使用数组 index 作为 key | React 19.2 | Rendering Lists |
| 每次 render 生成随机 key | React 19.2 | Rendering Lists |

## 高级用法

### 1. 把 key 边界放在真正的身份根部

外层页面可以继续管理客户选择和导航，内层 `CustomerEditor` 接收普通 `customer`，并在其根部使用
`key={customer.id}`。这样客户列表不会因编辑器重建而丢失选择状态，编辑器内部的草稿、校验和子表单
则会一起重新初始化。

### 2. 用可读的版本 key 表达用户命令

`version` 是一个稳定、可预测的 State 变量；点击“重置”时递增一次即可重建 Form。它与随机 key 的
区别是：版本变化有明确的事件原因，普通父级 render 不会意外改变身份。

### 3. 用稳定 ID 而不是显示文本表达业务身份

显示名称可以编辑、重复或被本地化，不适合承担身份合同。数据库或本地持久数据中的稳定 ID 才能让
同一对象跨排序、过滤和重命名保持连续。若 ID 不稳定，先修复数据身份，不要用随机 key 掩盖问题。

### 4. 让“重置全部”与“调整部分”成为两个明确决策

官方把 reset all state 与 adjust some state 分开。前者适用于客户/档案概念身份整体改变；后者适合
只需清除一个选择或根据当前 Props 派生显示值的场景。两者混用会让用户丢失不该丢失的编辑内容。

### 5. 列表中只把 key 放在数组直接产生的节点上

列表 key 的作用域是 `map()` 产生的 sibling。提取 `CustomerRow` 组件后，key 应留在数组中的
`<CustomerRow key={customer.id} ... />`，而不是只放在组件内部返回的 `<li>`；这样 React 才能在正确
的 parent 作用域匹配身份。

## 适用边界

### 适合使用 key 重置

- 客户、收件人、档案或文档在产品语义上是独立编辑实例。
- 切换对象后，整棵局部编辑子树都必须回到新对象初始值。
- 子树包含多个局部 State，逐个清空容易遗漏且不表达真实身份边界。
- 用户点击“重新开始”或“重置表单”，需要确定性地从初始 State 建立表单。
- 能提供稳定且在 sibling 作用域内唯一的 ID 或递增版本。

### 不适合使用 key 重置

- 只想清空一个字段，其他同一编辑实例的 State 应保留。
- 草稿需要跨对象切换保留，或 State 应由父组件统一拥有并受控。
- key 值来自 `Math.random()`、时间或每次 render 变化的临时值。
- 列表项会插入、删除、排序，却没有稳定数据 ID；先解决数据身份，不要用 index 或随机值。
- key 放在页面过高的祖先上，导致导航、筛选器等无关子树一起重建。

## Demo 设计

建议同源 Demo ID：`react.core.learn.intermediate.resetting-state-with-key.customer-editor-demo`。

场景为“切换客户的联系信息编辑器”，提供两个并列、可观察的对照：

1. **保留对照：** `CustomerEditor customer={selectedCustomer}`，切换客户后显示旧草稿仍在，证明
   同位置同类型默认保留 State。
2. **重置对照：** `CustomerEditor key={selectedCustomer.id} customer={selectedCustomer}`，切换客户
   后编辑器显示新客户初始邮箱和备注，证明稳定 key 改变身份。
3. 两个编辑器共用只读客户选择器，但各自拥有独立局部 State；切换客户按钮只改变选中 ID。
4. Demo 不使用 Effect、Reducer、Context、Ref、请求、随机值、时间戳、动态生成 key 或列表优化技巧。
5. 函数和组件均在模块顶层定义；每个新增函数上方写职责明确的简体中文注释；运行代码和展示代码
   必须来自同一个 `.tsx` 文件。
6. CSS 只使用 Flexbox、margin 和正常文档流，禁止 `grid` 与 `gap`；卡片圆角不超过 8px，固定输入区
   尺寸避免切换状态造成跳动。

建议交互步骤：

1. 在保留对照输入 Alice 的临时邮箱，在重置对照输入 Alice 的临时备注。
2. 选择 Bob，观察保留对照继续显示 Alice 草稿，重置对照回到 Bob 初始资料。
3. 在 Bob 下再次输入内容，再切回 Alice，确认两个对照按各自身份规则工作。
4. 触发外层无关更新，确认稳定 key 的编辑器 DOM 身份不变；切换客户后确认 key 对照的输入节点已
   重新创建。
5. 生产 console 保持 `0 error / 0 warning`，不把错误 key 例子放进运行 Demo。

## `/tmp` 临时验证计划

研究阶段不创建课程、Demo、manifest 或持久测试；未来实现前只在 `/tmp` 使用最小 fixture：

1. 建立 React 19.2.8 fixture，包含一个保留编辑器和一个 `key={customer.id}` 编辑器。
2. 先输入非空草稿，再切换客户，读取两个 input 的值；预期保留对照仍为旧草稿，key 对照为新客户
   初始值。
3. 保存切换前的 `input` DOM 引用，切换后检查保留对照 `isSameNode` 为真、key 对照为假；用此证明
   key 边界发生 DOM 重建，而不是手动 `setState` 同步。
4. 触发父级无关 render，确认稳定 key 对照的 input DOM 引用和值不变；另用静态 fixture 复现
   `Math.random()` 每次 render 重置输入和 index key 在插入后错配的风险。
5. 用递增 `version` 按钮重置 Form，确认只有点击事件改变 key；普通 render 不改变版本。
6. 用 `rg` 检查生产 Demo 源码不含 `Math.random()`、`Date.now()`、Effect、Reducer、Context、Ref、
   请求或 `key={index}`；每个函数定义上方存在职责注释。
7. 临时目录、截图、trace 和 fixture 全放 `/tmp`；验证结束删除后，以 `test ! -e <tmp-dir>` 确认
   不存在。禁止向仓库 `tests/` 写持久测试文件。

## 1440 / 390 / 390+200% 浏览器计划

未来课程与 Demo 闭环时使用 Playwright 形成可复跑证据，本研究阶段不打开页面：

- **1440px：** 选择客户、分别编辑两个对照、切换客户、检查输入值、DOM 身份与状态文案；确认两栏
  对照和客户选择器不重叠。
- **390px：** 让两个对照改为正常文档流或垂直 Flex，切换客户后仍可完成编辑；检查无横向溢出、
  输入和按钮不被裁切，焦点环可见。
- **390px + 200% 根字号：** 复跑相同流程，检查长客户名、邮箱、状态文案和按钮换行不覆盖相邻内容，
  `scrollWidth <= clientWidth`。
- 三种视口均验证切换前后：保留对照值保持，key 对照值重置；key 对照切换后的 input DOM 引用不复用。

## Console 与同源哈希合同

未来实现必须满足：

1. 冷会话与重复进入 Demo 的 `console.error`、`console.warn`、page error 均为 0；不能以 React
   key warning 作为可接受噪声。
2. 运行组件和源码展示来自同一 `.tsx` 文件；不得复制一份“展示版”代码。
3. 读取展示文本与实际运行文件时，统一去除约定的末尾空白，再比较 UTF-8 字符数、字节数和 SHA-256；
   三者必须一致。
4. 运行时不得依赖网络、随机值、计时器或外部请求；相同操作序列应得到相同 State 和 DOM 身份结果。
5. key 对照的重建只由 `customer.id` 变化或明确递增 `version` 事件触发；父级无关 render 不得改变 key。

## 拆课判断

- key 作为组件身份的一部分、稳定业务 ID、整棵子树重建、表单对象切换和 State 重置共享同一身份
  心智模型，合并后才能回答“为什么切换对象会清空编辑状态”。
- 随机 key、index key、key 作用域和 key 不进入 props 都是该身份模型的高价值错误边界，不构成独立
  课程；列表只保留必要的身份连续性说明。
- 手动清空少数字段与 key 重置整棵子树是同一决策中的范围取舍，官方已在“整树 reset / 部分 adjust”
  中给出边界，不需要拆成第二课。
- `useReducer`、Action、Context、Effect 清理、复杂列表优化和受控状态所有权分别属于计划中的其他
  课程或前置课程，不在本课展开。
- 当前没有第二条独立主线，**无需拆课**。本记录完成后只允许进入第 6 课正文与验证，完成闭环前不开始
  第 7 课 `useReducer`。

## 官方事实验收矩阵

| 验收项 | 官方锚点 | 本记录结果 |
| --- | --- | --- |
| key 可用于非列表组件 | `#option-2-resetting-state-with-a-key` | 已覆盖基础用法与 Pitfall 2 |
| key 改变使同位置组件成为不同身份 | `#option-2-resetting-state-with-a-key` | 已覆盖官方事实、Pitfall 1/4 |
| 旧 State 销毁、新 State 创建 | `#option-2-resetting-state-with-a-key` | 已覆盖官方事实与临时验证计划 |
| 组件和全部 children 从头重建 | `useState#resetting-state-with-a-key` | 已覆盖官方事实、Pitfall 3 |
| Chat/contact 表单切换清空输入 | `#resetting-a-form-with-a-key` | 已覆盖 Demo 设计与 Pitfall 4 |
| Effect 整树清理的额外 render 取舍 | `#resetting-all-state-when-a-prop-changes` | 仅作边界反例，未展开 cleanup |
| 部分 State 调整不应粗暴整树重置 | `#adjusting-some-state-when-a-prop-changes` | 已覆盖 Pitfall 6 与适用边界 |
| sibling 唯一、稳定、不可随机变化 | `rendering-lists#rules-of-keys` | 已覆盖 Pitfall 8/9/10 |
| latest 版本与 patch 文档边界 | `versions#latest-version` | 已覆盖版本说明 |

## 参考资料

1. [React Versions](https://react.dev/versions#latest-version) - 当前官方文档版本与 major/minor/patch 口径。
2. [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) - key 身份、State 创建/销毁、表单重置与子树重建。
3. [`useState`](https://react.dev/reference/react/useState#resetting-state-with-a-key) - 不同 key 从头重建 Form 和全部 children。
4. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes) - 整树 key 与局部 State 调整的边界。
5. [Rendering Lists](https://react.dev/learn/rendering-lists#rules-of-keys) - 稳定 ID、sibling 作用域、index 和随机 key 风险。

## 实施与验收证据

- 正文：`src/categories/frontend/react/core/learn/resetting-state-with-key.md`。
- 同源 Demo：`react.core.learn.intermediate.resetting-state-with-key.customer-editor-demo`，运行组件和
  raw 源码均指向 `demos/resetting-state-with-key/customer-editor-demo.tsx`。
- Playwright 验证不加 key 的编辑器在切换客户后保留草稿，`key={customer.id}` 编辑器回到
  Bob 初始资料，且切换前后的 input DOM 节点不同。
- 1440px、390px 与 390px + 200% 根字号下，页面与 Demo 均无横向溢出或控件裁切；冷会话
  console 为 `0 error / 0 warning`。
- 展示源码与运行 TSX 在去除末尾空白后均为 `3655` 字符、`3991` UTF-8 字节，
  SHA-256 均为 `9455fc2ce067195a73590fd30501842dac676c32866b8e2974e72a0f38d2e1da`。
- 第 6 课已登记为 `available`；第 7 至第 12 课按本批串行闭环，第 13 课保持 `planned`。
