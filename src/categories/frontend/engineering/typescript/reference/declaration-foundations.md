---
id: engineering.typescript.reference.declaration-foundations
type: reference
title: TypeScript Declaration Files 基础与结构
summary: 从真实 JavaScript 用法识别声明形状，并在 module、UMD、global 和插件模板之间作出选择
domain: frontend
technology: engineering
module: typescript
group: declaration-files
signature: |-
  declare function greet(name: string): string
  declare namespace greet { const version: string }
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - Declaration Files
  - d.ts
  - 库结构
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Declaration Files Introduction
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Declaration Reference
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Library Structures
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Declaration Templates
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - introduction
  - declaration-reference
  - library-structures
  - templates
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Declaration Files 基础与结构

## 一、概述

声明文件描述已经存在的 JavaScript 公共面，不生成实现。选择模板前先观察消费者如何取得库：使用
`import`/`require`、直接读取全局变量、同时支持 UMD，还是必须导入后才修改全局。声明若比运行实现更理想，
只会把错误推迟到运行时。

## 二、签名与语法

`.d.ts` 使用 `declare`、interface、class、namespace、overload 与 module export 表达值、类型和命名空间。
函数对象还能通过同名 namespace 暴露属性和嵌套类型。

~~~~ts
declare function greet(name: string): string

declare namespace greet {
  const version: string
}
~~~~

## 三、Introduction

Declaration Files 区域用于编写高质量 `.d.ts`。最常见场景是给没有类型的 npm 包补充声明；已经知道模块
消费形态时可直接选择 Modules `.d.ts` 模板。Introduction 同时把内容分为参考示例、库结构、模板、质量规则、
深层机制、发布和消费，不能用任意单页代替完整发布验证。

为只有 JavaScript 实现的模块增加声明时，让文件名和导出形状与实现保持一致：

~~~~ts
// index.d.ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

## 四、Declaration Reference

先从文档中的真实调用反推声明：全局函数使用 `declare function`；带属性的全局对象可用 `declare namespace`；
不同参数产生不同结果时用 overload；复用对象形状时用 interface。声明只描述调用合同，不实现函数体。

~~~~ts
declare function getWidget(id: number): Widget
declare function getWidget(filter: string): Widget[]

interface Widget {
  readonly id: number
  title: string
}
~~~~

## 五、Library Structures

库结构由消费方式决定。出现无条件 `require`、`module.exports`、`import`/`export` 通常表示 module；既检测
module loader 又向全局写值通常是 UMD；只通过 `<script>` 创建顶层值的是 global library；必须先导入才给
现有全局或原型增加成员的是 global-modifying module。

识别时优先看使用文档和实际源码，不按包名或文件名猜测。相同 API 可以由完全不同的运行加载方式提供，因此不能
把 module 声明机械改成全局声明。

~~~~ts
// ESM 库：消费者必须通过 import 取得 API。
export function formatCourse(title: string): string

// 全局脚本库：只有运行脚本确实创建 CourseKit 时才这样声明。
declare namespace CourseKit {
  function formatCourse(title: string): string
}
~~~~

## 六、Templates

官方模板是起点，不是需要全部复制的样板：

- 普通 module、导出 class、导出 function 和 module plugin 分别使用四个 Module templates。
- 纯 global、UMD/global plugin 与导入后修改全局分别使用三个 Global templates。
- 只保留真实运行面需要的 call、construct、property、namespace 和 augmentation 结构。

模板中的 `export =`、`export as namespace` 与 `declare global` 表达不同合同，不能互相替换。具体写法在本组
后续两个模板页中逐项查阅。

一个通过 `module.exports = createCourse` 导出的 callable module，应选择 `export =` 模板：

~~~~ts
declare function createCourse(title: string): createCourse.Course

declare namespace createCourse {
  interface Course {
    id: string
    title: string
  }
}

export = createCourse
~~~~

## 七、行为边界

- `.d.ts` 只参与类型检查，不创建函数、属性、全局变量或运行时补丁。
- ambient module 与 module augmentation 语法相似，但由文件是否已有顶层 import/export 以及目标是否存在决定。
- 本页覆盖声明来源之后的编写工作，不改变 General Reference 的 `type-declarations` officialKey。
- 声明生成、包入口和 consumer 可达性必须分别验证，浏览器展示不能替代编译 示例。

## 八、最小正确示例

现有 ESM JavaScript 导出 `createCourse` 时，声明使用相同具名导出：

~~~~ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

隔离 consumer 应能导入该函数，访问未声明属性则得到稳定的类型诊断。

## 九、从零选择声明结构

判断顺序是“消费者如何加载”而不是“作者想用哪种语法”。下面展示最常见的 ESM 函数对象声明：

~~~~ts
export interface Course {
  id: string
  title: string
}

export interface CreateCourseOptions {
  title: string
  tags?: readonly string[]
}

export function createCourse(options: CreateCourseOptions): Course
export namespace createCourse {
  const version: string
}
~~~~

如果运行代码必须 import 才能取得 createCourse，就保持模块导出；只有脚本标签真实创建全局值时才使用 declare global。声明中的每个属性都应能在运行 JavaScript 上读到。

## 十、易错使用提示

:::pitfalls
### 用全局声明描述必须导入的模块

**触发条件：** JavaScript 只有 `module.exports` 或 ESM export，却在 `.d.ts` 顶层声明全局函数。

**原因：** 声明结构没有匹配库的真实加载方式。

**后果：** 类型允许不导入直接调用，运行时却找不到全局值。

**错误示例：**

~~~~ts
declare function createCourse(title: string): Course
~~~~

**正确写法：**

~~~~ts
export function createCourse(title: string): Course
~~~~

**验证方式：** 从一个真实消费项目导入该包，确认必须导入才能调用，并检查公开成员与运行实现一致。
:::

## 十一、工作原理与适用边界

1. **工作原理：** 声明形状必须匹配 JavaScript 的实际消费方式，官方为不同 module/global 结构提供独立模板。
2. **实践建议：** 从最小 consumer 调用反推公共合同，再用正负例收紧，而不是从理想类型反推不存在的实现。
3. **使用边界：** 给 JavaScript 库补类型、审查声明结构和选择模板；不替代实现测试或发布入口验证。

## 十二、版本与官方来源

适用于 TypeScript `7.0.2`；使用其他编译器版本时应重新核对声明语法和模块解析行为。

- [Declaration Files Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [Declaration Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)
- [Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)
- [Templates](https://www.typescriptlang.org/docs/handbook/declaration-files/templates.html)
