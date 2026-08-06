import { onMounted, onUnmounted, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export const composableCounterTickEvent = 'composable-contract-lab:tick'

/**
 * 为一个响应式步长创建独立计数器，并管理共享浏览器事件的监听生命周期。
 */
export function useEventCounter(stepSource: MaybeRefOrGetter<number>) {
  const count = ref(0)
  const running = ref(false)

  /** 按事件发生当下的规范化步长增加当前实例计数。 */
  function handleTick(): void {
    count.value += toValue(stepSource)
  }

  /** 幂等注册共享 tick 事件监听器。 */
  function start(): void {
    if (running.value) return
    window.addEventListener(composableCounterTickEvent, handleTick)
    running.value = true
  }

  /** 幂等移除共享 tick 事件监听器。 */
  function stop(): void {
    if (!running.value) return
    window.removeEventListener(composableCounterTickEvent, handleTick)
    running.value = false
  }

  /** 仅重置当前 composable 调用所拥有的计数状态。 */
  function reset(): void {
    count.value = 0
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    count,
    running,
    start,
    stop,
    reset,
  }
}
