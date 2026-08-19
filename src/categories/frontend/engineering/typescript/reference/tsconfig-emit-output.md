---
id: engineering.typescript.reference.tsconfig-emit-output
type: reference
title: TypeScript TSConfig Emit Output Reference
summary: JavaScript 输出、目标版本、诊断显示与逐字模块语法的 emit 配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "target": "es2025", "outDir": "dist", "sourceMap": true, "verbatimModuleSyntax": true }
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - TSConfig
  - Emit
  - JavaScript
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: TSConfig Reference
    url: https://www.typescriptlang.org/tsconfig
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: TypeScript 7.0 发布说明
    url: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0
    sourceType: release-note
    appliesTo: TypeScript 7.0
  - title: TypeScript 7.0.2 固定源码
    url: https://github.com/microsoft/typescript-go/tree/typescript/v7.0.2
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
anchors:
  - newline
  - nocheck
  - noemit
  - noemithelpers
  - noemitonerror
  - noerrortruncation
  - outdir
  - preserveconstenums
  - pretty
  - reactnamespace
  - removecomments
  - rewriterelativeimportextensions
  - sourcemap
  - sourceroot
  - stripinternal
  - target
  - usedefineforclassfields
  - verbatimmodulesyntax
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Emit Output Reference

本页合并 18 个 JavaScript emit 与输出界面键。`target`、class fields、module syntax 和相对扩展名重写会改变运行时代码合同；`noCheck`、`noEmit`、诊断显示与注释选项只控制流程或输出，不证明类型和 runtime 同时正确。

## 一、newLine

**officialKey**：`tsconfig.newLine`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/newLine.html)。

**值域**：`crlf | lf`；**7.0.2 默认**：`lf`；**首次版本**：1.5。它只改变生成文件的换行符，不重写源码。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "newLine": "lf"
  }
}
~~~~

## 二、noCheck

**officialKey**：`tsconfig.noCheck`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noCheck.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.6。开启后跳过完整类型检查，只保留关键解析与 emit 错误；发布流程必须另有完整检查阶段。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noCheck": false
  }
}
~~~~

## 三、noEmit

**officialKey**：`tsconfig.noEmit`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/noEmit.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。它让 TypeScript 只检查不写产物，适合由 bundler 或其他转译器负责 emit 的项目。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noEmit": false
  }
}
~~~~

## 四、noEmitHelpers

**officialKey**：`tsconfig.noEmitHelpers`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/noEmitHelpers.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。关闭内联 helper 后必须由全局或其他工具提供兼容 helper；多数项目优先使用 `importHelpers`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noEmitHelpers": false
  }
}
~~~~

## 五、noEmitOnError

**officialKey**：`tsconfig.noEmitOnError`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noEmitOnError.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.4。开启后存在检查错误时不写新产物，但不会自动清理旧输出。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noEmitOnError": true
  }
}
~~~~

## 六、noErrorTruncation

**officialKey**：`tsconfig.noErrorTruncation`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/noErrorTruncation.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。它保留完整类型诊断，适合一次性分析复杂类型，不应据此锁整段易变文案。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noErrorTruncation": true
  }
}
~~~~

## 七、outDir

**officialKey**：`tsconfig.outDir`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/outDir.html)。

**值域**：目录 `string`；**7.0.2 默认**：未设置；**首次版本**：1.0。编译器在输出目录中保留相对源码结构；应与 `rootDir` 和 package 入口共同设计。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
~~~~

## 八、preserveConstEnums

**officialKey**：`tsconfig.preserveConstEnums`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/preserveConstEnums.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.4。开启后保留 `const enum` 声明对象，同时引用仍可内联；跨包发布要避免版本错位。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "preserveConstEnums": true
  }
}
~~~~

## 九、pretty

