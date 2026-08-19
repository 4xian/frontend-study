---
id: engineering.typescript.reference.project-config
type: reference
title: TypeScript Project Config Reference
summary: 查阅 tsconfig.json、项目引用、构建工具、watch 与 MSBuild 的项目级配置边界
domain: frontend
technology: engineering
module: typescript
group: project-config
signature: |-
  { "files": [], "references": [{ "path": "./packages/core" }] }
  tsc -b --verbose
related:
  - engineering.typescript.learn.advanced.tsconfig-layering
  - engineering.typescript.learn.advanced.package-exports
tags:
  - TypeScript
  - tsconfig.json
  - Project References
  - Build
appliesTo: TypeScript 7.0.2
verifiedAt: 2026-08-06
modernBaseline:
  typescript: 7.0.2
  typescriptSource: 2bd066d87f5bafd315be9f40889d0a60b9e58e0b
sources:
  - title: tsconfig.json
    url: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Compiler Options
    url: https://www.typescriptlang.org/docs/handbook/compiler-options.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Project References
    url: https://www.typescriptlang.org/docs/handbook/project-references.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Integrating with Build Tools
    url: https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Configuring Watch
    url: https://www.typescriptlang.org/docs/handbook/configuring-watch.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Compiler Options in MSBuild
    url: https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html
    sourceType: official-reference
    appliesTo: TypeScript 7.0.2
  - title: Announcing TypeScript 7.0
    url: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0
    sourceType: release-note
    appliesTo: TypeScript 7.0
  - title: TypeScript 7.0.2 tsconfig parser
    url: https://github.com/microsoft/typescript-go/blob/typescript/v7.0.2/internal/tsoptions/tsconfigparsing.go
    sourceType: source-code
    appliesTo: TypeScript 7.0.2
anchors:
  - 概述
  - 签名与语法
  - tsconfigjson
  - compiler-options
  - project-references
  - integrating-with-build-tools
  - configuring-watch
  - compiler-options-in-msbuild
  - 行为边界
  - 最小正确示例
  - 易错使用提示
  - 工作原理与适用边界
  - 版本与官方来源
---

# TypeScript Project Config Reference

## 一、概述

Project Config 的六个官方主题解释编译上下文、命令行配置、多项目构建、外部构建工具、watch host 和 MSBuild
映射。它们是项目级入口，不是 123 个 TSConfig option 的逐项 Reference；本页只说明选择关系和构建边界，
不重复计算页面中出现的 option。

## 二、签名与语法

根 solution 可以不包含源码，只用 `references` 连接 composite 子项目；`tsc -b` 根据依赖顺序检查并构建。

~~~~json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
~~~~

## 三、tsconfig.json

目录中的 `tsconfig.json` 定义 TypeScript 项目根和编译输入；`files` 明确列出 root files，`include` 用模式
补充 root files，`exclude` 只过滤 `include` 的匹配结果。被排除文件仍可由 `import`、`types`、三斜线引用或
`files` 进入程序。`compilerOptions` 调整编译行为，`extends` 复用基础配置，`references` 建立项目边。
直接运行 `tsc` 会向上寻找配置，指定 `--project` 时使用明确路径。TypeScript 7.0 在当前目录存在
`tsconfig.json` 时会拒绝同时传入源文件，确实要按文件列表忽略配置时必须显式传 `--ignoreConfig`。

选择建议是先让配置边界与发布或部署单元一致，再分层共享规则。solution 配置使用 `files: []` 可避免根目录
重复编译子项目源码。

~~~~jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"]
}
~~~~

## 四、Compiler Options

Compiler Options 可以来自 `tsconfig.json` 或 CLI。布尔 flag、带值 flag、枚举值和列表的命令行形态不同；
`tsc --showConfig` 可检查继承后的有效配置。CLI 适合一次性诊断，长期项目语义应登记在配置文件中。

本主题只解释 option interface 和配置入口。`module`、`target`、`strict` 等 123 个稳定键由 TSConfig
Reference 提供独立 target 和状态，不在本页重复展开。

~~~~sh
npx tsc --showConfig -p tsconfig.json
npx tsc --noEmit -p tsconfig.json
~~~~

## 五、Project References

Project References 让一个 TypeScript 项目引用其他项目。被引用项目需要 `composite`，并由声明输出提供跨项目
类型边界；引用方不应把被引用项目的全部源文件重新纳入自身编译。`tsc -b` 读取引用图，按依赖顺序构建过期项目。

~~~~json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "src",
    "outDir": "dist"
  }
}
~~~~

负例中引用一个未启用 `composite` 的项目应在 `tsc -p` 检查中得到 `TS6306`；启用后以同一
`tsc -p` 命令转绿。随后再用 `tsc -b` 构建完整引用图，确认 app 消费的是 core 的声明合同。

## 六、Integrating with Build Tools

官方页面列出 Browserify、Babel、Grunt、Gulp、Webpack 等集成入口。核心边界是明确由谁转译、谁做类型检查、
谁处理模块和资源：只转译的 loader 不能被当作完整类型检查，构建工具的模块解析也必须与 TypeScript 假设一致。

