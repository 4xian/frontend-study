# State 的位置身份研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.state-identity-by-position`
- 标题：State 的位置身份
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 文档基线：React 官方文档 `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：React 怎样用组件在 render tree 中的位置识别 State，为什么相同位置的相同组件
类型会保留 State，而位置上的组件被移除、换成其他类型或由不稳定的组件函数替代时会重新创建 State。

必须覆盖：

1. State 由 React 保存，并与组件在 render tree 中的位置关联，不存放在 JSX 标签、变量名或函数调用里。
2. 同一父级下的树位置与组件类型连续匹配时，重新 render 会保留该位置的 State。
3. 改变 Props、业务名称或 JSX 源码分支，不会单独形成新的组件身份；React 比较的是返回的树。
4. 组件从树中移除时，其 State 被销毁；之后在该位置重新添加同类型组件会从初始 State 开始。
5. 同一位置改为不同组件类型时，旧组件及其整个子树的 State 被重置。
6. 在父组件内部定义子组件函数会在父组件每次 render 时创建不同的组件类型，造成意外重置。
7. 并列渲染的同类型组件位于不同树位置，各自拥有独立 State。

明确排除：使用 `key` 重置 State 的具体写法、列表 key、Reducer、Context、Effect、Ref、缓存、路由、
外部 Store、远程数据、请求状态和持久化。`key` 只作为下一课“使用 key 重置 State”的边界提示；本课
不教授如何选 key 或如何用 key 重置表单和子树。

## 调研问题与边界

本课研究必须回答以下问题：

1. State 实际由谁保存，它怎样对应到屏幕上的组件？
2. “位置”指 JSX 文件中的行号、DOM 坐标，还是 render tree 中相对父级的位置？
3. 同一个组件函数在同一位置再次 render 时，什么条件下保留 State？
4. 改变组件 Props、变量名或业务实体名称，为什么不会自动创建新 State？
5. 条件判断写在一个 JSX 表达式还是两个 `return` 分支中，会不会改变身份？
6. 暂时不渲染组件时，其 State 是否还存在？重新添加后从哪里开始？
7. 同一位置从一种组件类型切换成另一种类型，会影响多大范围的 State？
8. 祖先包装元素类型变化时，为什么内部仍叫同一个名字的组件也会重置？
9. 把同类型组件从一个兄弟位置移动到另一个位置，State 是否会跟随 JSX 标签移动？
10. 为什么父组件内部定义的子组件会在无关父级更新时丢失 State？
11. 并列的两个同类型组件为什么不会共享 State？
12. 怎样用交互、console 和同源源码证明保留与重置来自位置身份，而不是手动同步？

研究边界是“默认的位置身份规则”。本课可以说明显式身份控制另有 `key` 机制，但只能指向下一课；
不能给出 key 重置方案。课程示例只使用局部 `useState` 作为观察探针，不扩展 State 结构设计、共享
所有权、Reducer、Context、Effect、Ref 或外部状态方案。

## 研究方法与证据边界

1. 按仓库外部搜索顺位先使用 Tavily。主流程完成 6 组 `tavily_search`，6/6 返回可靠的 `react.dev`
   候选；`research` skill 的后台只读复核另完成 2 组 search，2/2 成功。合计 8/8，因此没有切换 Exa、
   Parallel、Perplexity 或原生 Web 搜索。
2. 主流程完成 6 批 `tavily_extract`，涉及 8 次官方 URL 抽取，8/8 成功；后台复核另完成 2 批、
   3/3 成功。合计 8 批、11/11 次 URL 抽取成功，去重后为 3 个 `react.dev` 页面。
3. 搜索摘要只用于发现候选 URL；所有采用事实均回到 React 官方页面的 `Raw Content` 核验。社区文章、
   搜索摘要和 AI 总结不支撑课程结论。
4. `extract` 响应的 `Content` 字段显示为 `undefined`，但每个结果都返回对应的官方 `Raw Content`。
   主流程又用 `curl -L --fail` 直接读取 3 个已知官方 `.md` URL，3/3 成功，并逐项核对位置绑定、
   同位置同类型、移除、类型变化、嵌套定义、并列实例和版本原文。
5. React Versions 当前标记 latest version 为 `19.2`。仓库 `package.json` 与 `package-lock.json` 锁定
   React / React DOM `19.2.8`；本课区分官方文档 major/minor 口径和仓库精确依赖，不声称存在
   `19.2.8` 独立文档快照。
6. “变量名不是身份”是从官方“State 不保存在 JSX 标签中”“React 只看返回树而不看条件放在哪里”
   推导出的课程表述。它不是 React 官方单独命名的 API 规则，正文必须标注为心智模型推导。
7. 本记录只冻结第 5 课事实、教学与 Demo 合同，不修改课程、Demo、manifest、track、计划、状态文件、
   测试、构建产物或其他研究文件。

## Tavily 查询日志

### Search

主流程查询：

| ID | Tavily query | 主要官方候选 | 采用结论 |
| --- | --- | --- | --- |
| Q1 | `site:react.dev/learn/preserving-and-resetting-state state tied position render tree same component official React` | `Preserving and Resetting State`、`State: A Component's Memory` | 采用 State 与 render tree 位置绑定的基本模型。 |
| Q2 | `site:react.dev/learn/preserving-and-resetting-state same component same position preserves state different component type resets subtree` | `Preserving and Resetting State` | 采用同位置同类型保留、不同类型重置整个子树。 |
| Q3 | `site:react.dev/learn/preserving-and-resetting-state removed added component state reset render tree position props JSX branch` | `Preserving and Resetting State` | 采用移除即销毁、重新添加重新初始化，以及 JSX 标签不保存 State。 |
| Q4 | `site:react.dev/learn/preserving-and-resetting-state nested component function definitions reset state official React` | `Preserving and Resetting State` | 采用嵌套组件定义每次产生不同函数并重置子树。 |
| Q5 | `site:react.dev/learn/preserving-and-resetting-state two counters same component separate state position official React` | `Preserving and Resetting State`、`State: A Component's Memory` | 采用并列同类实例各自拥有独立 State。 |
| Q6 | `site:react.dev/versions React official latest version 19.2` | `React Versions`、React 19.2 发布说明 | 采用官方文档 `19.2` 版本口径。 |

