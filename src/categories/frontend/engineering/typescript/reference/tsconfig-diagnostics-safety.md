---
id: engineering.typescript.reference.tsconfig-diagnostics-safety
type: reference
title: TypeScript TSConfig Diagnostics and Safety Reference
summary: 诊断级别、输入说明、性能追踪与大小写安全配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "exactOptionalPropertyTypes": true, "forceConsistentCasingInFileNames": true }
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
  - engineering.typescript.learn.intermediate.unknown-never-and-errors
tags:
  - TypeScript
  - TSConfig
  - Diagnostics
  - Safety
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
  - title: Compiler Options
    url: https://www.typescriptlang.org/docs/handbook/compiler-options.html
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
  - allowunreachablecode
  - allowunusedlabels
  - diagnostics
  - disablesizelimit
  - exactoptionalpropertytypes
  - explainfiles
  - extendeddiagnostics
  - forceconsistentcasinginfilenames
  - generatecpuprofile
  - generatetrace
  - listfiles
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Diagnostics and Safety Reference

本页区分三类配置：改变诊断政策的开关、解释编译输入的只读输出，以及用于性能分析的 profiler/trace。诊断输出可能随版本变化；示例应锁最小语义或诊断码，不锁整段文案。

## 一、allowUnreachableCode

- **officialKey**：`tsconfig.allowUnreachableCode`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowUnreachableCode.html)
- **值域**：`true | false | undefined`；**7.0.2 默认**：`undefined`（`TSUnknown`）；**首次版本**：1.8。

`false` 把不可达代码作为错误，`true` 忽略，未设置由默认诊断政策处理。它不影响 JavaScript 引擎是否执行可达分支。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowUnreachableCode": false
  }
}
~~~~

## 二、allowUnusedLabels

- **officialKey**：`tsconfig.allowUnusedLabels`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowUnusedLabels.html)
- **值域**：`true | false | undefined`；**7.0.2 默认**：`undefined`（`TSUnknown`）；**首次版本**：1.8。

它只控制未使用标签的诊断政策，不影响 `break label` 或 `continue label` 的运行时语义。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowUnusedLabels": false
  }
}
~~~~

## 三、diagnostics

- **officialKey**：`tsconfig.diagnostics`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/diagnostics.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。

开启后输出文件数、类型数、内存和各阶段耗时的摘要。它适合建立性能基线，不是错误检查强度开关。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "diagnostics": true
  }
}
~~~~

## 四、disableSizeLimit

- **officialKey**：`tsconfig.disableSizeLimit`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/disableSizeLimit.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

它移除语言服务针对大型 JavaScript 项目的大小保护。启用前应先缩小输入或修正依赖范围，否则可能放大内存和响应时间问题。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "disableSizeLimit": false
  }
}
~~~~

## 五、exactOptionalPropertyTypes

- **officialKey**：`tsconfig.exactOptionalPropertyTypes`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.4。

开启后 `prop?: T` 表示属性缺失或值为 `T`，不再自动允许显式 `undefined`。这会收紧写入边界，适合精确区分“未提供”和“提供 undefined”的 API。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictNullChecks": true,
    "exactOptionalPropertyTypes": true
  }
}
~~~~

## 六、explainFiles

- **officialKey**：`tsconfig.explainFiles`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/explainFiles.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.2。

它解释每个文件为什么进入程序，适合追查 lib、types、include 和 import 链。输出格式是诊断接口，不应作为稳定机器协议。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "explainFiles": true
  }
}
~~~~

## 七、extendedDiagnostics

- **officialKey**：`tsconfig.extendedDiagnostics`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/extendedDiagnostics.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

它在 `diagnostics` 基础上提供更细粒度计时。比较前需固定源码、配置、机器和缓存状态。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "extendedDiagnostics": true
  }
}
~~~~

## 八、forceConsistentCasingInFileNames

- **officialKey**：`tsconfig.forceConsistentCasingInFileNames`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/forceConsistentCasingInFileNames.html)
- **值域**：`boolean`；**7.0.2 默认**：`true`；**首次版本**：1.8。

它要求 import 的路径大小写与磁盘文件一致，避免在大小写敏感与不敏感文件系统之间产生环境差异。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
~~~~

## 九、generateCpuProfile

- **officialKey**：`tsconfig.generateCpuProfile`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/generateCpuProfile.html)
- **值域**：输出文件路径 `string`；**7.0.2 默认**：`profile.cpuprofile`；**首次版本**：3.7。

它生成编译器 CPU profile，用于定位性能热点。profile 可能包含本地路径，只应写入受控的诊断目录。

**配置示例：**

~~~~sh
npx tsc -p tsconfig.json --generateCpuProfile .diagnostics/tsc.cpuprofile
~~~~

## 十、generateTrace

- **officialKey**：`tsconfig.generateTrace`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/generateTrace.html)
- **值域**：输出目录 `string`；**7.0.2 默认**：未设置；**首次版本**：4.1。

它生成事件 trace 和类型数据，适合分析类型检查瓶颈。trace 体积和内容都不适合纳入版本控制。

**配置示例：**

~~~~sh
npx tsc -p tsconfig.json --generateTrace .diagnostics/trace
~~~~

## 十一、listFiles

- **officialKey**：`tsconfig.listFiles`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/listFiles.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。

它打印编译器读取的文件，用于核对程序边界。与 `explainFiles` 相比，它只给清单，不说明进入原因。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "listFiles": true
  }
}
~~~~

## 十二、完整诊断配置示例

这份配置同时打开代码安全检查和可解释诊断。性能输出会增加日志量，通常只在排查编译问题时通过独立配置启用。

~~~~jsonc
{
  "compilerOptions": {
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "disableSizeLimit": false,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "strict": true,
    "diagnostics": true,
    "extendedDiagnostics": true,
    "explainFiles": true,
    "listFiles": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

CPU profile 与 trace 由命令指定输出位置，避免把诊断产物混进源码目录：

~~~~sh
npx tsc -p tsconfig.json --generateCpuProfile .diagnostics/tsc.cpuprofile
npx tsc -p tsconfig.json --generateTrace .diagnostics/trace
~~~~

## 十三、易错使用提示

不要把 profiler、trace 或文件清单提交到仓库，也不要把本地化诊断全文锁成稳定测试合同。诊断负例优先锁诊断码和最小语义，性能比较必须固定源码、配置、机器与缓存状态。

## 十四、工作原理与适用边界

1. Website 快照给出诊断项说明和首次版本，7.0.2 固定源码提供 Kind、默认值与 command-line 边界。
2. `exactOptionalPropertyTypes` 和大小写检查影响安全合同；其余项主要服务输入解释与性能诊断。
3. 使用其他编译器版本时应以该版本实际诊断为准，不能直接套用 7.0.2 的默认值。

## 十五、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
