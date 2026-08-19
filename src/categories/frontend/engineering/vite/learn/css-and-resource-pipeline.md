---
id: engineering.vite.learn.basics.css-and-resource-pipeline
type: lesson
title: CSS、CSS Modules 与预处理器边界
summary: 理解 CSS 的开发注入、生产抽取、Modules 命名和预处理器责任边界。
domain: frontend
technology: engineering
module: vite
stage: basics
level: beginner
estimatedMinutes: 34
prerequisites:
  - engineering.vite.learn.basics.static-assets-and-url
related:
  - engineering.vite.reference.config-shared
tags:
  - CSS
  - CSS Modules
  - PostCSS
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
objectives:
  - 能区分普通 CSS、CSS Modules 与预处理器配置。
  - 能从 build 产物确认 CSS code split 和资源 URL 重写。
sources:
  - title: Vite Features CSS
    url: https://vite.dev/guide/features#css
    sourceType: official-reference
  - title: Shared Options CSS
    url: https://vite.dev/config/shared-options#css
    sourceType: official-reference
---

# CSS、CSS Modules 与预处理器边界

## 一、学习目标

- 选择普通样式、`.module.css` 和 Sass/Less 的最小配置。
- 解释 `url()` 资源为什么会跟随构建资源图重写。

## 二、为什么需要

样式既要在开发期快速更新，也要在生产期拆分、压缩和修正资源路径。把预处理器、Modules 和 Vite
的职责混在一起，容易出现类名不匹配或只在 preview 失败。

## 三、核心概念

普通 CSS 进入全局样式管线；`.module.css` 导出局部 class 映射；预处理器只负责把 Sass/Less 等输入
转成 CSS，具体依赖和选项由 `css.preprocessorOptions` 提供。Vite 负责模块化、HMR 和 build 输出。

## 四、分步使用

1. 导入普通 CSS，观察开发期 style 注入。
2. 将文件改为 `.module.css`，从导入对象读取 class。
3. 在示例项目中配置预处理器变量，验证 dev/build 都通过。
4. 检查产物 CSS 中的 `url()` 已重写为最终资源路径。

## 五、导入普通 CSS

在入口模块直接导入样式，Vite 会在开发期注入页面，并在生产构建时收集和压缩：

~~~~ts
import './styles/base.css'
~~~~

~~~~css
:root {
  color: #1f2937;
  background: #ffffff;
}
~~~~

## 六、使用 CSS Modules

文件名使用 .module.css 后，默认导入得到类名映射，避免组件间类名冲突：

~~~~css
/* CourseCard.module.css */
.title {
  font-weight: 700;
}
~~~~

~~~~ts
import styles from './CourseCard.module.css'

const title = document.createElement('h2')
title.className = styles.title
title.textContent = 'Vite 配置'
~~~~

## 七、安装和配置预处理器

Vite 不会自动安装 Sass。需要 SCSS 时先添加依赖：

~~~~sh
npm install -D sass
~~~~

然后可以导入 .scss，并通过 preprocessorOptions 注入只包含变量或 mixin 的共享代码：

~~~~ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@use "/src/styles/tokens.scss" as *;',
      },
    },
    devSourcemap: true,
  },
})
~~~~

additionalData 会进入每个 SCSS 文件，不要在其中输出实际选择器，否则样式会被重复生成。

## 八、易错使用提示

:::pitfalls
### 错误：把 CSS Modules 类名当全局类名

**触发条件：** 在模板中直接写 `.button`，但文件是 `.module.css`。

**原因：** Modules 导入的是运行时映射对象。

**后果：** 元素没有样式，且只在改名后才暴露。

**错误示例：**

~~~~text
class="button"
~~~~

**正确写法：**

~~~~text
:class="styles.button"
~~~~

**验证方式：** 检查 DOM class 是否包含构建生成的 hash。
:::

## 九、工作原理与适用边界

1. **官方事实：** Vite 对 CSS、Modules 和预处理器提供不同入口。
2. **课程推导：** 样式作用域由 CSS Modules 决定，预处理器不等于作用域系统。
3. **边界：** 具体 Sass/Less 语法属于对应工具，不应归因于 Vite。

## 十、练习

:::exercise
### 练习目标

**要求：** 把一份组件样式拆成全局 token 和局部 Modules，并说明每个文件在 dev/build 的输出位置。

**完成标准：** 运行示例并观察预期结果，能够解释本节配置或代码对开发和构建流程的影响。
:::

## 十一、本节小结

- Modules 管作用域，预处理器管语法转换，Vite 管模块化、HMR 和构建资源。

:::code-details{title="查看本节完整配置"}
~~~~text
// 安装预处理器；Vite 本身不会自动安装 Sass
npm install -D vite@8.2.1 sass

// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
    preprocessorOptions: {
      scss: { additionalData: '@use "/src/styles/tokens.scss" as *;' },
    },
    devSourcemap: true,
  },
  build: { cssCodeSplit: true },
})

// src/styles/base.css：全局样式
:root { color: #1f2937; background: #ffffff; }

// src/CourseCard.module.css：局部类名与资源 URL 都进入构建图
.title {
  padding-left: 24px;
  background: url('./badge.svg') no-repeat left center;
  font-weight: 700;
}

// src/styles/course.scss：共享文件只提供变量或 mixin，不重复输出选择器
.course-list { color: $course-text-color; }

// src/main.ts
import './styles/base.css'
import './styles/course.scss'
import styles from './CourseCard.module.css'

const title = document.createElement('h2')
title.className = styles.title
title.textContent = 'Vite 样式管线'
document.querySelector('#app')?.append(title)
~~~~
:::

## 十二、参考资料

- [CSS](https://vite.dev/guide/features#css) - CSS、Modules 和预处理器。
- [Shared Options](https://vite.dev/config/shared-options#css) - CSS 配置形态。
