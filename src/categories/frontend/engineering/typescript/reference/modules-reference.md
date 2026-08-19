---
id: engineering.typescript.reference.modules-reference
type: reference
title: TypeScript Modules Reference
summary: 查阅模块 host、输出格式、解析模式、包入口以及 ESM 与 CommonJS 互操作边界
domain: frontend
technology: engineering
module: typescript
group: modules-reference
signature: |-
  { "compilerOptions": { "module": "nodenext", "moduleResolution": "nodenext" } }
  { "exports": { ".": { "types": "./types/index.d.ts", "default": "./dist/index.js" } } }
related:
  - engineering.typescript.learn.basics.modules
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
  - engineering.typescript.learn.advanced.package-exports
tags:
  - TypeScript
  - Modules Reference
  - 模块解析
  - ESM
  - CommonJS
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Modules - Introduction
    url: https://www.typescriptlang.org/docs/handbook/modules/introduction.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Modules - Theory
    url: https://www.typescriptlang.org/docs/handbook/modules/theory.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Modules - Choosing Compiler Options
    url: https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Modules - Reference
    url: https://www.typescriptlang.org/docs/handbook/modules/reference.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: ESM/CJS Interoperability
    url: https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript 7.0 release
    url: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0
    sourceType: release-note
    appliesTo: TypeScript 7.0
anchors:
  - 概述
  - 签名与语法
  - introduction
  - theory
  - choosing-compiler-options
  - reference
  - esmcjs-interoperability
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Modules Reference

## 一、概述

这五个官方主题回答的不是“怎样写 `import`”，而是“目标 host 会怎样解释它”。先确定最终由 Node、
bundler 或其他 host 加载，再选择 `module`、`moduleResolution`、文件扩展名和包入口。只在查语言级
`import`/`export` 时回到 Handbook Modules；包解析与互操作应查本页。

## 二、签名与语法

`module` 描述文件格式和 emit 预期，`moduleResolution` 描述 host 如何把说明符解析到文件。支持 package
`exports` 的模式还会选择 `types`、`import`、`require` 等条件。

~~~~json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "verbatimModuleSyntax": true
  }
}
~~~~

## 三、Introduction

官方 Modules Reference 分为 theory、guides、reference 和 appendices。新项目可先看选择配置的 guide；
需要解释 host、文件格式和解析关系时看 theory；查具体条件与算法时看 reference；复杂互操作进入 appendix。
这个入口不与 Handbook v2 的 Modules 主题合并统计。

最小模块由一个导出文件和一个消费文件组成；相对 ESM 导入写最终运行时扩展名：

~~~~ts
// course.ts
export const courseTitle = 'TypeScript Modules'

// app.ts
import { courseTitle } from './course.js'

console.log(courseTitle)
~~~~

## 四、Theory

ECMAScript 规定模块的链接语义，却不规定说明符如何映射到磁盘文件，也不定义 CommonJS。TypeScript 必须
模拟目标 host 才能为导入赋予正确类型。`module` 告诉编译器 host 期望的格式，`moduleResolution` 告诉它
host 的查找算法；TypeScript 本身不是 host，因此不会普遍重写源码里的导入说明符。

Node 双格式项目还会根据 `.mts`/`.cts`、`.mjs`/`.cjs` 与最近的 `package.json` `type` 判断文件格式。
同一个 `.ts` 文件在不同 package 边界中可能采用不同模块语义。

~~~~jsonc
// package.json
{ "type": "module" }
~~~~

~~~~jsonc
// tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": true
  }
}
~~~~

## 五、Choosing Compiler Options

直接交给现代 Node 执行的代码应使用与 Node 匹配的模式，例如 `nodenext`；由 bundler 处理的应用通常使用
`moduleResolution: bundler`，同时让 TypeScript 的 module emit 假设与真实 bundler 配置一致。库还要
验证消费者环境，不能只证明自身 bundler 能打包。

TypeScript 7.0 把 6.0 中已弃用的配置升级为 hard error。新项目应直接采用 7.0.2 支持的模块选项，
不要从旧项目复制已经失效的配置。

直接由 Node 执行的 ESM 项目使用 `NodeNext`；源码交给 bundler 的应用使用 `ESNext + Bundler`：

~~~~jsonc
// Node ESM
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
~~~~

~~~~jsonc
// Bundler 应用
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  }
}
~~~~

## 六、Reference

