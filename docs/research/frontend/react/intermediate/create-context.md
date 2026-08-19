# createContext 研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.intermediate.create-context`
- 标题：createContext
- 教学层级：零基础到进阶
- 核验日期：`2026-08-10`
- 研究状态：官方事实、正文、同源 Demo、静态检查、浏览器验收与双轴复审已闭环
- 官方文档基线：React `19.2`
- 仓库实现基线：React / React DOM `19.2.8`

本课只回答一条主线：怎样用 `createContext` 创建稳定的 Context 通道，并为“树上没有任何匹配
Provider”这一情况设计有意义且类型准确的默认值。

明确排除：`useContext` 的完整读取与订阅规则、Provider 嵌套与局部覆盖、Reducer 与 Context 组合、
外部 Store、Zustand、远程数据、服务端组件 Context 和性能优化。Demo 为证明创建合同会最小调用
`useContext`，但不把读取 API 展开为第二条教学主线。

## 调研问题

1. `createContext` 的调用位置、参数和返回值分别是什么？
2. Context 对象是否保存当前值，还是只表示提供方与读取方共同使用的通道身份？
3. `defaultValue` 在什么条件下使用，是否能随运行时更新？
4. Provider 明确提供 `undefined` 时会不会回退 `defaultValue`？
5. 有意义默认值与 `T | null` 两种 TypeScript 设计分别适合什么情况？
6. 为什么伪造空对象默认值会隐藏 Provider 缺失？
7. Context 与显式 Props、`children` 组合的选择边界是什么？
8. React 19 的 Provider 语法与旧版本有什么公开差异？
9. 两次 `createContext` 使用相同名字和默认值时是否会形成同一通道？
10. 当前范围能否保持一个知识点，还是需要把读取和作用域提前合并？

## 搜索与原文核验

本课按既定搜索顺序使用 Tavily，限定 `react.dev` 官方域名执行 4 组搜索：

1. `createContext` 参数、静态默认值与 React 19 Provider 语法。
2. Context 动机以及 Props、`children` 替代方案。
3. TypeScript 默认值推断、`ContextShape | null` 与缺失检查。
4. Provider `value={undefined}` 是否回退默认值。

搜索成功返回官方候选，因此未切换 Exa、Parallel、Perplexity 或原生搜索。随后使用 Tavily `extract`
读取 5 个官方 URL，5/5 成功：`createContext`、`useContext`、Passing Data Deeply with Context、Using
TypeScript 和 React Versions。搜索摘要只用于定位，以下结论均回到官方原文核验。

## 官方来源与版本

