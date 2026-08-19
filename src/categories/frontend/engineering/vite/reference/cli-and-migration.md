---
id: engineering.vite.reference.cli-and-migration
type: reference
title: Vite CLI 与 8.x 迁移
summary: 查阅 dev、build、optimize、preview 命令和从 Vite 7 到 8 的 Rolldown/Oxc 迁移顺序。
domain: frontend
technology: engineering
module: vite
group: features-and-boundaries
signature: |-
  vite [root]
  vite build [root]
  vite optimize [root]
  vite preview [root]
related:
  - engineering.vite.learn.advanced.security-and-migration
  - engineering.vite.learn.advanced.preview-deployment-paths
tags:
  - Vite
  - CLI
  - Migration
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite CLI
    url: https://vite.dev/guide/cli
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Migration from v7
    url: https://vite.dev/guide/migration
    sourceType: official-reference
    appliesTo: Vite 8.2.1
  - title: Vite 8.2.1 Changelog
    url: https://github.com/vitejs/vite/blob/v8.2.1/packages/vite/CHANGELOG.md
    sourceType: release-note
anchors:
  - vite
  - vite-build
  - vite-optimize
  - vite-preview
  - rolldown
  - oxc
  - deprecated-config
  - migration-sequence
---

# Vite CLI 与 8.x 迁移

## 一、vite

启动开发服务器，root 默认为当前目录。自动化应显式传 host、port、strictPort 并记录实际 URL。

**最小示例：**

~~~~sh
npx vite
npx vite --host 0.0.0.0 --port 5173 --strictPort
~~~~

## 二、vite build

生成生产产物；`--watch` 会改变生命周期。发布验证应使用一次性 build 并检查 manifest/chunk/资源输出。

**最小示例：**

~~~~sh
npx vite build
npx vite build --mode staging --base /learning/
~~~~

## 三、vite optimize

手动执行依赖优化，适合诊断或预热；普通 dev 会自动扫描。结果受 mode、config 与 lockfile 影响。

**最小示例：**

~~~~sh
npx vite optimize --force
~~~~

## 四、vite preview

服务已有构建目录，不自动 build。启动前先证明 dist 属于当前快照，结束后关闭监听端口。

**最小示例：**

~~~~sh
npx vite build
npx vite preview --port 4173 --strictPort
~~~~

## 五、Rolldown

Vite 8 默认使用 Rolldown，底层配置迁移到 `rolldownOptions`。先核对第三方插件兼容，再调整 chunk/输出选项。

**最小示例：**

~~~~ts
export default { build: { rolldownOptions: { input: "index.html" } } }
~~~~

## 六、Oxc

JavaScript 转换与默认压缩路径迁往 Oxc。升级后应重新检查运行语义、source map 和压缩产物；类型检查仍独立执行。

**最小示例：**

~~~~ts
export default { oxc: {}, build: { minify: true } }
~~~~

## 七、Deprecated Config

`build.rollupOptions`、`worker.rollupOptions`、`optimizeDeps.esbuildOptions` 等只保留迁移说明，不进入稳定推荐索引。

**最小示例：**

~~~~ts
export default {
  build: { rolldownOptions: {} },
  worker: { rolldownOptions: {} },
}
~~~~

## 八、Migration Sequence

1. 固定迁移前的 lockfile、Node、Vite 与插件版本并保存基线产物。
2. 阅读 Vite 8 migration/changelog，逐项移除 deprecated 配置。
3. 依次验证 dev 请求、HMR、插件 hooks、build、preview、SSR 与安全边界。
4. 比较 manifest、chunk、CSS、source map 和错误路径后再更新长期版本基线。

本页命令、配置和迁移步骤均以 Vite 8.2.1 为准。

**最小示例：**

~~~~sh
npm install -D vite@8.2.1
npm run dev
npm run build
npm run preview
~~~~

## 九、组合使用示例

下面的示例把本页最常用的接口组合成一条完整使用路径。

~~~~json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": { "vite": "8.2.1" }
}
~~~~

## 十、易错使用提示

:::pitfalls
### 错误：把 vite preview 当作构建或生产部署命令

**触发条件：** 修改源码后直接运行 `vite preview`，或把 preview 进程当作正式生产服务器发布。

**原因：** preview 只服务已经存在的构建目录，既不重新构建，也不承担生产服务器的安全与运维合同。

**后果：** 可能预览旧产物，并把本地调试服务器误用到生产环境。

**错误示例：**

```text
修改 src 后直接执行 vite preview
```

**正确写法：**

```text
vite build && vite preview
```

**验证方式：** 记录 build exit code 和产物哈希，再确认 preview 请求只读取该次构建目录。
:::

## 十一、工作原理与适用边界

1. 官方事实：Vite CLI 将 dev、build、optimize 与 preview 定义为职责不同的命令。
2. 课程推导：迁移时应逐条验证开发请求、插件、构建和预览，单个命令成功不能代表整条链路兼容。
3. 适用边界：本页提供本地命令与迁移顺序；真实部署、托管 HTTPS 和回滚流程仍属于外部环境证据。

## 十二、参考资料

- [Vite CLI](https://vite.dev/guide/cli) - 支持命令参数与运行职责。
- [Migration from v7](https://vite.dev/guide/migration) - 支持 Vite 8 的迁移边界与顺序。
- [Vite 8.2.1 Changelog](https://github.com/vitejs/vite/blob/v8.2.1/packages/vite/CHANGELOG.md) - 固定本页版本事实。
