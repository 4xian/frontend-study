---
id: react.core.learn.intermediate.unnecessary-effects
type: lesson
title: 不需要 Effect 的场景
summary: 没有外部系统时，把派生计算留在 render，把用户动作和状态边界放在正确的事件或组件结构中。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 55
prerequisites:
  - react.core.learn.intermediate.use-effect
related:
  - react.core.learn.intermediate.state-structure
  - react.core.learn.intermediate.state-preservation-and-reset
  - react.core.learn.intermediate.lifting-state-up
  - react.core.learn.intermediate.state-sharing-boundary
  - react.core.learn.intermediate.use-effect
tags:
  - React
  - Effect
  - render 纯度
  - 派生值
  - 事件处理器
  - State 重置
  - 父子通信
  - useMemo
appliesTo: React 19.2
verifiedAt: 2026-08-17
objectives:
  - 能判断一个需求是 render 计算、用户事件，还是 React 与外部系统的同步。
  - 能把由当前 Props、State 或 Context 纯计算得到的结果直接留在 render。
  - 能把只因一次明确用户动作发生的业务逻辑放进对应事件处理器。
  - 能用 key 重置一整棵子树的局部 State，并理解何时应该提升 State 或使用受控边界。
  - 能在同一个事件中通知父组件，避免用 Effect 猜测子组件刚刚发生的动作。
  - 能判断 useMemo 的缓存边界，不把性能优化当成正确性工具。
  - 能保留真正用于同步外部系统的 Effect，并避免把删除 Effect 误解为删除所有副作用。
  - 能识别派生 State、Effect 链、事件中转 State 和 render 副作用造成的级联更新与误触发。
recap:
  - 结果能从本次 render 的输入纯计算得到时，不要为它创建 State 或 Effect。
  - 一次点击、输入、提交或删除有明确原因，应由对应事件处理器执行。
  - 整棵子树需要换一份局部 State 时，使用稳定且有意义的 key 形成重置边界。
  - 子组件在事件中把事实通知父组件；不要让父组件等待 Effect 观察结果 State。
  - useMemo 只缓存昂贵的纯计算，不能修复错误的数据流，也不能保证语义上的“只运行一次”。
  - 浏览器 API、连接、订阅、播放器和外部 Store 仍然需要各自正确的同步机制。
sources:
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 纯数据转换通常应在 render 中完成
      - 用户事件触发的逻辑应由事件处理器完成
      - 重置 State、通知父组件和 Effect 链都有不使用 Effect 的直接表达方式
  - title: useEffect
    url: https://react.dev/reference/react/useEffect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - Effect 用于与 React 外部系统同步，并在提交后运行
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 必须幂等且不产生非局部副作用
      - 事件处理器和 Effect 是 render 之外的执行位置
  - title: useMemo
    url: https://react.dev/reference/react/useMemo
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - useMemo 缓存纯计算结果，不用于修复错误或保证语义行为
  - title: Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - key 可以让 React 把不同身份的子树视为不同组件并重置 State
  - title: Sharing State Between Components
    url: https://react.dev/learn/sharing-state-between-components
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 共享事实应提升到共同父组件并通过 Props 传递
  - title: useSyncExternalStore
    url: https://react.dev/reference/react/useSyncExternalStore
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 外部 Store 的订阅和快照应使用专门的同步 API
  - title: React 19.2.8 ReactFiberCommitEffects Source
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 固定版本在提交阶段调用 Effect setup
  - title: React 19.2.8 Effect Tests
    url: https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L914-L940
    sourceType: source-code
    appliesTo: React 19.2.8
    claims:
      - 官方测试先观察提交输出，再观察 passive Effect
---

# 不需要 Effect 的场景

## 一、学习目标

- 判断需求的数据来源、触发原因和执行位置。
- 把当前 Props、State、Context 能纯计算出的值直接放在 render。
- 把点击、输入、提交、删除等一次性业务动作放进对应事件处理器。
- 使用 `key` 建立清晰的局部 State 重置边界。
- 在事件中完成父子组件之间的事实通知，避免使用 Effect 中转。
- 判断 `useMemo` 何时有价值，区分缓存边界和数据正确性。
- 保留必须同步浏览器 API、连接、订阅、播放器或外部 Store 的 Effect。

## 二、为什么需要

`useEffect` 很容易被误解成“只要某个值变化，就在这里做点什么”。这个习惯会把不同原因的工作混在一起：
有些值只是当前输入的计算结果，有些工作是某个按钮刚刚被点击，还有些工作才是真正需要和 React 之外的系统同步。

例如，订单总价由单价和数量决定，不存在一个需要独立维护的“总价系统”。把总价保存为 State，再用 Effect 追写，
会先用旧总价提交一次界面，Effect 运行后再触发一次更新。用户可能短暂看到旧结果，代码还要同时维护两份可能失步的
事实。

