---
id: engineering.typescript.learn.intermediate.module-resolution-and-packages
type: lesson
title: 模块解析与第三方类型
summary: 按真实 host 选择解析模式，并追踪包说明符到 exports、声明与 @types
domain: frontend
technology: engineering
module: typescript
related: []
tags:
  - TypeScript
  - 模块解析
  - 第三方类型
  - moduleResolution
  - traceResolution
  - package.json
  - exports
  - "@types"
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-05
sources:
  - title: "TypeScript Modules Reference: Theory"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/modules-reference/Theory.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - host 驱动解析
      - 输出模块格式
      - 声明文件职责
  - title: TypeScript Modules Reference
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/modules-reference/Reference.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - moduleResolution
      - node_modules
      - package.json exports
      - extension substitution
  - title: "TypeScript Handbook: Type Declarations"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/handbook-v2/Type%20Declarations.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - bundled declarations
      - "@types"
  - title: "TSConfig: traceResolution"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/traceResolution.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 解析诊断日志
stage: intermediate
level: intermediate
estimatedMinutes: 65
prerequisites:
  - engineering.typescript.learn.basics.modules
  - engineering.typescript.learn.intermediate.generics-and-constraints
objectives:
  - 解释模块解析为何必须模拟最终 Node 或 bundler host
  - 区分 bundler、node16 与 nodenext 的主要适用边界
  - 追踪 package.json exports 的 types 条件与 bundled declarations
  - 使用 traceResolution 定位说明符最终命中的声明文件或失败入口
recap:
  - module 与 moduleResolution 应按最终 Node 或 bundler host 配套选择。
  - 包可通过 exports.types 或 types 自带声明，缺失时再查找 @types。
  - traceResolution 用于解释查找过程，测试只冻结稳定的最终解析摘要。
---

# 模块解析与第三方类型

## 一、为什么需要

import 语句只给出说明符，真正如何找到文件由运行它的 host 决定。TypeScript 必须用 module 与 moduleResolution 模拟相同规则，否则编辑器能找到的类型可能与 Node 或 bundler 实际加载的入口不同。

## 二、核心概念和最小模型

~~~~json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true
  }
}
~~~~

bundler 模式适合由 Vite 等 bundler 处理输出的应用：它理解 package.json imports/exports，又允许 bundler 常见的无扩展名相对导入。直接交给现代 Node 运行的代码则应选 node16 或 nodenext，并与 module 选项配套。

## 三、知识点详解

### 1. moduleResolution

**它是什么：** `moduleResolution` 决定 TypeScript 如何把 `import` 说明符解析成源码或声明文件。

**它有什么用：** 类型检查器需要模拟最终加载工具的规则，否则编辑器通过的路径可能在运行时失败，或反过来。

**怎么使用：** bundler 应用通常使用 `Bundler`；Node ESM/CJS 发布验证使用与目标 Node 规则匹配的
`NodeNext`，并让 `module` 选项与之协调。

~~~~json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true
  }
}
~~~~

### 2. package.json 的 exports

**它是什么：** `exports` 声明包允许消费者导入的根入口和子路径，并可按条件选择不同文件。

**它有什么用：** 包可以公开稳定入口、封装内部目录，并让运行文件和类型声明保持一一对应。

**怎么使用：** 为每个公开路径写出条件对象，把 `types` 放在对应运行条件之前；未列出的内部路径应视为私有。

~~~~json
{
  "name": "typed-package",
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
~~~~

这里根入口的 types 条件把类型检查器引到 types/index.d.ts。若 exports 只公开根入口，typed-package/internal 等未公开子路径仍应失败；源码文件存在并不等于包允许消费者导入。

### 3. bundled declarations 与 @types

**它们是什么：** 包自带的 `.d.ts` 属于 bundled declarations；没有自带声明的 JavaScript 包可以由
独立的 `@types/package-name` 提供类型。

**它们有什么用：** 调用方能够获得第三方库的公开合同，而不必为每次使用手写声明。

**怎么使用：** 先检查包自己的 `types`、`typings` 或 `exports.types`；确实没有声明时再安装匹配版本的
`@types` 包。

~~~~json
{
  "dependencies": {
    "library-with-types": "1.0.0"
  },
  "devDependencies": {
    "@types/legacy-library": "1.0.0"
  }
}
~~~~

### 4. traceResolution

**它是什么：** `--traceResolution` 输出 TypeScript 尝试过的候选路径、条件和最终命中结果。

**它有什么用：** 出现“找不到模块”或命中错误声明时，可以用证据定位问题，而不是反复猜测路径别名。

**怎么使用：** 对具体 `tsconfig` 运行追踪，搜索目标说明符并检查最终解析路径；只记录与问题相关的几行。

~~~~text
npx tsc -p tsconfig.json --traceResolution
~~~~

## 四、动手实践：追踪一个包导入命中了哪里

先在 tsconfig 中选择与现代打包器一致的解析模式，再让编译器打印解析过程。

~~~~json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "traceResolution": true
  }
}
~~~~

