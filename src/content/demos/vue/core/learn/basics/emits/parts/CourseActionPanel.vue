<script setup lang="ts">
interface Props {
  quantity: number
  minimum: number
  maximum: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  changeRequest: [delta: number]
  resetRequest: []
}>()

/** 向父组件报告一个单位的数量变化意图。 */
function requestChange(delta: number): void {
  emit('changeRequest', delta)
}

/** 向父组件报告恢复初始数量的意图。 */
function requestReset(): void {
  emit('resetRequest')
}
</script>

<template>
  <section class="course-action-panel" aria-labelledby="course-action-title">
    <header class="panel-heading">
      <p>02 · 意图报告者</p>
      <h4 id="course-action-title">子组件操作面板</h4>
    </header>

    <div class="received-state">
      <p class="state-label">Props 收到的当前数量</p>
      <strong>{{ props.quantity }}</strong>
      <p>允许范围：{{ props.minimum }} 至 {{ props.maximum }}</p>
    </div>

    <p class="ownership-note">
      子组件只报告请求，不修改 quantity；最终结果由父级决定后再通过 Props 返回。
    </p>

    <div class="request-actions" aria-label="向父组件报告数量请求">
      <button type="button" @click="requestChange(1)">请求增加</button>
      <button type="button" @click="requestChange(-1)">请求减少</button>
      <button type="button" class="reset-button" @click="requestReset">请求重置</button>
    </div>
  </section>
</template>

<style scoped>
.course-action-panel {
  height: 100%;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.panel-heading {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.panel-heading p {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.panel-heading h4 {
  margin-top: 4px;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.received-state {
  min-width: 0;
  margin-top: 16px;
  padding: 16px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
}

.received-state p,
.ownership-note {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.received-state .state-label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.received-state strong {
  display: block;
  margin: 5px 0;
  color: var(--color-text);
  font-size: 32px;
  line-height: 1.2;
}

.ownership-note {
  margin-top: 14px;
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  margin: 12px -4px -4px;
}

.request-actions button {
  min-height: 44px;
  min-width: 0;
  flex: 1 1 120px;
  margin: 4px;
  padding: 9px 12px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 600;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.request-actions button:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.request-actions button:active {
  transform: scale(0.98);
}

.request-actions button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.request-actions .reset-button {
  flex-basis: 100%;
}

@media (max-width: 480px) {
  .course-action-panel {
    padding: 16px;
  }

  .request-actions {
    flex-direction: column;
    margin: 12px 0 0;
  }

  .request-actions button,
  .request-actions .reset-button {
    width: 100%;
    flex: 0 0 auto;
    margin: 8px 0 0;
  }

  .request-actions button:first-child {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .request-actions button {
    transition:
      background-color var(--duration-fast) linear,
      color var(--duration-fast) linear;
  }

  .request-actions button:active {
    transform: none;
  }
}
</style>
