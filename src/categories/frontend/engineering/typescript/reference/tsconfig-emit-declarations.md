---
id: engineering.typescript.reference.tsconfig-emit-declarations
type: reference
title: TypeScript TSConfig Emit and Declarations Reference
summary: JavaScript、声明、source map 与编译输出诊断的 emit 配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "declaration": true, "declarationMap": true, "emitDeclarationOnly": true }
related:
  - engineering.typescript.learn.advanced.declaration-files
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - TSConfig
  - Emit
  - Declaration Files
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
  - title: Declaration Files
    url: https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
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
  - declaration
  - declarationdir
  - declarationmap
  - emitbom
  - emitdeclarationonly
  - importhelpers
  - inlinesourcemap
  - inlinesources
  - listemittedfiles
  - maproot
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Emit and Declarations Reference

这 10 项控制声明、JavaScript 辅助代码、source map 和输出诊断。配置是否“通过”必须结合真实产物检查；浏览器展示不能证明 `.d.ts`、map 或 helper 已按合同生成。

## 一、declaration

- **officialKey**：`tsconfig.declaration`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/declaration.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`（`composite` 可隐式启用）；**首次版本**：1.0。

开启后为 TypeScript 或受支持的 JavaScript 输入生成 `.d.ts`。库发布应验证声明入口、包导出和消费者解析，不只检查文件是否出现。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "declaration": true
  }
}
~~~~

## 二、declarationDir

- **officialKey**：`tsconfig.declarationDir`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/declarationDir.html)
- **值域**：`string`；**7.0.2 默认**：跟随普通输出位置；**首次版本**：2.0。

它只重定向声明输出。与 `outDir`、`rootDir` 和 package `types` 组合时，必须确认最终目录结构与发布入口一致。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types"
  }
}
~~~~

## 三、declarationMap

- **officialKey**：`tsconfig.declarationMap`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/declarationMap.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.9。

开启后生成 `.d.ts.map`，帮助编辑器跳转回源码。发布时应同时保留 map 引用指向的源码，避免生成不可达导航。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
~~~~

## 四、emitBOM

- **officialKey**：`tsconfig.emitBOM`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/emitBOM.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。

它在输出文件开头写入 UTF-8 BOM。只有消费工具明确需要时才启用，不能用于修复源码编码问题。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "emitBOM": false
  }
}
~~~~

## 五、emitDeclarationOnly

- **officialKey**：`tsconfig.emitDeclarationOnly`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.8。

开启后只输出声明，不输出 JavaScript，适合由其他工具负责转译的流程。它不等价于 `noEmit`，也不能证明 bundler 的运行时产物正确。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true
  }
}
~~~~

## 六、importHelpers

- **officialKey**：`tsconfig.importHelpers`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/importHelpers.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.1。

开启后从 `tslib` 导入降级 helper，避免在每个文件重复内联。它要求运行时能够解析兼容版本的 `tslib`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "importHelpers": true
  }
}
~~~~

## 七、inlineSourceMap

- **officialKey**：`tsconfig.inlineSourceMap`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/inlineSourceMap.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。

它把 source map 以内联 data URL 写入 JavaScript，不能与独立 `sourceMap` 产物混为一谈。内联会增大输出文件。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "inlineSourceMap": false
  }
}
~~~~

## 八、inlineSources

- **officialKey**：`tsconfig.inlineSources`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/inlineSources.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。

它把原始源码放入 source map 的 `sourcesContent`。调试更自足，但也可能把不应发布的源码带入产物。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
~~~~

## 九、listEmittedFiles

- **officialKey**：`tsconfig.listEmittedFiles`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/listEmittedFiles.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

它打印本次实际输出的文件名，适合诊断 include、输出目录和构建工具集成；日志本身不是产物完整性证明。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "listEmittedFiles": true
  }
}
~~~~

## 十、mapRoot

- **officialKey**：`tsconfig.mapRoot`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/mapRoot.html)
- **值域**：`string`；**7.0.2 默认**：生成文件位置；**首次版本**：1.0。

它改变调试器查找 map 的路径，不改变 map 文件的磁盘输出位置。远程部署时需与实际静态资源 URL 对齐。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "sourceMap": true,
    "mapRoot": "./maps"
  }
}
~~~~

## 十一、完整声明输出配置示例

库项目可以只生成声明，也可以与 JavaScript 一起生成。下面选择“仅声明”路径，并把声明和映射集中输出到 types 目录。

~~~~jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "declarationDir": "./types",
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "emitBOM": false,
    "importHelpers": true,
    "inlineSourceMap": false,
    "inlineSources": true,
    "listEmittedFiles": true,
    "mapRoot": "./maps",
    "sourceMap": true,
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

若改用 inlineSourceMap，就不要同时设置 sourceMap；发布前还要确认 package.json 的 types/exports 指向真实生成的入口。

## 十二、易错使用提示

不要把 `emitDeclarationOnly` 当成 `noEmit`，也不要只看命令退出码就宣称发布合同有效。声明入口、source map 引用、`tslib` 依赖和最终 package exports 都需要从真实构建产物核对。

## 十三、工作原理与适用边界

1. Website 快照定义输出配置和值域，7.0.2 固定源码校正默认表达式和 option Kind。
2. 库构建重点使用声明三项；调试与部署按需组合 source map 三项；其余为兼容或诊断工具。
3. 本页只描述 emit 合同，不用浏览器渲染替代 `.d.ts`、map 或 helper 验证。

## 十四、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
