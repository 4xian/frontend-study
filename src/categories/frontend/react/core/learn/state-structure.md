---
id: react.core.learn.intermediate.state-structure
type: lesson
title: State 结构
summary: 用最小事实组织 State，并从当前输入直接派生结果，避免矛盾、重复和过深嵌套。
domain: frontend
technology: react
module: core
stage: intermediate
level: intermediate
estimatedMinutes: 70
prerequisites:
  - react.core.learn.basics.state-ownership-and-thinking-in-react
related:
  - react.core.learn.basics.component-purity
  - react.core.learn.basics.use-state
  - react.core.learn.basics.immutable-state-updates
  - react.core.learn.basics.state-ownership-and-thinking-in-react
tags:
  - React
  - State
  - State 结构
  - 派生值
  - 判别联合
  - 数据建模
appliesTo: React 19.2 官方文档与 React 19
verifiedAt: 2026-08-16
objectives:
  - 能从候选数据中找出必须跨 render 记住的最小事实。
  - 能根据共同更新关系决定合并或拆分 State，并用互斥模型排除矛盾状态。
  - 能从当前 Props 与 State 直接得到同步派生值，不再保存或事后同步第二份结果。
  - 能保持派生计算纯净，不修改 Props、State 或其他既有数据。
  - 能用稳定 ID 表达选择关系，让实体内容保持唯一来源。
  - 能识别重复数据、Props 镜像、悬空 ID 和深层嵌套，并写出结构不变量。
recap:
  - 总是一起更新的事实可以合并；独立生命周期和所有权的事实可以拆开。
  - 互斥流程用一个枚举或判别联合表达，避免多个布尔值产生不可能组合。
  - 能从当前 Props 或 State 同步计算出的结果直接在 render 中派生，不另存为 State。
  - 派生计算应保持纯净，不修改输入，也不需要在提交后再同步结果。
  - 列表中已有对象时，选择关系保存稳定 ID，实体内容只保留一份。
  - 深层嵌套在局部更新困难或实体重复时可改成按 ID 的扁平结构。
  - 每个更新入口都要保持合法状态、ID 可解析和唯一事实来源等结构不变量。
  - 普通 Props 不要镜像成持续同步的 State；只读取初始值时应明确命名并说明边界。
sources:
  - title: Choosing the State Structure
    url: https://react.dev/learn/choosing-the-state-structure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 相关 State 分组与独立 State 的判断
      - 避免矛盾、冗余、重复和深层嵌套
      - 使用 ID 代替重复对象
      - Props mirror 的初始值边界
  - title: Updating Objects in State
    url: https://react.dev/learn/updating-objects-in-state
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 对象 State 更新是替换而不是自动合并
      - 通过复制创建不可变更新
  - title: useState
    url: https://react.dev/reference/react/useState
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 初始值只在初始化时读取
      - setter 请求后续 render 使用的新 State
  - title: You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 数据转换应在 render 中完成
      - 用 Effect 同步派生 State 会产生陈旧结果和额外 render
  - title: Components and Hooks must be pure
    url: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - render 计算必须幂等且不能修改非局部输入
  - title: Rendering Lists
    url: https://react.dev/learn/rendering-lists
    sourceType: official-reference
    appliesTo: React 19.2
    claims:
      - 列表 key 表达同级列表项的渲染身份
      - key 通常来自稳定数据且不会作为普通 Prop 传入
  - title: TypeScript Narrowing
    url: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    sourceType: official-reference
    appliesTo: TypeScript 6.0
    claims:
      - 共同字面量判别属性构成判别联合
      - 检查判别属性后收窄到对应成员
---

# State 结构

## 学习目标

- 从候选数据中找出必须跨 render 记住的最小事实。
- 根据共同更新关系决定合并或拆分 State，并用互斥模型排除矛盾状态。
- 从当前 Props 与 State 直接得到同步派生值，不再保存或事后同步第二份结果。
- 保持派生计算纯净，不修改 Props、State 或其他既有数据。
- 用稳定 ID 表达选择关系，让实体内容保持唯一来源。
- 识别重复数据、Props 镜像、悬空 ID 和深层嵌套，并写出结构不变量。

## 为什么需要设计 State 结构