再例如，用户点击“立即结算”是一次明确的交互。事件处理器知道是哪个按钮、哪次点击和当时的输入；Effect 只能在提交
后看到某个 State 已经变化，无法可靠判断这个 State 是新点击、页面恢复、组件重挂载还是其他逻辑造成的。把动作编码成
`shouldCheckout`，再由 Effect 猜测原因，会让业务动作在错误的时间重复执行。

判断顺序应当先问“为什么需要运行”，再问“依赖数组写什么”：

1. 结果能否由当前 render 已有输入纯计算得到？能，就放在 render。
2. 工作是否只因一次明确用户动作发生？是，就放在对应事件处理器。
3. 是否要在组件显示期间持续与 React 不控制的系统保持一致？是，才需要 Effect 或外部 Store 同步。

这套顺序不是禁止副作用。事件处理器可以提交表单、写入本地业务状态或调用服务；Effect 可以同步播放器、订阅和连接。
它要求每类工作由能看见其真实原因的边界负责。

## 三、判断模型

### 1. 三种执行位置

React 组件里的代码可以按职责分为三类：

| 执行位置 | 它能直接看见什么 | 适合做什么 | 不适合做什么 |
| --- | --- | --- | --- |
| render | 当前 Props、State、Context | 纯计算、选择 JSX、建立局部值 | 请求、写 DOM、改模块变量、发送业务动作 |
| 事件处理器 | 这次交互的事件和 State 快照 | 提交、删除、保存、更新 State、通知父组件 | 等待 Effect 猜测交互原因 |
| Effect | 已提交的 UI 和响应式输入 | 同步外部对象、订阅、计时器、播放器、连接 | 派生内部数据、转发一次点击、替代事件处理器 |

render 可以被 React 重复调用或放弃，所以它必须是幂等的。事件处理器由明确交互触发，可以保留“为什么发生”；Effect
用于持续同步外部对象，必须拥有自己的资源和清理逻辑。三者都可能包含函数调用，但触发条件和可依赖的信息不同。

### 2. 先判断事实来源

把一个需求拆成“输入”和“结果”通常比先写 Hook 更有效。下面的代码没有第二份总价 State：

```tsx
type OrderSummary = Readonly<{
  subtotal: number
  discount: number
  total: number
}>

/** 根据当前价格和数量计算本次 render 的订单摘要。 */
function calculateOrderSummary(price: number, quantity: number): OrderSummary {
  const subtotal = price * quantity
  const discount = quantity >= 5 ? 20 : 0
  return { subtotal, discount, total: subtotal - discount }
}

/** 只保存用户选择，并从当前输入得到订单显示结果。 */
function OrderSummaryView({ quantity }: { quantity: number }) {
  const summary = calculateOrderSummary(80, quantity)
  return <output>总价：¥{summary.total}</output>
}
```

`quantity` 是用户选择，需要跨 render 保存；`summary` 是本次输入的函数结果，不需要被 React 记住。只要同一输入产生
同一输出，直接计算就能让所有显示字段来自同一个快照。

### 3. Effect 是外部同步边界

下面的播放器不是 React 管理的对象。组件显示期间，`playing` 改变后必须把新值交给播放器，因此 Effect 有明确的
同步对象：

```tsx
/** 在提交后的同步阶段把 React 的播放状态交给外部播放器。 */
function VideoControls({ player, playing }: { player: VideoPlayer; playing: boolean }) {
  useEffect(() => {
    player.setPlaying(playing)
  }, [player, playing])

  return <p>{playing ? '播放中' : '已暂停'}</p>
}
```

这和“把总价写进 State”不同：播放器有自己的状态和 API，React 需要与它保持一致。删除不必要 Effect 的目标是去掉没有
同步对象的那一层，不是把所有工作都搬进 render，也不是把真正的外部同步删掉。

## 四、Render 派生与缓存边界

### 1. 直接派生当前结果

字符串拼接、布尔判断、数量统计、金额计算、过滤和排序，只要函数本身纯净，都可以在组件函数中直接完成：

```tsx
type Product = Readonly<{ id: string; name: string; price: number }>

/** 返回当前查询命中的商品，不修改输入数组。 */
function filterProducts(products: readonly Product[], query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase()
  return products.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
}

/** 从当前输入直接得到列表和结果数量。 */
function ProductResults({ products, query }: { products: readonly Product[]; query: string }) {
  const visibleProducts = filterProducts(products, query)
  return (
    <section>
      <p>匹配 {visibleProducts.length} 项</p>
      {visibleProducts.map((product) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </section>
  )
}
```

结果没有自己的生命周期，也没有需要清理的资源。把 `visibleProducts` 保存到 State 反而增加了同步入口：商品数组、查询
文本和重置逻辑都必须记得更新它。直接计算会让显示结果自动跟随当前输入。

### 2. 不复制可以计算出的 State

下面这种写法把同一事实保存了两次：

```tsx
const [firstName, setFirstName] = useState('Ada')
const [lastName, setLastName] = useState('Lovelace')
const [fullName, setFullName] = useState('Ada Lovelace')

/** 错误：把派生结果交给提交后的 Effect 追写。 */
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])
```

