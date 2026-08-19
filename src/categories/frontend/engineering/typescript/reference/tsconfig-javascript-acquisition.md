---
id: engineering.typescript.reference.tsconfig-javascript-acquisition
type: reference
title: TypeScript TSConfig JavaScript Acquisition Reference
summary: JavaScript 输入、checkJs 与自动类型获取的项目配置边界
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "allowJs": true, "checkJs": true, "maxNodeModuleJsDepth": 1 }
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
tags:
  - TypeScript
  - TSConfig
  - JavaScript
  - Type Acquisition
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
  - title: Type Acquisition
    url: https://www.typescriptlang.org/tsconfig/typeAcquisition.html
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
  - allowjs
  - checkjs
  - disablefilenamebasedtypeacquisition
  - enable
  - maxnodemodulejsdepth
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig JavaScript Acquisition Reference

这 5 项分别控制 JavaScript 是否进入程序、是否诊断 JS、自动类型获取的文件名策略、自动获取开关和 `node_modules` 深度。`enable` 属于 `typeAcquisition` 对象；其余项位于 compiler 或语言服务边界，不能只凭名称推断运行时行为。

## 一、allowJs

- **officialKey**：`tsconfig.allowJs`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/allowJs.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.8。

开启后 JavaScript 文件可以进入程序，但只允许输入并不等于检查。要对 JS 报错需同时使用 `checkJs` 或文件级 `// @ts-check`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "allowJs": true
  }
}
~~~~

## 二、checkJs

- **officialKey**：`tsconfig.checkJs`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/checkJs.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.3。

`checkJs` 只在 JS 已被纳入程序时生效。迁移项目可以先用文件级注释缩小范围，再把错误反馈与 `allowJs` 的输入边界分开处理。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "checkJs": true
  }
}
~~~~

## 三、disableFilenameBasedTypeAcquisition

- **officialKey**：`tsconfig.disableFilenameBasedTypeAcquisition`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/disableFilenameBasedTypeAcquisition.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.1。

它关闭语言服务根据文件名推断需要的 `@types` 包。它不关闭显式 `types` 或 `typeRoots` 配置，也不改变 `tsc` 的普通模块解析。

**配置示例：**

~~~~jsonc
{
  "typeAcquisition": {
    "disableFilenameBasedTypeAcquisition": true
  }
}
~~~~

## 四、enable

- **officialKey**：`tsconfig.enable`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/enable.html)
- **值域**：`boolean`（`typeAcquisition.enable`）；**7.0.2 默认**：`false`；**首次版本**：Website baseline。

这是自动类型获取的开关，面向 JavaScript 项目的语言服务体验。它不等价于 `allowJs`，也不代表编译器会下载或执行第三方代码。

**配置示例：**

~~~~jsonc
{
  "typeAcquisition": {
    "enable": true
  }
}
~~~~

## 五、maxNodeModuleJsDepth

- **officialKey**：`tsconfig.maxNodeModuleJsDepth`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/maxNodeModuleJsDepth.html)
- **值域**：非负整数；**7.0.2 默认**：`0`；**首次版本**：2.0。

只有 `allowJs` 开启时该深度才会影响 `node_modules` 中 JS 的检查范围。深度越大，语言服务扫描和诊断成本越高；它不替代包的声明文件。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "maxNodeModuleJsDepth": 1
  }
}
~~~~

## 六、完整 JavaScript 检查配置示例

迁移 JavaScript 项目时先允许 JS，再逐步打开检查。typeAcquisition 主要服务 JavaScript 编辑体验，不替代项目依赖声明。

~~~~jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "maxNodeModuleJsDepth": 1,
    "noEmit": true
  },
  "typeAcquisition": {
    "enable": true,
    "disableFilenameBasedTypeAcquisition": false,
    "include": ["jest"],
    "exclude": ["legacy-global"]
  },
  "include": ["src/**/*.js"]
}
~~~~

如果第三方 node_modules 体积很大，保持 maxNodeModuleJsDepth 为 0，再为实际使用的无类型包安装精确声明通常更可控。

## 七、易错使用提示

不要把 `allowJs`、`checkJs` 和自动类型获取合并成一个开关：前两项决定程序输入与诊断，type acquisition 属于编辑器/语言服务的声明获取策略。扩大 `maxNodeModuleJsDepth` 也不能修复缺失或错误的包声明。

## 八、工作原理与适用边界

1. Website 快照给出配置入口和首次版本，7.0.2 固定源码给出 compiler option 的 Kind 与默认表达式。
2. JS 迁移使用 `allowJs`/`checkJs`；纯 TypeScript 项目通常不需要自动类型获取。
3. 自动下载和编辑器行为依赖编辑器语言服务，本页的配置含义以 TypeScript 7.0.2 为准。

## 九、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
