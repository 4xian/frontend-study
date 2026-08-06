import type { LearningTrackManifest, PlannedLearningEntryManifest } from '@/common/catalog/types'

/** 创建尚未进入 Phase 4 的冻结课程规划项。 */
function planned(id: string, title: string, summary: string): PlannedLearningEntryManifest {
  return { id, title, summary, status: 'planned' }
}

export const backendJavaTrackManifest: LearningTrackManifest = {
  stages: [
    {
      id: 'basics',
      title: '基础课程',
      summary: '从 Java 运行过程开始，建立语言、标准库与构建基础。',
      categories: [
        {
          id: 'language-runtime',
          title: '语言与运行基础',
          summary: '理解源码如何组织和运行，并掌握值、控制流、方法与数组。',
          topics: ['JDK 与运行过程', '源码结构', '类型与控制流', '方法与数组'],
          entries: [
            {
              id: 'backend.java.learn.basics.development-environment-and-runtime',
              status: 'available',
            },
            planned(
              'backend.java.learn.basics.packages-imports-and-source-structure',
              '包、import 与源码目录',
              '阅读 dzzz-app 的分包、类型引用和 Maven 源码目录前不可绕过。',
            ),
            planned(
              'backend.java.learn.basics.variables-types-and-operators',
              '变量、类型、赋值与运算符',
              '控制流、方法、对象和集合都需要先建立值、类型与表达式的基础心智模型。',
            ),
            planned(
              'backend.java.learn.basics.control-flow',
              '条件、switch 与循环控制',
              '项目直接使用分支和增强 for，方法实现与集合遍历都依赖控制流。',
            ),
            planned(
              'backend.java.learn.basics.methods-parameters-and-scope',
              '方法、参数、返回值、作用域与值传递',
              '3436 个项目文件的公开方法和调用关系无法在缺少方法基础时理解。',
            ),
            planned(
              'backend.java.learn.basics.arrays-and-varargs',
              '数组、可变参数与索引边界',
              '字符串、I/O、校验器和二进制处理课程实际依赖数组与索引边界。',
            ),
          ],
        },
        {
          id: 'object-model',
          title: '对象与类型建模',
          summary: '用对象、抽象类型和元数据建立可维护的 Java 合同。',
          topics: ['类与对象', '抽象与多态', '枚举与注解', '异常与泛型'],
          entries: [
            planned(
              'backend.java.learn.basics.classes-objects-and-immutability',
              '类、对象、构造过程、封装与不可变性',
              '项目的数据模型、服务和配置类直接依赖对象建模，且共享可变状态风险要求同时建立不可变性边界。',
            ),
            planned(
              'backend.java.learn.basics.interfaces-inheritance-and-polymorphism',
              '接口、继承、抽象类型与多态',
              'Service/实现、策略、适配器和匿名回调均直接依赖抽象类型与动态分派。',
            ),
            planned(
              'backend.java.learn.basics.enums-and-finite-values',
              '枚举与有限值建模',
              '项目包含大量枚举和状态值；课程只教类型化有限值，不复制业务枚举清单。',
            ),
            planned(
              'backend.java.learn.basics.annotations-and-metadata',
              '注解、元注解与运行时元数据',
              'Spring、Validation、MyBatis 和项目自定义横切合同广泛使用注解。',
            ),
            planned(
              'backend.java.learn.basics.exceptions-and-cause-chains',
              '异常层级、传播、捕获与 cause 链',
              '项目直接抛出、捕获和转换异常；风险证据只用于纠正吞没、宽泛捕获和 cause 丢失。',
            ),
            planned(
              'backend.java.learn.basics.generics-and-type-safety',
              '泛型、类型边界与类型安全',
              '集合、Mapper、结果对象和回调都依赖泛型；原始类型风险仅作为纠错证据。',
            ),
          ],
        },
        {
          id: 'standard-library',
          title: '核心标准库合同',
          summary: '掌握后端处理中最常用的数据、时间、文本与资源边界。',
          topics: ['文本与编码', '集合与缺失语义', '日期时间', 'I/O 与资源关闭'],
          entries: [
            planned(
              'backend.java.learn.basics.strings-encoding-and-text-matching',
              '字符串、字符编码、正则与 Base64',
              'HTTP、文件、日志和外部协议都依赖明确的文本与字节边界。',
            ),
            planned(
              'backend.java.learn.basics.collections-and-iteration-contracts',
              'Collection、List、Set、Map 与迭代合同',
              '项目广泛传递集合；删除、只读视图、比较与去重需要作为同一组合同理解。',
            ),
            planned(
              'backend.java.learn.basics.null-optional-and-failure-semantics',
              'null、Optional、缺失与失败语义',
              '项目存在 Optional 使用和大量空值风险；课程必须区分缺失、失败与合法空结果。',
            ),
            planned(
              'backend.java.learn.basics.date-time-and-time-zones',
              '日期时间、时区与 legacy Date 映射',
              '项目使用传统日期 API；主线先教 java.time，再建立 Java 8 与旧 Date 的迁移边界。',
            ),
            planned(
              'backend.java.learn.basics.io-files-and-resource-ownership',
              'I/O、文件系统、资源所有权与关闭',
              '上传下载、文档处理和网络客户端都依赖流与关闭责任；风险证据只用于异常路径纠错。',
            ),
          ],
        },
        {
          id: 'build-model',
          title: '项目与构建模型',
          summary: '理解 Java 项目的依赖、生命周期和多模块组织。',
          topics: ['Maven', '依赖管理', '多模块结构'],
          entries: [
            planned(
              'backend.java.learn.basics.maven-project-model',
              'Maven 坐标、依赖、生命周期与多模块结构',
              '理解 dzzz-app 的 parent、依赖、插件、WAR 和后续 Spring Boot 版本边界所必需。',
            ),
          ],
        },
      ],
    },
    {
      id: 'intermediate',
      title: '中级课程',
      summary: '从数据与协议进入分层、测试、Spring Web 和持久化。',
      categories: [
        {
          id: 'data-and-protocols',
          title: '数据与协议基础',
          summary: '用稳定的数据合同连接集合处理、HTTP 与关系数据。',
          topics: ['Stream', '标识与分页', 'JSON', 'HTTP', 'SQL'],
          entries: [
            planned(
              'backend.java.learn.intermediate.lambda-stream-and-collectors',
              'Lambda、方法引用、Stream 与 Collectors',
              '项目直接使用 Lambda、方法引用和 Stream；课程按集合处理顺序建立心智模型。',
            ),
            planned(
              'backend.java.learn.intermediate.identifiers-equality-and-pagination',
              '标识符、相等性、排序与分页参数',
              '项目的 UUID、分页与集合语义需要稳定标识、相等性和边界参数共同支撑。',
            ),
            planned(
              'backend.java.learn.intermediate.json-and-data-contracts',
              'JSON、对象映射与外部数据合同',
              '项目同时存在 Jackson、Fastjson 和外部合同；现代安全映射在主线，旧解析方式只作迁移纠错。',
            ),
            planned(
              'backend.java.learn.intermediate.http-uri-and-request-response-basics',
              'HTTP、URI、请求响应与 URL 编码基础',
              'Spring MVC 与外部 HTTP 客户端都需要先理解协议、状态、头部、URI 和载荷边界。',
            ),
            planned(
              'backend.java.learn.intermediate.relational-data-and-sql-foundations',
              '关系数据、SQL 与事务基础',
              '理解 Mapper、分页、动态 SQL、连接池和事务边界不可绕过。',
            ),
          ],
        },
        {
          id: 'architecture-and-feedback',
          title: '分层与反馈环',
          summary: '建立职责清晰的业务边界、错误合同和可重复测试。',
          topics: ['分层架构', 'DTO', '错误与日志', 'JUnit 与 Mockito'],
          entries: [
            planned(
              'backend.java.learn.intermediate.layers-dto-and-service-boundaries',
              '分层架构、DTO 与业务编排边界',
              '项目的 Controller、Service、Mapper 和多类模型需要明确职责；超大类只作拆分边界的反例。',
            ),
            planned(
              'backend.java.learn.intermediate.errors-results-and-logging',
              '错误合同、结果对象与结构化日志',
              '项目的异常、HTTP 错误和日志存在跨层边界；敏感内容风险只用于去敏与稳定错误合同。',
            ),
            planned(
              'backend.java.learn.intermediate.testing-with-junit-and-mocks',
              '最小反馈环、JUnit 与 Mockito',
              '项目只有少量 JUnit 4 测试；主线建立现代可观察断言，旧测试结构只作迁移补充。',
            ),
          ],
        },
        {
          id: 'spring-web',
          title: 'Spring 与 Web 边界',
          summary: '理解容器、配置、请求生命周期和输入校验。',
          topics: ['Spring Boot', '依赖注入', 'Spring MVC', 'Bean Validation'],
          entries: [
            planned(
              'backend.java.learn.intermediate.spring-boot-and-configuration',
              'Spring Boot 启动、自动配置与配置建模',
              '项目启动、Bean 和配置事实都依赖 Boot；未生效配置和状态背离仅作为纠错边界。',
            ),
            planned(
              'backend.java.learn.intermediate.dependency-injection-and-bean-lifecycle',
              'IoC、构造器注入与 Bean 生命周期',
              '项目大量依赖 Spring Bean；静态服务定位与容器绕过只用于说明显式依赖和测试 seam。',
            ),
            planned(
              'backend.java.learn.intermediate.spring-mvc-and-servlet-boundaries',
              'Spring MVC、Servlet 与 API 合同',
              '项目的 Controller、Filter、Interceptor 和 Servlet 流都属于请求边界，必须先讲协议合同。',
            ),
            planned(
              'backend.java.learn.intermediate.bean-validation-and-input-contracts',
              'Bean Validation、参数绑定与输入合同',
              '项目有标准与私有校验体系；主线讲标准触发链，私有语义只作为纠错对照。',
            ),
          ],
        },
        {
          id: 'persistence-and-design',
          title: '持久化与服务设计',
          summary: '连接数据访问、事务、生成代码和业务协作模式。',
          topics: ['MyBatis', '事务与幂等', 'Lombok', '服务模式', '领域值'],
          entries: [
            planned(
              'backend.java.learn.intermediate.mybatis-and-mybatis-plus',
              'MyBatis、Mapper XML 与 MyBatis-Plus',
              '项目直接使用 Mapper、XML 和 MyBatis-Plus；资源布局漂移作为合同校验的反例。',
            ),
            planned(
              'backend.java.learn.intermediate.transactions-and-idempotency',
              '事务边界、幂等与失败回退',
              '项目存在声明式事务和外部副作用；课程明确数据库原子性不能覆盖外部系统。',
            ),
            planned(
              'backend.java.learn.intermediate.lombok-and-generated-contracts',
              'Lombok、可变模型与生成合同',
              '项目大量使用 Lombok；课程必须显式说明生成方法、继承构建和可变性合同。',
            ),
            planned(
              'backend.java.learn.intermediate.service-design-patterns',
              '策略、模板方法、适配器与回调',
              '项目已出现这些协作形态；合并讲解可避免把单一模式拆成无必要的百科课程。',
            ),
            planned(
              'backend.java.learn.intermediate.domain-values-trees-and-mapping',
              '领域值对象、树结构与对象映射',
              '项目存在对象转换、树和坐标值；课程聚焦边界清晰的值建模，不复制业务字段。',
            ),
          ],
        },
      ],
    },
    {
      id: 'advanced',
      title: '高级课程',
      summary: '处理并发、集成、资源、安全和现代化迁移边界。',
      categories: [
        {
          id: 'cross-cutting-and-concurrency',
          title: '横切与并发状态',
          summary: '显式管理代理、线程、上下文、异步任务与缓存一致性。',
          topics: ['反射与 AOP', '并发与锁', '线程上下文', '异步与重试', '缓存'],
          entries: [
            planned(
              'backend.java.learn.advanced.reflection-aop-and-cross-cutting-contracts',
              '反射、Spring AOP 与横切合同',
              '项目切面依赖反射和代理；风险项只说明切点扩大与控制流改写的纠错边界。',
            ),
            planned(
              'backend.java.learn.advanced.concurrency-locks-and-shared-state',
              '线程池、并发集合、锁与共享状态',
              '项目存在执行器、并发容器和进程级共享状态；裸线程与字符串池锁只作反例。',
            ),
            planned(
              'backend.java.learn.advanced.thread-context-and-cleanup',
              'ThreadLocal、请求上下文传播与清理',
              '项目在线程本地和请求上下文中传递状态；课程明确传播与 finally 清理责任。',
            ),
            planned(
              'backend.java.learn.advanced.events-async-scheduling-and-retry',
              '事件、异步执行、调度与重试',
              '项目直接使用事件、@Async、调度、执行器和重试；同步/异步与失败观测必须显式验证。',
            ),
            planned(
              'backend.java.learn.advanced.cache-and-consistency',
              '进程内缓存、Redis、失效与一致性',
              '项目确认进程内启动缓存并仅有极少 Redis 证据；课程必须区分两者并讲清回收边界。',
            ),
          ],
        },
        {
          id: 'integration-and-resources',
          title: '集成与资源生命周期',
          summary: '为实时通信、数据、网络、文件和进程资源建立可验证边界。',
          topics: ['WebSocket', '数据分片', 'HTTP 客户端', '文件与流', 'JVM 可观测性'],
          entries: [
            planned(
              'backend.java.learn.advanced.websocket-and-realtime-lifecycle',
              'WebSocket 会话、广播、心跳与回收',
              '项目存在 WebSocket 端点与会话表；连接、慢客户端、回收和幂等必须作为一个生命周期理解。',
            ),
            planned(
              'backend.java.learn.advanced.database-sharding-and-sql-boundaries',
              '分片、动态 SQL 与数据访问边界',
              '项目存在反射分片与 SQL 文本改写；课程主线以类型化边界和可验证 SQL 为准。',
            ),
            planned(
              'backend.java.learn.advanced.http-clients-and-integration-resilience',
              'HTTP 客户端、超时、资源生命周期与集成韧性',
              '项目有大量外部 HTTP 调用；超时、连接复用、关闭、重试和失败回退必须成组验证。',
            ),
            planned(
              'backend.java.learn.advanced.file-storage-and-archive-boundaries',
              '文件上传、存储、下载与归档安全边界',
              '项目有上传下载、对象存储和压缩处理；路径、大小、类型与展开边界必须优先于厂商细节。',
            ),
            planned(
              'backend.java.learn.advanced.binary-streams-media-and-backpressure',
              '随机访问、压缩、图像与流式背压',
              '文档和媒体链路需要字节偏移、压缩、图像与流式处理；无界缓冲只作为背压反例。',
            ),
            planned(
              'backend.java.learn.advanced.process-jvm-and-observability',
              '外部进程、JVM 环境、JMX 与可观测性',
              '项目启动外部进程并读取运行环境；课程强调生命周期、全局副作用和可观测验证。',
            ),
          ],
        },
        {
          id: 'application-security',
          title: '应用安全边界',
          summary: '从资源授权、不可信输入和秘密管理建立现代安全主线。',
          topics: ['认证与授权', 'JWT', '密码学与秘密', '输入与 API 暴露'],
          entries: [
            planned(
              'backend.java.learn.advanced.authentication-authorization-and-jwt',
              '认证、授权、资源边界与 JWT',
              '项目存在匿名面、用户上下文和 JWT；主线从资源授权与不可信身份输入建立安全边界。',
            ),
            planned(
              'backend.java.learn.advanced.cryptography-secrets-and-license-verification',
              '密码学 API、秘密管理、签名与许可证校验',
              '项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。',
            ),
            planned(
              'backend.java.learn.advanced.secure-input-and-api-exposure',
              '输入安全、过滤链、CORS 与 API 暴露边界',
              '理解项目过滤器、动态视图和文档暴露风险需要一门现代输入与接口安全课程。',
            ),
          ],
        },
        {
          id: 'architecture-modernization',
          title: '架构协作与现代化',
          summary: '组织复杂协作流程，并隔离 legacy 版本与迁移风险。',
          topics: ['责任链与注册表', '工厂与状态机', 'Legacy 隔离', '现代化迁移'],
          entries: [
            planned(
              'backend.java.learn.advanced.chains-registries-and-state-machines',
              '责任链、注册表、工厂与状态机',
              '项目的处理器链、服务查找和任务状态需要统一讲解顺序、生命周期与显式依赖。',
            ),
            planned(
              'backend.java.learn.advanced.legacy-isolation-and-modernization',
              'Legacy 隔离、javax/jakarta 与现代化迁移',
              'Java 8、Boot 2.3、旧 API 和历史命名必须与现代主线隔离并提供迁移地图。',
            ),
          ],
        },
      ],
    },
  ],
}
