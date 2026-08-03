<script setup lang="ts">
/* ref 基础演示：计数器（自包含，可作 playground 初始代码） */
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="demo">
    <p class="value">count.value = {{ count }}</p>
    <button class="btn" @click="count++">count.value++</button>
    <button class="btn" @click="count = 0">count.value = 0</button>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.value {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  margin-right: 16px;
}

.btn {
  margin-right: 8px;
  padding: 4px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 980px;
  color: var(--color-accent);
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover {
  background: var(--color-accent-soft);
}
</style>
