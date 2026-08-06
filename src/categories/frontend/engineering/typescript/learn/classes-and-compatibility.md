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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

TypeScript 同时面对两个世界：class 在 JavaScript 运行时创建构造器和原型，而类型系统通常按成员结构判断赋值。把两者混在一起，会误以为 implements 创建继承，或误以为能赋值就代表 instanceof 成立。

## 核心概念和最小模型

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

## 分开判断静态合同与运行身份

:::steps
### 先问是否需要运行继承

需要共享实现、super 或 instanceof 关系时使用 extends，它会建立真实原型链。

### 只检查能力时使用接口

implements 适合声明实例必须提供哪些公共成员，但实现仍需显式写出类型和方法。

### 赋值时比较实例侧结构

构造函数和静态成员不参与普通实例兼容，公共成员满足目标合同即可。

### 看到私有成员就检查来源

private 或 protected 必须来自同一声明类或继承层级，名字相同也不能伪造来源。
:::

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

:::demo{id="engineering.typescript.learn.intermediate.classes-and-compatibility.runtime-identity-demo"}
比较两个公开结构相同的实例，观察构造器名称与 instanceof 仍由真实原型链决定。
:::

## 配套编译 fixture

临时编译正例覆盖 implements、extends、protected 与公共结构赋值；负例在两个无继承关系的类中声明同名 private 并互相赋值，固定 TS2322。验证资产只在 `/tmp` 使用并在结束后删除。Demo 只证明构造器与 instanceof 的运行行为。

## 易错使用提示

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

## 原理与适用场景

:::steps
### implements 只执行静态检查

官方事实：implements 不改变类类型。课程推导：用它核对实例能力，不依赖它注入成员。边界：接口运行时会被擦除。

### extends 建立真实继承

官方事实：派生类继承基类成员和运行原型关系。课程推导：只有需要共享实现或运行身份时才继承。边界：继承仍需满足基类合同。

### 兼容性主要比较实例结构

官方事实：公共实例结构相同即可兼容，private/protected 来源例外。课程推导：面向最小公共合同编程。边界：静态成员与构造器不证明实例身份。
:::

:::exercise
### 区分课程合同与实例身份

**要求：** 实现两个公共形状相同但无继承关系的类，再实现一组共享基类的子类；比较静态赋值、private 来源和 instanceof 结果。

**验收：** 公共结构赋值通过，独立 private 来源产生 TS2322，并能解释 Demo 的 instanceof 结果。
:::

## 总结与下一课

implements 检查实例合同，extends 创建真实继承，普通赋值则以公共结构为主。下一课会把视线移到文件之外，追踪模块说明符如何解析到包入口和声明文件。
