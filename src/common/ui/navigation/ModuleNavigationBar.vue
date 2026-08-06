<script setup lang="ts">
import type { CategoryNavigation } from '@/common/catalog'

defineProps<{ navigation: CategoryNavigation }>()
</script>

<template>
  <nav v-if="navigation.technology" class="module-bar" aria-label="技术模块">
    <div class="module-bar-inner">
      <div class="module-tabs">
        <template v-for="moduleItem in navigation.modules" :key="moduleItem.id">
          <RouterLink
            v-if="moduleItem.status === 'available'"
            :to="moduleItem.path"
            class="module-tab"
            :class="{ active: navigation.module?.id === moduleItem.id }"
            :aria-current="navigation.module?.id === moduleItem.id ? 'page' : undefined"
          >
            {{ moduleItem.title }}
          </RouterLink>
          <span v-else class="module-tab planned">
            {{ moduleItem.title }}
            <small>规划中</small>
          </span>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.module-bar {
  position: sticky;
  top: var(--header-height);
  z-index: 30;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-glass);
  backdrop-filter: saturate(180%) blur(20px);
}

.module-bar-inner {
  display: flex;
  align-items: center;
  width: min(var(--content-shell-width), 100%);
  min-height: 56px;
  margin: 0 auto;
}

.module-tabs {
  display: flex;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.module-tabs::-webkit-scrollbar {
  display: none;
}

.module-tab {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: 56px;
  padding: 0 18px;
  color: var(--color-text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.module-tab::after {
  position: absolute;
  right: 18px;
  bottom: 0;
  left: 18px;
  height: 2px;
  background: transparent;
  content: '';
}

.module-tab.active {
  color: var(--color-text);
  font-weight: 600;
}

.module-tab.active::after {
  background: var(--color-accent);
}

.module-tab:not(.planned):hover {
  color: var(--color-accent);
}

.module-tab.planned {
  color: var(--color-text-tertiary);
}

.module-tab small {
  margin-left: 6px;
  font-size: 10px;
}

@media (max-width: 760px) {
  .module-bar-inner {
    width: min(100% - 32px, var(--page-content-width));
  }

  .module-tabs {
    width: calc(100vw - 16px);
  }

  .module-tab {
    min-height: 44px;
    padding: 0 14px;
  }

  .module-tab:first-child {
    padding-left: 0;
  }

  .module-tab::after {
    right: 14px;
    left: 14px;
  }

  .module-tab:first-child::after {
    left: 0;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .module-bar {
    background: var(--color-bg-elevated);
    backdrop-filter: none;
  }
}
</style>
