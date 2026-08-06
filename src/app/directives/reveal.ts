/* 滚动渐入指令：元素进入视口时加 is-visible 类触发过渡（借鉴 apple.com 的滚动显现动效） */
import type { Directive } from 'vue'

/** 全站共享的 IntersectionObserver：元素显现一次后即取消观察 */
let observer: IntersectionObserver | undefined

/** 惰性创建共享 observer */
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer!.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )
  }
  return observer
}

/** v-reveal 指令：值为可选的过渡延迟毫秒数，用于列表错峰入场 */
export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