**officialKey**：`tsconfig.pretty`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/pretty.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`；**首次版本**：1.8。它只控制诊断颜色和格式，机器处理应使用结构化接口或关闭美化。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "pretty": true
  }
}
~~~~

## 十、reactNamespace

**officialKey**：`tsconfig.reactNamespace`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/reactNamespace.html)。

**值域**：namespace `string`；**7.0.2 默认**：`React`；**首次版本**：1.8。它只适用于 classic `jsx: react` emit；本页不开始 React 内容。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "reactNamespace": "React"
  }
}
~~~~

## 十一、removeComments

**officialKey**：`tsconfig.removeComments`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/removeComments.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。它从 JavaScript 输出移除普通注释，不能替代许可证与法律声明保留策略。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "removeComments": true
  }
}
~~~~

## 十二、rewriteRelativeImportExtensions

**officialKey**：`tsconfig.rewriteRelativeImportExtensions`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/rewriteRelativeImportExtensions.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.7。开启后把相对 import 的 TS 扩展名改写为对应 JS 扩展名；非相对、动态计算或 path alias 仍需独立处理。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
~~~~

## 十三、sourceMap

**officialKey**：`tsconfig.sourceMap`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/sourceMap.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。它为 JavaScript 生成独立 `.js.map`，部署时要同时验证 URL、源码隐私和调试器可达性。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "sourceMap": true
  }
}
~~~~

## 十四、sourceRoot

**officialKey**：`tsconfig.sourceRoot`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/sourceRoot.html)。

**值域**：调试器源码根 `string`；**7.0.2 默认**：未设置；**首次版本**：1.0。它写入 map 元数据，不移动源码文件。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "sourceMap": true,
    "sourceRoot": "../src"
  }
}
~~~~

## 十五、stripInternal

**officialKey**：`tsconfig.stripInternal`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/stripInternal.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。它从声明 emit 去掉带 `@internal` 的声明，但并非完整 API 可达性分析，官方也不承诺对所有结构可靠。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "stripInternal": true
  }
}
~~~~

## 十六、target

**officialKey**：`tsconfig.target`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/target.html)。

**值域**：`es2015` 至 `es2025` 或 `esnext`；**7.0.2 默认**：`es2025`；**首次版本**：1.0；**7.0 边界**：`es5` 不再支持。target 同时影响语法降级与默认 `lib`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "target": "ES2022"
  }
}
~~~~

## 十七、useDefineForClassFields

**officialKey**：`tsconfig.useDefineForClassFields`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/useDefineForClassFields.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（默认 target 为 ES2025）；**首次版本**：3.7。它采用 ECMAScript define 语义初始化类字段，可能改变 setter 与继承行为。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "useDefineForClassFields": true
  }
}
~~~~

## 十八、verbatimModuleSyntax

**officialKey**：`tsconfig.verbatimModuleSyntax`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.0。开启后未标记 `type` 的 import/export 按目标格式保留，格式不兼容时直接报错而不是静默改写。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
~~~~

## 十九、完整输出配置示例

下面是一份现代 ESM 应用的输出配置。`reactNamespace` 只在旧 JSX 工厂场景需要，因此不放进这份
自动 JSX runtime 之外的通用配置。

~~~~jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "newLine": "lf",
    "noCheck": false,
    "noEmit": false,
    "noEmitHelpers": false,
    "noEmitOnError": true,
    "noErrorTruncation": true,
    "outDir": "./dist",
    "preserveConstEnums": true,
    "pretty": true,
    "removeComments": true,
    "rewriteRelativeImportExtensions": true,
    "sourceMap": true,
    "sourceRoot": "../src",
    "stripInternal": true,
    "useDefineForClassFields": true,
    "verbatimModuleSyntax": true,
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

只做类型检查的应用应把 `noEmit` 改为 true。TypeScript 7.0.2 已移除 `outFile`；需要单文件产物时应
使用 Vite 等 bundler，并从 bundler 配置入口和输出格式。

## 二十、易错使用提示

不要把 `noCheck`、`noEmit` 或成功生成 JavaScript 当作完整类型验证，也不要在 TypeScript 7.0.2
配置中继续使用已移除的 `outFile`。target、module、class field 语义和相对扩展名必须与真实 runtime
host 一起验证。

## 二十一、工作原理与适用边界

1. Website 快照提供候选输出键和首次版本，7.0.2 固定源码与正式发布文章将稳定范围校正为 18 项。
2. 应用项目常由 bundler emit；库项目需同时核对 JavaScript、声明、source map 与 package 入口。
3. 浏览器内容页不能证明编译产物，真实 emit 应在独立的构建目录中检查。

## 二十二、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；`outFile`、`target: es5` 移除与 ES2025 默认以 7.0 正式发布文章为准。
