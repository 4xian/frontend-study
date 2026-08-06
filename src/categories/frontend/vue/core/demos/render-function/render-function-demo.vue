<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import type { PropType, VNode } from 'vue'

interface TreeNode {
  id: number
  label: string
  children?: TreeNode[]
}

const tree = ref<TreeNode>({
  id: 1,
  label: '根节点',
  children: [
    { id: 2, label: '子节点 1', children: [{ id: 3, label: '孙节点 1-1' }] },
    { id: 4, label: '子节点 2' },
  ],
})
let nextId = 5

const TreeView = defineComponent({
  props: { node: { type: Object as PropType<TreeNode>, required: true } },
  /** 建立递归树的渲染函数。 */
  setup(props) {
    /** 为当前数据节点创建一枚新的列表项 VNode。 */
    function renderNode(node: TreeNode): VNode {
      const children = node.children?.map(renderNode) ?? []
      return h('li', { class: 'node', 'data-node-id': node.id }, [
        h('span', node.label),
        children.length > 0 ? h('ul', { class: 'branch' }, children) : null,
      ])
    }

    return () => h('ul', { class: 'branch root' }, [renderNode(props.node)])
  },
})

/** 给根节点添加一个数据驱动的新子节点。 */
function addChild() {
  tree.value.children?.push({ id: nextId, label: `子节点 ${nextId}` })
  nextId += 1
}
</script>

<template>
  <div class="demo">
    <button type="button" class="add-button" @click="addChild">添加子节点</button>
    <TreeView :node="tree" />
    <p class="hint">每次 renderNode 调用都创建新的 VNode，数据变化后渲染函数重新执行。</p>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.add-button {
  align-self: flex-start;
  min-height: 36px;
  padding: 0 var(--space-3);
  margin-bottom: var(--space-3);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.add-button:hover {
  background: var(--color-accent-soft);
}

.add-button:active {
  transform: scale(0.97);
}

.demo :deep(.branch) {
  margin: 0;
  padding-left: var(--space-5);
  list-style: none;
}

.demo :deep(.root) {
  padding: var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.demo :deep(.node) {
  padding: 2px 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
}

.demo :deep(.node > span)::before {
  content: '· ';
  color: var(--color-accent);
}

.hint {
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (prefers-reduced-motion: reduce) {
  .add-button {
    transition: background-color var(--duration-fast) linear;
  }

  .add-button:active {
    transform: none;
  }
}
</style>