支持 `exports` 的解析模式会把它当作公开入口合同。存在 `exports` 后，未匹配的子路径不会因为文件真实存在
就自动开放。`types` 条件应与对应的运行入口配对，双格式包可分别提供 `.d.mts` 和 `.d.cts`。

~~~~json
{
  "name": "course-kit",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./types/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./types/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
~~~~

解析到 `.d.ts` 只证明类型入口可达，不证明 JavaScript 产物存在或具备同一导出。因此发布验证必须同时检查
声明、运行入口和独立 consumer；`traceResolution` 只锁最终模式与相对命中路径，不快照完整绝对路径日志。

## 七、ESM/CJS Interoperability

ESM 导入 CommonJS 的结果由 host 决定，不存在对所有 Node、bundler 和转译链都一致的 default/named export
规则。`esModuleInterop` 可以调整 TypeScript 的检查和 helper emit，但不能让 host 不支持的入口在运行时变得
合法。CommonJS 库若把默认导出转译为 `exports.default`，不同消费者可能需要不同访问方式，发布者应以真实
入口和 consumer 证明合同。

库使用同一份声明描述形状不同的 ESM 与 CJS 产物时，至少一个消费者会得到错误类型。双入口应在
`exports` 的 `import`/`require` 分支内分别放置 `types`，并分别编译 `.mts` 与 `.cts` consumer。

~~~~json
{
  "exports": {
    ".": {
      "import": {
        "types": "./types/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./types/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
~~~~

## 八、行为边界

- 本页适用于 TypeScript 7.0.2 的稳定 Modules Reference；其他版本应重新核对支持的模块模式与默认值。
- 解析成功不证明运行成功，浏览器能打开页面也不证明 Node 或 bundler 入口正确。
- `module`、`moduleResolution` 和其他 option 的逐项值域属于 TSConfig Reference；本页只覆盖项目级选择关系。
- ESM/CJS 互操作取决于 host、文件格式、package 边界和 emit 链，不提供脱离环境的单一开关答案。

## 九、最小正确示例

一个 bundler consumer 只从包公开根入口导入，并由 `exports.types` 命中声明：

~~~~ts
import { createCourse } from 'course-kit'

const course = createCourse('modules')
console.log(course.title)
~~~~

小型示例还会尝试 `course-kit/internal` 并固定 `TS2307`，再分别用 `.mts` 与 `.cts` 验证双入口类型。

## 十、从零配置现代 ESM 项目

package.json 决定 Node 的模块身份，tsconfig 决定 TypeScript 如何理解导入，exports 决定消费者可访问哪些入口。

~~~~jsonc
// package.json
{
  "name": "course-app",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
~~~~

~~~~jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

源码中的相对 ESM 导入写最终运行时扩展名，例如 ./course.js。打包器应用可改用 ESNext + Bundler，但不能把两套 host 规则混在同一配置里。

## 十一、易错使用提示

:::pitfalls
### 只让 TypeScript 找到类型就认为包可运行

**触发条件：** `exports.types` 指向有效声明，但 `default`、`import` 或 `require` 指向缺失或形状不同的产物。

**原因：** TypeScript 的解析目标是类型检查，最终模块由真实 host 加载。

**后果：** consumer 编译通过，运行时却得到找不到模块或导出不存在。

**错误示例：**

~~~~json
{ "exports": { ".": { "types": "./index.d.ts", "default": "./missing.js" } } }
~~~~

**正确写法：**

~~~~json
{ "exports": { ".": { "types": "./types/index.d.ts", "default": "./dist/index.js" } } }
~~~~

**验证方式：** 在隔离 consumer 中检查类型解析，并由匹配的 Node/bundler host 加载真实运行入口。
:::

## 十二、工作原理与适用边界

1. **工作原理：** 模块格式与解析算法由目标 host 决定，`exports` 封装未公开子路径，互操作规则随 host 变化。
2. **实践建议：** 先确定交付链，再让编译器、bundler、Node 和 package 条件保持同一假设，并用 consumer 验证。
3. **使用边界：** 应用模块配置、库双入口、解析诊断和包发布；不替代运行时测试，也不重复展开 TSConfig 123 项。

## 十三、版本与官方来源

公共事实固定到 TypeScript `7.0.2` 和 Website commit
`c8170c35bda4811c9516cbb69c39241ae4beb6d9`。

- [Modules - Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [Modules - Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [ESM/CJS Interoperability](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html)
- [TypeScript 7.0 发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0)
