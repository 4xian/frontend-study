<script setup lang="ts">
import { computed, ref } from 'vue'

class CourseCard {
  /** 创建课程卡片实例。 */
  constructor(public title: string) {}
}

class WorkshopCard {
  /** 创建工作坊卡片实例。 */
  constructor(public title: string) {}
}

type CardSample = {
  label: string
  value: CourseCard | WorkshopCard
}

const samples: CardSample[] = [
  { label: '课程实例', value: new CourseCard('类与结构兼容') },
  { label: '工作坊实例', value: new WorkshopCard('类与结构兼容') },
]
const selectedIndex = ref(0)

/** 描述实例的公开结构和真实运行时身份。 */
function describeIdentity(value: CourseCard | WorkshopCard): string {
  const constructorName = value.constructor.name
  const isCourse = value instanceof CourseCard ? '是' : '否'
  return `title 可读；构造器：${constructorName}；instanceof CourseCard：${isCourse}`
}

const selected = computed(() => samples[selectedIndex.value]!)
const result = computed(() => describeIdentity(selected.value.value))
</script>

<template>
  <section class="identity-demo" aria-label="类实例运行身份演示">
    <div class="identity-demo__controls" aria-label="选择实例">
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
    <p class="identity-demo__result" aria-live="polite">{{ result }}</p>
  </section>
</template>

<style scoped>
.identity-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.identity-demo__controls {
  display: flex;
  flex-wrap: wrap;
  margin: -4px;
}

.identity-demo__controls button {
  min-height: 44px;
  margin: 4px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.identity-demo__controls button[aria-pressed='true'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.identity-demo__controls button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.identity-demo__result {
  min-height: 48px;
  margin: 16px 0 0;
  font-weight: 650;
}
</style>