后台只读复核查询：

| ID | Tavily query | 主要官方候选 | 采用结论 |
| --- | --- | --- | --- |
| Q7 | `site:react.dev/learn/preserving-and-resetting-state React state tied position render tree same component different component nested definitions keys` | `Preserving and Resetting State` | 交叉核对位置、类型、嵌套定义与 key 边界。 |
| Q8 | `site:react.dev React v19.2 current documentation version official` | `React Versions` | 交叉核对 React 19.2 当前文档版本。 |

8 组 search 均成功。结果中的旧 `render` API、class 生命周期、Effect、Reducer、Context、Ref、缓存、
路由、列表协调、表单重置和社区页面不支撑本课唯一主线，全部排除。搜索命中 `key` 内容只用于确认
下一课边界，不采用其写法或策略。

### Extract

主流程抽取：

| 批次 | URL | 结果 | 本课提取重点 |
| --- | --- | --- | --- |
| E1 | `https://react.dev/versions`<br>`https://react.dev/learn/preserving-and-resetting-state` | 2/2 成功，`Raw Content` 返回 | 19.2 版本口径、位置绑定与同位置同类型保留。 |
| E2 | `https://react.dev/learn/preserving-and-resetting-state` | 成功，`Raw Content` 返回 | 移除、类型改变与整个子树重置。 |
| E3 | `https://react.dev/learn/preserving-and-resetting-state` | 成功，`Raw Content` 返回 | JSX 标签不是身份、位置移动和 key 边界。 |
| E4 | `https://react.dev/learn/state-a-components-memory`<br>`https://react.dev/learn/preserving-and-resetting-state` | 2/2 成功，`Raw Content` 返回 | 同类并列实例各自拥有独立 State。 |
| E5 | `https://react.dev/learn/preserving-and-resetting-state` | 成功，`Raw Content` 返回 | 嵌套定义产生不同组件函数并重置子树。 |
| E6 | `https://react.dev/learn/preserving-and-resetting-state` | 成功，`Raw Content` 返回 | Props 改变和不同 JSX 源码分支仍可返回相同树位置与类型。 |

后台只读复核抽取：

| 批次 | URL | 结果 | 本课提取重点 |
| --- | --- | --- | --- |
| E7 | `https://react.dev/learn/preserving-and-resetting-state`<br>`https://react.dev/learn/state-a-components-memory` | 2/2 成功，`Raw Content` 返回 | 交叉核对位置、类型、移除、嵌套定义和独立 State。 |
| E8 | `https://react.dev/versions` | 成功，`Raw Content` 返回 | 交叉核对 latest version 为 19.2。 |

## 官方来源卡

| ID | React 官方一手来源 | URL | 本课采用的 claim |
| --- | --- | --- | --- |
| `react-versions` | React Versions | https://react.dev/versions#latest-version | `react.dev` 提供最新 React 文档；当前 latest version 为 `19.2`；同一 major 内持续更新，不为每个 minor/patch 发布独立文档版本。 |
| `react-preserving-state` | Preserving and Resetting State | https://react.dev/learn/preserving-and-resetting-state#state-is-tied-to-a-position-in-the-tree<br>https://react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state<br>https://react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state | State 与 render tree 位置关联；同位置同类型保留；移除或不同类型重置；React 看返回树而不是 JSX 源码位置；嵌套定义会意外重置；key 能影响身份但留到下一课。 |
| `react-state-memory` | State: A Component's Memory | https://react.dev/learn/state-a-components-memory#state-is-isolated-and-private | State 对屏幕上的组件实例隔离；同一组件渲染两次时，每个位置拥有独立 State；State 不与某次函数调用或源码位置绑定。 |

## 版本说明