正确做法是只保存真正需要记住的输入：

```tsx
const [firstName, setFirstName] = useState('Ada')
const [lastName, setLastName] = useState('Lovelace')
const fullName = `${firstName} ${lastName}`
```

计算结果和输入处于同一个 render 快照，不会出现“输入已经变了但派生 State 还没追上”的中间状态。这个规则适用于总价、
筛选结果、标签列表、是否可以提交、字符数和摘要文本等廉价纯结果。

### 3. `useMemo` 只处理昂贵的纯计算

如果一个纯计算确实昂贵，且重新计算的成本已经被测量，可以用 `useMemo` 在依赖不变时复用上次结果：

```tsx
/** 对大量商品执行昂贵但纯净的筛选和排序。 */
function ExpensiveProductResults({
  products,
  query,
}: {
  products: readonly Product[]
  query: string
}) {
  const visibleProducts = useMemo(
    () => filterProducts(products, query).sort((left, right) => left.price - right.price),
    [products, query],
  )

  return <p>匹配 {visibleProducts.length} 项</p>
}
```

`useMemo` 仍然是 render 中的纯计算表达式。它不能让错误的 State 结构变正确，不能替代事件处理器，不能保证值永远
只计算一次，也不能用来保存需要清理的外部资源。先保证直接计算正确，再在性能证据足够时增加缓存；简单计算不需要为了
形式引入 `useMemo`。

### 4. render 中只能做纯计算

删除 Effect 后，不能把原来的副作用直接放到组件主体：

```tsx
/** 错误：普通 render 可能重复发送一次业务通知。 */
function Notice({ message }: { message: string }) {
  sendNotification(message)
  return <p>{message}</p>
}
```

如果通知由点击触发，应放进事件处理器；如果通知必须和浏览器或第三方系统持续同步，应使用对应的 Effect。render 只
根据输入返回结果，不执行不可逆的动作。

## 五、事件处理与业务原因

### 1. 事件处理器知道动作原因

用户点击“加入购物车”和“立即结算”是两个不同原因，即使它们最终都更新了 State，也不应先写入一个动作标记再让
Effect 猜测：

```tsx
type PurchaseAction = 'add-to-cart' | 'checkout'

/** 记录明确发生的一次购买动作。 */
function recordPurchase(action: PurchaseAction): void {
  console.log(action)
}

/** 让每个按钮保留自己的用户意图。 */
function PurchaseActions() {
  return (
    <div>
      <button type="button" onClick={() => recordPurchase('add-to-cart')}>
        加入购物车
      </button>
      <button type="button" onClick={() => recordPurchase('checkout')}>
        立即结算
      </button>
    </div>
  )
}
```

事件处理器也可以读取当前 State 快照、调用服务函数和更新多个相关 State。它不会因为组件重新渲染或重新挂载而自动再次
运行，因此业务动作的触发原因清晰可查。

### 2. 共享逻辑用普通函数复用

多个入口需要同一业务步骤时，提取普通函数即可：

```tsx
/** 复用购买入口的共同业务动作，不负责决定触发时机。 */
function commitPurchase(action: PurchaseAction, note: string): void {
  recordPurchase(action)
  console.log(note)
}

/** 响应加入购物车按钮。 */
function handleAddToCart(note: string): void {
  commitPurchase('add-to-cart', note)
}

/** 响应立即结算按钮。 */
function handleCheckout(note: string): void {
  commitPurchase('checkout', note)
}
```

复用函数没有改变执行原因。两个事件处理器直接调用它，render 不会调用它，Effect 也不需要观察任何中转 State。

### 3. 提交动作和显示动作分开

同一个组件可能同时有“页面显示时记录一次浏览”和“用户提交表单”两类工作。前者如果确实需要与分析系统同步，可以
由 Effect 负责；后者只由提交事件负责。不要因为它们都叫“记录”就把提交也交给 Effect。

```tsx
/** 把表单提交数据发送给业务服务。 */
function submitForm(form: FormData): void {
  sendForm(form)
}

/** 响应用户提交，而不是观察某个 shouldSubmit 状态。 */
function FormActions() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    submitForm(new FormData(event.currentTarget))
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">提交</button>
    </form>
  )
}
```

### 4. 不要把动作串成 Effect 链

如果一次点击要更新多个内部 State，可以在同一个事件处理器里完成：

```tsx
/** 一次提交同时更新本地订单和界面提示。 */
function handlePlaceOrder(): void {
  setOrderStatus('placed')
  setConfirmation('订单已提交')
  setActionCount((count) => count + 1)
}
```

与其让第一个 Effect 更新第二个 State、第二个 Effect 再更新第三个 State，不如把这次交互的结果一次表达清楚。这样状态
更新仍由用户动作触发，代码也不会因为中间 State 恢复为旧值而重新执行链条。

## 六、State 重置与组件边界

### 1. 用 `key` 重置整棵局部子树

