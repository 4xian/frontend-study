# API 参考内容规范

> 版本：v2.0
> 状态：生效
> 适用范围：`src/categories/frontend/<technology>/<module>/reference/`

## 1. Reference 职责

Reference 用于准确查阅语法、类型、函数、配置和行为边界，不承担从零课程顺序。TypeScript 的语言
结构、类型操作符和 TSConfig，Vite 的配置与插件 interface，都属于 Reference，即使它们不是传统
运行时函数。

每个 Module 先冻结官方索引，再将条目划分为：

- `detail`：高频核心能力，提供完整心智模型、示例和必要 Demo。
- `merged`：多个紧密相关名称由一个主题页和独立锚点承接。
- `quick`：低频、类型或平台边界，提供准确说明和最小示例。

覆盖目标是全部官方稳定主题可搜索、可定位，不是每个名称一篇长文。Experimental、deprecated、
internal 和 restricted 范围必须与稳定分母分开。

## 2. 索引与文件

```text
src/categories/frontend/<technology>/<module>/manifest.ts
src/categories/frontend/<technology>/<module>/reference/<slug>.md
```

Module manifest 中的 Reference index 必须记录名称、官方 URL、覆盖深度、状态和目标。`available` 项
必须指向真实 Markdown 和唯一 heading anchor；`planned` 项不可点击，也不能保留伪 target。页面
导航、总览统计和搜索读取同一结构化 index。

Reference 分组只存在于 manifest，不增加 URL 层级。一个 Module 内的 Reference slug 必须唯一。

## 3. 元数据与固定章节

Reference frontmatter 使用 `type: reference`，并提供通用元数据、非空 `signature` 和完整 anchors。
推荐顺序：

1. 概述与选择建议。
2. 签名、语法或配置 interface。
3. 参数、泛型、返回值、默认值或配置结果。
4. 行为、时序、生命周期和环境边界。
5. 最小正确示例；确有观察价值时加入同源 Demo。
6. 易错使用提示。
7. 源码推导与适用场景。
8. 版本、官方来源和相关课程。

正文唯一的一级标题不编号。根级二级标题按文档内出现顺序使用 `一、`、`二、`、`三、`，根级三级
标题在每个二级标题下使用 `1.`、`2.`、`3.`，遇到新的二级标题后重新从 `1.` 计数。序号直接写入
Markdown 标题内容；代码块和 `pitfalls`、`exercise` 等 directive 内部的结构化标题不参与编号。
标题编号变更后，必须同步更新 Reference index 的站内目标锚点。

合并页为每个官方名称提供逐字可识别的 heading。heading 规范化后必须与 index target 一致，不能
依赖页面运行时猜测锚点。

## 4. 可复制骨架

~~~md
---
id: engineering.typescript.reference.types.example-operator
type: reference
title: Example Operator
summary: 说明该能力解决的问题和最重要边界
domain: frontend
technology: engineering
module: typescript
signature: type Example<T> = ...
related: []
tags:
  - TypeScript
appliesTo: TypeScript x.y
verifiedAt: YYYY-MM-DD
anchors:
  - 概述
  - 签名
  - 行为边界
  - 易错使用提示
  - 源码推导与适用场景
sources:
  - title: 官方 Reference
    url: https://example.com
---

# Example Operator

## 一、概述

先说明何时查阅和何时不使用。

## 二、签名

```ts
type Example<T> = ...
```

## 三、行为边界

说明参数、结果、版本和环境边界。

## 四、易错使用提示

:::pitfalls
### 错误：明确的错误名称

**触发条件：** 说明触发条件。

**原因：** 解释错误原因。

**后果：** 说明可观察后果。

**错误示例：**

```ts
// 错误示例
```

**正确写法：**

```ts
// 正确示例
```
:::

## 五、源码推导与适用场景

1. 官方事实。
2. 课程推导。
3. 适用边界。

## 六、参考资料

- [官方 Reference](https://example.com) - 说明支持的结论和版本。
~~~

## 5. 发布检查

- 官方冻结集合与结构化 index 双向差集为空，或每个差异都有明确状态。
- 每个 `available` 项的 Markdown、heading 和 anchor 真实存在且唯一。
- 根级二级、三级标题序号连续且符合父子层级，Reference index 指向编号后的真实锚点。
- `signature`、易错提示、推导/适用场景、来源、版本和核验日期完整。
- 纯类型和编译配置不创建无意义浏览器 Demo。
- 迁移只改变载体和新路径，不改变官方分母、覆盖状态或正文结论。
- 总览筛选、搜索别名、新深链、前后篇和移动端目录通过代表路径验证。
