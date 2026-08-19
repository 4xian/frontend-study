---
id: engineering.typescript.learn.advanced.tsconfig-layering
type: lesson
title: TSConfig 分层与项目引用
summary: 用可独立构建的项目边界组织应用、库和工具，并让 tsc -b 按依赖图增量工作
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.package-exports
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
tags:
  - TypeScript
  - TSConfig
  - project references
  - composite
  - tsc -b
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Project References"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/project-references.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - references
      - composite
      - tsc -b
  - title: "TSConfig composite"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/tsconfig-reference/copy/en/options/composite.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 项目边界
      - 声明输出
stage: advanced
level: advanced
estimatedMinutes: 65
prerequisites:
  - engineering.typescript.learn.advanced.package-exports
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
objectives:
  - 用 extends 与 references 分离共享规则和项目边界
  - 解释 composite、声明输出与 tsc -b 的依赖顺序
  - 为应用、库和工具选择各自的 emit 与 module host
  - 用增量构建输出识别配置图中的 stale 项目
recap:
  - extends 复用选项，references 组织可构建项目图，两者职责不同。
  - 被引用项目要能独立构建并提供下游可消费的输出。
  - tsc -b 依据输入和输出判断是否重建，不是单次 tsc 的别名。
---

# TSConfig 分层与项目引用

## 一、为什么需要

单个 `tsconfig.json` 可以让小项目快速开始，但当库、应用和脚本共享代码时，一个配置会同时承担不同的
根目录、输出和模块宿主。项目引用把这些边界显式化，让每个节点有自己的输入与输出，构建器则能沿依赖
图增量执行。

## 二、核心概念和最小模型

`extends` 只继承配置值；它不会把两个项目变成一个编译单元。`references` 才表示项目之间的构建依赖。

~~~~json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "moduleResolution": "Bundler"
  }
}
~~~~

~~~~json
// packages/course-core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./lib",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"]
}
~~~~

~~~~json
// apps/course-web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "composite": true, "outDir": "./lib", "rootDir": "./src" },
  "references": [{ "path": "../../packages/course-core" }]
}
~~~~

库项目通常需要 `declaration`，应用项目可以产生运行代码；两者都应声明自己的 `include`，避免把兄弟项目
的源文件偷偷纳入。若根配置有实际根文件，引用一个没有 `composite: true` 的项目会得到 `TS6306`。

## 三、知识点详解

### 1. 共享基线与 extends

**它是什么：** `extends` 从一个基础配置继承 compilerOptions，再由当前配置覆盖少量差异。

**它有什么用：** 多个项目可以共享 `strict`、目标语言和解析规则，避免每个 tsconfig 复制一大段设置。

**怎么使用：** base 只放团队共同规则，不放具体应用入口、include 或输出目录；子项目写自己的边界。

~~~~json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
~~~~

### 2. 项目输入与输出边界

**它是什么：** 每个 tsconfig 都应明确 `include`、`rootDir` 和 `outDir`，决定哪些文件属于项目以及产物写到哪里。

**它有什么用：** 库、应用、测试和生成工具互不覆盖输出，增量构建也能准确判断输入变化。

**怎么使用：** 一个交付物一个项目配置；不要用一个根配置把所有源码和所有输出目录混在一起。

~~~~json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
~~~~

### 3. composite 与 project references

**它们是什么：** `composite` 让项目拥有可独立构建的边界，`references` 声明项目之间的有向依赖图。

**它们有什么用：** 大型工程可以按依赖顺序增量构建，库向应用提供稳定声明，而不是让应用读取库源码。

**怎么使用：** 被引用项目开启 `composite` 并决定声明输出，引用方在 `references` 中指向该项目目录。

~~~~json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
~~~~

### 4. tsc -b 构建项目图

**它是什么：** `tsc -b` 是按 references 调度多个项目的构建入口，会读取增量信息并先构建依赖。

**它有什么用：** 它能解释“哪个项目先构建”“哪个项目过期”和“为什么下游需要重建”。

**怎么使用：** 根配置只列 `references`，执行 `tsc -b --verbose` 观察顺序；配置错误应在最小负例中复现后恢复。

~~~~json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./apps/web" }
  ]
}
~~~~

~~~~text
npx tsc -b --verbose
~~~~

## 四、动手实践：建立可直接构建的双项目配置

根配置只描述项目图，每个子项目拥有自己的输入、输出和运行环境。

~~~~json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./apps/web" }
  ]
}
~~~~

~~~~json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

~~~~json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "strict": true
  },
  "references": [{ "path": "../../packages/core" }],
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
~~~~

运行 `npx tsc -b --verbose`，确认 core 先于 web。第二次运行应复用增量信息；若被引用项目缺少 composite，应在被引用项目中修正，而不是从根配置删除引用。
## 五、易错使用提示

:::pitfalls
### 把 extends 当成项目引用

**触发条件：** 只写一个 base 配置并期待应用自动获得库的构建顺序。

**原因：** `extends` 只合并选项，不建立依赖图。

**后果：** 应用可能读取源码，输出目录和增量边界不可预测。

**错误示例：**

