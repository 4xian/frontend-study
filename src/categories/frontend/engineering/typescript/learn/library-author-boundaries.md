---
id: engineering.typescript.learn.advanced.library-author-boundaries
type: lesson
title: 库作者边界
summary: 从声明生成到独立 consumer，建立可发布、可演进且诊断清楚的公共类型合同
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.package-exports
tags:
  - TypeScript
  - library
  - public API
  - declaration emit
  - 版本兼容
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Declaration Files: Publishing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/Publishing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - types 字段
      - 声明随包发布
  - title: "TypeScript Declaration Files: Consumption"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/Consumption.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - consumer 查找声明
      - "@types 边界"
  - title: "TypeScript Modules Reference"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/modules-reference/Reference.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - exports
      - types 条件
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.package-exports
  - engineering.typescript.learn.advanced.type-performance
objectives:
  - 从公共消费场景反推库的声明面
  - 让 declaration emit 与 package exports 一起形成发布合同
  - 用独立 consumer 识别内部路径泄漏和错误版本兼容
  - 以具名公共类型控制诊断和演进成本
recap:
  - 发布验证必须离开源项目，只看伪 tarball 的公开文件。
  - "`.d.ts` 的相对引用也必须落在发布面内。"
  - 公共类型修改要同时评估源码、声明和 consumer。
---

# 库作者边界

## 一、为什么需要

库在 monorepo 内通常能看到全部源码、路径别名和测试 helper。发布后，消费者只得到 tarball 中的文件和
`package.json`。库作者要把“源码可编译”缩小成“公开入口可解析、声明自洽、错误可读、版本可演进”的合同。

## 二、核心概念和最小模型

公共类型应从消费者能做什么开始，而不是从内部目录长什么样开始。

~~~~ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course {
  return { id: `course-${title}`, title }
}
~~~~

开启 `declaration` 后，TypeScript 生成不带函数体的 `.d.ts`。`package.json` 再把它指向根入口和公开子路径。
内部 helper 即使在发布目录存在，也不应被 consumer 通过 deep import 依赖。

## 三、知识点详解

### 1. 最小公共合同

**它是什么：** 公共合同是库作者承诺长期支持的函数、类型和入口，而不是所有源码文件的总和。

**它有什么用：** 公共面越小，版本升级和内部重构的影响越可控，消费者也更容易理解库的真正能力。

**怎么使用：** 从真实 consumer 的调用反推参数、返回值和需要导出的类型，只把这些成员放入入口文件。

~~~~ts
// src/index.ts
export { createCourse } from './course'
export type { Course } from './course'
~~~~

### 2. declaration emit

**它是什么：** `declaration` 和 `emitDeclarationOnly` 让 TypeScript 根据源码生成公共 `.d.ts`，而不是手写
一份可能与实现漂移的副本。

**它有什么用：** 类型合同会随实现一起编译，并能暴露公共声明是否引用了内部源码路径。

**怎么使用：** 为发布项目开启声明输出，检查生成文件的 import 路径和导出名称，再继续检查包消费。

~~~~json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./types"
  }
}
~~~~

### 3. 发布入口配置

**它是什么：** `package.json` 的 `exports`、`types` 和相关字段把运行产物与类型产物连接成消费者可见的路径。

**它有什么用：** 入口配置是版本合同的一部分，能阻止消费者依赖未声明的内部文件。

**怎么使用：** 先列根入口和确实支持的子路径，再为每个运行分支配置对应声明条件。

