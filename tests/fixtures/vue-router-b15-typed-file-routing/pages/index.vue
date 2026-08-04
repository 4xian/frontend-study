<template>
  <section class="page-view" data-testid="fixture-home-page">
    <p>生成路由：首页</p>
    <RouterLink :to="{ name: '/users/[id]', params: { id: 42 } }"> 打开用户 42 </RouterLink>
  </section>
</template>
