---
id: engineering.typescript.learn.basics.modules
type: lesson
title: 模块
summary: 用显式导入导出建立文件作用域、值依赖和类型依赖
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - ES modules
  - import
  - export
  - import type
  - export type
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Handbook: Modules"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Modules.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 模块判定
      - 模块作用域
      - ES module 语法
      - 类型专用导入导出
stage: basics
level: beginner
estimatedMinutes: 55
prerequisites:
  - engineering.typescript.learn.basics.functions
  - engineering.typescript.learn.basics.aliases-and-interfaces
objectives:
  - 解释顶层 import 或 export 如何把文件变成模块
  - 显式导出并导入跨文件使用的值和类型
  - 用 import type 与 export type 标记只存在于检查期的依赖
  - 识别 script 全局作用域和模块私有作用域的差异
recap:
  - 顶层 import 或 export 使文件成为模块，模块声明默认不进入全局作用域。
  - 只有显式导出的成员可由其他文件导入，公共 surface 应保持最小。
  - import type 与 export type 只连接类型空间，运行时值必须使用普通导入导出。
---

# 模块

## 一、为什么需要

一个文件中的名字不应自动泄露给整个程序。模块把实现留在自己的作用域，只把调用方需要的值和类型显式导出；导入语句则让依赖可以追踪、检查和重构。

## 二、核心概念和最小模型

~~~~ts
// lesson.ts
export interface Lesson {
  id: string
  title: string
}

/** 创建一门课程。 */
export function createLesson(id: string, title: string): Lesson {
  return { id, title }
}

// catalog.ts
import { createLesson } from './lesson.js'
import type { Lesson } from './lesson.js'

const lessons: Lesson[] = [createLesson('modules', '模块')]
export { lessons }
~~~~

顶层 import 或 export 使文件成为模块，内部声明默认只在文件内可见。值导入需要保留运行时连接；类型专用导入只服务类型检查，可以从 JavaScript 输出中移除。

## 三、知识点详解

### 1. export 与模块公共面

**它是什么：** 顶层 `export` 把函数、常量、class 或类型加入文件的公共面，未导出成员只在当前模块可见。

**它有什么用：** 模块公共面能隐藏实现细节，让调用方只依赖稳定入口，后续重构内部代码不会影响所有文件。

**怎么使用：** 先决定调用方真正需要的名字，再使用具名导出；辅助函数保持未导出。

~~~~ts
// course.ts
const prefix = 'course'

/** 创建公开的课程标识。 */
export function createCourseId(slug: string): string {
  return `${prefix}-${slug}`
}
~~~~

### 2. import 与重导出

**它们是什么：** `import` 从其他模块读取公开成员，`export ... from` 可以把多个模块整理为统一入口。

**它们有什么用：** 调用方通过稳定入口导入，不必了解每个内部文件的位置。

**怎么使用：** 从实现文件使用相对说明符导入，在 `index.ts` 中只重导出希望公开的成员。

~~~~ts
// index.ts
export { createCourseId } from './course.js'

// consumer.ts
import { createCourseId } from './index.js'

const id = createCourseId('modules')
~~~~

### 3. 值导入与类型导入

**它们是什么：** 普通 `import` 会参与运行时模块关系，`import type` 只用于编译期类型并在输出中移除。

**它们有什么用：** 明确区分两种依赖可以避免把纯类型误当运行值，也能让模块输出和循环依赖更清晰。

**怎么使用：** 函数、常量和 class 的运行使用普通导入；只出现在注解位置的 interface 或 alias 使用
`import type`。

~~~~ts
// types.ts
export type CourseId = string

// index.ts
export type { CourseId } from './types.js'

// consumer.ts
import type { CourseId } from './index.js'
const selectedId: CourseId = 'modules'

export { selectedId }
~~~~

### 4. script 与 module 文件

**它们是什么：** 含顶层 `import` 或 `export` 的文件是模块，声明默认局部；没有这些语法的旧式文件可能
把声明放入共享全局作用域。

**它们有什么用：** 识别文件身份可以解释重名全局变量和声明污染问题。

**怎么使用：** 正常业务文件使用明确导入导出；只想隔离声明但暂时没有公共成员时，可添加空导出。

~~~~ts
const internalCourseName = '模块边界'

export {}
~~~~

## 四、动手实践：拆分值导入与类型导入

建立两个源码文件，让运行时依赖和只用于检查的类型依赖一眼可见。

~~~~ts
// course.ts
export interface Course {
  id: string
  title: string
}

export function formatCourse(course: Course): string {
  return `${course.id}: ${course.title}`
}
~~~~

~~~~ts
// main.ts
import { formatCourse } from './course.js'
import type { Course } from './course.js'