当用户切换编辑对象时，旧对象的草稿、校验状态和展开状态通常都不应带到新对象。不要在 Effect 中监听 `userId` 后逐项
清空 State；给编辑器一个代表对象身份的 `key`，React 会把新旧编辑器视为不同子树：

```tsx
type User = Readonly<{ id: string; name: string }>

/** 根据当前用户身份创建带重置边界的编辑器。 */
function UserPage({ user }: { user: User }) {
  return <UserEditor key={user.id} user={user} />
}

/** 只在当前用户子树内保存尚未提交的编辑 State。 */
function UserEditor({ user }: { user: User }) {
  const [draft, setDraft] = useState(user.name)
  return (
    <label>
      名称
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </label>
  )
}
```

切换 `user.id` 会卸载旧 `UserEditor` 并挂载新的编辑器，因此新编辑器从 `user.name` 建立初始 State。`key` 不是列表
专属语法，它描述同一位置上“这是不是同一个组件身份”。只有确实需要整棵子树重置时才使用它，不能为了每个普通
重新渲染随意变化。

### 2. 需要共享事实时提升 State

如果两个兄弟组件都需要读写同一个事实，应该把 State 放到它们最近的共同父组件，再通过 Props 传入：

```tsx
/** 在共同父组件中拥有当前选中的标签。 */
function FilterPanel() {
  const [selectedTag, setSelectedTag] = useState('全部')
  return (
    <>
      <TagPicker value={selectedTag} onChange={setSelectedTag} />
      <ResultList tag={selectedTag} />
    </>
  )
}
```

这比子组件改变自己的 State 后由 Effect 通知父组件更直接。父组件拥有事实，子组件通过回调发出事件，列表通过 Props
读取当前值。

### 3. 部分调整比整棵重置更谨慎

有时组件只需要在输入改变时调整某一小部分 State，而不是丢弃整棵子树。优先考虑把计算结果直接派生出来；若确实需要
保留其他 State，可以在 render 中比较上一次输入并同步局部 State，但这种写法必须简单、可证明，并且要接受当前 render
会触发一次额外更新：

```tsx
/** 当列表身份变化时清除当前选择，同时保留组件的其他状态。 */
function SelectableList({ items }: { items: readonly string[] }) {
  const [previousItems, setPreviousItems] = useState(items)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  if (items !== previousItems) {
    setPreviousItems(items)
    setSelectedItem(null)
  }

  return items.map((item) => (
    <button key={item} type="button" onClick={() => setSelectedItem(item)}>
      {item} {item === selectedItem ? '（已选）' : ''}
    </button>
  ))
}
```

这不是把任意 State 更新都放进 render 的许可。能用 `key` 清晰重置时优先使用 `key`；能由输入计算时不要保存；只有
“保留大部分局部 State、只修正一小部分”的明确场景才考虑这种受限模式。

### 4. 事件中重置是最直接的重置

如果重置原因就是按钮点击，不需要等 Props 变化，也不需要 Effect：

```tsx
/** 响应重置按钮并恢复本地表单的初始值。 */
function handleReset(): void {
  setName('')
  setQuantity(1)
  setError(null)
}
```

事件处理器知道重置是谁发起的，也能一次更新所有相关 State。若重置规则变成“切换身份就重置全部局部状态”，再使用
`key` 表达组件身份边界。

## 七、父子通知与数据流

### 1. 子组件在事件中通知父组件

子组件不需要用 Effect 观察自己的 `saved` State 后通知父组件。保存按钮的事件处理器已经知道事实发生的时刻：

```tsx
type Draft = Readonly<{ title: string }>

/** 通过父组件传入的回调报告一次明确保存。 */
function Editor({ onSave }: { onSave: (draft: Draft) => void }) {
  const [title, setTitle] = useState('草稿')

  /** 响应保存按钮，直接把这次事件产生的事实交给父组件。 */
  function handleSave(): void {
    onSave({ title })
  }

  return (
    <>
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
      <button type="button" onClick={handleSave}>保存</button>
    </>
  )
}
```

父组件收到回调后可以更新自己的 State、调用服务函数或显示结果。它不需要观察子组件的内部 State，也不会因为子组件
普通重新渲染而误认为发生了保存。

### 2. 受控组件让事实只有一个拥有者

如果父组件需要始终知道输入值，就让父组件拥有值，子组件只负责展示并报告变化：

```tsx
/** 由父组件拥有输入值的可复用文本框。 */
function ControlledTitle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} />
}

/** 统一保存标题事实，并把它传给展示与编辑两侧。 */
function DocumentEditor() {
  const [title, setTitle] = useState('未命名文档')
  return <ControlledTitle value={title} onChange={setTitle} />
}
```

不要同时让父组件保存一份标题、子组件再保存一份标题，然后由 Effect 互相同步。单一拥有者使数据流可追踪，也避免
“谁的值才是最新”的竞争。

### 3. 不要用“值变化”伪造事件

下面的模式把“用户点击保存”压缩成“`savedDraft` 变成非空”：