### 1. 官方文档与仓库依赖

截至 2026-08-10，React 官方版本页把 `19.2` 标为 latest version，并说明 `react.dev` 在同一 major 内
持续更新，不为每个 minor 或 patch 发布独立文档。因此本课采用“React 官方文档 19.2，核验于
2026-08-10”的口径。

仓库 `package.json` 与 `package-lock.json` 当前锁定 `react@19.2.8`、`react-dom@19.2.8`。未来课程
和 Demo 应在这个精确依赖快照上验证交互与 console；研究记录中的官方事实对应 React 19.2 当前文档，
不把仓库 patch 版本写成官方独立文档版本。

### 2. 公共规则与实现边界

“同位置的同组件类型保留 State，移除或换类型会丢弃 State”是 React 官方公开教学规则，可以作为课程
心智模型。课程不把 Fiber 字段、内部节点对象、协调算法步骤或源码函数名写成公共承诺；未来 React
内部实现即使变化，只要公开规则不变，本课结论仍成立。

## 一、官方事实

### 1. State 由 React 保存，并与 render tree 位置关联

给组件加入 State 时，直觉上容易认为 State 存在组件函数或 JSX 标签中。React 官方明确说明 State 实际
由 React 保存，并根据组件位于 render tree 的什么位置，把每份 State 对应给正确组件。这里的“位置”是
返回树中相对于父级的结构位置，不是浏览器像素坐标，也不是源文件行号。

### 2. 同一组件类型可以在不同位置拥有独立 State

同一个 `<Counter />` JSX 值即使被使用两次，只要出现在两个树位置，React 就把它们视为两个组件实例。
并列渲染两个 `Counter` 时，每个实例都有独立的 `score` 和其他局部 State；更新左侧不会改变右侧。

因此“组件类型相同”不等于“State 相同”。类型必须结合它在父级树中的位置来理解。

### 3. 同位置的同组件类型会保留 State

只要相同组件类型继续出现在相同树位置，父组件重新 render 时 React 会保留该位置的 State。改变该组件
的 Props、样式或显示文本会触发更新，但不会仅因新 Prop 值而重新初始化局部 State。

这是默认保留规则，不需要手动把旧 State 复制到新 render，也不需要 Effect 同步。

### 4. Props 值和业务实体名称不是默认身份

官方示例在同一位置让 `Counter` 的 `isFancy` Prop 在 `true` 与 `false` 间变化，计数仍然保留。另一个
示例在 `person="Taylor"` 与 `person="Sarah"` 间切换时，同一位置的 `Counter` 仍被视为同一组件。

因此 Prop 值、人员名称、记录 ID 或标签文本改变，不会自动让 React 创建新的局部 State。若产品把两个
业务实体视为应当完全独立，这属于显式身份需求，应留到下一课设计，不能谎称 Props 自带重置语义。

### 5. JSX 源码分支和变量名不是默认身份

官方把 `<Counter />` 分别写在条件表达式两侧，甚至写在两个不同 `return` 分支中，只要最终返回树里
仍是同一父级的同一子位置和同一组件类型，State 就会保留。React 不知道条件写在函数的哪一行，只看
前后两棵返回树怎样匹配。

所以 JSX 变量名、标签在源码中的位置和条件语法形状都不是独立身份。这个结论是对官方返回树规则的
课程化表述，不应扩写成“源码完全不重要”；源码决定返回什么树，但身份比较发生在返回树上。

### 6. 从树中移除组件会销毁其 State

停止渲染一个组件时，该组件从树中移除，React 同时销毁它的 State。之后再次在同一位置添加同类型
组件，看起来像“回来了”，实际是一个新实例，其 State 从初始化值重新开始。

隐藏视觉内容和从 render tree 中移除不是同一句话。本课只研究条件渲染造成的树移除，不展开其他
隐藏机制或缓存能力。

### 7. 同一位置切换组件类型会重置旧 State

若某个位置原来是 `Counter`，下一次 render 变成 `p` 或另一种 React 组件类型，React 会移除旧
`Counter` 并销毁其 State。切回 `Counter` 时是重新创建，不会恢复之前的计数。

类型匹配是默认身份规则的一部分；“都显示在同一个视觉区域”不能覆盖类型变化。

### 8. 祖先类型变化会重置整个子树

即使内部仍写 `<Counter />`，若它上方同一位置的祖先从 `section` 变为 `div`，旧祖先被移除时其整个
子树也一并被销毁。新祖先下的 `Counter` 是新子树的一部分，从初始 State 开始。

验证身份时不能只比较目标组件最后一层标签，还要沿其父级结构检查前后树是否连续匹配。

### 9. State 不会跟随 JSX 标签从一个位置搬到另一个位置

把同一种组件从第一个兄弟位置切到第二个兄弟位置时，旧位置被清空，旧 State 随之销毁；新位置上的
组件获得新 State。组件在屏幕上可能仍出现在相近区域，但 React 按树位置识别，不把 State 当成附着在
JSX 标签上的可搬运行李。

