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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

一个文件中的名字不应自动泄露给整个程序。模块把实现留在自己的作用域，只把调用方需要的值和类型显式导出；导入语句则让依赖可以追踪、检查和重构。

## 核心概念和最小模型

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

## 建立清晰文件边界

:::steps
### 先决定公开合同

只导出调用方真正需要的函数、常量和类型，未导出成员保持模块私有。

### 区分值空间与类型空间

运行时需要的函数或 class 使用普通 import；只作为注解的 interface 或 alias 使用 import type。

### 保持说明符与运行环境一致

本课使用相对 ES module 路径；扩展名、package exports 和 resolution mode 留到中高级课程。

### 识别旧 script 文件

没有顶层 import/export 的文件默认共享全局作用域；若只想隔离声明，可使用空的 `export {}`。
:::

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

## 配套编译 fixture

本阶段使用多文件临时编译验证：正例由入口导入同目录类型和值；负例尝试导入存在但未导出的成员，固定 TS2459。临时 runner 关闭 emit，验证结束后随 `/tmp` 目录一并删除；浏览器可达不等于模块解析正确。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 模块由语法边界确定

官方事实：顶层 import/export 使文件成为模块，否则按 script 处理。课程推导：每个应用文件都应明确自己的作用域。边界：实际加载格式还受运行环境和编译配置控制。

### 导出形成公共 surface

官方事实：模块成员只有显式导出后才对外可见。课程推导：让导出列表保持最小，私有实现可自由演进。边界：export 不自动保证 API 稳定或语义版本兼容。

### 类型依赖不等于运行依赖

官方事实：import type/export type 可在输出中移除。课程推导：显式标记纯类型依赖有助于工具链正确处理。边界：class 同时存在于值与类型空间，运行时使用时不能只做类型导入。
:::

:::exercise
### 拆分课程目录模块

**要求：** 创建 types.ts、lesson.ts 和 index.ts：导出课程类型与创建函数，在入口中分别使用 import type 和普通 import；再尝试导入一个未导出常量。

**验收：** 正例多文件严格编译通过，负例产生 TS2459，并能指出哪些依赖在运行时仍然存在。
:::

## 总结与下一课

模块用显式 import/export 隔离作用域，并区分值依赖与类型依赖。基础阶段至此完成；下一课“泛型与约束”会在这些函数和模块合同中保留输入输出关系。