State 不只是“需要记住的几个变量”。它还规定了这些变量之间允许怎样的关系。比如一个工单表单至少
需要保存主题、描述、分类和提交结果。若提交结果用 `isSubmitting`、`isSubmitted` 和
`errorMessage` 三个独立字段表示，代码可能产生“已提交但仍在提交”或“成功却有错误信息”的组合。
若把当前分类的完整对象再复制一份，编辑分类列表后两个对象也可能不同步。

好的结构让不合法的组合难以表达，让一次更新只需要修改真正的事实。筛选结果、统计数量、当前分类等
能够从本次 Props 与 State 得到的结果直接计算，不再形成第二份可写数据。React 不会替你选择对象、
数组或联合类型；这些是应用对 State 的建模决定。

## 一、先找出真正需要记住的事实

### 1. State 结构不是页面字段清单

页面上显示的每个值都不一定需要 State。先列出交互后必须保留的事实，再把其余值分类：

| 候选值 | 是否需要记住 | 判断 |
| --- | --- | --- |
| 工单主题 | 是 | 用户输入后不能由其他事实推回。 |
| 工单描述 | 是 | 用户输入后不能由其他事实推回。 |
| 分类 ID | 是 | 用户的选择是独立事实。 |
| 当前分类对象 | 否 | 可以由分类列表和分类 ID 查找得到。 |
| 主题长度 | 否 | 可以在 render 中由主题计算。 |
| 提交阶段 | 是 | UI 需要记住当前流程处于哪个合法阶段。 |

“会变化”不是唯一标准。当前分类对象也会随列表变化，但它是已有事实的查找结果，不应成为第二份
可写 State。

### 2. 先写关系，再决定形状

对每个候选值问四个问题：

1. 哪些字段总是在同一个交互中一起改变？
2. 哪些状态阶段互相排斥，不能同时成立？
3. 哪些值能从当前 Props 或 State 计算出来？
4. 哪些对象或字段在多个位置重复出现？

回答这些问题后，再选择拆分、合并、枚举、ID 或扁平结构。不要先凭习惯把所有字段塞进一个大对象，
也不要先为每个输入框创建一个互不相关的布尔值。

## 二、相关 State：一起变化才考虑合并

### 1. 合并表示一起变化的事实

鼠标位置的 `x` 和 `y` 总是由同一次移动更新，可以把它们作为一个对象：

```tsx
import { useState } from 'react'

/** 用一次更新同时保存指针的两个坐标。 */
export function PointerPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <div
      onPointerMove={(event) =>
        setPosition({ x: event.clientX, y: event.clientY })
      }
    >
      x: {position.x}, y: {position.y}
    </div>
  )
}
```

这里合并的理由不是“对象更现代”，而是 `x`、`y` 代表同一个位置，每次移动必须保持同一快照。
表单中始终一起编辑的一组字段也可以使用对象：

```tsx
interface Draft {
  subject: string
  detail: string
}

const [draft, setDraft] = useState<Draft>({ subject: '', detail: '' })
```

### 2. 对象 State 不会自动合并

State setter 接收的是下一份完整对象。下面的写法会让 `y` 消失：

```tsx
// 错误：下一份对象只有 x，没有保留 y。
setPosition({ x: 100 })
```

更新单个字段时复制当前对象：

```tsx
/** 保留其他字段，只替换当前位置的 x。 */
function moveHorizontally(nextX: number) {
  setPosition((current) => ({ ...current, x: nextX }))
}
```

这与基础课程中的对象不可变更新相同：不要直接改变旧对象，也不要把“部分对象”误当成自动合并补丁。

### 3. 什么时候保持独立

如果两个值有不同的生命周期、更新入口或所有者，拆开更清楚。例如搜索关键词和“只看有货”开关虽然
都用于筛选，但用户可以只改变其中一项，也可以分别重置。它们不需要被包进一个大对象：

```tsx
const [query, setQuery] = useState('')
const [onlyInStock, setOnlyInStock] = useState(false)
```

判断标准是“是否总是一起更新”，而不是对象字段数量。合并后若每次更新都要携带大量无关字段，或字段
由不同组件拥有，保持独立即可。

## 三、避免互相矛盾的 State

### 1. 多个布尔值会允许不可能状态

以下模型允许两个值同时为 `true`：

```tsx
const [isSending, setIsSending] = useState(false)
const [isSent, setIsSent] = useState(false)
```

