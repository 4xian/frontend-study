<script setup lang="ts">
import { defineComponent, h, inject, provide, readonly, ref } from 'vue'
import type { InjectionKey, Ref } from 'vue'

const count = ref(0)
const countKey: InjectionKey<Readonly<Ref<number>>> = Symbol('count')
const incrementKey: InjectionKey<() => void> = Symbol('increment')

provide(countKey, readonly(count))
provide(incrementKey, () => count.value++)

/** 注入祖先提供的只读状态和修改方法。 */
const Leaf = defineComponent({
  /** 注入状态和动作并返回叶子组件渲染函数。 */
  setup() {
    const injected = inject(countKey)!
    const increment = inject(incrementKey)!
    return () =>
      h('div', { class: 'leaf' }, [
        h('p', `注入到的 count：${injected.value}`),
        h('button', { onClick: increment }, '调用注入的 increment()'),
      ])
  },
})

/** 渲染不转发任何 props 的中间层。 */
const Middle = defineComponent({
  /** 返回只负责组织层级的中间组件渲染函数。 */
  setup() {
    return () => h('div', { class: 'middle' }, [h('p', '中间层（未传递任何 props）'), h(Leaf)])
  },
})
</script>

<template>
  <div class="demo">
    <p>
      顶层组件的 count：<strong>{{ count }}</strong>
    </p>
    <Middle />
  </div>
</template>

<style scoped>
.demo {
  font-size: 14px;
}

.demo :deep(.middle) {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px dashed #d2d2d7;
  border-radius: 8px;
  opacity: 0.9;
}

.demo :deep(.leaf) {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 113, 227, 0.08);
}

.demo :deep(button) {
  padding: 5px 12px;
  margin-top: 8px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
</style>