```tsx
const [savedDraft, setSavedDraft] = useState<Draft | null>(null)

/** 错误：Effect 无法知道 savedDraft 是点击、恢复还是外部初始化。 */
useEffect(() => {
  if (savedDraft) onSave(savedDraft)
}, [savedDraft, onSave])
```

正确方式是在保存事件中直接调用 `onSave`。如果确实要把父组件的 State 作为公开事实，也应在同一个事件中同时更新
父组件和子组件，而不是建立一个只为触发 Effect 存在的中转 State。

## 八、Effect 链与级联更新

### 1. 一次输入直接得到最终结果

把一个输入拆成多个只为触发下一个 Effect 的 State，会形成隐式链条：

```tsx
/** 错误模型：每个 Effect 只负责把结果推进到下一份 State。 */
useEffect(() => setSubtotal(price * quantity), [price, quantity])
useEffect(() => setDiscount(subtotal >= 200 ? 20 : 0), [subtotal])
useEffect(() => setTotal(subtotal - discount), [subtotal, discount])
```

可以在 render 中一次计算完整摘要：

```tsx
/** 从源输入一次得到最终订单结果，避免级联 State。 */
function calculateTotal(price: number, quantity: number): number {
  const subtotal = price * quantity
  const discount = subtotal >= 200 ? 20 : 0
  return subtotal - discount
}
```

级联链条不仅增加 render 次数，还会让调试者必须追踪多个中间快照。把 State 保留在真正的用户事实上，把派生结果留在
纯函数中，通常就能删除整条链。

### 2. 一次事件是一个业务事务

一次提交可能需要更新状态、清除输入并显示反馈。事件处理器可以把这些更新放在一起：

```tsx
/** 一次确认事件同时完成本地业务状态迁移。 */
function handleConfirm(): void {
  setStatus('confirmed')
  setDraft('')
  setMessage('已确认')
}
```

这些更新共享同一个触发原因。拆成多个 Effect 会让“确认”被表示成一连串偶然的 State 变化，重新挂载或恢复状态时还
可能重复执行中间步骤。

### 3. 需要异步流程时保留明确状态机

不是所有多步流程都能合并成一个表达式。加载、成功和失败是服务响应带来的不同状态，可以由事件启动请求，并在结果
回来后更新状态；关键是保留请求的真实边界，不要用多个 Effect 猜测下一步：

```tsx
type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed'

/** 响应保存事件并显式推进请求状态。 */
async function handleSave(): Promise<void> {
  setStatus('saving')
  try {
    await saveDocument(draft)
    setStatus('saved')
  } catch {
    setStatus('failed')
  }
}
```

如果请求由组件显示期间的外部数据同步触发，Effect 仍可能合适；如果请求由按钮提交触发，事件处理器更能保留原因。
数据获取还要处理取消、竞态和框架缓存，这些属于请求边界，不应通过无意义的 Effect 链掩盖。

## 九、仍然需要 Effect 的边界

### 1. 持续同步外部对象

视频播放器、地图实例、编辑器、浏览器媒体 API、事件目标和第三方 Widget 都拥有 React 之外的状态。组件显示期间，
React 值改变时需要把值同步过去，这是真正的 Effect 场景：

```tsx
/** 在提交后同步外部播放器的播放状态。 */
function Player({ player, isPlaying }: { player: VideoPlayer; isPlaying: boolean }) {
  useEffect(() => {
    player.setPlaying(isPlaying)
  }, [player, isPlaying])
  return <p>{isPlaying ? '播放中' : '已暂停'}</p>
}
```

这里删除 Effect 会把外部写入带回 render，破坏纯度；保留 Effect 才能让外部对象在提交后收到稳定的 UI 状态。

### 2. 订阅外部 Store 使用匹配的接口

如果数据来自 React 不拥有的 Store，并且组件需要订阅快照变化，应使用 `useSyncExternalStore` 或 Store 提供的正式
适配器，而不是让每个组件手写“订阅后 setState”的 Effect：

```tsx
/** 从外部 Store 读取快照并在快照变化时重新渲染。 */
function OnlineStatus({ store }: { store: OnlineStore }) {
  const isOnline = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return <p>{isOnline ? '在线' : '离线'}</p>
}
```

这仍然属于外部同步问题，只是使用了更贴合订阅合同的 API。不要因为本课强调删除不必要 Effect，就删除外部 Store 的
同步能力。

### 3. 数据获取要放在真实请求边界

由页面显示决定的初始数据可能需要 Effect，但必须处理请求竞态和组件离开；由用户点击“搜索”发起的请求则更适合放进
事件处理器或框架提供的数据动作。两者都不是“先设置 `shouldFetch` 再由 Effect 猜测”的理由。

```tsx
/** 在组件显示期间同步当前查询结果，并忽略过期响应。 */
function SearchResults({ query }: { query: string }) {
  const [result, setResult] = useState<string[]>([])

  useEffect(() => {
    let ignore = false
    fetchResults(query).then((items) => {
      if (!ignore) setResult(items)
    })
    return () => {
      ignore = true
    }
  }, [query])

  return <ResultList items={result} />
}
```

