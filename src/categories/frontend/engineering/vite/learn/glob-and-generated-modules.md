---
id: engineering.vite.learn.intermediate.glob-and-generated-modules
type: lesson
title: import.meta.glob、动态导入与生成模块
summary: 以编译期可分析的 glob 建立懒加载映射，并理解字面量限制。
domain: frontend
technology: engineering
module: vite
stage: intermediate
level: intermediate
estimatedMinutes: 36
prerequisites:
  - engineering.vite.learn.intermediate.proxy-and-cross-origin
related:
  - engineering.vite.reference.features-assets-env
tags:
  - import.meta.glob
  - 生成模块
  - 懒加载
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能用 glob 创建懒加载或 eager 映射。
  - 能解释字面量 pattern、import 和 query 选项。
sources:
  - title: Glob Import
    url: https://vite.dev/guide/features#glob-import
    sourceType: official-reference
---

# import.meta.glob、动态导入与生成模块

## 一、学习目标

- 建立只加载匹配 Markdown 元数据的模块映射。
- 选择 lazy/eager、named import 和 query，而不引入无关正文。

## 二、为什么需要

目录驱动内容需要可分析的文件集合，但运行时扫描文件系统不可部署。`import.meta.glob` 在构建时展开
为明确 import 映射，既能懒加载，也能选择导出。

## 三、核心概念

glob pattern 必须是字面量；默认值是返回动态 import 函数的映射；`eager` 生成静态 import；`import`
选择命名导出；`query` 将资源查询传给插件。

## 四、分步使用

1. 用字面量 pattern 匹配两份模块。
2. 调用一个 lazy loader 并观察单独请求。
3. 改用 eager/named import，比较 build 输出。
4. 增加否定 pattern，排除测试或草稿目录。

## 五、批量导入模块

import.meta.glob 的 pattern 必须是字面量，返回值默认是按需加载函数：

~~~~ts
const lessonModules = import.meta.glob('./lessons/*.ts')

for (const [path, load] of Object.entries(lessonModules)) {
  console.log(path)
  load().then((module) => console.log(module))
}
~~~~

需要在启动时一次导入全部模块时使用 eager：

~~~~ts
const lessonMeta = import.meta.glob('./lessons/*.ts', {
  eager: true,
  import: 'meta',
})
~~~~

eager 会进入初始依赖图，文件很多时会增加启动成本。只读取元数据时用 import 选择导出，避免加载无关代码。

## 六、导入文本或 URL

~~~~ts
const markdownFiles = import.meta.glob('./lessons/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
~~~~

## 七、类型化结果

~~~~ts
interface LessonModule {
  meta: {
    title: string
    order: number
  }
}

const lessons = import.meta.glob<LessonModule>('./lessons/*.ts', {
  eager: true,
})
~~~~

泛型只描述模块形状，不会验证文件实际导出。文件约定发生变化时仍应在加载处给出清楚错误。

## 八、易错使用提示

:::pitfalls
### 错误：把运行时变量传给 glob

**触发条件：** `import.meta.glob(base + '/*.ts')`。

**原因：** Vite 必须在转换期静态分析 pattern。

**后果：** 构建失败或无法发现模块。

**错误示例：**

~~~~text
const modules = import.meta.glob(directory)
~~~~

**正确写法：**

~~~~text
使用明确字面量 pattern，并在结果映射中运行时筛选
~~~~

**验证方式：** build 产物和转换结果中应出现静态模块表。
:::

## 九、工作原理与适用边界

1. Features 文档展示 glob 的转换结果。
2. eager 会影响加载时机，必须按首页轻量化要求选择。
3. glob 是 Vite 特性，不是 ECMAScript 标准 API。

## 十、练习

:::exercise
### 练习目标

**要求：** 为课程目录写一个只 eager 加载元数据、lazy 加载正文的映射设计，并说明 chunk 证据。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- glob 在构建期展开；pattern 要静态，lazy/eager 决定运行时加载成本。

:::code-details{title="查看本节完整示例"}
~~~~ts
interface LessonMetaModule {
  meta: { title: string; order: number }
}

// 元数据进入初始模块图，只选择 meta 命名导出并排除草稿
const metaByPath = import.meta.glob<LessonMetaModule['meta']>(
  ['./lessons/*.ts', '!./lessons/*.draft.ts'],
  { eager: true, import: 'meta' },
)

// 正文保持懒加载，只有调用对应 loader 时才发起请求
const contentLoaders = import.meta.glob<{ default: string }>('./lessons/*.ts')

// Markdown 作为原始文本导入；URL 资源由 Vite 生成最终地址
const markdownByPath = import.meta.glob<string>('./lessons/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
const imageUrls = import.meta.glob<string>('./images/*.{png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** 按静态映射中的路径加载一节正文。 */
async function loadLesson(path: keyof typeof contentLoaders) {
  const module = await contentLoaders[path]()
  return module.default
}

console.log(metaByPath, markdownByPath, imageUrls)
void loadLesson('./lessons/basics.ts')
~~~~
:::

## 十二、参考资料

- [Glob Import](https://vite.dev/guide/features#glob-import) - pattern、query 和转换结果。
