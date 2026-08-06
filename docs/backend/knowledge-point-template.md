# 后端知识点 Markdown 模板

> 版本：v2.0
> 状态：生效
> 适用范围：`src/categories/backend/<technology>/<module>/learn|reference/`
> 来源规则：[`research-source-standard.md`](./research-source-standard.md)
> 实施计划：[`dzzz-app-course-plan.md`](./java/dzzz-app-course-plan.md)

## 1. 使用规则

后端课程和 Reference 使用 Markdown 作为唯一正文来源，通过 `common/markdown` 的统一 adapter
转换为站内内容接口，继续复用技术中心的目录、搜索、详情页、进度和受控内容块。

每个文件只讲一个主要知识点，文件路径固定为：

```text
src/categories/backend/<technology>/<module>/<content-type>/<topic>.md
```

Java 学习课程示例：

```text
src/categories/backend/java/core/learn/classes-and-objects.md
```

稳定 ID 使用以下顺序，不从标题自动生成：

```text
保留现有稳定 ID，不根据新目录重新生成
```

示例：`backend.java.learn.basics.classes-and-objects`。

## 2. Frontmatter 合同

### 2.1 必填字段

| 字段 | 规则 |
| --- | --- |
| `id` | 全局稳定、小写、点分隔，必须与 manifest 一致 |
| `type` | `lesson` 或 `reference` |
| `title` | 面向学习者的具体知识点名称 |
| `summary` | 一句话说明学完能解决什么问题 |
| `domain` | 固定为 `backend` |
| `technology` | 当前为 `java`，未来可经调研增加 `go` 等 |
| `module` | Java 当前课程归入 `core`；其他模块必须由路线单独确认 |
| `stage` | 学习课程使用 `basics`、`intermediate`、`advanced`，不进入 URL |
| `level` | `beginner`、`intermediate` 或 `advanced` |
| `prerequisites` | 前置课程稳定 ID；没有时使用空数组 |
| `related` | 关联课程稳定 ID；没有时使用空数组 |
| `tags` | 用于检索的稳定术语，不堆叠同义词 |
| `appliesTo` | 面向学习者展示的适用版本摘要，映射到现有 `ContentMeta.appliesTo` |
| `modernBaseline` | 本文现代主线使用的精确版本 |
| `legacyBaseline` | 项目补充使用的精确版本；不适用时为空对象 |
| `verifiedAt` | 本批次实际核验日期，格式为 `YYYY-MM-DD` |
| `sources` | 实际支持正文结论的来源卡 |
| `projectEvidence` | `dzzz-app` 证据；纯前置知识可为空数组 |

### 2.2 来源类型

`sourceType` 只允许使用：

```text
specification
api-doc
official-reference
release-note
source-code
official-test
security-standard
static-analysis
engineering-reference
project-source
```

### 2.3 项目证据状态

`usage` 只允许使用：`observed`、`adapted`、`corrected`、`rejected`。含义以
[`research-source-standard.md`](./research-source-standard.md) 为准。

### 2.4 类型化字段与统一内容接口映射

通用 frontmatter 的 `id`、`type`、`title`、`summary`、`domain`、`technology`、`module`、
`stage`、`level`、`prerequisites`、`related`、`tags`、`appliesTo` 和 `verifiedAt` 直接映射到统一
内容元数据。`sources` 中的 `sourceType`、`appliesTo` 和 `claims` 由 adapter 保留为来源详情，不得
在转换时静默丢失。

两类正文必须分别满足统一内容接口：

| `type` | 额外必填内容 | 转换结果 |
| --- | --- | --- |
| `lesson` | `estimatedMinutes`；“学习目标”列表 | `LessonEntry.meta.estimatedMinutes`、`objectives`、`blocks`，练习和小结分别映射为 `exercises`、`recap` |
| `reference` | `signature`；没有代码签名的概念使用明确的检索签名 | `ReferenceEntry.signature`、`blocks`，标题生成 `meta.anchors` |

adapter 必须按 `type` 分支校验，不能用一个宽松对象同时兼容两类正文。`modernBaseline`、
`legacyBaseline` 和 `projectEvidence` 属于后端扩展元数据；`projectEvidence` 只表示 `dzzz-app` 源码
证据，不是第三种站内内容。扩展字段必须可显示、可检索，且不能建立第二套详情接口。

