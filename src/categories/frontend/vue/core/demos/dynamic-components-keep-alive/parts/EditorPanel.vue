<script setup lang="ts">
import { ref } from 'vue'

const localCount = ref(0)

/** 增加编辑面板实例独立拥有的局部计数。 */
function incrementLocalCount(): void {
  localCount.value += 1
}
</script>

<template>
  <section
    class="cache-panel"
    data-panel="editor"
    data-testid="active-panel"
    aria-labelledby="editor-panel-title"
  >
    <p class="panel-kicker">编辑面板</p>
    <h4 id="editor-panel-title">编辑的局部状态</h4>
    <p class="panel-description">模拟需要在短期往返中保留输入位置和工具状态的编辑工作区。</p>

    <div class="count-row">
      <label for="editor-local-count">局部计数</label>
      <output id="editor-local-count" data-state="local-count" aria-live="polite">
        {{ localCount }}
      </output>
    </div>

    <button type="button" data-testid="increment-local-count" @click="incrementLocalCount">
      局部计数 +1
    </button>
  </section>
</template>