| 来源 | 版本口径 | 支撑事实 |
| --- | --- | --- |
| [React Versions](https://react.dev/versions) | React 19.2 | react.dev 当前文档对应 React 19.2 |
| [`createContext`](https://react.dev/reference/react/createContext) | React 19.2 | 调用位置、签名、返回对象、默认值合同、React 19 Provider 语法 |
| [`useContext`](https://react.dev/reference/react/useContext) | React 19.2 | 无 Provider 时的默认值、Provider `undefined` 不回退 |
| [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) | React 19.2 | Context 动机、独立通道、Props 与 `children` 替代方案 |
| [Using TypeScript](https://react.dev/learn/typescript) | React 19.2 | 默认值类型推断、无合理默认值时使用 `ContextShape | null` |

React Versions 明确最新文档版本为 `19.2`。本仓库 `package.json` 当前锁定 React / React DOM
`19.2.8`，正文只陈述 React 19.2 公共合同；本地 patch 版本只作为生产证据记录在本文件。

## 官方事实

### createContext 的签名与位置

- `createContext(defaultValue)` 应在任何组件之外调用。
- 返回值是 Context 对象；对象本身不保存当前数据，只代表组件提供或读取哪一类 Context。
- 通常在独立模块创建并导出，让 Provider 和读取组件导入同一个对象。

### defaultValue 的精确语义

- 只有组件树上完全没有匹配 Provider 时才使用 `defaultValue`。
- 官方把默认值定义为静态、不会随时间改变的“last resort”兜底。
- 没有有意义默认值时，官方要求传入 `null`。
- Provider 明确提供 `undefined` 时，读取结果是 `undefined`，不会回退默认值。

### Context 与 Props 的边界

- Context 让父组件向整个下方树传递信息，中间组件不需要显式转发同名 Props。
- 官方在使用 Context 前建议先考虑普通 Props 或把 JSX 作为 `children` 传递。
- 不同 `createContext()` 调用创建的 Context 相互独立；名称相同不会合并通道。

### React 19 Provider 语法

- React 19 可以直接渲染 `<SomeContext value={value}>` 作为 Provider。
- React 19 以前使用 `<SomeContext.Provider value={value}>`。
- 课程面向 React 19，因此完整示例使用新语法，并明确旧版本边界。

### TypeScript 类型

- Context 值类型可由 `createContext` 参数推断，也可以显式提供泛型。
- 若存在合理默认值，使用准确的业务联合类型即可。
- 若不存在合理默认值，应显式声明 `ContextShape | null` 并传入 `null`。
- 官方 TypeScript 指南建议在后续专用读取函数中进行运行时存在性检查，以去掉 `null`；该读取函数的
  具体教学属于下一课。

## 课程推导

1. **Context 创建的首要产物是身份。** Provider 与读取方必须引用同一对象，因此创建动作应位于稳定
   模块顶层，而不是组件渲染期间。
2. **默认值是 API 合同，不是初始化便利。** 选择具体默认值意味着组件脱离 Provider 仍有合法行为；
   选择 `null` 意味着 Provider 缺失必须被明确处理。
3. **Provider 是否存在和 Provider 值是否为空是两个维度。** React 只按是否找到匹配 Provider 决定
   是否采用默认值，不执行 `??`、字段合并或空值修复。
4. **伪造默认对象会把配置错误伪装成业务数据。** `T | null` 比类型断言更准确，也为后续统一报错保留边界。
5. **Context 适合树形环境信息，不是全局容器。** 若值只沿短路径传给一个组件，Props 更明确；若多个
   远距离分支需要同类信息，Context 才能减少无意义转发。

## 基础用法

### 有意义默认值

```tsx
import { createContext } from 'react'

type Density = 'comfortable' | 'compact'

export const DensityContext = createContext<Density>('comfortable')
```

### 必须提供的对象

```tsx
import { createContext } from 'react'

type Workspace = { id: string; name: string }

export const WorkspaceContext = createContext<Workspace | null>(null)
```

### React 19 Provider 最小连接

```tsx
/** 为子树提供紧凑密度。 */
function App() {
  return <DensityContext value="compact">{children}</DensityContext>
}
```

该代码只证明 Provider 使用同一 Context 对象提供值。读取、更新传播和最近 Provider 规则分别留给
第 11、12 课。

## 高价值易错点

| 错误名称 | 触发条件 | 原因 | 后果 | 错误示例 | 正确示例 | 适用版本 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 组件内创建 Context | render 中调用 `createContext` | 把通道定义当局部初始化 | 每次得到新身份，提供方和读取方断开 | 组件内声明 `const Ctx = createContext(value)` | 模块顶层创建并导出 | React 19.2 | createContext |
| 默认值当运行时 State | 期待重新创建或改变量后更新默认值 | 混淆静态兜底与 Provider 当前值 | 值不更新或切换到新通道 | `createContext(nextTheme)` | State 产生 Provider `value` | React 19.2 | createContext |
| 伪造对象默认值 | `{} as T`、空 ID/名称 | 为省略缺失检查擦除真实边界 | 漏挂 Provider 时继续使用无效数据 | `createContext({} as Workspace)` | `createContext<Workspace \| null>(null)` | React 19.2 | Using TypeScript |
| `undefined` 会回退 | Provider 提供 `undefined` | 把默认值当空值合并 | 读取方得到意外 `undefined` | `<Ctx value={undefined}>` | Provider 前归一化或显式处理 | React 19.2 | useContext |
| 两个同名 Context 互通 | 两端分别调用 `createContext` | 忽略对象身份 | 只能读到各自默认值 | 两个模块分别创建 `ThemeContext` | 导入同一 Context 对象 | React 19.2 | Passing Data Deeply with Context |
| Props 稍深就全局化 | 单条短路径也建立 Context | 未先尝试 Props/children | 依赖隐藏、复用成本上升 | 为单个按钮文案创建 Context | 短路径保留显式输入 | React 19.2 | Passing Data Deeply with Context |
| 单一大 Context | 塞入互不相关数据 | 把通道误作全局仓库 | 责任和依赖不可解释 | `createContext<AppEverything>(value)` | 按共同语义与作用范围建模 | React 19.2 | createContext、课程推导 |

每个易错点在课程正文中展开触发条件、原因、可观察后果、错误示例、正确写法与验证方式，没有把
`useContext` 更新优化或 Provider 嵌套提前并入本课。

## 高级用法与边界

- Context 文件只导出稳定对象和对应值类型，避免在多个模块重复创建。
- 有意义默认值可以支持独立组件和简单测试；必须提供的数据使用 `T | null` 保留缺失事实。
- React 19 使用 `<Context value={value}>`；React 18 及更早版本必须使用 `.Provider` 语法。
- 类型形状按同一职责组织，不为了减少文件数量创建 `AppEverythingContext`。
- 专用读取 Hook、最近 Provider、更新传播、对象引用优化属于第 11 课。
- 嵌套、覆盖、局部与全局作用域属于第 12 课。
- Reducer 与 Context 组合属于第 13 课，本批结束后必须停止，不能提前研究或实现。

## Demo 设计

- Demo ID：`react.core.learn.intermediate.create-context.default-contract-demo`
- 运行源码：`src/categories/frontend/react/core/demos/create-context/create-context-demo.tsx`
- 样式：`src/categories/frontend/react/core/demos/create-context/create-context-demo.css`

Demo 在模块顶层创建两个 Context：

1. `DensityContext` 使用有意义默认值 `'comfortable'`，类型允许边界值 `undefined`，用于精确观察
   Provider `undefined` 不回退。
2. `WorkspaceContext` 使用 `Workspace | null` 和 `null`，说明必须提供的数据不应伪造对象。

三个确定性情形：

- 没有 Provider：读取 `'comfortable'`。
- Provider 提供 `'compact'`：读取 `'compact'`。
- Provider 提供 `undefined`：读取 `undefined`，不回退 `'comfortable'`。

所有数据固定在本地，无网络、随机数、时间、timer、订阅或 Effect。Demo 只用一次最小 `useContext`
调用显示结果，不讲读取 API 的完整规则；两个 Context 的严格不相等证明名称和默认值不能替代对象身份。

## 验证方式

### 静态检查

- Markdown frontmatter、受控 directive、Demo ID 和 manifest loader 通过现有解析与类型检查。
- 新增 TSX 的组件、事件处理方法上方都有简体中文职责注释。
- CSS 精确搜索不包含 `display: grid`、`grid-template`、`gap` 或非零 `letter-spacing`。
- 正文不包含搜索工具、本地版本、临时脚本、Gate、复审、哈希或构建过程。

### 浏览器检查

- 桌面 `1440px`：三个情形切换后显示预期读取结果。
- 移动 `390px`：单选控件、结果和类型合同不横向溢出或裁切。
- `390px + 200%` 根字号：最长类型文本换行，页面和 Demo 无横向溢出。
- 冷会话 console：`0 error / 0 warning`。

### 同源检查

Demo manifest 的 `loadComponent` 与 `loadSource` 都指向同一个
`./demos/create-context/create-context-demo.tsx`。浏览器读取展示源码后，与运行文件统一去除末尾空白，
比较字符数、UTF-8 字节数和 SHA-256；闭环后把实测值补入本记录。

## 拆课判断

当前正文只有一个可独立命名的公开 API：`createContext`。最小 `useContext` 只用于观察默认值合同，没有
教学 Hook 调用规则、更新订阅或优化；单个 Provider 只用于区别“存在”和“不存在”，没有展开嵌套或
覆盖。因此本课维持单知识点，不与第 11、12 课合并，也不拆出第二篇。

## 验收证据

### 静态检查

- `npm run type-check` 通过。
- `npm run lint` 通过。
- 目标文件 `npx prettier --check` 通过。
- 目标文件 `git diff --check` 通过。
- 精确 CSS 搜索确认没有 `grid`、`gap` 或非零 `letter-spacing`。
- 首轮浏览器解析发现两处无效 `sourceType: official-guide`；改为 schema 接受的
  `official-reference` 后重新打开冷会话，课程 frontmatter 与 Demo 均成功加载。

### Playwright 浏览器验证

- 隔离副本运行于 `/tmp`，没有向仓库写入截图、快照或测试文件。
- `1440 × 1000`：无 Provider 得到 `comfortable`；Provider 提供 `compact` 得到 `compact`；Provider
  提供 `undefined` 得到 `undefined`，并显示“不会退回 createContext 的默认值”。
- 首轮桌面检查发现 Demo 因负外边距产生 `4px` 内部横向溢出；移除负外边距后，Demo
  `clientWidth / scrollWidth = 834 / 834`，页面 `1440 / 1440`。
- `390 × 844`：页面 `clientWidth / scrollWidth = 390 / 390`，Demo `308 / 308`，控件和类型代码
  `clippedCount = 0`。
- `390 × 844` 且根字号 `32px`（200%）：页面仍为 `390 / 390`，Demo 仍为 `308 / 308`，
  `clippedCount = 0`。
- 完成三种交互和两种移动视口后，冷会话 console 为 `0 error / 0 warning`。

### 源码同源

浏览器展开“查看源码”后，对展示源码与实际运行 TSX 统一执行 `trimEnd()`：

| 指标 | 展示源码 | 运行文件 |
| --- | ---: | ---: |
| 字符数 | 3789 | 3789 |
| UTF-8 字节数 | 4155 | 4155 |
| SHA-256 | `e21e588ee73a2f9f394352d813ecef14af04b1f6401a36e735b77eda468d8cdf` | `e21e588ee73a2f9f394352d813ecef14af04b1f6401a36e735b77eda468d8cdf` |

`loadComponent` 与 `loadSource` 均指向
`./demos/create-context/create-context-demo.tsx`，三项实测完全一致。

### 状态登记

- entry manifest 已登记 `create-context` loader。
- Demo manifest 已登记 `react.core.learn.intermediate.create-context.default-contract-demo`。
- track 中第 10-12 课已为 `available`，第 13-29 课保持 `planned`，下一课为“Reducer 与 Context 组合”。
