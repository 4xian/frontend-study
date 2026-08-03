<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import DemoBox from '@/components/DemoBox.vue'
import PrincipleAnimation from '@/components/PrincipleAnimation.vue'
import HeadingBlock from '@/components/blocks/HeadingBlock.vue'
import PitfallsBlock from '@/components/blocks/PitfallsBlock.vue'
import TableBlock from '@/components/blocks/TableBlock.vue'
import TextBlock from '@/components/blocks/TextBlock.vue'
import TipBlock from '@/components/blocks/TipBlock.vue'
import ExerciseBlock from './ExerciseBlock.vue'
import StepsBlock from './StepsBlock.vue'
import { resolveInteractive } from '@/content/interactive/registry'
import type { ContentBlock } from '@/content/schema'

defineProps<{ blocks: ContentBlock[] }>()
</script>

<template>
  <section class="content-blocks">
    <template v-for="(block, index) in blocks" :key="index">
      <HeadingBlock
        v-if="block.type === 'heading'"
        class="block block-heading"
        :content="block.content"
      />
      <TextBlock
        v-else-if="block.type === 'text'"
        class="block block-text"
        :content="block.content"
      />
      <CodeBlock
        v-else-if="block.type === 'code'"
        class="block block-code"
        :code="block.content"
        :lang="block.lang"
      />
      <DemoBox
        v-else-if="block.type === 'demo'"
        class="block block-demo"
        :id="block.id"
        :desc="block.description"
        :playground="block.playground"
      />
      <TipBlock
        v-else-if="block.type === 'tip'"
        class="block block-tip"
        :style="block.style"
        :content="block.content"
      />
      <PrincipleAnimation
        v-else-if="block.type === 'principle'"
        class="block block-principle"
        :id="block.id"
        :content="block.content"
      />
      <TableBlock
        v-else-if="block.type === 'table'"
        class="block block-table"
        :headers="block.headers"
        :rows="block.rows"
      />
      <StepsBlock
        v-else-if="block.type === 'steps'"
        class="block block-steps"
        :items="block.items"
      />
      <ExerciseBlock
        v-else-if="block.type === 'exercise'"
        class="block block-exercise"
        :title="block.title"
        :instructions="block.instructions"
        :answer="block.answer"
      />
      <ul v-else-if="block.type === 'checklist'" class="block block-checklist checklist">
        <li v-for="item in block.items" :key="item.label">
          <label>
            <input type="checkbox" :checked="item.checked" disabled />
            <span>{{ item.label }}</span>
          </label>
        </li>
      </ul>
      <section v-else-if="block.type === 'compare'" class="block block-compare compare">
        <figure>
          <figcaption v-if="block.labels">{{ block.labels[0] }}</figcaption>
          <pre><code>{{ block.before }}</code></pre>
        </figure>
        <figure>
          <figcaption v-if="block.labels">{{ block.labels[1] }}</figcaption>
          <pre><code>{{ block.after }}</code></pre>
        </figure>
      </section>
      <PitfallsBlock
        v-else-if="block.type === 'pitfalls'"
        class="block block-pitfalls"
        :items="block.items"
      />
      <div v-else-if="block.type === 'interactive'" class="block block-interactive interactive">
        <component :is="resolveInteractive(block.id)" v-if="resolveInteractive(block.id)" />
        <p v-else class="asset-state" role="status">未找到交互组件：{{ block.id }}</p>
      </div>
      <p v-else class="block asset-state" role="status">暂不支持此内容块</p>
    </template>
  </section>
</template>

<style scoped>
.content-blocks > .block {
  margin-top: var(--space-5);
}

.content-blocks > .block:first-child {
  margin-top: 0;
}

.content-blocks > .block-heading {
  margin-top: var(--space-7);
  margin-bottom: var(--space-4);
}

.content-blocks > .block-heading + .block-text {
  margin-top: 0;
}

.content-blocks > .block-text + .block-text {
  margin-top: var(--space-3);
}

.content-blocks > .block-code,
.content-blocks > .block-demo,
.content-blocks > .block-principle,
.content-blocks > .block-table,
.content-blocks > .block-steps,
.content-blocks > .block-exercise,
.content-blocks > .block-compare,
.content-blocks > .block-pitfalls,
.content-blocks > .block-interactive {
  margin-top: var(--space-6);
}

.checklist {
  padding-left: var(--space-6);
}

.checklist li + li {
  margin-top: var(--space-4);
}

.checklist {
  list-style: none;
}

.checklist label {
  display: flex;
  align-items: flex-start;
}

.checklist input {
  flex: 0 0 auto;
  margin-top: 0.25em;
  margin-right: var(--space-2);
}

.checklist span {
  line-height: 1.65;
}

.compare {
  display: flex;
}

.compare figure {
  flex: 1;
  min-width: 0;
}

.compare figure + figure {
  margin-left: var(--space-3);
}

.compare figcaption {
  margin-bottom: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.compare pre {
  min-height: 100%;
  padding: var(--space-3);
  margin: 0;
  border-radius: var(--radius-sm);
  background: var(--color-code-surface);
  color: #f5f5f7;
  overflow-x: auto;
}

.interactive {
  min-width: 0;
}

.asset-state {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-warning);
  background: var(--color-bg-elevated);
}

@media (max-width: 620px) {
  .compare {
    display: block;
  }

  .compare figure + figure {
    margin-top: var(--space-3);
    margin-left: 0;
  }
}
</style>
