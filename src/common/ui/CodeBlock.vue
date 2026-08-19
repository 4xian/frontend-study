<script setup lang="ts">
/* 代码展示：Shiki 高亮、行号、语言标签、复制、超行折叠（需求文档 §5.1） */
import { computed, ref, watchEffect } from 'vue'
import { highlight } from './highlighter'

const props = defineProps<{ code: string; lang: string; collapsible?: boolean }>()

/** 默认折叠的行数阈值 */
const FOLD_LINES = 30

/** 高亮后的 HTML（空串表示尚未就绪，显示朴素回退） */
const html = ref('')
/** 是否已展开（超过阈值的代码默认折叠） */
const expanded = ref(false)
/** 复制成功反馈 */
const copied = ref(false)

/** 去掉尾部空行的源码 */
const trimmedCode = computed(() => props.code.replace(/\n+$/, ''))

/** 总行数 */
const lineCount = computed(() => trimmedCode.value.split('\n').length)

/** 是否需要折叠 */
const foldable = computed(() => props.collapsible !== false && lineCount.value > FOLD_LINES)

// 源码或语言变化时重新高亮
watchEffect(async () => {
  html.value = await highlight(trimmedCode.value, props.lang)
})

/**
 * 复制源码到剪贴板并展示成功反馈
 */
async function copy(): Promise<void> {
  await navigator.clipboard.writeText(trimmedCode.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div
    class="code-block"
    :class="{ folded: foldable && !expanded, expanded: foldable && expanded }"
  >
    <div class="toolbar">
      <span class="lang">{{ props.lang }}</span>
      <button
        type="button"
        class="copy-btn"
        :class="{ copied }"
        :aria-label="copied ? '代码已复制' : '复制代码'"
        aria-live="polite"
        @click="copy"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <div class="body">
      <div class="line-numbers" aria-hidden="true">
        <span v-for="n in lineCount" :key="n" class="line-no">{{ n }}</span>
      </div>
      <!-- Shiki 输出的受信 HTML；未就绪时显示朴素回退避免布局跳动 -->
      <div v-if="html" class="code" v-html="html" />
      <pre v-else class="code plain">{{ trimmedCode }}</pre>
    </div>
    <button
      v-if="foldable"
      type="button"
      class="fold-btn"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      {{ expanded ? '收起' : `展开全部 ${lineCount} 行` }}
    </button>
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  margin: var(--space-5) 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  background: var(--color-code-surface);
  color: #f5f5f7;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 var(--space-2) 0 var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-code-panel);
}

.lang {
  font-size: var(--font-size-xs);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  color: rgba(245, 245, 247, 0.58);
  text-transform: uppercase;
}

.copy-btn {
  min-width: 64px;
  min-height: 36px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: rgba(245, 245, 247, 0.72);
  touch-action: manipulation;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform 100ms var(--ease-out),
    opacity 100ms var(--ease-out);
}

.copy-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.copy-btn:active {
  opacity: 0.72;
  transform: scale(0.96);
}

.copy-btn.copied {
  color: #8ee6b8;
  background: rgba(66, 184, 131, 0.16);
}

.body {
  display: flex;
  overflow-x: auto;
  scrollbar-color: rgba(255, 255, 255, 0.22) transparent;
}

.folded .body {
  max-height: 480px;
  overflow-y: hidden;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: var(--space-3) 0;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  text-align: right;
  user-select: none;
}

.line-no {
  padding: 0 var(--space-3);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: rgba(245, 245, 247, 0.3);
}

.code {
  flex: 1;
  min-width: 0;
  padding: var(--space-3) var(--space-4) var(--space-3) 0;
}

.code.plain {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: rgba(245, 245, 247, 0.86);
  white-space: pre;
}

.code :deep(pre) {
  margin: 0;
  background: transparent !important;
}

.code :deep(.shiki),
.code :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: transparent !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}

.code :deep(code) {
  font-size: var(--font-size-sm);
  line-height: 1.7;
}

.fold-btn {
  display: block;
  width: 100%;
  padding: var(--space-2);
  min-height: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: rgba(245, 245, 247, 0.68);
  touch-action: manipulation;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    opacity 100ms var(--ease-out);
}

.fold-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.fold-btn:active {
  opacity: 0.68;
}

.folded .fold-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-top: var(--space-6);
  border-top: none;
  background: linear-gradient(transparent, var(--color-code-surface) 65%);
}

.expanded .body {
  animation: code-reveal 220ms var(--ease-out) both;
}

@keyframes code-reveal {
  from {
    opacity: 0.72;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .expanded .body {
    animation: code-reveal-reduced 120ms linear both;
  }

  .copy-btn:active {
    transform: none;
  }
}

@keyframes code-reveal-reduced {
  from {
    opacity: 0.72;
  }

  to {
    opacity: 1;
  }
}
</style>
