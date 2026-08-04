<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const visibleParams = computed(() => {
  const serialized = JSON.stringify(route.params)
  return serialized === '{}' ? '无' : serialized
})
</script>

<template>
  <main class="fixture-app">
    <header>
      <p class="eyebrow">vue-router/auto-routes</p>
      <h1>类型化文件路由 Fixture</h1>
    </header>
    <dl class="route-state">
      <div>
        <dt>name</dt>
        <dd data-testid="fixture-route-name">{{ String(route.name) }}</dd>
      </div>
      <div>
        <dt>path</dt>
        <dd data-testid="fixture-route-path">{{ route.path }}</dd>
      </div>
      <div>
        <dt>params</dt>
        <dd data-testid="fixture-route-params">{{ visibleParams }}</dd>
      </div>
    </dl>
    <RouterView />
  </main>
</template>

<style scoped>
.fixture-app {
  width: min(720px, calc(100% - 32px));
  margin: 40px auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1d1d1f;
}

.eyebrow {
  color: #6e6e73;
}

.route-state {
  display: flex;
  flex-wrap: wrap;
  margin: 24px -6px;
}

.route-state div {
  min-width: 160px;
  padding: 12px;
  margin: 6px;
  border-radius: 8px;
  background: #f5f5f7;
}

.route-state dt {
  color: #6e6e73;
}

.route-state dd {
  margin: 4px 0 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}
</style>
