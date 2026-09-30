package dev.teamflow.web;

import dev.teamflow.application.AttachmentService;
import dev.teamflow.application.AttachmentService.Attachment;
import dev.teamflow.application.ProjectTaskService;
import dev.teamflow.application.ResourceAccessService;
import dev.teamflow.security.TeamFlowActor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.net.URI;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 提供任务附件的上传与下载边界。 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/tasks/{taskId}/attachments")
@Tag(name = "Task Attachments", description = "任务附件")
public class TaskAttachmentController {
  private final ProjectTaskService projectTaskService;
  private final AttachmentService attachmentService;
  private final ResourceAccessService resourceAccessService;

  /**
   * 注入任务查询、附件与资源归属服务。
   *
   * @param projectTaskService 项目任务服务
   * @param attachmentService 附件服务
   * @param resourceAccessService 资源归属服务
   */
  public TaskAttachmentController(
      ProjectTaskService projectTaskService,
      AttachmentService attachmentService,
      ResourceAccessService resourceAccessService) {
    this.projectTaskService = projectTaskService;
    this.attachmentService = attachmentService;
    this.resourceAccessService = resourceAccessService;
  }

  /**
   * 向当前主体可访问的任务上传附件。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param file multipart 文件
   * @param authentication 当前身份
   * @return 已创建附件元数据及其 Location
   */
  @PostMapping(
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "上传任务附件")
  @ApiResponse(responseCode = "201", description = "附件已上传")
  public ResponseEntity<AttachmentResponse> upload(
      @PathVariable String projectId,
      @PathVariable String taskId,
      @RequestPart("file") MultipartFile file,
      Authentication authentication) {
    requireTask(authentication, projectId, taskId);
    Attachment attachment =
        attachmentService.store(
            projectId,
            taskId,
            file.getOriginalFilename(),
            file.getContentType(),
            read(file));
    URI location =
        URI.create(
            "/api/v1/projects/" + projectId + "/tasks/" + taskId + "/attachments/" + attachment.id);
    return ResponseEntity.created(location)
        .body(
            new AttachmentResponse(
                attachment.id,
                attachment.fileName,
                attachment.contentType,
                attachment.content.length));
  }

  /**
   * 下载当前主体可访问任务的附件原始字节。
   *
   * @param projectId 项目 ID
   * @param taskId 任务 ID
   * @param attachmentId 附件 ID
   * @param authentication 当前身份
   * @return 附件字节响应
   */
  @GetMapping(path = "/{attachmentId}")
  @Operation(summary = "下载任务附件")
  public ResponseEntity<Resource> download(
      @PathVariable String projectId,
      @PathVariable String taskId,
      @PathVariable String attachmentId,
      Authentication authentication) {
    requireTask(authentication, projectId, taskId);
    Attachment attachment = attachmentService.find(projectId, taskId, attachmentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(attachment.contentType))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.builder("attachment").filename(attachment.fileName).build().toString())
        .body(new ByteArrayResource(attachment.content));
  }

  /** 验证父资源边界。 */
  private void requireTask(Authentication authentication, String projectId, String taskId) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    resourceAccessService.requireProjectAccess(
        actor.userId(), actor.administrator(), projectId);
    projectTaskService.findTask(projectId, taskId);
  }

  /** 复制只在当前请求期间有效的 multipart 字节。 */
  private byte[] read(MultipartFile file) {
    try {
      return file.getBytes();
    } catch (IOException exception) {
      throw new IllegalStateException("Attachment cannot be read", exception);
    }
  }

  /** 附件公开元数据。 */
  public static final class AttachmentResponse {
    public final String id;
    public final String fileName;
    public final String contentType;
    public final int size;

    public AttachmentResponse(String id, String fileName, String contentType, int size) {
      this.id = id;
      this.fileName = fileName;
      this.contentType = contentType;
      this.size = size;
    }
  }
}
