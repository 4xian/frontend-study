---
id: engineering.typescript.learn.intermediate.classes-and-compatibility
type: lesson
title: 类与结构兼容
summary: 区分 implements 检查、结构赋值与真实继承产生的运行时身份
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - class
  - 结构兼容
  - implements
  - extends
  - private
  - protected
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Classes"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Classes.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - implements
      - extends
      - 成员可见性
      - 类关系
  - title: "TypeScript Reference: Type Compatibility"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Type%20Compatibility.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 结构类型
      - 类实例兼容
      - private 与 protected 来源规则
stage: intermediate
level: intermediate
estimatedMinutes: 60
prerequisites:
  - engineering.typescript.learn.basics.functions
  - engineering.typescript.learn.basics.aliases-and-interfaces
  - engineering.typescript.learn.intermediate.generics-and-constraints
objectives:
  - 用 implements 检查类实例是否满足接口，而不误认为接口改变了类体
  - 用 extends 建立真实继承，并在子类中遵守基类合同
  - 解释公共成员结构相同的独立类为何可以互相赋值
  - 识别 private 与 protected 的声明来源如何限制结构兼容
recap:
  - implements 只检查类实例合同，不向类体注入成员或类型。
  - extends 建立运行时原型关系，结构兼容本身不会。
  - 类实例主要按公共结构兼容，private/protected 必须共享声明来源。
---

# 类与结构兼容

## 一、为什么需要

TypeScript 同时面对两个世界：class 在 JavaScript 运行时创建构造器和原型，而类型系统通常按成员结构判断赋值。把两者混在一起，会误以为 implements 创建继承，或误以为能赋值就代表 instanceof 成立。

## 二、核心概念和最小模型

~~~~ts
interface Named {
  name: string
}

class Course implements Named {
  constructor(public name: string) {}
}

class Workshop {
  constructor(public name: string) {}
}

const named: Named = new Course('结构兼容')
const compatible: Course = new Workshop('类型工作坊')

export { compatible, named }
~~~~

implements 只检查 Course 的实例形状是否满足 Named，不会把接口成员或参数类型注入类体。Course 与 Workshop 没有继承关系，但公开实例成员相同，因此静态赋值兼容；它们的构造器身份仍不同。

## 三、知识点详解

### 1. class 的类型与运行时身份

**它是什么：** `class` 同时创建运行时构造函数和实例类型，实例可以保存状态并提供方法。

**它有什么用：** 当对象需要真实构造过程、封装状态或 `instanceof` 判断时，class 比纯对象类型多出运行能力。

**怎么使用：** 在构造函数中初始化实例成员，通过方法暴露行为；只需要数据形状时不必强制使用 class。

~~~~ts
class Course {
  constructor(
    readonly id: string,
    public title: string,
  ) {}

  /** 返回课程显示文本。 */
  format(): string {
    return `${this.id}：${this.title}`
  }
}

const course = new Course('classes', '类')
~~~~

### 2. implements

**它是什么：** `implements` 检查 class 实例是否满足某个接口，不会自动生成属性或方法实现。

**它有什么用：** 多个 class 可以承诺同一能力合同，调用方只依赖接口而不是具体构造器。

**怎么使用：** 在 class 名称后写 `implements Interface`，并显式实现接口要求的所有公共成员。

~~~~ts
interface Publishable {
  publish(): void
}

class Lesson implements Publishable {
  /** 发布当前课程。 */
  publish(): void {
    console.log('课程已发布')
  }
}
~~~~

### 3. extends 与继承

**它是什么：** `extends` 建立真实原型链，子类继承基类实现，并可通过 `super` 调用基类构造或方法。

**它有什么用：** 多个类型确实共享状态和行为时，可以复用实现，并保留 `instanceof` 关系。

**怎么使用：** 让子类只添加明确差异；若只是共享结构合同，优先使用接口和组合。

~~~~ts
class ContentItem {
  constructor(protected id: string) {}
}

class Lesson extends ContentItem {
  /** 返回继承自基类的课程标识。 */
  getId(): string {
    return this.id
  }
}

const lesson = new Lesson('classes')
export { lesson }
~~~~

### 4. 结构兼容与 private/protected

**它是什么：** 普通实例主要按公共成员结构比较；出现 `private` 或 `protected` 时，这些成员还必须来自
同一个 class 声明或其继承链。

**它有什么用：** 公共结构允许不同实现互换，私有成员来源检查则能阻止无关 class 假装成同一封装类型。

**怎么使用：** 公共能力用接口表达；需要名义区分时使用真正的私有成员，但不要把它误当运行时安全机制。

~~~~ts
class Enrollment {
  private token = 'enrollment'
}

class OtherEnrollment {
  private token = 'enrollment'
}

const enrollment = new Enrollment()
// const other: Enrollment = new OtherEnrollment()
~~~~

:::demo{id="engineering.typescript.learn.intermediate.classes-and-compatibility.runtime-identity-demo"}
比较两个公开结构相同的实例，观察构造器名称与 instanceof 仍由真实原型链决定。
:::

## 四、动手实践：同时观察静态合同与运行身份

下面的例子让类实现公开合同，同时保留只有实例在运行时才具有的行为。先编译，再用项目的运行命令执行它。

~~~~ts
interface Named {
  name: string
}