实际应用还应优先使用框架或数据层的缓存、预取和取消能力。这里的判断重点是触发原因：显示期间持续跟随 `query`
是同步边界；点击按钮提交一次搜索则是事件边界。

### 4. 初始化和一次性行为要有明确拥有者

如果某个 SDK 必须在应用入口初始化，应放在入口或模块级初始化合同中，而不是让每个子组件用空依赖 Effect 争抢一次
全局初始化。若对象属于单个组件，则由该组件的 Effect 创建和清理。拥有者越清晰，重复挂载和开发期检查越容易验证。

## 十、用法示例或 Demo

本 Demo 将订单编辑器拆成父组件和子组件：

- 商品数量和订单备注是局部 State；小计、折扣和总价由当前输入在 render 中直接计算。
- 切换客户时，编辑器的 `key` 改变，客户草稿和数量一起重置，不需要 Effect 逐项清空。
- “加入购物车”和“立即结算”由子组件事件处理器直接通知父组件，父组件记录动作和客户身份。
- 输入备注只触发普通 render，不会增加业务动作次数。
- 运行组件与源码面板读取同一个 TSX 和 CSS 文件。

:::demo{id="react.core.learn.intermediate.unnecessary-effects.render-and-event-boundary-demo"}
:::

## 十一、易错使用提示

:::pitfalls
### 错误：用 Effect 同步可直接计算的结果

**触发条件：** 已有 `price` 和 `quantity`，却为 `total` 建立 State，并在 Effect 中更新。

**原因：** 总价不是独立事实，只是当前输入的纯函数结果。

**后果：** React 先提交旧总价，再由 Effect 触发额外 render；遗漏更新入口时还会显示错误金额。

**错误示例：**

```tsx
const [total, setTotal] = useState(0)

/** 错误：提交后再追写本可直接计算的结果。 */
useEffect(() => {
  setTotal(price * quantity)
}, [price, quantity])
```

**正确写法：**

```tsx
/** 正确：总价和当前输入处于同一个 render 快照。 */
const total = price * quantity
```

**验证方式：** 改变数量后，页面直接显示新总价，源码中不存在总价 State setter 或同步 Effect。

### 错误：让 Effect 观察动作标记

**触发条件：** 点击时只设置 `shouldCheckout`，再由 Effect 观察它并执行结算。

**原因：** Effect 看到的是状态结果，不知道它来自新点击、数据恢复还是组件重新显示。

**后果：** 恢复为 `true` 的状态、重新挂载或开发期额外检查都可能在没有新点击时重复业务动作。

**错误示例：**

```tsx
const [shouldCheckout, setShouldCheckout] = useState(false)

/** 错误：Effect 根据中转 State 猜测用户意图。 */
useEffect(() => {
  if (shouldCheckout) checkout()
}, [shouldCheckout])
```

**正确写法：**

```tsx
/** 正确：结算只由这次提交交互触发。 */
function handleCheckout(): void {
  checkout()
}
```

**验证方式：** 重新渲染或重新进入页面不会结算；只有点击结算按钮才增加一次动作记录。

### 错误：删除 Effect 后在 render 中执行动作

**触发条件：** 为了移除 Effect，直接在组件主体中调用结算、写 DOM、发请求或修改模块变量。

**原因：** render 可以被 React 重试或多次调用，必须保持幂等且没有非局部副作用。

**后果：** 普通页面更新会重复执行动作，组件输出取决于不可控的调用次数。

**错误示例：**

```tsx
/** 错误：组件渲染本身就执行结算。 */
function CheckoutPage() {
  checkout()
  return <p>订单确认</p>
}
```

**正确写法：**

```tsx
/** 正确：render 只返回界面，动作由按钮处理器触发。 */
function CheckoutPage() {
  return <button type="button" onClick={checkout}>确认结算</button>
}
```

**验证方式：** 触发无关 render 时动作次数不变，点击按钮时才恰好增加一次。

### 错误：用 Effect 逐项重置新对象的表单

**触发条件：** `userId` 变化后，在 Effect 中逐个调用 `setName`、`setNote` 和 `setError` 清空表单。

**原因：** 整个编辑器其实已经属于另一个用户身份，逐项同步会让旧子树先显示一次。

**后果：** 切换对象时可能短暂看到旧草稿，还要维护一组容易漏掉的重置 State。

**错误示例：**

```tsx
useEffect(() => {
  setName(user.name)
  setNote('')
  setError(null)
}, [user.id, user.name])
```

**正确写法：**

```tsx
/** 用用户身份建立整个编辑器的 State 重置边界。 */
function UserPage({ user }: { user: User }): React.ReactNode {
  return <UserEditor key={user.id} user={user} />
}
```

**验证方式：** 切换用户后编辑器从新用户初始值开始，旧草稿、错误和展开状态都不保留。

### 错误：子组件 State 变化后再通知父组件

**触发条件：** 子组件保存 `savedDraft`，父组件通知写在依赖它的 Effect 中。

