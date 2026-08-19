# Maven 坐标、依赖、生命周期与多模块结构研究记录

## 冻结课程合同

- `courseId`：`backend.java.learn.basics.maven-project-model`
- `title`：Maven 坐标、依赖、生命周期与多模块结构
- `purpose / collection / level / depth`：`learn / basics / beginner / lesson`
- `sequence`：`270`
- `estimatedMinutes`：`90`
- `prerequisites`：`[backend.java.learn.basics.io-files-and-resource-ownership]`
- `related`：`[]`
- `sourceCapabilityIds`：`[]`
- `necessaryPrerequisiteId`：`JAVA-PREREQ-006`
- `origin`：`[necessary-prerequisite]`
- `selectionReason`：理解 parent、依赖、插件、打包和后续框架版本边界所必需。
- `projectEvidence`：`[]`
- `modernBaseline`：`Maven 3.9.16`
- `legacyBaseline`：`Java 8 / Spring Boot 2.3.12.RELEASE`，只作冻结兼容边界；本课不展开框架依赖
- Phase B 路线：`B-19`；前置 `B-18` 关闭后启动，本研究完成不等于课程已发布。
- Phase 2 历史冻结状态：`researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`

本课只建立 Maven 3 的项目模型、依赖解析、生命周期、插件和 reactor 基础合同。仓库发布、私服鉴权、
profile 设计、部署流程、插件开发、Maven 4 新模型和框架依赖管理留给后续课程。

## 核验基线

| 项目 | 核验结果 |
| --- | --- |
| 核验日期 | 2026-08-15 |
| 现代主线 | Maven 3.9.16；官方发布说明和历史页均确认其为当前稳定版 |
| Java 8 兼容 | Maven 3.9.16 要求 JDK 8+，可直接运行在 Java 8 上 |
| Maven 4 边界 | 当前 4.0.0-rc-6 尚未 GA、要求 Java 17；本课不把 RC 行为混入 Maven 3 主线 |
| 发现方式 | 使用 Tavily 检索候选页，再直接核对 Maven 官方页面 |
| 项目证据 | 合同中 `sourceCapabilityIds` 和 `projectEvidence` 均为空；未读取、运行或修改当前 `dzzz-app` |
| 验证边界 | 研究阶段只完成官方资料与反馈环设计；课程实施阶段执行 fixture，最终结果记录在独立 signoff |

## 官方页面可达性

以下状态为 2026-08-15 直接请求页面并跟随重定向后的 HTTP 结果。

