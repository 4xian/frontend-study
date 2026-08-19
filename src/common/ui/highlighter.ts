/* Shiki 高亮器单例：JS 正则引擎 + 按需语言/双主题（查证 shiki.style fine-grained bundle 文档，2026-07-26） */
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { HighlighterCore } from 'shiki/core'

let instance: Promise<HighlighterCore> | null = null

/**
 * 获取高亮器单例（首次调用时异步创建，语言与主题按需打包）
 */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!instance) {
    instance = createHighlighterCore({
      themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
      langs: [
        import('@shikijs/langs/vue'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/tsx'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/jsx'),
        import('@shikijs/langs/html'),
        import('@shikijs/langs/css'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/jsonc'),
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/xml'),
        import('@shikijs/langs/sql'),
        import('@shikijs/langs/markdown'),
        import('@shikijs/langs/yaml'),
        import('@shikijs/langs/http'),
        import('@shikijs/langs/properties'),
        import('@shikijs/langs/dotenv'),
        import('@shikijs/langs/nginx'),
        import('@shikijs/langs/java'),
      ],
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
  const loaded = highlighter.getLoadedLanguages()
  return highlighter.codeToHtml(code, {
    lang: loaded.includes(lang) ? lang : 'text',
    themes: { light: 'github-light', dark: 'github-dark' },
  })
}
