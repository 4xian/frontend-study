<script setup lang="ts">
import { ref } from 'vue'
import ComponentModelEditor from './parts/ComponentModelEditor.vue'

type AccessLevel = 'viewer' | 'editor'

const controlledTitle = ref('Vue model')
const controlledAccess = ref<AccessLevel>('viewer')
const controlledNotes = ref('父级备注')
const controlledAccessChangeCount = ref(0)
const localTitle = ref('Local model')
const localAccess = ref<AccessLevel>('editor')

/** 记录受控权限模型收到的单次更新事件。 */
function recordControlledAccessChange(): void {
  controlledAccessChangeCount.value += 1
}

/** 从父级恢复完整受控实例的初始模型值。 */
function resetControlledModel(): void {
  controlledTitle.value = 'Vue model'
  controlledAccess.value = 'viewer'
  controlledNotes.value = '父级备注'
  controlledAccessChangeCount.value = 0
}
</script>

<template>
  <article class="component-model-contract-demo">
    <header class="demo-heading">
      <p class="eyebrow">组件模型契约实验</p>
      <h3>比较完整受控模型与未绑定本地状态</h3>
      <p>编辑三个独立模型，观察修饰符写回、父级重置和默认模型的本地回退。</p>
    </header>

    <div class="model-instances">
      <section class="model-instance" aria-labelledby="controlled-model-title">
        <header class="instance-heading">
          <p class="instance-kind">完整受控实例</p>
          <h4 id="controlled-model-title">父级绑定 title、access 与 notes</h4>
          <p class="binding-state">父级已绑定：title、access、notes</p>
        </header>

        <ComponentModelEditor
          v-model="controlledNotes"
          v-model:title.capitalize="controlledTitle"
          v-model:access="controlledAccess"
          id-prefix="controlled-editor"
          instance-label="完整受控模型编辑器"
          @update:access="recordControlledAccessChange"
        />

        <section class="parent-status" aria-labelledby="controlled-parent-status-title">
          <h5 id="controlled-parent-status-title">父级状态</h5>
          <p class="status-summary" aria-live="polite">
            标题：{{ controlledTitle }}；权限：{{ controlledAccess }}；备注：{{ controlledNotes }}
          </p>
          <p class="access-change-count">
            受控权限 update:access 次数：{{ controlledAccessChangeCount }}
          </p>
        </section>

        <button type="button" class="reset-button" @click="resetControlledModel">
          父级重置受控模型
        </button>
      </section>

      <section class="model-instance" aria-labelledby="local-model-title">
        <header class="instance-heading">
          <p class="instance-kind">未绑定 notes 实例</p>
          <h4 id="local-model-title">父级只绑定 title 与 access</h4>
          <p class="binding-state local-binding-state">父级没有为 notes 提供绑定</p>
        </header>

        <ComponentModelEditor
          v-model:title.capitalize="localTitle"
          v-model:access="localAccess"
          id-prefix="local-editor"
          instance-label="未绑定 notes 的本地模型编辑器"
        />

        <section class="parent-status" aria-labelledby="local-parent-status-title">
          <h5 id="local-parent-status-title">父级状态</h5>
          <p class="status-summary" aria-live="polite">
            标题：{{ localTitle }}；权限：{{ localAccess }}
          </p>
          <p class="local-notes-status">notes：父级没有绑定，值仅存于当前子组件</p>
        </section>
      </section>
    </div>
  </article>
</template>

<style scoped>
.component-model-contract-demo {
  width: 100%;
  max-width: 920px;
  min-width: 0;
}

.demo-heading {
  min-width: 0;
  padding: 4px 2px 2px;
}

.eyebrow,
.instance-kind {
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.demo-heading h3,
.instance-heading h4,
.parent-status h5 {
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.demo-heading h3 {
  margin-top: 5px;
  font-size: var(--font-size-lg);
  line-height: 1.35;
}

.demo-heading > p:last-child {
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.model-instances {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  margin: 12px -6px -6px;
}

.model-instance {
  flex: 1 1 380px;
  min-width: 0;
  margin: 6px;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-sunken);
}

.instance-heading {
  min-width: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.instance-heading h4 {
  margin-top: 5px;
  font-size: var(--font-size-md);
  line-height: 1.4;
}

.binding-state {
  min-width: 0;
  margin-top: 8px;
  padding: 8px 10px;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.local-binding-state {
  border-left-color: var(--color-warning);
  background: var(--color-warning-bg);
}

.parent-status {
  min-width: 0;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.parent-status h5 {
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.status-summary,
.access-change-count,
.local-notes-status {
  min-width: 0;
  margin-top: 7px;
  color: var(--color-text-secondary);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.reset-button {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  margin-top: 14px;
  padding: 9px 13px;
  border: 1px solid var(--color-accent);
  border-radius: 7px;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: 650;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.reset-button:hover {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.reset-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .demo-heading {
    padding-right: 0;
    padding-left: 0;
  }

  .model-instances {
    flex-direction: column;
    margin-right: 0;
    margin-left: 0;
  }

  .model-instance {
    width: 100%;
    flex: 0 0 auto;
    margin-right: 0;
    margin-left: 0;
    padding: 16px;
  }
}
</style>
