---
id: engineering.typescript.reference.declaration-global-templates
type: reference
title: TypeScript Declaration Files Global 模板
summary: 查阅纯全局、全局插件和导入后修改全局三种声明模板
domain: frontend
technology: engineering
module: typescript
group: declaration-files
signature: |-
  declare function createCourse(title: string): Course
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - Declaration Files
  - Global
  - d.ts
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Global .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Global Plugin .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-plugin-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Global Modifying Module .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - global-dts
  - global-plugin
  - global-modifying-module
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Declaration Files Global 模板

## 一、概述

Global 模板描述无需 module import 就存在的值。纯 global library 由脚本直接创建顶层名称；global plugin
依赖另一个全局库并增强它；global-modifying module 则必须先导入，随后才修改 `globalThis` 或内置原型。
三者的加载时序不同，不能只看声明语法相似就合并。

## 二、签名与语法

纯全局在 `.d.ts` 顶层使用 `declare`。module 文件要向全局增加声明时，使用 `declare global` 并保留一个顶层
`export` 或 `import`，让文件仍被识别为 module。

~~~~ts
export {}

declare global {
  function createCourse(title: string): Course
}
~~~~

## 三、Global .d.ts

global 模板适用于 `<script>` 加载后直接提供函数、变量、class 或 namespace 的库。声明顶层名称应与脚本写入
的 `globalThis` 属性一致，并只暴露真实公共成员。

~~~~ts
declare function createCourse(title: string): Course

interface Course {
  title: string
}
~~~~

在 module consumer 中引用这类声明通常依赖 `types`、三斜线指令或项目包含规则；声明存在仍不代表脚本已经在
页面或 host 中加载。

## 四、Global: Plugin

global plugin 由脚本加载并增强已有全局库。它通常通过 declaration merging 给全局 namespace、interface 或
prototype 对应类型增加成员。运行顺序必须保证目标全局对象先存在，再加载 plugin。

~~~~ts
declare namespace CourseHost {
  function useCache(enabled: boolean): void
}
~~~~

若同一插件也能由 module loader 导入，`export as namespace` 可以为 UMD 使用方式暴露全局名称，但它不把一个
纯 ESM 包自动变成浏览器全局脚本。

## 五、Global: Modifying Module

global-modifying module 的关键是副作用导入。声明文件先用顶层 export 标记 module，再在 `declare global`
中增强全局或内置 interface；consumer 只有导入运行入口后才应依赖新增行为。

~~~~ts
export {}

declare global {
  interface String {
    toCourseSlug(): string
  }
}
~~~~

与 module plugin 不同，它增强的是全局 scope 中的类型，而不是指定 module 的导出。实现必须实际安装
`String.prototype.toCourseSlug`，并考虑重复加载和全局影响。

## 六、行为边界

- 全局声明只描述值，不创建值；脚本或副作用 module 必须由 host 真正加载。
- `export as namespace` 面向 UMD 的全局消费，不适用于任意 ESM 包。
- `declare global` 必须位于外部 module 中，且只增强已有全局类型或声明真实新增值。
- 全局污染会影响整个编译上下文，小型示例必须同时验证导入前不可用和导入后可用。

## 七、最小正确示例

副作用 module 安装一个全局函数，其 consumer 先导入再调用：

~~~~ts
import 'course-globals'

const course = createGlobalCourse('templates')
console.log(course.title)
~~~~

不导入 module 时，收紧 `types` 和 `include` 应保证声明不可见；导入运行模块后，对应扩展才可使用。

## 八、全局脚本与全局插件示例

纯脚本库可以声明真实存在的全局对象：

~~~~ts
interface CourseWidgetOptions {
  target: HTMLElement
  courseId: string
}

declare const CourseWidget: {
  mount(options: CourseWidgetOptions): void
  version: string
}
~~~~

必须先导入才修改全局的插件要把副作用放在模块内，并通过 declare global 描述导入后的类型变化：

~~~~ts
export {}

declare global {
  interface Window {
    courseAnalytics: { track(event: string): void }
  }
}
~~~~

对应 JavaScript 必须真的给 window.courseAnalytics 赋值；类型声明不会执行补丁。

## 九、易错使用提示

:::pitfalls
### 把 module 的导出误写成无条件全局

**触发条件：** 库只能通过 `import` 使用，声明却在顶层提供 `declare function`。

**原因：** 声明绕过了真实加载时序。

**后果：** 所有文件都能在类型层直接调用，运行时却没有对应全局值。

**错误示例：**

~~~~ts
declare function createClient(): Client
~~~~

**正确写法：** 普通 module 使用显式导出；只有实际写入全局的副作用 module 才使用 `declare global`。

~~~~ts
export function createClient(): Client
~~~~

**验证方式：** 分别编译未加载脚本/未导入 module 的负例与完成真实加载的正例。
:::

## 十、工作原理与适用边界

1. **工作原理：** 三种 Global 模板分别对应直接全局、全局插件和导入后修改全局。
2. **实践建议：** 把加载方式和加载时序写进 consumer 示例，防止声明无条件泄漏到项目。
3. **使用边界：** legacy script、UMD plugin 和副作用 module；新模块库优先使用显式导出。

## 十一、版本与官方来源

模板语法与行为以 TypeScript `7.0.2` 为准。

- [Global .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html)
- [Global: Plugin](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-plugin-d-ts.html)
- [Global: Modifying Module](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html)
