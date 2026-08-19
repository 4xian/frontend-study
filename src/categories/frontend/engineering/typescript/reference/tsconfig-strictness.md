---
id: engineering.typescript.reference.tsconfig-strictness
type: reference
title: TypeScript TSConfig Strictness Reference
summary: strict 家族、未检查访问、控制流、override 与未使用代码的类型安全配置
domain: frontend
technology: engineering
module: typescript
group: tsconfig
signature: |-
  { "strict": true, "noUncheckedIndexedAccess": true, "noImplicitOverride": true }
related:
  - engineering.typescript.learn.intermediate.unknown-never-and-errors
  - engineering.typescript.learn.advanced.type-design
tags:
  - TypeScript
  - TSConfig
  - Strict
  - Type Safety
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
  - nofallthroughcasesinswitch
  - noimplicitany
  - noimplicitoverride
  - noimplicitreturns
  - noimplicitthis
  - nopropertyaccessfromindexsignature
  - nouncheckedindexedaccess
  - nouncheckedsideeffectimports
  - nounusedlocals
  - nounusedparameters
  - strict
  - strictbindcallapply
  - strictbuiltiniteratorreturn
  - strictfunctiontypes
  - strictnullchecks
  - strictpropertyinitialization
  - useunknownincatchvariables
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript TSConfig Strictness Reference

本页合并 17 个类型安全键。TypeScript 7.0 默认开启 `strict`，因此 strict 家族的有效默认值为开启；额外的控制流、索引访问、side-effect import、override 与未使用代码检查仍需按项目策略显式选择。

## 一、noFallthroughCasesInSwitch

**officialKey**：`tsconfig.noFallthroughCasesInSwitch`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noFallthroughCasesInSwitch.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.8。它报告包含语句却没有 `break`、`return` 或 `throw` 的 switch 穿透分支，不禁止空 case 合并。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noFallthroughCasesInSwitch": true
  }
}
~~~~

## 二、noImplicitAny

**officialKey**：`tsconfig.noImplicitAny`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noImplicitAny.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由默认 `strict: true` 启用）；**首次版本**：1.0。它报告无法推导而隐式落到 `any` 的位置，不禁止显式、经过评审的 `any`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
~~~~

## 三、noImplicitOverride

**officialKey**：`tsconfig.noImplicitOverride`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noImplicitOverride.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.3。开启后派生类覆盖基类成员必须写 `override`，让基类重命名或签名变化在编译期暴露。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noImplicitOverride": true
  }
}
~~~~

## 四、noImplicitReturns

**officialKey**：`tsconfig.noImplicitReturns`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noImplicitReturns.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：1.8。它报告并非所有代码路径都显式返回值的函数，不能替代业务层对返回结果的运行时验证。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noImplicitReturns": true
  }
}
~~~~

## 五、noImplicitThis

**officialKey**：`tsconfig.noImplicitThis`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noImplicitThis.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：2.0。它在 `this` 无法安全确定而隐式成为 `any` 时报告错误。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noImplicitThis": true
  }
}
~~~~

## 六、noPropertyAccessFromIndexSignature

**officialKey**：`tsconfig.noPropertyAccessFromIndexSignature`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noPropertyAccessFromIndexSignature.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.2。索引签名声明的未知键只能用括号访问，显式属性仍可用点访问。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noPropertyAccessFromIndexSignature": true
  }
}
~~~~

## 七、noUncheckedIndexedAccess

**officialKey**：`tsconfig.noUncheckedIndexedAccess`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：4.1。开启后未证明存在的数组或索引签名读取会加入 `undefined`，迫使调用方收窄。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
~~~~

## 八、noUncheckedSideEffectImports

