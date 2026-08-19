---
id: engineering.vite.learn.basics.static-assets-and-url
type: lesson
title: 静态资源、public 目录与资源 URL
summary: 在 public 文件与 import 资源之间做出可缓存、可追踪的选择。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 30
prerequisites:
  - engineering.vite.learn.basics.dev-server-browser-loading
related:
  - engineering.vite.reference.features-assets-env
tags:
  - 静态资源
  - public
  - URL
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能判断资源应使用 import 还是 public。
  - 能解释 hash URL、`?url` 和 base 的关系。
sources:
  - title: Static Asset Handling
    url: https://vite.dev/guide/assets
    sourceType: official-reference
  - title: Shared Options
    url: https://vite.dev/config/shared-options
    sourceType: official-reference
---

# 静态资源、public 目录与资源 URL

## 一、学习目标

- 为图片、字体、robots.txt 和用户上传占位符选择资源入口。
- 在 build 产物中找到 import 资源的 hash 文件和 public 原样文件。

## 二、为什么需要

资源处理同时影响缓存、base 路径、插件优化和是否能被依赖图追踪。所有文件都丢进 public 会失去这些
能力，所有文件都 import 又不适合必须保持固定 URL 的文件。

## 三、核心概念

`import imageUrl from './image.png'` 进入构建资源图；`public/robots.txt` 原样复制并通过 `/robots.txt`
访问；`?url`、`?raw`、`?inline` 是明确的资源查询；`base` 会参与最终 URL 生成。

## 四、分步使用

1. import 一张图片并在模板中绑定 URL。
2. 将 robots.txt 放到 public，使用根绝对路径引用。
3. 用 `vite build --base=/docs/` 检查两类 URL 的差异。
4. 在产物目录确认 import 文件名带 hash，而 public 文件保持原名。

## 五、选择资源导入方式

需要 hash、依赖追踪和 base 重写的资源应从源码导入：

~~~~ts
import logoUrl from './assets/logo.png'

const image = new Image()
image.src = logoUrl
image.alt = '课程站标志'
document.body.append(image)
~~~~

构建后 logoUrl 会指向产物中的资源 URL。CSS 的 url() 也会进入同一处理管线：

~~~~css
.course-banner {
  background-image: url('../assets/banner.png');
}
~~~~

## 六、使用查询参数

需要明确控制导入结果时使用查询参数：

~~~~ts
import helpText from './help.md?raw'
import iconUrl from './icon.svg?url'

console.log(helpText)
console.log(iconUrl)
~~~~

?raw 返回文件文本，?url 返回最终 URL。较小资源是否内联为 data URL 由 build.assetsInlineLimit 决定。

## 七、public 目录的用途

public 中的文件不经过转换和 hash，引用时从根路径开始：

~~~~html
<link rel="icon" href="/favicon.svg" />
~~~~

它适合必须保持文件名的 favicon、robots.txt 等资源。业务图片和字体通常应使用 import，以获得 hash 和引用追踪。

## 八、易错使用提示

:::pitfalls
### 错误：用相对源码路径引用 public 文件

**触发条件：** 在组件中写 `public/logo.svg`。

**原因：** public 文件不进入源码相对路径解析，而是从根 URL 提供。

**后果：** dev 或 build 后出现 404。

**错误示例：**

~~~~text
src="public/logo.svg"
~~~~

**正确写法：**

~~~~text
src="/logo.svg"，或把资源移到 src 后使用 import
~~~~

**验证方式：** 同时检查 dev 与 build 后 preview 的请求 URL。
:::

## 九、工作原理与适用边界

1. **官方事实：** import 资源参与构建图，public 资源原样复制。
2. **课程推导：** 可优化、需 hash 的资源优先 import；固定根路径文件才使用 public。
3. **边界：** public 不会自动被插件优化，也不会得到 import 依赖关系。

## 十、练习

:::exercise
### 练习目标

**要求：** 把一个站点的 favicon、字体、文章图片和 robots.txt 分配到两类目录，并写出 build 后预期 URL。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- import 资源可追踪可 hash，public 资源固定可复制；base 决定部署前缀。

:::code-details{title="查看本节完整配置"}
~~~~text
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/learning/',
  publicDir: 'public',
  assetsInclude: ['**/*.gltf'],
  build: {
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
  },
})

// src/main.ts：进入构建图，获得 hash、base 重写和依赖追踪
import './styles/banner.css'
import logoUrl from './assets/logo.png'
import iconUrl from './assets/icon.svg?url'
import helpText from './content/help.md?raw'
import modelUrl from './assets/course.gltf'

const image = new Image()
image.src = logoUrl
image.alt = '课程站标志'
document.body.append(image)
console.log({ iconUrl, helpText, modelUrl })

// src/styles/banner.css：CSS url() 进入同一资源管线
.course-banner { background-image: url('../assets/banner.png'); }

// public/favicon.svg 与 public/robots.txt：原样复制、文件名固定
// index.html 中使用 <link rel="icon" href="/favicon.svg">
// 不要写 public/favicon.svg，也不要手工拼接 dist/assets 的 hash 文件名

// vite build 后检查：import 资源位于带 hash 的 assets，public 文件仍保持原名
~~~~
:::

## 十二、参考资料

- [Static Asset Handling](https://vite.dev/guide/assets) - 资源入口和查询。
- [Shared Options](https://vite.dev/config/shared-options) - base、publicDir 和 assetsInclude。
