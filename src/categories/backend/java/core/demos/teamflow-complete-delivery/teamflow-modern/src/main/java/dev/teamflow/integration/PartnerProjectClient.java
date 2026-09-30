package dev.teamflow.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** 通过现代 RestClient 调用外部项目目录。 */
@Component
public final class PartnerProjectClient {
  private final RestClient client;

  /** 创建共享客户端并固定外部调用阶段超时。 */
  public PartnerProjectClient(
      RestClient.Builder builder,
      @Value("${teamflow.partner.base-url:http://127.0.0.1:18090}") String baseUrl) {
    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout(300);
    requestFactory.setReadTimeout(800);
    this.client = builder.baseUrl(baseUrl).requestFactory(requestFactory).build();
  }

  /** 查询外部项目。 */
  public PartnerProject findProject(String projectId) {
    try {
      PartnerProject project =
          client
              .get()
              .uri("/projects/{id}", projectId)
              .accept(MediaType.APPLICATION_JSON)
              .retrieve()
              .onStatus(
                  status -> status.value() == 404,
                  (request, response) -> {
                    throw new PartnerProjectNotFoundException(projectId);
                  })
              .onStatus(
                  HttpStatusCode::isError,
                  (request, response) -> {
                    throw new PartnerUnavailableException(
                        "Partner project service returned " + response.getStatusCode().value());
                  })
              .body(PartnerProject.class);
      return requireBody(project);
    } catch (PartnerProjectNotFoundException | PartnerUnavailableException exception) {
      throw exception;
    } catch (RestClientException exception) {
      throw new PartnerUnavailableException("Partner project service is unavailable", exception);
    }
  }

  /** 创建外部项目；该非幂等 POST 不自动重试。 */
  public PartnerProject createProject(String name) {
    try {
      PartnerProject project =
          client
              .post()
              .uri("/projects")
              .contentType(MediaType.APPLICATION_JSON)
              .accept(MediaType.APPLICATION_JSON)
              .body(new CreateProjectRequest(name))
              .retrieve()
              .onStatus(
                  HttpStatusCode::isError,
                  (request, response) -> {
                    throw new PartnerUnavailableException(
                        "Partner project service returned " + response.getStatusCode().value());
                  })
              .body(PartnerProject.class);
      return requireBody(project);
    } catch (PartnerUnavailableException exception) {
      throw exception;
    } catch (RestClientException exception) {
      throw new PartnerUnavailableException("Partner project service is unavailable", exception);
    }
  }

  /** 拒绝成功状态下缺少项目响应体的结果。 */
  private PartnerProject requireBody(PartnerProject project) {
    if (project == null) {
      throw new PartnerUnavailableException("Partner project service returned an empty body");
    }
    return project;
  }

  /** 外部项目响应。 */
  public record PartnerProject(String id, String name, String status) {}

  /** 创建外部项目请求。 */
  private record CreateProjectRequest(String name) {}

  /** 表示外部项目不存在。 */
  public static final class PartnerProjectNotFoundException extends RuntimeException {
    /** 记录外部项目 ID。 */
    public PartnerProjectNotFoundException(String projectId) {
      super("Partner project not found: " + projectId);
    }
  }

  /** 表示外部服务不可用或违反响应合同。 */
  public static final class PartnerUnavailableException extends RuntimeException {
    /** 创建没有底层原因的外部不可用异常。 */
    public PartnerUnavailableException(String message) {
      super(message);
    }

    /** 保留底层网络异常。 */
    public PartnerUnavailableException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
