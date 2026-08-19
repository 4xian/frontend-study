---
id: engineering.typescript.reference.tsconfig-module-paths
type: reference
title: TypeScript TSConfig Module Paths Reference
summary: 模块路径、根目录、JSON 导入与包解析追踪配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "rootDir": "./src", "paths": { "@/*": ["./src/*"] }, "resolveJsonModule": true }
related:
  - engineering.typescript.learn.intermediate.module-resolution-and-packages
  - engineering.typescript.learn.advanced.tsconfig-layering
tags:
  - TypeScript
  - TSConfig
  - Module Paths
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
  - noresolve
  - paths
  - preservesymlinks
  - resolvejsonmodule
  - resolvepackagejsonexports
  - resolvepackagejsonimports
  - rootdir
  - rootdirs
  - traceresolution
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Module Paths Reference

这 9 项描述源码根目录、路径别名、JSON 与 package 入口的解析边界。别名只影响 TypeScript 的解析图，必须和 bundler、测试 runner 及发布后的目录结构保持同一合同。

## 一、noResolve

- **officialKey**：`tsconfig.noResolve`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/noResolve.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。

开启后编译器不因 import、reference 或三斜线指令自动把新文件加入程序，只检查显式输入。它适合诊断输入边界，不适合隐藏真实依赖。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noResolve": false
  }
}
~~~~

## 二、paths

- **officialKey**：`tsconfig.paths`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/paths.html)
- **值域**：`Record<string, string[]>`；**7.0.2 默认**：未设置；**首次版本**：2.0。

`paths` 把说明符映射到相对 `baseUrl` 或配置文件的候选路径，但不会改写 emit，也不会自动配置运行时。每个别名都要在实际 host 中有对应解析规则。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
~~~~

## 三、preserveSymlinks

- **officialKey**：`tsconfig.preserveSymlinks`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/preserveSymlinks.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.5。

开启后解析器保留符号链接路径。monorepo 使用它时要同时核对 package identity、重复依赖和 bundler 的 symlink 策略，否则同一包可能出现两份类型实例。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "preserveSymlinks": false
  }
}
~~~~

## 四、resolveJsonModule

- **officialKey**：`tsconfig.resolveJsonModule`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/resolveJsonModule.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.9。

开启后 JSON 文件可参与类型检查，形状由 JSON 内容推导。它只提供静态类型和解析许可，运行时 JSON 加载方式仍取决于 module host。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
~~~~

## 五、resolvePackageJsonExports

- **officialKey**：`tsconfig.resolvePackageJsonExports`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/resolvePackageJsonExports.html)
- **值域**：`boolean`；**7.0.2 默认**：由 moduleResolution 决定；**首次版本**：5.0。

开启时 resolver 尊重 package.json 的 `exports`，不可公开的子路径会保持不可导入。关闭它只能作为兼容诊断，不能替代修正包的发布面。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "resolvePackageJsonExports": true
  }
}
~~~~

## 六、resolvePackageJsonImports

- **officialKey**：`tsconfig.resolvePackageJsonImports`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/resolvePackageJsonImports.html)
- **值域**：`boolean`；**7.0.2 默认**：由 moduleResolution 决定；**首次版本**：5.0。

它控制 package.json `imports` 的内部 `#` 说明符。只有从包内部发起的导入才适用，不能把它误当成跨包 alias。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "resolvePackageJsonImports": true
  }
}
~~~~

## 七、rootDir

- **officialKey**：`tsconfig.rootDir`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/rootDir.html)
- **值域**：目录路径 `string`；**7.0.2 默认**：`./`；**首次版本**：1.5。

`rootDir` 约束输出目录保留的源目录结构，并不决定程序包含哪些文件。7.0 默认 `./`，显式收窄时要确保所有被纳入的源文件都位于其下。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "rootDir": "./src"
  }
}
~~~~

## 八、rootDirs

- **officialKey**：`tsconfig.rootDirs`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/rootDirs.html)
- **值域**：目录路径数组 `string[]`；**7.0.2 默认**：未设置；**首次版本**：2.0。

多个根目录可在类型检查时被视为一个虚拟根，常用于生成文件与源码的相对导入。它不合并真实目录，也不改变输出文件的物理位置。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "rootDirs": ["./src", "./generated"]
  }
}
~~~~

## 九、traceResolution

- **officialKey**：`tsconfig.traceResolution`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/traceResolution.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

开启后输出 resolver 的候选路径和最终命中。它是诊断证据，不应依赖完整英文日志或探测顺序；稳定验证应归一化项目根和最终声明路径。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "traceResolution": true
  }
}
~~~~

## 十、完整模块路径配置示例

paths 必须与实际打包器使用同一别名。下面的配置让 TypeScript 处理源码别名、JSON 和 package exports，同时把生成类型与源码视为一个虚拟根。

~~~~jsonc
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "preserveSymlinks": false,
    "resolveJsonModule": true,
    "resolvePackageJsonExports": true,
    "resolvePackageJsonImports": true,
    "rootDir": ".",
    "rootDirs": ["src", "generated"],
    "traceResolution": false,
    "noResolve": false,
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "generated/**/*.d.ts"]
}
~~~~

Vite 项目还要在 resolve.alias 或 resolve.tsconfigPaths 中建立相同映射。排查导入时再把 traceResolution 改为 true，定位最终命中后关闭详细日志。

## 十一、易错使用提示

`paths`、`rootDir` 和 `rootDirs` 都不会替 bundler 或 Node 改写运行时路径。先确定真实 host，再选择 moduleResolution、package exports 和别名策略；不要用旧的 `baseUrl` 习惯覆盖 7.0 已移除的能力。

## 十二、工作原理与适用边界

1. Website 快照提供键、路径、值域和首次版本；7.0.2 固定源码裁决 rootDir、package 解析和诊断开关的当前默认表达式。
2. 路径映射用于类型解析，发布和运行时必须另有可执行的映射或真实相对路径。
3. `traceResolution` 只帮助定位差异，不能替代正例与负例的最终编译结果。

## 十三、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；7.0 迁移边界以正式发布文章为准。