const course: Course = { id: 'ts', title: 'Modules' }
console.log(formatCourse(course))
~~~~

编译后检查 JavaScript 中只有 formatCourse 的运行时导入。再尝试导入一个未 export 的成员，理解“文件中存在”与“模块公开”是两件不同的事。
## 五、易错使用提示

:::pitfalls
### 把未导出名字当成公共成员

**触发条件：** 把未导出名字当成公共成员

**原因：** 文件内声明默认是模块私有，存在于源码不代表可由其他文件导入。

**后果：** 消费文件产生“已在本地声明但未导出”的诊断。

**错误示例：**

~~~~ts
// lesson.ts
const internalId = 'modules'
// consumer.ts
import { internalId } from './lesson.js'
~~~~

**正确写法：**

~~~~ts
// lesson.ts
export const lessonId = 'modules'
// consumer.ts
import { lessonId } from './lesson.js'
~~~~

**验证方式：** 对照正确写法验证结果。

### 把类型导入当成运行时值

**触发条件：** 把类型导入当成运行时值

**原因：** interface 与 type alias 在输出中被擦除，不能在运行时读取或构造。

**后果：** 代码产生只表示类型却作为值使用的诊断。

**错误示例：**

~~~~ts
import type { Lesson } from './lesson.js'
const value = new Lesson()
~~~~

**正确写法：**

~~~~ts
import type { Lesson } from './lesson.js'
const value: Lesson = { id: 'modules', title: '模块' }
~~~~

**验证方式：** 对照正确写法验证结果。

### 让 script 声明污染全局作用域

**触发条件：** 让 script 声明污染全局作用域

**原因：** 没有顶层 import/export 的文件按 script 处理，顶层声明可能与其他 script 冲突。

**后果：** 独立文件出现重复变量或意外共享名字。

**错误示例：**

~~~~ts
const version = '7.0.2' // 文件仍是 script
~~~~

**正确写法：**

~~~~ts
const version = '7.0.2'
export { version }
~~~~

**验证方式：** 对照正确写法验证结果。

### 用聚合导出隐藏循环依赖

**触发条件：** 用聚合导出隐藏循环依赖

**原因：** barrel 文件只改变导入入口，不会消除模块之间真实的运行时依赖。

**后果：** 值初始化顺序仍可能形成循环，问题却更难从导入语句看出。

**错误示例：**

~~~~ts
export * from './course.js'
export * from './progress.js'
~~~~

**正确写法：**

~~~~ts
// 在消费方直接导入承担运行职责的模块
import { createCourse } from './course.js'
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 模块由语法边界确定

**工作原理：** 顶层 import/export 使文件成为模块，否则按 script 处理。**实践建议：** 每个应用文件都应明确自己的作用域。**使用边界：** 实际加载格式还受运行环境和编译配置控制。

### 导出形成公共 surface

**工作原理：** 模块成员只有显式导出后才对外可见。**实践建议：** 让导出列表保持最小，私有实现可自由演进。**使用边界：** export 不自动保证 API 稳定或语义版本兼容。

### 类型依赖不等于运行依赖

**工作原理：** import type/export type 可在输出中移除。**实践建议：** 显式标记纯类型依赖有助于工具链正确处理。**使用边界：** class 同时存在于值与类型空间，运行时使用时不能只做类型导入。
:::

:::exercise
### 拆分课程目录模块

**要求：** 创建 types.ts、lesson.ts 和 index.ts：导出课程类型与创建函数，在入口中分别使用 import type 和普通 import；再尝试导入一个未导出常量。

**完成标准：** 正例多文件严格编译通过，负例产生 TS2459，并能指出哪些依赖在运行时仍然存在。
:::

## 七、本节小结

模块用显式 import/export 隔离作用域，并区分值依赖与类型依赖。基础阶段至此完成；下一课“泛型与约束”会在这些函数和模块合同中保留输入输出关系。

:::code-details{title="查看本节完整示例"}
~~~~ts
// course.ts
export interface Course {
  id: string
  title: string
}

/** 创建课程值。 */
export function defineCourse(course: Course): Course {
  return course
}

const internalVersion = '7.0.2'

// index.ts：只重导出稳定公共面
export { defineCourse } from './course.js'
export type { Course } from './course.js'

// main.ts：类型导入不会形成运行时依赖
import { defineCourse } from './index.js'
import type { Course } from './index.js'

const course: Course = defineCourse({ id: 'modules', title: '模块' })
console.log(course)

// isolated-script.ts：空导出把文件明确变为模块，避免声明进入全局
export {}
const pageTitle = '课程页'
console.log(pageTitle)
~~~~
:::
