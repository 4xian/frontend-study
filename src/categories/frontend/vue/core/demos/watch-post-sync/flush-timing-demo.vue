<script setup lang="ts">
/* flush 时机演示：pre 读到旧 DOM，post 读到新 DOM（自包含） */
import { ref, watch } from 'vue'

const count = ref(0)
const countEl = ref<HTMLElement | null>(null)
const logs = ref<string[]>([])

// 默认 pre：回调时组件 DOM 尚未更新
watch(count, (val) => {
  logs.value.unshift(`[pre]  数据已是 ${val}，DOM 里还是「${countEl.value?.textContent}」`)
})

// post：回调时 DOM 已更新
watch(
  count,
  (val) => {
    logs.value.unshift(`[post] 数据是 ${val}，DOM 里也是「${countEl.value?.textContent}」`)
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="demo">
    <div class="row">
      <p class="value">
        DOM 显示：<span ref="countEl">{{ count }}</span>
      </p>
      <button class="btn" @click="count++">count++</button>
    </div>
    <ul class="logs">
      <li v-for="(log, i) in logs.slice(0, 6)" :key="logs.length - i">{{ log }}</li>
    </ul>
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.value {
  margin-right: 16px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn {
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.logs {
  margin-top: 8px;
  padding-left: 20px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.9;
}
</style>
