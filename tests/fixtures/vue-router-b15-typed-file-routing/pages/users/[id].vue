<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute('/users/[id]')
</script>

<template>
  <section class="page-view" data-testid="fixture-user-page">
    <p>生成路由：用户 {{ route.params.id }}</p>
    <RouterLink :to="{ name: '/', params: {} }">返回首页</RouterLink>
  </section>
</template>
