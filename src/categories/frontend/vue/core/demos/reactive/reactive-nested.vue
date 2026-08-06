<script setup lang="ts">
/* reactive 基础与深层响应演示：直接属性访问 + 深层嵌套修改同样触发更新（自包含，可作 playground 初始代码） */
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: '小明',
    address: { city: '北京' },
  },
})

/**
 * 修改深层嵌套属性，验证深层转换后的响应性。
 */
function switchCity() {
  state.user.address.city = state.user.address.city === '北京' ? '上海' : '北京'
}
</script>

<template>
  <div class="demo">
    <p class="value">state.count = {{ state.count }}</p>
    <p class="value">state.user.address.city = "{{ state.user.address.city }}"</p>
    <div class="btns">
      <button class="btn" @click="state.count++">state.count++</button>
      <button class="btn" @click="switchCity">修改深层属性 city</button>
    </div>
  </div>
</template>

<style scoped>
.value {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  margin-bottom: 8px;
}

.btns {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
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
