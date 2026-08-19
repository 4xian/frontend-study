---
id: engineering.vite.reference.config-dependency-optimization
type: reference
title: Vite Dependency Optimization Options
summary: 查阅依赖扫描、包含、排除、Rolldown 参数、强制重建与关闭自动发现的稳定选项。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  export default defineConfig({ optimizeDeps: { entries, include, exclude, force } })
related:
  - engineering.vite.learn.intermediate.dependency-optimization
  - engineering.vite.learn.advanced.performance-source-maps
tags:
  - Vite
  - optimizeDeps
  - 依赖预构建
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Dependency Optimization Options
    url: https://vite.dev/config/dep-optimization-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - optimizedepsentries
  - optimizedepsexclude
  - optimizedepsinclude
  - optimizedepsrolldownoptions
  - optimizedepsforce
  - optimizedepsnodiscovery
---

# Vite Dependency Optimization Options

依赖优化把 CommonJS/UMD 转为 ESM，并把多内部模块依赖预构建成较少请求。Vite 8.2.1 使用 Rolldown 路径；
缓存与扫描结果必须通过真实 dev 请求验证。

## 一、optimizeDeps.entries

覆盖默认 HTML 入口推导，可使用相对 root 的 glob。显式配置后只自动忽略 `node_modules` 与 `outDir`，其他测试或
生成目录需自行排除。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'admin/index.html'],
  },
})
~~~~

## 二、optimizeDeps.exclude

阻止指定依赖预构建。若排除的 ESM 依赖又依赖 CommonJS，内部 CJS 仍可能需要放入 include。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['esm-only-package'],
  },
})
~~~~

## 三、optimizeDeps.include

强制预构建默认扫描无法发现的依赖，例如动态入口或链接包。尾随 glob 的深导入语法仍有 experimental 提示，
稳定用法应列出确定包或入口。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['linked-package > nested-commonjs-package'],
  },
})
~~~~

## 四、optimizeDeps.rolldownOptions

向依赖扫描和优化传递受限 Rolldown 选项。Vite 会省略与内部输入、输出冲突的字段，不能把 build 配置原样复制。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    rolldownOptions: {},
  },
})
~~~~

## 五、optimizeDeps.force

忽略现有缓存并重新预构建，适合诊断依赖内容与 metadata 不一致。日常启动不应永久开启。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    force: false,
  },
})
~~~~

## 六、optimizeDeps.noDiscovery

关闭自动发现后只优化 include 中的依赖，CommonJS-only 包必须显式列出。适合需要确定性入口的受控项目，普通
应用通常保留扫描更简单。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    noDiscovery: false,
  },
})
~~~~

## 七、完整配置示例

下面的配置把本页选项集中写在一起。实际项目应只保留确实需要的选项，并根据部署地址、依赖和入口调整值。

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: ['index.html', 'admin/index.html'],
    exclude: ['esm-only-package'],
    include: ['linked-package > nested-commonjs-package'],
    rolldownOptions: {},
    force: false,
    noDiscovery: false,
  },
})
~~~~

## 八、易错使用提示

:::pitfalls
### 错误：用 optimizeDeps 修复生产构建问题

**触发条件：** 生产产物中的 CommonJS 或解析问题出现后，只修改 `optimizeDeps.include` 或 `exclude`。

**原因：** 依赖优化主要服务开发服务器，生产构建使用独立的构建与 external 合同。

**后果：** 本地 dev 可能变绿，但 build 或部署后的模块仍然失败。

**错误示例：**

```ts
export default { optimizeDeps: { include: ['legacy-package'] } }
```

**正确写法：**

```text
分别验证 dev 的依赖缓存和 build 的产物、external 与运行时导入
```

**验证方式：** 清空依赖优化缓存后启动开发服务器，再执行生产构建并运行生成产物。
:::

## 九、工作原理与适用边界

1. 官方事实：Dependency Optimization 由入口发现、include/exclude、缓存和 Rolldown 选项共同控制。
2. 课程推导：优化配置只应回应真实模块请求或缓存证据，不能作为通用兼容开关。
3. 适用边界：本页用于开发期依赖预构建；生产 chunk、external 和库交付应查阅 Build Options。

## 十、参考资料

- [Vite 8.2.1 Dependency Optimization Options](https://vite.dev/config/dep-optimization-options) - 支持依赖发现、缓存与配置边界。
