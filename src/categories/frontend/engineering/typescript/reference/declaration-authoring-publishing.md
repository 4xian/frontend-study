---
id: engineering.typescript.reference.declaration-authoring-publishing
type: reference
title: TypeScript Declaration Files 编写与发布
summary: 查阅声明文件的质量规则、底层模型、发布入口和消费者获取方式
domain: frontend
technology: engineering
module: typescript
group: declaration-files
signature: |-
  export interface ClientOptions { endpoint: string }
  export function createClient(options: ClientOptions): Client
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
  - engineering.typescript.learn.advanced.package-exports
tags:
  - TypeScript
  - Declaration Files
  - 发布
  - 消费
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Declaration Files Do's and Don'ts
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Declaration Files Deep Dive
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/deep-dive.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Publishing Declaration Files
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Consuming Declaration Files
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - dos-and-donts
  - deep-dive
  - publishing
  - consumption
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Declaration Files 编写与发布

## 一、概述

声明文件的交付目标是让独立消费者看到与 JavaScript 运行入口一致的公共合同。编写阶段先收紧参数、返回值、
callback 和可选成员；发布阶段再确认声明依赖、`types` 或 `exports.types` 入口以及消费端解析。源码能生成
`.d.ts`，不等于包内的声明一定可达。

## 二、签名与语法

公共签名应描述真实值域，避免用包装对象类型、无约束 `any` 或多余 callback 参数扩大合同。

~~~~ts
export interface ClientOptions {
  endpoint: string
  retries?: number
}

export function createClient(options: ClientOptions): Client
~~~~

## 三、Do's and Don'ts

优先使用 `string`、`number`、`boolean` 等原始类型，不使用 `String`、`Number`、`Boolean` 包装对象类型。
callback 只声明调用方需要提供的参数；库可以传更多参数，但不应强迫消费者接收无用参数。无法确定类型时，
优先使用 `unknown` 或泛型关系，不用 `any` 直接关闭检查。

不要因为某个参数在实现里常见就把它写成必选，也不要给 callback 返回值写 `any`。`void` callback 表示调用方
的返回值会被忽略，并不禁止调用方返回值。

~~~~ts
// callback 只声明库真正使用的参数，原始值使用 string 而不是 String。
export function visitCourse(callback: (title: string) => void): void

// 泛型保留输入输出关系，不把结果扩大为 any。
export function first<Value>(values: readonly Value[]): Value | undefined
~~~~

## 四、Deep Dive

声明同时存在值、类型和 namespace 三个空间。`class` 会创建值与类型，`interface` 只创建类型，`namespace`
可以与函数、class 或 enum 合并来描述静态成员。理解这些空间后，才能准确描述 callable object、constructor
和同名静态 API。

~~~~ts
export function parser(source: string): parser.Result

export namespace parser {
  interface Result {
    tokens: string[]
  }

  const version: string
}
~~~~

`export =` 描述单一 CommonJS 风格导出；ESM 具名导出使用普通 `export`。两者必须匹配实际产物，不能只为让
某一种导入语法通过而混写。

## 五、Publishing

包自带声明时，应把 `.d.ts` 随 JavaScript 一起发布，并通过 `package.json` 的 `types` 或条件化
`exports` 暴露。声明引用的外部类型如果出现在公共签名中，应进入运行依赖；仅用于生成声明、且未泄漏到公共
面时才适合作为开发依赖。

~~~~json
{
  "name": "course-client",
  "type": "module",
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
~~~~

DefinitelyTyped 适合不能由库本身携带声明的包。库已经发布声明时，不应再维护一份可能漂移的重复 `@types`
入口。发布前必须从打包后的目录建立独立 consumer，而不是让 consumer 直接读取源码。

## 六、Consumption

自带声明的包通常随包安装即可；社区声明通常由 `@types/<package>` 提供。TypeScript 会结合模块解析模式、
`package.json`、`node_modules` 和 `types` 配置寻找声明。添加 `declare module 'pkg'` 的空壳只能暂时把模块
视为 `any`，不能证明真实声明已经可达。

消费者验证至少包含一个正确导入和一个错误调用。正确导入证明入口能解析，错误调用产生预期诊断则证明消费端
确实使用了目标声明，而不是退化为 `any`。

~~~~sh
npm install course-client
# 只有包本身不提供声明时，才安装对应的社区声明。
npm install --save-dev @types/untyped-course-client
~~~~

~~~~ts
import { createClient } from 'course-client'

const client = createClient({ endpoint: 'https://example.test' })
client.open()
~~~~

## 七、行为边界

- 本页覆盖声明质量、底层空间模型、发布和消费，不替代七种官方模板的结构选择。
- 声明 emit 只生成类型产物；JavaScript 实现、条件导出和运行时 host 必须另外验证。
- `skipLibCheck` 可能跳过声明文件内部检查，但不会修复错误的包入口或公共合同。
- 本页的声明编写与发布行为以 TypeScript 7.0.2 为准。

## 八、最小正确示例

声明发布一个具名函数，consumer 正确传入字符串，并让数字参数成为稳定负例：

~~~~ts
import { createClient } from 'course-client'

const client = createClient({ endpoint: 'https://example.test' })
client.open()

// 负例应得到参数类型诊断。
createClient({ endpoint: 42 })
~~~~

小型示例会先运行负例并确认失败，再以同一编译命令删除错误调用后转绿。

## 九、从编写到发布的完整示例

先从真实实现生成声明，再让 package.json 的每个公开入口同时指向 JavaScript 和 .d.ts。

~~~~jsonc
// tsconfig.build.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

~~~~jsonc
// package.json
{
  "name": "course-kit",
  "type": "module",
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
~~~~

消费者只通过 course-kit 导入公开成员。发布前检查压缩包中的 dist、types 条件和声明内部引用，不要让 src 别名或未发布文件泄漏到公共签名。

## 十、易错使用提示

:::pitfalls
### 只检查声明是否生成，不检查发布入口

**触发条件：** `tsc --declaration` 已输出文件，但 `package.json` 指向错误路径或发布清单遗漏声明。

**原因：** 声明生成和包消费是两条独立链路。

**后果：** 库仓库内编译通过，消费者得到缺失声明或隐式 `any`。

**错误示例：**

~~~~json
{ "types": "./types/missing.d.ts", "main": "./dist/index.js" }
~~~~

**正确写法：**

~~~~json
{ "types": "./types/index.d.ts", "main": "./dist/index.js" }
~~~~

**验证方式：** 从待发布目录创建独立 consumer，同时检查正确调用和故意错误调用的结果。
:::

## 十一、工作原理与适用边界

1. **工作原理：** 高质量声明匹配真实 JavaScript 值形状，包通过自身声明或 `@types` 向消费者提供类型。
2. **实践建议：** 用正例证明入口可达，用负例证明没有退化为 `any`，再检查声明依赖是否随包交付。
3. **使用边界：** JavaScript 库补类型、TypeScript 库声明发布和消费诊断；不替代运行时兼容性测试。

## 十二、版本与官方来源

本页适用于 TypeScript `7.0.2`；发布流程使用该版本重新生成声明并完成消费检查。

- [Declaration Files Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Declaration Files Deep Dive](https://www.typescriptlang.org/docs/handbook/declaration-files/deep-dive.html)
- [Publishing Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- [Consuming Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)