**原因：** State 变化不是动作原因；它也可能由恢复、初始化或其他代码产生。

**后果：** 父组件收到重复通知，或在没有点击保存时执行一次保存逻辑。

**错误示例：**

```tsx
const [savedDraft, setSavedDraft] = useState<Draft | null>(null)

/** 错误：通过 Effect 猜测刚刚发生了保存。 */
useEffect(() => {
  if (savedDraft) onSave(savedDraft)
}, [savedDraft, onSave])
```

**正确写法：**

```tsx
/** 正确：保存事件直接把事实交给父组件。 */
function handleSave(): void {
  onSave({ title })
}
```

**验证方式：** 子组件普通重新渲染、重新挂载和恢复数据都不触发保存；只有点击保存按钮才通知一次。

### 错误：用多个 Effect 串联派生 State

**触发条件：** 一个 Effect 设置小计，另一个设置折扣，第三个设置总价。

**原因：** 多份 State 只是同一输入的中间结果，不是独立事实。

**后果：** 产生多轮 render 和多个短暂中间快照，依赖任一环节遗漏都会失步。

**错误示例：**

```tsx
useEffect(() => setSubtotal(price * quantity), [price, quantity])
useEffect(() => setDiscount(subtotal > 200 ? 20 : 0), [subtotal])
useEffect(() => setTotal(subtotal - discount), [subtotal, discount])
```

**正确写法：**

```tsx
/** 一次纯计算返回完整的订单摘要。 */
const summary = calculateOrderSummary(price, quantity)
```

**验证方式：** 任一输入变化只产生当前快照的完整摘要，不需要观察中间 State 或等待 Effect 链。

### 错误：用 `useMemo` 掩盖错误的数据流

**触发条件：** 为了避免修正 State 结构，把派生 State、事件中转或外部对象放进 `useMemo`。

**原因：** `useMemo` 只缓存纯计算返回值，不提供事件触发、资源清理或语义上的永久缓存。

**后果：** 代码看似“只算一次”，但动作仍可能在错误阶段发生，缓存也可能被 React 丢弃并重新计算。

**错误示例：**

```tsx
/** 错误：把发送通知伪装成缓存计算。 */
const notification = useMemo(() => sendNotification(message), [message])
```

**正确写法：**

```tsx
/** 正确：只有昂贵且纯净的计算才考虑缓存。 */
const visibleItems = useMemo(() => filterLargeList(items, query), [items, query])
```

**验证方式：** 缓存函数没有外部副作用；删除 `useMemo` 后结果仍正确，只是需要根据测量决定是否保留缓存。

### 错误：删除所有 Effect

**触发条件：** 看到“可能不需要 Effect”后，把播放器、订阅、连接或外部 Widget 的同步也移进 render。

**原因：** 本课只删除没有外部同步对象的 Effect；真正的外部系统仍需要提交后的同步阶段。

**后果：** render 失去纯度，外部系统可能收到未提交值，资源生命周期也无人负责。

**错误示例：**

```tsx
/** 错误：在 render 中直接修改 React 不控制的播放器。 */
function Player({ playing }: { playing: boolean }) {
  player.setPlaying(playing)
  return <p>{playing ? '播放中' : '已暂停'}</p>
}
```

**正确写法：**

```tsx
/** 正确：外部播放器仍由 Effect 在提交后同步。 */
function Player({ playing }: { playing: boolean }) {
  useEffect(() => {
    player.setPlaying(playing)
  }, [playing])
  return <p>{playing ? '播放中' : '已暂停'}</p>
}
```

**验证方式：** 先确认是否存在 React 不控制的同步对象；存在时保留匹配的同步 API，不存在时使用 render 或事件处理器。

### 错误：把一次请求误写成状态观察器

**触发条件：** 点击搜索只设置 `shouldSearch`，由 Effect 观察它后发请求。

**原因：** 请求原因是点击事件，不是 `shouldSearch` 这个中转 State。

**后果：** 恢复页面、重挂载或其他逻辑把标记设为真时，可能无意间再次请求。

**错误示例：**

```tsx
const [shouldSearch, setShouldSearch] = useState(false)

/** 错误：用中转 State 隐藏请求的真实触发原因。 */
useEffect(() => {
  if (shouldSearch) fetchResults(query)
}, [shouldSearch, query])
```

**正确写法：**

```tsx
/** 正确：搜索请求由用户点击直接启动。 */
function handleSearch(): void {
  void fetchResults(query)
}
```

**验证方式：** 页面恢复或普通 render 不发起搜索；点击搜索按钮才发起一次，结果处理和取消策略位于请求边界。
:::

## 十二、源码推导与适用场景

1. **官方事实：** React 文档把纯数据转换、用户事件和外部系统同步区分为不同问题；`useEffect` 的公开职责是
   在提交后与外部系统同步。**课程推导：** 先判断是否存在外部系统，再决定是否需要 Effect。**边界：** 这不是
   “Effect 永远不能执行业务代码”的绝对规则，关键是业务代码是否确实属于外部同步或由事件直接触发。
