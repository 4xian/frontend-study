# Props 官方研究记录

## 冻结知识点合同

- 课程 ID：`react.core.learn.basics.props`
- 标题：Props
- 教学层级：本科基础
- 核验日期：`2026-08-15`
- 运行时基线：React / React DOM `19.2.8`
- 类型基线：TypeScript `6.0.3`、`@types/react` `19.2.18`
- 固定比较点：`/tmp/react-b08-baseline.iVnt4h`

本知识点只解释组件怎样接收外部输入：父组件通过 JSX attribute 向子组件传值，函数组件接收一个
`props` 对象，组件可以整体读取或解构该对象，Props 应当作为只读输入使用，调用方与组件之间应通过
TypeScript 建立明确合同。

本知识点必须覆盖：

1. 父组件向子组件提供输入，数据方向是父到子。
2. Props 是函数组件唯一的对象参数，不是多个按位置排列的参数。
3. 字符串、数字、布尔值、对象、数组和函数都可以作为 prop 值。
4. 参数解构、必填属性、可选属性、联合类型、对象结构、数组结构和函数签名。
5. 参数默认值只在属性缺失或值为 `undefined` 时生效。
6. Props 是只读输入；不得修改 prop 字段或 prop 引用的既有对象、数组。
7. 显式传递与 JSX spread 转发的可读性边界。
8. 函数 prop 的参数和返回值合同，以及它与完整事件机制之间的边界。

以下内容不进入学习者正文：

- `children`、组合外壳、命名区域、render prop、`Children` API 和 `cloneElement`。
- 组件或 Hook 的幂等性、局部修改、副作用、严格模式探测等完整纯度规则。
- React 事件对象、DOM 事件类型、传播、捕获、默认行为、事件处理时机和事件系统实现。
- State、更新队列、重新渲染原因、状态所有权和交互更新模型。
- `key`、列表身份、Ref、DOM Props、Context、Hook、Effect、Router、Server Components。
- `React.FC`、`PropsWithChildren`、`ReactNode`、`ReactElement` 等与本知识点无直接关系的类型争论。
- 内部课程编号、路线说明、制作流程和篇幅限制等生产叙事。

## 研究方法与证据边界

1. 已知官方 URL 直接使用 `curl -L --fail --silent --show-error` 读取，不以搜索摘要代替原文。
2. React 教学主线同时核对 react.dev 当前公开页面和 React 文档固定提交
   `c7d6b700038c63d1aaf2c649af1aefe01ebbacac`。
3. React 运行时实现核对 `facebook/react` 标签 `v19.2.8` 的源码与测试；实现细节只用于防止正文
   夸大公共合同。
4. TypeScript 结论只采用 TypeScript 官方 Handbook、JSX 参考和 TSConfig 参考。
5. JavaScript 解构默认值的底层语义采用 TC39 发布的 ECMA-262 规范。
6. 本地依赖版本从当前 `node_modules` 的包声明读取，并与课程 `appliesTo` 基线核对。
7. 本记录只修改研究文件；课程正文、Demo、manifest、Track 和计划均保持只读。

## 官方来源与 claim 绑定

### React 来源