~~~~json
{ "extends": "../packages/course-core/tsconfig.json" }
~~~~

**正确写法：**

~~~~json
{ "references": [{ "path": "../packages/course-core" }] }
~~~~

**验证方式：** 使用 `tsc -b --verbose`，确认日志按依赖顺序列出两个项目。

### 让被引用项目缺少 composite

**触发条件：** 引用普通 `tsconfig`，没有 `composite: true`。

**原因：** 构建器需要稳定的项目文件边界和构建信息。

**后果：** 有根文件的构建得到 `TS6306`。

**错误示例：**

~~~~json
{ "references": [{ "path": "../core" }] }
~~~~

**正确写法：**

~~~~json
{ "compilerOptions": { "composite": true, "declaration": true } }
~~~~

**验证方式：** 暂时移除该选项，观察 `TS6306`，再恢复正例。

### 用一个 outDir 覆盖所有项目

**触发条件：** 应用和库共享同一个输出目录。

**原因：** 输出文件无法反映单个项目的输入边界。

**后果：** stale 判断和清理操作会互相影响。

**错误示例：**

~~~~json
{ "compilerOptions": { "outDir": "../dist" } }
~~~~

**正确写法：**

~~~~json
{ "compilerOptions": { "outDir": "./lib" } }
~~~~

**验证方式：** 删除一个项目输出，确认只有它和依赖它的节点重建。

### 用 noEmit 的应用作为库依赖

**触发条件：** 被引用的项目只做编辑器检查并设置 `noEmit: true`。

**原因：** 下游没有可消费的构建结果。

**后果：** 构建图无法形成稳定的发布边界。

**错误示例：**

~~~~json
{ "compilerOptions": { "composite": true, "noEmit": true } }
~~~~

**正确写法：**

~~~~json
{ "compilerOptions": { "composite": true, "declaration": true } }
~~~~

**验证方式：** 运行 `tsc -b`，检查引用项目的输出文件是否存在。

### 用一次完整构建猜增量效果

**触发条件：** 只记录一次 `tsc -b` 的总时间。

**原因：** 第一次构建、缓存命中和机器负载不是同一个样本。

**后果：** 错把环境噪声当作配置收益。

**错误示例：**

~~~~text
失败条件：Total time > 0.2s
~~~~

**正确写法：**

~~~~text
比较项：项目顺序、stale 原因、Types、Instantiations
~~~~

**验证方式：** 连续运行两次 `--verbose`，保留输出类别而不是绝对耗时。
:::

## 六、工作原理与适用边界

:::steps
### 配置复用与编译边界分离

**工作原理：** `extends` 继承选项，`references` 描述项目图。**实践建议：** 先抽共享基线，再按交付物拆项目。
**使用边界：** 不要用继承掩盖不同 host、输出或入口。

### composite 是下游合同

**工作原理：** 被引用项目必须满足 composite 约束并能被构建器消费。**实践建议：** 库优先输出声明，应用只消费
已定义的库边界。**使用边界：** 编辑器能跳转源码不能替代发布输出。

### tsc -b 是图调度器

**工作原理：** build mode 按引用图顺序构建并利用新鲜性。**实践建议：** 把 stale 日志当作诊断证据。**使用边界：** 它不
会修复循环引用或错误的公共入口。
:::

:::exercise
### 拆分课程应用与核心库

**要求：** 创建 base、core、web 三个配置。core 输出声明，web 通过 `references` 消费 core；再写一个缺少
`composite` 的负例。

**完成标准：** `tsc -b --verbose` 首轮按 core -> web 构建；负例得到 `TS6306`；第二轮日志说明项目是 up to date。
:::

## 七、本节小结

TSConfig 分层用 `extends` 复用规则，用 `references` 表达项目图，用 `composite` 和输出文件守住下游合同。
下一课会在固定示例上观察类型数量、实例化和 trace，而不是凭感觉优化复杂类型。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装教程版本和 Node 工具类型
npm install -D typescript@7.0.2 @types/node

// tsconfig.base.json：只复用规则，不表达项目依赖
{
  "compilerOptions": {
    "target": "ES2024",
    "strict": true
  }
}

// packages/core/tsconfig.json：可被引用的库项目
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "emitDeclarationOnly": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}

// apps/site/tsconfig.json：应用通过 references 依赖 core
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [{ "path": "../../packages/core" }],
  "include": ["src/**/*.ts"]
}

// tools/tsconfig.json：Node 工具使用 NodeNext host，只做类型检查
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}

// 根 tsconfig.json：构建入口只描述项目图
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./apps/site" }
  ]
}

// 首次按 core -> site 构建，第二次应报告 up to date
npx tsc -b --verbose
npx tsc -b --verbose
// 修改 packages/core/src 后再运行，日志应标记 core 过期并重建下游 site
npx tsc -b --verbose
// Node 工具使用独立 host 配置，不进入需要输出的 references 图
npx tsc -p tools/tsconfig.json
npx tsc -b --clean
~~~~
:::

## 八、参考资料

- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) - 项目图与 `tsc -b`。
- [composite](https://www.typescriptlang.org/tsconfig/composite.html) - 项目边界和构建要求。
