---
id: engineering.typescript.reference.declaration-module-templates
type: reference
title: TypeScript Declaration Files Module 模板
summary: 查阅普通模块、导出 class、导出 function 与 module plugin 的声明模板
domain: frontend
technology: engineering
module: typescript
group: declaration-files
signature: |-
  export = buildCourse
  declare function buildCourse(title: string): buildCourse.Course
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - Declaration Files
  - Module
  - d.ts
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Modules .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Module Class .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-class-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Module Function .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-function-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Module Plugin .d.ts Template
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - modules-dts
  - module-class
  - module-function
  - module-plugin
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Declaration Files Module 模板

## 一、概述

四种 Module 模板都描述“必须通过导入取得”的运行值。先观察包导出的是多个成员、单个 class、可调用函数，
还是导入后给已有模块增加能力，再选择最小模板。模板只规定声明形状，不改变实际 JavaScript 的模块格式。

## 二、签名与语法

ESM 具名/默认导出使用普通 `export`；CommonJS 单一导出常由 `export =` 配合同名 namespace 描述属性和类型。

~~~~ts
declare function buildCourse(title: string): buildCourse.Course

declare namespace buildCourse {
  interface Course {
    title: string
  }
}

export = buildCourse
~~~~

## 三、Modules .d.ts

普通 module 模板适用于一个包暴露多个函数、常量、class 或 interface。声明中的导出名称和 default/named
形态必须逐项匹配运行实现；包内私有 helper 不进入公共声明。

~~~~ts
export interface Course {
  title: string
}

export function createCourse(title: string): Course
export const version: string
~~~~

## 四、Module: Class

模块直接导出一个 constructor 时，用 `class` 同时描述构造值、实例类型和 prototype 成员。CommonJS
`module.exports = ClassName` 通常使用 `export =`；若运行时是 ESM default export，则声明也应使用
`export default`。

~~~~ts
declare class CourseClient {
  constructor(endpoint: string)
  load(id: string): Promise<string>
}

export = CourseClient
~~~~

## 五、Module: Function

模块直接导出可调用函数时，用函数声明表示调用签名，并通过同名 namespace 合并函数属性、类型或子成员。
overload 只覆盖实现真实支持的调用，不用一个宽泛的 optional 参数签名代替不同返回关系。

~~~~ts
declare function buildCourse(title: string): buildCourse.Course

declare namespace buildCourse {
  const version: string
  interface Course {
    title: string
  }
}

export = buildCourse
~~~~

## 六、Module: Plugin

module plugin 会在导入后增强另一个 module 的已有导出。声明文件自身必须是 module，并用
`declare module 'target'` 合并现有 interface；运行实现也必须执行对应 prototype 或对象修改。

~~~~ts
import 'course-client'

declare module 'course-client' {
  interface Client {
    cache(): void
  }
}
~~~~

augmentation 不能新增新的顶层导出，也不能增强 default export；目标名称必须与 consumer 实际解析的 module
specifier 一致。

## 七、行为边界

- Module 模板只适用于需要导入的值；直接由 `<script>` 暴露的顶层值应使用 Global 模板。
- `export =`、ESM default 和 ESM named exports 是不同运行合同，不根据 consumer 偏好随意替换。
- augmentation 只补充已有声明，JavaScript plugin 必须在运行时实际安装成员。
- 包入口和 ESM/CJS 条件属于 Modules Reference 的 host 边界，不能仅靠模板确认。

## 八、最小正确示例

CommonJS 函数包的消费者使用 `import = require`，并读取 namespace 合并出来的静态属性：

~~~~ts
import buildCourse = require('course-builder')

const course = buildCourse('declarations')
const release = buildCourse.version
console.log(course.title, release)
~~~~

小型示例会让不存在的属性先产生诊断，再以同一命令验证真实属性可用。

## 九、模块声明综合示例

模块可以导出类、函数及插件扩展点。每一种声明都必须对应同名运行时导出。

~~~~ts
export class CourseClient {
  constructor(baseUrl: string)
  getCourse(id: string): Promise<Course>
}

export function createClient(baseUrl: string): CourseClient

export interface Course {
  id: string
  title: string
}

export interface CourseClientPlugins {}
~~~~

~~~~ts
// analytics-plugin.d.ts
import 'course-client'

declare module 'course-client' {
  interface CourseClientPlugins {
    analytics: { track(event: string): void }
  }
}
~~~~

消费者应先导入插件运行代码，再依赖 augmentation 后的类型；只导入 .d.ts 不能安装真实插件。

## 十、易错使用提示

:::pitfalls
### 用 module augmentation 声明运行时没有安装的成员

**触发条件：** `.d.ts` 给 `Client` 合并了 `cache()`，plugin JavaScript 却没有修改实现。

**原因：** augmentation 只改变类型视图，不执行补丁。

**后果：** consumer 编译通过，调用时得到 `cache is not a function`。

**错误示例：**

~~~~ts
declare module 'course-client' {
  interface Client { cache(): void }
}
~~~~

**正确写法：** 声明与真实 plugin 入口一起发布，并要求 consumer 导入该 plugin 后再调用。

~~~~ts
import { Client } from 'course-client'

Client.prototype.cache = function () {}

declare module 'course-client' {
  interface Client { cache(): void }
}
~~~~

**验证方式：** 编译 consumer 证明增强可见，并由对应运行 host 加载 plugin 后调用成员。
:::

## 十一、工作原理与适用边界

1. **工作原理：** 四种模板分别描述普通 module、单一 class、单一 function 和 module augmentation。
2. **实践建议：** 从真实 `module.exports` 或 ESM export 反推声明，再用独立 consumer 固定导入方式。
3. **使用边界：** 为现有 npm module 编写声明和 plugin augmentation；不适用于纯全局脚本。

## 十二、版本与官方来源

模板语法与行为以 TypeScript `7.0.2` 为准。

- [Modules .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html)
- [Module: Class](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-class-d-ts.html)
- [Module: Function](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-function-d-ts.html)
- [Module: Plugin](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html)