2. **固定版本事实：** React `v19.2.8` 的 commit 实现会在提交阶段调用 Effect setup，官方测试先观察已提交输出，
   再观察 passive Effect。**课程推导：** 用 Effect 写派生 State 会产生提交后的级联路径。**边界：** Fiber 函数、
   flags 和测试调度器不是应用代码可以依赖的公共 API。
3. **官方事实：** React 用组件身份和 `key` 判断 State 是否保留；身份改变可以建立新的 State 边界。**课程推导：**
   切换完整编辑对象时，用 `key` 比 Effect 逐项清空更直接。**边界：** `key` 改变会丢弃子树局部 State，不能用于掩盖
   本应共享或持久化的数据。
4. **官方事实：** `useMemo` 缓存依赖不变时的纯计算结果，React 不把它当作语义存储。**课程推导：** 先写正确的直接
   计算，再用测量决定是否缓存。**边界：** 缓存可能重新计算，副作用、请求、订阅和 State 同步不能放进 `useMemo`。
5. **适用场景：** 表单摘要、筛选标签、按钮提交、编辑器重置和父子事件通知适合本课判断；播放器、订阅、连接、
   外部 Store 和显示期间的数据同步仍使用匹配的 Effect 或专门 API。

## 十三、练习

:::exercise
### 练习一：删除派生 State

**要求：** 找出一个同时保存 `items`、`query` 和 `visibleItems` 的组件。删除 `visibleItems` State 以及同步它的
Effect，改为在 render 中得到过滤结果；只有当过滤和排序确实昂贵时，才说明选择 `useMemo` 的证据。

**验收：** 输入、清空和替换商品数组后，显示结果始终来自同一个当前快照；组件中没有为了派生列表而存在的 setter 或
Effect；简单计算不额外引入缓存。
:::

:::exercise
### 练习二：建立 State 重置边界

**要求：** 把一个可编辑联系人组件放进联系人详情页。切换联系人时，使用 `key={contact.id}` 让草稿、错误和展开状态
一起重置；不要通过 Effect 逐项复制 Props。

**验收：** 联系人 A 的未保存草稿不会出现在联系人 B；同一联系人切换无关父组件 State 时草稿仍保留；重置原因和组件
身份边界可以在代码中直接指出。
:::

:::exercise
### 练习三：把父子通知放回事件

**要求：** 将“子组件 State 变化后由 Effect 通知父组件”的保存流程改为保存按钮事件直接调用 `onSave`。如果父组件
需要实时拥有输入值，改成受控 Props；如果只需要保存时知道值，就保留子组件局部草稿。

**验收：** 普通 render、恢复和重新挂载不触发保存；一次点击只调用一次 `onSave`；数据只有一个明确拥有者。
:::

:::exercise
### 练习四：拆掉 Effect 链

**要求：** 将“设置订单状态 -> Effect 生成提示 -> Effect 清空输入”的链条改成一个事件处理器，或者把纯派生值改为
一次计算。保留真正的异步请求边界，并说明它由点击触发还是由组件显示期间同步触发。

**验收：** 每个 State 都能说明自己是源事实、交互结果还是外部响应；没有只为触发下一个 Effect 而存在的中间 State；
请求和外部资源仍有自己的取消或清理策略。
:::

## 十四、本节小结

- 先问“是否存在 React 不控制的外部系统”，再决定是否需要 Effect。
- 当前输入能纯计算出的结果留在 render，不复制成第二份 State。
- 一次明确用户动作由事件处理器直接执行，并保留它的真实原因。
- 整棵局部子树需要换身份时用 `key` 重置；需要共享事实时提升 State 或使用受控边界。
- 子组件在事件中通知父组件，不通过 Effect 观察结果 State 来猜测发生了什么。
- `useMemo` 只缓存昂贵的纯计算，不能替代正确的数据流和资源同步。
- 删除不必要 Effect 不等于删除播放器、订阅、连接、外部 Store 或其他真正的同步机制。

## 十五、参考资料

- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - 支撑纯数据转换、事件处理、
  State 重置、父子通知和 Effect 链的判断。
- [`useEffect`](https://react.dev/reference/react/useEffect) - 支撑 Effect 的外部系统职责和提交后阶段。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) -
  支撑 render 幂等和非局部副作用边界。
- [`useMemo`](https://react.dev/reference/react/useMemo) - 支撑纯计算缓存和非语义存储边界。
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) - 支撑 key 与 State 身份。
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) - 支撑提升 State 和
  受控数据流。
- [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore) - 支撑外部 Store 订阅边界。
- [React v19.2.8 ReactFiberCommitEffects](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactFiberCommitEffects.js#L141-L177) -
  支撑固定版本提交阶段调用 Effect setup 的内部证据。
- [React v19.2.8 Effect tests](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/__tests__/ReactHooksWithNoopRenderer-test.js#L914-L940) -
  支撑已提交输出先于 passive Effect 的测试证据。
