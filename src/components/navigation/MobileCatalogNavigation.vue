<script setup lang="ts">
import type { CatalogNode, ContentPurpose } from '@/content/catalog'

type MobileLevel = 'purpose' | 'ecosystem' | 'module' | 'collection'
type MobileDirection = 'forward' | 'backward'

interface PurposeOption {
  id: ContentPurpose
  title: string
  path: string
}

defineProps<{
  level: MobileLevel
  direction: MobileDirection
  title: string
  purpose: ContentPurpose
  purposes: readonly PurposeOption[]
  ecosystems: CatalogNode[]
  modules: CatalogNode[]
  collections: CatalogNode[]
  moduleOverview?: CatalogNode
  activeEcosystemId: string
  activeModuleId: string
  selectedEcosystemId: string
  selectedModuleId: string
}>()

const emit = defineEmits<{
  selectPurpose: [purpose: ContentPurpose]
  selectEcosystem: [node: CatalogNode]
  selectModule: [node: CatalogNode]
  close: []
  entered: []
}>()
</script>

<template>
  <div class="mobile-navigation-stage">
    <Transition
      :name="direction === 'forward' ? 'mobile-forward' : 'mobile-backward'"
      mode="out-in"
      @after-enter="emit('entered')"
    >
      <section :key="level" class="mobile-view" data-mobile-view>
        <h2 tabindex="-1" data-mobile-heading>{{ title }}</h2>

        <div v-if="level === 'purpose'" class="mobile-list purpose-list">
          <button
            v-for="option in purposes"
            :key="option.id"
            type="button"
            class="mobile-link mobile-primary-link"
            :class="{ current: option.id === purpose }"
            :aria-pressed="option.id === purpose"
            @click="emit('selectPurpose', option.id)"
          >
            <span>{{ option.title }}</span>
          </button>
        </div>

        <div v-else-if="level === 'ecosystem'" class="mobile-list">
          <template v-for="node in ecosystems" :key="node.id">
            <button
              v-if="node.status === 'available'"
              type="button"
              class="mobile-link"
              :class="{ current: node.id === activeEcosystemId }"
              :aria-pressed="node.id === selectedEcosystemId"
              @click="emit('selectEcosystem', node)"
            >
              <span class="mobile-item-title">{{ node.title }}</span>
              <span v-if="node.summary" class="mobile-item-summary">{{ node.summary }}</span>
            </button>
            <span v-else class="mobile-link mobile-planned" aria-disabled="true">
              <span class="mobile-item-title">{{ node.title }}</span>
              <span class="status-label">规划中</span>
            </span>
          </template>
        </div>

        <div v-else-if="level === 'module'" class="mobile-list">
          <template v-for="node in modules" :key="node.id">
            <button
              v-if="node.status === 'available'"
              type="button"
              class="mobile-link"
              :class="{ current: node.id === activeModuleId }"
              :aria-pressed="node.id === selectedModuleId"
              @click="emit('selectModule', node)"
            >
              <span class="mobile-item-title">{{ node.title }}</span>
            </button>
            <span v-else class="mobile-link mobile-planned" aria-disabled="true">
              <span class="mobile-item-title">{{ node.title }}</span>
              <span class="status-label">规划中</span>
            </span>
          </template>
        </div>

        <div v-else class="mobile-list">
          <RouterLink
            v-if="moduleOverview?.status === 'available'"
            :to="moduleOverview.path"
            class="mobile-link"
            @click="emit('close')"
          >
            <span class="mobile-item-title">模块总览</span>
            <span class="mobile-item-summary">查看完整路线与内容覆盖</span>
          </RouterLink>
          <template v-for="node in collections" :key="node.id">
            <RouterLink
              v-if="node.status === 'available'"
              :to="node.path"
              class="mobile-link"
              @click="emit('close')"
            >
              <span class="mobile-item-title">{{ node.title }}</span>
              <span v-if="node.summary" class="mobile-item-summary">{{ node.summary }}</span>
            </RouterLink>
            <span v-else class="mobile-link mobile-planned" aria-disabled="true">
              <span class="mobile-item-title">{{ node.title }}</span>
              <span class="status-label">规划中</span>
            </span>
          </template>
          <p v-if="!moduleOverview && !collections.length" class="empty-state">
            该模块暂无可用分类
          </p>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.mobile-navigation-stage {
  position: relative;
  width: 100%;
  padding-top: 30px;
}

.mobile-view {
  width: 100%;
}

.mobile-view h2 {
  font-size: var(--font-size-sm);
  font-weight: 400;
  line-height: 1.3;
  color: var(--color-text-secondary);
  letter-spacing: 0;
  outline: none;
}

.mobile-list {
  margin-top: 18px;
}

.mobile-link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 52px;
  padding: 10px 0;
  color: var(--color-text);
  text-align: left;
  transition:
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.mobile-link + .mobile-link,
.mobile-link + .mobile-planned,
.mobile-planned + .mobile-link,
.mobile-planned + .mobile-planned {
  margin-top: var(--space-1);
}

.mobile-link:hover,
.mobile-link:focus-visible {
  color: var(--color-text-secondary);
  transform: translateX(2px);
}

.mobile-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.mobile-primary-link {
  min-height: 54px;
  padding: 11px 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: 0;
}

.mobile-item-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
}

.mobile-item-summary {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  line-height: 1.45;
  color: var(--color-text-secondary);
}

.mobile-planned {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-tertiary);
  cursor: default;
}

.status-label {
  flex-shrink: 0;
  margin-left: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.empty-state {
  padding: var(--space-2) 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.mobile-forward-enter-active,
.mobile-forward-leave-active,
.mobile-backward-enter-active,
.mobile-backward-leave-active {
  transition:
    opacity 320ms var(--ease-out),
    transform 320ms var(--ease-out);
}

.mobile-forward-enter-from,
.mobile-backward-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.mobile-forward-leave-to,
.mobile-backward-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .mobile-forward-enter-active,
  .mobile-forward-leave-active,
  .mobile-backward-enter-active,
  .mobile-backward-leave-active {
    transition: none;
  }

  .mobile-forward-enter-from,
  .mobile-forward-leave-to,
  .mobile-backward-enter-from,
  .mobile-backward-leave-to {
    transform: none;
  }
}
</style>