## 3. 标准模板

以下模板是后端知识点的 authoring interface。标记为“可选”的章节在不适用时直接删除，禁止保留
空标题或填充无意义内容。

~~~md
---
id: backend.java.learn.basics.classes-and-objects
type: lesson
title: Java 类与对象
summary: 使用类描述数据和行为，并通过对象承载运行时状态
domain: backend
technology: java
module: core
stage: basics
level: beginner
estimatedMinutes: 30
prerequisites: []
related: []
tags:
  - Java
  - 类
  - 对象
appliesTo: Java 25；dzzz-app 补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE
modernBaseline:
  java: "25"
legacyBaseline:
  java: "8"
  springBoot: "2.3.12.RELEASE"
verifiedAt: YYYY-MM-DD
sources:
  - id: jls-classes
    title: Java Language Specification - Classes
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html
    sourceType: specification
    appliesTo: Java 25
    claims:
      - 类声明、字段和方法的语言规则
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/示例路径.java
    symbol: ExampleClass
    usage: corrected
---

# Java 类与对象

## 为什么需要学习

用零基础学习者能够理解的场景说明本知识点解决什么问题，以及它在后端请求、业务对象或数据访问
中的作用。不要先堆术语。

## 学习目标

- 能用自己的话解释本知识点。
- 能阅读最小示例。
- 能在限定场景中正确使用。
- 能识别本节列出的常见错误。

## 前置术语

只解释本节立即需要的术语。已由前置课程讲过的内容使用链接，不重复整段说明。

## 现代版本中的正确用法

先讲当前稳定基线下的概念、规则和心智模型。关键结论使用直接来源链接，区分语言规则、API 合同
和工程建议。

## 基本语法

说明语法组成、各部分职责和运行结果。

```java
public final class UserProfile {
    private final String displayName;

    /**
     * 创建用户资料。
     */
    public UserProfile(String displayName) {
        this.displayName = displayName;
    }

    /**
     * 返回展示名称。
     */
    public String getDisplayName() {
        return displayName;
    }
}
```

## 如何使用

按实际执行顺序说明使用步骤。步骤不应只是重复代码。

## 适用与不适用场景

说明什么时候使用、什么时候不使用，以及做出选择时最重要的判断条件。

:::tip
写一条有来源或项目证据的开发技巧，同时标明适用条件和权衡。
:::

## 当前项目补充（可选）

说明该知识点在 `dzzz-app` 中的文件、稳定符号、调用位置和业务作用。只保留理解知识点所需的
最小背景，不复制大段业务代码。

## Java 8 / Spring Boot 2.3 兼容写法（可选）

使用经过纠正的项目场景示例。明确它是兼容旧项目的实现，不把旧版本限制包装成现代推荐方式。

```java
public final class LegacyCompatibleExample {
    /**
     * 执行兼容 Java 8 的示例行为。
     */
    public void execute() {
        // 仅保留与知识点有关的实现。
    }
}
```

## 新旧版本差异（可选）

| 对比项 | 现代稳定版本 | `dzzz-app` 版本 | 迁移注意 |
| --- | --- | --- | --- |
| 示例能力 | 当前行为 | 旧版行为 | 需要调整的地方 |

## 易错点

:::pitfalls
### 错误：使用明确、可检索的错误名称

**触发条件：** 什么情况下会发生。

**原因：** 规范、API 或框架层面的原因。

**后果：** 编译错误、运行异常、数据错误、安全问题或维护成本。

**错误示例：**

```java
// 明确标记为错误示例，不得与推荐代码混排。
```

**正确写法：**

```java
// 展示最小、可验证的修正方式。
```

**验证方式：** 编译、最小测试、日志、静态分析或官方测试证据。
:::

## 错误与正确写法对比（可选）

:::compare
### 错误写法

```java
// 错误示例
```

### 正确写法

```java
// 正确示例
```
:::

## 安全注意（可选）

仅在存在实际安全语义时添加。说明威胁、输入边界、影响版本、正确控制和安全来源。

## 性能注意（可选）

只记录经过测量的结论，附 JDK、依赖、硬件、参数、负载和结果。没有测量时说明如何使用
JFR/JMC/JMH 验证，不给出“更快”的断言。

## 如何验证

