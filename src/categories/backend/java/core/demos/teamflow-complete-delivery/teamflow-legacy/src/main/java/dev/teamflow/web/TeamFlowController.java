package dev.teamflow.web;

import dev.teamflow.application.TeamFlowBadRequestException;
import dev.teamflow.application.ProjectTaskService;
import dev.teamflow.application.ResourceAccessService;
import dev.teamflow.application.ProjectTaskService.PageResult;
import dev.teamflow.application.ProjectTaskService.ProjectResult;
import dev.teamflow.application.ProjectTaskService.TaskResult;
import dev.teamflow.application.TaskCommandService;
import dev.teamflow.application.TaskCreationService.CreateTaskCommand;
import dev.teamflow.cache.IdempotentTaskCreator;
import dev.teamflow.cache.ProjectPageCache;
import dev.teamflow.cache.TaskCacheCoordinator;
import dev.teamflow.cache.TaskDetailCache;
import dev.teamflow.cache.TaskListCache;
import dev.teamflow.cache.TeamFlowCacheStateException;
import dev.teamflow.security.SecurityConfiguration;
import dev.teamflow.security.TeamFlowAccountPolicy;
import dev.teamflow.security.TeamFlowActor;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 暴露结课联调矩阵使用的 TeamFlow API。 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Projects and Tasks", description = "项目、任务与交付资源")
public class TeamFlowController {
  private static final long ACCESS_TOKEN_TTL_SECONDS = 300L;

  private final ProjectTaskService projectTaskService;
  private final ProjectPageCache projectPageCache;
  private final ObjectMapper objectMapper;
  private final AuthenticationManager authenticationManager;
  private final SecretKey tokenSigningKey;
  private final IdempotentTaskCreator taskCreator;
  private final TaskCommandService taskCommandService;
  private final TaskCacheCoordinator taskCacheCoordinator;
  private final TaskDetailCache taskDetailCache;
  private final TaskListCache taskListCache;
  private final ResourceAccessService resourceAccessService;
  private final TeamFlowAccountPolicy accountPolicy;

  /**
   * 注入 API 所需的数据库、缓存、安全和任务服务。
   *
   * @param projectTaskService 项目与任务应用服务
   * @param projectPageCache 项目分页缓存
   * @param objectMapper JSON 编解码器
   * @param authenticationManager 用户名密码认证器
   * @param tokenSigningKey JWT 签名密钥
   * @param taskCreator 幂等任务创建服务
   * @param taskCommandService 任务写入服务
   * @param taskCacheCoordinator 任务写后缓存协调器
   * @param taskDetailCache 任务详情缓存
   * @param taskListCache 任务列表缓存
   * @param resourceAccessService 资源归属服务
   * @param accountPolicy 本地账号声明策略
   */
  public TeamFlowController(
      ProjectTaskService projectTaskService,
      ProjectPageCache projectPageCache,
      ObjectMapper objectMapper,
      AuthenticationManager authenticationManager,
      SecretKey tokenSigningKey,
      IdempotentTaskCreator taskCreator,
      TaskCommandService taskCommandService,
      TaskCacheCoordinator taskCacheCoordinator,
      TaskDetailCache taskDetailCache,
      TaskListCache taskListCache,
      ResourceAccessService resourceAccessService,
      TeamFlowAccountPolicy accountPolicy) {
    this.projectTaskService = projectTaskService;
    this.projectPageCache = projectPageCache;
    this.objectMapper = objectMapper;
    this.authenticationManager = authenticationManager;
    this.tokenSigningKey = tokenSigningKey;
    this.taskCreator = taskCreator;
    this.taskCommandService = taskCommandService;
    this.taskCacheCoordinator = taskCacheCoordinator;
    this.taskDetailCache = taskDetailCache;
    this.taskListCache = taskListCache;
    this.resourceAccessService = resourceAccessService;
    this.accountPolicy = accountPolicy;
  }

