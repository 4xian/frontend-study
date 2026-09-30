package dev.teamflow.application;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/** 保存 C3 附件的请求期字节快照，实际持久化留给后续阶段。 */
@Service
public class AttachmentService {
  private static final long MAX_BYTES = 5L * 1024L * 1024L;
  private final Map<String, Attachment> attachments = new ConcurrentHashMap<String, Attachment>();

  /** 接收非空且不超过上限的文件，并生成服务端附件 ID。 */
  public Attachment store(
      String projectId, String taskId, String fileName, String contentType, byte[] content) {
    if (content.length == 0) {
      throw new TeamFlowBadRequestException("EMPTY_FILE", "file must contain at least one byte");
    }
    if (content.length > MAX_BYTES) {
      throw new TeamFlowBadRequestException("FILE_TOO_LARGE", "file must be at most 5 MiB");
    }
    String id = "ATT-" + UUID.randomUUID();
    Attachment attachment =
        new Attachment(id, projectId, taskId, safeName(fileName), contentType, content);
    attachments.put(id, attachment);
    return attachment;
  }

  /** 按任务边界读取附件。 */
  public Attachment find(String projectId, String taskId, String attachmentId) {
    Attachment attachment = attachments.get(attachmentId);
    if (attachment == null
        || !attachment.projectId.equals(projectId)
        || !attachment.taskId.equals(taskId)) {
      throw new TeamFlowNotFoundException("Attachment not found: " + attachmentId);
    }
    return attachment;
  }

  /** 只保留客户端文件名的 basename 和可打印字符。 */
  private String safeName(String originalName) {
    String value = originalName == null ? "attachment.bin" : originalName.replace('\\', '/');
    int slash = value.lastIndexOf('/');
    value = slash >= 0 ? value.substring(slash + 1) : value;
    StringBuilder result = new StringBuilder();
    for (int index = 0; index < value.length(); index++) {
      char item = value.charAt(index);
      if (!Character.isISOControl(item)) {
        result.append(item);
      }
    }
    return result.length() == 0 ? "attachment.bin" : result.toString();
  }

  /** 附件元数据与字节快照。 */
  public static final class Attachment {
    public final String id;
    public final String projectId;
    public final String taskId;
    public final String fileName;
    public final String contentType;
    public final byte[] content;

    private Attachment(
        String id,
        String projectId,
        String taskId,
        String fileName,
        String contentType,
        byte[] content) {
      this.id = id;
      this.projectId = projectId;
      this.taskId = taskId;
      this.fileName = fileName;
      this.contentType = contentType == null ? "application/octet-stream" : contentType;
      this.content = content;
    }
  }
}
