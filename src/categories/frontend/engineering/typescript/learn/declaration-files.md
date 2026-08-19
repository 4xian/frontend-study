---
id: engineering.typescript.learn.advanced.declaration-files
type: lesson
title: 声明文件
summary: 用与真实 JavaScript 形态一致的 .d.ts 建模模块、全局库与安全 augmentation
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
  - engineering.typescript.learn.basics.modules
tags:
  - TypeScript
  - 声明文件
  - .d.ts
  - ambient module
  - module augmentation
  - declaration emit
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Declaration Files: Introduction"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/Introduction.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 声明文件职责
      - 模块与全局模板选择
  - title: "TypeScript Declaration Files: Modules .d.ts"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/templates/module.d.ts.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 模块库声明形态
      - 导出建模
  - title: "TypeScript Declaration Files: Global .d.ts"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/templates/global.d.ts.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 全局脚本库声明形态
  - title: "TypeScript Reference: Declaration Merging"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/reference/Declaration%20Merging.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - module augmentation
      - global augmentation
      - augmentation 限制
  - title: "TSConfig: declaration"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/declaration.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 声明生成
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
  - engineering.typescript.learn.intermediate.generics-and-constraints
  - engineering.typescript.learn.intermediate.classes-and-compatibility
objectives:
  - 按真实运行库形态选择模块或全局声明模板
  - 为 JavaScript 导出编写最小准确的 .d.ts
  - 区分 ambient module、module augmentation 与 global augmentation
  - 生成声明输出并从独立消费端验证发布合同
recap:
  - .d.ts 描述已有运行实现，不会创建 JavaScript 值。
  - 顶层 import/export 决定文件是模块，并改变 declare module 的含义。
  - 声明生成成功后仍要从发布目录和真实消费者再次验证。
---

# 声明文件

## 一、为什么需要

JavaScript 库可以正常运行，却没有足够信息让 TypeScript 检查调用。声明文件负责描述这个既有运行面：
导出哪些值、函数如何调用、对象有哪些成员。它必须忠实于实现；写得更“理想”只会让消费者在编译通过
后遇到运行错误。

## 二、核心概念和最小模型

假设 `course-kit/index.js` 是一个 ESM 模块：

~~~~js
export function createCourse(title) {
  return { id: `course-${title}`, title }
}
~~~~

对应声明直接描述同一个具名导出：

~~~~ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

`.d.ts` 没有函数体。它只告诉类型检查器运行时实现应该满足什么合同。

## 三、知识点详解

### 1. .d.ts 声明文件

**它是什么：** `.d.ts` 文件只描述已有 JavaScript 的类型合同，不包含会被执行的函数体或运行逻辑。

**它有什么用：** JavaScript 库可以获得参数、返回值和成员提示，TypeScript 消费者也能在调用前发现错误。

**怎么使用：** 逐项对照真实导出编写声明；声明中存在的值必须在运行时也真实存在。

~~~~ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

### 2. 模块声明

**它是什么：** 含顶层 `export` 的声明文件描述一个模块的公开入口，消费者必须通过 `import` 使用这些成员。

**它有什么用：** ESM 或 CommonJS 包的类型形态能与真实加载方式一致，不会意外创建全局名字。

**怎么使用：** 根据 JavaScript 的默认导出、具名导出或 `export =` 形态选择对应声明模板。

~~~~ts
// course-kit/index.d.ts
export const version: string
export function parseCourse(source: string): Course
~~~~

### 3. 全局声明

**它是什么：** 全局声明描述通过普通 `<script>` 加载后直接出现在全局作用域的库。

**它有什么用：** 没有模块导入语法的旧式脚本库也能获得类型检查。

**怎么使用：** 只有运行时确实创建全局变量时才使用 `declare`；能够通过模块导入的包应使用模块声明。

~~~~ts
declare function CourseWidget(selector: string): void
~~~~

### 4. ambient module

**它是什么：** 在没有顶层 `import` 或 `export` 的 `.d.ts` 中，`declare module 'name'` 可以描述一个
尚未提供类型的 JavaScript 模块。

**它有什么用：** 消费者可以先获得准确的导入、参数和返回值检查，不必把整个包声明成 `any`。

**怎么使用：** 让声明文件保持脚本身份，在 `declare module` 内逐项描述包真实导出的成员。

~~~~ts
declare module 'course-kit' {
  export interface Course {
    id: string
    title: string
  }

  export function createCourse(title: string): Course
}
~~~~

### 5. module augmentation

**它是什么：** module augmentation 在一个模块文件中使用 `declare module`，为已经存在的模块合同补充成员。

**它有什么用：** 插件给原模块真实安装的方法或属性，可以被 TypeScript 合并到原有接口中。