~~~~json
{
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
~~~~

### 4. 声明引用边界

**它是什么：** 生成的声明只能引用发布面中实际存在的文件，不能把 `src/internal.ts` 这样的开发路径泄漏给消费者。

**它有什么用：** 消费者只安装发布内容时，类型解析仍然成功，库才能真正独立发布。

**怎么使用：** 打开生成 `.d.ts`，逐项检查相对 import；需要共享类型时从公共入口重新导出，而不是跨目录引用内部文件。

~~~~ts
// types/index.d.ts
export type { Course } from './course.js'
~~~~

### 5. 独立 consumer

**它是什么：** 独立 consumer 只通过包名调用发布面，不依赖库源码、构建配置或隐藏路径。

**它有什么用：** 它能同时验证类型提示、运行入口、`exports` 封装和错误导入是否符合设计。

**怎么使用：** 编写最小正例和负例，分别检查根入口、公开子路径、内部路径和未声明成员。

~~~~ts
import { createCourse } from 'course-kit'

const course = createCourse('library')
course.title.toUpperCase()
~~~~

## 四、公共类型与版本边界

具名 `Course` 比匿名深层交叉更容易在编辑器和错误消息中复用。内部类型可通过不导出、`/** @internal */`
约定或独立文件隐藏，但只有实际构建配置能确保它不被错误发布。删除导出成员、收窄参数或改变 `.d.ts`
中的模块形态都可能是 breaking change；新增可选成员通常风险较小，但仍要检查声明合并和运行实现。

## 五、动手实践：只从发布入口消费类型

库源码先通过根入口导出公开合同，内部工具不参与发布面。

~~~~ts
// src/index.ts
export interface Course {
  id: string
  title: string
}

export function defineCourse(course: Course): Course {
  return course
}
~~~~

~~~~json
{
  "name": "course-kit",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
~~~~

运行声明构建后，从另一个项目只通过 `course-kit` 导入。检查生成的声明没有源码别名和内部路径，再尝试导入未公开的 `course-kit/internal`，理解包导出与类型可达性如何共同定义公共边界。
## 六、易错使用提示

:::pitfalls
### 让声明引用 src 内部文件

**触发条件：** 生成的 `.d.ts` 中出现 `../src/internal`。

**原因：** 源项目的路径别名或未发布类型被带进公共签名。

**后果：** consumer 安装包后得到 `TS2307`。

**错误示例：**

~~~~ts
export type Course = import('../src/internal').Course
~~~~

**正确写法：**

~~~~ts
export interface Course {
  id: string
  title: string
}
~~~~

**验证方式：** 只复制伪 tarball，再从独立 consumer 编译。

### 以内部文件存在代替公开入口

**触发条件：** consumer 直接导入 `course-kit/internal`。

**原因：** 文件存在不等于 `exports` 公共列出。

**后果：** 包边界被 deep import 锁死，后续重排文件即破坏消费者。

**错误示例：**

~~~~ts
import { internal } from 'course-kit/internal'
~~~~

**正确写法：**

~~~~ts
import { createCourse } from 'course-kit'
~~~~

**验证方式：** 负例应得到 `TS2307`。

### 只检查 declaration emit

**触发条件：** `tsc` 成功生成 `.d.ts` 就发布。

**原因：** emit 阶段仍可看到仓库内所有文件。

**后果：** 发布包缺文件、错入口或漏声明时才被发现。

**错误示例：**

~~~~text
只在 packages/course-kit 源项目运行 tsc
~~~~

**正确写法：**

~~~~text
复制 package.json、dist 和 types 到独立 consumer 后编译
~~~~

**验证方式：** consumer 的根目录只能包含发布文件和自身源码。

### 把内部 helper 变成稳定公共类型

**触发条件：** 为了让错误消息变短而导出每层条件类型 helper。

**原因：** 导出名会进入消费者的声明和自动补全。

**后果：** 内部重构变成 breaking change，公共面越来越大。

**错误示例：**

~~~~ts
export type InternalCourseBranch<T> = T extends object ? T : never
~~~~

**正确写法：**

~~~~ts
type InternalCourseBranch<T> = T extends object ? T : never
export type PublicCourse = InternalCourseBranch<Course>
~~~~

**验证方式：** 检查生成 `.d.ts` 中只出现约定的公共名称。

### 用 any 掩盖版本差异

**触发条件：** 新旧运行入口不兼容时把返回值改成 `any`。

**原因：** 类型错误被移到运行时，consumer 看不到真实变化。

**后果：** 失去自动补全和升级反馈。

**错误示例：**

~~~~ts
export function loadCourse(): any
~~~~

**正确写法：**

~~~~ts
export function loadCourse(): Course | LegacyCourse
~~~~

**验证方式：** 为两个支持版本分别编译 consumer，并保留关键诊断。
:::

## 七、工作原理与适用边界

:::steps
### 发布面是可观测边界

**工作原理：** 声明随包发布并由 consumer 查找。**实践建议：** 用伪 tarball 验证，而不是引用 monorepo 源码。
**使用边界：** 浏览器页面通过不能证明 npm 包可消费。

### 公共类型是版本合同

官方模块和声明文档把入口与类型文件视为消费面。**实践建议：** 先命名公共概念，再隐藏实现 helper。**使用边界：**
任何导出都可能被消费者依赖。

### 诊断质量属于 API 质量

官方编译器负责报告不匹配。**实践建议：** 比较 `TS2339` 等关键诊断和类型名，不快照易变的完整文案。**使用边界：**
诊断清楚不等于运行时实现正确，仍需运行测试。
:::

:::exercise
### 构建最小可发布库

**要求：** 写一个导出 `Course` 和 `createCourse` 的 TypeScript 库，生成声明并配置根入口和一个公开子路径。
复制发布面到隔离 consumer，再写内部子路径和不存在成员的负例。

**完成标准：** 正例 exit 0；内部路径 `TS2307`；不存在成员 `TS2339`；声明不引用源码目录。
:::

## 八、本节小结

库作者要把源码合同压缩为可发布的入口、声明和 consumer 行为。独立 consumer 是发现路径泄漏、隐式 any
和错误版本兼容的最短反馈环。下一课把同一边界连接到 Vue SFC、TSX 和 typed routes。

:::code-details{title="查看本节完整配置"}
~~~~text
// src/internal/normalize.ts：内部实现，不从公共入口导出
/** 统一内部课程编号。 */
export const normalize = (value: string) => value.trim().toLowerCase()

// src/index.ts：最小公共合同
import { normalize } from './internal/normalize.js'
export interface Course { id: string; title: string }
/** 创建符合公开合同的课程。 */
export function defineCourse(course: Course): Course {
  return { ...course, id: normalize(course.id) }
}

// tsconfig.build.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}

// package.json：入口同时约束 JavaScript 与声明
{
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist"]
}

// consumer/index.ts：只允许从发布入口消费
import { defineCourse, type Course } from 'course-kit'
const course: Course = defineCourse({ id: ' TS ', title: '库边界' })
console.log(course)

// 验证顺序
npm run build
npm pack
npm install ../course-kit/course-kit-1.0.0.tgz
npx tsc --noEmit
~~~~
:::

## 九、参考资料

- [Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) - 声明随包发布。
- [Consumption](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html) - consumer 查找声明。
- [Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) - `exports` 和条件入口。
