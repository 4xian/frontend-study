package dev.teamflow.integration;

import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/** 将外部项目读取放到具名执行器，并把结果和异常交给调用方观察。 */
@Service
public class AsyncPartnerProjectService {
  private final PartnerProjectClient client;

  /** 注入外部项目客户端。 */
  public AsyncPartnerProjectService(PartnerProjectClient client) {
    this.client = client;
  }

  /** 异步查询外部项目，异常以异常完成的 Future 返回。 */
  @Async("teamflowTaskExecutor")
  public CompletableFuture<PartnerProjectClient.PartnerProject> findProject(String projectId) {
    try {
      return CompletableFuture.completedFuture(client.findProject(projectId));
    } catch (RuntimeException exception) {
      CompletableFuture<PartnerProjectClient.PartnerProject> failed = new CompletableFuture<>();
      failed.completeExceptionally(exception);
      return failed;
    }
  }
}
