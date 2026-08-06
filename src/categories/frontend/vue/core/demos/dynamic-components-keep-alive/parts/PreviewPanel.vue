<script setup lang="ts">
import { ref } from 'vue'

const localCount = ref(0)

/** 增加预览面板实例独立拥有的局部计数。 */
function incrementLocalCount(): void {
  localCount.value += 1
}
</script>

<template>
  <section
    class="cache-panel"
    data-panel="preview"
    data-testid="active-panel"
    aria-labelledby="preview-panel-title"
  >
    <p class="panel-kicker">预览面板</p>
    <h4 id="preview-panel-title">预览的局部状态</h4>
    <p class="panel-description">模拟由当前草稿生成、切回时可以继续检查的高成本预览。</p>

    <div class="count-row">
      <label for="preview-local-count">局部计数</label>
      <output id="preview-local-count" data-state="local-count" aria-live="polite">
        {{ localCount }}
      </output>
    </div>

    <button type="button" data-testid="increment-local-count" @click="incrementLocalCount">
      局部计数 +1
    </button>
  </section>
</template>