**officialKey**：`tsconfig.noUncheckedSideEffectImports`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/noUncheckedSideEffectImports.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`；**首次版本**：5.6。它检查 `import 'package-or-file'` 是否可解析；CSS 等资源应由准确的 ambient module 声明承接，而不是关闭检查。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noUncheckedSideEffectImports": true
  }
}
~~~~

## 九、noUnusedLocals

**officialKey**：`tsconfig.noUnusedLocals`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noUnusedLocals.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。它报告未读取的局部声明，适合与 lint 的风格规则分工。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noUnusedLocals": true
  }
}
~~~~

## 十、noUnusedParameters

**officialKey**：`tsconfig.noUnusedParameters`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/noUnusedParameters.html)。

**值域**：`boolean`；**7.0.2 默认**：`false`；**首次版本**：2.0。以下划线开头的参数可明确表达接口要求但实现不使用的意图。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "noUnusedParameters": true
  }
}
~~~~

## 十一、strict

**officialKey**：`tsconfig.strict`；**depth**：`detail`；[官方页面](https://www.typescriptlang.org/tsconfig/strict.html)。

**值域**：`true`；**7.0.2 默认**：`true`；**首次版本**：2.3。TypeScript 7.0 默认打开 strict 家族，不能再把旧 Website schema 的 `false` 当作当前默认。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strict": true
  }
}
~~~~

## 十二、strictBindCallApply

**officialKey**：`tsconfig.strictBindCallApply`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/strictBindCallApply.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：3.2。它让 `bind`、`call`、`apply` 的参数和返回值遵循原函数签名。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictBindCallApply": true
  }
}
~~~~

## 十三、strictBuiltinIteratorReturn

**officialKey**：`tsconfig.strictBuiltinIteratorReturn`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/strictBuiltinIteratorReturn.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：5.6。内置 iterator 的 `TReturn` 使用 `undefined` 而非 `any`，读取 `value` 前应检查 `done`。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictBuiltinIteratorReturn": true
  }
}
~~~~

## 十四、strictFunctionTypes

**officialKey**：`tsconfig.strictFunctionTypes`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：2.6。它更严格地检查函数参数变型；方法语法保留兼容性例外，不能据此外推所有 callable 成员。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictFunctionTypes": true
  }
}
~~~~

## 十五、strictNullChecks

**officialKey**：`tsconfig.strictNullChecks`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/strictNullChecks.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：2.0。`null` 与 `undefined` 成为独立类型，缺失值必须通过控制流或显式合同处理。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
~~~~

## 十六、strictPropertyInitialization

**officialKey**：`tsconfig.strictPropertyInitialization`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/strictPropertyInitialization.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：2.7。实例属性必须在声明、构造函数或可证明的路径初始化；`!` 只是开发者断言，不生成运行时赋值。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "strictPropertyInitialization": true
  }
}
~~~~

## 十七、useUnknownInCatchVariables

**officialKey**：`tsconfig.useUnknownInCatchVariables`；**depth**：`merged`；[官方页面](https://www.typescriptlang.org/tsconfig/useUnknownInCatchVariables.html)。

**值域**：`boolean`；**7.0.2 默认**：`true`（由 `strict` 启用）；**首次版本**：4.4。catch 变量为 `unknown`，读取属性前必须收窄，因为 JavaScript 可以抛出任意值。

**配置示例：**

~~~~jsonc
{
  "compilerOptions": {
    "useUnknownInCatchVariables": true
  }
}
~~~~

## 十八、完整严格模式配置示例

新项目先打开 strict，再显式补充不属于 strict 家族的索引、导入、override、控制流和未使用代码检查。

~~~~jsonc
{
  "compilerOptions": {
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUncheckedSideEffectImports": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictBindCallApply": true,
    "strictBuiltinIteratorReturn": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

迁移旧项目时逐类修复诊断，但目标配置应保持清晰；不要用大范围断言、非空断言或 any 伪装成已完成迁移。

## 十九、易错使用提示

不要为了迁移方便把 `strict` 整体关闭并长期遗留。应按诊断类别修正公共边界，必要的暂时例外要精确到单个选项或单行；`!`、类型断言和显式 `any` 都不能作为运行时验证。

## 二十、工作原理与适用边界

1. Website 快照提供 17 个键、说明与首次版本，7.0.2 固定源码和 7.0 发布文章裁决 strict 家族的新默认。
2. 新项目使用默认 strict，再按风险显式启用索引、side-effect import、override 与控制流检查。
3. 本页的默认值、诊断和配置示例均以 TypeScript 7.0.2 为准。

## 二十一、版本与官方来源

结论固定到 TypeScript `7.0.2`、源码 commit `2bd066d87f5bafd315be9f40889d0a60b9e58e0b` 和 Website commit `c8170c35bda4811c9516cbb69c39241ae4beb6d9`；新默认以 7.0 正式发布文章为准。
