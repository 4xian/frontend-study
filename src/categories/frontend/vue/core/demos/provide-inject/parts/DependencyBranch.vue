<script setup lang="ts">
import { inject, provide, readonly, ref } from 'vue'
import { dependencyContextKey } from '../dependency-context'
import DependencyConsumer from './DependencyConsumer.vue'

const props = defineProps<{
  local: boolean
}>()

const parentContext = props.local ? inject(dependencyContextKey) : undefined

if (props.local && !parentContext) {
  throw new Error('DependencyBranch 必须位于根依赖提供者后代中')
}

const localMode = ref('重点复习')
const localRevision = ref(0)

/** 切换局部分支拥有的模式。 */
function toggleLocalMode(): void {
  localMode.value = localMode.value === '重点复习' ? '自由探索' : '重点复习'
  localRevision.value += 1
}

if (props.local) {
  provide(dependencyContextKey, {
    owner: '局部练习区',
    mode: readonly(localMode),
    revision: readonly(localRevision),
    toggleMode: toggleLocalMode,
  })
}
</script>

<template>
  <article class="dependency-branch" :class="{ local }">
    <header>
      <p class="branch-number">{{ local ? '02' : '01' }}</p>
      <div>
        <h4>{{ local ? '局部覆盖分支' : '继承分支' }}</h4>
        <p v-if="local">
          中间组件先读取“{{ parentContext?.owner }}”，再为后代提供同 key 的完整局部上下文。
        </p>
        <p v-else>中间组件不声明或转发上下文，深层消费方继续沿父链查找。</p>
      </div>
    </header>

    <div class="middle-layer">
      <p>中间组件：不通过 Props 传递依赖</p>
      <DependencyConsumer />
    </div>
  </article>
</template>

<style scoped>
.dependency-branch {
  width: calc(50% - 14px);
  min-width: 0;
  margin: 7px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.dependency-branch.local {
  border-color: color-mix(in srgb, var(--color-accent) 34%, var(--color-border));
}

header {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.branch-number {
  flex: 0 0 auto;
  margin-right: 12px;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 750;
}

header > div {
  min-width: 0;
}

h4 {
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

header div p,
.middle-layer > p {
  margin-top: 7px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.middle-layer {
  margin-top: 16px;
  padding: 14px;
  border: 1px dashed var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg);
}

@media (max-width: 720px) {
  .dependency-branch {
    width: calc(100% - 14px);
  }
}
</style>