但一个请求不应该同时处于“发送中”和“已发送”。如果每条更新路径都要手动保证两者互斥，遗漏一次
就会让 UI 进入难以解释的状态。

### 2. 用一个状态枚举表达合法阶段

把互斥事实放在一个 State 中：

```tsx
type SubmissionState =
  | { status: 'editing' }
  | { status: 'sending' }
  | { status: 'sent'; reference: string }
  | { status: 'error'; message: string }

const [submission, setSubmission] = useState<SubmissionState>({ status: 'editing' })
```

现在 `submission.status` 只能是四个阶段之一。成功分支必须带 `reference`，错误分支必须带
`message`；代码不会在编辑阶段读取一个不存在的成功编号。

渲染时可以声明可读的常量，但不要把它们再次保存成 State：

```tsx
const isSending = submission.status === 'sending'
const isSent = submission.status === 'sent'
```

这两个布尔值每次 render 都由同一份 `submission` 得到，因此不会与它分叉。

### 3. 状态模型必须反映真实流程

不要为了减少字段而把所有内容都塞进一个含糊的字符串。例如“失败”和“成功”通常需要不同的附加数据，
用判别联合表达它们比 `status` 加一堆可选字段更容易检查。相反，如果两个字段确实可以独立存在，就不
要人为合并成一个枚举。结构要忠实于领域关系。

## 四、排除冗余与重复

### 1. 区分源事实与同步派生值

源事实是交互后必须跨 render 保留、又不能从当前其他输入恢复的数据。派生值则能由当前 Props、State
或稳定数据同步重新计算。判断重点不是“这个值会不会变化”，而是“只凭当前输入能否得到唯一结果”。

| 候选值 | 角色 | 原因 |
| --- | --- | --- |
| 搜索词 | State | 用户输入后不能从商品列表推回。 |
| 只看有货 | State | 表示用户当前选择的筛选条件。 |
| 规范化搜索词 | 派生值 | 可由搜索词执行去空格和大小写处理得到。 |
| 筛选结果 | 派生值 | 可由商品、搜索词和有货条件得到。 |
| 匹配数量 | 派生值 | 等于当前筛选结果的长度。 |
| 是否存在结果 | 派生值 | 可由匹配数量与零比较得到。 |

### 2. 普通常量会随每次 render 重新计算

`fullName` 可以由姓名字段得到，不需要 initializer、setter 或同步入口：

```tsx
const [firstName, setFirstName] = useState('Ada')
const [lastName, setLastName] = useState('Lovelace')

const fullName = `${firstName} ${lastName}`.trim()
const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`
```

任一 State 改变后，组件函数会用本次快照重新执行，`fullName` 和 `initials` 自然得到当前结果。普通
局部常量并不是固定不变的全局数据；它只在当前一次 render 内保持不变。

筛选、排序和聚合也可以直接表达计算关系：

```tsx
const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
const visibleProducts = products
  .filter((product) => product.name.toLocaleLowerCase('zh-CN').includes(normalizedQuery))
  .filter((product) => !onlyAvailable || product.stock > 0)
const matchCount = visibleProducts.length
const totalPrice = visibleProducts.reduce((total, product) => total + product.price, 0)
```

这段结构只为源事实提供 setter。查询变化后，筛选结果、数量和总价在同一次 render 中保持一致。

### 3. 派生计算必须保持纯净

派生计算可以创建新数组、对象和局部变量，但不能修改 Props、State 或其他在调用前已经存在的数据。
例如 `sort()` 会原地改变数组，不能直接作用于 Prop：

```tsx
// 错误：修改了调用方提供的 products。
const rankedProducts = products.sort((left, right) => left.price - right.price)

// 正确：排序本次计算创建的新数组。
const rankedProducts = [...products].sort((left, right) => left.price - right.price)
```

第二种写法中的局部变异不会逃出本次计算。只要输入相同，计算结果也相同，并且旧输入保持不变，就符合
render 的纯度要求。随机数、当前时间、修改模块变量和写入浏览器存储都不是同步派生计算。

### 4. 不要在提交后同步派生 State

把 `visibleProducts` 或 `fullName` 另存为 State，会让同一结果出现“源输入”和“结果副本”两种表示。
每条更新路径都必须同时更新两者，遗漏一次就会产生旧结果。即使再通过 Effect 监听源输入并修补结果，
React 仍会先用旧副本完成一轮 render，提交后再设置结果并触发另一轮 render。

同步派生值应在组件执行时直接计算。只有不能由当前输入同步恢复、并且确实需要跨 render 保留的数据，
才应拥有自己的 State，例如用户尚未提交的独立草稿、服务端返回结果或明确的流程阶段。

### 5. 不要把普通 Props 镜像成 State

下面的 State 只读取第一次 render 的 Prop：

```tsx
interface MessageProps {
  messageColor: string
}