给出最小反馈环。纯语法可以使用临时编译输入；框架行为需要精确版本的临时行为检查；所有验证资产均
位于 `/tmp` 的 `mktemp` 目录并在完成后删除，项目补充不得以人工阅读代替可执行验证。

:::exercise
### 练习：用动作描述练习目标

**要求：** 只覆盖本知识点，不引入尚未学习的大型框架能力。

**验收：** 给出可以自行判断对错的结果。

**参考答案：** 默认折叠；答案同样遵守现代主线优先和方法中文注释规则。
:::

## 本节小结

- 规则一。
- 规则二。
- 需要避免的主要错误。

## 参考资料

- [直接页面标题](https://example.com/direct-page) - 支持哪条结论，适用于什么版本。
~~~

## 4. 必需章节与可选章节

| 章节 | 要求 |
| --- | --- |
| 为什么需要学习 | 必需 |
| 学习目标 | 必需 |
| 前置术语 | 必需；没有新术语时用一句话链接前置课程 |
| 现代版本中的正确用法 | 必需 |
| 基本语法或核心接口 | 必需 |
| 如何使用 | 必需 |
| 适用与不适用场景 | 必需 |
| 当前项目补充 | 有 `dzzz-app` 证据时必需 |
| 旧版兼容写法 | 现代写法与项目版本存在差异时必需 |
| 新旧版本差异 | 存在可学习差异时必需 |
| 易错点 | 必需；资料不足时宁缺毋滥，不凑数量 |
| 安全注意 | 存在安全边界时必需 |
| 性能注意 | 有测量或明确验证方法时添加 |
| 如何验证 | 必需 |
| 练习 | `lesson` 必需，`reference` 可选 |
| 本节小结 | 必需 |
| 参考资料 | 必需 |

## 5. 内容块约定

统一 Markdown adapter 需要把以下受控语法转换为内容块，禁止在课程中嵌入任意 Vue 模板或执行
任意 HTML：

| Markdown 写法 | 目标内容块 |
| --- | --- |
| 标题 | `heading` |
| 普通段落和列表 | `text` |
| fenced code | `code` |
| Markdown 表格 | `table` |
| `:::tip` | `tip`，`style: info` |
| `:::warning` | `tip`，`style: warning` |
| `:::pitfalls` | `pitfalls` |
| `:::compare` | `compare` |
| `:::exercise` | `exercise` |
| `:::steps` | `steps` |
| `:::demo` | `demo`；只允许 manifest 中登记的完整 ID |
| `:::interactive` | `interactive`；只允许 registry 中登记的完整 ID |

解析必须先得到受控 AST 或统一内容块，不得直接把未经清理的 Markdown HTML 交给 `v-html`。

## 6. 示例代码规则

1. 现代示例必须使用当前知识点所需的最少代码，并能够独立编译或通过临时反馈环。
2. 旧版示例必须在 Java 8 或对应旧框架环境验证。
3. 伪代码必须在代码块前明确标记，不能使用看似可编译的完整类名误导学习者。
4. 每个方法定义上方写简洁、规范的中文注释。
5. 不使用真实密钥、内网地址、手机号、案件信息、数据库配置或其他敏感数据。
6. 项目示例优先保留业务意图，不保留与知识点无关的超长参数、工具调用和异常吞噬。
7. 错误示例只能出现在 `pitfalls` 或 `compare` 中，并明确说明错误原因和后果。
8. 不为了展示“高级”写法引入尚未讲解的抽象、设计模式或第三方库。

## 7. Authoring Gate

- [ ] 新路径、稳定 ID、module manifest 和 frontmatter 一致。
- [ ] 必填字段完整，版本与核验日期明确。
- [ ] 现代内容在前，项目旧版补充在后。
- [ ] 关键结论满足来源等级要求。
- [ ] `projectEvidence` 只指向 `dzzz-app`。
- [ ] 项目示例已去敏，并标记 `adapted` 或 `corrected`。
- [ ] 必需章节完整，可选章节没有空壳。
- [ ] 代码块语言、方法中文注释和可编译状态符合规则。
- [ ] 易错点包含触发条件、原因、后果、修正和验证方式。
- [ ] 安全与性能内容达到额外证据门槛。
- [ ] 统一 Markdown adapter、Catalog、格式和最小页面验证通过。
