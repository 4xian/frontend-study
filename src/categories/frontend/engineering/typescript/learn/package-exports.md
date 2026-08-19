---
id: engineering.typescript.learn.advanced.package-exports
type: lesson
title: 包导出与类型入口
summary: 让 ESM/CJS 运行入口、公开子路径和 TypeScript 声明在 package.json 中保持同一边界
domain: frontend
technology: engineering
module: typescript
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
tags:
  - TypeScript
  - package.json
  - exports
  - types
  - ESM
  - CommonJS
  - 模块解析
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
sources:
  - title: "TypeScript Modules Reference"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/modules-reference/Reference.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - package.json exports
      - types 条件
      - extension substitution
      - 模块格式与声明扩展名
  - title: "TypeScript Modules: Choosing Compiler Options"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/modules-reference/guides/Choosing%20Compiler%20Options.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - 应用与库的 host 配置边界
      - Node 与 bundler 模式选择
  - title: "TypeScript Declaration Files: Publishing"
    url: https://github.com/microsoft/TypeScript-Website/blob/c8170c35bda4811c9516cbb69c39241ae4beb6d9/packages/documentation/copy/en/declaration-files/Publishing.md
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
    claims:
      - types 字段
      - 声明随包发布
stage: advanced
level: advanced
estimatedMinutes: 70
prerequisites:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
objectives:
  - 用 exports 明确包根入口和公开子路径
  - 为 import 与 require 入口选择匹配的声明文件
  - 解释 types、条件导出和 extension substitution 的优先边界
  - 用独立消费者和 traceResolution 验证类型可达性
recap:
  - exports 既公开入口也封装未列出的内部子路径。
  - ESM/CJS 双入口的声明必须与各自模块形态匹配。
  - 运行文件存在不等于类型可达，必须从真实 consumer 验证。
---

# 包导出与类型入口

## 一、为什么需要

库发布后，消费者只看到包文件和 `package.json`。若运行入口、声明入口与公开子路径不一致，可能出现
“Node 能运行但 TypeScript 找不到类型”，也可能出现“编辑器通过但运行时加载了另一种模块格式”。包边界
必须把两条解析链对齐，不能只验证源码编译。

## 二、核心概念和最小模型

一个只发布 ESM 的包可以把根入口与一个公开子路径一起写入 `exports`：

~~~~json
{
  "name": "course-kit",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./testing": {
      "types": "./dist/testing.d.ts",
      "default": "./dist/testing.js"
    }
  }
}
~~~~

存在 `exports` 后，`course-kit/internal` 不会因为 `dist/internal.js` 真实存在就自动成为公共入口。

## 三、知识点详解

### 1. ESM 与 CommonJS 入口

**它们是什么：** ESM 使用 `import`/`export`，CommonJS 使用 `require`/`module.exports`；一个包可以只支持
一种，也可以发布两种入口。

**它们有什么用：** 明确模块形态能让运行时、声明文件和消费者写法保持一致，避免“类型能导入但运行时报错”。

**怎么使用：** 先根据目标消费者选择入口，再为每种形态构建对应运行产物和声明扩展名。

~~~~json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
~~~~

### 2. exports 根入口与子路径

**它是什么：** `exports` 显式列出包名本身和 `package/subpath` 可以访问的公开路径。

**它有什么用：** 它封装内部目录，允许库作者重排源码而不破坏公共 API，也能阻止未经设计的 deep import。

**怎么使用：** 只登记真实支持的根入口和子路径；每个公开路径都应有稳定实现和类型声明。

~~~~json
{
  "exports": {
    ".": "./dist/index.js",
    "./formatters": "./dist/formatters.js"
  }
}
~~~~

### 3. types 条件与声明入口

**它是什么：** `types` 条件把某个运行入口对应到 TypeScript 声明文件，通常与 `import`、`require` 条件
放在同一个对象中。

**它有什么用：** ESM/CJS 的不同公共形态可以分别获得匹配的类型，不必用一份宽泛声明掩盖差异。

**怎么使用：** 为每个运行条件配对 `.d.mts`、`.d.cts` 或正确语义的 `.d.ts`，并按解析器要求安排条件顺序。