| 官方页面 | HTTP 状态 |
| --- | ---: |
| [Maven 3.9.16 Release Notes](https://maven.apache.org/docs/3.9.16/release-notes.html) | 200 |
| [Installation](https://maven.apache.org/install.html) | 200 |
| [Maven Releases History](https://maven.apache.org/docs/history.html) | 200 |
| [Introduction to the POM](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html) | 200 |
| [POM 4.0.0 Reference](https://maven.apache.org/pom.html) | 200 |
| [Maven 3.9.16 Model Reference](https://maven.apache.org/ref/3.9.16/maven-model/maven.html) | 200 |
| [Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html) | 200 |
| [Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html) | 200 |
| [Configuring Plugins](https://maven.apache.org/guides/mini/guide-configuring-plugins.html) | 200 |
| [Using Modules (Maven 3)](https://maven.apache.org/guides/mini/guide-multiple-modules.html) | 200 |
| [Help Plugin effective-pom](https://maven.apache.org/plugins/maven-help-plugin/effective-pom-mojo.html) | 200 |
| [Maven Plugins Compatibility Plan](https://maven.apache.org/developers/compatibility-plan.html) | 200 |
| [Maven 4.0.0-rc-6 Release Notes](https://maven.apache.org/docs/4.0.0-rc-6/release-notes.html) | 200 |

## 一手来源与结论

### 1. POM 是声明式项目模型，GAV 是项目坐标核心

- [Introduction to the POM](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)
  将 POM 定义为 Maven 的基本工作单元；Maven 读取 `pom.xml` 获得项目、依赖、插件和构建配置。
- [POM Reference](https://maven.apache.org/pom.html) 将 `groupId`、`artifactId`、`version` 解释为项目的
  三段坐标：group 表示组织或命名空间，artifact 表示项目/产物，version 区分同一项目的不同版本。
- 依赖声明还可能带 `type` 和 `classifier`；课程必须区分“项目常用 GAV”与“完整依赖匹配键”。
  `dependencyManagement` 的最小匹配集合实际是 `{groupId, artifactId, type, classifier}`，普通 JAR
  因 `type=jar` 且 classifier 为空，才常简写为 GA。
- `modelVersion` 的 `4.0.0` 是 POM 模型版本，不是 Maven 4 的运行时版本。
  [POM Reference](https://maven.apache.org/pom.html) 明确当前支持的 POM 版本为 `4.0.0`；Maven 3 项目同样使用它。

### 2. packaging 决定产物类型和默认生命周期绑定

- [POM Reference](https://maven.apache.org/pom.html) 说明未声明 `packaging` 时默认是 `jar`；核心类型包括
  `pom`、`jar`、`maven-plugin`、`ejb`、`war`、`ear`、`rar`。
- [Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
  说明 packaging 不只是文件扩展名，它还提供 phase 到 plugin goal 的默认绑定。例如 JAR 的
  `compile` 会运行 `compiler:compile`，`test` 会运行 `surefire:test`，`package` 会运行 `jar:jar`。
- `pom` packaging 主要承载项目元数据、parent 或 aggregator；官方生命周期表说明它默认只在
  `install` 和 `deploy` 绑定目标。不能因为 POM 中有 modules 就把它误当可执行 JAR/WAR。

### 3. 继承和 aggregation 是两条独立关系

- [Introduction to the POM](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)
  说明继承由子 POM 的 `parent` 指向父 POM，用于合并 groupId、version、properties、依赖、插件配置等。
  所有项目还隐式继承 Super POM，因此原始 POM 不是 Maven 实际使用的全部配置。
- aggregation 由聚合 POM 的 `modules` 列出子项目路径，用于让一次 Maven 调用收集并构建这些项目；
  它不要求被聚合项目继承 aggregator。
- [POM Reference](https://maven.apache.org/pom.html) 明确 parent 与 aggregator 不是同一概念：一个 POM
  可以只被继承而不聚合模块，也可以聚合并不继承它的模块；常见根 POM只是同时承担两种角色。
- 教学示例应分别画出 `child -> parent` 的配置继承边和 `aggregator -> module` 的构建收集边，再展示两者
  可以落在同一个根 POM，避免把目录嵌套误当成继承关系。

### 4. dependencyManagement 管版本，dependencies 才声明实际依赖

- [Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
  将 `dependencyManagement` 定义为集中管理依赖信息的机制。子 POM 可以只声明 GA，由有效模型补入
  父 POM 管理的 version、scope 等信息。
- `dependencyManagement` 本身不把依赖加入项目 classpath；它只在依赖被直接声明或经传递图遇到时
  提供受管信息。实际直接使用的库应放进 `dependencies`，并遵循官方建议显式声明源码直接使用的依赖。
- 受管版本也可控制传递依赖，并优先于普通的“最近定义”调解；但错误地强制旧版本会让下游库失配，
  因此集中版本不等于兼容性已经得到证明。
- `dependencyManagement` 只管理项目依赖，不管理 build plugin 自身的传递依赖；插件版本与配置应放在
  `pluginManagement`/`plugins` 的对应模型中，不能混用两套机制。

### 5. scope 同时影响 classpath 和传递性

- [Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
  列出六种 scope：`compile`、`provided`、`runtime`、`test`、`system` 和 `import`。
- `compile` 是默认 scope，进入全部项目 classpath 并可传递；`provided` 进入 compile/test classpath，
  不进入 runtime 且不传递；`runtime` 不进入 compile，但进入 runtime/test；`test` 只用于测试且不传递。
- `import` 只允许用于 `dependencyManagement` 中 `type=pom` 的依赖，它把目标 POM 的受管依赖列表导入
  当前有效模型，不是普通运行时 classpath scope。
- `system` 依赖本机绝对路径且不从仓库解析；官方 POM Reference 明确不推荐该方式。本课只说明其边界，
  不把它作为引入本地 JAR 的推荐方案。

### 6. 传递依赖调解是确定规则，不是“最高版本胜出”

- [Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
  说明 Maven 会自动收集依赖的依赖，并在同一 artifact 出现多个版本时采用“最近定义”：离当前项目更近的
  版本胜出；深度相同时，POM 中先声明的版本胜出。
- 因此不能声称 Maven 自动选择最高、最新或最兼容版本。需要稳定版本时，应使用直接依赖声明或
  `dependencyManagement` 明确约束，并通过 `mvn dependency:tree` 观察最终图。
- exclusions 是声明边上的局部裁剪，optional 是依赖生产者告知消费者“默认不传递”；两者都不应被用来
  隐藏未经分析的冲突。

### 7. phase 是生命周期阶段，goal 是插件执行单元

- [Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
  定义三套内置生命周期：`default`、`clean`、`site`。default 的关键阶段依次包括 `validate`、`compile`、
  `test`、`package`、`verify`、`install`、`deploy`。
- 调用某个 phase 会依次执行该生命周期中它之前的所有 phase。例如 `mvn verify` 会完成 validate 到 verify，
  而不需要把每一阶段都写在命令行上。
- goal 是插件提供的具体任务，写作 `prefix:goal`；它可以绑定到 phase，也可以直接调用。
  `mvn clean dependency:copy-dependencies package` 中 clean/package 是 phase，另一个参数是直接 goal。
- 不应直接用 `integration-test` 代替 `verify`：官方指南指出前后置阶段可能负责启动和清理外部环境，
  截断在 integration-test 可能留下未清理状态，也拿不到 verify 阶段的最终检查。

### 8. 插件声明要区分“提供默认值”和“参与本次构建”

- [Configuring Plugins](https://maven.apache.org/guides/mini/guide-configuring-plugins.html) 说明 build plugin
  位于 `build/plugins`，reporting plugin 位于 `reporting/plugins`；插件至少应明确 GAV，并总是固定 version
  以保证构建可复现。
- `pluginManagement` 集中提供插件版本、配置和 execution 默认值，但
  [POM Reference](https://maven.apache.org/pom.html) 明确它只影响当前/子 POM 中实际引用的插件；
  它不等于让插件自动参加构建。
- 参与生命周期的执行放在 `executions/execution` 下，明确 `goals`，必要时明确 `phase`。只有声明 plugin
  而没有 lifecycle 默认绑定或 execution goal，不足以证明它会执行。
- 同一 POM 不应重复声明同一个 plugin；
  [Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html) 说明
  Maven 3 会警告，Maven 4 会使构建失败。需要多次执行时应给同一 plugin 配置多个 execution。

### 9. reactor 按已实例化的项目关系排序

- [Using Modules (Maven 3)](https://maven.apache.org/guides/mini/guide-multiple-modules.html) 将 reactor
  描述为：收集可用模块、排序成正确构建顺序，再按顺序构建所选项目。
- 排序关系依次考虑模块间项目依赖、作为模块的 plugin、plugin dependency、build extension；没有这些关系时
  才使用 `modules` 声明顺序。
- `dependencyManagement` 和 `pluginManagement` 只是未实例化的管理信息，不改变 reactor 顺序。
  因此把版本写进 dependencyManagement 并不能建立“模块 B 必须先构建”的边，模块 A 必须实际依赖 B。
- `--also-make` 可构建所选模块及其 reactor 依赖，`--also-make-dependents` 可构建依赖所选模块的项目；
  反馈环可用 `-pl` 配合 `-am` 验证局部构建仍遵守关系图。

### 10. effective POM 才是排查最终配置的入口

- [Help Plugin effective-pom](https://maven.apache.org/plugins/maven-help-plugin/effective-pom-mojo.html)
  说明 `help:effective-pom` 输出本次构建的有效 POM，并计入 active profiles。
- 有效 POM 展开 Super POM、parent 继承、管理项和当前项目覆盖；它适合回答“最终 version/scope/plugin 配置
  来自哪里”，不能只盯着当前目录的原始 POM 猜测。
- `-Dverbose` 会为 XML 元素添加来源位置注释，`-Doutput=...` 可用 UTF-8 写入文件。临时反馈环应保存该输出
  并对关键值及来源做断言，而不是把几千行 XML 人工浏览当成可复跑验证。

### 11. Maven 3.9.16、Java 8 与 Maven 4 必须分线说明

- [Maven 3.9.16 Release Notes](https://maven.apache.org/docs/3.9.16/release-notes.html) 确认 3.9.16 已发布，
  [Maven Releases History](https://maven.apache.org/docs/history.html) 将它列为当前稳定版本。
- [Installation](https://maven.apache.org/install.html) 明确 Maven 3.9.16 要求 JDK 8+，因此 Java 8 反馈环
  可直接运行相同 Maven 版本。Maven 的运行 JDK 与项目编译目标仍是两个维度，课程不能只凭 `mvn -v`
  宣称产物已兼容 Java 8。
- [Maven Releases History](https://maven.apache.org/docs/history.html) 和
  [Maven Plugins Compatibility Plan](https://maven.apache.org/developers/compatibility-plan.html) 说明当前
  Maven 4 仍未 GA，4.0.0-alpha-12 之后要求 Java 17。
- [Maven 4.0.0-rc-6 Release Notes](https://maven.apache.org/docs/4.0.0-rc-6/release-notes.html) 明确它是供测试与
  反馈的 release candidate，且部分 Maven 3 POM 迁移时需要修改。本课以 Maven 3.9.16 为可复跑主线，
  不把 Maven 4 RC 当生产升级建议。

## 课程内容决策

1. 从最小 POM 和 GAV 开始，立即纠正 `modelVersion=4.0.0` 等于 Maven 4 的误解。
2. 用不同箭头表达继承与 aggregation，再展示一个根 POM 同时承担两种角色的常见结构。
3. 用同一依赖分别放入 `dependencyManagement` 和 `dependencies`，观察前者只管理、后者才实际引入。
4. 用冲突依赖树解释最近定义和同层先声明，不使用“最高版本胜出”的错误简化。
5. 把 scope 映射到 compile/test/runtime classpath 与传递性，`import` 单独限定在 BOM 管理场景。
6. 先区分 phase 和 goal，再说明 packaging 默认绑定与自定义 plugin execution 如何叠加。
7. 多模块示例故意把 modules 文本顺序写成 app 在 library 前，用实际依赖证明 reactor 会拓扑排序。
8. 所有 build plugin 固定版本；`pluginManagement` 只提供默认值，`plugins` 明确参与构建。
9. 用 `help:effective-pom -Dverbose` 和 `dependency:tree` 把模型展开与依赖图纳入反馈证据。
10. Maven 3.9.16/Java 8 为兼容反馈，Maven 4 RC 只保留版本边界，不扩展新模型语法。

## 可复跑反馈环设计

反馈资产全部放在 `/tmp` 的 `mktemp` 目录，不读取当前项目 POM，也不在仓库中保留 fixture。

### 临时结构

```text
maven-project-model-fixture/
├── pom.xml
├── library/
│   ├── pom.xml
│   └── src/main/java/example/library/Greeting.java
└── app/
    ├── pom.xml
    └── src/main/java/example/app/Main.java
```

- 根 POM 使用 `packaging=pom`，同时作为 parent 和 aggregator；`modules` 中故意先写 `app`、后写 `library`。
- `app` 实际依赖 `library`，但不写 version；根 POM 的 `dependencyManagement` 管理 library version。
- 根 POM 在 `pluginManagement` 固定 compiler plugin 版本，子模块在 `plugins` 显式引用，验证管理与参与执行
  的差别。
- app 只调用 library 的一个公开方法，最少源码即可证明 reactor 顺序和 classpath，不引入框架。

### 执行与断言

1. `mvn -v`：断言 Maven 为 `3.9.16`；分别记录 Java 25 和 Java 8 运行时，不能只记录 shell 默认 Java。
2. 使用临时 `maven.repo.local` 隔离本批缓存，避免读取用户本机已有 artifact 造成假绿。
3. `mvn -B -ntp clean verify`：断言 reactor build order 中 library 先于 app，两模块均 SUCCESS。
4. `mvn -B -ntp -pl app -am verify`：断言局部选择 app 时 reactor 自动包含 library。
5. `mvn -B -ntp help:effective-pom -Dverbose -Doutput=effective-pom.xml`：断言 app 的 library version 来自
   根 dependencyManagement，compiler plugin 的 version/config 来自根 pluginManagement。
6. `mvn -B -ntp dependency:tree`：断言 app 的直接 library 依赖只出现一个预期版本；不以下载日志代替依赖树。
7. Java 8 与 Java 25 对同一 fixture 执行相同 `verify`；再检查 class file 目标版本或 compiler release/source/target
   配置，分别证明“构建工具可运行”和“产物兼容 Java 8”。
8. 保存命令、exit code、关键标准输出和临时 POM SHA-256；第二次运行结果必须一致。完成后仅使用
   `find -depth -delete` 清理临时目录。

### 建议的单行反馈

```text
maven|version=3.9.16|java=8,25|modules=2|order=library,app|managed=1.0.0|effective=true|tree=true|verify=true|partial=true|target=52|repeat=true
```

单行摘要只便于人工比较，原始 Maven 输出、effective POM、dependency tree 和各命令 exit code 仍是权威证据。

## 易错点取证

| 易错点 | 官方依据 | 反馈要求 |
| --- | --- | --- |
| 把 POM 4.0.0 当 Maven 4 | POM Reference | Maven 3.9.16 最小 POM仍用 `modelVersion=4.0.0` |
| 把 parent 当 aggregator | Introduction to POM | 分别断言 child parent 与 root modules 两条关系 |
| dependencyManagement 自动引入依赖 | Dependency Mechanism | 删除 app dependencies 后编译必须缺少 library |
| Maven 自动选择最高版本 | Dependency mediation | 构造不同深度版本并核对 dependency tree |
| provided 会进入运行时 | Dependency Scope | compile/test 可见，runtime classpath 不可见 |
| 调用 phase 只执行该一步 | Build Lifecycle | `verify` 输出包含此前 compile/test/package 阶段 |
| pluginManagement 自动执行插件 | POM Reference | 只管理时无 execution；plugins 引用后才参与 |
| modules 文本顺序就是构建顺序 | Reactor Sorting | app 写在前，实际仍先构建其 library 依赖 |
| 原始 POM 等于最终配置 | effective-pom goal | `-Dverbose` 展开并核对父/Super POM来源 |
| Maven 能在 Java 8 运行等于产物兼容 8 | Installation + compiler 配置边界 | 分开记录运行 JDK 与 class file 目标 |

## 排除项

- 不读取、运行或修改当前 `dzzz-app` 的 POM、源码或构建。
- 不引入任何项目能力或项目证据；本课合同的两个集合均为空。
- 不展开 settings.xml、repository mirror、credential、profile、deploy/release 或企业私服治理。
- 不展开 Maven plugin/Mojo 开发、生命周期扩展、自定义 packaging 或并行 reactor。
- 不把 Maven 4 release candidate 当作稳定主线，不教授 Maven 4 专属 POM 4.1.0 或 subproject 新语义。
- 研究阶段不运行本稿设计的 fixture 或根级门禁；课程实施阶段按“如何验证”执行，结果写入独立 signoff。