### 10. 嵌套定义组件函数会产生不稳定类型

在父组件函数内部定义子组件时，父组件每次 render 都会创建一个新的子组件函数。虽然函数名称相同、
JSX 位置相同，React 收到的组件类型却不同，于是重置该位置下面的全部 State。

官方明确建议组件函数始终在模块顶层声明，不要嵌套定义。这个规则同时避免输入内容意外消失和不必要
的子树重建。

### 11. key 只作为下一课边界

官方同一页面还说明，`key` 可以影响 React 如何识别位置并显式控制 State 是否保留。本课只承认存在
这条能力，不给出语法、选择策略或重置示例。所有显式身份和 key 重置教学都属于第 6 课。

## 二、课程推导

### 1. 位置身份检查顺序

正文可以按以下顺序解释一次 State 是否保留：

1. 找到拥有该 State 的组件在上一棵 render tree 中的位置。
2. 检查下一次 render 时，相同父级位置是否仍然存在对应节点。
3. 检查该位置是否仍渲染相同组件类型。
4. 若位置和类型连续匹配，解释为同一组件并保留 State。
5. 若节点被移除、移动到另一位置或类型改变，解释为旧实例被移除，新实例重新初始化。
6. 若目标组件名字没变但 State 重置，继续向上检查祖先类型是否变化，以及组件函数是否嵌套定义。

这是基于官方规则的教学检查法，不是 React 内部协调器 API，也不承诺所有内部比较步骤的实现顺序。

### 2. 准确用语合同

课程统一使用以下表述：

- “State 由 React 保存，并与组件在 render tree 中的位置关联”。
- “相同位置继续渲染相同组件类型时，React 保留该位置的 State”。
- “组件从树中移除后，旧 State 被销毁；重新添加会重新初始化”。
- “同一位置的组件类型改变时，旧组件及其子树 State 被重置”。
- “Props、变量名和 JSX 源码分支不单独决定身份，React 比较返回树”。
- “并列同类型组件位于不同位置，各自拥有独立 State”。
- “嵌套组件定义每次产生不同函数类型，会造成意外重置”。

不要写“State 存在组件函数里”“组件名字相同就一定保留”“Prop ID 改变会自动重置”“两个 JSX 标签
就是两个身份”“重新显示会恢复卸载前 State”或“React 按 DOM 坐标识别组件”。

### 3. 可观察结果矩阵

| 前后变化 | 位置与类型判断 | State 结果 |
| --- | --- | --- |
| 同位置 `Counter`，只改 Props | 相同位置、相同类型 | 保留 |
| 同位置 `Counter`，条件写在不同源码分支 | 返回树仍匹配 | 保留 |
| 两个并列 `Counter` | 两个不同位置 | 各自独立 |
| 暂时移除第二个 `Counter` | 旧位置节点消失 | 销毁；再添加重新初始化 |
| 同位置 `Counter` 改成 `p` | 位置相同但类型不同 | 旧 State 销毁 |
| `section > Counter` 改成 `div > Counter` | 祖先类型不同 | 整个旧子树重置 |
| 子组件函数定义在父组件内部 | 每次 render 得到不同函数类型 | 子树意外重置 |

## 三、基础用法

### 1. 改变 Props 时，同位置同类型保留 State

```tsx
import { useState } from 'react'

interface ScoreCounterProps {
  person: string
}

/** 显示指定成员名称，并在组件当前位置保存独立分数。 */
function ScoreCounter({ person }: ScoreCounterProps) {
  const [score, setScore] = useState(0)

  return (
    <button type="button" onClick={() => setScore((current) => current + 1)}>
      {person}：{score}
    </button>
  )
}

/** 在相同树位置切换成员 Prop，观察局部分数继续保留。 */
export default function SamePositionExample() {
  const [isTaylor, setIsTaylor] = useState(true)

  return (
    <section>
      {isTaylor ? <ScoreCounter person="Taylor" /> : <ScoreCounter person="Sarah" />}
      <button type="button" onClick={() => setIsTaylor((current) => !current)}>
        切换成员
      </button>
    </section>
  )
}
```

条件两侧虽然写了两份 JSX，并且 `person` 改变，但返回树的对应位置始终是 `ScoreCounter`。先增加分数
再切换成员，分数会保留。这是默认位置身份的结果，不是两份 State 之间发生了同步。

### 2. 移除后重新添加会重新初始化

```tsx
import { useState } from 'react'

/** 保存当前树位置上的分数，并提供可观察的更新入口。 */
function RemovableCounter() {
  const [score, setScore] = useState(0)

  return (
    <button type="button" onClick={() => setScore((current) => current + 1)}>
      分数：{score}
    </button>
  )
}

/** 控制计数组件是否仍存在于 render tree 中。 */
export default function RemovalExample() {
  const [visible, setVisible] = useState(true)

  return (
    <section>
      <button type="button" onClick={() => setVisible((current) => !current)}>
        {visible ? '移除计数器' : '重新添加计数器'}
      </button>
      {visible && <RemovableCounter />}
    </section>
  )
}
```

