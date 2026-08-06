export const targetRelationshipKinds = new Set([
  'calls',
  'decorates',
  'extends',
  'function_ref',
  'implements',
  'instantiates',
])

export const modifierTokenNames = new Set([
  'Abstract',
  'Default',
  'Final',
  'Native',
  'NonSealed',
  'Private',
  'Protected',
  'Public',
  'Sealed',
  'Static',
  'Strictfp',
  'Synchronized',
  'Transient',
  'Volatile',
])

export const frameworkRules = [
  {
    id: 'spring-boot',
    importPrefixes: ['org.springframework.boot.'],
    annotations: ['SpringBootApplication', 'EnableAutoConfiguration', 'ConfigurationProperties'],
  },
  {
    id: 'spring-core',
    importPrefixes: ['org.springframework.beans.', 'org.springframework.context.', 'org.springframework.core.'],
    annotations: ['Autowired', 'Bean', 'Component', 'Configuration', 'Import', 'Value'],
  },
  {
    id: 'spring-mvc',
    importPrefixes: ['org.springframework.web.bind.', 'org.springframework.web.servlet.'],
    annotations: [
      'Controller',
      'DeleteMapping',
      'GetMapping',
      'PatchMapping',
      'PostMapping',
      'PutMapping',
      'RequestMapping',
      'RestController',
    ],
  },
  {
    id: 'spring-aop',
    importPrefixes: ['org.aspectj.', 'org.springframework.aop.'],
    annotations: ['After', 'Around', 'Aspect', 'Before', 'Pointcut'],
  },
  {
    id: 'spring-transaction',
    importPrefixes: ['org.springframework.transaction.'],
    annotations: ['Transactional'],
  },
  {
    id: 'spring-cache',
    importPrefixes: ['org.springframework.cache.'],
    annotations: ['CacheEvict', 'CachePut', 'Cacheable', 'EnableCaching'],
  },
  {
    id: 'spring-data-redis',
    importPrefixes: ['org.springframework.data.redis.', 'redis.clients.'],
    annotations: [],
  },
  {
    id: 'spring-integration',
    importPrefixes: ['org.springframework.integration.', 'org.springframework.messaging.'],
    annotations: [],
  },
  {
    id: 'spring-websocket',
    importPrefixes: ['org.springframework.web.socket.', 'javax.websocket.'],
    annotations: ['ClientEndpoint', 'OnClose', 'OnError', 'OnMessage', 'OnOpen', 'ServerEndpoint'],
  },
  {
    id: 'spring-retry',
    importPrefixes: ['org.springframework.retry.'],
    annotations: ['EnableRetry', 'Recover', 'Retryable'],
  },
  {
    id: 'spring-scheduling-async',
    importPrefixes: ['org.springframework.scheduling.'],
    annotations: ['Async', 'EnableAsync', 'EnableScheduling', 'Scheduled'],
  },
  {
    id: 'spring-actuator',
    importPrefixes: ['org.springframework.boot.actuate.'],
    annotations: ['Endpoint', 'ReadOperation', 'WriteOperation'],
  },
  {
    id: 'mybatis-plus',
    importPrefixes: ['com.baomidou.mybatisplus.'],
    annotations: ['TableField', 'TableId', 'TableName'],
  },
  {
    id: 'mybatis',
    importPrefixes: ['org.apache.ibatis.', 'org.mybatis.'],
    annotations: ['Delete', 'Insert', 'Mapper', 'Param', 'Select', 'Update'],
  },
  {
    id: 'servlet',
    importPrefixes: ['javax.servlet.'],
    annotations: ['WebFilter', 'WebListener', 'WebServlet'],
  },
  {
    id: 'bean-validation',
    importPrefixes: ['javax.validation.', 'org.hibernate.validator.'],
    annotations: ['Max', 'Min', 'NotBlank', 'NotEmpty', 'NotNull', 'Size', 'Valid'],
  },
  {
    id: 'lombok',
    importPrefixes: ['lombok.'],
    annotations: [
      'AllArgsConstructor',
      'Builder',
      'Data',
      'Getter',
      'NoArgsConstructor',
      'RequiredArgsConstructor',
      'Setter',
      'Slf4j',
      'ToString',
    ],
  },
  {
    id: 'jackson',
    importPrefixes: ['com.fasterxml.jackson.'],
    annotations: ['JsonFormat', 'JsonIgnore', 'JsonInclude', 'JsonProperty'],
  },
  {
    id: 'fastjson',
    importPrefixes: ['com.alibaba.fastjson.'],
    annotations: ['JSONField'],
  },
  {
    id: 'xml-jaxb',
    importPrefixes: ['javax.xml.', 'javax.xml.bind.', 'org.w3c.dom.', 'org.xml.sax.'],
    annotations: ['XmlAccessorType', 'XmlElement', 'XmlRootElement', 'XmlType'],
  },
  {
    id: 'swagger-2',
    importPrefixes: ['io.swagger.', 'springfox.documentation.'],
    annotations: ['Api', 'ApiImplicitParam', 'ApiModel', 'ApiModelProperty', 'ApiOperation'],
  },
  {
    id: 'http-client',
    importPrefixes: ['java.net.http.', 'okhttp3.', 'org.apache.http.', 'org.springframework.web.client.'],
    annotations: [],
  },
  {
    id: 'junit',
    importPrefixes: ['junit.', 'org.junit.'],
    annotations: ['After', 'AfterEach', 'Before', 'BeforeEach', 'Test'],
  },
  {
    id: 'mockito',
    importPrefixes: ['org.mockito.'],
    annotations: ['InjectMocks', 'Mock', 'Spy'],
  },
]

export const syntaxFeatureRules = [
  ['annotation-use', 'annotation'],
  ['catch-clause', 'catchClause'],
  ['enhanced-for', 'enhancedForStatement'],
  ['generic-declaration', 'typeParameters'],
  ['lambda', 'lambdaExpression'],
  ['method-reference', 'methodReferenceSuffix'],
  ['switch', 'switchStatement'],
  ['synchronized-block', 'synchronizedStatement'],
  ['throw', 'throwStatement'],
  ['try-with-resources', 'tryWithResourcesStatement'],
]
