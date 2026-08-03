<script setup lang="ts">
/* 作用域插槽演示：同一列表组件被两种插槽模板渲染成不同样子（自包含，可作 playground 初始代码） */
import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

interface Item {
  id: number
  body: string
  username: string
}

const items = ref<Item[]>([
  { id: 1, body: '响应式基础', username: 'Alice' },
  { id: 2, body: '组件通信', username: 'Bob' },
  { id: 3, body: '插槽机制', username: 'Carol' },
])

/**
 * 内联列表组件：只负责数据循环，每项渲染交给 item 作用域插槽
 */
const FancyList = defineComponent({
  props: { items: { type: Array as PropType<Item[]>, required: true } },
  /** 将每个列表项交给父组件提供的 item 插槽渲染。 */
  setup(props, { slots }) {
    return () =>
      h(
        'ul',
        { class: 'list' },
        props.items.map((item) => h('li', { key: item.id, class: 'row-item' }, slots.item?.(item))),
      )
  },
})
</script>

<template>
  <div class="demo">
    <p class="caption">写法一：正文 + 作者</p>
    <FancyList :items="items">
      <template #item="{ body, username }">
        <span>{{ body }}</span>
        <span class="author">by {{ username }}</span>
      </template>
    </FancyList>
    <p class="caption">写法二：仅编号 + 标题（同一组件，另一种插槽模板）</p>
    <FancyList :items="items">
      <template #item="{ id, body }">
        <span class="badge">#{{ id }}</span>
        <span>{{ body }}</span>
      </template>
    </FancyList>
    <p class="hint">
      列表组件只管数据与循环；每项长什么样由父组件的插槽模板决定——这就是作用域插槽的分工。
    </p>
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

.demo :deep(.list) {
  margin: 0 0 8px;
  padding: 8px 12px;
  list-style: none;
  background: #f5f5f7;
  border-radius: 8px;
}

.demo :deep(.row-item) {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 14px;
}

.author {
  margin-left: 8px;
  font-size: 12px;
  color: #6e6e73;
}

.badge {
  margin-right: 8px;
  padding: 1px 8px;
  background: #0071e3;
  color: #fff;
  border-radius: 980px;
  font-size: 12px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.hint {
  margin-top: 4px;
  font-size: 13px;
  color: #6e6e73;
}
</style>
