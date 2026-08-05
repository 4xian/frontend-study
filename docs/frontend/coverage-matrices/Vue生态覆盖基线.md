# Vue 生态覆盖基线

> 核验日期：2026-08-05  
> 状态：完成，进入维护  
> 适用范围：Vue Core、Vue Router、Pinia

## 当前覆盖

| 模块 | 课程 | 稳定 Reference | 观察或受限范围 |
| --- | ---: | ---: | ---: |
| Vue Core | 31 | 官网 6 类、28 页、206/206 项 | 0 planned |
| Vue Router | 15 | 118/118 项 | Experimental 86 项已登记 |
| Pinia | 14 | 41/41 项 | restricted 26/26 已说明，0 planned |

“Reference 项”表示官方索引名称到站内真实页面和锚点的结构化映射，不等同于正文文件数量。高频
能力使用核心详解，相关名称可以合并到主题页，低频或平台相关能力可以使用速查；三种深度都必须
可搜索、可深链并标明官方来源。

## 结构化事实来源

长期事实以代码 manifest 和条目元数据为准：

```text
src/content/catalog/manifests/vue-core-track.ts
src/content/catalog/manifests/vue-core-reference-index.ts
src/content/catalog/manifests/vue-router-track.ts
src/content/catalog/manifests/vue-router-reference-index.ts
src/content/catalog/manifests/vue-pinia-track.ts
src/content/catalog/manifests/vue-pinia-reference-index.ts
src/content/entries/learn/vue/
src/content/entries/reference/vue/
```

对应 catalog 测试负责校验课程数量、顺序、索引总数、available/planned 状态、目标条目和 heading
anchor。本文只保留完成基线和维护规则，不复制全部 206、118 或 41 项映射。

## 维护规则

1. 官方稳定版本或索引变化时，先建立独立维护计划并重新冻结差异。
2. 新增官方项先进入结构化 index，明确 `detail`、`merged` 或 `quick` 深度后再编写正文。
3. Experimental、internal、deprecated 和 restricted 项不得静默计入稳定分母。
4. 维护批次完成后更新本基线日期和统计，随后删除该批调研与实施计划。
5. TypeScript、Vite 或 React 工作不得顺手改写 Vue 内容；发现真实回归时单独建立维护批次。
