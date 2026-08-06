<script setup lang="ts">
import { computed, ref } from 'vue'

type DemoValue = string | number | { kind: 'course'; title: string }

const samples: { label: string; value: DemoValue }[] = [
  { label: '字符串', value: 'TypeScript' },
  { label: '数字', value: 8 },
  { label: '课程对象', value: { kind: 'course', title: '类型收窄' } },
]
const selectedIndex = ref(0)

/** 根据真实运行检查返回当前值的分支说明。 */
function describeValue(value: DemoValue): string {
  if (typeof value === 'string') return `字符串：${value.toUpperCase()}`
  if (typeof value === 'number') return `数字：${value.toFixed(0)}`
  return `课程：${value.title}`
}

const selected = computed(() => samples[selectedIndex.value]!)
const result = computed(() => describeValue(selected.value.value))
</script>

<template>
  <section class="narrowing-demo" aria-label="类型收窄分支演示">
    <div class="narrowing-demo__controls" aria-label="选择运行值">
      <button
        v-for="(sample, index) in samples"
        :key="sample.label"
        type="button"
        :aria-pressed="selectedIndex === index"
        @click="selectedIndex = index"
      >
        {{ sample.label }}
      </button>
    </div>
    <p class="narrowing-demo__result" aria-live="polite">{{ result }}</p>
  </section>
</template>

<style scoped>
.narrowing-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.narrowing-demo__controls {
  display: flex;
  flex-wrap: wrap;
  margin: -4px;
}

.narrowing-demo__controls button {
  min-height: 44px;
  margin: 4px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.narrowing-demo__controls button[aria-pressed='true'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.narrowing-demo__controls button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.narrowing-demo__result {
  min-height: 24px;
  margin: 16px 0 0;
  font-weight: 650;
}
</style>
