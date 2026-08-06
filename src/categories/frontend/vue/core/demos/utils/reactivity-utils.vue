<script setup lang="ts">
/* 响应式工具函数演示：对七种预置值逐一查看 isRef / isReactive / isReadonly / isProxy 判断结果与 toRaw 恢复原始对象（自包含，可作 playground 初始代码） */
import {
  computed,
  isProxy,
  isReactive,
  isReadonly,
  isRef,
  markRaw,
  reactive,
  readonly,
  ref,
  shallowReactive,
  toRaw,
} from 'vue'

/** 预置的七种被检测值：名称 + 创建表达式 + 值本身 */
const raw = { n: 1 }
const cases = [
  { name: 'ref(0)', value: ref(0) },
  { name: 'reactive({ n: 1 })', value: reactive(raw) },
  { name: 'readonly({ n: 1 })', value: readonly({ n: 1 }) },
  { name: 'shallowReactive({ n: 1 })', value: shallowReactive({ n: 1 }) },
  { name: 'readonly(reactive({ n: 1 }))', value: readonly(reactive({ n: 1 })) },
  { name: 'computed(() => 1)', value: computed(() => 1) },
  { name: 'markRaw({ n: 1 })', value: markRaw({ n: 1 }) },
]

/** 当前选中的检测值下标 */
const current = ref(0)

/** 对当前值执行四个判断函数，返回 [函数名, 结果] 列表 */
const checks = computed(() => {
  const v = cases[current.value]!.value
  return [
    ['isRef', isRef(v)],
    ['isReactive', isReactive(v)],
    ['isReadonly', isReadonly(v)],
    ['isProxy', isProxy(v)],
  ] as [string, boolean][]
})

/** 当前值经 toRaw 后是否变回了非代理对象（对代理才有意义） */
const rawAfterToRaw = computed(() => isProxy(toRaw(cases[current.value]!.value)))
</script>

<template>
  <div class="demo">
    <div class="pills">
      <button
        v-for="(c, i) in cases"
        :key="c.name"
        class="pill"
        :class="{ active: i === current }"
        @click="current = i"
      >
        {{ c.name }}
      </button>
    </div>
    <div class="results">
      <div v-for="[fn, result] in checks" :key="fn" class="row">
        <span class="fn">{{ fn }}(v)</span>
        <span class="result" :class="result ? 'yes' : 'no'">{{ result }}</span>
      </div>
      <div class="row">
        <span class="fn">isProxy(toRaw(v))</span>
        <span class="result" :class="rawAfterToRaw ? 'yes' : 'no'">{{ rawAfterToRaw }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
}

.pills {
  display: flex;
  flex-wrap: wrap;
}

.pill {
  margin-right: 8px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 980px;
  color: var(--color-text);
  font-size: 12px;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.pill:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.pill.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.results {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.row {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
}

.fn {
  width: 180px;
}

.result.yes {
  color: var(--color-accent);
  font-weight: 600;
}

.result.no {
  color: var(--color-text-tertiary);
}
</style>
