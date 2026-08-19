---
id: engineering.typescript.reference.tsconfig-type-environment
type: reference
title: TypeScript TSConfig Type Environment Reference
summary: 标准库、类型根、插件与 JavaScript 类型获取环境配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "lib": ["ES2025", "DOM"], "types": [], "typeRoots": ["./types"] }
related:
  - engineering.typescript.learn.advanced.framework-type-integration
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - TSConfig
  - Type Environment
  - Declaration
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
  - nolib
  - plugins
  - skipdefaultlibcheck
  - skiplibcheck
  - typeacquisition
  - typeacquisitionexclude
  - typeacquisitioninclude
  - typeroots
  - types
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Type Environment Reference

这 9 个键控制编译器看到哪些声明。`lib`、`types` 和 `typeRoots` 决定全局与包类型边界；`noLib` 和 skip 选项改变默认声明检查；插件与 type acquisition 则属于工具集成接口。

## 一、noLib

- **officialKey**：`tsconfig.noLib`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/noLib.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.0。

开启后不自动包含默认 lib 声明，项目必须通过显式 `/// <reference lib>` 或自有声明提供所需全局类型。它不会删除用户显式加入的声明文件。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noLib": false
  }
}
~~~~

## 二、plugins

- **officialKey**：`tsconfig.plugins`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/plugins.html)
- **值域**：语言服务插件配置数组；**7.0.2 默认**：未设置；**首次版本**：2.3。

插件由编辑器语言服务加载，不是 compiler emit 的稳定扩展点。课程只登记接口边界，不把第三方插件行为计入 TypeScript 稳定分母。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "typescript-plugin-example" }]
  }
}
~~~~

## 三、skipDefaultLibCheck

- **officialKey**：`tsconfig.skipDefaultLibCheck`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/skipDefaultLibCheck.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

它只跳过默认库文件的检查，适合暂时规避库版本冲突。它不等同于 `skipLibCheck`，也不会让应用源文件免于类型检查。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "skipDefaultLibCheck": false
  }
}
~~~~

## 四、skipLibCheck

- **officialKey**：`tsconfig.skipLibCheck`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/skipLibCheck.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。

开启后跳过 `.d.ts` 的类型检查以缩短构建时间，但仍使用其声明。它可隐藏重复或不兼容的依赖类型，发布库不应把它当作修复手段。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "skipLibCheck": false
  }
}
~~~~

## 五、typeAcquisition

- **officialKey**：`tsconfig.typeAcquisition`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/typeAcquisition.html)
- **值域**：对象；**7.0.2 默认**：JavaScript 项目按 host 推断；**首次版本**：2.0。

该对象配置 JavaScript 项目的自动类型获取。TypeScript 项目通常由显式依赖和 `types` 管理，不应把自动下载当作发布合同。

**配置示例：**

~~~~jsonc
{
  "typeAcquisition": { "enable": true, "include": ["jest"] }
}
~~~~

## 六、typeAcquisition.exclude

- **officialKey**：`tsconfig.typeAcquisition.exclude`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/typeAcquisition.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：2.0。

列出不应自动获取类型的包名。它只作用于 JavaScript 的 type acquisition，不会从 TypeScript 的模块解析图移除包。

**配置示例：**

~~~~jsonc
{
  "typeAcquisition": {
    "exclude": ["jquery"]
  }
}
~~~~

## 七、typeAcquisition.include

- **officialKey**：`tsconfig.typeAcquisition.include`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/typeAcquisition.html)
- **值域**：`string[]`；**7.0.2 默认**：未设置；**首次版本**：2.0。

列出应主动获取的 JavaScript 包类型。使用它前应锁定依赖来源和网络策略，避免编辑器环境与 CI 环境得到不同程序。

**配置示例：**

~~~~jsonc
{
  "typeAcquisition": {
    "include": ["jest"]
  }
}
~~~~

## 八、typeRoots

- **officialKey**：`tsconfig.typeRoots`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/typeRoots.html)
- **值域**：目录路径数组 `string[]`；**7.0.2 默认**：所有可见 `node_modules/@types`；**首次版本**：2.0。

设置后只从列出的目录加载类型包。若仍需要 `@types`，必须显式包含对应目录；它不会自动合并默认目录。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "typeRoots": ["./types", "./node_modules/@types"]
  }
}
~~~~

## 九、types

- **officialKey**：`tsconfig.types`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/types.html)
- **值域**：包名数组 `string[]`；**7.0.2 默认**：`[]`；**首次版本**：2.0。

`types` 只控制哪些包把全局声明带入程序，不限制普通 import。7.0 默认空数组，项目应按需要显式列出 Jest、Node 等环境，而不是依赖目录扫描。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "types": ["node", "vite/client"]
  }
}
~~~~

## 十、完整类型环境配置示例

浏览器应用通常保留默认 lib，只用 types 收窄自动注入的包声明。typeRoots 会替换默认搜索路径，除非确实维护私有声明根，否则不必设置。

~~~~jsonc
{
  "compilerOptions": {
    "noLib": false,
    "plugins": [],
    "skipDefaultLibCheck": false,
    "skipLibCheck": true,
    "types": ["vite/client", "node"],
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "typeAcquisition": {
    "enable": false,
    "include": [],
    "exclude": ["legacy-global"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"]
}
~~~~

如果设置 typeRoots，务必保留需要的 node_modules/@types 路径。skipLibCheck 只跳过声明文件之间的检查，不会修复重复类型或错误运行入口。

## 十一、易错使用提示

`lib` 是标准库声明选择，`types` 是全局包声明白名单，`typeRoots` 是查找目录约束，三者职责不同。`skipLibCheck` 能隐藏声明冲突但不能修复它；插件和 type acquisition 也不应被当作编译器 API。

## 十二、工作原理与适用边界

1. Website 快照负责配置路径、说明和值域；7.0.2 固定源码确认 `types=[]`、`noLib` 和 skip 行为的默认表达式。
2. 应用项目优先显式声明环境，库项目应在消费者示例中验证发布声明，不能依赖未登记的全局类型。
3. 标准库与 API 插件属于观察或受限边界，本文只提供 TSConfig 侧稳定入口。

## 十三、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`。
