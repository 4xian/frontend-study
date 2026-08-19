# children 与组合

## 范围合同

- 内容 ID：`react.core.learn.basics.children-and-composition`
- 运行时基线：React / React DOM `19.2.8`
- 文档基线：react.dev `19.2`
- 类型基线：TypeScript `6.0.3`、`@types/react` `19.2.18`
- 核验日期：`2026-08-15`

本知识点只解释 `children` 与组件组合：嵌套 JSX 怎样成为 `children` prop，组件怎样放置这份内容，
`ReactNode` 与 `ReactElement` 分别表达什么合同，以及单区域、多个命名区域和 render prop 三种组合
接口怎样选择。

学习者正文必须覆盖：

1. `children` 是 prop，不是独立通道；调用方提供内容，接收组件决定放置位置。
2. 通用可渲染内容使用 `ReactNode`；确实要求一个 React element 对象时才使用 `ReactElement`。
3. 一个主要内容区域使用 `children`。
4. 多个语义明确的内容区域使用命名 `ReactNode` props。
5. 组件提供数据、调用方决定表现形式时使用返回 `ReactNode` 的 render prop。
6. `Children` 与 `cloneElement` 只保留一个不含用法的风险提示，不进入示例、Demo 或练习。

学习者正文不展开条件分支、列表生成与 key、事件、State、Hook、Effect、Context、Ref、Portal、
Suspense、Server Components、组件身份或 DOM 查询。Props 只保留“`children` 也是 prop”这一必要连接，
不重复 Props 的通用类型、默认值、spread、函数输入或不可变性教学。

## 研究方法与证据边界

1. 已知官方 URL 直接使用 `curl -L --fail --silent --show-error` 读取，没有用搜索摘要替代原文。
2. React 教学事实同时核对 react.dev 当前 `19.2` 页面和 React 文档固定提交
   `c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
3. React 运行时只核对 `facebook/react` 标签 `v19.2.8`；源码用于确认 API 是否仍导出，不把内部
   children 结构写成公共合同。
4. TypeScript JSX 事实核对 TypeScript 官方网站当前页面及固定提交
   `7adb2a619c0e1f3fbde87f6d9faec5c585f33d88`。
5. `ReactNode`、`ReactElement` 与 JSX namespace 的精确编译合同以本地安装的
   `@types/react@19.2.18` 为准。该声明来自 DefinitelyTyped，不冒充 React 运行时源码。
6. 本地 `package.json`、`package-lock.json` 和实际安装包一致：React / React DOM `19.2.8`、
   `@types/react` `19.2.18`、TypeScript `6.0.3`。
7. 本记录只定义事实与资产合同；学习者正文、Demo、样式、manifest 和 Track 均保持只读。

## 官方来源与 claim 绑定

### 来源卡

| ID | 官方来源 | 固定依据 | 采用的 claim |
| --- | --- | --- | --- |
| `R1` | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) | React 文档 `19.2`；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/passing-props-to-a-component.md) | 标签之间的 JSX 会成为 `children` prop；接收组件在外壳内渲染它。 |
| `R2` | [Using TypeScript](https://react.dev/learn/typescript#typing-children) | React 文档 `19.2`；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/typescript.md) | `ReactNode` 是 JSX children 的宽类型；`ReactElement` 不包含字符串、数字等 JavaScript primitive；TypeScript 不能限定某一种 JSX element。 |
| `R3` | [Common components](https://react.dev/reference/react-dom/components/common) | React DOM 文档 `19.2`；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react-dom/components/common.md) | React node 包含 element、文本、数字、空节点和 node 数组；多个类似 slot 的区域通常通过 JSX props 表达。 |
| `R4` | [Children](https://react.dev/reference/react/Children) | React 文档 `19.2`；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/Children.md) | `Children` 不常用且可能产生脆弱代码；小写 `children` prop 本身是受鼓励的；render prop 是官方替代方向。 |
| `R5` | [cloneElement](https://react.dev/reference/react/cloneElement) | React 文档 `19.2`；[固定源码](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/reference/react/cloneElement.md) | `cloneElement` 不常用、会让数据流更难追踪；render prop 是官方替代方向。 |
| `R6` | [`ReactClient.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactClient.js) | React `v19.2.8` | React `19.2.8` 仍导出 `Children` 与 `cloneElement`，因此不能称其已删除。 |
| `R7` | [`ReactChildren.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/ReactChildren.js) | React `v19.2.8` | `Children` 仍有固定实现；实现细节不进入学习者正文。 |
| `T1` | [TypeScript: JSX](https://www.typescriptlang.org/docs/handbook/jsx.html#children-type-checking) | [TypeScript 网站固定源码](https://github.com/microsoft/TypeScript-Website/blob/7adb2a619c0e1f3fbde87f6d9faec5c585f33d88/packages/documentation/copy/en/reference/JSX.md) | JSX 标签之间的表达式按 element attributes 中的 children 属性检查；属性名由 `JSX.ElementChildrenAttribute` 指定。 |
| `L1` | 本地 `node_modules/@types/react/index.d.ts` | `@types/react` `19.2.18` | 固定 `ReactNode`、`ReactElement` 和 `JSX.ElementChildrenAttribute` 的实际编译合同。 |
| `L2` | 本地 `package.json`、`package-lock.json` 与包声明 | 当前工作区 | 固定 React、React DOM、TypeScript 与 React types 的实际版本。 |

### 事实结论

| Claim | 官方事实 | 学习者口径 | 证据 |
| --- | --- | --- | --- |
| `C01` | 嵌套在自定义组件标签中的 JSX 会进入名为 `children` 的 prop。 | `children` 是有嵌套语法的 prop。 | `R1`、`T1`、`L1` |
| `C02` | 接收组件必须在返回结果中使用 `children` 才会显示它。 | “收到内容”和“放置内容”是两个动作。 | `R1` |
| `C03` | `ReactNode` 是可作为 JSX children 的宽类型。 | 通用内容区域默认声明 `children: ReactNode`。 | `R2`、`R3`、`L1` |
| `C04` | `ReactElement` 只表示 React element，不包含字符串、数字或 node 数组。 | 只有接口确实要求 element 对象时才收窄为 `ReactElement`。 | `R2`、`L1` |
| `C05` | `ReactElement` 不能让 TypeScript 可靠限制某一种 JSX 标签。 | 不用 `ReactElement<P>` 假装只接受某个组件。 | `R2` |
| `C06` | 本地 `ReactNode` 还包含 bigint、iterable、Portal、Promise 和空节点。 | 正文只用 element、文本、数字、Fragment 和空节点解释类型宽度；不扩展相邻运行机制。 | `R2`、`R3`、`L1` |
| `C07` | 官方用可填充的外壳解释 `children`。 | 一个主要内容区域使用 `children`。 | `R1` |
| `C08` | React 中类似 slot 的多个区域通常通过 JSX props 传递。 | 使用 `header`、`sidebar`、`footer` 等职责明确的 `ReactNode` props。 | `R3` |
| `C09` | render prop 是普通函数 prop，用于指定一块 UI 怎样渲染，并可接收组件提供的信息。 | `renderSummary: (value: Summary) => ReactNode` 表达“数据由组件提供，表现由调用方决定”。 | `R4`、`R5` |
| `C10` | `Children` 与 `cloneElement` 都被官方标为不常用且容易产生脆弱代码。 | 只提醒不要扫描、改写或隐式注入未知 child；不教学 API。 | `R4`、`R5` |
| `C11` | React `19.2.8` 仍导出这两个 API。 | 不能写“已删除”或“不可使用”，只能说明不属于本知识点主线。 | `R6`、`R7` |

## 教学主线

### children 是 prop

正文从一个固定外壳开始：调用方把 JSX 写在组件标签之间，接收组件通过参数取得 `children`，再把它
放入明确的内容区域。

```tsx
import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
}