class Student implements Named {
  constructor(
    public name: string,
    private readonly id: number,
  ) {}

  describe(): string {
    return `${this.name} (#${this.id})`
  }
}

const student = new Student('Ada', 1)
const named: Named = student
console.log(named.name, student instanceof Student)
~~~~

再创建一个含有相同公开字段的普通对象并赋给 `Named`，确认结构兼容；随后创建两个各自声明 private 字段的无关类并尝试互相赋值，观察 private 来源如何改变兼容关系。
## 五、易错使用提示

:::pitfalls
### 认为 implements 会补全类型

**触发条件：** 认为 implements 会补全类型

**原因：** 接口只在类声明完成后检查实例形状，不改变类成员的推导。

**后果：** 省略参数类型或成员实现时仍会得到诊断。

**错误示例：**

~~~~ts
class Course implements Named { setName(name) {} }
~~~~

**正确写法：**

~~~~ts
class Course implements Named { name = '' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 把结构兼容当成继承

**触发条件：** 把结构兼容当成继承

**原因：** 可赋值只说明静态成员满足目标合同，不会修改原型链。

**后果：** 运行时 instanceof 结果与错误预期不一致。

**错误示例：**

~~~~ts
// compatible 可赋给 Course，所以一定 instanceof Course
~~~~

**正确写法：**

~~~~ts
// 运行身份必须检查真实构造器或原型链
~~~~

**验证方式：** 对照正确写法验证结果。

### 忽略 private 的声明来源

**触发条件：** 忽略 private 的声明来源

**原因：** 两个类各自声明的同名 private 成员不是同一个类型来源。

**后果：** 公共形状看似相同，实例仍不可互相赋值。

**错误示例：**

~~~~ts
class A { private id = '' }
class B { private id = '' }
const value: A = new B()
~~~~

**正确写法：**

~~~~ts
class Base { private id = '' }
class A extends Base {}
class B extends Base {}
~~~~

**验证方式：** 对照正确写法验证结果。

### 用 private 代替运行安全边界

**触发条件：** 用 private 代替运行安全边界

**原因：** TypeScript private 主要由类型检查器强制，并不是数据验证或权限机制。

**后果：** 运行输入和访问控制仍可能缺少真实保护。

**错误示例：**

~~~~ts
// private 自动验证并保护所有运行数据
~~~~

**正确写法：**

~~~~ts
// 类型可见性与运行时安全分别设计
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### implements 只执行静态检查

**工作原理：** implements 不改变类类型。**实践建议：** 用它核对实例能力，不依赖它注入成员。**使用边界：** 接口运行时会被擦除。

### extends 建立真实继承

**工作原理：** 派生类继承基类成员和运行原型关系。**实践建议：** 只有需要共享实现或运行身份时才继承。**使用边界：** 继承仍需满足基类合同。

### 兼容性主要比较实例结构

**工作原理：** 公共实例结构相同即可兼容，private/protected 来源例外。**实践建议：** 面向最小公共合同编程。**使用边界：** 静态成员与构造器不证明实例身份。
:::

:::exercise
### 区分课程合同与实例身份

**要求：** 实现两个公共形状相同但无继承关系的类，再实现一组共享基类的子类；比较静态赋值、private 来源和 instanceof 结果。

**完成标准：** 公共结构赋值通过，独立 private 来源产生 TS2322，并能解释 Demo 的 instanceof 结果。
:::

## 七、本节小结

implements 检查实例合同，extends 创建真实继承，普通赋值则以公共结构为主。下一课会把视线移到文件之外，追踪模块说明符如何解析到包入口和声明文件。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface CourseReader {
  readonly title: string
  open(): string
}

class Course implements CourseReader {
  /** 初始化课程实例。 */
  constructor(
    public readonly title: string,
    protected chapterCount: number,
    private readonly token: string,
  ) {}

  /** 返回课程打开结果。 */
  open(): string {
    return `${this.title}：${this.chapterCount} 章（${this.token.length} 位令牌）`
  }
}

class VideoCourse extends Course {
  /** 返回包含视频信息的课程结果。 */
  override open(): string {
    return `${super.open()}，支持视频播放`
  }
}

class TextReader {
  /** 初始化文本课程读取器。 */
  constructor(public readonly title: string) {}
  /** 返回文本课程打开结果。 */
  open(): string { return `阅读 ${this.title}` }
}

class AudioReader {
  /** 初始化音频课程读取器。 */
  constructor(public readonly title: string) {}
  /** 返回音频课程打开结果。 */
  open(): string { return `收听 ${this.title}` }
}

class FirstPrivateReader { private readonly token = 'first' }
class SecondPrivateReader { private readonly token = 'second' }

// 两个独立类的公共结构相同，因此可以赋值
const interchangeableReader: TextReader = new AudioReader('结构兼容')
// @ts-expect-error private 成员来源不同，即使名称相同也不兼容
const incompatibleReader: FirstPrivateReader = new SecondPrivateReader()

const structuralReader: CourseReader = {
  title: '结构类型课程',
  open: () => '已打开',
}

const course = new VideoCourse('类型兼容', 6, 'secret')
console.log(
  course instanceof Course,
  course.open(),
  structuralReader.open(),
  interchangeableReader.open(),
  incompatibleReader,
)
~~~~
:::
