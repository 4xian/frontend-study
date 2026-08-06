<template>
  <main class="not-found" role="status">
    <p>404</p>
    <h1>内容不存在或尚未开放</h1>
    <span>当前地址没有对应的已发布内容。</span>
    <RouterLink to="/">返回技术中心</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  width: min(var(--page-reading-width), calc(100% - 2 * var(--space-4)));
  padding: var(--space-8) 0;
  margin: 0 auto;
}

.not-found p {
  color: var(--color-accent);
  font-weight: 600;
}

.not-found h1 {
  margin-top: var(--space-2);
  font-size: var(--font-size-xl);
}

.not-found span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
}

.not-found a {
  display: inline-block;
  margin-top: var(--space-4);
}
</style>
