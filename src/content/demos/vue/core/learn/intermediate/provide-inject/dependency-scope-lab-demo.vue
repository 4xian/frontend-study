<script setup lang="ts">
import { provide, readonly, ref } from 'vue'
import { dependencyContextKey } from './dependency-context'
import DependencyBranch from './parts/DependencyBranch.vue'

const rootMode = ref('完整讲解')
const rootRevision = ref(0)

/** 切换根课程区拥有的模式。 */
function toggleRootMode(): void {
  rootMode.value = rootMode.value === '完整讲解' ? '关键提示' : '完整讲解'
  rootRevision.value += 1
}

provide(dependencyContextKey, {
  owner: '根课程区',
  mode: readonly(rootMode),
  revision: readonly(rootRevision),
  toggleMode: toggleRootMode,
})
</script>

<template>
  <article class="dependency-scope-lab-demo">
    <header class="demo-header">
      <p class="eyebrow">依赖作用域实验台</p>
      <h3>同一个 key，沿组件树解析最近的提供者</h3>
      <p>根级上下文服务继承分支；局部分支用同 key 建立独立作用域。</p>
    </header>

    <section class="root-provider" aria-labelledby="root-provider-title">
      <div>
        <p class="section-number">00 · 根提供者</p>
        <h4 id="root-provider-title">根课程区</h4>
        <p>
          当前模式：<strong data-state="root-mode">{{ rootMode }}</strong>
          <span aria-hidden="true"> · </span>
          修订 <strong data-state="root-revision">{{ rootRevision }}</strong>
        </p>
      </div>
      <button type="button" @click="toggleRootMode">根提供者切换模式</button>
    </section>

    <div class="branch-list">
      <DependencyBranch :local="false" />
      <DependencyBranch local />
    </div>
  </article>
</template>

<style scoped>
.dependency-scope-lab-demo {
  width: 100%;
  max-width: 960px;
  min-width: 0;
}

.demo-header {
  padding: 22px;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow,
.section-number {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-header h3,
.root-provider h4 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-header h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-header > p:last-child,
.root-provider div > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.root-provider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.root-provider > div {
  flex: 1 1 auto;
  min-width: 0;
}

.root-provider h4 {
  margin-top: 4px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.root-provider strong {
  color: var(--color-text);
}

.root-provider button {
  flex: 0 0 auto;
  min-height: 44px;
  margin-left: 18px;
  padding: 10px 16px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
  font: inherit;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.root-provider button:hover {
  opacity: 0.88;
}

.root-provider button:active {
  transform: scale(0.98);
}

.root-provider button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

.branch-list {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  padding: 15px;
}

@media (max-width: 720px) {
  .root-provider {
    align-items: stretch;
    flex-direction: column;
  }

  .root-provider button {
    width: 100%;
    margin-top: 14px;
    margin-left: 0;
  }

  .branch-list {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .root-provider button {
    transition-property: opacity;
  }

  .root-provider button:active {
    transform: none;
  }
}
</style>