把分数增加后移除组件，旧 State 随组件一同销毁。再次添加时 `useState(0)` 为新实例提供初始值，显示
从 `0` 开始；不是组件仍在后台保留旧值。

### 3. 祖先组件类型改变会重置子树

```tsx
import { useState } from 'react'

/** 在当前子树内保存可观察的草稿文本。 */
function DraftField() {
  const [draft, setDraft] = useState('')

  return (
    <input
      aria-label="草稿"
      value={draft}
      onChange={(event) => setDraft(event.currentTarget.value)}
    />
  )
}

/** 切换祖先元素类型，观察旧子树被移除并重新创建。 */
export default function AncestorTypeExample() {
  const [useSection, setUseSection] = useState(true)

  return (
    <section>
      <button type="button" onClick={() => setUseSection((current) => !current)}>
        切换包装类型
      </button>
      {useSection ? (
        <section>
          <DraftField />
        </section>
      ) : (
        <div>
          <DraftField />
        </div>
      )}
    </section>
  )
}
```

虽然两侧最内层都写 `DraftField`，对应位置上的祖先从 `section` 变成 `div`。React 移除旧祖先时会
销毁整个旧子树，因此输入草稿被重新初始化。

## 四、易错点

未来正文中的每个易错点必须使用 `:::pitfalls`，并包含触发条件、原因、后果、错误示例、正确写法和
验证方式。本课保留以下 10 个高价值问题。

### 1. 把 State 当成组件函数或 JSX 标签里的数据

- **触发条件：** 认为调用同一个组件函数或复用同一个 JSX 值，就会复用一份 State。
- **原因：** 忽略 State 由 React 保存，并按返回树中的组件位置关联。
- **后果：** 无法预测并列实例为何独立，也无法解释组件移除后为什么丢失 State。
- **错误示例：** `const counter = <Counter />` 后渲染 `{counter}{counter}`，并期待两个位置共享计数。
- **正确示例：** 把两个出现位置视为两个实例；若需要共享值，应使用前置课已经建立的明确所有者。
- **验证方式：** 分别点击两个实例，只有被点击位置的计数变化。
- **来源：** `react-preserving-state`、`react-state-memory`。

### 2. 按 JSX 源码分支判断组件身份

- **触发条件：** 条件两侧各写一个 `<Counter />`，期待切换分支自动得到新 State。
- **原因：** React 不按 JSX 标签位于源文件哪一行识别组件，而是比较前后返回树。
- **后果：** 分支切换后旧计数或输入仍保留，产品意图与默认行为不一致。
- **错误示例：** `active ? <Counter tone="strong" /> : <Counter tone="quiet" />`，并把两侧当作两个实例。
- **正确示例：** 先检查两侧是否仍返回同一父级位置的同一组件类型；当前课只解释其默认保留结果。
- **验证方式：** 先增加计数再切换分支，计数不回到初始值。
- **来源：** `react-preserving-state`。

### 3. 改变 Props 或业务名称后期待自动重置

- **触发条件：** 同一位置从 `person="Taylor"` 改为 `person="Sarah"`，期待局部分数自动归零。
- **原因：** Prop 值描述输入数据，不单独改变默认位置身份。
- **后果：** 前一个业务实体的草稿、选项或计数出现在后一个实体界面中。
- **错误示例：** 只更新 `person` Prop，把它误当成新的组件实例。
- **正确示例：** 先承认同位置同类型默认保留；若业务要求显式区分实体，把方案留给第 6 课。
- **验证方式：** 切换 Prop 前后读取同一个局部计数，确认它继续保留。
- **来源：** `react-preserving-state`。

### 4. 暂时移除组件后期待恢复旧 State

- **触发条件：** 使用 `visible && <DraftField />` 隐藏组件，再显示时期待原草稿仍在。
- **原因：** 条件为假时组件从 render tree 中移除，旧 State 被销毁。
- **后果：** 重新添加后输入、选择或计数回到初始化值，用户未保存内容丢失。
- **错误示例：** 把“不渲染”理解为“保留实例但不可见”。
- **正确示例：** 根据产品需求明确是否允许移除造成重置；本课不引入缓存或外部保存方案。
- **验证方式：** 输入草稿后移除并重新添加，观察新实例从初始值开始。
- **来源：** `react-preserving-state`。

### 5. 同一视觉位置换组件类型仍期待保留 State

- **触发条件：** 条件切换让同一位置从 `Counter` 变为 `Message`，再切回 `Counter`。
- **原因：** 默认身份同时要求位置与组件类型匹配；视觉区域相同不能抵消类型变化。
- **后果：** 旧组件被移除，切回时创建新组件并重新初始化 State。
- **错误示例：** 认为“都在左侧卡片里”就等于同一组件身份。
- **正确示例：** 比较 render tree 对应节点的类型，而不是比较屏幕坐标。
- **验证方式：** 增加计数、切换到其他类型、再切回，计数回到初始值。
- **来源：** `react-preserving-state`。

