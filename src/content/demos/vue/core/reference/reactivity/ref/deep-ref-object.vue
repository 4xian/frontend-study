<script setup lang="ts">
/* ref 深层响应演示：修改嵌套属性同样触发更新（自包含） */
import { ref } from 'vue'

const user = ref({
  name: '小明',
  address: { city: '杭州' },
})

/**
 * 修改嵌套对象的深层属性，验证 ref 的深层响应性。
 */
function moveCity() {
  user.value.address.city = user.value.address.city === '杭州' ? '上海' : '杭州'
}
</script>

<template>
  <div class="demo">
    <p class="value">user.value.address.city = {{ user.address.city }}</p>
    <button class="btn" @click="moveCity">修改深层属性</button>
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
  padding: 4px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 980px;
  color: var(--color-accent);
  font-size: 13px;
}

.btn:hover {
  background: var(--color-accent-soft);
}
</style>
