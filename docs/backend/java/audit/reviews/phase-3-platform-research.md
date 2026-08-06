# Phase 3 平台依赖与 API 官方资料核验

> 核验日期：2026-08-05<br>
> 范围：仅核验 Markdown adapter 所需的平台依赖与 API，不包含任何 Java 课程知识点。<br>
> 结论性质：为 Phase 3 实施提供技术边界，不代表 Gate 3 已通过。

## 1. 结论摘要

1. 使用 `unified + remark-parse + remark-frontmatter + remark-gfm + remark-directive`
   生成 mdast；adapter 直接从 AST 转换为现有 `ContentEntry` / `ContentBlock[]`，不引入
   `remark-rehype`、任意 HTML 编译或 Vue 模板执行链路。
2. 采用 `processor.parse(source)` 后显式校验、转换的流水线。只有把校验器写成 unified
   transformer 时才继续调用 `run(tree, file)`；无 compiler 时不使用完整的 `process()`。
3. 四个 remark 插件只扩展语法或产出节点，不替项目解析 frontmatter 数据、执行 directive
   或保证业务 allowlist。`html` 节点、未知 AST 节点、未知 directive 名称和非法属性都应明确失败。
4. YAML 使用 `yaml@2` 的 `parseDocument()`，检查 `errors` 和 `warnings`，再以禁用 alias、merge、
   已知 YAML 1.1 显式标签的策略转为 JS 值；之后必须交给 Zod 校验，不能直接信任解析结果。
5. Zod 4 使用 `z.strictObject()` 和以 `type` 为判别字段的 `z.discriminatedUnion()`；所有嵌套
   业务对象也要各自 strict。使用 `safeParse()`，保留 `error.issues` 的 `code`、`path`、`message`。
6. Vite 使用带自定义 query 的 `import.meta.glob()` 选择课程 Markdown，保持默认懒加载；插件只在
   自己拥有的 query 上执行 `load`。Vite 8 / Rolldown 把 `.md` 转为 JS 时返回
   `{ code, moduleType: 'js' }`。
7. 当前 Shiki 已使用 fine-grained core 和 JavaScript regex engine；只需在现有 `langs` 中增加
   `import('@shikijs/langs/java')`。Java 的语言 ID 为 `java`，官方兼容表确认可使用现有 JS engine。

## 2. Unified / Remark AST 流水线

### 可采用的最小流水线

```ts
const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm, { singleTilde: false })
  .use(remarkDirective)

const tree = processor.parse(source)
const entry = convertMdastToContentEntry(tree, fileContext)
```

- unified 将处理过程分成 `parse -> run -> stringify`。`parse()` 只生成树，`run()` 才执行
  transformer，`process()` 执行完整三阶段并要求 parser 和 compiler。Phase 3 的产物是现有类型，
  不是 Markdown/HTML 字符串，因此 `parse()` 后调用项目 converter 最直接。
- `remark-parse` 默认支持 CommonMark；frontmatter、GFM、directive 都是显式扩展。
- `remark-frontmatter` 只生成 `yaml` 节点，节点值不含围栏；它不解析内部 YAML。保留默认的
  “只允许文档开头”，不要启用官方明确不推荐的 `anywhere`。
- `remark-gfm` 同时启用 autolink、footnote、strikethrough、table 和 task list。模板需要 table，
  但 converter 仍须逐类支持或拒绝其他新增节点。将 `singleTilde` 设为 `false` 可避免接受不符合
  GFM 规范的单波浪线删除线。
- `remark-directive` 只生成 `textDirective`、`leafDirective`、`containerDirective`，并提供
  `name`、`attributes`、`children`；它明确不会处理 directive。项目必须按节点种类、名称、属性
  和子节点建立 allowlist，不能把 `name` 直接当 HTML 标签或 Vue 组件名。
- mdast 规范包含 `html` 节点，并明确提示不当使用 HTML 会造成 XSS。由于 Gate 3 要求 fail closed，
  adapter 应在转换前拒绝所有 `html` 节点，而不是尝试透传或仅依赖下游清理。

官方来源：