// 在面板的主要内容区域渲染调用方提供的 children。
function Panel({ children }: PanelProps) {
  return <section>{children}</section>
}
```

正文只需用一句话说明 `<Panel children={<p>...</p>} />` 与嵌套写法都在提供同一个 prop，示例主线
始终使用嵌套写法。不要展开 JSX transform 的覆盖顺序。

### ReactNode 与 ReactElement

类型教学应回答“接口允许什么”，而不是复制完整 union：

| 合同 | 接受的代表值 | 不承诺的内容 | 使用场景 |
| --- | --- | --- | --- |
| `ReactNode` | element、文本、数字、Fragment、多个节点、空节点 | 不保证一定可见，也不保证是 element 对象 | 通用内容区域、命名区域、render prop 返回值 |
| `ReactElement` | 一个 React element，包括 Fragment element | 不接受文本、数字或 node 数组；不保证具体标签类型或最终 DOM 数量 | 必须得到 element 对象的窄接口 |

正文保留“`ReactNode` 必填不等于可见内容”这一句即可。`PropsWithChildren`、`FC` 是否自动包含
children、完整 union、Promise children 和特定 JSX 标签泛型争论都不属于主线。

### 三种组合接口

| 需求 | 接口 | 判断依据 |
| --- | --- | --- |
| 一个主要内容区域 | `children: ReactNode` | 调用处的嵌套关系最直观。 |
| 多个语义区域 | `sidebar: ReactNode`、`children: ReactNode` 等 | 区域归属由名称表达，不依赖 child 顺序。 |
| 组件提供数据，调用方决定表现 | `renderSummary: (summary: Summary) => ReactNode` | 函数让组件把已知数据交给调用方生成 UI。 |

render prop 示例保持纯函数、静态数据和同步返回值。若只是插入已经创建好的节点，应回到 `children`
或命名 `ReactNode` prop，避免把静态区域无意义地函数化。

### Legacy 风险提示

学习者正文只保留一个短提示：新组合接口不要通过 `Children` 扫描 child 结构，也不要通过
`cloneElement` 向未知 child 注入隐含数据；这些 API 仍存在，但官方明确提示它们不常用且容易形成
脆弱代码。优先使用直接 `children`、命名 JSX props 或 render prop。

提示中不出现 API 签名、`count` / `map` / `only` / `toArray` 行为、Fragment 遍历规则、浅合并示例或
运行时演示。这些内容只适合独立 Legacy API 参考资料。

## 当前资产处置合同

### 学习者正文

| 当前内容 | 动作 | 约束 |
| --- | --- | --- |
| 标题“children 与组合” | 保留 | 标题简短且能够直接标识知识点。 |
| “为什么需要 children”与嵌套 JSX 数据流 | 保留并合并 | 用一个外壳示例说明传入与放置，不重复 Props 通识。 |
| “children 可以是什么” | 合并 | 并入 `ReactNode` / `ReactElement` 对照，只保留代表值。 |
| `ReactNode` 与 `ReactElement` | 保留并收窄 | 保留宽窄合同、文本反例、特定 JSX 标签限制。 |
| 必填、可选、`PropsWithChildren`、`FC` | 删除 | 仅保留“必填 `ReactNode` 不保证可见”一句；其余属于 Props 类型专题。 |
| 单区域组合 | 保留 | 作为第一种接口。 |
| 多个命名区域 | 保留 | 区域名表达职责，不比较 Web Components slot 实现。 |
| render prop | 保留并强化 | 给出 `(value) => ReactNode` 签名、调用方示例和选择条件。 |
| opaque structure、`Children` API 全表与示例 | 移出 | 正文只留 Legacy 风险提示，不保留任何操作性知识。 |
| `cloneElement` 签名、浅合并与注入示例 | 移出 | 正文只留 Legacy 风险提示，不把 clone 当高级组合方式。 |
| children 数组变异与组件纯度长段 | 删除 | 不重复 Props 或纯度专题。 |
| Demo 引导 | 保留并重写 | 只观察三种组合接口，不再观察 Legacy API。 |
| 易错提示 | 合并 | 只保留未渲染 children、类型选宽错误、按顺序猜区域、滥用 render prop、扫描或克隆 child。 |
| 原理、练习、小结 | 重写 | 都围绕三种组合接口和类型选择，不出现相邻机制。 |
| 官方来源 | 精简 | 保留 `R1` 至 `R5` 对应页面；运行时源码不作为学习主线。 |

### Demo 与样式

| 当前资产 | 动作 | 约束 |
| --- | --- | --- |
| `LearningPanel` 的固定外壳与嵌套 `children` | 保留 | 明确展示单区域组合。 |
| `eyebrow`、`footer` 命名区域 | 保留并简化 | 使用稳定、必需的命名区域，不用条件分支控制区域。 |
| `LessonPreview` 与 `renderSummary` | 保留 | 静态数据传给 render prop，调用方返回 `ReactNode`。 |
| `Children.count`、`Children.toArray` 与 facts 列表 | 删除 | Demo 不展示 Legacy API，也不比较结构数量。 |
| `SingleElementFrame`、`isValidElement`、`cloneElement` | 删除 | 不在 Demo 中注入 className 或演示 clone。 |
| `ReactElement` import | 删除 | `ReactElement` 合同由正文和临时类型检查证明，不为它制造运行时演示。 |
| 面板和文字样式 | 保留并按新 DOM 收窄 | 使用 Flexbox、margin 和普通文档流；不得使用 CSS Grid 或 `gap`。 |
| facts、single、decorated 相关选择器 | 删除 | 只删除因 Demo 收窄而失去引用的样式。 |

Demo 保持无事件、无 State、无 Hook。可观察结果必须同时包含：嵌套 `children` 的主要内容、至少一个
命名区域，以及 render prop 根据收到的数据生成的文本。

### Manifest 与 Track

| 资产 | 保留 | 调整 |
| --- | --- | --- |
| 课程 ID、slug、domain、technology、module、stage、prerequisite | 保留当前值 | 无。 |
| 标题 | 保留“children 与组合” | 左侧标题保持简短。 |
| summary | 保留零基础定位 | 只概括 children prop、类型和三种组合接口，删除 `Children API`。 |
| tags | 保留 `React`、`children`、`composition`、`ReactNode`、`ReactElement` | 删除 `Children`、`cloneElement`；补充 `render-prop`。 |
| objectives、recap | 保留可验证结构 | 改为 children 数据流、类型选择、单区域、命名区域、render prop 与一条 Legacy 风险边界。 |
| sources | 保留 React 官方教学来源 | `Children`、`cloneElement` 只绑定风险提示；删除 `ReactChildren.js` 和纯度来源。 |
| `verifiedAt` | 保留字段 | 更新为实际内容核验日期。 |
| entry manifest | 保留现有 slug、meta 与 loader | 无。 |
| Demo manifest | 保留稳定 ID、runtime 与同源 loader | 标题使用“children 与组合示例”。 |
| Track entry | 保留现有 ID 与 `available` 状态 | 本知识点范围调整不改变 Track 状态。 |

## 易错点合同

| 误区 | 原因 | 正确方向 | 验证 |
| --- | --- | --- | --- |
| 标签之间写了内容，组件却没有显示 | 接收 prop 不会自动选择插入位置 | 参数读取 `children` 并在明确区域渲染 | 传入辨识度高的文本并检查所在区域 |
| 通用容器使用 `ReactElement` | 窄类型拒绝文本、数字和多个节点 | 通用区域使用 `ReactNode` | 临时类型检查覆盖文本、数字、element 与 Fragment |
| `ReactElement<P>` 被当成指定组件限制 | TypeScript 官方明确不能限定某一种 JSX element | 通过明确数据或命名接口表达合同 | 尝试传入另一种 JSX element，不能宣称类型已锁定组件 |
| 依赖第一个、第二个 child 表达区域 | 调用处看不见区域职责，重排会改变语义 | 使用命名 `ReactNode` props | 只看调用代码即可指出每块内容去向 |
| 静态内容也包装成 render prop | 函数接口没有提供额外数据能力，只增加间接层 | 已创建好的内容使用 children 或命名 prop | 移除函数后表达力不变则不需要 render prop |
| 扫描或 clone 未知 child | 隐含协议让数据流难追踪，官方标为脆弱 | 使用显式组合接口 | Demo 和主线示例不导入 `Children`、`cloneElement` |

## 临时类型验证合同

类型验证资产必须创建在 `mktemp -d` 生成的 `/tmp` 目录中，通过符号链接复用当前仓库的
`node_modules`，验证结束后删除临时目录，不在仓库保留测试文件。

最小 TSX 验证覆盖：

1. `children: ReactNode` 接受文本、数字、element、Fragment 和多个节点。
2. `children: ReactElement` 接受一个 element，并用 `@ts-expect-error` 证明文本和 element 数组被拒绝。
3. 命名区域与 `children` 同时按 `ReactNode` 检查。
4. `renderSummary: (summary: Summary) => ReactNode` 能读取参数并返回 JSX。
5. 用 `@ts-expect-error` 证明 render prop 返回普通对象不符合 `ReactNode`。
6. 临时文件不导入或调用 `Children`、`cloneElement`。

编译器使用当前工作区的 TypeScript `6.0.3`，开启 `strict`、`jsx: react-jsx`、
`moduleResolution: Bundler` 和 `noEmit`。`@ts-expect-error` 未命中也必须使验证失败，避免负例失效后
仍被误判为通过。

## 浏览器验收合同

浏览器验收使用可复跑的 Playwright 流程访问
`/frontend/react/core/learn/children-and-composition`，分别验证桌面 viewport 与 `390px` 宽度：

1. 页面标题显示“children 与组合”。
2. Demo 能定位到稳定 ID `react.core.learn.basics.children-and-composition.composition-boundaries-demo`。
3. 单区域示例中，调用方提供的正文出现在固定外壳的主要内容区域。
4. 命名区域与主要 `children` 同时可见，区域标签和内容归属明确。
5. render prop 收到静态数据并显示调用方定义的文案。
6. Demo 可见文本和同源源码中均不出现 `Children.count`、`Children.toArray`、`cloneElement` 或
   `isValidElement`。
7. 页面无 console error、未处理异常或资源加载失败。
8. 桌面与 `390px` 布局无水平滚动、文本截断、遮挡或控件重叠；Demo 固定尺寸区域不因内容变化跳动。
9. 同源源码与实际运行的 Demo 文件一致，manifest 的 component loader 与 source loader 指向同一
   TSX 文件。

## 结论

1. `children` 是 prop；嵌套 JSX 只负责提供内容，组件返回值负责决定内容位置。
2. `ReactNode` 是通用组合合同，`ReactElement` 是确实需要 element 对象时的窄合同。
3. 单区域使用 `children`，多区域使用命名 JSX props，数据到表现的定制使用 render prop。
4. `Children` 与 `cloneElement` 在 React `19.2.8` 中仍存在，但官方明确提示其脆弱性；学习者正文只
   保留风险边界，操作性内容与运行时演示全部移出。
5. 正文、Demo、manifest 与 Track 的处置均可由上面的保留、合并、删除、移出和调整合同直接核验。
