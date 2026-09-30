package dev.teamflow.web;

import dev.teamflow.integration.AsyncPartnerProjectService;
import dev.teamflow.integration.PartnerProjectClient;
import dev.teamflow.integration.PartnerProjectClient.PartnerProject;
import dev.teamflow.integration.PartnerProjectClient.PartnerUnavailableException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.concurrent.ExecutionException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 暴露外部项目目录的同步与异步联调入口。 */
@RestController
@RequestMapping("/api/v1/partner/projects")
public class PartnerProjectController {
  private final PartnerProjectClient client;
  private final AsyncPartnerProjectService asyncService;

  /** 注入同步客户端和异步应用服务。 */
  public PartnerProjectController(
      PartnerProjectClient client, AsyncPartnerProjectService asyncService) {
    this.client = client;
    this.asyncService = asyncService;
  }

  /** 同步查询外部项目，并将适配层错误交给统一 Problem Details 处理。 */
  @Operation(summary = "同步查询外部项目")
  @ApiResponse(responseCode = "200", description = "外部项目已返回")
  @GetMapping("/{projectId}")
  public PartnerProject findProject(@PathVariable String projectId) {
    return client.findProject(projectId);
  }

  /** 通过具名执行器查询外部项目，并观察 Future 的成功或异常结果。 */
  @Operation(summary = "异步查询外部项目")
  @ApiResponse(responseCode = "200", description = "外部项目已返回")
  @GetMapping("/{projectId}/async")
  public PartnerProject findProjectAsync(@PathVariable String projectId) {
    try {
      return asyncService.findProject(projectId).get();
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new PartnerUnavailableException("Partner project async call was interrupted", exception);
    } catch (ExecutionException exception) {
      Throwable cause = exception.getCause();
      if (cause instanceof RuntimeException) {
        throw (RuntimeException) cause;
      }
      throw new PartnerUnavailableException("Partner project async call failed", cause);
    }
  }

  /** 创建外部项目；客户端不会为非幂等 POST 自动重试。 */
  @Operation(summary = "创建外部项目")
  @ApiResponse(responseCode = "201", description = "外部项目已创建")
  @PostMapping
  public ResponseEntity<PartnerProject> createProject(
      @Valid @RequestBody CreatePartnerProjectRequest request) {
    return ResponseEntity.status(201).body(client.createProject(request.name));
  }

  /** 外部项目创建请求。 */
  public static class CreatePartnerProjectRequest {
    @NotBlank(message = "name must not be blank")
    @Size(max = 80, message = "name must be at most 80 characters")
    public String name;
  }
}
