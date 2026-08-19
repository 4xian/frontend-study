---
id: engineering.typescript.reference.tsconfig-language-jsx
type: reference
title: TypeScript TSConfig Language and JSX Reference
summary: 严格模式、隔离编译、JSX、标准库与模块检测的语言配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "alwaysStrict": true, "isolatedModules": true, "jsx": "preserve", "lib": ["ES2025", "DOM"] }
related:
  - engineering.typescript.learn.advanced.framework-type-integration
  - engineering.typescript.learn.advanced.library-author-boundaries
tags:
  - TypeScript
  - TSConfig
  - JSX
  - Standard Library
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: JSX Reference
    url: https://www.typescriptlang.org/docs/handbook/jsx.html
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
  - alwaysstrict
  - erasablesyntaxonly
  - isolateddeclarations
  - isolatedmodules
  - jsx
  - jsxfactory
  - jsxfragmentfactory
  - jsximportsource
  - lib
  - locale
  - moduledetection
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Language and JSX Reference

这 11 项控制文件级可转译性、声明生成、JSX emit、默认声明环境和模块判定。JSX 这里只描述 TypeScript 接口，不开始 React；`lib` 只提供类型声明，不为运行时添加 polyfill。

## 一、alwaysStrict

- **officialKey**：`tsconfig.alwaysStrict`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/alwaysStrict.html)
- **值域**：`true`；**7.0.2 默认**：`true`；**首次版本**：2.1；**7.0 边界**：`false` 不再支持。

它按 strict mode 解析文件，并在合适的非模块输出中写入 `"use strict"`。这与 `strict` 类型检查集合是相关但不同的合同。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "alwaysStrict": true
  }
}
~~~~

## 二、erasableSyntaxOnly

- **officialKey**：`tsconfig.erasableSyntaxOnly`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/erasableSyntaxOnly.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：Website baseline。

开启后禁止需要 TypeScript 生成运行时代码的语法，例如传统 `enum` 与参数属性，便于只擦除类型的工具链安全处理源码。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "erasableSyntaxOnly": true
  }
}
~~~~

## 三、isolatedDeclarations

- **officialKey**：`tsconfig.isolatedDeclarations`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/isolatedDeclarations.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：5.5。

它要求导出具有足够注解，使工具无需完整类型推导也能生成声明。它关注声明 emit，不等同于逐文件 JavaScript 转译。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "isolatedDeclarations": true
  }
}
~~~~

## 四、isolatedModules

- **officialKey**：`tsconfig.isolatedModules`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/isolatedModules.html)
- **值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.5。

它诊断依赖跨文件信息、无法被单文件转译器安全处理的写法。它不把 `tsc` 变成 bundler，也不替代完整类型检查。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
~~~~

## 五、jsx

- **officialKey**：`tsconfig.jsx`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/jsx.html)
- **值域**：`preserve | react-native | react-jsx | react-jsxdev | react`；**7.0.2 默认**：未设置；**首次版本**：1.6。

该值决定 JSX 是保留还是转换，以及采用 classic 还是 automatic runtime。具体 runtime 必须与框架和构建工具配置一致；本页不引入 React 依赖。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
~~~~

## 六、jsxFactory

- **officialKey**：`tsconfig.jsxFactory`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/jsxFactory.html)
- **值域**：函数路径 `string`；**7.0.2 默认**：`React.createElement`；**首次版本**：2.2。

它只影响 classic JSX transform，同时决定类型检查查找的 JSX namespace。automatic runtime 使用 `jsxImportSource`，不应混用两套入口。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "jsxFactory": "h"
  }
}
~~~~

## 七、jsxFragmentFactory

- **officialKey**：`tsconfig.jsxFragmentFactory`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/jsxFragmentFactory.html)
- **值域**：fragment 路径 `string`；**7.0.2 默认**：`React.Fragment`；**首次版本**：4.0。

它与 `jsxFactory` 配套定义 classic transform 的 fragment 目标。只修改其中一项可能让元素与 fragment 使用不同 runtime。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
~~~~

## 八、jsxImportSource

- **officialKey**：`tsconfig.jsxImportSource`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/jsxImportSource.html)
- **值域**：包 specifier `string`；**7.0.2 默认**：`react`；**首次版本**：4.1。

automatic JSX runtime 会从该包的 `jsx-runtime` 或 `jsx-dev-runtime` 入口导入 helper。类型入口和运行时入口都必须真实可解析。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "jsxImportSource": "vue"
  }
}
~~~~

## 九、lib

- **officialKey**：`tsconfig.lib`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/lib.html)
- **值域**：稳定标准库名称 `string[]`；**7.0.2 默认**：由默认 `target: es2025` 和 host 库集合决定；**首次版本**：2.0。

`lib` 选择编译期全局声明，例如 ES、DOM 或 WebWorker。它不会注入 polyfill；同时选择互斥 host 声明还可能产生全局冲突。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "lib": ["ES2024", "DOM", "DOM.Iterable"]
  }
}
~~~~

## 十、locale

- **officialKey**：`tsconfig.locale`；**depth**：`quick`；[官方页面](https://www.typescriptlang.org/tsconfig/locale.html)
- **值域**：平台支持的 locale `string`；**7.0.2 默认**：平台默认；**首次版本**：Website baseline。

固定源码把它标为 command-line-only，用于诊断文本本地化。测试不应依赖本地化后的整段错误文案。

**命令示例：**

~~~~sh
npx tsc -p tsconfig.json --locale zh-CN
~~~~

## 十一、moduleDetection

- **officialKey**：`tsconfig.moduleDetection`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/moduleDetection.html)
- **值域**：`auto | legacy | force`；**7.0.2 默认**：`auto`；**首次版本**：4.7。

`auto` 会结合 import/export、`import.meta`、JSX runtime 和 Node 文件格式判断模块；`force` 把所有非声明文件视为模块。它改变文件作用域判断，不替代 `moduleResolution`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "moduleDetection": "force"
  }
}
~~~~

## 十二、完整语言与 JSX 配置示例

React、Vue JSX 和自定义 JSX runtime 对 jsxImportSource 的要求不同。下面展示自动 JSX runtime 的通用形态；使用 Vue SFC 时通常由 vue-tsc 和框架插件承接模板检查。

~~~~jsonc
{
  "compilerOptions": {
    "alwaysStrict": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "erasableSyntaxOnly": true,
    "isolatedDeclarations": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleDetection": "force",
    "strict": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
~~~~

`locale` 只能通过命令行传入，不能写入 `compilerOptions`。旧 runtime 才需要 jsxFactory 与
jsxFragmentFactory；启用 isolatedDeclarations 时必须同时启用 declaration 或 composite，公开导出还应
补齐能被单文件工具读取的类型信息。

## 十三、易错使用提示

不要把 `lib` 声明当作 runtime polyfill，也不要同时配置 classic JSX factory 与 automatic runtime 却不核对实际 import。`isolatedModules` 和 `isolatedDeclarations` 解决不同工具链问题，不能互相替代。

## 十四、工作原理与适用边界

1. JSX Reference 与 Website 快照定义公共配置面，7.0.2 源码和正式发布文章校正默认值及 `alwaysStrict` 边界。
2. 单文件转译使用 `isolatedModules`，并行声明生成使用 `isolatedDeclarations`，运行环境声明使用 `lib`。
3. 本页只建立 TypeScript/JSX interface，不开始 React、Vite 或框架 runtime 教程。

## 十五、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；官方链接见页面来源区。
