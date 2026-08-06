/* 主题 store：亮/暗切换，跟随系统 + 手动选择持久化（需求文档 §5.4） */
import { ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme')
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  /** 当前是否暗色 */
  const isDark = ref(stored ? stored === 'dark' : media.matches)
  /** 用户是否手动选择过主题 */
  const hasManual = ref(stored !== null)

  // isDark 变化时同步 html 的 .dark 类
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  // 用户未手动选择过时，跟随系统主题实时变化
  media.addEventListener('change', (e) => {
    if (!hasManual.value) isDark.value = e.matches
  })

  /**
   * 切换主题并持久化用户选择
   */
  function toggle(): void {
    isDark.value = !isDark.value
    hasManual.value = true
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggle }
})
