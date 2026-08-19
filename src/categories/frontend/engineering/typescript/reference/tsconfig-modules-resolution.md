---
id: engineering.typescript.reference.tsconfig-modules-resolution
type: reference
title: TypeScript TSConfig Modules and Resolution Reference
summary: 模块输出、解析条件、扩展名与 ESM/CJS 互操作的 TSConfig 配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "module": "esnext", "moduleResolution": "bundler", "customConditions": ["development"] }
related:
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
  - engineering.typescript.learn.advanced.package-exports
tags:
  - TypeScript
  - TSConfig
  - Modules
  - Resolution
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Modules Reference
    url: https://www.typescriptlang.org/docs/handbook/modules/reference.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
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
  - allowarbitraryextensions
  - allowimportingtsextensions
  - allowsyntheticdefaultimports
  - allowumdglobalaccess
  - customconditions
  - esmoduleinterop
  - libreplacement
  - module
  - moduleresolution
  - modulesuffixes
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Modules and Resolution Reference

这 10 项共同描述 TypeScript 如何模拟目标 host。`module`、`moduleResolution`、package conditions、扩展名与互操作必须成组选择；“类型能解析”不证明运行时 loader 能加载同一个文件。

## 一、allowArbitraryExtensions

- **officialKey**：`tsconfig.allowArbitraryExtensions`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowArbitraryExtensions.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.0。

开启后可导入任意扩展名，但需要对应声明文件描述类型。它只解决类型侧许可，不会教运行时或 bundler 如何加载资源。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowArbitraryExtensions": true
  }
}
~~~~

## 二、allowImportingTsExtensions

- **officialKey**：`tsconfig.allowImportingTsExtensions`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowImportingTsExtensions.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.0。

开启后 import specifier 可以包含 `.ts`、`.mts` 或 `.tsx` 扩展名，通常要求 `noEmit` 或 `emitDeclarationOnly`，因为普通 JavaScript runtime 不能直接消费这些路径。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
~~~~

## 三、allowSyntheticDefaultImports

- **officialKey**：`tsconfig.allowSyntheticDefaultImports`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowSyntheticDefaultImports.html)
- **值域**：`true`；**7.0.2 默认**：`true`；**首次版本**：1.8；**7.0 边界**：`false` 不再支持。

它允许类型检查接受合成 default import，但自身不改变 emit。运行时是否存在 default export 仍由 host、interop helper 和包格式决定。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true
  }
}
~~~~

## 四、allowUmdGlobalAccess

- **officialKey**：`tsconfig.allowUmdGlobalAccess`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/allowUmdGlobalAccess.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.5。

它允许模块文件访问 UMD global。现代 ESM 项目应优先显式导入；该开关只用于兼容确有全局运行时的 host。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowUmdGlobalAccess": false
  }
}
~~~~

## 五、customConditions

- **officialKey**：`tsconfig.customConditions`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/customConditions.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：5.0。

这些条件会附加到 resolver 的默认 package `exports`/`imports` 条件。构建工具和运行时必须使用兼容的条件集合，否则类型入口与运行时入口会分叉。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "customConditions": ["development"]
  }
}
~~~~

## 六、esModuleInterop

- **officialKey**：`tsconfig.esModuleInterop`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/esModuleInterop.html)
- **值域**：`true`；**7.0.2 默认**：`true`；**首次版本**：2.7；**7.0 边界**：`false` 不再支持。

它为 CommonJS 互操作生成 helper，并同时启用合成 default import 的类型兼容。它不能修复包自身错误的 `exports` 或双包边界。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
~~~~

## 七、libReplacement

- **officialKey**：`tsconfig.libReplacement`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/libReplacement.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：Website baseline。

它控制是否允许 npm 包替换默认 `lib` 声明。TypeScript 7.0 默认关闭，避免无意解析替代库；需要替换时应锁定包和声明版本。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "libReplacement": true
  }
}
~~~~

## 八、module

- **officialKey**：`tsconfig.module`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/module.html)
- **值域**：`esnext | commonjs | preserve | node16 | node18 | nodenext`；**7.0.2 默认**：`esnext`；**首次版本**：1.0。
- **7.0 边界**：`amd`、`umd`、`systemjs` 与 `none` 不再支持。

`module` 同时影响 emit 和部分解析语义。Node 模式按文件扩展名与最近的 `package.json` 判断格式；bundler 场景通常使用 `esnext`/`preserve` 并让外部工具负责输出。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "module": "NodeNext"
  }
}
~~~~

## 九、moduleResolution

- **officialKey**：`tsconfig.moduleResolution`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- **值域**：`bundler | node16 | node18 | nodenext`；**7.0.2 默认**：Node module 模式使用对应 resolver，其余使用 `bundler`；**首次版本**：1.6。
- **7.0 边界**：`node`/`node10` 与 `classic` 不再支持。

解析模式必须模拟真实 host。`bundler` 允许 bundler 风格的无扩展相对导入；Node 模式遵守 package type、文件扩展名和条件导出。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
~~~~

## 十、moduleSuffixes

- **officialKey**：`tsconfig.moduleSuffixes`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/moduleSuffixes.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：4.7。

resolver 会按顺序尝试文件名后缀，数组中的空字符串代表普通文件名。平台特化项目应保留空字符串 fallback，避免只在单一 host 下可解析。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "moduleSuffixes": ["", ".native"]
  }
}
~~~~

## 十一、完整模块解析配置示例

现代打包器应用可使用下面的组合。Node 直接运行项目应改用 NodeNext，并让 package.json 的 type、文件扩展名和 exports 保持一致。

~~~~jsonc
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowArbitraryExtensions": false,
    "allowImportingTsExtensions": true,
    "allowSyntheticDefaultImports": true,
    "allowUmdGlobalAccess": false,
    "customConditions": ["development"],
    "esModuleInterop": true,
    "libReplacement": false,
    "moduleSuffixes": [".browser", ""],
    "noEmit": true,
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

allowImportingTsExtensions 与 noEmit 配合，避免生成仍指向 .ts 的 JavaScript。customConditions 也必须由真实 bundler 或 runtime 识别。

## 十二、易错使用提示

不要只让 TypeScript 解析成功而忽略真实运行环境。`module`、`moduleResolution`、package conditions、文件扩展名和 bundler 必须使用一致假设；已移除的旧取值不能因为旧编译器仍能解析就继续当作稳定能力。

## 十三、工作原理与适用边界

1. Modules Reference 解释 host 模型，Website 快照提供 option 页面，7.0.2 源码和 7.0 正式发布文章裁决当前默认与移除值。
2. bundler 应使用 bundler 解析假设，Node 应使用与真实 Node 格式匹配的模式。
3. 类型解析、JavaScript emit 和 runtime 加载是三个验证面，任何一个都不能替代另外两个。

## 十四、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；7.0 移除项以正式发布文章为准。
