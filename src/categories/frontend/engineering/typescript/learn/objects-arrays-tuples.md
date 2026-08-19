---
id: engineering.typescript.learn.basics.objects-arrays-tuples
type: lesson
title: 对象、数组与元组
summary: 用属性、修饰符、同类集合和固定位置合同准确描述数据形状
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 对象类型
  - 可选属性
  - readonly
  - 数组
  - 元组
  - tuple
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Object Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Object%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 属性类型
      - 可选属性
      - readonly 属性
      - 索引签名
      - 元组类型
  - title: "TypeScript Handbook: Everyday Types"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Everyday%20Types.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 对象类型
      - 数组类型
      - 类型别名
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.everyday-types
objectives:
  - 用必需、可选和 readonly 属性描述对象合同
  - 根据元素是否同质选择数组或元组
  - 读懂结构类型检查对多余属性和可赋值性的基本影响
  - 通过正反例验证属性与元组位置约束
recap:
  - 必需、可选与 readonly 属性分别表达存在性和赋值边界。
  - 同质可变集合使用数组，长度与位置属于合同的少量值使用元组。
  - 结构兼容和新鲜对象字面量检查都不是运行时字段过滤。
---

# 对象、数组与元组

## 一、为什么需要

真实数据通常不是孤立 primitive，而是一组有名字或位置含义的值。对象适合用属性名表达业务角色，数组适合保存同类集合，元组适合表达长度和位置都属于合同的少量值。选错模型会让调用方只能靠约定猜测。

## 二、核心概念和最小模型

~~~~ts
interface LessonSummary {
  readonly id: string
  title: string
  description?: string
}

const lesson: LessonSummary = {
  id: 'objects-arrays-tuples',
  title: '对象、数组与元组',
}

const topics: string[] = ['object', 'array', 'tuple']
const progress: [completed: number, total: number] = [2, 8]

export { lesson, progress, topics }
~~~~

对象类型按成员检查结构：必需属性必须存在，可选属性可能缺失，readonly 阻止通过该属性位置重新赋值。数组的所有元素共享一个元素类型；元组除了每个位置的类型，还保存长度与位置顺序。

## 三、知识点详解

### 1. 对象类型

**它是什么：** 对象类型列出一个值必须具有的属性以及每个属性的类型。属性名称描述数据含义，属性类型
限制允许的值。

**它有什么用：** 它能让课程、用户或配置对象在创建、传递和读取时保持同一数据形状。

**怎么使用：** 先把业务一定需要的字段写成必需属性，再为真实可能缺失的字段添加 `?`。

~~~~ts
type Course = {
  id: string
  title: string
  description?: string
}

const course: Course = { id: 'objects', title: '对象类型' }
~~~~

### 2. optional 与 readonly 属性

**它们是什么：** `?` 表示属性可能不存在，`readonly` 表示属性在通过该类型访问时不能被重新赋值。

**它们有什么用：** optional 能准确表达缺失数据，readonly 能保护 ID、创建时间等稳定入口，避免意外修改。

**怎么使用：** 只给真实可缺失字段添加 `?`，只保护需要稳定的属性；`readonly` 不会递归冻结嵌套对象。

~~~~ts
type Lesson = {
  readonly id: string
  title: string
  completedAt?: Date
}

const lesson: Lesson = { id: 'arrays', title: '数组' }
lesson.title = '数组与元组'
~~~~

### 3. 数组

**它是什么：** 数组是同类元素组成的可变长度集合，类型写成 `T[]` 或 `Array<T>`。

**它有什么用：** 搜索结果、标签和课程列表都可以用数组表示，调用方只依赖元素类型，不依赖固定位置。

**怎么使用：** 为元素定义对象类型，再把列表声明为该元素类型的数组；遍历时参数会自动获得元素类型。

~~~~ts
const lessons: Lesson[] = [
  { id: 'objects', title: '对象' },
  { id: 'arrays', title: '数组' },
]

const titles = lessons.map((item) => item.title)
~~~~

### 4. 元组

**它是什么：** 元组是长度和每个位置类型都固定的数组类型，可以用标签说明各位置含义。

**它有什么用：** 坐标、键值对、函数返回的成对结果等协议依赖位置含义，元组能阻止位置颠倒或数量错误。

**怎么使用：** 用 `[名称: 类型, 名称: 类型]` 写出固定位置；如果集合会增长或元素同类，则继续使用数组。

~~~~ts
type LessonProgress = [completed: number, total: number]

const progress: LessonProgress = [3, 8]
const [completed, total] = progress
~~~~

### 5. 结构检查与多余属性检查

**它们是什么：** TypeScript 按对象是否拥有目标所需成员判断兼容性；对象字面量直接赋值时还会检查多写的
未知属性。

**它们有什么用：** 结构检查允许不同来源的对象复用同一合同，多余属性检查则能及时发现字段拼写错误。

**怎么使用：** 在函数参数上声明最小所需结构，并让对象字面量直接接受检查；运行时外部数据仍需单独验证。

~~~~ts
/** 显示任何拥有 title 属性的值。 */
function showTitle(value: { title: string }): string {
  return value.title
}

const titledValue = { title: '结构类型', extra: true }
showTitle(titledValue)
~~~~

## 四、动手实践：为对象、列表和固定位置选择不同合同

下面的模型分别使用对象表达具名数据、数组表达同类集合、tuple 表达固定位置协议。

~~~~ts
interface Course {
  readonly id: string
  title: string
  tags?: string[]
}

const courses: Course[] = [{ id: 'ts', title: 'TypeScript', tags: ['types'] }]
const progress: readonly [completed: number, total: number] = [3, 24]
~~~~

