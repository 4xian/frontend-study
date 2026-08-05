# API 参考内容规范

> 版本：v1.0  
> 状态：生效  
> 适用范围：`src/content/entries/reference/<ecosystem>/<module>/`

## 1. Reference 职责

Reference 用于准确查阅语法、类型、函数、配置和行为边界，不承担从零课程顺序。TypeScript 的语言
结构、类型操作符和 TSConfig，Vite 的配置与插件 interface，都属于 Reference，即使它们不是传统
运行时函数。

每个模块先冻结官方索引，再将条目划分为：

- `detail`：高频核心能力，提供完整心智模型、示例和必要 Demo。
- `merged`：多个紧密相关名称由一个主题页和独立锚点承接。
- `quick`：低频、类型或平台边界，提供准确说明和最小示例。

覆盖目标是全部官方稳定主题可搜索、可定位，不是每个名称一篇长文。Experimental、deprecated、
internal 和 restricted 范围必须与稳定分母分开。

## 2. 索引与文件

```text
src/content/catalog/manifests/<ecosystem>-<module>-reference-index.ts
src/content/entries/reference/<ecosystem>/<module>/<collection>/<topic>.ts
```

官方索引项必须记录名称、官方 URL、覆盖深度、状态和目标。`available` 项必须指向真实 entry 和唯一
heading anchor；`planned` 项不可点击，也不能保留伪 target。页面导航、总览统计和搜索都读取同一
结构化 index。

## 3. 元数据与固定章节

Reference 通过 `defineReferenceMeta()` 与 `defineReference()` 定义。除共同元数据外，必须提供非空
`signature` 和完整 `anchors`。

推荐顺序：

1. 概述与选择建议。
2. 签名、语法或配置 interface。
3. 参数、泛型、返回值、默认值或配置结果。
4. 行为、时序、生命周期和环境边界。
5. 最小正确示例；确有观察价值时加入同源 Demo。
6. 易错使用提示。
7. 源码推导与适用场景。
8. 版本、官方来源和相关课程。

合并页为每个官方名称提供逐字可识别的 heading。标题经过 `headingId()` 后必须与 index target 一致，
不能依赖页面运行时猜测锚点。

## 4. 可复制骨架

```ts
/**
 * 查证日期：YYYY-MM-DD
 * 查证来源：官方 Reference、固定版本源码与官方测试
 */
import { defineReference, defineReferenceMeta } from '@/content/schema'

export const meta = defineReferenceMeta({
  id: 'engineering.typescript.reference.types.example-operator',
  type: 'reference',
  title: 'Example Operator',
  summary: '说明该能力解决的问题和最重要边界',
  ecosystem: 'engineering',
  module: 'typescript',
  collection: 'types',
  related: [],
  tags: ['TypeScript'],
  sources: [{ title: '官方 Reference', url: 'https://example.com' }],
  appliesTo: 'TypeScript x.y',
  verifiedAt: 'YYYY-MM-DD',
  anchors: ['概述', '签名', '行为边界', '易错使用提示', '源码推导与适用场景'],
})

export default defineReference({
  meta,
  signature: 'type Example<T> = ...',
  blocks: [
    { type: 'heading', content: '概述' },
    { type: 'text', content: '先说明何时查阅和何时不使用。' },
    { type: 'heading', content: '签名' },
    { type: 'code', lang: 'ts', content: 'type Example<T> = ...' },
    { type: 'heading', content: '行为边界' },
    { type: 'text', content: '说明参数、结果、版本和环境边界。' },
    { type: 'heading', content: '易错使用提示' },
    {
      type: 'pitfalls',
      items: [
        {
          title: '明确的错误名称',
          description: '解释错误原因。',
          consequence: '说明可观察后果。',
          wrong: { lang: 'ts', content: '// 错误示例' },
          correct: { lang: 'ts', content: '// 正确示例' },
        },
      ],
    },
    { type: 'heading', content: '源码推导与适用场景' },
    {
      type: 'steps',
      items: [{ title: '事实与推导', content: '官方事实；课程推导；适用边界。' }],
    },
  ],
})
```

## 5. 发布检查

- 官方冻结集合与结构化 index 双向差集为空，或每个差异都有明确状态。
- 每个 `available` 项的 entry、heading 和 anchor 真实存在且唯一。
- `signature`、易错提示、推导/适用场景、来源、版本和核验日期完整。
- 纯类型和编译配置不创建无意义浏览器 Demo。
- 总览筛选、搜索别名、深链、前后篇和移动端目录通过代表路径验证。
