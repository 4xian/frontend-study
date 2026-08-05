# IT 学习站

面向多个 IT 技术领域的统一学习平台。当前前端域已经提供 Vue Core、Vue Router 和 Pinia 的系统课程与
Reference，后续按 TypeScript、Vite、React 及其客户端生态继续扩展；后端域独立维护 Java、Go 等路线。

## 文档入口

- [前端文档](./docs/frontend/README.md)：前端规范、路线计划、模板和覆盖基线。
- [后端文档](./docs/backend/)：后端规范、计划与审计资产，由后端任务独立维护。
- [贡献指南](./AGENTS.md)：仓库结构、编码约束和验证命令。

## 技术栈

站点宿主使用 Vue 3、TypeScript、Vite、Vue Router、Pinia 和 Shiki。课程、Reference 与项目使用独立
内容模板，通过 `LearningCatalog` 提供目录、搜索、路由和正文懒加载。

## 本地开发

```sh
npm install
npm run dev
```

现有本地服务已经运行时直接复用，不启动重复实例。

## 质量检查

```sh
npm run type-check
npm run test
npm run lint
npm run format:check
npm run build
```

根据改动范围选择命令；文档改动无需运行生产构建。不要修改 `dist/`、`node_modules/` 或不属于当前
任务的未跟踪资产。
