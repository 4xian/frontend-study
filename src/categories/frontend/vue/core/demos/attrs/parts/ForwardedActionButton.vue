<script setup lang="ts">
import { ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ label: string }>()
const emit = defineEmits<{ inspect: [localCount: number] }>()
const attrs = useAttrs()
const localClickCount = ref(0)

/** 记录按钮本地点击并发出组件拥有的 inspect 事件。 */
function inspectAttributes(): void {
  localClickCount.value += 1
  emit('inspect', localClickCount.value)
}
</script>

<template>
  <div class="forwarded-action-shell" data-role="wrapper">
    <section class="action-region" aria-labelledby="forwarded-action-title">
      <p class="slot-label">唯一透传目标</p>
      <h4 id="forwarded-action-title">真实操作按钮</h4>
      <button
        v-bind="$attrs"
        type="button"
        class="forwarded-action"
        :style="{ fontWeight: '600' }"
        data-role="action"
        @click="inspectAttributes"
      >
        {{ props.label }}
      </button>
      <p class="local-count" aria-live="polite">子级本地 click：{{ localClickCount }}</p>
    </section>

    <section class="attrs-inspector" aria-labelledby="attrs-inspector-title">
      <h5 id="attrs-inspector-title">子组件 attrs 检视</h5>
      <dl>
        <div>
          <dt>原始 attribute</dt>
          <dd>data-course-id = {{ attrs['data-course-id'] ?? 'missing' }}</dd>
        </div>
        <div>
          <dt>原生监听器</dt>
          <dd>onClick = {{ typeof attrs.onClick }}</dd>
        </div>
        <div>
          <dt>Prop 消费</dt>
          <dd>label = {{ 'label' in attrs ? 'fallthrough' : 'consumed' }}</dd>
        </div>
        <div>
          <dt>Emit 消费</dt>
          <dd>onInspect = {{ 'onInspect' in attrs ? 'fallthrough' : 'consumed' }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.forwarded-action-shell {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin-top: 18px;
  padding: 14px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.action-region,
.attrs-inspector {
  min-width: 0;
  margin: 6px;
}

.action-region {
  flex: 1 1 420px;
}

.attrs-inspector {
  flex: 1 1 260px;
  padding-left: 18px;
  border-left: 1px solid var(--color-border);
}

.slot-label {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.action-region h4,
.attrs-inspector h5 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.action-region h4 {
  margin-top: 5px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.attrs-inspector h5 {
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.forwarded-action {
  min-width: 0;
  min-height: 44px;
  margin-top: 14px;
  padding: 10px 16px;
  border-style: solid;
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.forwarded-action.parent-emphasis {
  background: var(--color-accent-soft);
}

.forwarded-action:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.forwarded-action:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.local-count {
  min-width: 0;
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.attrs-inspector dl {
  min-width: 0;
  margin: 8px 0 0;
}

.attrs-inspector dl > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-width: 0;
  padding: 7px 0;
  border-bottom: 1px solid var(--color-border);
}

.attrs-inspector dt,
.attrs-inspector dd {
  min-width: 0;
  margin: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-xs);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.attrs-inspector dt {
  flex: 1 1 auto;
  color: var(--color-text-secondary);
}

.attrs-inspector dd {
  flex: 0 1 auto;
  margin-left: 12px;
  color: var(--color-text);
  text-align: right;
}

@media (max-width: 600px) {
  .forwarded-action-shell {
    flex-direction: column;
    padding: 16px;
  }

  .action-region,
  .attrs-inspector {
    width: 100%;
    flex: 0 0 auto;
    margin: 0;
  }

  .attrs-inspector {
    margin-top: 18px;
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }

  .forwarded-action {
    width: 100%;
  }
}
</style>
