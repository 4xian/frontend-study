<script setup lang="ts">
/* 对比表格块：原生 table 呈现（需求文档 §3.3 table 块，禁止 grid） */
const props = defineProps<{ headers: string[]; rows: string[][] }>()
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th v-for="(h, i) in props.headers" :key="i">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in props.rows" :key="i">
          <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  margin: var(--space-4) 0;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

th {
  padding: var(--space-2) var(--space-4);
  text-align: left;
  font-weight: 600;
  background: var(--color-bg-sunken);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

td {
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  line-height: 1.7;
}

tr:last-child td {
  border-bottom: none;
}
</style>
