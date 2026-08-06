<script setup lang="ts">
/* ref 模板解包演示：顶层 ref 自动解包，对象属性中的 ref 不解包（自包含） */
import { ref } from 'vue'

const count = ref(1)
const object = { id: ref(2) }

/** 演示用的插值写法文本（避免在模板中书写嵌套花括号） */
const exprTop = '{{ count }}'
const exprNested = '{{ object.id + 1 }}'
const exprLast = '{{ object.id }}'
</script>

<template>
  <div class="demo">
    <p class="line">
      顶层 ref：<code>{{ exprTop }}</code> → {{ count }}（自动解包）
    </p>
    <p class="line">
      非顶层：<code>{{ exprNested }}</code> → {{ object.id.value + 1 }}（表达式中不解包，需要
      .value，否则得到 [object Object]1）
    </p>
    <p class="line">
      文本插值末位：<code>{{ exprLast }}</code> → {{ object.id }}（作为最终求值结果被解包）
    </p>
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

.line {
  margin: 6px 0;
  line-height: 1.8;
}

code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.9em;
}
</style>