### 6. 只看叶子组件同名，忽略祖先类型变化

- **触发条件：** 条件两侧都包含 `<DraftField />`，但包装节点从 `section` 变成 `div`。
- **原因：** 祖先类型变化会移除旧祖先及其整个子树，内部同名标签不能跨子树继承 State。
- **后果：** 看似未变化的输入或计数意外重置。
- **错误示例：** 只搜索两侧是否都出现 `DraftField`，不比较其父级结构。
- **正确示例：** 从目标组件向上检查父级树是否连续匹配，并让纯视觉变化尽量不改变结构类型。
- **验证方式：** 输入草稿后切换包装类型，观察输入重新初始化。
- **来源：** `react-preserving-state`。

### 7. 把组件从一个兄弟位置移到另一个位置并期待 State 跟随

- **触发条件：** 条件切换时清空第一个位置，在第二个兄弟位置渲染同类型组件。
- **原因：** State 与旧树位置绑定，不附着在 JSX 标签或业务名称上移动。
- **后果：** 旧位置 State 被销毁，新位置得到初始 State。
- **错误示例：** 把 `Counter` 从左槽位换到右槽位，认为仍是原来的计数器。
- **正确示例：** 把两个槽位视为两个身份；当前课只观察默认重置，不教授显式身份覆盖。
- **验证方式：** 在左槽位增加计数后切到右槽位，右侧从初始值开始。
- **来源：** `react-preserving-state`。

### 8. 在父组件内部定义有 State 的子组件

- **触发条件：** `Editor` 函数内部声明 `function DraftField()`，父级任意 State 更新都会重新执行定义。
- **原因：** 每次父级 render 都创建不同的子组件函数，React 在同一位置看到不同组件类型。
- **后果：** 输入内容反复消失、子树重建，并可能造成额外性能问题。
- **错误示例：**

  ```tsx
  /** 错误：父级每次 render 都重新创建内部组件类型。 */
  function Editor() {
    /** 错误：这个组件函数不应嵌套定义。 */
    function DraftField() {
      return <input />
    }

    return <DraftField />
  }
  ```

- **正确示例：**

  ```tsx
  /** 在模块顶层声明稳定的草稿输入组件类型。 */
  function DraftField() {
    return <input />
  }

  /** 复用模块顶层的稳定组件类型。 */
  function Editor() {
    return <DraftField />
  }
  ```

- **验证方式：** 在输入中键入内容后更新父级无关计数；顶层定义版本保留输入，嵌套版本会重置。
- **来源：** `react-preserving-state`。

### 9. 以为并列的同类型组件会共享局部 State

- **触发条件：** 并列渲染两个 `<Counter />`，期待点击一个时另一个同步变化。
- **原因：** 两个组件类型相同，但位于不同树位置，各自关联独立 State。
- **后果：** 需要同步的 UI 实际各自变化，数据出现分叉。
- **错误示例：** 依赖相同组件函数自动共享一份 `score`。
- **正确示例：** 独立行为就保留局部 State；需要共享时遵循前置课的提升 State 所有权模型。
- **验证方式：** 交替点击两侧计数器，确认两个数值分别累计。
- **来源：** `react-preserving-state`、`react-state-memory`。

### 10. 用 DOM 坐标或视觉外观代替 render tree 位置

- **触发条件：** 两次 render 的卡片看起来都在同一块区域，便断言组件身份不变。
- **原因：** React 的“位置”是组件树结构关系，不是 CSS 布局后的像素坐标或视觉顺序。
- **后果：** 包装类型或父级结构变化时，State 重置被误判为 React 异常。
- **错误示例：** 只用截图中“仍在右侧”证明 State 应保留。
- **正确示例：** 同时检查前后 render tree 的父级位置和组件类型，再用交互结果佐证。
- **验证方式：** 保持视觉区域近似不变但切换祖先类型，观察子树 State 仍被重置。
- **来源：** `react-preserving-state`；DOM 坐标对照为课程推导。

### 易错点适用版本与来源

| 错误名称 | 适用版本 | 来源 |
| --- | --- | --- |
| 把 State 当成组件函数或 JSX 标签里的数据 | React 19.2 | Preserving and Resetting State |
| 按 JSX 源码分支判断组件身份 | React 19.2 | Preserving and Resetting State |
| 改变 Props 或业务名称后期待自动重置 | React 19.2 | Preserving and Resetting State |
| 暂时移除组件后期待恢复旧 State | React 19.2 | Preserving and Resetting State |
| 同一视觉位置换组件类型仍期待保留 State | React 19.2 | Preserving and Resetting State |
| 只看叶子组件同名，忽略祖先类型变化 | React 19.2 | Preserving and Resetting State |
| 把组件移到另一个兄弟位置并期待 State 跟随 | React 19.2 | Preserving and Resetting State |
| 在父组件内部定义有 State 的子组件 | React 19.2 | Preserving and Resetting State |
| 以为并列的同类型组件会共享局部 State | React 19.2 | Preserving and Resetting State |
| 用 DOM 坐标或视觉外观代替 render tree 位置 | React 19.2 | Preserving and Resetting State |

