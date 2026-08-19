# 条件渲染官方研究记录

## 一、冻结范围与版本

- 稳定课程 ID：`react.core.learn.basics.conditional-rendering`
- 标题：条件渲染
- 核验日期：`2026-08-15`
- React 文档基线：`19.2`
- React 固定运行时源码：`v19.2.8`
- React 类型声明：`@types/react@19.2.18`
- 本地 TypeScript 核验版本：`6.0.3`

本记录只研究普通 JavaScript 条件如何选择本次 ReactNode：`if`、提前返回、条件赋值、三元表达式、
`&&`、`null`、同步 ReactNode 结果边界，以及 TypeScript 判别联合与控制流收窄。

TypeScript `6.0.3` 来自 live `package-lock.json`、`node_modules/typescript/package.json` 与
`npm ls typescript --depth=0` 的一致结果。课程 frontmatter 可以在 `appliesTo` 中登记这个实际核验
版本；学习者正文不得写入本地依赖安装状态、核验命令，也不得把 narrowing 公共规则表述为
`6.0.3` patch 独有能力。

以下主题全部排除：列表、`map`、`filter`、`key`、事件、State、任意 Hook、Effect、组件身份、状态
保留与重置、Suspense、Activity、SSR、RSC。父组件条件包含与子组件 `return null` 只允许比较“谁负责
决定这次是否有可见输出”，不得由此展开挂载、卸载、身份或状态结论。

## 二、核验方法

1. 先读取课程调整总计划中的 B10 行、课程内容规范、现有研究、正文、Demo、manifest 登记与
   `/tmp/react-b10-baseline.miWL27`。基线目录中的研究、正文、Demo、manifest 与 live 快照逐文件
   `diff -u` 均无差异。
2. 本次需要的官方 URL 已知，因此直接使用 `curl -L --fail --silent --show-error` 读取 React、
   TypeScript、TC39 与固定源码；没有进行外部关键词搜索，也没有把搜索摘要当证据。
3. 公共 React 教学合同以 React `19.2` 官方 Learn 文档及固定提交为主；React `v19.2.8` 内部源码
   只用于固定同步 scalar child 的当前实现边界，不把 reconciler 名称写入课程正文。
4. TypeScript narrowing 以官方 Handbook 与固定提交为主。本地 TypeScript `6.0.3` 只证明当前仓库
   验证环境，不把 Handbook 的公共规则错误表述为某个本地 patch 独有能力。
5. JavaScript `&&` 与条件运算符的求值规则由 ECMAScript 规范拥有；React 官方文档只负责说明这些
   JavaScript 结果进入 JSX 后的 React 可见结果。

## 三、一手来源

### 1. React 条件渲染