/** 错误：把持续变化的 Prop 复制为不会自动同步的 State。 */
function Message({ messageColor }: MessageProps) {
  const [color] = useState(messageColor)
  return <p style={{ color }}>消息</p>
}
```

默认直接使用 `messageColor`。只有“初始值作为本地草稿，后续 Prop 变化有意忽略”时才应复制，并通过
命名说明这个合同：

```tsx
interface ColorEditorProps {
  initialColor: string
}

/** 有意只读取初始颜色，后续由组件自己的编辑 State 负责。 */
function ColorEditor({ initialColor }: ColorEditorProps) {
  const [color, setColor] = useState(initialColor)
  return (
    <input
      type="color"
      value={color}
      onChange={(event) => setColor(event.currentTarget.value)}
    />
  )
}
```

`initialColor` 的语义是“初始化输入”，不是“持续同步输入”。如果需要持续同步，应让父组件拥有 State，
通过 `color` 和 `onColorChange` Props 驱动子组件。

### 6. 选择 ID，而不是复制整个对象

列表已有对象时，选择关系只需要一个稳定 ID：

```tsx
interface Item {
  id: string
  title: string
}

const [items, setItems] = useState<Item[]>([
  { id: 'one', title: '第一项' },
  { id: 'two', title: '第二项' },
])
const [selectedId, setSelectedId] = useState('one')
const selectedItem = items.find((item) => item.id === selectedId)
```

错误模型是同时保存 `items` 和 `selectedItem` 对象。编辑 `items` 后，如果忘记更新 `selectedItem`，
列表和详情就会显示两个版本。保存 `selectedId` 后，列表改变会触发 render，`find` 会自动取到最新对象。

如果对象被删除，`selectedItem` 可能是 `undefined`。此时应显示“未选择”或在更新列表时选择有效 ID，
而不是复制对象来绕过缺失关系。

实体 ID、对象引用和列表 `key` 解决的是不同问题：

| 概念 | 表达什么 | 内容变化时的行为 |
| --- | --- | --- |
| 实体 ID | 业务实体或实体关系 | 实体字段改变时通常保持稳定，可继续用于查找。 |
| 对象引用 | 一次 JavaScript 对象值 | 不可变更新会为被修改实体创建新引用，旧引用仍指向旧内容。 |
| 列表 `key` | React 同级列表项的渲染身份 | 通常复用实体 ID，但不会自动成为组件收到的普通 Prop。 |

保存完整对象不能替代稳定 ID：对象更新后旧副本会过期。给列表添加 `key` 也不会自动删除 State 中的
重复对象，更不会自动处理已经失效的 `selectedId`。

## 五、避免过深嵌套

### 1. 深层树让更新沿途复制

下面的形状把每个子地点嵌套在父地点内：

```tsx
interface Place {
  id: string
  title: string
  childPlaces: Place[]
}

const [travelPlan, setTravelPlan] = useState<Place>(initialTravelPlan)
```

更新最底层城市时，需要找到并复制根、洲、国家和城市的每一层。层级越深，越容易漏掉一个分支或复制
错误的对象。

### 2. 用稳定 ID 表达实体关系

需要独立编辑的实体可以按 ID 存放，父子关系另用 ID 列表表达：

```tsx
interface PlaceRecord {
  id: string
  title: string
  childIds: string[]
}

