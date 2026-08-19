---
id: engineering.typescript.reference.tsconfig-build-watch
type: reference
title: TypeScript TSConfig Build and Watch Reference
summary: 增量构建、项目引用、watch 文件系统策略与构建诊断配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "references": [{ "path": "./packages/core" }], "tsBuildInfoFile": "./.cache/tsbuildinfo" }
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
  - engineering.typescript.learn.advanced.type-performance
tags:
  - TypeScript
  - TSConfig
  - Build
  - Watch
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
  - preservewatchoutput
  - references
  - stopbuildonerrors
  - synchronouswatchdirectory
  - tsbuildinfofile
  - verbose
  - watchdirectory
  - watchfile
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Build and Watch Reference

这 8 项连接 project references、build mode 和 watch host。构建缓存、构建失败策略和文件监听只影响工具流程；最终类型与声明合同仍需用干净的消费者构建验证。

## 一、preserveWatchOutput

- **officialKey**：`tsconfig.preserveWatchOutput`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/preserveWatchOutput.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

开启后 watch 重编译时保留既有终端输出，便于连续诊断。它不影响文件监听、类型检查或生成结果。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "preserveWatchOutput": true
  }
}
~~~~

## 二、references

- **officialKey**：`tsconfig.references`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig)
- **值域**：项目引用数组；**7.0.2 默认**：未设置；**首次版本**：3.0。

每个引用指向另一个 composite project，`tsc -b` 按依赖顺序构建。引用只描述项目图，不会自动替当前项目发布入口或运行时依赖。

**配置示例：**

~~~~jsonc
{
  "references": [{ "path": "./packages/core" }]
}
~~~~

## 三、stopBuildOnErrors

- **officialKey**：`tsconfig.stopBuildOnErrors`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/stopBuildOnErrors.html)
- **值域**：`boolean`；**7.0.2 默认**：未设置；**首次版本**：Website baseline。

它控制 build mode 在上游出现错误时是否停止继续构建下游。CI 可按风险选择，但任何成功状态都必须基于真正的退出码和输出，而不是只看部分项目。

**命令示例：**

~~~~sh
npx tsc -b --stopBuildOnErrors
~~~~

## 四、synchronousWatchDirectory

- **officialKey**：`tsconfig.synchronousWatchDirectory`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/synchronousWatchDirectory.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：3.8。

开启后目录 watcher 同步回调。它是 host 性能与时序选择，不能由一次性 `tsc --noEmit` 推导；跨平台 runner 应单独记录实际 watcher。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "synchronousWatchDirectory": false
  }
}
~~~~

## 五、tsBuildInfoFile

- **officialKey**：`tsconfig.tsBuildInfoFile`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/tsBuildInfoFile.html)
- **值域**：文件路径 `string`；**7.0.2 默认**：由 incremental/composite 推导；**首次版本**：3.4。

它指定增量状态文件位置。缓存应放在可清理目录，并在源码或配置变化后重新验证，不能把旧 `.tsbuildinfo` 当成当前构建证据。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.cache/app.tsbuildinfo"
  }
}
~~~~

## 六、verbose

- **officialKey**：`tsconfig.verbose`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/verbose.html)
- **值域**：build mode 命令行 flag；**7.0.2 默认**：不启用；**首次版本**：Website baseline。

`tsc -b --verbose` 输出项目图和构建决策，适合审计为什么重建或跳过。验证应固定语义摘要，不锁完整路径和时间戳。

**配置示例：**

~~~~sh
npx tsc -b --verbose
~~~~

## 七、watchDirectory

- **officialKey**：`tsconfig.watchDirectory`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/watchDirectory.html)
- **值域**：watch strategy 枚举；**7.0.2 默认**：host 选择；**首次版本**：3.8。

它选择目录变化的监听策略。可用值和最佳策略取决于平台，不能把某个 macOS 或 Linux host 的观察写成跨平台保证。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "watchDirectory": "usefsevents"
  }
}
~~~~

## 八、watchFile

- **officialKey**：`tsconfig.watchFile`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/watchFile.html)
- **值域**：file strategy 枚举；**7.0.2 默认**：host 选择；**首次版本**：3.8。

它选择单文件变化的监听策略。性能调优要与 `watchDirectory`、fallbackPolling 和真实编辑器 host 一起评估。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "watchFile": "usefsevents"
  }
}
~~~~

## 九、完整配置与命令示例

构建模式选项并不都写在 compilerOptions 中。下面同时展示项目配置、watchOptions 和常用 build 命令；按实际任务选择命令，不要把互斥行为一次性全部执行。

~~~~jsonc
{
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.cache/app.tsbuildinfo",
    "preserveWatchOutput": true
  },
  "references": [{ "path": "../shared" }],
  "watchOptions": {
    "watchFile": "useFsEvents",
    "watchDirectory": "useFsEvents",
    "synchronousWatchDirectory": false
  }
}
~~~~

~~~~sh
# 显示构建图和增量判断
npx tsc -b --verbose

# 即使输出看起来是最新的也重新构建
npx tsc -b --force

# 清理引用项目生成的输出
npx tsc -b --clean

# 出错后停止后续引用项目
npx tsc -b --stopBuildOnErrors
~~~~

## 十、易错使用提示

`references` 和 `tsBuildInfoFile` 描述项目图与缓存，`watchFile`/`watchDirectory` 描述 host 监听，`verbose`/`preserveWatchOutput` 描述诊断输出。它们都不能替代干净构建、消费者编译或实际浏览器验证。

## 十一、工作原理与适用边界

1. Website 快照提供 option 页面和值域；7.0.2 固定源码及 7.0 发布文章裁决 build mode 的失败策略和迁移边界。
2. 使用 project references 时固定输出和 build info 路径，再用 `tsc -b --verbose` 检查依赖图；watch 策略则在目标 host 单独验证。
3. watch 输出和增量缓存是开发工具状态，不应作为应用源码或发布产物提交。

## 十二、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`。