| ID | 官方来源 | 固定版本 | 采用的 claim |
| --- | --- | --- | --- |
| `R1` | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) | React 文档 `19.2` | Props 的父子传值、任意 JavaScript 值、单一对象参数、解构、默认值、spread 和只读快照。 |
| `R2` | [`passing-props-to-a-component.md`](https://github.com/reactjs/react.dev/blob/c7d6b700038c63d1aaf2c649af1aefe01ebbacac/src/content/learn/passing-props-to-a-component.md) | React 文档固定提交 | 固定 R1 的正文措辞和示例边界，避免 current 页面后续漂移。 |
| `R3` | [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure#props-and-state-are-immutable) | React 文档 `19.2` | Props 是不可变快照，不能直接修改 prop 或 prop 引用的既有值。 |
| `R4` | [Using TypeScript](https://react.dev/learn/typescript#typescript-with-react-components) | React 文档 `19.2` | Props 使用对象类型描述，`type` 与 `interface` 都是官方支持的写法，联合类型适合有限选项。 |
| `R5` | [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops) | React `19` | 函数组件移除 `defaultProps`，使用 JavaScript 默认参数。 |
| `R6` | [`ReactJSXElement.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/jsx/ReactJSXElement.js#L161-L274) | React `19.2.8` | 开发环境会浅冻结 element 和 element.props；这不是生产环境的深度不可变机制。 |
| `R7` | [`ReactJSXRuntime-test.js`](https://github.com/facebook/react/blob/v19.2.8/packages/react/src/__tests__/ReactJSXRuntime-test.js#L104-L163) | React `19.2.8` | 固定测试确认开发环境修改或新增 element prop 会抛错，生产分支没有同样的冻结保证。 |
| `R8` | [Responding to Events](https://react.dev/learn/responding-to-events#adding-event-handlers) | React 文档 `19.2` | 事件函数必须传递而不是在 render 中提前调用；完整事件机制不属于本知识点。 |

### TypeScript 与 ECMAScript 来源

| ID | 官方来源 | 适用范围 | 采用的 claim |
| --- | --- | --- | --- |
| `T1` | [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) | TypeScript 当前 Handbook | 对象类型、必填/可选属性、`readonly` 属性、数组和 `ReadonlyArray`。 |
| `T2` | [TypeScript: Everyday Types - Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) | TypeScript 当前 Handbook | 联合类型表达有限候选值或多种允许类型。 |
| `T3` | [TypeScript: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions) | TypeScript 当前 Handbook | 函数类型表达式应写明参数和返回值，不应使用宽泛的全局 `Function` 类型。 |
| `T4` | [TypeScript: JSX](https://www.typescriptlang.org/docs/handbook/jsx.html#function-component) | TypeScript 当前 JSX 参考 | 函数组件的第一个参数是 props 对象，JSX attribute 按该对象类型检查必填和可选属性。 |
| `T5` | [TSConfig: exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html) | TypeScript 当前 TSConfig | 可选属性是否允许显式 `undefined` 受该选项影响；属性缺失与属性存在但值为 `undefined` 并不完全相同。 |
| `E1` | [ECMA-262: KeyedBindingInitialization](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-runtime-semantics-keyedbindinginitialization) | ECMAScript 当前规范 | 解构绑定只在读取值为 `undefined` 时计算 initializer。 |

## 逐条事实结论

| Claim | 事实 | 教学口径 | 证据 |
| --- | --- | --- | --- |
| `C01` | 父组件可在子组件 JSX 标签上提供 Props。 | Props 是调用方提供给组件的输入。 | `R1`、`R2` |
| `C02` | 自定义组件的 prop 可以承载任意 JavaScript 值，包括对象、数组和函数。 | 值的种类由 JavaScript 决定，组件可接受的范围由 Props 合同决定。 | `R1`、`R2` |
| `C03` | 函数组件接收一个 `props` 对象。 | 不按 attribute 顺序声明多个业务形参。 | `R1`、`T4` |
| `C04` | 组件既可整体读取 `props.name`，也可在唯一参数位置解构。 | 两种写法合同相同；选择更清楚的一种。 | `R1`、`R2` |
| `C05` | 对象解构中的 `:` 是重命名，不是类型标注。 | Props 类型标在完整参数之后。 | `T1` |
| `C06` | 解构默认值只处理属性缺失或值为 `undefined`。 | `null`、`0`、`false` 和空字符串都不会触发默认值。 | `R1`、`E1` |
| `C07` | 参数默认值和可选属性是两层合同。 | `size = 100` 负责运行时取值；`size?: number` 负责调用方能否省略。 | `R1`、`T1`、`T4` |
| `C08` | React 19 的函数组件不再使用 `defaultProps`。 | 当前函数组件用参数默认值。 | `R5` |
| `C09` | Props 是当前 render 的只读快照。 | 读取当前输入，不给 prop 重新赋值。 | `R1`、`R3` |
| `C10` | 只读合同也覆盖 prop 引用的既有对象和数组。 | 不改对象字段，不调用 `push`、`sort`、`splice` 等变异方法。 | `R3` |
| `C11` | React 不会因为数据从父到子传递就自动深拷贝对象。 | 单向输入描述所有权方向，不代表获得可修改副本。 | `R1`、`R3` |
| `C12` | React 开发构建对 element.props 的浅冻结是实现诊断。 | 正文不把浅冻结、抛错或生产行为当成遵守只读合同的前提。 | `R6`、`R7` |
| `C13` | TypeScript 的 `readonly` 属性和只读数组可阻止常见写操作。 | 类型约束用于帮助遵守合同，但不是深冻结或运行时验证。 | `T1` |
| `C14` | Props 类型应是对象类型，可用 `type` 或 `interface`。 | 课程统一使用 `type`，不宣称 `interface` 错误或较差。 | `R4`、`T1` |
| `C15` | 没有 `?` 的属性为必填，带 `?` 的属性允许省略。 | 必填与可选应反映真实调用合同。 | `T1`、`T4` |
| `C16` | 联合类型可把 prop 限制为有限选项。 | 例如 `level?: '基础' | '进阶'`，避免用宽泛 `string` 隐藏合法范围。 | `R4`、`T2` |
| `C17` | 对象 prop 应列出组件实际读取的字段。 | 不用宽泛 `object` 代替已知结构。 | `T1` |
| `C18` | 数组 prop 应声明元素类型；只读输入可写成 `readonly T[]`。 | 组件只读取数组时优先使用只读数组合同。 | `T1`、`R3` |
| `C19` | 函数 prop 应写明参数与返回值。 | 写成 `(minutes: number) => string`，不写 `Function`。 | `T3` |
| `C20` | 函数 prop 可以表达由调用方提供、由组件调用的行为。 | 纯格式函数可在 render 中调用；带副作用的回调只传给事件位置，不在 render 中提前调用。事件对象、传播和默认行为不展开。 | `R1`、`R8`、`T3` |
| `C21` | `<Child {...props} />` 会把对象属性逐项转发给 Child。 | spread 不是传入一个名为 `props` 的字段。 | `R1`、`T4` |
| `C22` | React 官方要求克制使用 JSX spread。 | 默认显式列名；只有薄封装完整转发同一合同才使用一次 spread。 | `R1`、`R2` |
| `C23` | 当前仓库未启用 `exactOptionalPropertyTypes`。 | 本课可用 `prop?: T` 展示省略和显式 `undefined`；研究记录保留配置差异，正文不扩展 TSConfig。 | `T5`、当前 `tsconfig` |

## 一、Props 的核心模型

Props 是组件的输入合同。父组件在子组件标签上提供值，React 为这次 element 建立对应的 props，
函数组件从一个对象参数中读取这些值：

```text
父组件 JSX attribute
  -> 当前 element 的 props
  -> 子组件收到一个 props 对象
  -> 子组件读取输入并计算 UI
```

```tsx
type LessonTitleProps = {
  title: string
  minutes: number
}

// 根据调用方提供的课程信息生成标题。
function LessonTitle({ title, minutes }: LessonTitleProps) {
  return <h2>{title} · {minutes} 分钟</h2>
}

// 为课程标题组件提供输入。
function CoursePage() {
  return <LessonTitle title="Props" minutes={20} />
}
```

这里的父到子只表示输入由调用方提供、被调用组件读取。它不表示 React 深拷贝对象，也不授权子组件
修改输入。

## 二、一个 props 对象与两种读取方式

错误模型是把每个 prop 当成一个位置参数：

```tsx
// 错误：第二个形参不是名为 minutes 的 prop。
function LessonTitle(title: string, minutes: number) {
  return <h2>{title} · {minutes}</h2>
}
```

正确模型是一个对象参数。可以整体读取：

```tsx
// 从完整 props 对象读取字段。
function LessonTitle(props: LessonTitleProps) {
  return <h2>{props.title} · {props.minutes} 分钟</h2>
}
```

也可以在唯一参数位置解构：

```tsx
// 在唯一参数位置解构 Props。
function LessonTitle({ title, minutes }: LessonTitleProps) {
  return <h2>{title} · {minutes} 分钟</h2>
}
```

对象解构的冒号表示重命名。以下写法不会把 `title` 标注成 `string`，而是建立名为 `string` 的绑定：

```tsx
// 错误：title 被重命名为变量 string。
function LessonTitle({ title: string }) {
  return <h2>{string}</h2>
}
```

类型应标在完整对象参数之后：

```tsx
// 为完整解构参数标注对象类型。
function LessonTitle({ title }: { title: string }) {
  return <h2>{title}</h2>
}
```

## 三、Props 可以承载的值

Props 可以承载字符串、数字、布尔值、对象、数组和函数。JSX 引号传入字面字符串，花括号传入
JavaScript expression 的计算结果：

```tsx
const title = 'Props'
const lesson = { title: 'Props', minutes: 20 }
const topics = ['必填属性', '默认值']

<LessonTitle title="Props" minutes={20} />
<LessonCard lesson={lesson} topics={topics} />
<LessonTitle title={title} minutes={lesson.minutes} />
```

`title="title"` 传入的是文本 `title`；`title={title}` 才读取变量。布尔 prop 只写属性名等价于显式
传入 `true`，但完整条件选择不属于本知识点。

## 四、TypeScript Props 合同

### 4.1 `type` 与 `interface`

React 官方允许使用 `type` 或 `interface` 描述 Props 对象：

```tsx
type LessonTitleProps = {
  title: string
}

interface LessonDurationProps {
  minutes: number
}
```

两者在基础 Props 场景都有效。正文统一使用 `type` 只是为了示例一致。

### 4.2 必填与可选

```tsx
type LessonCardProps = {
  title: string
  level?: string
}
```

- `title: string` 要求调用方提供字符串。
- `level?: string` 允许调用方省略该属性。
- 未提供默认值时，组件读取可选属性需要考虑 `undefined`。
- 可选不等于已有默认值；默认值也不会自动把必填属性改成可选。

### 4.3 联合类型

有限选项应直接写入合同：

```tsx
type LessonCardProps = {
  title: string
  level?: '基础' | '进阶'
}
```

联合类型会拒绝合同外的文本，比 `level?: string` 更准确。

### 4.4 对象与数组

```tsx
type Lesson = {
  readonly title: string
  readonly minutes: number
}

type LessonCardProps = {
  lesson: Lesson
  topics: readonly string[]
}
```

对象类型应列出组件真实读取的字段。宽泛 `object` 不能让组件安全读取 `title` 或 `minutes`。数组应
声明元素类型；组件只读取数组时，`readonly string[]` 可阻止 `push`、`sort`、`splice` 等写操作。

### 4.5 函数 prop

```tsx
type DurationProps = {
  minutes: number
  formatMinutes: (minutes: number) => string
}

// 使用调用方提供的格式化合同生成文本。
function Duration({ minutes, formatMinutes }: DurationProps) {
  return <span>{formatMinutes(minutes)}</span>
}
```

函数类型必须说明怎样调用：参数 `minutes` 是 `number`，返回值是 `string`。全局 `Function` 类型不能
表达这个合同，也会让参数和返回值失去有效检查。

函数 prop 也可以表达“子组件在某个时机通知调用方”的合同，例如
`onSelect: (lessonId: string) => void`。纯格式函数可以在 render 中调用；带副作用的回调只能作为函数
传给事件位置，不能在 render 中写成 `onSelect(...)` 或 `onClick={handler()}` 提前执行。本知识点只
解释函数的领域参数和返回值合同，不引入 React 事件对象、DOM 事件类型、传播、默认行为或事件系统。

## 五、默认值的精确边界

```tsx
type CourseBadgeProps = {
  label: string
  size?: number
}

// 缺少尺寸时使用默认尺寸。
function CourseBadge({ label, size = 100 }: CourseBadgeProps) {
  return <span>{label} · {size}</span>
}
```

| 调用 | 组件内 `size` | 是否使用默认值 |
| --- | ---: | --- |
| `<CourseBadge label="基础" />` | `100` | 是，属性缺失。 |
| `<CourseBadge label="基础" size={undefined} />` | `100` | 是，值为 `undefined`。 |
| `<CourseBadge label="基础" size={0} />` | `0` | 否，`0` 是明确值。 |
| `<CourseBadge label="基础" size={null} />` | `null` | 否；当前 `number` 类型也会拒绝该调用。 |

`false` 和空字符串同样不会触发默认值。默认参数检查的不是“truthy/falsy”，而是读取结果是否为
`undefined`。

运行时默认与调用类型必须分开理解：

```tsx
type CourseBadgeProps = {
  label: string
  size: number
}

// 默认值不改变 size 的必填类型。
function CourseBadge({ label, size = 100 }: CourseBadgeProps) {
  return <span>{label} · {size}</span>
}
```

上例仍要求调用方提供 `size`。要允许省略，字段本身还要写成 `size?: number`。当前仓库没有开启
`exactOptionalPropertyTypes`，因此该可选属性也允许显式传入 `undefined`；正文只需讲清当前合同，
不展开 TSConfig 差异。

React 19 已移除函数组件的 `defaultProps` 支持。当前函数组件使用参数默认值；类组件兼容行为与本
知识点无关。

## 六、只读输入合同

Props 是当前 render 的只读输入。组件可以根据输入计算新值，但不能修改输入本身：

```tsx
type Lesson = {
  title: string
}

type LessonNameProps = {
  lesson: Lesson
}

// 错误：修改了调用方拥有的对象。
function LessonName({ lesson }: LessonNameProps) {
  lesson.title = lesson.title.toUpperCase()
  return <h2>{lesson.title}</h2>
}
```

```tsx
// 从输入计算新的局部显示值。
function LessonName({ lesson }: LessonNameProps) {
  const displayTitle = lesson.title.toUpperCase()
  return <h2>{displayTitle}</h2>
}
```

只读合同既禁止 `props.title = ...`，也禁止修改 prop 引用的既有对象和数组。React 不会因为传递方向
是父到子就自动深拷贝对象。

TypeScript 可把意图写进类型：

```tsx
type Lesson = {
  readonly title: string
  readonly minutes: number
}

type LessonTopicsProps = {
  lesson: Lesson
  topics: readonly string[]
}
```

`readonly` 是静态辅助，不是运行时验证器，也默认不是递归深只读。React `19.2.8` 的固定源码和测试
显示：开发环境会浅冻结 element.props，并在常见修改时抛错；生产分支没有同样的保证。因此课程必须
把“不得修改 Props”写成公开行为合同，不能写成“只要运行时没报错就可以修改”，也不必向初学者展开
冻结实现。

完整的组件幂等性、局部修改与副作用边界不属于本知识点。这里仅保留“输入不可改、可计算局部值”这
一条直接规则。

## 七、显式传递与 spread

默认显式列出目标组件需要的属性：

```tsx
<LessonCard lesson={lesson} topics={topics} formatMinutes={formatMinutes} />
```

调用处可以直接看到数据合同。薄封装确实接受并完整转发同一份 Props 时，可以使用 JSX spread：

```tsx
type LessonCardProps = {
  lesson: Lesson
  topics: readonly string[]
  formatMinutes: (minutes: number) => string
}

// 完整转发同一份 LessonCard Props 合同。
function LessonCardFrame(props: LessonCardProps) {
  return <LessonCard {...props} />
}
```

`<LessonCard {...props} />` 会把对象中的字段逐项转发；它与 `<LessonCard props={props} />` 含义不同。
后者只传入一个名为 `props` 的字段，而且目标组件必须专门声明该字段。

spread 的可读性规则：

1. 默认显式列出属性。
2. 只有当前组件不消费这些字段、并把同一份完整合同转给明确目标时，才使用一次 spread。
3. 不为减少几行代码隐藏组件真正需要的字段。
4. 若封装只转发部分字段，应显式解构和显式传递。

## 八、常见错误与验证方式

| 错误 | 错误原因 | 正确方向 | 定向验证 | 证据 |
| --- | --- | --- | --- | --- |
| 把 prop 当位置参数 | 函数组件接收一个对象 | 使用 `props.title` 或唯一参数解构 | 类型检查组件签名 | `C03`、`C04` |
| 把 expression 写进引号 | 引号传字面字符串 | 非字符串值使用花括号 | 核对实际值和类型 | `C02` |
| 在解构中写 `{ title: string }` | 冒号表示重命名 | 把对象类型标在参数之后 | TypeScript 负向检查 | `C05` |
| 有默认值但字段仍写必填 | 默认值不改变 JSX 调用合同 | 允许省略时同时写 `?` | 省略调用应通过类型检查 | `C07` |
| 认为默认值覆盖所有假值 | 只有 `undefined` 触发 initializer | 分别处理 `0`、`false`、空字符串和 `null` | 四类输入对照 | `C06` |
| 修改对象或数组 prop | 修改了调用方拥有的数据 | 计算局部值，输入保持不变 | 比较调用前后对象 | `C09`、`C10` |
| 只给外层字段写 `readonly` 就认为深只读 | TypeScript `readonly` 默认是浅层 | 对嵌套结构继续建模，并遵守运行时合同 | TypeScript 负向检查 | `C13` |
| 对已知对象使用 `object` | 不能读取具体字段 | 写出实际字段结构 | 访问字段时应有类型信息 | `C17` |
| 对函数 prop 使用 `Function` | 参数和返回值合同丢失 | 使用函数类型表达式 | 传错参数或返回值应报错 | `C19` |
| 无差别 spread | 隐藏接口并携带无关字段 | 显式传递；同合同薄封装才 spread | 对照目标 Props 类型 | `C21`、`C22` |
| 把 spread 当作名为 props 的属性 | 两种 JSX 语法含义不同 | 区分 `{...props}` 与 `props={props}` | 检查目标对象的键 | `C21` |
| 在 Props 课展开 SyntheticEvent | 把函数输入合同扩成事件机制 | 只保留领域参数函数签名 | 扫描事件术语和事件类型 | `C20` |

## 当前资产审计

### 研究记录

| 动作 | 当前内容 | 冻结结论 |
| --- | --- | --- |
| 保留并合并 | 父到子输入、一个 props 对象、整体读取与解构 | 合并为连续主线，避免在多节重复同一示例。 |
| 保留并补充 | 必填、可选、对象和函数类型 | 补齐联合类型、只读数组、函数参数与返回值合同。 |
| 保留并校准 | 默认值表格 | 明确只处理缺失/`undefined`，区分运行时默认与 TypeScript 可选合同。 |
| 保留并校准 | Props 只读快照 | 保留对象和数组不可修改；删除把开发浅冻结当公共机制的写法。 |
| 保留并收窄 | JSX spread | 只讲显式传递优先和同合同薄封装转发。 |
| 删除 | `children`、`ReactNode`、`ReactElement`、`PropsWithChildren` | 与 Props 输入主线分离，不在本知识点展开。 |
| 删除 | `key`、特殊属性警告、列表身份 | 不属于冻结范围。 |
| 删除 | `React.FC` 传言、Server Components、Ref、条件渲染 | 不帮助完成本知识点目标。 |
| 删除 | 构建验收过程、执行状态和路线说明 | 研究记录只保留事实、边界和实施合同。 |

### 学习者正文 `src/categories/frontend/react/core/learn/props.md`

| 动作 | 位置或主题 | 冻结结论 |
| --- | --- | --- |
| 保留 | “为什么需要 Props”“父组件提供输入” | 合并重复解释，直接建立输入合同。 |
| 保留 | JSX 字符串、expression、布尔简写 | 只解释值怎样成为 prop，不展开条件渲染。 |
| 保留 | 一个 props 对象、整体读取、参数解构 | 删除重复代码，保留解构冒号易错点。 |
| 保留并补充 | TypeScript 必填、可选、联合、对象、数组、函数 | 函数 prop 增加领域参数合同与事件边界；数组使用只读合同。 |
| 保留并校准 | 默认值 | 保留缺失、`undefined`、`0`、`null` 对照，并说明 `?` 与默认参数是两层合同。 |
| 保留并收窄 | 只读 Props | 只讲禁止修改与局部计算，不展开组件纯度原理。 |
| 保留并收窄 | 显式传递与 spread | 保留一次受控转发示例，删除无关扩展。 |
| 删除 | “key 不是普通 prop”全节及对应目标、recap、pitfall、总结和来源 | `key` 不属于本知识点合同。 |
| 删除 | `React.FC`、运行时数据验证、跨课程用途说明 | 与基础 Props 输入合同无直接关系。 |
| 删除 | 课程衔接、独立教学安排等路线句 | 学习者正文不得出现课程生产叙事。 |
| 删除 | 重复的函数注释和重复的“原因”段 | 保持内容直接，不重复同一信息。 |
| 更新 | `verifiedAt`、sources、objectives、recap、参考资料 | 与本次官方证据和冻结范围一致。 |

### Demo `src/categories/frontend/react/core/demos/props/props-demo.tsx`

| 动作 | 当前内容 | 冻结结论 |
| --- | --- | --- |
| 保留 | `LessonCardProps` 的字符串、对象、可选联合、只读数组、格式化函数 | 覆盖本知识点的主要类型合同。 |
| 保留 | `level = '基础'` | 观察省略可选属性后的默认值。 |
| 保留 | `displayTitle`、`topics.join` | 证明组件从输入计算局部结果，不修改对象或数组。 |
| 校准 | `<LessonCard {...advancedCardProps} />` | 当前只是把对象展开成 Props，不能称为组件转发；增加不消费字段的薄封装，由薄封装执行 `<LessonCard {...props} />`。 |
| 校准 | `itemId` | 若只用于旧 `key` 示例，应删除；如需展示普通字符串 prop，改为有明确业务含义的 `courseCode`。 |
| 校准文案 | “受控 spread”“不修改父组件拥有的数据” | 文案只描述 Props，不引用计划或相邻知识点。 |
| 不增加 | 按钮、事件、State、Hook、条件切换、数组变异 | 静态 Demo 已足够验证本知识点。 |

### 注册与 Track

| 文件 | 当前状态 | 冻结结论 |
| --- | --- | --- |
| `demo-manifest.ts` | 已注册 `react.core.learn.basics.props.input-contract-demo`，标题为“Props 输入合同示例” | ID、标题和加载路径均与本知识点一致，保留。 |
| `entry-manifest.ts` | 已导入 Props meta，并以 slug `props` 懒加载正文 | 注册结构正确，保留。 |
| `react-core-track.ts` | 已包含 `react.core.learn.basics.props` | 研究阶段不修改状态；Track 注册不替代正文、验证和复审证据。 |

## 正文冻结结构

学习者正文按以下顺序组织，标题保持简短：

1. Props 的作用：同一组件接收不同输入。
2. 父组件传值：字符串、expression、布尔简写。
3. props 对象：整体读取、解构、解构类型位置。
4. TypeScript 合同：必填、可选、联合、对象、数组、函数。
5. 默认值：缺失、`undefined`、`0`、`false`、空字符串、`null`。
6. 只读输入：禁止修改顶层字段、对象和数组；计算局部值。
7. spread：显式传递优先、同合同薄封装转发。
8. Demo、易错点、练习和总结。

同一规则只在概念解释、一个代表性示例和一个易错点中各承担不同职责，不复制整段说明。正文可以
详细，但每段直接回答“是什么、怎么写、为什么、怎样验证”。

## Demo 冻结合同

Demo 维持静态双卡结构，其中一支为 `PropsDemo -> LessonCard`，另一支为
`PropsDemo -> LessonCardFrame -> LessonCard`：

- `LessonCardProps` 包含普通字符串 `courseCode`、结构化对象、可选联合、只读数组和格式化函数。
- 第一张卡显式传值并省略 `level`，页面显示默认值“基础”。
- 第二张卡使用事先按 `LessonCardProps` 检查的对象。
- 增加最小 `LessonCardFrame(props: LessonCardProps)`；它不消费字段，只执行
  `<LessonCard {...props} />`，由此准确演示完整合同转发。
- 子组件从 `lesson.title` 计算 `displayTitle`，从 `topics` 计算文本，不修改输入。
- 运行源码和展示源码保持同源。
- 不增加交互，以免把函数 prop 合同扩展为事件或 State 教学。

## 定向验收合同

### 内容扫描

学习者正文和 Demo 展示源码必须满足：

- 不出现 `B08` 或其他 Bxx 编号。
- 不出现内部课程编号、路线说明、制作流程或篇幅限制等生产叙事。
- 不展开 `children`、组件纯度、事件机制、State 或更新模型。
- 不保留 `key`、`React.FC`、`ReactNode`、`ReactElement`、`PropsWithChildren` 等越界教学。
- 课程标题保持“Props”，Demo 标题保持“Props 输入合同示例”。

### TypeScript 临时验证

临时验证至少覆盖：

1. 缺少必填属性时报错。
2. 可选联合接受省略、“基础”和“进阶”，拒绝其他字符串。
3. 对象 prop 缺字段或字段类型错误时报错。
4. 只读数组拒绝 `push`，只读对象字段拒绝赋值。
5. 函数 prop 的参数或返回值不匹配时报错。
6. 省略默认属性和显式传 `undefined` 均得到默认值。
7. `0`、`false`、空字符串和 `null` 不触发 JavaScript 默认值。
8. 受控 spread 对象满足完整 `LessonCardProps`。

临时资产放在 `/tmp`，验证完成后删除，不在仓库保留测试文件。

### 浏览器验证

- 两张卡片均由同一个组件渲染，并显示不同输入。
- 第一张显示默认 `level`，第二张显示显式 `level`。
- 对象、数组和函数 prop 的计算结果与源码一致。
- 页面和 Demo 无 console error/warning，无失败请求。
- 桌面、390px 和 200% 文本缩放下无横向溢出、裁切或重叠。
- 展示源码与实际运行源码一致。

## 结论

Props 正文应围绕“父组件提供只读输入，子组件通过一个对象参数读取，TypeScript 精确描述合同”展开。
默认值、对象/数组只读、函数签名和 spread 是这一主线的必要边界。`children`、组件纯度、事件机制、
State/更新模型及其他相邻 API 不进入正文。现有 Demo 的静态双卡结构可保留，正文需要删除越界主题、
重复段落和路线叙事，并按本记录补齐函数 prop 与 TypeScript 合同的精确说明。
