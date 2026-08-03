<script setup lang="ts">
/* 通用渲染器：按路由参数加载数据文件，遍历 blocks 分发渲染（需求文档 §3.4） */
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findDoc } from '@/content/registry'
import { resolveDemo } from '@/content/component-registry'
import { currentDoc } from '@/content/current-doc'
import type { ApiDoc } from '@/content/types'
import CodeBlock from '@/components/CodeBlock.vue'
import DemoBox from '@/components/DemoBox.vue'
import PrincipleAnimation from '@/components/PrincipleAnimation.vue'
import HeadingBlock from '@/components/blocks/HeadingBlock.vue'
import TextBlock from '@/components/blocks/TextBlock.vue'
import TipBlock from '@/components/blocks/TipBlock.vue'
import TableBlock from '@/components/blocks/TableBlock.vue'

const route = useRoute()

/** 当前知识点数据（undefined 加载中，null 不存在） */
const doc = ref<ApiDoc | null | undefined>(undefined)

// 路由变化时重新加载数据文件，并同步给右侧大纲
watch(
  () => route.params,
  async (params) => {
    if (!params.id) return
    const entry = findDoc(params.section as string, params.category as string, params.id as string)
    doc.value = entry ? await entry.load() : null
    currentDoc.value = doc.value ?? null
    // 内容异步加载完成后再定位 URL hash 锚点（scrollBehavior 执行时元素尚不存在）
    if (route.hash) {
      await nextTick()
      document.querySelector(decodeURIComponent(route.hash))?.scrollIntoView()
    }
  },
  { immediate: true },
)

// 离开知识点页时清空大纲数据
onUnmounted(() => (currentDoc.value = null))
</script>

<template>
  <article v-if="doc" class="doc">
    <header class="doc-header">
      <h1 class="title">{{ doc.title }}</h1>
      <p class="summary">{{ doc.summary }}</p>
    </header>
    <template v-for="(block, i) in doc.blocks" :key="i">
      <HeadingBlock v-if="block.type === 'heading'" :content="block.content" />
      <TextBlock v-else-if="block.type === 'text'" :content="block.content" />
      <CodeBlock v-else-if="block.type === 'code'" :code="block.content" :lang="block.lang" />
      <DemoBox
        v-else-if="block.type === 'demo'"
        :component="block.component"
        :desc="block.desc"
        :playground="block.playground"
      />
      <TipBlock v-else-if="block.type === 'tip'" :style="block.style" :content="block.content" />
      <PrincipleAnimation
        v-else-if="block.type === 'principle'"
        :animation="block.animation"
        :content="block.content"
      />
      <TableBlock v-else-if="block.type === 'table'" :headers="block.headers" :rows="block.rows" />
      <component :is="resolveDemo(block.component)" v-else-if="block.type === 'custom'" />
    </template>
  </article>
  <p v-else-if="doc === null" class="empty">内容不存在</p>
</template>

<style scoped>
.doc-header {
  padding: var(--space-5) 0 var(--space-6);
}

.title {
  max-width: 680px;
  font-size: var(--font-size-title);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
}

.summary {
  max-width: 680px;
  margin-top: var(--space-3);
  font-size: var(--font-size-lg);
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.empty {
  color: var(--color-text-secondary);
}

@media (max-width: 620px) {
  .doc-header {
    padding-top: var(--space-3);
  }

  .title {
    font-size: 44px;
  }

  .summary {
    font-size: 19px;
  }
}
</style>