- [unified processor 与 parse/run/process](https://unifiedjs.com/explore/package/unified/)
- [remark-parse：CommonMark 与语法扩展](https://github.com/remarkjs/remark/blob/main/packages/remark-parse/readme.md)
- [remark-frontmatter：节点与处理边界](https://github.com/remarkjs/remark-frontmatter/blob/main/readme.md)
- [remark-gfm：启用的 GFM 能力与选项](https://github.com/remarkjs/remark-gfm/blob/main/readme.md)
- [remark-directive：只解析、不处理 directive](https://github.com/remarkjs/remark-directive/blob/main/readme.md)
- [mdast-util-directive：三类 directive 节点结构](https://github.com/syntax-tree/mdast-util-directive/blob/main/readme.md)
- [mdast：Html 节点与安全边界](https://github.com/syntax-tree/mdast#security)

## 3. YAML 安全解析

推荐将 YAML 解析和业务 schema 校验分成两层：

```ts
const document = parseDocument(frontmatterValue, {
  version: '1.2',
  schema: 'core',
  strict: true,
  stringKeys: true,
  uniqueKeys: true,
  merge: false,
  resolveKnownTags: false,
})

if (document.errors.length || document.warnings.length) failImport()
const rawMeta = document.toJS({ maxAliasCount: 0 })
```

- `parseDocument()` 返回 `Document`，单独暴露 `errors` 和 `warnings`；还会把多文档输入记录为错误。
  在 `errors` 非空时，官方说明其内容很可能不完整或不正确，不能继续使用。
- YAML 2 默认已是 YAML 1.2、`core` schema、`strict: true`、`uniqueKeys: true`；这里显式写出是为了
  固化 authoring contract。`stringKeys: true` 拒绝非标量 mapping key。
- `resolveKnownTags` 默认会在 core schema 下继续识别 `!!timestamp`、`!!binary` 等 YAML 1.1
  显式标签；关闭它并且不注册 `customTags`，避免 frontmatter 产生合同外类型。`merge: false`
  明确禁止 YAML 1.1 merge key。
- `maxAliasCount: 0` 会禁止所有 alias；官方默认值 `100` 只是限制指数级展开，不等于禁止 alias。
  `toJS()` 仍可能因 alias 限制抛错，adapter 必须把该错误转换为稳定的导入失败。
- 官方明确提醒，特制输入仍可能通过栈溢出等方式造成资源耗尽。因此上述选项不能替代对单个
  Markdown/frontmatter 的合理字节数限制；限制值应由 Phase 3 实现合同另行冻结。

官方来源：

- [`yaml@2` Parse、Document、Schema 与 ToJS options](https://eemeli.org/yaml/#options)
- [`parseDocument()`、`errors` 与 `warnings`](https://eemeli.org/yaml/#documents)
- [`parse()` 的单文档与抛错语义](https://eemeli.org/yaml/#yaml-parse)

## 4. Zod 4 严格合同与错误

- 普通 `z.object()` 会静默剥离未知 key；这不满足非法 frontmatter 明确失败。顶层三种条目及其
  `modernBaseline`、`legacyBaseline`、`sources[]`、`projectEvidence[]` 等嵌套对象均应使用
  `z.strictObject()`。
- 用 `z.discriminatedUnion('type', [lessonSchema, referenceSchema, projectSchema])` 对应模板的
  三类合同。每个分支以 `z.literal()` 固定 `type`，分别要求 `estimatedMinutes`、`signature` 或
  `milestones` / `acceptance`，避免一个宽松对象兼容全部类型。
- `safeParse()` 返回以 `success` 判别的结果，不需要用异常控制正常的内容校验分支。失败时读取
  `error.issues`；每项的 `code`、`path`、`message` 可生成包含文件路径和字段路径的构建错误。
- 人类可读的汇总可使用 `z.prettifyError()`；机器或测试断言应优先保留结构化 `issues`，不要只
  匹配格式化后的整段文本。Zod 4 已移除旧的 `.errors` 别名。

官方来源：

- [Zod API：strictObject 与 discriminatedUnion](https://zod.dev/api)
- [Zod basic usage：safeParse 与 ZodError.issues](https://zod.dev/basics)
- [Zod 错误格式化 API](https://zod.dev/error-formatting)
- [Zod 4 迁移说明](https://zod.dev/v4/changelog)

## 5. Vite 8 plugin、query ID 与 `import.meta.glob`

- `import.meta.glob()` 的全部参数必须是字面量；pattern 只能是相对路径、项目根绝对路径或 alias。
  课程 loader 应在调用点写出固定目录 pattern，不能把动态字符串包装进通用函数。
- glob 默认生成懒加载函数并拆分 chunk；不要使用 `eager: true`，否则会预加载全部 Markdown
  正文。使用 `import: 'default'` 可让 loader 直接取得插件生成的默认 `ContentEntry`。
- `query` 选项会把自定义 query 附加到生成的模块 ID，官方明确支持“供其他插件消费”的 query。
  Phase 3 应使用唯一 query（例如 `?content-entry`），让 `load(id)` 只处理该 query，并在读取文件前
  只移除自己拥有的 query；不能以裸 `.md` 后缀吞掉仓库内所有 Markdown。
- 这些模块来自真实 `.md` 文件，不是虚拟模块；不需要 `virtual:` / `\0` ID，也不应套用会破坏
  真实文件 sourcemap 映射的虚拟模块约定。
- Vite 8 使用 Rolldown。`load` 将 `.md` 内容转换为 JavaScript 模块时，应返回
  `{ code, moduleType: 'js' }`；返回 `null` 表示不处理并交给后续 hook 或内置 loader。
- `import.meta.glob` 是 Vite 专有变换，不是 Web 或 ES 标准；相关 loader 测试必须在 Vite/Vitest
  环境运行，不能把原生 Node import 当成等价反馈环。

官方来源：

- [Vite Plugin API：load hook 与真实/虚拟模块边界](https://vite.dev/guide/api-plugin)
- [Vite Glob Import：literal、lazy、import 与 custom query](https://vite.dev/guide/features.html#glob-import)
- [Vite Rolldown integration：非 JS 文件的 moduleType](https://vite.dev/guide/rolldown)
- [Rolldown load hook 返回值](https://rolldown.rs/reference/Interface.FunctionPluginHooks#load)

## 6. Shiki Java 细粒度引入

- Shiki 的 `shiki/core` 不携带语言或主题；fine-grained bundle 通过
  `@shikijs/langs/<language>` 和 `@shikijs/themes/<theme>` 逐项组合。
- 当前仓库已经采用 `createHighlighterCore()`、动态 grammar import 和单例复用。最小改动是在
  现有 `langs` 数组追加 `import('@shikijs/langs/java')`，并保持现有主题、engine、fallback 和
  `highlight()` 接口不变；当前安装的 Shiki 4.3.1 已导出该子路径。
- 官方语言表给出的 Java ID 是 `java`；JavaScript regex engine 兼容表将 `java` 标记为可用，
  因此没有证据要求改用 Oniguruma/WASM。
- `createHighlighterCore()` 会加载传入的语言和主题。后续若改成运行时增量语言加载，应另行设计，
  不能把“使用动态 import 语法”误写成“初始化时只加载本次 code block 所需语言”。

官方来源：

- [Shiki fine-grained bundle](https://shiki.style/guide/bundles#fine-grained-bundle)
- [Shiki bundled languages 与 Java ID](https://shiki.style/languages)
- [Shiki JavaScript regex engine 兼容表](https://shiki.style/references/engine-js-compat)
- [Shiki 官方 langs package exports](https://github.com/shikijs/shiki/blob/main/packages/langs/package.json)

## 7. 依赖与实施边界

- Phase 3 需要将 `unified`、`remark-parse`、`remark-frontmatter`、`remark-gfm`、
  `remark-directive`、`yaml`、`zod` 声明为直接运行依赖；不能依赖 lockfile 中偶然存在的传递依赖。
- `shiki` 已是直接依赖，无需为 Java grammar 增加第二个高亮包。
- 本轮未核验、也不建议因本任务引入 MDX、rehype HTML 编译、Vue SFC 编译或任意模板执行能力。
- 本轮只完成平台 API 研究；没有修改 Phase 3 实现、依赖清单、课程正文或任何 Java 知识点。