~~~~json
{
  "exports": {
    ".": {
      "import": {
        "types": "./types/index.d.mts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./types/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
~~~~

### 4. consumer 验证

**它是什么：** consumer 是一个只通过包名和公开子路径使用库的独立调用方。

**它有什么用：** 它能证明发布目录真的包含运行文件和声明，并能发现源码路径泄漏、错误条件顺序和未公开
子路径。

**怎么使用：** 分别编译 import、require 和错误 deep import 正负例；不要把整个源码目录加入 consumer 的
include。

~~~~ts
import { createCourse } from 'course-kit'
import { createCourseTester } from 'course-kit/testing'

const course = createCourse('TypeScript 入门')
createCourseTester(course).run()

// @ts-expect-error internal 没有出现在 exports 中，消费者不能导入
import { resetCourse } from 'course-kit/internal'
~~~~

## 四、ESM 与 CommonJS 双入口

双发布包需要在条件分支内先区分 import/require，再为每个分支提供 types。

~~~~json
{
  "name": "course-kit",
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

`.d.mts` 明确描述 ESM，`.d.cts` 明确描述 CommonJS。不要让两个不同运行导出形状共享一份含糊声明。

## 五、types、exports 与回退

在支持 package `exports` 的解析模式中，TypeScript 会匹配 `types` 条件。未使用 exports 时，包入口会
尝试 `types`、legacy `typings`，再从 `main` 进行 extension substitution。显式 `types` 仍有价值：它
记录包的主声明入口，也避免消费者依赖偶然的文件名回退。

~~~~json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
~~~~

回退不是绕过 `exports` 封装的后门。只要 `exports` 生效，未公开子路径仍必须失败。

## 六、动手实践：同时配置运行入口和类型入口

把包的根入口和 testing 子路径都写进 exports，并让 types 条件位于对应入口内部。

~~~~json
{
  "name": "course-kit",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./testing": {
      "types": "./dist/testing.d.ts",
      "import": "./dist/testing.js"
    }
  }
}
~~~~

在消费项目中使用 `moduleResolution: "Bundler"`，分别导入根入口和 testing。再导入未声明的 internal 子路径，确认真正的修复是增加公开导出或停止使用内部模块，而不是在消费者里写 paths 假装它存在。
## 七、易错使用提示

:::pitfalls
### 只写 main 和 module 不定义公共面

**触发条件：** 包含多个内部文件和子路径，却只依赖旧式入口字段。

**原因：** `main` 不表达允许消费者导入哪些子路径，`module` 也不是 TypeScript/Node 的统一标准条件。

**后果：** 消费者形成无法长期维护的 deep import。

**错误示例：**

~~~~json
{ "main": "./dist/index.cjs", "module": "./dist/index.js" }
~~~~

**正确写法：**

~~~~json
{ "exports": { ".": "./dist/index.js", "./testing": "./dist/testing.js" } }
~~~~

**验证方式：** 公开子路径可解析，未列内部路径得到 `TS2307`。

### 把 types 放在错误条件之后

**触发条件：** 条件对象先匹配宽泛 default，再把 types 写在后面。

**原因：** 条件对象按匹配结构解析，声明入口应与对应运行分支明确配对。

**后果：** 类型解析命中运行文件回退，得到隐式 any 或错误模块形态。

**错误示例：**

~~~~json
{ ".": { "default": "./dist/index.js", "types": "./types/index.d.ts" } }
~~~~

**正确写法：**

~~~~json
{ ".": { "types": "./types/index.d.ts", "default": "./dist/index.js" } }
~~~~

**验证方式：** trace 必须直接命中声明 target，不依赖 JS extension substitution。

### 用一份声明描述不同 ESM/CJS 形态

**触发条件：** import 分支具名导出、require 分支导出函数对象，却共同指向一个 `.d.ts`。

**原因：** 两个运行入口的模块语义不同。

**后果：** 至少一个消费者获得错误的 default、named 或 `export =` 体验。

**错误示例：**

~~~~json
{ "import": "./index.mjs", "require": "./index.cjs", "types": "./index.d.ts" }
~~~~

**正确写法：**

~~~~text
import -> index.d.mts；require -> index.d.cts
~~~~

**验证方式：** 分别建立 ESM 与 CJS consumer。

### 认为文件存在就能 deep import

**触发条件：** 直接导入包内 `dist/internal.js`，因为文件在 npm tarball 中。

**原因：** `exports` 存在时会封装未声明子路径。

**后果：** 支持 exports 的 TypeScript/Node 模式拒绝解析。

**错误示例：**

~~~~ts
import { secret } from 'course-kit/internal'
~~~~

**正确写法：**

~~~~ts
import { createCourse } from 'course-kit'
~~~~

**验证方式：** consumer 负例固定 `TS2307`。

### 用应用构建代替包消费验证

**触发条件：** 只在 monorepo 源码路径或 Vite alias 下导入库。

**原因：** alias、源码和未发布文件掩盖了 package.json 与 tarball 边界。

**后果：** 发布后声明缺失、路径越界或模块格式错配。

**错误示例：**

~~~~text
应用通过 @/packages/course-kit/src 直接读取源码
~~~~

**正确写法：**

~~~~text
把发布面复制到独立 consumer 的 `node_modules/course-kit`，再从包说明符消费
~~~~

**验证方式：** consumer 只能看到伪发布目录与自身 tsconfig。
:::

## 八、工作原理与适用边界

:::steps
### exports 同时公开与封装

**工作原理：** 存在 exports 时，未列出或未匹配的子路径不能解析。**实践建议：** 把公共入口当成版本合同明确
列出。**使用边界：** 文件是否打包不等于它是否公开。

### types 条件属于类型解析链

**工作原理：** TypeScript 在条件 exports 中匹配 types，并区分 import/require 语境。**实践建议：** 每个运行
入口配对相同模块形态的声明。**使用边界：** 声明不会改变 Node 实际选择的 JavaScript 文件。

### host 决定验证模式

**工作原理：** moduleResolution 模拟最终 host。**实践建议：** bundler 库和 Node 库分别用匹配 consumer 验证。
**使用边界：** 单一解析模式不能证明所有发布目标。
:::

:::exercise
### 发布根入口与 testing 子路径

**要求：** 为一个 ESM 包配置根入口和 `./testing`，每个入口都有 JavaScript 与声明。再保留一个未公开
`internal` 文件作为负例。

**完成标准：** 两个公开导入 exit 0，internal 导入得到 `TS2307`，trace 摘要命中两个声明 target。
:::

## 九、本节小结

`exports` 定义包的公开面，`types` 条件把声明与运行入口配对，隔离 consumer 才能证明发布后可达。
下一课会把多个包和应用接入 TSConfig 分层与项目引用。

:::code-details{title="查看本节完整配置"}
~~~~text
// package.json：根入口与 testing 子路径各自配对 ESM、CJS 和声明
{
  "name": "course-kit",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./testing": {
      "import": {
        "types": "./dist/testing.d.mts",
        "default": "./dist/testing.js"
      },
      "require": {
        "types": "./dist/testing.d.cts",
        "default": "./dist/testing.cjs"
      }
    }
  },
  "files": ["dist"]
}

// dist/index.d.mts：ESM 消费者声明
export interface Course { id: string; title: string }
/** 定义课程。 */
export declare function defineCourse(course: Course): Course

// dist/index.d.cts：CJS 消费者声明
interface Course { id: string; title: string }
/** 定义课程。 */
declare function defineCourse(course: Course): Course
declare const courseKit: { defineCourse: typeof defineCourse }
export = courseKit

// consumer-esm.mts
import { defineCourse } from 'course-kit'
defineCourse({ id: 'esm', title: 'ESM 入口' })

// consumer-cjs.cts
import courseKit = require('course-kit')
courseKit.defineCourse({ id: 'cjs', title: 'CommonJS 入口' })

// 验证打包后的公开面
npm pack
npm install ../course-kit/course-kit-1.0.0.tgz
npx tsc --noEmit
~~~~
:::

## 十、参考资料

- [Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) - package.json 入口、条件和扩展名替换。
- [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) - host 与库配置边界。
- [Declaration Files Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) - 声明随包发布与 types 字段。