## 五、高级用法

### 1. 从目标 State 向上检查树连续性

复杂条件中出现意外重置时，先找到拥有 State 的最小组件，再沿父级向上比较前后返回树。第一个被移除
或类型改变的祖先，就是旧子树终止的位置。这个检查比只搜索叶子组件名字更可靠，也不需要猜测 React
内部实现。

### 2. 只改变外观时保持树结构稳定

如果交互只需要改变强调样式、标签或 Props，应让同一组件类型继续处于同一树位置。可以通过 Prop
表达外观差异，而不是在条件两侧换成不同包装类型。这里的目标是让代码表达“同一实例继续更新”，
不是为了性能而提前引入缓存。

### 3. 把组件定义放在模块顶层

有 State 的子组件和无 State 的展示组件都应默认在模块顶层声明。需要传递父级数据时使用 Props，而
不是把组件函数嵌套到父组件以捕获局部变量。这样组件类型在父级重新 render 时保持稳定，也让代码更
容易单独测试和复用。

### 4. 区分默认保留结果与产品身份需求

同位置同类型默认保留 State 只说明 React 如何匹配树，不保证它符合业务含义。切换人员、文档或会话
后，产品可能希望保留编辑，也可能希望全量重置。第 5 课负责准确预测默认结果；若要求显式改变身份，
记录需求并交给第 6 课，不在本课提前给出 key 方案。

## 六、适用边界

适合使用本课模型判断的场景：

- 条件渲染后输入、计数、展开状态意外保留或重置。
- 同一组件收到新 Props 后，局部 State 为什么没有重新初始化。
- 同类型组件并列时，为什么局部 State 相互独立。
- 更换包装节点或组件类型后，为什么内部整个子树重置。
- 父级无关更新导致嵌套定义子组件丢失输入。
- 课程或代码评审需要预测默认 State 生命周期，但尚未设计显式身份。

不属于本课的内容：

- 使用 `key` 显式重置 State、列表 key 选择和业务实体 key：第 6 课。
- State 提升、受控与非受控所有权：第 3、4 课已经覆盖。
- Reducer、Action、Context 与共享边界：第 7-14 课。
- Ref、DOM Ref、Effect、Effect Event、自定义 Hook 与布局 Effect：后续独立课程。
- `memo`、`useMemo`、缓存、Activity、路由页面保留、外部 Store 与持久化。
- DOM 节点复用、Fiber 字段和协调器源码细节；这些不是本课公开合同。

## 七、Demo 设计

建议新增同源 Demo：
`react.core.learn.intermediate.state-identity-by-position.position-identity-demo`，使用“排班计分板”场景设置
三个最小观察区：

1. **同位置同类型：** 一个 `ScoreCard` 在同一树位置切换 `person` 与视觉 Prop。先累计分数再切换，
   分数保留；源码可以把两种 Prop 写在条件两侧，证明 Props 和 JSX 分支不是身份。
2. **并列与移除：** 第二个同类型 `ScoreCard` 并列显示，两个分数独立。取消“显示第二个计分板”后其
   组件从树中移除；再次显示时从 `0` 开始，第一张卡的分数不受影响。
3. **祖先类型变化：** 一个含局部草稿的稳定 `DraftField` 分别位于 `section` 和 `div` 子树中。切换包装
   类型后草稿清空，证明祖先类型变化会重置整个子树。

Production Demo 不嵌套定义组件函数，不故意制造 error 或 warning，不加入 `key`，也不使用 Reducer、
Context、Effect、Ref、缓存、路由、请求或外部 Store。嵌套定义只在正文 pitfalls 的静态对照代码和
`/tmp` 临时故障 fixture 中验证，避免把错误模式当作推荐架构。

可观察步骤冻结为：

1. 左侧计分增加到非零，切换成员名与外观，计分保持。
2. 分别增加两张并列卡片，确认更新一张不会改变另一张。
3. 移除第二张卡片再重新添加，第二张从 `0` 开始，第一张保持原值。
4. 在草稿输入中键入文本，切换祖先包装类型，草稿变为空字符串。
5. 重复上述操作，production console 始终为 `0 error / 0 warning`。

展示源码与运行组件必须来自同一 `.tsx` 文件；新增函数上方写职责明确的简体中文注释。样式只使用
Flexbox、margin 和正常文档流，不使用 CSS Grid 或 `gap`；卡片和控件尺寸稳定，桌面、390px 与
390px + 200% 文本不能出现横向溢出、控件裁切、标签覆盖或状态变化引起的布局跳动。

## 八、验证方式

### 1. 研究记录验证

