<script setup lang="ts">
import { inject } from 'vue'
import { dependencyContextKey, optionalHintKey } from '../dependency-context'

const injectedContext = inject(dependencyContextKey)

if (!injectedContext) {
  throw new Error('DependencyConsumer 必须位于依赖提供者后代中')
}

const context = injectedContext
const optionalHint = inject(optionalHintKey, () => '使用本地默认提示', true)

/** 通过注入的命令请求当前提供者切换模式。 */
function requestModeToggle(): void {
  context.toggleMode()
}
</script>

<template>
  <section class="consumer-panel" :aria-label="`${context.owner}消费方`">
    <p class="consumer-eyebrow">深层消费方</p>
    <dl class="context-values">
      <div>
        <dt>解析来源</dt>
        <dd data-state="owner">{{ context.owner }}</dd>
      </div>
      <div>
        <dt>当前模式</dt>
        <dd data-state="mode" aria-live="polite">{{ context.mode }}</dd>
      </div>
      <div>
        <dt>修订次数</dt>
        <dd data-state="revision">{{ context.revision }}</dd>
      </div>
      <div>
        <dt>可选依赖</dt>
        <dd data-state="optional-hint">{{ optionalHint }}</dd>
      </div>
    </dl>
    <button type="button" @click="requestModeToggle">请求{{ context.owner }}切换模式</button>
  </section>
</template>

<style scoped>
.consumer-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.consumer-eyebrow {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.context-values {
  display: flex;
  flex-wrap: wrap;
  margin: 8px -6px 0;
}

.context-values > div {
  width: calc(50% - 12px);
  min-width: 0;
  margin: 6px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

dt {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

dd {
  margin-top: 5px;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

button {
  width: 100%;
  min-height: 44px;
  margin-top: 14px;
  padding: 10px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

button:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

button:active {
  transform: scale(0.98);
}

button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-accent) 28%, transparent);
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .context-values {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .context-values > div {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition-property: color, border-color;
  }

  button:active {
    transform: none;
  }
}
</style>
