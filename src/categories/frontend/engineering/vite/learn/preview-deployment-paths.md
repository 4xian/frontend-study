---
id: engineering.vite.learn.advanced.preview-deployment-paths
type: lesson
title: preview、base 与部署输出
summary: 在本地预览中验证构建产物和子路径，但明确生产服务器的额外责任。
domain: frontend
technology: engineering
module: vite
stage: advanced
level: advanced
estimatedMinutes: 36
prerequisites:
  - engineering.vite.learn.advanced.library-mode-and-types
related:
  - engineering.vite.reference.config-preview
tags:
  - preview
  - base
  - 部署
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能用 preview 验证目标 base 下的产物 URL。
  - 能列出静态生产服务器仍需承担的缓存、安全和 fallback 责任。
sources:
  - title: Deploying a Static Site
    url: https://vite.dev/guide/static-deploy
    sourceType: official-reference
  - title: Preview Options
    url: https://vite.dev/config/preview-options
    sourceType: official-reference
---

# preview、base 与部署输出

## 一、学习目标

- 在可用端口启动 preview，读取实际监听 URL 并检查深链/资源。
- 区分本地静态预览和真实 CDN/反向代理部署。

## 二、为什么需要

dev 能运行不代表构建 URL 正确。preview 可以复现本地静态产物，但不会自动提供真实域名、TLS、缓存
头、历史路由 fallback 或零停机发布。

## 三、核心概念

preview 读取 build.outDir；port 被占用时默认尝试下一个端口，strictPort 可改为失败；base 决定 HTML
和资源 URL；SPA deep link 需要生产服务器 fallback。

## 四、分步使用

1. 以目标 base 执行 build。
2. 启动 preview 并读取实际监听 URL。
3. 请求首页、动态 chunk、图片和 deep link。
4. 记录真实平台仍未覆盖的责任。

## 五、构建并预览

~~~~sh
npm run build
npm run preview
~~~~

preview 读取 dist，不会转换 src。修改源码后必须重新 build。固定预览配置可以写入 vite.config.ts：

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: false,
    open: false,
  },
})
~~~~

## 六、部署到子路径

站点部署到 https://example.com/learning/ 时设置 base：

~~~~ts
export default defineConfig({
  base: '/learning/',
  build: {
    outDir: 'dist',
  },
})
~~~~

重新构建后，HTML、动态 import、CSS 和 Worker 资源都会使用 /learning/ 前缀。不要构建后手工替换
dist 中的字符串。

## 七、配置生产服务

上传 dist 到静态服务器，并完成三项平台配置：所有资源使用正确 Content-Type；带 hash 的 assets
使用长期缓存；SPA 的未知页面路由回退到 index.html。preview 不提供 TLS、CDN、压缩策略或进程守护，
不能作为线上服务器。

## 八、易错使用提示

:::pitfalls
### 错误：硬编码 preview 默认端口

**触发条件：** 脚本总请求 4173，却未开启 strictPort。

**原因：** 端口占用时 Vite 会选择下一个端口。

**后果：** 自动化请求错误服务或误报失败。

**错误示例：**

~~~~text
启动后直接 curl 4173
~~~~

**正确写法：**

~~~~text
使用 strictPort 或解析服务器实际 URL
~~~~

**验证方式：** 人为占用端口并确认脚本行为可预测。
:::

## 九、工作原理与适用边界

1. Preview Options 定义本地静态服务接口。
2. preview 是构建回归证据，不是 production readiness 全部证据。
3. 缓存、TLS、域名和部署回滚必须在真实平台验证。

## 十、练习

:::exercise
### 练习目标

**要求：** 为 `/docs/app/` 静态部署写一份 preview 检查项和部署平台检查项清单。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- preview 证明本地产物可服务；生产可用性还依赖部署平台合同。

:::code-details{title="查看本节完整配置"}
~~~~text
// vite.config.ts：base 同时影响 HTML、CSS、动态 import 与 Worker URL
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/learning/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
})

// package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}

// 使用顺序
npm run build
npm run preview

// 从终端输出读取实际 URL；4173 被占用时 Vite 会继续尝试下一端口

// preview 中检查 /learning/ 首页、深链、动态 chunk、CSS 和图片请求
// 部署平台还必须配置：
// 1. 带 hash 的 assets 长期缓存，HTML 不使用同样的不可变缓存
// 2. 正确 Content-Type、压缩、TLS 与安全响应头
// 3. SPA 未知页面回退到 /learning/index.html
// 4. 原子发布与可回滚版本；preview 不能承担这些生产责任
~~~~
:::

## 十二、参考资料

- [Static Deploy](https://vite.dev/guide/static-deploy) - 平台和 base 指南。
- [Preview Options](https://vite.dev/config/preview-options) - preview 配置。
