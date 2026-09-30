/* Shiki 高亮器单例：JS 正则引擎 + 按需语言/双主题（查证 shiki.style fine-grained bundle 文档，2026-07-26） */
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { HighlighterCore } from 'shiki/core'
import type { LanguageInput } from '@shikijs/types'

let instance: Promise<HighlighterCore> | null = null
const languageLoads = new Map<string, Promise<void>>()

const languageAliases: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  yml: 'yaml',
  md: 'markdown',
  txt: 'text',
  plaintext: 'text',
  powershell: 'powershell',
  bat: 'bat',
}

const languageLoaders: Record<string, LanguageInput> = {
  vue: () => import('@shikijs/langs/vue'),
  typescript: () => import('@shikijs/langs/typescript'),
  tsx: () => import('@shikijs/langs/tsx'),
  javascript: () => import('@shikijs/langs/javascript'),
  jsx: () => import('@shikijs/langs/jsx'),
  html: () => import('@shikijs/langs/html'),
  css: () => import('@shikijs/langs/css'),
  json: () => import('@shikijs/langs/json'),
  jsonc: () => import('@shikijs/langs/jsonc'),
  bash: () => import('@shikijs/langs/bash'),
  xml: () => import('@shikijs/langs/xml'),
  sql: () => import('@shikijs/langs/sql'),
  markdown: () => import('@shikijs/langs/markdown'),
  yaml: () => import('@shikijs/langs/yaml'),
  http: () => import('@shikijs/langs/http'),
  properties: () => import('@shikijs/langs/properties'),
  dotenv: () => import('@shikijs/langs/dotenv'),
  nginx: () => import('@shikijs/langs/nginx'),
  java: () => import('@shikijs/langs/java'),
  powershell: () => import('@shikijs/langs/powershell'),
  bat: () => import('@shikijs/langs/bat'),
}

/** 将 Markdown 代码围栏别名转换为 Shiki 的正式语言名称。 */
function normalizeLanguage(lang: string): string {
  const normalized = lang.trim().toLocaleLowerCase()
  return languageAliases[normalized] ?? normalized
}

/** 确保当前代码块语言已经加载，并复用并发加载任务。 */
async function loadLanguage(highlighter: HighlighterCore, lang: string): Promise<string> {
  if (['', 'text'].includes(lang)) return 'text'
  const loader = languageLoaders[lang]
  if (!loader) return 'text'
  if (highlighter.getLoadedLanguages().includes(lang)) return lang
  let pending = languageLoads.get(lang)
  if (!pending) {
    pending = highlighter.loadLanguage(loader).catch((error) => {
      languageLoads.delete(lang)
      throw error
    })
    languageLoads.set(lang, pending)
  }
  await pending
  return lang
}

/**
 * 获取高亮器单例（首次调用时异步创建，语言与主题按需打包）
 */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!instance) {
    instance = createHighlighterCore({
      themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return instance
}

/**
 * 将代码高亮为双主题 HTML（亮色默认，暗色由 .dark 下的 CSS 变量接管）
 */
export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter()
  const loadedLanguage = await loadLanguage(highlighter, normalizeLanguage(lang))
  return highlighter.codeToHtml(code, {
    lang: loadedLanguage,
    themes: { light: 'github-light', dark: 'github-dark' },
  })
}
