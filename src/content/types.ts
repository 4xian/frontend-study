/* 内容块模型与 ApiDoc 类型定义（需求文档 §3.3） */

/** 一个知识点页面由任意数量、任意类型的内容块顺序组成 */
export type ContentBlock =
  | { type: 'heading'; content: string }
  | { type: 'text'; content: string }
  | { type: 'code'; lang: string; content: string }
  | { type: 'demo'; component: string; desc?: string; playground?: boolean }
  | { type: 'tip'; style: 'info' | 'warning'; content: string }
  | { type: 'principle'; animation: string; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'custom'; component: string }

/** 一个知识点的完整数据结构，与数据文件一一对应 */
export interface ApiDoc {
  /** 与文件名、URL 一致，如 'ref' */
  id: string
  /** 展示标题，如 'ref()' */
  title: string
  /** 分类 id，与目录、_meta.ts 对应，如 'reactivity' */
  category: string
  /** 一句话简介（侧边栏悬浮 / 搜索 / 板块首页用） */
  summary: string
  /** 顺序渲染的内容块 */
  blocks: ContentBlock[]
}

/** 板块目录清单：分类顺序与分类中文名（各板块 _meta.ts 导出） */
export interface SectionMeta {
  /** 板块中文名，如 'Vue3' */
  title: string
  /** 分类顺序数组：[分类 id, 分类中文名] */
  categories: [string, string][]
  /** 知识点 id 的推荐学习顺序（未列出的排在末尾，按 id 字母序） */
  docOrder?: string[]
}

/**
 * 定义知识点数据的辅助函数（身份函数，仅为类型推导与约束）
 */
export function defineApiDoc(doc: ApiDoc): ApiDoc {
  return doc
}
