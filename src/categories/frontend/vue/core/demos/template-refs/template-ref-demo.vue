<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'

const input = useTemplateRef('my-input')
const atSetup = String(input.value)
const atMounted = ref('（等待挂载）')

onMounted(() => {
  atMounted.value = input.value ? input.value.tagName : 'null'
})

/** 聚焦被模板引用绑定的输入框。 */
function focusInput() {
  input.value?.focus()
}
</script>

<template>
  <div class="demo">
    <input ref="my-input" placeholder="被引用的输入框" />
    <button @click="focusInput">focus() 聚焦它</button>
    <ul class="facts">
      <li>
        setup 执行时 input.value：<code>{{ atSetup }}</code
        >（此刻元素还不存在）
      </li>
      <li>
        onMounted 里 input.value.tagName：<code>{{ atMounted }}</code>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

input {
  padding: 6px 10px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font: inherit;
  color: inherit;
  background: transparent;
}

button {
  padding: 6px 14px;
  margin-left: 8px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.facts {
  margin-top: 12px;
  padding-left: 20px;
}

.facts li {
  margin-top: 4px;
}

code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 13px;
  color: #0071e3;
}
</style>