**怎么使用：** 先导入被增强模块，再声明同名模块并扩充可合并接口；运行时插件必须另外完成真实修改。

~~~~ts
import 'course-kit'

declare module 'course-kit' {
  interface Course {
    archived?: boolean
  }
}
~~~~

### 6. global augmentation

**它是什么：** global augmentation 在模块文件的 `declare global` 中扩充全局类型或声明真实新增的全局值。

**它有什么用：** 副作用模块向 `Window`、`String` 等全局对象安装成员后，调用代码可以获得对应类型检查。

**怎么使用：** 用顶层 `export {}` 保持文件的模块身份，把增强写进 `declare global`；同时确保运行代码确实
加载了安装这些成员的副作用模块。

~~~~ts
export {}

declare global {
  interface Window {
    courseAnalytics: { track(event: string): void }
  }
}
~~~~

### 7. declaration emit 与消费验证

**它们是什么：** `declaration` 让编译器从 TypeScript 源码生成 `.d.ts`，消费验证则从包公开入口重新编译
一个调用方。

**它们有什么用：** 生成可以减少手写重复，消费验证能发现声明引用了未发布文件或入口配置错误。

**怎么使用：** 配置声明输出后检查生成文件，再从公开包路径导入；不能只以“生成成功”作为发布完成标准。

~~~~json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./types",
    "strict": true
  }
}
~~~~

## 四、模块、全局与 augmentation 综合示例

模块声明文件含顶层 `export`，不会向全局命名空间添加 `Course`。

~~~~ts
// course-kit/index.d.ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

全局脚本库只有在运行时确实创建全局变量时才使用全局模板。

~~~~ts
// legacy-course-widget/index.d.ts
declare function CourseWidget(selector: string): void
~~~~

ambient module 与 augmentation 的语法相似，但由所在文件是否为模块区分。

~~~~ts
// ambient.d.ts：没有顶层 import/export，描述一个尚无声明的模块
declare module 'legacy-course-parser' {
  export function parse(source: string): { title: string }
}
~~~~

~~~~ts
// augmentation.d.ts：顶层 import 使文件成为模块，只补已有具名导出
import 'course-kit'

declare module 'course-kit' {
  interface Course {
    archived?: boolean
  }
}
~~~~

augmentation 只改变类型视图。若真实对象没有 `archived` 或对应运行时补丁，声明不能凭空添加它。

## 五、生成并消费声明

TypeScript 源码通常由编译器生成声明，而不是手写重复合同。

~~~~json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./types",
    "strict": true
  }
}
~~~~

生成成功只是第一步。真正的发布验证需要把 `types` 目录和 `package.json` 复制到本地示例包，再从独立
consumer 编译公开入口，确认内部源码没有被意外要求、声明引用路径也没有越过发布面。

## 六、动手实践：给一段 JavaScript 补齐声明

假设现有 JavaScript 模块只导出一个创建函数：

~~~~js
export function createCourse(title) {
  return { id: crypto.randomUUID(), title }
}
~~~~

为它编写同名声明文件，让 TypeScript 消费者得到参数和返回值提示：

~~~~ts
export interface Course {
  id: string
  title: string
}

export function createCourse(title: string): Course
~~~~

在消费者中导入 `createCourse`，运行 `npx tsc --noEmit`。先访问声明中不存在的字段确认类型错误，再根据真实 JavaScript 行为决定是修正调用还是扩充声明；不要为了消除错误声明一个运行时并不存在的成员。
## 七、易错使用提示

:::pitfalls
### 在声明文件里实现运行逻辑

**触发条件：** 为声明函数添加函数体或期望声明创建值。

**原因：** `.d.ts` 只描述类型合同，不参与 JavaScript 实现 emit。

**后果：** 编译失败，或消费者运行时找不到对应导出。

**错误示例：**

~~~~ts
export function createCourse(title: string) {
  return { id: title, title }
}
~~~~

**正确写法：**

~~~~ts
export function createCourse(title: string): Course
~~~~

**验证方式：** 同时检查声明编译和真实 JavaScript 包入口。

### 用全局声明描述 ESM 包

**触发条件：** 运行时必须 import，却在 `.d.ts` 顶层声明全局函数。

**原因：** 声明形态与库的加载方式不一致。

**后果：** 类型允许不导入直接调用，运行时得到未定义变量。

**错误示例：**

~~~~ts
declare function createCourse(title: string): Course
~~~~

**正确写法：**

~~~~ts
export function createCourse(title: string): Course
~~~~

**验证方式：** consumer 必须通过包说明符 import 后才能调用。

### 混淆 ambient module 与 augmentation

