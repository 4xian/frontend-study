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
appliesTo: TypeScript 7.0.2（宿主 fixture：6.0.3）
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

## 为什么需要

import 语句只给出说明符，真正如何找到文件由运行它的 host 决定。TypeScript 必须用 module 与 moduleResolution 模拟相同规则，否则编辑器能找到的类型可能与 Node 或 bundler 实际加载的入口不同。

## 核心概念和最小模型

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

## 从说明符追到声明文件

:::steps
### 先确定最终 host

应用由 bundler、Node 还是其他运行环境加载，决定应该模拟哪套解析算法。

### 检查包公开入口

支持的模式会遵守 exports；types 条件可把公共入口直接指向 .d.ts 声明。

### 区分 bundled 与外置类型

包可自带 types/typings；没有 bundled declarations 时，再查找同名 @types 包。

### 用 trace 解释而非猜测

traceResolution 显示候选与最终结果，测试只冻结模式、说明符和相对命中路径。
:::

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

## 配套模块解析 fixture

临时模块解析目录包含两个本地伪包：正例从 exports.types 命中 typed-package 声明，并回退到 @types/legacy-package；负例访问未由 exports 公开的子路径，固定 TS2307。trace 摘要固定 Bundler 模式与两个最终 .d.ts 相对路径，不锁完整英文日志。验证目录位于 `/tmp`，结束后删除。

## 易错使用提示

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

## 原理与适用场景

:::steps
### 解析规则由 host 定义

官方事实：TypeScript 模拟运行 host 的查找行为。课程推导：先确定部署链再配置编译器。边界：没有适用于所有项目的唯一模式。

### 声明文件描述运行库

官方事实：.d.ts 为 JavaScript 提供静态类型。课程推导：优先消费包自带声明，缺失时再查 @types。边界：声明不会创建运行实现。

### exports 定义公共包面

官方事实：支持的模式遵守 exports 与 types 条件。课程推导：只从公开入口消费包。边界：内部文件存在不代表可导入。
:::

:::exercise
### 追踪两个第三方类型入口

**要求：** 运行模块解析 fixture，分别找出自带 types 的包与 @types 回退包命中的声明路径，再保留未公开子路径负例。

**验收：** 正例 exit 0，trace 摘要包含两个冻结相对路径，未公开子路径产生 TS2307。
:::

## 总结与下一课

模块解析必须模拟最终 host，包的 exports 和声明入口共同定义可消费边界。下一课会处理模块或其他外部边界抛出的 unknown 错误，并用 never 证明状态已穷尽。
