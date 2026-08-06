<script setup lang="ts">
import { computed, ref } from 'vue'

type TopicId = 'template' | 'source'

interface DefaultSlotProps {
  readonly activeTopic: TopicId
  readonly activeTopicLabel: string
  readonly detailsVisible: boolean
  readonly selectTopic: (topic: TopicId) => void
}

interface ActionsSlotProps {
  readonly detailsVisible: boolean
  readonly toggleDetails: () => void
}

const activeTopic = ref<TopicId>('template')
const activeTopicLabel = computed(() => (activeTopic.value === 'template' ? '模板' : '源码'))
const detailsVisible = ref(true)

/** 选择当前学习主题。 */
function selectTopic(topic: TopicId): void {
  activeTopic.value = topic
}

/** 切换学习详情的显示状态。 */
function toggleDetails(): void {
  detailsVisible.value = !detailsVisible.value
}

defineSlots<{
  header(): void
  default(props: DefaultSlotProps): void
  actions(props: ActionsSlotProps): void
  support?(): void
}>()
</script>

<template>
  <section class="learning-slot-panel" aria-labelledby="learning-slot-panel-title">
    <header v-if="$slots.header" class="panel-header">
      <slot name="header" />
    </header>

    <div class="panel-layout">
      <section class="details-region" aria-label="主题详情与选择">
        <slot
          :active-topic="activeTopic"
          :active-topic-label="activeTopicLabel"
          :details-visible="detailsVisible"
          :select-topic="selectTopic"
        />
      </section>

      <aside class="support-region" aria-labelledby="learning-slot-support-title">
        <h5 id="learning-slot-support-title">补充资料</h5>
        <slot name="support">
          <p class="support-fallback">当前没有父级补充资料</p>
        </slot>
      </aside>
    </div>

    <footer v-if="$slots.actions" class="panel-actions" aria-label="学习面板操作">
      <slot name="actions" :details-visible="detailsVisible" :toggle-details="toggleDetails" />
    </footer>
  </section>
</template>

<style scoped>
.learning-slot-panel {
  min-width: 0;
  margin-top: 18px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-elevated);
}

.panel-header {
  min-width: 0;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

.panel-layout {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  padding: 14px;
}

.details-region,
.support-region {
  min-width: 0;
  margin: 6px;
}

.details-region {
  flex: 1 1 500px;
}

.support-region {
  flex: 0 1 220px;
  padding-left: 18px;
  border-left: 1px solid var(--color-border);
}

.support-region h5 {
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.support-fallback {
  min-width: 0;
  margin-top: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-sunken);
}

@media (max-width: 600px) {
  .panel-header {
    padding: 17px;
  }

  .panel-layout {
    flex-direction: column;
    padding: 16px;
  }

  .details-region,
  .support-region {
    width: 100%;
    flex: 0 0 auto;
    margin: 0;
  }

  .support-region {
    margin-top: 18px;
    padding-top: 16px;
    padding-left: 0;
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }

  .panel-actions {
    padding: 14px 16px;
  }
}
</style>