在源码中分别导入一个自带 types 的依赖和一个通过 `@types` 提供声明的依赖，运行 `npx tsc -p tsconfig.json`。从日志中找到 package.json、exports 条件和最终声明文件；如果深层子路径被 exports 拒绝，应改用公开入口，而不是用 paths 绕过包边界。
## 五、易错使用提示

:::pitfalls
### 脱离 host 选择模式

**触发条件：** 脱离 host 选择模式

**原因：** moduleResolution 不是风格偏好，而是对最终运行环境的模拟。

**后果：** 类型入口与运行入口可能分叉。

**错误示例：**

~~~~json
{ "moduleResolution": "classic" }
~~~~

**正确写法：**

~~~~json
{ "module": "ESNext", "moduleResolution": "Bundler" }
~~~~

**验证方式：** 对照正确写法验证结果。

### 绕过 exports 导入内部文件

**触发条件：** 绕过 exports 导入内部文件

**原因：** 支持 exports 的模式只允许包显式公开的根入口和子路径。

**后果：** 文件虽然存在，消费者仍得到 TS2307。

**错误示例：**

~~~~ts
import { secret } from 'typed-package/internal'
~~~~

**正确写法：**

~~~~ts
import { course } from 'typed-package'
~~~~

**验证方式：** 对照正确写法验证结果。

### 默认每个包都需要 @types

**触发条件：** 默认每个包都需要 @types

**原因：** 许多包已通过 types、typings 或 exports.types 自带声明。

**后果：** 安装重复或不匹配的声明，造成冲突。

**错误示例：**

~~~~text
先为所有依赖安装 @types/*
~~~~

**正确写法：**

~~~~text
先检查包入口与发布内容，再决定是否需要 @types
~~~~

**验证方式：** 对照正确写法验证结果。

### 快照完整 trace

**触发条件：** 快照完整 trace

**原因：** 解析日志包含绝对路径、探测顺序和版本相关文案。

**后果：** 环境或编译器小变化造成与行为无关的脆弱失败。

**错误示例：**

~~~~text
断言整段 traceResolution 输出完全相等
~~~~

**正确写法：**

~~~~text
只归一化并断言说明符、模式和最终相对路径
~~~~

**验证方式：** 对照正确写法验证结果。
:::

## 六、工作原理与适用边界

:::steps
### 解析规则由 host 定义

**工作原理：** TypeScript 模拟运行 host 的查找行为。**实践建议：** 先确定部署链再配置编译器。**使用边界：** 没有适用于所有项目的唯一模式。

### 声明文件描述运行库

**工作原理：** .d.ts 为 JavaScript 提供静态类型。**实践建议：** 优先消费包自带声明，缺失时再查 @types。**使用边界：** 声明不会创建运行实现。

### exports 定义公共包面

**工作原理：** 支持的模式遵守 exports 与 types 条件。**实践建议：** 只从公开入口消费包。**使用边界：** 内部文件存在不代表可导入。
:::

:::exercise
### 追踪两个第三方类型入口

**要求：** 运行模块解析示例，分别找出自带 types 的包与 @types 回退包命中的声明路径，再保留未公开子路径负例。

**完成标准：** 正例 exit 0，trace 摘要包含两个冻结相对路径，未公开子路径产生 TS2307。
:::

## 七、本节小结

模块解析必须模拟最终 host，包的 exports 和声明入口共同定义可消费边界。下一课会处理模块或其他外部边界抛出的 unknown 错误，并用 never 证明状态已穷尽。

:::code-details{title="查看本节完整配置"}
~~~~text
// node_modules/course-kit/package.json
{
  "name": "course-kit",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./testing": { "types": "./dist/testing.d.ts", "import": "./dist/testing.js" }
  }
}

// tsconfig.json：让 TypeScript 模拟 Node ESM host
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "traceResolution": false
  },
  "include": ["src/**/*.ts"]
}

// src/main.ts：声明随包发布，因此不需要另装 @types/course-kit
import { defineCourse } from 'course-kit'
import { createSampleCourse } from 'course-kit/testing'
console.log(defineCourse(createSampleCourse()))

// 只在排查时打开解析轨迹，并搜索目标说明符
npx tsc --noEmit --traceResolution > resolution.log
// 在日志中定位：Resolving module 'course-kit'
~~~~
:::
