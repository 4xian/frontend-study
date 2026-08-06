<script setup lang="ts">
/* Transition 演示：fade 过渡 + out-in 模式切换对照（自包含，可作 playground 初始代码） */
import { ref } from 'vue'

const show = ref(true)
const view = ref<'A' | 'B'>('A')

/**
 * 切换 A/B 视图：观察 out-in 模式下旧内容先退场、新内容再进场
 */
function toggleView() {
  view.value = view.value === 'A' ? 'B' : 'A'
}
</script>

<template>
  <div class="demo">
    <p class="caption">基础 fade：v-if 切换</p>
    <div class="row">
      <button class="btn" @click="show = !show">{{ show ? '隐藏' : '显示' }}</button>
      <Transition name="fade">
        <span v-if="show" class="box">Hello Transition</span>
      </Transition>
    </div>
    <p class="caption">mode="out-in"：先出后进的视图切换</p>
    <div class="row">
      <button class="btn" @click="toggleView">切换到视图 {{ view === 'A' ? 'B' : 'A' }}</button>
      <Transition name="slide" mode="out-in">
        <span v-if="view === 'A'" key="A" class="box box-a">视图 A</span>
        <span v-else key="B" class="box box-b">视图 B</span>
      </Transition>
    </div>
    <p class="hint">fade 直接淡入淡出；out-in 模式里旧视图完整退场后新视图才进场，不会重叠。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.caption {
  margin: 6px 0;
  font-size: 13px;
  font-weight: 600;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  min-height: 34px;
}

.btn {
  margin-right: 12px;
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.btn:hover {
  background: rgba(0, 113, 227, 0.1);
}

.box {
  padding: 4px 12px;
  background: #f5f5f7;
  border-radius: 8px;
  font-size: 14px;
}

.box-a {
  background: rgba(0, 113, 227, 0.12);
}

.box-b {
  background: rgba(52, 199, 89, 0.15);
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
