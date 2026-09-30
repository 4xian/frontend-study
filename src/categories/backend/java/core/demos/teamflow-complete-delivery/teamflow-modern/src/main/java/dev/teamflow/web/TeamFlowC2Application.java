package dev.teamflow.web;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import dev.teamflow.domain.Money;
import dev.teamflow.domain.Task;
import dev.teamflow.domain.TaskPriority;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.http.ResponseEntity;
import tools.jackson.databind.ObjectMapper;

/** 输出 C2 的 REST、JSON、成功响应和 Problem Details 合同样例。 */
public final class TeamFlowC2Application {
  private static final String CREATE_PATH = "/api/v1/projects/PRJ-1/tasks";
  private static final String TASK_PATH = CREATE_PATH + "/TASK-201";
  private static final String REQUEST_JSON =
      "{\"title\":\"Freeze TeamFlow contract\","
          + "\"dueAt\":\"2026-09-01T09:30:00+08:00\","
          + "\"assignee\":\"USR-1\"}";
  private static final String TASK_JSON =
      "{\"id\":\"TASK-201\",\"projectId\":\"PRJ-1\","
          + "\"title\":\"Freeze TeamFlow contract\","
          + "\"dueAt\":\"2026-09-01T09:30:00+08:00\","
          + "\"assignee\":\"USR-1\",\"status\":\"IN_PROGRESS\",\"version\":1}";
  private static final String PROBLEM_JSON =
      "{\"type\":\"about:blank\",\"title\":\"Bad Request\",\"status\":400,"
          + "\"detail\":\"Request body must be valid JSON\","
          + "\"instance\":\"/api/v1/projects/PRJ-1/tasks\","
          + "\"code\":\"INVALID_REQUEST_BODY\","
          + "\"traceId\":\"4bf92f3577b34da6a3ce929d0e0e4736\"}";

  private TeamFlowC2Application() {}

  /**
   * 解析请求并输出可由两个版本逐字比较的合同样例。
   *
   * @param args 启动参数，本检查不使用
   * @throws Exception JSON 编解码失败
   */
  public static void main(String[] args) throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    CreateTaskRequest request = mapper.readValue(REQUEST_JSON, CreateTaskRequest.class);
    OffsetDateTime dueAt = OffsetDateTime.parse(request.dueAt);
    Task task =
        new Task(
            "TASK-201",
            "PRJ-1",
            request.title,
            TaskPriority.HIGH,
            request.assignee,
            dueAt.toLocalDate(),
            new BigDecimal("8.0"),
            BigDecimal.ZERO,
            new Money("CNY", new BigDecimal("800.00")));
    require(task.start(), "created task must enter IN_PROGRESS");

    TaskResource resource = TaskResource.from(task, request.dueAt);
    ProblemDetails problem =
        new ProblemDetails(
            "about:blank",
            "Bad Request",
            400,
            "Request body must be valid JSON",
            CREATE_PATH,
            "INVALID_REQUEST_BODY",
            "4bf92f3577b34da6a3ce929d0e0e4736");
    String requestJson = mapper.writeValueAsString(request);
    String taskJson = mapper.writeValueAsString(resource);
    ResponseEntity<ProblemDetails> problemResponse = ResponseEntity.status(400).body(problem);
    String problemJson = mapper.writeValueAsString(problemResponse.getBody());
    TaskResource decoded = mapper.readValue(taskJson, TaskResource.class);
    boolean roundTrip = taskJson.equals(mapper.writeValueAsString(decoded));
    boolean statusMatches = problemResponse.getStatusCode().value() == problem.status;

    require(REQUEST_JSON.equals(requestJson), "request JSON contract changed");
    require(TASK_JSON.equals(taskJson), "task JSON contract changed");
    require(PROBLEM_JSON.equals(problemJson), "problem JSON contract changed");
    require(dueAt.toLocalDate().equals(task.dueDate()), "dueAt must map to the domain due date");
    require(roundTrip, "task JSON must round trip");
    require(statusMatches, "HTTP status and Problem Details status must match");

