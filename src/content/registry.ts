/* 内容注册表：收集全部数据文件，生成路由 / 侧边栏 / 搜索所需数据（需求文档 §3.6） */
import { ref } from 'vue'
import type { ApiDoc, SectionMeta } from './types'

/** 知识点数据文件懒加载表：./data/<板块>/<分类>/<id>.ts（三层通配天然排除 _meta.ts） */
const docLoaders = import.meta.glob<{ default: ApiDoc }>('./data/*/*/*.ts')

/** 板块目录清单（_meta.ts 体积小，同步收集） */
const metaModules = import.meta.glob<{ default: SectionMeta }>('./data/*/_meta.ts', {
  eager: true,
})

/** 单个知识点条目：位置信息 + 懒加载函数 */
export interface DocEntry {
  section: string
  category: string
  id: string
  path: string
  load: () => Promise<ApiDoc>
}

/** 侧边栏与搜索用的知识点元信息 */
export interface DocMeta {
  section: string
  category: string
  id: string
  path: string
  title: string
  summary: string
}

/** 板块 id → 目录清单（如 vue3 → { title, categories }） */
export const sections: Record<string, SectionMeta> = {}
for (const [file, mod] of Object.entries(metaModules)) {
  sections[file.split('/')[2]!] = mod.default
}

/** 全部知识点条目（板块/分类/id 解析自文件路径） */
export const docEntries: DocEntry[] = Object.entries(docLoaders).map(([file, loader]) => {
  const parts = file.split('/')
  const section = parts[2]!
  const category = parts[3]!
  const id = parts[4]!.replace(/\.ts$/, '')
  return {
    section,
    category,
    id,
    path: `/${section}/${category}/${id}`,
    load: async () => (await loader()).default,
  }
})

/**
 * 按位置查找知识点条目
 */
export function findDoc(section: string, category: string, id: string): DocEntry | undefined {
  return docEntries.find((e) => e.section === section && e.category === category && e.id === id)
}

/**
 * 取某板块某分类下的知识点元信息，按 _meta.ts 的 docOrder 排序（未列出的按 id 排在末尾）
 */
export function docsOf(section: string, category: string): DocMeta[] {
  const order = sections[section]?.docOrder ?? []
  return docIndex.value
    .filter((d) => d.section === section && d.category === category)
    .sort((a, b) => {
      const ia = order.indexOf(a.id)
      const ib = order.indexOf(b.id)
      if (ia === -1 && ib === -1) return a.id.localeCompare(b.id)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
}

/** 知识点元信息索引（异步初始化后填充，供侧边栏与搜索使用） */
export const docIndex = ref<DocMeta[]>([])

let indexLoaded = false

/**
 * 初始化元信息索引：并发加载全部数据文件提取元信息，只执行一次
 */
export async function initDocIndex(): Promise<void> {
  if (indexLoaded) return
  indexLoaded = true
  docIndex.value = await Promise.all(
    docEntries.map(async (entry) => {
      const doc = await entry.load()
      return {
        section: entry.section,
        category: entry.category,
        id: entry.id,
        path: entry.path,
        title: doc.title,
        summary: doc.summary,
      }
    }),
  )
}
