# TypeScript 官方覆盖矩阵

> 冻结日期：2026-08-05
> 语言基线：TypeScript `7.0.2`
> 源码：`typescript/v7.0.2` / `2bd066d87f5bafd315be9f40889d0a60b9e58e0b`
> 文档：`TypeScript-Website` / `c8170c35bda4811c9516cbb69c39241ae4beb6d9`
> 状态：课程 `16/24`，稳定 Reference `0/200 planned`，T2-2 已完成，等待用户确认 T3-1

## 1. 统计口径

“官方项”是固定官方快照中的主题页或具名配置/类型键，不等于站内文件数。多个紧密相关官方项可以由
一个 `merged` 页面和独立 heading 承接；`quick` 也必须可搜索、可深链并有官方来源。

稳定分母为 `200`：

| 稳定集合 | 官方键数 | 计算规则 |
| --- | ---: | --- |
| Handbook v2 | 16 | 18 个 Markdown，排除 2 个 landing/navigation |
| General Reference | 12 | 15 个 Markdown，排除 deprecated Advanced Types、legacy Decorators 和由 22 个子项替代的 Utility Types 父页 |
| Utility Types | 22 | 官方页的 22 个具名 utility type |
| Declaration Files | 15 | 8 个理论/指南 + 7 个 `.d.ts` template |
| Modules Reference | 5 | 排除 diagram 辅助文件 |
| Project Config | 6 | 固定目录全部 6 页 |
| TSConfig | 124 | 137 个路径键 - 9 个 legacy-only - 2 个 7.0 unsupported - 2 个 legacy experimental |
| **合计** | **200** | `16 + 12 + 22 + 15 + 5 + 6 + 124` |

每个键在实现时记录 `officialKey`、官方 URL、`detail | merged | quick`、状态、`appliesTo`、
`verifiedAt` 和真实 target。稳定、观察与受限集合不相加成一个完成率。

## 2. Handbook v2：16 项

候选目标前缀为 `engineering.typescript.reference.language.*`。默认 `detail`；“错误理解”“类型声明”和
基础模块语法可 `merged`。状态均为 `stable`，适用 `TypeScript 7.0.2`，核验日期均为 2026-08-05。