- 所有关键事实映射到官方来源卡中的直接 URL 和页面锚点。
- 搜索摘要只用于发现候选；采用事实已在 Tavily `Raw Content` 与官方 `.md` 原页逐项核验。
- 当前批次重新核验版本页、位置绑定、同位置同类型、移除、类型变化、嵌套定义和并列实例。
- “Props/变量名/JSX 分支不是身份”明确标记为官方返回树规则的课程推导，不冒充独立 API。
- `key` 只出现于第 6 课边界，不提供重置语法、示例或选择策略。
- 只新增本研究记录，不修改课程、Demo、manifest、track、计划或状态文件。

### 2. 未来课程与 Demo 临时验证

1. **相同位置：** `/tmp` React fixture 先增加 `ScoreCard` 分数，再改变 Props 与 JSX 条件分支；同一个
   DOM 控件的 State 结果保持，且没有手动镜像 State。
2. **独立实例：** 并列两个同类型组件，分别更新后得到不同数值；一个实例的事件不改变另一个实例。
3. **移除再添加：** 先把第二个实例更新到非零，移除并重新添加后回到初始化值，第一实例保持。
4. **不同类型：** 同位置从一种组件类型换为另一种，再切回时旧 State 不恢复。
5. **祖先变化：** `section > DraftField` 切为 `div > DraftField` 后，输入从已编辑值回到初始值。
6. **嵌套定义故障探针：** 独立 `/tmp` fixture 捕获父级更新后内部组件 DOM 身份变化和 State 重置；
   production Demo 只保留模块顶层定义的正确版本。
7. **源码边界：** production TSX 不含 `key=`、嵌套组件定义、Effect、Ref、Context、Reducer、缓存、
   路由、请求或外部 Store；所有函数定义上方都有规范中文职责注释。
8. **工程 Gate：** 当前快照通过 type-check、lint、format、build、空测试脚本与 scoped diff check；临时
   fixture 全部位于 `/tmp`，结束后删除并确认目录不存在。
9. **浏览器证据：** Playwright 在 1440px、390px 和 390px + 200% 根字号复跑全部观察步骤；检查
   `scrollWidth <= clientWidth`、控件不重叠、焦点与标签可读、production console 为
   `0 error / 0 warning`。
10. **同源证据：** 展示代码与实际运行 TSX 去除约定末尾空白后的字符数、UTF-8 字节数和 SHA-256
    一致。

研究阶段只执行来源、版本、格式、结构和 scoped diff 验证；不提前创建课程、Demo 或浏览器 fixture，
不运行构建，也不打开页面。

## 九、拆课判断

- State 的位置绑定、同位置同类型保留、移除或类型变化重置，都是解释 React 默认组件身份的同一心智
  模型；它们共享同一组树对照和验证方式，合并后才能完整回答标题问题。
- Props、变量名和 JSX 分支不是另一条 API 主线，而是用反例澄清“位置”指返回树，不指源码位置。
- 嵌套定义组件函数是组件类型不稳定造成的高价值错误，直接由同一身份规则解释，无需拆课。
- 并列实例独立 State 是位置绑定的基础正例，不扩展到 State 共享；共享所有权已由前置课程覆盖。
- 显式 `key` 身份拥有独立语法、选择边界、错误风险和重置场景，已冻结为第 6 课，本课只保留入口提示。
- 当前范围没有第二条独立主线，**无需继续拆课**。

## 十、官方来源

1. [React Versions](https://react.dev/versions)：当前官方文档版本、major 内持续更新和无独立 patch 文档
   快照的版本边界。
2. [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)：State 与 render
   tree 位置绑定、相同位置同类型保留、移除或类型改变重置、JSX 分支边界、嵌套定义错误和 key 后续入口。
3. [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)：同类型组件在不同位置
   拥有隔离 State，以及 State 不与某次函数调用或源码位置绑定。

## 十一、实施闭环证据

- 正文、同源 Demo、CSS、entry manifest、demo manifest 与 React Core track 已登记；第 5 课为
  `available`，第 6-12 课已按本批闭环登记，第 13-29 课保持 `planned`。
- `/tmp` 临时行为验证覆盖同位置同类型保留、并列实例隔离、移除后重新初始化、同位置类型改变、祖先
  类型改变和嵌套定义故障探针，结果为 `6/6 PASS`；真实 Markdown 解析得到 10 个 pitfalls、1 个
  exercise 和预期 Demo ID。
- Prettier、Oxlint、type-check、production build 与 scoped diff check 均通过。
- Playwright 在 1440px、390px、390px + 200% 根字号下完成全部交互；页面与 Demo 均无横向溢出、
  控件裁切、越界或重叠，console 为 `0 error / 0 warning`，page error 为 0。
- 页面展示源码与运行 TSX 去除约定末尾空白后均为 4255 个字符、4591 个 UTF-8 字节，SHA-256 均为
  `fd57aeef32158d862e1a656432ecefd4a4cefff186abd18ffb9d69651dd91d1b`。
- 独立复审最终结论为 `Standards: PASS / 0 finding`、`Spec: PASS / 0 finding`；所有本课临时行为、
  浏览器和截图资产均已清理并确认不存在，未暂存、提交或推送。
