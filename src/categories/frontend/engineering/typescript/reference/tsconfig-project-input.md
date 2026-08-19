---
id: engineering.typescript.reference.tsconfig-project-input
type: reference
title: TypeScript TSConfig Project Input Reference
summary: tsconfig.json 的输入边界、继承、watch 输入筛选与 fallback polling 配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "extends": "./tsconfig.base.json", "include": ["src/**/*.ts"], "exclude": ["dist"] }
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
tags:
  - TypeScript
  - TSConfig
  - Project Input
  - Watch
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
  - title: tsconfig.json
    url: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
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
  - exclude
  - extends
  - files
  - include
  - excludedirectories
  - excludefiles
  - fallbackpolling
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Project Input Reference

本页按 TSConfig 的输入职责合并 7 个稳定键。`files`、`include` 和 `exclude` 决定程序输入；`extends` 负责配置继承；后三项属于 watch host 的筛选或降级策略。页面中的每个键仍有独立 officialKey、索引项和深链。

## 一、exclude

- **officialKey**：`tsconfig.exclude`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig)
- **值域**：`string[]`；**7.0.2 默认**：未设置时由 `include` 和默认排除目录共同决定；**首次版本**：2.0。

`exclude` 只过滤 `include` 的匹配结果，不能阻止被 `files`、`import`、三斜线指令或 `types` 引入的文件进入程序。它不是安全边界，也不会从依赖图中删除已被显式引用的文件。

**配置示例：**

~~~~jsonc
{
  "exclude": ["dist", "coverage"]
}
~~~~

## 二、extends

- **officialKey**：`tsconfig.extends`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig)
- **值域**：`string | string[]`；**7.0.2 默认**：未设置；**首次版本**：2.1。

继承文件先解析，再由子配置覆盖同名属性；相对路径相对当前配置文件解析。数组形式按固定顺序合并，不能把不同 package 的相对路径误当成工作区根路径。

先创建被继承的基础配置：

~~~~jsonc
{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
~~~~

**配置示例：**

~~~~jsonc
{
  "extends": "./tsconfig.base.json"
}
~~~~

## 三、files

- **officialKey**：`tsconfig.files`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：1.5。

`files` 是显式 root file 清单。它适合小型、稳定的声明入口；大型项目应组合 `include` 与 `exclude`，并让导入关系决定依赖闭包。

**配置示例：**

~~~~jsonc
{
  "files": ["src/main.ts"]
}
~~~~

## 四、include

- **officialKey**：`tsconfig.include`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig)
- **值域**：`string[]` glob；**7.0.2 默认**：未设置；**首次版本**：2.0。

`include` 的 glob 相对配置文件目录解析，匹配结果再由 `exclude` 过滤。若 `files` 与 `include` 都缺失，编译器会使用目录默认输入规则；不要把 `include` 当作运行时模块解析器。

**配置示例：**

~~~~jsonc
{
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
~~~~

## 五、excludeDirectories

- **officialKey**：`tsconfig.excludeDirectories`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/excludeDirectories.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：4.2。

它是 watch 目录过滤器，应写在 `watchOptions` 中。监听行为会受操作系统文件监听能力影响，配置时应使用项目内的稳定路径。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "excludeDirectories": ["**/dist", "**/coverage"]
  }
}
~~~~

## 六、excludeFiles

- **officialKey**：`tsconfig.excludeFiles`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/excludeFiles.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：4.2。

它与 `excludeDirectories` 一样属于 watcher 输入筛选，不改变一次性 `tsc` 的类型程序。需要验证时应使用独立 watch host，而不是把一次编译的文件列表当作 watcher 事实。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "excludeFiles": ["**/*.generated.ts"]
  }
}
~~~~

## 七、fallbackPolling

- **officialKey**：`tsconfig.fallbackPolling`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/fallbackPolling.html)
- **值域**：`fixedInterval | priorityInterval | dynamicPriority | fixedChunkSize`；**7.0.2 默认**：`priorityInterval`（host 可能覆盖）；**首次版本**：3.8。

这是原生文件 watcher 不可用时的降级轮询策略。它影响 watch 触发，不改变编译语义；TypeScript 7.0 的 watch 实现与旧 Website 页面存在迁移边界，应用前必须确认实际 host。

**配置示例：**

~~~~jsonc
{
  "watchOptions": {
    "fallbackPolling": "dynamicPriority"
  }
}
~~~~

## 八、完整项目输入配置示例

extends 负责继承 compilerOptions，files/include/exclude 决定程序输入。watchOptions 的排除和轮询策略只影响监听，不会从正常编译中移除源文件。

~~~~jsonc
{
  "extends": "./tsconfig.base.json",
  "files": ["src/env.d.ts"],
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["dist", "coverage"],
  "watchOptions": {
    "excludeDirectories": ["**/node_modules", "dist"],
    "excludeFiles": ["src/generated.ts"],
    "fallbackPolling": "dynamicPriority"
  }
}
~~~~

同时提供 files 和 include 时两者会共同贡献输入；exclude 不能排除被 import、types、files 或 references 明确带入的文件。

## 九、易错使用提示

不要把 `exclude` 当成禁止依赖进入程序的安全边界，也不要把旧 `watchOptions` 页面直接写成 7.0.2 原生 watcher 的实测结论。输入问题先用 `--explainFiles` 确认依赖来源，watch 问题再到实际 host 中验证。

## 十、工作原理与适用边界

1. Website 快照提供 7 个配置键、路径和值域；7.0.2 固定源码负责当前解析和默认表达式。
2. `files`、`include`、`exclude` 与 `extends` 适合项目输入设计；watch 三项只适合 host 调试。
3. watch 相关选项应在 TypeScript 7.0.2 中配置，并结合目标操作系统的文件监听行为使用。

## 十一、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