| 官方项与 URL | 候选目标 | 深度 |
| --- | --- | --- |
| [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) | `language.basics` | `detail` |
| [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) | `language.everyday-types` | `detail` |
| [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) | `language.narrowing` | `detail` |
| [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) | `language.functions` | `detail` |
| [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) | `language.object-types` | `detail` |
| [Type Declarations](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html) | `language.type-declarations` | `merged` |
| [Understanding Errors](https://www.typescriptlang.org/docs/handbook/2/understanding-errors.html) | `language.understanding-errors` | `merged` |
| [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) | `language.classes` | `detail` |
| [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) | `language.modules` | `merged` |
| [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) | `operators.generics` | `detail` |
| [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) | `operators.keyof` | `detail` |
| [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) | `operators.typeof` | `detail` |
| [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) | `operators.indexed-access` | `detail` |
| [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) | `operators.conditional-types` | `detail` |
| [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) | `operators.mapped-types` | `detail` |
| [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) | `operators.template-literal-types` | `detail` |

不计入分母的两个源文件是 `The Handbook.md` 和
`Type Manipulation/_Creating Types from Types.md`；它们是 landing/navigation，不创建重复 Reference。

## 3. General Reference：12 项

状态均为 `stable`，适用 `TypeScript 7.0.2`，核验日期 2026-08-05。高频语义为 `detail`，历史或平台
边界为 `merged/quick`。

| 官方项与 URL | 候选目标 | 深度 |
| --- | --- | --- |
| [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) | `language.declaration-merging` | `detail` |
| [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) | `language.enums` | `merged` |
| [Iterators and Generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html) | `language.iterators-generators` | `quick` |
| [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) | `platform.jsx` | `detail` |
| [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) | `patterns.mixins` | `quick` |
| [Namespaces and Modules](https://www.typescriptlang.org/docs/handbook/namespaces-and-modules.html) | `modules.namespaces-and-modules` | `merged` |
| [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) | `modules.namespaces` | `quick` |
| [Symbols](https://www.typescriptlang.org/docs/handbook/symbols.html) | `language.symbols` | `quick` |
| [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) | `modules.triple-slash-directives` | `quick` |
| [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) | `language.type-compatibility` | `detail` |
| [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html) | `language.type-inference` | `detail` |
| [Variable Declarations](https://www.typescriptlang.org/docs/handbook/variable-declarations.html) | `language.variable-declarations` | `merged` |

`Advanced Types` 为 deprecated，`Decorators` 页描述 legacy experimental decorators，均进入第 9 节。
Utility Types 父页由下一节 22 个 heading 键替代，避免父项与子项双计数。

## 4. Utility Types：22 项

官方 URL 均为 [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) 对应具名 heading；
候选目标为 `engineering.typescript.reference.utility-types.<group>#<name>`。状态均为 `stable`，适用
TypeScript `7.0.2`，核验日期 2026-08-05。

| 分组 | 官方项 | 候选深度 |
| --- | --- | --- |
| 对象形状 | `Partial`、`Required`、`Readonly`、`Record`、`Pick`、`Omit` | `detail` 或同页 `merged`，每项独立 anchor |
| 联合过滤 | `Exclude`、`Extract`、`NonNullable` | `detail/merged` |
| 函数与构造 | `Parameters`、`ConstructorParameters`、`ReturnType`、`InstanceType` | `merged` |
| 推导控制 | `Awaited`、`NoInfer` | `detail` |
| `this` | `ThisParameterType`、`OmitThisParameter`、`ThisType` | `merged` |
| 字符串 intrinsic | `Uppercase`、`Lowercase`、`Capitalize`、`Uncapitalize` | `quick`，四项独立 anchor |

`Intrinsic String Manipulation Types` 是分组标题，不额外计数。

## 5. Modules Reference：5 项

状态均为 `stable`，适用 `TypeScript 7.0.2`，核验日期 2026-08-05。

| 官方项与 URL | 候选目标 | 深度 |
| --- | --- | --- |
| [Introduction](https://www.typescriptlang.org/docs/handbook/modules/introduction.html) | `modules.introduction` | `merged` |
| [Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html) | `modules.theory` | `detail` |
| [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) | `modules.choosing-compiler-options` | `detail` |
| [Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) | `modules.reference` | `detail` |
| [ESM/CJS Interoperability](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html) | `modules.esm-cjs-interop` | `detail` |

## 6. Declaration Files：15 项

状态均为 `stable`，适用 `TypeScript 7.0.2`，核验日期 2026-08-05。总览页使用 `detail/merged`，模板页
默认 `merged` 并保留独立 anchor。

| 分组 | 官方项与 URL | 候选目标 |
| --- | --- | --- |
| 理论/指南 | [Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)、[By Example](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)、[Library Structures](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html)、[Templates](https://www.typescriptlang.org/docs/handbook/declaration-files/templates.html) | `declarations.foundations` |
| 质量与发布 | [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)、[Deep Dive](https://www.typescriptlang.org/docs/handbook/declaration-files/deep-dive.html)、[Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)、[Consumption](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html) | `declarations.authoring-publishing` |
| Module templates | [module](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html)、[module-class](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-class-d-ts.html)、[module-function](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-function-d-ts.html)、[module-plugin](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-plugin-d-ts.html) | `declarations.module-templates` |
| Global templates | [global](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-d-ts.html)、[global-plugin](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-plugin-d-ts.html)、[global-modifying-module](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html) | `declarations.global-templates` |

## 7. Project Config：6 项

状态均为 `stable`，核验日期 2026-08-05。适用版本按页面分别标注，7.0 发生变化的配置必须同时引用
7.0 发布文章。

| 官方项与 URL | 候选目标 | 深度 |
| --- | --- | --- |
| [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) | `config.tsconfig-json` | `detail` |
| [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) | `config.compiler-options` | `merged` |
| [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) | `config.project-references` | `detail` |
| [Integrating with Build Tools](https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html) | `config.build-tools` | `quick` |
| [Configuring Watch](https://www.typescriptlang.org/docs/handbook/configuring-watch.html) | `config.watch` | `merged` |
| [Compiler Options in MSBuild](https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html) | `config.msbuild` | `quick` |

## 8. TSConfig：124 个稳定路径键

固定 Website 快照含 135 个顶层 option Markdown 和 2 个 Type Acquisition 子项，共 137 个路径键。
TypeScript 7.0.2 `tsc --help --all` 暴露 137 个唯一 CLI 名称；两侧交集为 118 个顶层名称。另有 8 个合法
顶层/Type Acquisition 配置键和 2 个嵌套键不作为 CLI option 展示。

稳定路径键按下式得到：

```text
137 Website paths
- 9 Website-only legacy keys
- 2 options unsupported by TypeScript 7.0
- 2 legacy experimental decorator keys
= 124 stable TSConfig paths
```

官方 URL 规则：普通 key 使用 `https://www.typescriptlang.org/tsconfig/<key>.html`；顶层
`files/extends/include/exclude/references` 和 `typeAcquisition.*` 使用
[TSConfig Reference](https://www.typescriptlang.org/tsconfig) 对应 heading。候选目标是
`engineering.typescript.reference.tsconfig.<category>#<key>`。状态均为 `stable`，适用 `7.0.2`，核验日期
2026-08-05。

完整稳定键如下；此清单是 TA index 的输入，不表示一键一篇长文：

```text
allowArbitraryExtensions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports,
allowUmdGlobalAccess, allowUnreachableCode, allowUnusedLabels, alwaysStrict,
assumeChangesOnlyAffectDirectDependencies, checkJs, clean, composite, customConditions, declaration,
declarationDir, declarationMap, diagnostics, disableFilenameBasedTypeAcquisition,
disableReferencedProjectLoad, disableSizeLimit, disableSolutionSearching,
disableSourceOfProjectReferenceRedirect, emitBOM, emitDeclarationOnly, enable, erasableSyntaxOnly,
esModuleInterop, exactOptionalPropertyTypes, exclude, excludeDirectories, excludeFiles, explainFiles,
extendedDiagnostics, extends, fallbackPolling, files, force, forceConsistentCasingInFileNames,
generateCpuProfile, generateTrace, importHelpers, include, incremental, inlineSourceMap, inlineSources,
isolatedDeclarations, isolatedModules, jsx, jsxFactory, jsxFragmentFactory, jsxImportSource, lib,
libReplacement, listEmittedFiles, listFiles, locale, mapRoot, maxNodeModuleJsDepth, module,
moduleDetection, moduleResolution, moduleSuffixes, newLine, noCheck, noEmit, noEmitHelpers,
noEmitOnError, noErrorTruncation, noFallthroughCasesInSwitch, noImplicitAny, noImplicitOverride,
noImplicitReturns, noImplicitThis, noLib, noPropertyAccessFromIndexSignature, noResolve,
noUncheckedIndexedAccess, noUncheckedSideEffectImports, noUnusedLocals, noUnusedParameters, outDir,
outFile, paths, plugins, preserveConstEnums, preserveSymlinks, preserveWatchOutput, pretty,
reactNamespace, references, removeComments, resolveJsonModule, resolvePackageJsonExports,
resolvePackageJsonImports, rewriteRelativeImportExtensions, rootDir, rootDirs, skipDefaultLibCheck,
skipLibCheck, sourceMap, sourceRoot, stopBuildOnErrors, strict, strictBindCallApply,
strictBuiltinIteratorReturn, strictFunctionTypes, strictNullChecks, strictPropertyInitialization,
stripInternal, synchronousWatchDirectory, target, traceResolution, tsBuildInfoFile, typeAcquisition,
typeAcquisition.exclude, typeAcquisition.include, typeRoots, types, useDefineForClassFields,
useUnknownInCatchVariables, verbatimModuleSyntax, verbose, watchDirectory, watchFile
```

深度分配规则：`strict`、`module`、`moduleResolution`、`target`、`lib`、`types`、`paths`、`rootDir`、
`declaration`、`composite`、`references`、`isolatedModules`、`isolatedDeclarations`、
`verbatimModuleSyntax`、`jsx`、`noEmit`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、
`noUncheckedSideEffectImports` 为 `detail`；同一 category 内有行为关系的选项为 `merged`；其余为
`quick`。每个 `quick` 仍保留自己的 anchor、URL、版本和值域，不能只链接分类首页。

## 9. 观察、受限与历史范围

这些范围必须在 index 中登记，但不计入稳定 `200` 分母。

| 范围 | 数量/项 | 状态与处理 |
| --- | --- | --- |
| Handbook landing/navigation | 2 | `The Handbook`、`Creating Types from Types`；navigation，不建重复正文 |
| General Reference | 2 | `Advanced Types` 为 deprecated；[Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) 为 legacy experimental |
| Website-only legacy TSConfig | 9 | `charset`、`importsNotUsedAsValues`、`keyofStringsOnly`、`noImplicitUseStrict`、`noStrictGenericChecks`、`out`、`preserveValueImports`、`suppressExcessPropertyErrors`、`suppressImplicitAnyIndexErrors`；deprecated/removed quick |
| 7.0 unsupported options | 2 | `baseUrl`、`downlevelIteration`；迁移 quick，不进入稳定 option |
| Legacy decorator options | 2 | `experimentalDecorators`、`emitDecoratorMetadata`；experimental/legacy |
| 7.0 CLI-only | 19 | `all`、`build`、`builders`、`checkers`、`deduplicatePackages`、`dry`、`help`、`ignoreConfig`、`init`、`listFilesOnly`、`pprofDir`、`project`、`quiet`、`showConfig`、`singleThreaded`、`stableTypeOrdering`、`version`、`watch`、`watchInterval`；按 tooling quick/experimental 登记 |
| Release Notes | 48 页 | 1.1、1.3 至 6.0；历史索引，不计稳定 Reference；7.0 使用正式发布文章 |
| 标准库声明 | 108 个 `.d.ts` | 95 个稳定候选、12 个 `lib.esnext.*` 观察、1 个 legacy decorators；按平台主题合并，不逐文件建文 |
| Compiler API | 1 组 | 7.0 无 programmatic API；旧 Wiki 仅适用 6.0 compatibility，`restricted` |
| Language Service API | 1 组 | 旧 JavaScript API 不等于 7.0 LSP，`restricted` |
| tsserver / LS plugin | 2 组 | 旧 interface 观察；等待 7.1 新 API 后重新冻结 |
| prerelease | Beta、RC、`typescript@next` | 不计稳定分母；nightly 不用于生产结论 |

7.0 的值级边界另行保留：`target: es5`，`moduleResolution: node/node10/classic`，
`module: amd/umd/systemjs/none`，以及 `esModuleInterop`、`allowSyntheticDefaultImports`、`alwaysStrict` 的
`false` 值均不再支持。它们不减少仍然有效的父 option key 数量，但必须在对应 Reference 中明确。

## 10. JSX、DOM、标准库与工具 interface 策略

1. JSX 作为 12 个 General Reference 之一进入稳定分母；只解释 TypeScript 的 JSX 语法、namespace 和
   配置，不提前教授 React。
2. DOM、WebWorker、ScriptHost 和 ES 标准库从
   [7.0.2 固定声明目录](https://github.com/microsoft/typescript-go/tree/typescript/v7.0.2/internal/bundled/libs)
   核验。按 `lib` 配置、平台全局、可迭代补丁和环境冲突主题合并，不把 108 个文件变成 108 篇文章。
3. `lib.esnext.*`、Temporal 等未来标准声明保持观察；`decorators.legacy` 与稳定 decorators 分开。
4. 7.0 Compiler API、旧 Language Service API 和 plugin API 不存在稳定等价关系；TA 只提供边界页和
   6.0 compatibility 指引，等 7.1 稳定 API 发布后重开调研。

## 11. 双向差集与维护

TA manifest 必须保存与本文同名的 200 个稳定 `officialKey`。每批运行：

```text
officialStable - manifestKeys = []
manifestKeys - officialStable = []
availableTargets - realEntryAnchors = []
realEntryAnchors - declaredTargets = []
```

官方新版本发布时先建立独立维护计划，重新固定源码与 Website commit，再比较路径、状态和值级差异。
不得直接改总数。Gate T 关闭后，本文件只保留最终统计、固定版本和维护规则；T0 临时计划按规范删除。
