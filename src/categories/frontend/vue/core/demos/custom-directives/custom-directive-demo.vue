<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Directive } from 'vue'

const colors = ['#fff0c2', '#d9f5df', '#d9ebff', '#f3ddf0']
const colorIndex = ref(0)
const unrelatedCount = ref(0)
const currentColor = computed(() => colors[colorIndex.value] ?? colors[0]!)
const log = ref('等待 mounted')

const vHighlight: Directive<HTMLElement, string> = {
  /** 首次挂载时应用绑定颜色。 */
  mounted(element, binding) {
    element.style.backgroundColor = binding.value
    log.value = `mounted：${binding.value}`
  },
  /** 宿主更新后，仅在绑定颜色变化时写入 DOM。 */
  updated(element, binding) {
    if (binding.value === binding.oldValue) {
      log.value = `updated：颜色未变化，跳过 DOM 写入（无关计数 ${unrelatedCount.value}）`
      return
    }
    element.style.backgroundColor = binding.value
    log.value = `updated：${binding.oldValue} → ${binding.value}`
  },
}

/** 切换指令绑定的背景颜色。 */
function nextColor() {
  colorIndex.value = (colorIndex.value + 1) % colors.length
}

/** 更新同一宿主中的无关状态。 */
function updateUnrelatedState() {
  unrelatedCount.value += 1
}
</script>

<template>
  <div class="demo">
    <p v-highlight="currentColor" class="target">
      绑定颜色 {{ currentColor }}，无关计数 {{ unrelatedCount }}
    </p>
    <div class="actions">
      <button type="button" @click="nextColor">切换颜色</button>
      <button type="button" @click="updateUnrelatedState">只更新无关状态</button>
    </div>
    <p class="log" aria-live="polite">{{ log }}</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.target {
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  transition: background-color var(--duration-normal) var(--ease-out);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: var(--space-3);
}

.actions button {
  min-height: 36px;
  padding: 0 var(--space-3);
  margin-right: var(--space-2);
  margin-bottom: var(--space-2);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
}

.actions button:hover {
  background: var(--color-accent-soft);
}

.log {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (prefers-reduced-motion: reduce) {
  .target {
    transition: none;
  }
}
</style>
