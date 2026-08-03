<script setup lang="ts">
/* 原理动画容器：播放/暂停/上一步/下一步/重置 + 步骤进度与解说（需求文档 §5.3） */
import { computed, onUnmounted, ref, shallowRef, watchEffect } from 'vue'
import type { Component } from 'vue'
import { resolvePrinciple } from '@/content/interactive/registry'

const props = defineProps<{ id?: string; animation?: string; content: string }>()

/** 动画组件（shallowRef：组件对象不需要深层响应式；约定接收 step prop，从 0 开始） */
const animationComp = shallowRef<Component | null>(null)
/** 每步解说文字（动画组件具名导出 steps） */
const steps = ref<string[]>([])
/** 当前步骤号，从 0 开始 */
const step = ref(0)
/** 是否自动播放中 */
const playing = ref(false)

/** 总步数 */
const total = computed(() => steps.value.length)

let timer: ReturnType<typeof setInterval> | null = null

// 完整 ID 或旧动画名变化时重新解析组件与解说
watchEffect(async () => {
  if (props.id) {
    const asset = resolvePrinciple(props.id)
    animationComp.value = asset?.component ?? null
    steps.value = asset ? await asset.loadSteps() : []
    step.value = 0
    return
  }

  if (!props.animation) {
    animationComp.value = null
    steps.value = []
    step.value = 0
    return
  }

  // 临时兼容旧 ApiDocPage；旧内容清除阶段删除 animation 分支。
  const legacyRegistry = await import('@/content/component-registry')
  animationComp.value = legacyRegistry.resolveAnimation(props.animation)
  steps.value = await legacyRegistry.loadAnimationSteps(props.animation)
  step.value = 0
})

/**
 * 停止自动播放
 */
function pause(): void {
  playing.value = false
  if (timer) clearInterval(timer)
  timer = null
}

/**
 * 开始自动播放：按固定间隔步进，到最后一步自动停止
 */
function play(): void {
  if (total.value === 0) return
  if (step.value >= total.value - 1) step.value = 0
  playing.value = true
  timer = setInterval(() => {
    if (step.value < total.value - 1) {
      step.value++
    } else {
      pause()
    }
  }, 2200)
}

/**
 * 上一步（自动播放中先暂停）
 */
function prev(): void {
  pause()
  if (step.value > 0) step.value--
}

/**
 * 下一步（自动播放中先暂停）
 */
function next(): void {
  pause()
  if (step.value < total.value - 1) step.value++
}

/**
 * 重置到第一步
 */
function reset(): void {
  pause()
  step.value = 0
}

onUnmounted(pause)
</script>

<template>
  <div class="principle">
    <p class="intro">{{ props.content }}</p>
    <div class="stage">
      <component :is="animationComp" v-if="animationComp" :step="step" />
      <p v-else class="missing">未找到动画组件：{{ props.id ?? props.animation ?? '未提供 ID' }}</p>
    </div>
    <p class="narration">{{ steps[step] }}</p>
    <div class="controls">
      <button class="ctrl-btn" :disabled="step === 0" aria-label="重置" @click="reset">⏮</button>
      <button class="ctrl-btn" :disabled="step === 0" aria-label="上一步" @click="prev">←</button>
      <button
        class="ctrl-btn play"
        :aria-label="playing ? '暂停' : '播放'"
        @click="playing ? pause() : play()"
      >
        {{ playing ? '⏸' : '▶' }}
      </button>
      <button class="ctrl-btn" :disabled="step >= total - 1" aria-label="下一步" @click="next">
        →
      </button>
      <span class="progress">{{ total ? step + 1 : 0 }} / {{ total }}</span>
    </div>
  </div>
</template>

<style scoped>
.principle {
  margin: var(--space-4) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.intro {
  padding: var(--space-3) var(--space-5) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stage {
  padding: var(--space-5);
}

.missing {
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.narration {
  min-height: 2.6em;
  padding: 0 var(--space-5);
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--color-text);
}

.controls {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-5) var(--space-4);
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-right: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition:
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.ctrl-btn:hover:not(:disabled) {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.ctrl-btn:active:not(:disabled) {
  transform: scale(0.94);
  opacity: 0.72;
}

.ctrl-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.ctrl-btn.play {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.progress {
  margin-left: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .ctrl-btn {
    transition:
      color var(--duration-fast) linear,
      border-color var(--duration-fast) linear,
      background-color var(--duration-fast) linear,
      opacity var(--duration-fast) linear;
  }

  .ctrl-btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