  /**
   * 用已验证的本地演示凭据签发短期 JWT。
   *
   * @param request 登录请求
   * @return access token
   */
  @PostMapping(value = "/auth/token", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "签发访问令牌")
  public TokenResponse issueToken(@RequestBody AuthRequest request) {
    Authentication authentication;
    try {
      authentication =
          authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(request.username, request.password));
    } catch (AuthenticationException exception) {
      throw new TeamFlowUnauthorizedException("Invalid TeamFlow credentials");
    }

    TeamFlowAccountPolicy.Account account = accountPolicy.account(authentication.getName());
    Instant issuedAt = Instant.now();
    JWTClaimsSet claims =
        new JWTClaimsSet.Builder()
            .issuer(SecurityConfiguration.ISSUER)
            .subject(authentication.getName())
            .audience(Collections.singletonList(SecurityConfiguration.AUDIENCE))
            .issueTime(Date.from(issuedAt))
            .expirationTime(Date.from(issuedAt.plusSeconds(ACCESS_TOKEN_TTL_SECONDS)))
            .claim("userId", account.userId)
            .claim("roles", account.roles)
            .claim("permissions", account.permissions)
            .build();
    SignedJWT signedJwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
    try {
      signedJwt.sign(new MACSigner(tokenSigningKey.getEncoded()));
    } catch (JOSEException exception) {
      throw new IllegalStateException("TeamFlow JWT cannot be signed", exception);
    }
    return new TokenResponse(signedJwt.serialize(), "Bearer", ACCESS_TOKEN_TTL_SECONDS);
  }

  /**
   * 返回当前 JWT 建立的主体和 authority。
   *
   * @param authentication 当前身份
   * @return 用户摘要
   */
  @GetMapping("/me")
  @Operation(summary = "读取当前用户")
  public Map<String, Object> currentUser(Authentication authentication) {
    List<String> authorities = new ArrayList<String>();
    for (GrantedAuthority authority : authentication.getAuthorities()) {
      authorities.add(authority.getAuthority());
    }
    Map<String, Object> body = new LinkedHashMap<String, Object>();
    body.put("username", authentication.getName());
    body.put("userId", TeamFlowActor.from(authentication).userId());
    body.put("authorities", authorities);
    return body;
  }

  /**
   * 按既有 pageToken 合同读取项目分页，并缓存同形公开响应。
   *
   * @param pageSize 单页数量
   * @param pageToken 不透明分页 token
   * @param authentication 当前身份
   * @return 只含 items 与 nextPageToken 的项目分页
   */
  @GetMapping("/projects")
  @Operation(summary = "查询项目分页")
  public ProjectPage listProjects(
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String pageToken,
      Authentication authentication) {
    if (pageSize < 1 || pageSize > 50) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_SIZE", "pageSize must be from 1 to 50");
    }
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    int start = pageStart(pageToken);
    long generation = projectPageCache.currentGeneration();
    String cached = projectPageCache.get(actor.cacheScope(), generation, pageSize, pageToken);
    if (cached != null) {
      return readProjectPage(cached, pageSize);
    }

    PageResult<ProjectResult> result =
        projectTaskService.listProjects(
            actor.userId(), actor.administrator(), pageSize, start);
    List<ProjectResponse> projects =
        result.items().stream()
            .map(row -> new ProjectResponse(row.id, row.name))
            .collect(java.util.stream.Collectors.toList());
    String nextPageToken =
        result.nextOffset() == null ? null : "PROJECT-PAGE-" + (result.nextOffset() + 1);
    ProjectPage page = new ProjectPage(projects, nextPageToken);
    projectPageCache.put(
        actor.cacheScope(), generation, pageSize, pageToken, writeProjectPage(page));
    return page;
  }

  /**
   * 查询当前主体可访问的单个项目。
   *
   * @param projectId 项目 ID
   * @param authentication 当前身份
   * @return 项目公开响应
   */
  @GetMapping("/projects/{projectId}")
  @Operation(summary = "查询项目")
  public ProjectResponse getProject(
      @PathVariable String projectId, Authentication authentication) {
    requireProjectAccess(authentication, projectId);
    ProjectResult project = projectTaskService.findProject(projectId);
    return new ProjectResponse(project.id, project.name);
  }

  /**
   * 在当前主体可访问的团队中创建项目。
   *
   * @param request 创建项目请求
   * @param authentication 当前身份
   * @return 已创建项目及其 Location
   */
  @PostMapping(value = "/projects", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "创建项目")
  @ApiResponse(responseCode = "201", description = "项目已创建")
  public ResponseEntity<ProjectResponse> createProject(
      @Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    resourceAccessService.requireTeamAccess(
        actor.userId(), actor.administrator(), request.teamId);
    ProjectResult project = projectTaskService.createProject(request.teamId, request.name);
    projectPageCache.advance();
    URI location = URI.create("/api/v1/projects/" + project.id);
    return ResponseEntity.created(location).body(new ProjectResponse(project.id, project.name));
  }

  /**
   * 按当前主体可访问的项目和状态读取任务分页。
   *
   * @param projectId 项目 ID
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @param status 可选任务状态
   * @param authentication 当前身份
   * @return 任务分页响应
   */
  @GetMapping("/projects/{projectId}/tasks")
  @Operation(summary = "查询任务分页")
  public TaskPage listTasks(
      @PathVariable String projectId,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String pageToken,
      @RequestParam(required = false) String status,
      Authentication authentication) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    if (pageSize < 1 || pageSize > 50) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_SIZE", "pageSize must be from 1 to 50");
    }
    String normalizedStatus = normalizeTaskStatus(status);
    int start = taskPageStart(projectId, normalizedStatus, pageToken);
    TaskPage cached =
        taskListCache.get(projectId, actor.cacheScope(), normalizedStatus, pageSize, pageToken);
    if (cached != null) {
      return cached;
    }
    resourceAccessService.requireProjectAccess(
        actor.userId(), actor.administrator(), projectId);
    PageResult<TaskResult> result =
        projectTaskService.listTasks(projectId, normalizedStatus, pageSize, start);
    List<TaskResponse> items =
        result.items().stream()
            .map(row -> new TaskResponse(row.id, row.projectId, row.title, row.dueAt, row.assignee, row.status, row.version))
            .collect(java.util.stream.Collectors.toList());
    String nextToken =
        result.nextOffset() == null
            ? null
            : taskPageToken(projectId, normalizedStatus, result.nextOffset());
    TaskPage page = new TaskPage(items, nextToken);
    taskListCache.put(
        projectId, actor.cacheScope(), normalizedStatus, pageSize, pageToken, page);
    return page;
  }

  /**
   * 删除当前主体可访问项目内的任务。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param authentication 当前身份
   * @return 无正文响应
   */
  @DeleteMapping("/projects/{projectId}/tasks/{taskId}")
  @Operation(summary = "删除任务")
  @ApiResponse(responseCode = "204", description = "任务已删除")
  public ResponseEntity<Void> deleteTask(
      @PathVariable String projectId,
      @PathVariable String taskId,
      Authentication authentication) {
    requireProjectAccess(authentication, projectId);
    projectTaskService.deleteTask(projectId, taskId);
    taskCacheCoordinator.invalidateTask(projectId, taskId);
    return ResponseEntity.noContent().build();
  }

  /**
   * 以 Redis 原子占用结果创建或回放任务。
   *
   * @param projectId 项目 ID
   * @param idempotencyKey 幂等键
   * @param request 创建请求
   * @param authentication 当前身份
   * @return 已创建或重放的任务
   */
  @PostMapping(value = "/projects/{projectId}/tasks", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "创建任务")
  @ApiResponse(responseCode = "201", description = "任务已创建或幂等重放")
  public ResponseEntity<TaskResponse> createTask(
      @PathVariable String projectId,
      @RequestHeader("Idempotency-Key") String idempotencyKey,
      @Valid @RequestBody TaskRequest request,
      Authentication authentication) {
    requireProjectAccess(authentication, projectId);
    IdempotentTaskCreator.CreationResult result =
        taskCreator.create(
            projectId,
            idempotencyKey,
            new CreateTaskCommand(projectId, request.title, request.dueAt, request.assignee),
            authentication.getName());
    TaskResponse task =
        new TaskResponse(
            result.task.id,
            result.task.projectId,
            result.task.title,
            result.task.dueAt,
            result.task.assignee,
            result.task.status,
            result.task.version);
    String location = "/api/v1/projects/" + projectId + "/tasks/" + result.task.id;
    ResponseEntity.BodyBuilder response = ResponseEntity.created(URI.create(location));
    if (result.replayed) {
      response.header("Idempotency-Replayed", "true");
    }
    return response.body(task);
  }

  /**
   * 读取一个任务的当前事实状态。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param authentication 当前身份
   * @return 任务状态
   */
  @GetMapping("/projects/{projectId}/tasks/{taskId}")
  @Operation(summary = "查询任务")
  public TaskResponse getTask(
      @PathVariable String projectId,
      @PathVariable String taskId,
      Authentication authentication) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    TaskResponse cached = taskDetailCache.get(projectId, actor.cacheScope(), taskId);
    if (cached != null) {
      return cached;
    }
    resourceAccessService.requireProjectAccess(
        actor.userId(), actor.administrator(), projectId);
    TaskResponse task = findTask(projectId, taskId);
    taskDetailCache.put(projectId, actor.cacheScope(), taskId, task);
    return task;
  }

  /**
   * 通过受方法权限保护的服务完成任务。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param request 完成请求
   * @param authentication 当前身份
   * @return 更新后的任务
   */
  @PutMapping(
      value = "/projects/{projectId}/tasks/{taskId}",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "完成任务")
  public TaskResponse completeTask(
      @PathVariable String projectId,
      @PathVariable String taskId,
      @Valid @RequestBody CompleteTaskRequest request,
      Authentication authentication) {
    requireProjectAccess(authentication, projectId);
    taskCommandService.complete(projectId, taskId, request.version, request.status);
    taskCacheCoordinator.invalidateTask(projectId, taskId);
    return findTask(projectId, taskId);
  }

  /**
   * 返回 outbox 与通知副作用的可观察状态。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param authentication 当前身份
   * @return 通知交付状态
   */
  @GetMapping("/projects/{projectId}/tasks/{taskId}/delivery")
  public DeliveryResponse getDelivery(
      @PathVariable String projectId,
      @PathVariable String taskId,
      Authentication authentication) {
    requireProjectAccess(authentication, projectId);
    ProjectTaskService.DeliveryResult delivery =
        projectTaskService.findDelivery(projectId, taskId);
    return new DeliveryResponse(
        delivery.eventId, delivery.status, delivery.attempts, delivery.notificationCount);
  }

  /** 从 MySQL 读取一个任务。 */
  private TaskResponse findTask(String projectId, String taskId) {
    TaskResult task = projectTaskService.findTask(projectId, taskId);
    return new TaskResponse(
        task.id,
        task.projectId,
        task.title,
        task.dueAt,
        task.assignee,
        task.status,
        task.version);
  }

  /** 验证当前主体可以访问指定项目。 */
  private void requireProjectAccess(Authentication authentication, String projectId) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    resourceAccessService.requireProjectAccess(
        actor.userId(), actor.administrator(), projectId);
  }

  /** 把项目 token 解释为零起始位置。 */
  private int pageStart(String pageToken) {
    if (pageToken == null) {
      return 0;
    }
    String prefix = "PROJECT-PAGE-";
    if (!pageToken.startsWith(prefix)) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
    }
    try {
      String positionText = pageToken.substring(prefix.length());
      int position = Integer.parseInt(positionText);
      if (!positionText.equals(Integer.toString(position)) || position <= 1) {
        throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
      }
      return position - 1;
    } catch (NumberFormatException exception) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
    }
  }

  /** 规范任务状态筛选。 */
  private String normalizeTaskStatus(String status) {
    if (status == null || status.trim().isEmpty()) {
      return null;
    }
    if (!"IN_PROGRESS".equals(status) && !"DONE".equals(status)) {
      throw new TeamFlowBadRequestException("INVALID_TASK_STATUS", "status must be IN_PROGRESS or DONE");
    }
    return status;
  }

  /** 解释绑定项目与状态的任务 token。 */
  private int taskPageStart(String projectId, String status, String pageToken) {
    if (pageToken == null) {
      return 0;
    }
    String prefix = "TASK-PAGE-" + projectId + "-" + (status == null ? "ALL" : status) + "-";
    if (!pageToken.startsWith(prefix)) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
    }
    try {
      String text = pageToken.substring(prefix.length());
      int position = Integer.parseInt(text);
      int offset = position - 1;
      if (!Integer.toString(position).equals(text) || offset <= 0) {
        throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
      }
      return offset;
    } catch (NumberFormatException exception) {
      throw new TeamFlowBadRequestException("INVALID_PAGE_TOKEN", "pageToken is malformed");
    }
  }

  /** 签发带查询上下文的任务 token。 */
  private String taskPageToken(String projectId, String status, int offset) {
    return "TASK-PAGE-" + projectId + "-" + (status == null ? "ALL" : status) + "-" + (offset + 1);
  }

  /** 把同形公开响应写入 Redis。 */
  private String writeProjectPage(ProjectPage page) {
    try {
      return objectMapper.writeValueAsString(page);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Project page cannot be encoded", exception);
    }
  }

  /** 从 Redis 恢复同形公开响应。 */
  private ProjectPage readProjectPage(String value, int pageSize) {
    try {
      ProjectPage page = objectMapper.readValue(value, ProjectPage.class);
      validateProjectPage(page, pageSize);
      return page;
    } catch (JsonProcessingException | IllegalArgumentException exception) {
      throw new TeamFlowCacheStateException("Project page cache is invalid", exception);
    }
  }

  /** 校验项目页缓存的必需字段、数量和下一页 token。 */
  private void validateProjectPage(ProjectPage page, int pageSize) {
    if (page == null
        || page.items == null
        || page.items.size() > pageSize
        || (page.items.isEmpty() && page.nextPageToken != null)) {
      throw new IllegalArgumentException("Project page cache shape is invalid");
    }
    for (ProjectResponse project : page.items) {
      if (project == null
          || project.id == null
          || project.id.trim().isEmpty()
          || project.name == null
          || project.name.trim().isEmpty()) {
        throw new IllegalArgumentException("Project page cache item is invalid");
      }
    }
    validateProjectPageToken(page.nextPageToken);
  }

  /** 校验缓存携带的下一页 token 仍符合公开合同。 */
  private void validateProjectPageToken(String pageToken) {
    if (pageToken == null) {
      return;
    }
    String prefix = "PROJECT-PAGE-";
    if (!pageToken.startsWith(prefix)) {
      throw new IllegalArgumentException("Project page cache token is invalid");
    }
    String positionText = pageToken.substring(prefix.length());
    try {
      int position = Integer.parseInt(positionText);
      if (position <= 1 || !positionText.equals(Integer.toString(position))) {
        throw new IllegalArgumentException("Project page cache token is invalid");
      }
    } catch (NumberFormatException exception) {
      throw new IllegalArgumentException("Project page cache token is invalid", exception);
    }
  }

  /** 登录请求。 */
  public static class AuthRequest {
    public String username;
    public String password;
  }

  /** 令牌响应。 */
  public static class TokenResponse {
    public final String accessToken;
    public final String tokenType;
    public final long expiresIn;

    /**
     * 创建 access token 响应。
     *
     * @param accessToken 三段 JWT
     * @param tokenType Bearer 类型
     * @param expiresIn 有效秒数
     */
    TokenResponse(String accessToken, String tokenType, long expiresIn) {
      this.accessToken = accessToken;
      this.tokenType = tokenType;
      this.expiresIn = expiresIn;
    }
  }

  /** 项目响应。 */
  public static class ProjectResponse {
    public final String id;
    public final String name;

    /**
     * 创建项目响应。
     *
     * @param id 项目 ID
     * @param name 项目名称
     */
    @JsonCreator
    ProjectResponse(@JsonProperty("id") String id, @JsonProperty("name") String name) {
      this.id = id;
      this.name = name;
    }
  }

  /** 项目分页响应。 */
  public static class ProjectPage {
    public final List<ProjectResponse> items;
    public final String nextPageToken;

    /**
     * 创建与既有 API 同形的项目分页。
     *
     * @param items 当前页项目
     * @param nextPageToken 下一页 token
     */
    @JsonCreator
    ProjectPage(
        @JsonProperty("items") List<ProjectResponse> items,
        @JsonProperty("nextPageToken") String nextPageToken) {
      this.items = items;
      this.nextPageToken = nextPageToken;
    }
  }

  /** 任务创建请求。 */
  public static class TaskRequest {
    @NotBlank(message = "title must not be blank")
    @Size(max = 160, message = "title must be at most 160 characters")
    public String title;
    @NotBlank(message = "dueAt must not be blank")
    @Size(max = 40, message = "dueAt must be at most 40 characters")
    public String dueAt;
    @NotBlank(message = "assignee must not be blank")
    @Size(max = 80, message = "assignee must be at most 80 characters")
    public String assignee;
  }

  /** 创建项目请求。 */
  public static class CreateProjectRequest {
    @NotBlank(message = "teamId must not be blank")
    public String teamId;
    @NotBlank(message = "name must not be blank")
    @Size(max = 80, message = "name must be at most 80 characters")
    public String name;
  }

  /** 任务完成请求。 */
  public static class CompleteTaskRequest {
    public long version;
    @NotBlank(message = "status must not be blank")
    public String status;
  }

  /** 任务响应。 */
  public static class TaskResponse {
    public final String id;
    public final String projectId;
    public final String title;
    public final String dueAt;
    public final String assignee;
    public final String status;
    public final long version;

    /**
     * 创建任务公开响应。
     *
     * @param id 任务 ID
     * @param projectId 所属项目 ID
     * @param title 标题
     * @param dueAt 截止时间
     * @param assignee 负责人
     * @param status 状态
     * @param version 乐观版本
     */
    public TaskResponse(
        String id,
        String projectId,
        String title,
        String dueAt,
        String assignee,
        String status,
        long version) {
      this.id = id;
      this.projectId = projectId;
      this.title = title;
      this.dueAt = dueAt;
      this.assignee = assignee;
      this.status = status;
      this.version = version;
    }
  }

  /** 通知交付响应。 */
  public static class DeliveryResponse {
    public final String eventId;
    public final String outboxStatus;
    public final int attempts;
    public final int notificationCount;

    /**
     * 创建通知交付响应。
     *
     * @param eventId 事件 ID
     * @param outboxStatus outbox 状态
     * @param attempts 重试次数
     * @param notificationCount 通知副作用数量
     */
    DeliveryResponse(String eventId, String outboxStatus, int attempts, int notificationCount) {
      this.eventId = eventId;
      this.outboxStatus = outboxStatus;
      this.attempts = attempts;
      this.notificationCount = notificationCount;
    }
  }

  /** 任务分页响应。 */
  public static class TaskPage {
    public final List<TaskResponse> items;
    public final String nextPageToken;

    /**
     * 创建任务分页响应。
     *
     * @param items 当前页任务列表
     * @param nextPageToken 下一页游标
     */
    public TaskPage(List<TaskResponse> items, String nextPageToken) {
      this.items = items;
      this.nextPageToken = nextPageToken;
    }
  }
}