    System.out.println("checkpoint=C2");
    System.out.println("route.create=POST " + CREATE_PATH);
    System.out.println("route.read=GET " + TASK_PATH);
    System.out.println("request.contentType=application/json");
    System.out.println("request.json=" + requestJson);
    System.out.println("success.status=201");
    System.out.println("success.location=" + TASK_PATH);
    System.out.println("success.contentType=application/json");
    System.out.println("success.json=" + taskJson);
    System.out.println("problem.status=" + problemResponse.getStatusCode().value());
    System.out.println("problem.contentType=application/problem+json");
    System.out.println("problem.json=" + problemJson);
    System.out.println("contract.statusMatches=" + statusMatches);
    System.out.println("contract.roundTrip=" + roundTrip);
  }

  /** 请求 JSON 不满足冻结合同时终止检查。 */
  private static void require(boolean condition, String message) {
    if (!condition) {
      throw new IllegalStateException(message);
    }
  }

  /** 表示客户端可以提交的任务字段。 */
  @JsonPropertyOrder({"title", "dueAt", "assignee"})
  public static final class CreateTaskRequest {
    public final String title;
    public final String dueAt;
    public final String assignee;

    /**
     * 创建任务请求。
     *
     * @param title 任务标题
     * @param dueAt 带偏移的截止时间
     * @param assignee 负责人用户 ID
     */
    @JsonCreator
    public CreateTaskRequest(
        @JsonProperty("title") String title,
        @JsonProperty("dueAt") String dueAt,
        @JsonProperty("assignee") String assignee) {
      this.title = title;
      this.dueAt = dueAt;
      this.assignee = assignee;
    }
  }

  /** 表示客户端可见的任务资源。 */
  @JsonPropertyOrder({"id", "projectId", "title", "dueAt", "assignee", "status", "version"})
  public static final class TaskResource {
    public final String id;
    public final String projectId;
    public final String title;
    public final String dueAt;
    public final String assignee;
    public final String status;
    public final long version;

    /**
     * 创建任务资源。
     *
     * @param id 任务 ID
     * @param projectId 所属项目 ID
     * @param title 任务标题
     * @param dueAt 带偏移的截止时间
     * @param assignee 负责人用户 ID
     * @param status 任务状态
     * @param version 领域版本
     */
    @JsonCreator
    public TaskResource(
        @JsonProperty("id") String id,
        @JsonProperty("projectId") String projectId,
        @JsonProperty("title") String title,
        @JsonProperty("dueAt") String dueAt,
        @JsonProperty("assignee") String assignee,
        @JsonProperty("status") String status,
        @JsonProperty("version") long version) {
      this.id = id;
      this.projectId = projectId;
      this.title = title;
      this.dueAt = dueAt;
      this.assignee = assignee;
      this.status = status;
      this.version = version;
    }

    /**
     * 把领域任务映射为公开 JSON 资源。
     *
     * @param task 领域任务
     * @param dueAt 合同中的带偏移时间
     * @return 任务资源
     */
    public static TaskResource from(Task task, String dueAt) {
      return new TaskResource(
          task.id(),
          task.projectId(),
          task.title(),
          dueAt,
          task.assigneeUserId(),
          task.status().name(),
          task.version());
    }
  }

  /** 表示 RFC 9457 标准成员和 TeamFlow 扩展成员。 */
  @JsonPropertyOrder({"type", "title", "status", "detail", "instance", "code", "traceId"})
  public static final class ProblemDetails {
    public final String type;
    public final String title;
    public final int status;
    public final String detail;
    public final String instance;
    public final String code;
    public final String traceId;

    /**
     * 创建字段稳定的 Problem Details。
     *
     * @param type 问题类型 URI
     * @param title 问题摘要
     * @param status HTTP 状态
     * @param detail 本次错误说明
     * @param instance 请求路径
     * @param code 稳定业务错误码
     * @param traceId 追踪标识
     */
    @JsonCreator
    public ProblemDetails(
        @JsonProperty("type") String type,
        @JsonProperty("title") String title,
        @JsonProperty("status") int status,
        @JsonProperty("detail") String detail,
        @JsonProperty("instance") String instance,
        @JsonProperty("code") String code,
        @JsonProperty("traceId") String traceId) {
      this.type = type;
      this.title = title;
      this.status = status;
      this.detail = detail;
      this.instance = instance;
      this.code = code;
      this.traceId = traceId;
    }
  }
}