尝试修改 course.id、向 tags 添加数字以及颠倒 progress 的两个位置。然后把 tuple 改为普通 number[]，比较类型系统还能够保留哪些位置信息。
## 五、易错使用提示

:::pitfalls
### 把所有属性都声明为可选

**触发条件：** 把所有属性都声明为可选

**原因：** 可选属性表示值可能真实缺失，不是为了省掉创建对象时的必需字段。

**后果：** 每个读取点都要处理 undefined，核心业务合同反而不清楚。

**错误示例：**

~~~~ts
interface Lesson {
  id?: string
  title?: string
}
const lesson: Lesson = {}
~~~~

**正确写法：**

~~~~ts
interface Lesson {
  id: string
  title: string
  description?: string
}
const lesson: Lesson = { id: 'types', title: '对象类型' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 误以为 readonly 会冻结运行时对象

**触发条件：** 误以为 readonly 会冻结运行时对象

**原因：** readonly 只限制通过类型化属性重新赋值，不会调用 Object.freeze。

**后果：** 其他引用或运行时代码仍可能修改对象，嵌套成员也不会自动深只读。

**错误示例：**

~~~~ts
interface State { readonly config: { theme: string } }
const state: State = { config: { theme: 'light' } }
state.config.theme = 'dark' // 允许：config 的引用未改变
~~~~

**正确写法：**

~~~~ts
interface State { readonly config: { readonly theme: string } }
const state: State = { config: { theme: 'light' } }
// 需要运行时不可变时，再配合 Object.freeze 或不可变更新
~~~~

**验证方式：** 对照正确写法验证结果。

### 让普通数组代替固定协议元组

**触发条件：** 让普通数组代替固定协议元组

**原因：** 普通联合数组不保存位置与长度，读取结果始终是所有元素类型的联合。

**后果：** 调用方无法知道第一个和第二个位置各自代表什么。

**错误示例：**

~~~~ts
const progress: (number | string)[] = [2, '8 lessons']
const completed = progress[0]
// number | string；开启 noUncheckedIndexedAccess 时还包含 undefined
~~~~

**正确写法：**

~~~~ts
const progress: [completed: number, label: string] = [2, '8 lessons']
const completed = progress[0] // number
~~~~

**验证方式：** 对照正确写法验证结果。

### 颠倒元组位置

**触发条件：** 颠倒元组位置

**原因：** 元组按位置检查类型，即使每个候选值都出现在元组的其他位置也不能互换。

**后果：** 每个不匹配位置都会产生赋值诊断。

**错误示例：**

~~~~ts
const progress: [number, string] = ['2', 8]
~~~~

**正确写法：**

~~~~ts
const progress: [number, string] = [2, '8']
~~~~

**验证方式：** 对照正确写法验证结果。

### 把多余属性检查当成完整运行时过滤

**触发条件：** 把多余属性检查当成完整运行时过滤

**原因：** 新鲜对象字面量会检查未声明属性，但结构类型兼容并不承诺删除或禁止值上的其他成员。

**后果：** 把值赋给较窄类型后，多余运行时属性仍然存在。

**错误示例：**

~~~~ts
interface Named { name: string }
const source = { name: 'TypeScript', internalId: 7 }
const named: Named = source
// 错误假设：named 在运行时已经不含 internalId
~~~~

**正确写法：**

~~~~ts
interface Named { name: string }
const source = { name: 'TypeScript', internalId: 7 }
const named: Named = { name: source.name }
// 需要过滤时，显式构造新对象
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 对象按所需成员比较

**工作原理：** 对象类型描述属性及其类型，赋值关注目标要求的结构。**实践建议：** 让接口围绕调用方真正需要的成员，而不是复制整个来源对象。**使用边界：** 新鲜对象字面量的多余属性检查不等同于运行时过滤或严格名义类型。

### 修饰符只表达对应层级的合同

**工作原理：** 可选属性读取时可能为 undefined，readonly 属性不能通过该属性重新赋值。**实践建议：** 分别用它们表达缺失与稳定引用。**使用边界：** readonly 不提供深冻结，也不改变 JavaScript 对象。

### 数组与元组共享运行时载体

**工作原理：** 元组是知道元素数量和位置类型的数组类型。**实践建议：** 固定协议用元组，普通集合用数组。**使用边界：** 标签与位置类型会被擦除；运行时验证仍需检查数组长度与元素。
:::

:::exercise
### 为课程目录设计两种集合

**要求：** 定义 LessonSummary 对象、LessonSummary[] 搜索结果，以及 `[current, total]` 进度元组。分别写一个缺少必需 title 和一个颠倒元组位置的负例。

**完成标准：** 正例严格编译通过；两个负例产生类型诊断；能解释为什么搜索结果不用元组、进度不用普通 number[]。
:::

## 七、本节小结

对象用成员名表达形状，数组表达同类集合，元组表达固定位置协议；可选与 readonly 只承担各自明确的合同。下一课“函数类型”会让这些数据模型通过参数、返回值和回调连接起来。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface Course {
  readonly id: string
  title: string
  description?: string
}

type CourseRow = readonly [id: string, title: string, published: boolean]

const course: Course = {
  id: 'object-model',
  title: '对象、数组与元组',
}

const courses: Course[] = [course]
courses.push({ id: 'tuple-model', title: '固定位置协议', description: '三列数据' })

const row: CourseRow = ['object-model', '对象模型', true]
const [id, title, published] = row

const imported = {
  id: 'structural-check',
  title: '结构检查',
  author: '课程组',
}
const compatibleCourse: Course = imported

console.log(courses.length, id, title, published, compatibleCourse.title)
~~~~
:::
