---
id: engineering.vite.learn.basics.dev-server-browser-loading
type: lesson
title: 开发服务器、模块请求与浏览器加载
summary: 用一次真实请求解释 Vite 如何转换模块、解析依赖并返回浏览器可执行代码。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 34
prerequisites:
  - engineering.vite.learn.basics.project-entry-and-module-graph
related:
  - engineering.vite.reference.config-server
tags:
  - dev server
  - ESM
  - 请求
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能使用请求、响应和 Initiator 定位模块转换问题。
  - 能区分源码路径、浏览器 URL 和文件系统路径。
sources:
  - title: Vite Features
    url: https://vite.dev/guide/features
    sourceType: official-reference
  - title: Vite Server Options
    url: https://vite.dev/config/server-options
    sourceType: official-reference
---

# 开发服务器、模块请求与浏览器加载

## 一、学习目标

- 记录一个 `.vue`、`.css` 和图片 import 的完整请求链。
- 解释 `server.fs.allow` 与浏览器可访问 URL 的边界。

## 二、为什么需要

“页面白屏”往往不是 Vue 组件本身错误，而是模块 URL、文件系统权限或插件转换阶段失败。请求级证据
比只读控制台堆栈更快定位责任层。

## 三、核心概念

开发服务器把 URL 映射到文件，再经过 resolve/load/transform 和 import analysis。浏览器看到的是
带 Vite 查询和 ESM 语法的响应，不是原始 `.vue` 文件。

## 四、分步使用

1. 记录 `/src/main.ts` 的响应头和内容类型。
2. 记录一个 `.vue` 请求及其 `?vue&type=script` 子请求。
3. 访问允许目录外文件，观察 `server.fs.deny` 的拒绝。
4. 用浏览器刷新确认失败是否重复出现。

## 五、启动和访问开发服务器

安装依赖后运行 vite 即可启动开发服务器：

~~~~sh
npm install
npm run dev
~~~~

浏览器访问页面时，Vite 返回 HTML，并按需转换每个 ESM 请求。源码中的裸包导入会被重写到依赖优化结果，
相对导入则按文件路径继续进入模块图。

~~~~ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
~~~~

在 Network 面板中会看到 HTML、入口模块、Vue SFC 子请求和依赖请求。开发模式不会先把全部源码打成一个 bundle，
所以首次访问和后续 HMR 都能只处理实际请求的模块。

## 六、配置监听地址和端口

默认服务只监听 loopback 地址。需要让同一网络中的设备访问时，显式设置 host；需要固定端口时同时打开 strictPort，
避免端口被占用后悄悄切换。

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    allowedHosts: ['dev.example.test'],
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
  },
})
~~~~

也可以用 CLI 做一次性覆盖：

~~~~sh
npx vite --host 0.0.0.0 --port 4173 --strictPort
~~~~

CLI 参数适合单次运行，团队长期约定应写入 vite.config.ts。公开 host 时仍应配置 allowedHosts，
不要把开发服务器直接暴露为生产服务。

## 七、易错使用提示

:::pitfalls
### 错误：用文件系统绝对路径作为浏览器链接

**触发条件：** 把 `/Users/.../src/App.vue` 拼到模板中。

**原因：** 浏览器 URL 和 Vite 的文件系统访问策略是两套命名空间。

**后果：** 路径泄露、404 或被 `server.fs` 拒绝。

**错误示例：**

~~~~text
<script src="/Users/me/project/src/main.ts">
~~~~

**正确写法：**

~~~~text
使用 /src/main.ts，由 Vite root 负责映射
~~~~

**验证方式：** Network 请求不应包含主机绝对文件路径。
:::

## 八、工作原理与适用边界

1. **官方事实：** server 选项中的 fs allow/deny 约束开发服务器文件读取。
2. **课程推导：** 先确认 URL 映射和响应，再讨论框架运行时。
3. **边界：** dev server 的安全边界不能替代生产服务器的鉴权和静态文件策略。

## 九、练习

:::exercise
### 练习目标

**要求：** 给一个失败请求标注 resolve、load、transform、HTTP 四个阶段中最早可观测的失败点。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十、本节小结

- 开发服务器把文件、插件管线和浏览器 ESM 请求连成一条可观察链。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装教程版本并准备命令
npm install vue@3.5.40
npm install -D vite@8.2.1 @vitejs/plugin-vue@6.0.8
// package.json: { "scripts": { "dev": "vite" } }

// index.html：浏览器入口使用 URL，不使用文件系统绝对路径
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>

// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
createApp(App).mount('#app')

// src/App.vue：SFC 转换会继续请求 script/template 子模块和图片
<script setup lang="ts">
import logoUrl from './logo.svg'
</script>
<template><img :src="logoUrl" alt=""><h1>Vite 模块请求</h1></template>

// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    allowedHosts: ['dev.example.test'],
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.pem', '*.key'],
    },
  },
})

// 运行 npm run dev 后，在 Network 中依次检查：
// index.html -> /src/main.ts -> /src/App.vue -> SFC 子请求
// 同时检查 /src/style.css 与 /src/logo.svg 的 Initiator
~~~~
:::

## 十一、参考资料

- [Server Options](https://vite.dev/config/server-options) - host、fs 和请求边界。
- [Features](https://vite.dev/guide/features) - Vite 模块转换特性。
