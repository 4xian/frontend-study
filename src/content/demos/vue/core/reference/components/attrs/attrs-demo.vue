<script setup lang="ts">
/* 透传 attributes 演示：inheritAttrs 开关对照，观察 class 与监听器的落点（自包含，可作 playground 初始代码） */
import { defineComponent, h, mergeProps, ref } from 'vue'

const clickLog = ref('')

/**
 * 默认组件：不关闭 inheritAttrs，透传属性自动落到根元素（外层 div）
 */
const DefaultWrapper = defineComponent({
  /** 将未声明 attributes 自动透传到根元素。 */
  setup(_, { slots }) {
    return () =>
      h('div', { class: 'wrapper' }, [h('button', { class: 'inner-btn' }, slots.default?.())])
  },
})

/**
 * 自定义落点组件：inheritAttrs: false + 手动把 attrs 绑到内层按钮
 * （模板里 v-bind="$attrs" 会自动做 class 合并，手写 h() 需用 mergeProps）
 */
const CustomWrapper = defineComponent({
  inheritAttrs: false,
  /** 将 attributes 手动绑定到内层按钮。 */
  setup(_, { slots, attrs }) {
    return () =>
      h('div', { class: 'wrapper' }, [
        h('button', mergeProps({ class: 'inner-btn' }, attrs), slots.default?.()),
      ])
  },
})

/**
 * 记录点击来源：验证透传的 onClick 监听器落在了哪个元素上
 */
function onOuterClick(name: string) {
  clickLog.value = `点击被 ${name} 接收（监听器落点所在元素）`
}
</script>

<template>
  <div class="demo">
    <p class="caption">默认：attrs 落到根元素（外层 div 变红、点击 div 任意处都触发）</p>
    <DefaultWrapper class="highlight" @click="onOuterClick('外层 div')">按钮 A</DefaultWrapper>
    <p class="caption">inheritAttrs: false + v-bind="$attrs"：attrs 落到内层按钮</p>
    <CustomWrapper class="highlight" @click="onOuterClick('内层 button')">按钮 B</CustomWrapper>
    <p v-if="clickLog" class="value">{{ clickLog }}</p>
    <p class="hint">两个组件收到的透传属性相同（红色边框 class + 点击监听器），差别只在落点。</p>
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

.demo :deep(.wrapper) {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
  margin-bottom: 8px;
}

.demo :deep(.highlight) {
  border: 2px solid #ff3b30;
}

.demo :deep(.inner-btn) {
  padding: 4px 14px;
  border: 1px solid #0071e3;
  border-radius: 980px;
  color: #0071e3;
  font-size: 13px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.demo :deep(.inner-btn:hover) {
  background: rgba(0, 113, 227, 0.1);
}

.value {
  margin-top: 4px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
