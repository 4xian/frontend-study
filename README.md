# IT 学习站

面向前端、后端与网络领域的统一学习平台。首页是唯一“技术中心”，当前提供 Vue Core、Vue Router、
Pinia、TypeScript 和 Java Core；未实施的技术不会创建空入口。

## 项目结构

- `src/app/`：应用页面、布局、路由、全局状态与样式。
- `src/common/`：Catalog、统一 Markdown、内容渲染、搜索、进度与共享 UI。
- `src/categories/`：按 `domain/technology/module` 组织的技术 manifest、Markdown 正文和真实 Demo。
- `docs/`：架构、领域规范、学习路线、覆盖基线与审计证据。

课程与 Reference 正文统一使用 Markdown。Demo 由模块 manifest 显式登记，运行组件与源码展示来自
同一份真实源码。

## 文档入口

- [架构设计](./docs/architecture/IT学习站架构设计.md)：目录、Catalog、路由与技术准入边界。
- [前端文档](./docs/frontend/README.md)：前端规范、路线计划和覆盖基线。
- [后端文档](./docs/backend/)：后端模板、来源规范、路线与审计资产。
- [贡献指南](./AGENTS.md)：仓库结构、编码约束和验证命令。

## TeamFlow 结课项目

Java Core 的 TeamFlow 完整交付 Demo 位于
`src/categories/backend/java/core/demos/teamflow-complete-delivery/`，包含 JDK 25 / Spring Boot 4.1
现代版、Java 8 / Spring Boot 2.3.12 兼容版、React 联调前端以及 MySQL、Redis、RabbitMQ Compose 依赖。
两版共享 API、事件和验收合同，覆盖登录、用户/团队、项目、任务、缓存、幂等、消息通知、并发冲突和健康探针。

在该目录分别运行以下命令可执行完整双版本门禁：

```sh
bash delivery-gate.sh modern 18080
bash delivery-gate.sh legacy 18081
```

前端默认连接 `http://127.0.0.1:18080`，可通过 `VITE_TEAMFLOW_API_BASE_URL` 切换到兼容版端口。

## 本地开发

```sh
npm install
npm run dev
```

## 质量检查

```sh
npm run type-check
npm run test:unit
npm run test:e2e
npm run lint
npm run format:check
npm run build
```

仓库保留 Vitest、Playwright 配置、依赖和命令，`tests/unit/` 与 `tests/e2e/` 当前为空；Git 不跟踪空
目录。需要补充自动验证时，只在 `/tmp` 的 `mktemp` 目录中创建一次性测试文件和 fixture，完成后立即
删除。不要修改 `dist/`、`node_modules/`、浏览器工具输出或不属于当前任务的工作区改动。