具体工具版本和插件选型变化较快，本项采用 quick 深度；具体 Vite、React 配置和 Demo 由对应模块承接。

例如把类型检查和资源构建拆成两个明确步骤，避免只做转译却遗漏类型诊断：

~~~~json
{
  "scripts": {
    "type-check": "tsc --noEmit -p tsconfig.json",
    "build": "npm run type-check && vite build"
  }
}
~~~~

## 七、Configuring Watch

TypeScript 7.0 重写了 watch mode，并使用 Parcel watcher 监听文件系统变化。固定 Website 页中的
`fs.watch`、`fs.watchFile` 和环境变量描述属于旧编译器实现；7.0.2 固定源码不解析或应用 `watchOptions`。
真实 watch 结果仍取决于 host、平台和文件系统。

watch 只说明重新检查的触发机制，不改变编译语义。CI 和发布仍应执行一次非 watch 的确定性构建。

~~~~sh
npx tsc --watch -p tsconfig.json
~~~~

## 八、Compiler Options in MSBuild

MSBuild 项目通过 `TypeScript*` 属性映射编译器选项，例如 `TypeScriptTarget`、`TypeScriptModuleKind` 和
`TypeScriptOutDir`。属性名称与可用值受 Visual Studio/MSBuild 集成版本约束，不能与 `tsconfig.json`
选项一一混用。

~~~~xml
<PropertyGroup>
  <TypeScriptTarget>ES2022</TypeScriptTarget>
  <TypeScriptModuleKind>ESNext</TypeScriptModuleKind>
</PropertyGroup>
~~~~

非 MSBuild 项目无需引入这些属性；本项只保留迁移与查阅边界。

## 九、行为边界

- 六个 Project Config officialKey 与 123 个 `tsconfig.*` officialKey 分开统计。
- `tsc -b` 的核心合同是引用图、composite 项目和声明边界，不等于任意 bundler 构建。
- watch 与 MSBuild 依赖 host 环境；浏览器内容页不能替代文件系统或构建 示例。
- 本页只采用 TypeScript 7.0.2 的配置加载、默认值和 watch 行为，不混入其他版本的实现差异。

## 十、最小正确示例

`app` 通过相对项目引用依赖 `core`，根 solution 只协调构建：

~~~~json
{
  "files": [],
  "references": [
    { "path": "./core" },
    { "path": "./app" }
  ]
}
~~~~

先用 `tsc -p` 检查每个子项目，再执行 `tsc -b --force --verbose`，确认 core 先于 app 构建且声明输出存在。

## 十一、从零建立基础配置与项目引用

共享配置只放通用检查规则，应用配置选择自己的模块环境；solution 根只描述引用图。

~~~~jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  }
}
~~~~

~~~~jsonc
// apps/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
~~~~

~~~~jsonc
// tsconfig.json
{
  "files": [],
  "references": [{ "path": "./apps/web" }]
}
~~~~

使用 npx tsc -b 检查引用图，使用项目自己的框架检查器处理额外文件类型。extends 不会自动继承 include/files/references，应在每个项目中明确声明输入。

## 十二、易错使用提示

:::pitfalls
### 引用项目却继续直接包含它的源码

**触发条件：** app 既声明 `references`，又用宽泛 `include` 把 core 源码纳入同一编译。

**原因：** 项目边界与文件输入边界不一致。

**后果：** 重复编译、`rootDir`/输出冲突，或无法证明声明边界真的可消费。

**错误示例：**

~~~~json
{ "include": ["../core/src", "src"], "references": [{ "path": "../core" }] }
~~~~

**正确写法：** app 只包含自身源码，通过 project reference 和 core 的声明输出取得类型。

~~~~json
{ "include": ["src"], "references": [{ "path": "../core" }] }
~~~~

**验证方式：** 清空构建输出后运行 `tsc -b --verbose`，检查构建顺序和各项目输出目录。
:::

## 十三、工作原理与适用边界

1. **工作原理：** `tsconfig.json` 定义项目，Project References 与 build mode 通过声明连接 composite 项目。
2. **实践建议：** 把构建图、类型边界和 bundler/host 职责分开，再用最小多项目 示例 验证。
3. **使用边界：** CLI 项目、monorepo 分层、watch 与 MSBuild 查阅；不展开任何独立 TSConfig option。

## 十四、版本与官方来源

本页的项目配置和构建行为以 TypeScript `7.0.2` 为准。

- [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Integrating with Build Tools](https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html)
- [Configuring Watch](https://www.typescriptlang.org/docs/handbook/configuring-watch.html)
- [Compiler Options in MSBuild](https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html)
- [TypeScript 7.0 发布说明](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0)
- [TypeScript 7.0.2 tsconfig parser](https://github.com/microsoft/typescript-go/blob/typescript/v7.0.2/internal/tsoptions/tsconfigparsing.go)