interface TravelPlanState {
  byId: Record<string, PlaceRecord>
  rootId: string
}
```

这种形状让“实体内容”和“关系”各有明确位置。更新一个 `PlaceRecord` 时只替换 `byId` 中对应的条目，
不需要复制整棵树。它不是要求所有数据都改成全局字典：如果数据很小、不会独立编辑且嵌套能清楚表达关系，
简单嵌套仍然可以接受。

### 3. 什么时候不要扁平化

不要为了“看起来高级”把一次性使用的小对象全部拆成 ID。扁平化主要解决三类问题：深层更新复杂、同一
实体在多处重复、实体需要独立查找或编辑。没有这些问题时，直接的对象结构更容易阅读。

### 4. 扁平结构必须保持引用完整

扁平化减少了深层复制，但同时把关系写成了 ID。每次更新都要保持以下条件：

- `byId` 中每个键唯一，并与实体自己的 `id` 一致。
- `rootId` 能在 `byId` 中找到根实体。
- 每个 `childId` 都能解析到现有实体。
- 删除实体时，同时从父实体的 `childIds` 中删除对应关系。
- 移动实体时，旧父关系被移除，新父关系只增加一次。

这些条件是结构的一部分。若只删除 `byId[removedId]`，却保留父级中的 `removedId`，遍历关系时仍会
得到不存在的实体。扁平结构不是“只建一个字典”，而是让实体内容与实体关系分别拥有明确的唯一来源。

## 六、用一张清单决定 State 形状

State 不变量是每次更新前后都必须成立的条件。例如工单编辑器可以规定：提交阶段只能有一个；成功阶段
一定包含编号；分类 ID 必须指向现有分类；显示的完成度只由当前草稿计算。结构设计的目标，是让这些
条件尽量由一个字段、一个联合类型或一条派生关系直接保证，而不是依赖多个 setter 恰好按正确顺序调用。

设计一份 State 前按以下顺序检查：

1. 写出交互后必须记住的最小事实，不先写展示结果。
2. 标出总是一起变化的字段，决定是否合并。
3. 把互斥阶段改成一个枚举或判别联合。
4. 删除能由 Props 和现有 State 计算的字段。
5. 用 ID 表达选择与引用，不复制已存在对象。
6. 检查嵌套更新是否需要沿多层复制；必要时按 ID 扁平化。
7. 明确每个 Prop 是持续输入还是 `initial`/`default` 初始值合同。
8. 为每种合法状态写一个可以观察的 UI 结果，并尝试找出不应成立的组合。
9. 写出必须始终成立的不变量，逐个检查创建、编辑、删除、重置和提交入口。
10. 若关系使用 ID，检查所有 ID 是否唯一、可解析，并在删除或移动实体时同步更新关系。

检查更新入口时，不只看“按钮点了有没有变化”，还要问更新后哪些条件仍然成立：

```tsx
/** 删除课程，并让已经失效的选择回到未选择状态。 */
function removeCourse(courseId: string) {
  setCourses((current) => current.filter((course) => course.id !== courseId))
  setSelectedId((current) => (current === courseId ? null : current))
}
```

这里的两个 setter 维护的是同一个引用完整性不变量：`selectedId` 要么是 `null`，要么能在课程集合中
找到对应实体。若删除操作漏掉第二步，结构就会留下悬空 ID；渲染层即使提供 fallback，也没有修复数据
关系本身。

## 七、组合 Demo：观察 State 结构

本 Demo 用一个本地工单编辑器组合四个观察点：

1. `draft` 把总是一起编辑的主题和描述作为一份对象 State。
2. `submission` 用 `editing`、`success`、`error` 表达互斥阶段，不维护互相矛盾的布尔值。
3. 分类列表只保存一次，选择只保存 `selectedCategoryId`，当前分类由 ID 在 render 中查找。
4. 规范化主题、描述长度、完成度和预览内容都由当前 `draft` 与分类直接计算，没有额外 setter。

编辑主题或描述会更新 `draft`；切换分类只更新 ID；主题为空或描述不足十二个字符时提交进入 error；
有效草稿进入 success；任何编辑都会回到 editing。页面会同步显示完成度、字符数和预览，源码中只有
三份源 State，没有为这些结果设置额外 State。

:::demo{id="react.core.learn.intermediate.state-structure.state-model-demo"}
:::

阅读源码时先找三个 `useState`，再分别检查共同更新、互斥阶段和 ID 引用。随后查找普通局部常量，确认
分类对象、完成度、字符数和预览都由当前输入直接得到，且没有对应 setter。

## 八、易错使用提示

:::pitfalls
### 错误一：把总是一起变化的字段拆成互不相关的 State

**触发条件：** `x` 和 `y` 每次都由同一个交互更新，却由两个 setter 分别保存。

**原因：** 没有把一次交互视为一个原子事实。

**后果：** 某条更新路径漏掉一个 setter，出现半更新的坐标组合。

**错误示例：**

```tsx
const [x, setX] = useState(0)
const [y, setY] = useState(0)
```

**正确写法：**

```tsx
const [position, setPosition] = useState({ x: 0, y: 0 })
```

**验证方式：** 逐个交互路径检查两个字段是否同轮更新；检查代码不存在遗漏的单字段更新入口。

### 错误二：把无关字段强行合并进一个对象

**触发条件：** `index` 和 `showMore` 由不同交互改变，却被放入同一个 State 对象。

**原因：** 把“相关 State 可以合并”误读成“所有 State 都应该集中”。

**后果：** 局部更新需要携带无关字段，独立重置、检查和组件所有权边界变得模糊。

**错误示例：**

```tsx
const [state, setState] = useState({ index: 0, showMore: false })
```

**正确写法：**

```tsx
const [index, setIndex] = useState(0)
const [showMore, setShowMore] = useState(false)
```

**验证方式：** 为每个字段列出触发它的交互；没有共同更新合同的字段应能独立更新和重置。

### 错误三：误以为对象 setter 会自动合并字段

**触发条件：** 使用 `setPosition({ x: nextX })` 更新对象中的一个字段。

**原因：** React 的 State setter 接收下一份值，不会像某些旧式状态 API 那样自动浅合并对象。

**后果：** 未出现在新对象中的字段被删除，读取 `position.y` 时得到错误结果。

**错误示例：**

```tsx
setPosition({ x: 100 })
```

**正确写法：**

```tsx
setPosition((current) => ({ ...current, x: 100 }))
```

**验证方式：** 更新一个字段后检查其他字段仍存在；展示源码中应能看到复制旧对象的步骤。

### 错误四：直接变异对象或把展开语法当成深复制

**触发条件：** 直接改写 `person.artwork.city`，或只复制外层对象后继续变异原来的嵌套对象。

**原因：** State 应视为只读快照，而对象展开只复制一层，不会递归复制嵌套引用。

**后果：** 旧 render 快照和共享引用被污染，React 也可能因根对象引用未变而跳过必要更新。

**错误示例：**

```tsx
person.artwork.city = 'New Delhi'
setPerson(person)
```

**正确写法：**

```tsx
setPerson((person) => ({
  ...person,
  artwork: { ...person.artwork, city: 'New Delhi' },
}))
```

**验证方式：** 检查从修改点到根的每一层都是新对象，并确认更新前的对象没有被写入。

### 错误五：用多个布尔值表达互斥流程

**触发条件：** 同时保存 `isSending`、`isSent` 或类似互斥阶段的布尔值。

**原因：** 每个 setter 都能独立改变一个布尔值，类型没有阻止不合法组合。

**后果：** 两个阶段同时为真，渲染分支和按钮禁用逻辑互相矛盾。

**错误示例：**

```tsx
const [isSending, setIsSending] = useState(false)
const [isSent, setIsSent] = useState(false)
```

**正确写法：**

```tsx
type SubmissionState =
  | { status: 'editing' }
  | { status: 'sending' }
  | { status: 'sent'; reference: string }

