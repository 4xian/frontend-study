<script setup lang="ts">
/* 搜索弹层：只依赖统一搜索 provider，支持键盘与触屏直接选择结果。 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { SearchHit, SearchProvider } from '@/content/catalog'

const props = defineProps<{
  open: boolean
  provider: SearchProvider
  globalProvider?: SearchProvider
}>()
const emit = defineEmits<{ close: []; open: [] }>()

const router = useRouter()

/** 搜索关键字 */
const query = ref('')
/** 当前键盘选中的结果下标（跨分组的全局下标） */
const selected = ref(0)
/** 是否将搜索范围扩展到全站 */
const searchAll = ref(false)
/** 输入框引用 */
const inputEl = ref<HTMLInputElement | null>(null)
/** 弹层容器引用 */
const dialogEl = ref<HTMLElement | null>(null)

let returnFocusEl: HTMLElement | null = null

/** 当前 provider 返回的统一搜索结果 */
const results = computed(() =>
  searchAll.value && props.globalProvider
    ? props.globalProvider(query.value)
    : props.provider(query.value),
)

/** 按搜索结果声明的分组顺序组织结果 */
const grouped = computed(() => {
  const groups: { id: string; name: string; hits: SearchHit[] }[] = []
  for (const hit of results.value) {
    let group = groups.find((item) => item.id === hit.group)
    if (!group) {
      group = { id: hit.group, name: hit.groupLabel, hits: [] }
      groups.push(group)
    }
    group.hits.push(hit)
  }
  return groups
})

/** 与分组展示顺序一致的扁平结果 */
const orderedResults = computed(() => grouped.value.flatMap((group) => group.hits))

// 打开时记录触发焦点，关闭后恢复；弹层初始焦点落在搜索输入框。
watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null
      query.value = ''
      selected.value = 0
      searchAll.value = false
      await nextTick()
      inputEl.value?.focus()
    } else if (returnFocusEl) {
      await nextTick()
      returnFocusEl.focus()
      returnFocusEl = null
    }
  },
  { immediate: true },
)

// 关键字变化时重置选中项
watch(query, () => (selected.value = 0))

/**
 * 请求父组件关闭搜索弹层。
 */
function close(): void {
  emit('close')
}

/**
 * 跳转到调用方明确传入的搜索结果并关闭弹层。
 */
function navigateToHit(hit: SearchHit): void {
  void router.push(hit.path)
  close()
}

/**
 * 返回弹层内当前可聚焦的控件，用于循环焦点。
 */
function getFocusableElements(): HTMLElement[] {
  if (!dialogEl.value) return []
  return Array.from(
    dialogEl.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

/**
 * 全局处理快捷键、关闭、结果选择与弹层焦点循环。
 */
function onKeydown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key.toLocaleLowerCase() === 'k') {
    e.preventDefault()
    if (props.open) {
      emit('close')
    } else {
      emit('open')
    }
    return
  }
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key === 'Tab') {
    const focusable = getFocusableElements()
    if (!focusable.length) return
    const first = focusable[0]!
    const last = focusable.at(-1)!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    } else if (!dialogEl.value?.contains(document.activeElement)) {
      e.preventDefault()
      first.focus()
    }
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selected.value = Math.min(selected.value + 1, Math.max(orderedResults.value.length - 1, 0))
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selected.value = Math.max(selected.value - 1, 0)
  }
  if (e.key === 'Enter') {
    const hit = orderedResults.value[selected.value]
    if (hit) navigateToHit(hit)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/**
 * 计算分组结果对应的全局下标。
 */
function globalIndex(groupId: string, localIndex: number): number {
  let count = 0
  for (const group of grouped.value) {
    if (group.id === groupId) return count + localIndex
    count += group.hits.length
  }
  return 0
}
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div v-if="props.open" class="overlay" @click.self="close">
        <div
          ref="dialogEl"
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-dialog-title"
        >
          <h2 id="search-dialog-title" class="sr-only">站内搜索</h2>
          <input
            ref="inputEl"
            v-model="query"
            class="input"
            type="text"
            aria-label="搜索内容"
            placeholder="搜索知识点…"
          />
          <button
            v-if="props.globalProvider"
            type="button"
            class="scope-button"
            :aria-pressed="searchAll"
            @click="searchAll = !searchAll"
          >
            {{ searchAll ? '仅搜索当前生态' : '搜索全站' }}
          </button>
          <div class="results">
            <template v-if="grouped.length">
              <section v-for="group in grouped" :key="group.id" class="group">
                <p class="group-name">{{ group.name }}</p>
                <button
                  v-for="(hit, i) in group.hits"
                  :key="hit.id"
                  type="button"
                  class="result"
                  :data-path="hit.path"
                  :class="{ selected: globalIndex(group.id, i) === selected }"
                  @mouseenter="selected = globalIndex(group.id, i)"
                  @click="navigateToHit(hit)"
                >
                  <span class="result-title">{{ hit.title }}</span>
                  <span class="result-summary">{{ hit.summary }}</span>
                </button>
              </section>
            </template>
            <p v-else class="no-result">未找到「{{ query }}」相关内容</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  background: var(--color-bg-scrim);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dialog {
  width: min(560px, calc(100vw - 2 * var(--space-5)));
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.input {
  padding: var(--space-4) var(--space-5);
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  font: inherit;
  font-size: var(--font-size-md);
  color: var(--color-text);
  outline: none;
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.scope-button {
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  margin: var(--space-2) var(--space-3) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.scope-button[aria-pressed='true'] {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.results {
  overflow-y: auto;
  padding: var(--space-2);
}

.group-name {
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.result {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  text-align: left;
}

.result.selected {
  background: var(--color-accent-soft);
}

.result-title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text);
}

.result.selected .result-title {
  color: var(--color-accent);
}

.result-summary {
  margin-top: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.no-result {
  padding: var(--space-5);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.search-enter-active,
.search-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.search-enter-active .dialog,
.search-leave-active .dialog {
  transition: transform var(--duration-fast) var(--ease-spring);
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
}

.search-enter-from .dialog,
.search-leave-to .dialog {
  transform: scale(0.97);
}
</style>
