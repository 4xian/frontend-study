<script setup lang="ts">
/* computed 缓存演示：派生列表过滤，getter 执行次数可见（自包含） */
import { computed, ref, watchEffect } from 'vue'

const keyword = ref('')
const other = ref(0)
const books = ['Vue 3 指南', 'TypeScript 手册', 'Vite 文档', 'Vue Router 教程']

/** getter 实际执行次数（普通变量，避免让计数器进入 computed 的依赖） */
let runsRaw = 0
/** 展示用的执行次数 */
const runs = ref(0)

/** 按关键字过滤的书目（只依赖 keyword，other 的变化不会使它重算） */
const filtered = computed(() => {
  runsRaw++
  return books.filter((b) => b.includes(keyword.value))
})

// filtered 重新求值后，把最新执行次数同步到展示层
watchEffect(() => {
  void filtered.value
  runs.value = runsRaw
})
</script>

<template>
  <div class="demo">
    <div class="row">
      <input v-model="keyword" class="input" placeholder="输入关键字过滤，如：Vue" />
      <button class="btn" @click="other++">修改无关状态 other = {{ other }}</button>
    </div>
    <p class="meta">getter 已执行 {{ runs }} 次（点右侧按钮不会增加，输入关键字才会）</p>
    <ul class="list">
      <li v-for="book in filtered" :key="book">{{ book }}</li>
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

.input {
  padding: 5px 12px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 8px;
  font: inherit;
  background: transparent;
  color: inherit;
}

.btn {
  margin-left: 8px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.meta {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.65;
}

.list {
  margin-top: 8px;
  padding-left: 20px;
  line-height: 1.9;
}
</style>
