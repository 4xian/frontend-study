<script setup lang="ts">
import { ref } from 'vue'

const localCount = ref(0)

/** 增加设置面板实例独立拥有的局部计数。 */
function incrementLocalCount(): void {
  localCount.value += 1
}
</script>

<template>
  <section
    class="cache-panel"
    data-panel="settings"
    data-testid="active-panel"
    aria-labelledby="settings-panel-title"
  >
    <p class="panel-kicker">设置面板</p>
    <h4 id="settings-panel-title">设置的局部状态</h4>
    <p class="panel-description">模拟第三个工作面板，用来触发 max=2 时的最久未访问实例淘汰。</p>

    <div class="count-row">
      <label for="settings-local-count">局部计数</label>
      <output id="settings-local-count" data-state="local-count" aria-live="polite">
        {{ localCount }}
      </output>
    </div>

    <button type="button" data-testid="increment-local-count" @click="incrementLocalCount">
      局部计数 +1
    </button>
  </section>
</template>