const [submission, setSubmission] = useState<SubmissionState>({ status: 'editing' })
```

**验证方式：** 枚举所有合法阶段，逐一检查是否能用 State 表示且任意两阶段不能同时成立。

### 错误六：把可计算值保存成冗余 State

**触发条件：** 为 `fullName`、筛选列表或数量额外创建 State 和 setter。

**原因：** 把 render 结果误当成必须记住的事实。

**后果：** 输入变化后需要同步多个 setter，遗漏路径会显示过期值。

**错误示例：**

```tsx
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const [fullName, setFullName] = useState('')
```

**正确写法：**

```tsx
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const fullName = `${firstName} ${lastName}`.trim()
```

**验证方式：** 写出结果的全部输入；如果当前 render 已有这些输入，删除结果 State 并检查每次更新。

### 错误七：用 Effect 修补派生 State

**触发条件：** 已经保存筛选条件，又在 Effect 中把筛选结果写入另一个 State。

**原因：** 把同一次 render 内的数据转换误当成提交后的同步工作。

**后果：** 输入先和旧结果一起 render，Effect 再触发第二轮更新；结果副本与依赖列表都需要维护。

**错误示例：**

```tsx
const [visibleCourses, setVisibleCourses] = useState<Course[]>([])

useEffect(() => {
  setVisibleCourses(filterCourses(courses, keyword))
}, [courses, keyword])
```

**正确写法：**

```tsx
const visibleCourses = filterCourses(courses, keyword)
```

**验证方式：** 修改任一输入后，当前 render 直接得到对应结果；源码中不存在只为同步结果服务的 State。

### 错误八：把列表对象复制成 selectedItem

**触发条件：** `items` 已经保存对象，却又把选中的完整对象存进 `selectedItem` State。

**原因：** 同一个实体出现两个可变副本，编辑列表时不会自动更新副本。

**后果：** 列表显示新标题，详情仍显示旧标题，开发者必须维护额外同步路径。

**错误示例：**

```tsx
const [items, setItems] = useState<Item[]>(initialItems)
const [selectedItem, setSelectedItem] = useState(items[0])
```

**正确写法：**

```tsx
const [items, setItems] = useState<Item[]>(initialItems)
const [selectedId, setSelectedId] = useState(initialItems[0].id)
const selectedItem = items.find((item) => item.id === selectedId)
```

**验证方式：** 编辑当前选中项并同时检查列表和详情；确认详情随实体新引用更新且没有对象 setter。

### 错误九：普通 Props 镜像成持续同步的 State

**触发条件：** 用 `useState(color)` 接收普通 `color` Prop，并期待父组件之后改色时子组件自动跟随。

**原因：** 初始值只在 State 初始化时读取，后续 Prop 变化不会重新初始化 State。

**后果：** 父组件和子组件显示不同颜色，修复者可能再引入额外同步逻辑。

**错误示例：**

```tsx
/** 错误地把持续输入的 Prop 复制为本地 State。 */
function Message({ color }: { color: string }) {
  const [localColor] = useState(color)
  return <p style={{ color: localColor }}>消息</p>
}
```

**正确写法：**

```tsx
/** 直接渲染父组件提供的当前颜色。 */
function Message({ color }: { color: string }) {
  return <p style={{ color }}>消息</p>
}
```

**验证方式：** 在父组件中改变 `color`；子组件应在下一次 render 显示新值。若需求是只取初始值，改名为
`initialColor` 或 `defaultColor` 并在组件合同中明确忽略后续变化。

### 错误十：把所有数据机械地深层嵌套

**触发条件：** 每个实体都放进父实体的 `children`，更新叶子节点必须复制多层对象。

**原因：** 数据关系和实体内容被绑在一棵难以局部更新的树中。

**后果：** 更新函数变长，容易漏掉中间层或错误分支，实体在多个位置出现时还会重复。

**错误示例：**

```tsx
type Place = { id: string; title: string; childPlaces: Place[] }
const [plan, setPlan] = useState<Place>(initialPlan)
```

**正确写法：**

```tsx
type PlaceRecord = { id: string; title: string; childIds: string[] }
type PlanState = { byId: Record<string, PlaceRecord>; rootId: string }
```

**验证方式：** 尝试只改一个叶子实体；若需要沿多层复制且实体有稳定 ID，评估按 ID 扁平化的成本与收益。

### 错误十一：为了扁平化而引入不必要的全局结构

**触发条件：** 看到任何嵌套对象就拆成全局字典或外部状态容器。

**原因：** “避免深层嵌套”是更新和重复问题的指导原则，不是所有数据都必须归一化的 API 要求。

**后果：** 小对象的阅读成本变高，局部事实被迫穿过无关层级，模型反而更难理解。

**错误示例：**

```tsx
const [cardsById, setCardsById] = useState({
  onlyCard: { id: 'onlyCard', title: '只使用一次的卡片' },
})
const [visibleCardIds, setVisibleCardIds] = useState(['onlyCard'])
```

**正确写法：**

```tsx
const [singleCard, setSingleCard] = useState({ title: '只使用一次的卡片' })
```

**验证方式：** 只有在存在深层更新、重复实体或独立查找需求时才扁平化；否则保留最容易读懂的局部结构。
:::

## 九、源码推导与适用场景

### 1. 官方事实

- React 官方把“合并相关 State、避免矛盾、避免冗余、避免重复、避免深层嵌套”列为 State 结构原则。
- 对象 State 是需要显式创建下一份对象的快照，setter 不会自动合并遗漏字段。
- 初始 State 只用于初始化；普通 Props 后续变化不会让已存在的 State 自动重新初始化。
- 通过 ID 保存选择关系可以避免复制列表对象；深层关系在局部更新困难时可以使用扁平结构。
- 能由当前 Props 与 State 得到的数据转换应在 render 中完成，而不是保存并在提交后同步。
- render 中的计算必须纯净，同样的输入得到同样的结果，且不修改既有输入。

### 2. 课程推导

- “先写关系再选形状”比“看到字段就创建 State”更容易发现不可能组合。
- TypeScript 判别联合可以把合法状态附带的数据写进类型，帮助编译器和读者检查分支。
- 合并与拆分的边界由共同更新、生命周期和所有权决定；没有万能的对象大小阈值。
- 扁平化应服务于局部更新和唯一来源，不应成为引入全局状态工具的借口。
- 派生链可以连续表达：规范化输入产生筛选结果，筛选结果再产生数量、总价和空状态；只要每一步都来自
  当前输入，就不需要增加可写副本。

### 3. 适用边界

- 这里处理组件内的 State 形状与同步派生，不处理跨组件共享、Context 或外部 store。
- 同步派生首先保证数据模型正确；直接计算应保持清楚、纯净和可验证。
- 对象与数组仍按不可变方式更新；派生计算可以修改自己刚创建、尚未共享的局部副本。
- 服务端结果、浏览器外部系统、数据库规范化和请求生命周期具有不同所有权，不能当作 render 派生值。

## 十、练习

:::exercise
### 为课程筛选页设计 State 结构

**要求：** 候选值为 `courses`、`keyword`、`selectedCourse`、`selectedId`、`isLoading`、`isLoaded`、
`errorMessage` 和 `visibleCourses`。标出必须记住的事实、可计算值和重复对象；把加载阶段改成一个不会
产生互斥错误的状态模型；说明 `courses` 与 `keyword` 是否应该合并；删除 `selectedCourse` 和
`visibleCourses` 的冗余 State，改用 ID 与 render 计算；最后说明三层嵌套分类出现哪种更新痛点时应考虑
`byId` 结构。再为筛选结果计算匹配数量和“是否为空”，保证它们随当前输入直接更新且不修改
`courses`。

**验收：** 每项 State 都有明确的合法值和单一事实来源；没有能在 render 中计算的 setter；修改选中
课程后列表和详情不会出现旧副本；提交或加载阶段不能出现两个互斥状态同时成立；是否扁平化由更新
复杂度说明，而不是机械套用规则；派生计算没有额外 setter，也没有修改源数组。
:::

## 十一、本节小结

- 总是一起更新的事实可以合并；独立生命周期和所有权的事实可以拆开。
- 互斥流程用一个枚举或判别联合表达，避免多个布尔值产生不可能组合。
- 能从当前 Props 或 State 计算出的值直接在 render 中派生，不另存为 State，也不在提交后同步。
- 普通局部常量会在下一次 render 根据当前输入重新计算；派生计算必须保持纯净。
- 列表中已有对象时，选择关系保存稳定 ID，实体内容只保留一份。
- 深层嵌套在局部更新困难或实体重复时可改成按 ID 的扁平结构；没有问题时不要过度设计。
- 普通 Props 不要镜像成持续同步的 State；有意只读取初始值时，用 `initial` 或 `default` 命名并说明边界。
- 每个更新入口都要保持合法状态、ID 可解析和唯一事实来源等结构不变量。

## 参考资料

- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) - State 结构的五条
  原则、互斥状态、冗余与重复数据、ID 选择、深层嵌套和初始 Props 边界。
- [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) - 对象 State 的替换和
  不可变更新方式。
- [useState](https://react.dev/reference/react/useState) - 初始 State 和 setter 的公共语义。
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) - render 数据转换、
  冗余 State 与提交后同步的额外更新。
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) -
  render 幂等、无副作用和不修改非局部输入的规则。
- [Rendering Lists](https://react.dev/learn/rendering-lists) - 稳定列表 `key` 的来源、用途和非 Prop 边界。
- [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) -
  判别联合与分支收窄。
