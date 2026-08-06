<script setup lang="ts">
/* 可写 computed 演示：get/set 双向换算（自包含） */
import { computed, ref } from 'vue'

const celsius = ref(25)

/** 华氏温度：读取时由摄氏换算，写入时反向更新摄氏 */
const fahrenheit = computed({
  get: () => celsius.value * 1.8 + 32,
  set: (val) => {
    celsius.value = Math.round(((val - 32) / 1.8) * 10) / 10
  },
})
</script>

<template>
  <div class="demo">
    <label class="field">
      摄氏 °C
      <input v-model.number="celsius" type="number" class="input" />
    </label>
    <span class="eq">⇄</span>
    <label class="field">
      华氏 °F（可写 computed）
      <input v-model.number="fahrenheit" type="number" class="input" />
    </label>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  font-size: 13px;
}

.field {
  display: flex;
  flex-direction: column;
  opacity: 0.85;
}

.input {
  margin-top: 4px;
  width: 130px;
  padding: 5px 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 8px;
  font: inherit;
  background: transparent;
  color: inherit;
}

.eq {
  margin: 0 14px 6px;
  font-size: 18px;
  opacity: 0.5;
}
</style>
