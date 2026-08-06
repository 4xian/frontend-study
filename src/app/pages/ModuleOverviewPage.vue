<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { learningCatalog } from '@/app/catalog'
import DemosOverviewPage from './DemosOverviewPage.vue'
import LearningOverviewPage from './LearningOverviewPage.vue'
import ReferenceOverviewPage from './ReferenceOverviewPage.vue'
import type { DomainId } from '@/common/catalog'

type ModuleView = 'learn' | 'reference' | 'demos'

const route = useRoute()

/** 将受路由规则约束的参数转换为模块身份。 */
const moduleScope = computed(() => ({
  domain: route.params.domain as DomainId,
  technology: route.params.technology as string,
  module: route.params.module as string,
}))

/** 通过 Catalog 判断当前 URL 是否对应正式模块。 */
const moduleNavigation = computed(() => learningCatalog.getNavigation(moduleScope.value))

/** 返回当前模块真实可用的内容类型。 */
const availableViews = computed(() => {
  if (!moduleNavigation.value.module) return []
  const views: Array<{ id: ModuleView; label: string }> = []
  if (learningCatalog.getLearningTrack(moduleScope.value)) {
    views.push({ id: 'learn', label: '知识学习' })
  }
  if (
    learningCatalog.getNavigation({ ...moduleScope.value, contentType: 'reference' }).groups.length
  ) {
    views.push({ id: 'reference', label: 'API Reference' })
  }
  if (learningCatalog.getDemos(moduleScope.value).length) {
    views.push({ id: 'demos', label: 'Demo' })
  }
  return views
})

/** 按 URL 选择内容总览，无有效选择时默认展示知识点。 */
const activeView = computed<ModuleView>(() => {
  const requested = route.query.view
  if (
    (requested === 'reference' || requested === 'demos') &&
    availableViews.value.some((view) => view.id === requested)
  ) {
    return requested
  }
  return availableViews.value[0]?.id ?? 'learn'
})

/** 返回当前 URL 选择对应的总览组件。 */
const activeComponent = computed(() => {
  if (activeView.value === 'reference') return ReferenceOverviewPage
  if (activeView.value === 'demos') return DemosOverviewPage
  return LearningOverviewPage
})
</script>

<template>
  <div v-if="moduleNavigation.module" class="module-overview">
    <component
      :is="activeComponent"
      :domain="moduleScope.domain"
      :technology="moduleScope.technology"
      :module="moduleScope.module"
    />
  </div>
  <main v-else class="module-missing" role="status">
    <h1>模块不存在或尚未开放</h1>
    <RouterLink to="/">返回技术中心</RouterLink>
  </main>
</template>

<style scoped>
.module-overview {
  width: 100%;
}

.module-missing {
  width: min(var(--page-reading-width), calc(100% - 2 * var(--space-4)));
  padding: var(--space-8) 0;
  margin: 0 auto;
}

.module-missing h1 {
  font-size: var(--font-size-xl);
}

.module-missing a {
  display: inline-block;
  margin-top: var(--space-3);
}
</style>
