---
id: engineering.typescript.reference.tsconfig-project-build
type: reference
title: TypeScript TSConfig Project Build Reference
summary: project references、增量构建和 build mode 的项目图配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "compilerOptions": { "composite": true, "incremental": true }, "references": [{ "path": "./core" }] }
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
tags:
  - TypeScript
  - TSConfig
  - Project References
  - Build Mode
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: Project References
    url: https://www.typescriptlang.org/docs/handbook/project-references.html
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
  - assumechangesonlyaffectdirectdependencies
  - clean
  - composite
  - disablereferencedprojectload
  - disablesolutionsearching
  - disablesourceofprojectreferenceredirect
  - force
  - incremental
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Project Build Reference

本页把项目引用、增量状态和 build mode 相关键放在同一张图里。`clean` 与 `force` 是 `tsc -b` 的命令行动作，不是长期写进 `compilerOptions` 的普通编译开关；其余键描述项目图或编辑器加载策略。

## 一、assumeChangesOnlyAffectDirectDependencies

- **officialKey**：`tsconfig.assumeChangesOnlyAffectDirectDependencies`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/assumeChangesOnlyAffectDirectDependencies.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.8。

它只适用于 `incremental` 与 watch，假设文件变化只影响直接依赖，从而减少重算。大型项目应把它视为性能取舍，而不是类型正确性的放宽。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "assumeChangesOnlyAffectDirectDependencies": true
  }
}
~~~~

## 二、clean

- **officialKey**：`tsconfig.clean`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/clean.html)
- **值域**：build mode 命令行 flag；**7.0.2 默认**：不启用；**首次版本**：Website baseline。

`tsc -b --clean` 删除引用图的输出和 build info。它是一次性清理动作，不应写入 `tsconfig.json` 期待每次构建自动删除输出。

**配置示例：**

~~~~sh
npx tsc -b --clean
~~~~

## 三、composite

- **officialKey**：`tsconfig.composite`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/composite.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.0。

开启后项目满足 project references 的约束，通常配合 `declaration`、稳定 `rootDir` 和可追踪的输入清单。它不是 monorepo 的目录扫描开关。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "composite": true
  }
}
~~~~

## 四、disableReferencedProjectLoad

- **officialKey**：`tsconfig.disableReferencedProjectLoad`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/disableReferencedProjectLoad.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.0。

它减少编辑器自动加载的引用项目数量，适合大型项目的交互性能；`tsc -b` 的完整构建图不因此消失。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "disableReferencedProjectLoad": false
  }
}
~~~~

## 五、disableSolutionSearching

- **officialKey**：`tsconfig.disableSolutionSearching`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/disableSolutionSearching.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.8。

它让编辑器退出多项目 solution searching。该设置改变语言服务加载策略，不改变一次性编译的声明合同。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "disableSolutionSearching": false
  }
}
~~~~

## 六、disableSourceOfProjectReferenceRedirect

- **officialKey**：`tsconfig.disableSourceOfProjectReferenceRedirect`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/disableSourceOfProjectReferenceRedirect.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.7。

开启后引用项目优先使用其 `.d.ts`，不在编辑器中把源文件重定向为类型来源。发布或 CI 仍应验证声明输出真实存在。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "disableSourceOfProjectReferenceRedirect": false
  }
}
~~~~

## 七、force

- **officialKey**：`tsconfig.force`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/force.html)
- **值域**：build mode 命令行 flag；**7.0.2 默认**：不启用；**首次版本**：Website baseline。

`tsc -b --force` 强制重建所有项目，即使 build info 认为它们是最新的。它是诊断和迁移工具，不应伪装成增量策略。

**配置示例：**

~~~~sh
npx tsc -b --force
~~~~

## 八、incremental

- **officialKey**：`tsconfig.incremental`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/incremental.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`（`composite` 可隐式启用）；**首次版本**：3.4。

开启后保存 `.tsbuildinfo` 以复用分析结果。缓存文件应进入明确的输出策略，不能把旧 build info 当作当前源码验证。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "incremental": true
  }
}
~~~~

## 九、完整项目引用配置示例

被引用项目需要 composite；根配置只保存引用图。incremental 负责复用检查信息，其余开关按编辑器规模和构建策略选择。

~~~~jsonc
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "declaration": true,
    "outDir": "dist",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

~~~~jsonc
// tsconfig.json
{
  "files": [],
  "references": [{ "path": "./packages/shared" }]
}
~~~~

~~~~sh
npx tsc -b --verbose
npx tsc -b --force
npx tsc -b --clean
~~~~

disableReferencedProjectLoad、disableSolutionSearching 和 disableSourceOfProjectReferenceRedirect 主要影响编辑器或大型 solution 的加载策略，应在确有性能问题时单独启用并复测导航体验。

## 十、易错使用提示

不要把 `clean` 和 `force` 写进 `compilerOptions`；它们是 `tsc -b` 的一次性动作。也不要用 `.tsbuildinfo` 存在来证明声明或 JavaScript 产物仍与当前源码一致，发布前应执行确定性构建和消费者检查。

## 十一、工作原理与适用边界

1. Project References 页面定义项目图合同，Website build option 页面提供动作入口，7.0.2 源码校正当前默认值。
2. `composite`/`incremental` 用于可复用项目边界；三个 `disable*` 项主要用于大型工程的编辑器加载策略。
3. project reference 与 build mode 的配置和命令均以 TypeScript 7.0.2 为准。

## 十二、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
