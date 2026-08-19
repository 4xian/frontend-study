---
id: engineering.vite.reference.config-preview
type: reference
title: Vite Preview Options
summary: 查阅本地生产产物预览的监听、安全、代理、TLS 与响应配置，并保留部署责任边界。
domain: frontend
technology: engineering
module: vite
group: configuration
signature: |-
  export default defineConfig({ preview: { host, port, strictPort, headers } })
related:
  - engineering.vite.learn.advanced.preview-deployment-paths
tags:
  - Vite
  - Preview Options
  - 部署验证
appliesTo: Vite 8.2.1
verifiedAt: 2026-08-07
sources:
  - title: Vite 8.2.1 Preview Options
    url: https://vite.dev/config/preview-options
    sourceType: official-reference
    appliesTo: Vite 8.2.1
anchors:
  - previewhost
  - previewallowedhosts
  - previewport
  - previewstrictport
  - previewhttps
  - previewopen
  - previewproxy
  - previewcors
  - previewheaders
---

# Vite Preview Options

`vite preview` 只用于本地检查已经生成的 `dist`，不是生产服务器。以下配置大多复用 server 语义，但必须对
构建产物执行，不能把 dev 页面截图作为 preview 证据。

## 一、preview.host

决定预览服务器监听地址。对外监听会扩大产物暴露面，只在隔离网络和明确验证需求下启用。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    host: '127.0.0.1',
  },
})
~~~~

## 二、preview.allowedHosts

限制可接受的 Host；默认继承安全边界。不要用 `true` 绕过 host 校验，应列出自动化实际使用的地址。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    allowedHosts: ['preview.example.test'],
  },
})
~~~~

## 三、preview.port

指定预览首选端口。自动化脚本应使用独立端口并在请求完成后关闭服务，避免连接到残留进程。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    port: 4173,
  },
})
~~~~

## 四、preview.strictPort

端口占用时立即退出。自动化依赖固定 URL 时必须开启并断言启动 exit code。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    strictPort: true,
  },
})
~~~~

## 五、preview.https

为本地预览配置 TLS。自签名证书能验证浏览器路径，但不能证明真实托管证书、HSTS 或边缘终止配置。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    https: false,
  },
})
~~~~

## 六、preview.open

启动后打开浏览器或指定路径；批量验证应由 Playwright 显式导航，不依赖这一交互副作用。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    open: false,
  },
})
~~~~

## 七、preview.proxy

为预览服务器配置转发，默认可继承 server proxy。它仍不是生产网关，也不能证明实际后端网络策略。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
})
~~~~

## 八、preview.cors

控制预览响应跨域规则。使用明确来源列表，并把生产 CDN/服务端 CORS 作为独立部署检查。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    cors: { origin: 'https://preview.example.test' },
  },
})
~~~~

## 九、preview.headers

增加预览响应 headers，适合验证客户端在 CSP 或缓存头下的行为；生产 headers 必须在真实托管层复核。

**配置示例：**

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    headers: { 'X-Content-Type-Options': 'nosniff' },
  },
})
~~~~

## 十、完整配置示例

下面的配置把本页选项集中写在一起。实际项目应只保留确实需要的选项，并根据部署地址、依赖和入口调整值。

~~~~ts
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    host: '127.0.0.1',
    allowedHosts: ['preview.example.test'],
    port: 4173,
    strictPort: true,
    https: false,
    open: false,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
    cors: { origin: 'https://preview.example.test' },
    headers: { 'X-Content-Type-Options': 'nosniff' },
  },
})
~~~~

## 十一、易错使用提示

:::pitfalls
### 错误：用 preview 配置证明生产部署已经正确

**触发条件：** preview 中的 proxy、headers 或 HTTPS 生效后，直接宣称生产 CDN、证书和缓存策略通过。

**原因：** preview 是本地静态预览服务器，不拥有外部托管平台的网络、证书和缓存配置。

**后果：** 本地检查通过，真实部署仍可能出现错误路径、缓存或安全 header。

**错误示例：**

```ts
export default { preview: { headers: { 'Cache-Control': 'public' } } }
```

**正确写法：**

```text
preview 只检查构建产物；生产 headers 在实际托管环境独立检查
```

**验证方式：** 先通过 preview 检查构建产物，再在目标部署平台检查 HTTPS、缓存头和资源 URL。
:::

## 十二、工作原理与适用边界

1. 官方事实：Preview Options 只配置 `vite preview` 的监听、代理、CORS 与响应 header。
2. 课程推导：preview 可检查构建目录能否被静态服务，但不能替代生产平台检查。
3. 适用边界：托管 HTTPS、CDN 缓存和组织网络控制必须在目标部署平台单独配置。

## 十三、参考资料

- [Vite 8.2.1 Preview Options](https://vite.dev/config/preview-options) - 支持预览服务器配置与边界。