- `R1`：[React Conditional Rendering](https://react.dev/learn/conditional-rendering)，React 文档
  `19.2`。
- `R1-fixed`：React 文档提交
  [`c7d6b700.../conditional-rendering.md`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md)。
  本次通过 raw URL 逐行核对。
- `R2-fixed`：同一提交的
  [`learn/index.md`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/index.md#L182-L220)，
  固定 Quick Start 对普通 JavaScript 条件、变量、三元与 `&&` 的概括。

### 2. ReactNode 类型与运行时结果

- `R3`：固定包
  [`@types/react@19.2.18/index.d.ts`](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts)，
  `ReactNode` 声明位于第 436-449 行。这是 DefinitelyTyped 维护的 TypeScript 类型合同，不冒充
  React 运行时源码。
- `R4-fixed`：React `v19.2.8`
  [`ReactChildFiber.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js#L1917-L1943)，
  固定同步文本 child 与 empty 分支的当前实现。

### 3. TypeScript narrowing

- `T1`：[TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)。
- `T1-fixed`：TypeScript Website 提交
  [`f3cefe75.../Narrowing.md`](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md)。
  该固定提交于 `2026-06-05` 修正文档标题层级，本次通过 raw URL 核对正文。

`T1` / `T1-fixed` 的来源适用范围是 TypeScript 官方 Handbook 当前 narrowing 公共合同与上述
固定文档快照；来源卡可写 `TypeScript 6.0`。课程根 `appliesTo` 应写实际验证的
`TypeScript 6.0.3`，学习者正文不重复这个本地 patch 版本。

### 4. ECMAScript 求值语义

- `E1`：[Binary Logical Operators](https://tc39.es/ecma262/#sec-binary-logical-operators)。
- `E2`：[Conditional Operator](https://tc39.es/ecma262/#sec-conditional-operator)。
- `E-fixed`：TC39 `ecma262` 提交
  [`ae8c512b.../spec.html`](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L21093-L21174)，
  固定本次读取到的规范算法。

## 四、逐 claim 事实账本

每行只记录一个可进入正文的原子事实；“课程采用”列只说明教学边界，不追加未被来源支持的机制。

| ID | 原子 claim | 一手来源 | 课程采用 |
| --- | --- | --- | --- |
| `C01` | React 条件渲染使用 JavaScript 的 `if`、`&&` 和 `? :`。 | [`R1-fixed` 第 7-15 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L7-L15) | 建立“先算 JavaScript，再交给 React”的最小模型。 |
| `C02` | `if` 分支与后续默认 `return` 可以返回不同 JSX tree。 | [`R1-fixed` 第 57-66 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L57-L66) | 覆盖 `if` 与提前返回，不规定必须写 `else`。 |
| `C03` | 组件有意不输出内容时可以返回 `null`。 | [`R1-fixed` 第 107-118 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L107-L118) | 有意为空使用明确的 `return null`。 |
| `C04` | React 官方指出，父组件条件包含或排除子组件通常比子组件自己返回 `null` 更常见。 | [`R1-fixed` 第 155 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L155) | 只比较可见性职责，不讨论生命周期与身份。 |
| `C05` | 三元表达式可以在同一 JSX 位置选择两路结果。 | [`R1-fixed` 第 182-205 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L182-L205) | 覆盖短小的两路互斥结果。 |
| `C06` | 复杂的嵌套条件标记应考虑用变量、函数或子组件整理。 | [`R1-fixed` 第 259 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L259) | 可给可读性建议，但不宣称语法性能差异。 |
| `C07` | React 把 `false`、`null`、`undefined` 视为 JSX tree 中的 hole。 | [`R1-fixed` 第 313 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L313) | 三者没有该位置的可见内容。 |
| `C08` | `0 && <Node />` 的结果会让 React 显示数字 `0`。 | [`R1-fixed` 第 316-324 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L316-L324) | 数量条件改写成表达业务含义的 boolean，例如 `count > 0`。 |
| `C09` | JSX 可以先用 `if` 给变量条件赋值，再把变量嵌入返回树。 | [`R1-fixed` 第 328-352 行](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/conditional-rendering.md#L328-L352) | 条件赋值是 B10 主线，不得在 Demo 中遗漏。 |
| `C10` | 固定 React `v19.2.8` 源码把非空字符串、number、bigint 交给文本 child 分支。 | [`R4-fixed` 第 1917-1931 行](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js#L1917-L1931) | 正文只讲非空字符串与数字的可见结果，不暴露内部名。 |
| `C11` | 固定 React `v19.2.8` 源码把随后未匹配的值作为 empty 处理。 | [`R4-fixed` 第 1933-1943 行](https://github.com/facebook/react/blob/v19.2.8/packages/react-reconciler/src/ReactChildFiber.js#L1933-L1943) | 与 `C07` 共同固定 `false`、`null`、`undefined` 和空字符串结果。 |
| `C12` | `ReactNode` 类型包含 string、number、bigint、boolean、null 与 undefined。 | [`R3` 第 436-449 行](https://cdn.jsdelivr.net/npm/@types/react@19.2.18/index.d.ts#L436-L449) | 只教学本课同步结果；Iterable、Portal、Promise 不进入正文。 |
| `C13` | TypeScript 根据可达性执行 control flow analysis；提前返回会收窄后续路径。 | [`T1-fixed` 第 370-390 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L370-L390) | 覆盖 `string | null` 的提前 guard。 |
| `C14` | truthiness 会把 `0`、`NaN`、空字符串、`0n`、`null`、`undefined` 转成 false。 | [`T1-fixed` 第 125-136 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L125-L136) | 不能把 truthiness 当成精确业务规则。 |
| `C15` | 对 primitive 做整体 truthiness 检查可能遗漏空字符串路径。 | [`T1-fixed` 第 166-190 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L166-L190) | 只排除 `null` 时使用精确比较。 |
| `C16` | 与字面量 `null` 做不等比较可以从联合中移除 `null`。 | [`T1-fixed` 第 233-251 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L233-L251) | `text === null` guard 保留空字符串。 |
| `C17` | 共同 literal 属性构成判别联合，检查 discriminant 会排除不匹配成员。 | [`T1-fixed` 第 633-664 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L633-L664) | 分支内只访问当前成员拥有的字段。 |
| `C18` | `&&` 不保证返回 boolean；左值 ToBoolean 为 false 时返回左值，否则求值并返回右值。 | [`E-fixed` 第 21116-21129 行](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L21116-L21129) | 先算 operand，再判断 ReactNode 可见结果。 |
| `C19` | 条件运算符只求值并返回真、假两支中的一支。 | [`E-fixed` 第 21161-21172 行](https://github.com/tc39/ecma262/blob/ae8c512bc721e31d39fde8c197a846e2f49c5f7a/spec.html#L21161-L21172) | 不得描述成两支 JSX 同时运行。 |
| `C20` | TypeScript 把 `typeof` 检查识别为 type guard，并能沿 `if / else if` 分支收窄。 | [`T1-fixed` 第 31-49 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L31-L49)、[第 144-156 行](https://github.com/microsoft/TypeScript-Website/blob/f3cefe755855eb1d2fb7b4ab178dfcecf1a66027/packages/documentation/copy/en/handbook-v2/Narrowing.md#L144-L156) | 官方支持该写法；可作为现有 TypeScript 收窄章节的短小基础示例，不扩展成类型体操专题。 |

## 五、事实结论与教学边界

### 1. 条件写法不是 React 模板指令

React 组件使用普通 JavaScript 条件选择本次结果；`if`、提前返回、三元、`&&` 和条件变量都是官方
展示的写法（`C01`、`C02`、`C05`、`C09`）。课程可以按结构给出以下非规范性选择建议：

- 整块结构不同：`if` 或提前返回。
- 共享外壳、局部内容不同：先做条件赋值，再嵌入变量。
- 同一位置两个短结果：三元。
- 只有一个可选真分支且左值已经是 boolean：`&&`。

这些是可读性推导，不是 React 语法优先级，也不是 render 次数或性能承诺（`C06`）。

### 2. `&&` 必须分两层理解

ECMAScript 先对左 operand 做 ToBoolean；若为 false，表达式返回原始左值，否则才求值并返回右值
（`C18`）。React 再处理这个结果：`false` 是 hole，但数字 `0` 会显示（`C07`、`C08`）。因此：

```tsx
messageCount && <p>有新消息</p> // 0 时显示 0
messageCount > 0 && <p>有新消息</p> // 0 时得到 false hole
```

不能只把第一行解释成“条件为假所以什么都不显示”。`Boolean(count)` 或 `!!count` 虽不会把 `0`
传给 React，却仍不能表达“数量必须大于零”的领域含义。

### 3. ReactNode 同步结果边界

| 值 | 类型边界 | React 结果 | 直接来源 |
| --- | --- | --- | --- |
| `false` | boolean ReactNode | hole，无该位置的可见内容 | `C07`、`C12` |
| `null` | null ReactNode | hole；可明确表达组件本次不输出内容 | `C03`、`C07`、`C12` |
| `undefined` | undefined ReactNode | hole；不得把漏写 return 教成隐藏写法 | `C07`、`C12` |
| `0` | number ReactNode | 文本 `0` | `C08`、`C10`、`C12` |
| `''` | string ReactNode | 固定源码不建立文本 child，没有可见字符 | `C11`、`C12` |
| 非空字符串 | string ReactNode | 文本内容 | `C10`、`C12` |

`ReactNode` 声明还包含 Iterable、Portal 与 Promise，但它们不属于本课同步条件输出合同，不得借类型
声明扩展到列表、Portal、Suspense、SSR 或 RSC（`C12`）。

### 4. `null` 与父级条件包含

组件可以有意返回 `null`（`C03`）。React 官方同时指出，由父组件条件包含或排除子组件通常更常见
（`C04`）。课程只把它写成可见性职责选择：布局所有者决定区域是否存在，叶子组件可以按自身输入
合同返回 `null`。不得继续解释挂载、卸载、DOM 保留、组件身份或 State 重置。

### 5. TypeScript 收窄只保证当前路径的静态类型

提前 `return null` 后，TypeScript 可以根据可达性收窄后续路径（`C13`）。对 `string | null` 只想排除
`null` 时，应写精确比较；整体 truthiness 会同时排除合法空字符串（`C14`、`C15`、`C16`）。

判别联合的共同 literal 字段可以安全选择成员（`C17`）：

```tsx
type CourseState =
  | { kind: 'ready'; title: string }
  | { kind: 'maintenance'; reason: string }

function CourseStateCard({ state }: { state: CourseState }) {
  if (state.kind === 'maintenance') {
    return <p>{state.reason}</p>
  }

  return <h2>{state.title}</h2>
}
```

这只证明分支中的字段访问符合联合类型，不证明条件符合产品规则。正文不得把判别联合扩写为 Reducer、
State、远程请求结果或状态机课程。

TypeScript 官方示例支持在 `if / else if` 中使用 `typeof` guard（`C20`），而提前返回后的后续路径收窄
由可达性分析支持（`C13`）。它们都属于冻结范围内的基础 narrowing；若正文保留，应作为短小示例服务当前
路径的安全字段访问，不延伸为收窄语法索引。

## 六、课程正文禁入合同

课程正文必须保持面向学习者的知识解释，不得出现以下研究、计划或生产叙事：

1. `B10` 或其他 `Bxx` 编号、路线计划、任务、批次、Gate、进度、完成度、审查、signoff。
2. 前课、后课、上一课、下一课、前置批次、后续课程等生产顺序叙事。
3. 篇幅、行数、字数、源码哈希、临时 fixture、`/tmp`、仓库命令、构建或浏览器验收结果。
4. 本地 TypeScript `6.0.3`、本地依赖安装状态或 `npm ls` 结果。
5. “本课不讲事件 / State / Hook”等课程生产边界句。范围控制由正文实际内容和本研究合同保证，不把
   排除清单反复写给学习者。

正文还不得出现以下越界机制：

- 列表、`map`、`filter`、`key`、排序或重排。
- 事件 handler、State、更新队列、Reducer、任意 Hook、Effect 或副作用教学。
- render / commit 深入、挂载、卸载、组件身份、状态保留或重置。
- Suspense、Activity、SSR、RSC、Server Components。

## 七、现有课程正文处置合同

目标文件只记录合同，不在本任务修改课程正文。

| 现有内容 | 处置 | 精确合同 |
| --- | --- | --- |
| 稳定 ID 与标题“条件渲染” | 保留 | 标题不得改成“条件渲染与列表”等组合标题。 |
| 普通 JavaScript 选择 ReactNode 的最小模型 | 保留并收窄 | 保留 `C01`；删除事件、State、更新流程属于后续课程等生产叙事。 |
| `if`、提前返回与 `else` 边界 | 保留 | 绑定 `C02`；不能把提前返回写成唯一正确风格。 |
| 条件赋值到 `ReactNode` 变量 | 保留 | 绑定 `C09`；它是冻结范围中的独立主线。 |
| 三元表达式与嵌套可读性 | 保留并收窄 | 绑定 `C05`、`C06`、`C19`；不讨论性能或组件身份。 |
| `&&`、`0` 泄漏与显式比较 | 保留 | 绑定 `C07`、`C08`、`C18`；TC39 是运算符求值语义拥有者。 |
| `null` 与同步 ReactNode 结果表 | 保留并校正 | 绑定 `C03`、`C07`、`C10`、`C11`、`C12`；不扩展 Promise 等异步成员。 |
| 父级条件包含与子组件 `return null` | 保留并收窄 | 只保留 `C04` 的可见性职责；删除挂载、身份、保存、重置等边界叙述本身。 |
| 重复 JSX 与共享外壳 | 保留简版 | 绑定 React 官方第 159-180 行；它只是可维护性建议，不扩写成抽象设计。 |
| TypeScript 精确 null guard、控制流和判别联合 | 保留 | 绑定 `C13`、`C15`、`C16`、`C17`；删除 Reducer、远程请求或状态机边界叙事。 |
| `不在右侧执行副作用` 整节 | 删除并移动职责 | 从正文删除；副作用与纯度由“组件与 Hook 的纯度”知识点负责，本任务不迁移实现。 |
| 条件分支副作用 pitfall | 删除并移动职责 | 与上一项一起移出，不以“边界提醒”形式留在 B10。 |
| `React Components and Hooks Must Be Pure` source | 删除并移动职责 | 从 B10 frontmatter 与参考资料删除；它不支持本课剩余原子 claim。 |
| 小结中的副作用句 | 删除 | 小结只收束条件选择、ReactNode 结果与 TypeScript 收窄。 |
| `事件、State 与更新流程分别属于后续课程` | 删除 | 属于生产顺序叙事，不进入学习者正文。 |
| `本例不展开 Reducer / 状态机` | 删除 | 属于越界内容提示；正文示例本身保持为普通判别联合。 |
| Demo“不依赖事件或 State”等说明 | 删除 | 改为直接写可观察目标，不罗列未使用能力。 |
| 根级 `## 学习目标`、`## 为什么需要条件渲染` 未编号 | 补充 | 按内容规范让全部根级二级标题从 `一、` 连续编号，三级标题在每个二级标题内从 `1.` 重新开始。 |
| frontmatter 来源 | 补充并校正 | 删除 pure source；保留 React Conditional Rendering、固定 ReactNode 类型/源码、TypeScript Narrowing 与 TC39 规范，claim 必须与正文实际结论一一对应。 |
| `verifiedAt` 与版本说明 | 补充并校正 | 实施时更新真实核验日期；根 `appliesTo` 可登记 TypeScript `6.0.3`，学习者正文不重复本地版本。 |
| Demo 观察中的“对应测试节点不存在” | 替换 | 改为“对应位置没有可见内容”，不把测试实现写给学习者。 |

现有正文有八个 pitfall。删除副作用 pitfall 后，不新增同义项补数；保留的错误项必须分别服务于
`if` statement、`0 &&`、两路结果误用 `&&`、精确 null 检查、明确 `null`、嵌套条件和重复 JSX。

## 八、现有 Demo 处置合同

现有登记 ID：`react.core.learn.basics.conditional-rendering.branch-selection-demo`。目标文件只记录合同，
不在本任务修改 Demo、CSS 或 manifest。

| Demo 元素 | 处置 | 精确合同 |
| --- | --- | --- |
| 静态 Props 并排展示 | 保留 | 不引入点击、事件、State、Hook 或异步流程。 |
| `CourseState` 判别联合 | 保留 | 只观察 `kind` 收窄与分支字段访问，绑定 `C17`。 |
| `CourseStateCard` 的 `if` 与提前返回 | 保留 | 同时展示 ready / maintenance 两个静态输入，绑定 `C02`。 |
| 三元结果行 | 保留写法、替换生产用语 | 保留 `condition ? A : B`；将 `isVerified` 与“已核验 / 待核验”改成一致的学习场景命名和文案。 |
| `messageCount &&` 与 `messageCount > 0 &&` 对照 | 保留 | 必须让错误侧可见 `0`、正确侧为空，绑定 `C08`、`C18`。 |
| `InternalNote` 返回 `null` | 保留 | 只观察空输出，绑定 `C03`；不解释组件身份或生命周期。 |
| 条件变量 | 补充 | 增加一个静态 `let content` 加 `if` 赋值的可观察结果，绑定 `C09`，不引入交互。 |
| `false`、`null`、`undefined`、空字符串 | 补充说明 | 可在静态结果区用标签标明表达式值；这些结果视觉上都为空，标签不得伪装成被渲染的 child。 |
| 现有 CSS 布局与视觉样式 | 保留 | 功能补充只做最小样式适配，不改主题，不使用 Grid 或 `gap`。 |
| Demo ID、标题和同源源码登记 | 保留 | 若 TSX 源码变更，继续让运行源码与展示源码来自同一文件。 |

## 九、实施验收合同

后续正文和 Demo 调整只有同时满足以下条件，才符合本研究结论：

1. 正文完整覆盖 `if`、提前返回、条件赋值、三元、`&&`、`null`、同步 ReactNode 结果与 TypeScript
   收窄，且每个事实能回到 `C01-C20`。
2. `&&` 明确区分 ECMAScript operand 结果与 React 可见结果，不再把 falsy 直接等同于“什么都不
   显示”。
3. `string | null` 使用精确 null guard；判别联合只演示当前成员字段，不引出 State 或状态机。
4. 正文删除 pure source、副作用整节、对应 pitfall 与小结句，且没有 Effect、身份、保留、重置、
   Suspense、Activity、SSR 或 RSC 内容。
5. 正文没有 Bxx、计划、任务、批次、前后课、篇幅、本地依赖、临时验证或验收叙事。
6. Demo 保留静态分支、三元、`0 &&`、显式 boolean 与 `null`，并补足条件变量观察责任；不引入交互。
7. 根级二级标题与三级标题编号满足课程内容规范，唯一一级标题仍为“条件渲染”。

## 十、研究结论

1. 条件渲染的公共模型是普通 JavaScript 选择 ReactNode，不存在 React 专用条件模板语法（`C01`）。
2. `if`、提前返回、条件变量、三元与 `&&` 都有官方依据；选择标准是结构可读性，不是固定语法优先级
   或性能承诺（`C02`、`C05`、`C06`、`C09`）。
3. `&&` 返回 operand 而非固定 boolean；`0` 会显示，数量条件应产生明确 boolean（`C08`、`C18`）。
4. `false`、`null`、`undefined` 是 hole；`0` 与非空字符串形成文本，空字符串没有可见字符
   （`C07`、`C10`、`C11`、`C12`）。
5. TypeScript 的提前返回、精确 null 检查与判别联合支持分支内安全访问，但 truthiness 可能漏掉合法
   空字符串，类型通过也不证明业务条件正确（`C13-C17`）。
6. 现有正文和 Demo 的主线可复用；必须删除副作用/纯度与生产顺序叙事，收窄父子可见性职责，并在
   Demo 补足条件赋值观察点。