**触发条件：** 在含顶层 import/export 的文件里用 `declare module` 定义全新包。

**原因：** 该文件已是模块，此语法会被解释为补丁而不是新 ambient module。

**后果：** 新模块仍无法解析，或错误地覆盖已有类型视图。

**错误示例：**

~~~~ts
export {}
declare module 'missing-package' {
  export const value: string
}
~~~~

**正确写法：**

~~~~ts
// ambient.d.ts 无顶层 import/export
declare module 'missing-package' {
  export const value: string
}
~~~~

**验证方式：** 从 consumer 导入说明符并确认解析到预期声明文件。

### 用 augmentation 新增运行时成员

**触发条件：** 只合并 interface，却没有给真实对象安装对应属性或方法。

**原因：** 类型合并不会修改 JavaScript 对象。

**后果：** 调用在类型层通过，运行时却得到 `undefined` 或非函数错误。

**错误示例：**

~~~~ts
declare module 'course-kit' {
  interface Course {
    publish(): void
  }
}
~~~~

**正确写法：**

~~~~ts
// 声明补丁必须与同批真实运行时补丁一一对应。
~~~~

**验证方式：** 类型 consumer 与运行时最小调用分别验证。

### 只验证声明生成不验证发布消费

**触发条件：** `tsc --emitDeclarationOnly` 成功后直接认为包类型正确。

**原因：** 源仓库可见的文件、路径别名或内部类型可能未进入发布包。

**后果：** 消费者得到 `TS2307` 或隐式 any。

**错误示例：**

~~~~text
types/index.d.ts 仍引用 ../src/internal
~~~~

**正确写法：**

~~~~text
只复制发布文件到独立 consumer，再从该 consumer 编译
~~~~

**验证方式：** consumer 目录不能访问源项目，只解析伪 `node_modules`。
:::

## 八、工作原理与适用边界

:::steps
### 声明必须映射真实 JavaScript

**工作原理：** Declaration Files 模板按模块、全局等库结构区分。**实践建议：** 先观察加载和导出形态，再选择
语法。**使用边界：** 声明不是重新设计运行 API 的地方。

### 文件身份改变 declare module 含义

**工作原理：** 顶层 import/export 使文件成为模块，其中的同名声明执行 augmentation。**实践建议：** 明确把
ambient 与补丁拆成不同文件。**使用边界：** augmentation 不能新增顶层或增强 default 导出。

### 发布面由消费者证明

**工作原理：** 声明可以随包生成并发布。**实践建议：** 生成、打包和消费是三个独立检查点。**使用边界：** 源项目绿色
不代表离开仓库后仍可解析。
:::

:::exercise
### 为 JavaScript 模块补声明

**要求：** 为导出 `createCourse` 和 `CourseStore` 的 JavaScript ESM 编写 `.d.ts`，再生成一个 consumer。
另写一个访问不存在 `removeAll` 的负例。

**完成标准：** 正例能获得参数与返回值类型；负例得到 `TS2339`；声明中没有函数体或多余全局名称。
:::

## 九、本节小结

声明文件只描述真实运行面，文件是否为模块决定 ambient 与 augmentation 的语义，生成结果必须从独立
consumer 再验证。下一课会把声明入口与 ESM/CJS 运行入口一起放进 `package.json exports`，建立可发布
的包边界。

:::code-details{title="查看本节完整配置"}
~~~~text
// package.json
{
  "scripts": { "build:types": "tsc -p tsconfig.types.json" },
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }
}

// tsconfig.types.json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "strict": true
  },
  "include": ["src/**/*.ts", "types/**/*.d.ts"]
}

// types/course-player.d.ts：描述已有 JavaScript 模块
declare module 'course-player' {
  export function play(courseId: string): void
}

// types/browser.d.ts：在模块文件中扩充全局
export {}
declare global {
  interface Window {
    courseVersion: string
  }
}

// types/course-core.d.ts：扩充已有模块，运行时也必须存在该成员
import 'course-core'
declare module 'course-core' {
  interface Course {
    duration: number
  }
}

// src/index.ts：声明生成的真实来源
export interface Lesson { id: string; title: string }
/** 定义并返回课程小节。 */
export const defineLesson = (lesson: Lesson): Lesson => lesson

// consumer.ts：从发布入口验证声明
import { defineLesson } from 'course-kit'
import { play } from 'course-player'
play(defineLesson({ id: 'types', title: '声明文件' }).id)
window.courseVersion = '7.0.2'
~~~~
:::

## 十、参考资料

- [Declaration Files Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) - 声明工作流与模板入口。
- [Modules .d.ts](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html) - 模块库声明模板。
- [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) - augmentation 规则与限制。
- [Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) - 声明生成和随包发布。
