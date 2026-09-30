package dev.teamflow.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

/** 通过 Java 8 可用的 RestTemplate 调用外部项目目录。 */
@Component
public final class PartnerProjectClient {
  private final RestTemplate restTemplate;

  /** 创建共享客户端并固定外部调用阶段超时。 */
  public PartnerProjectClient(
      RestTemplateBuilder builder,
      @Value("${teamflow.partner.base-url:http://127.0.0.1:18090}") String baseUrl) {
    this.restTemplate =
        builder
            .rootUri(baseUrl)
            .setConnectTimeout(java.time.Duration.ofMillis(300))
            .setReadTimeout(java.time.Duration.ofMillis(800))
            .build();
  }

  /** 查询外部项目。 */
  public PartnerProject findProject(String projectId) {
    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
      ResponseEntity<PartnerProject> response =
          restTemplate.exchange(
              "/projects/{id}", HttpMethod.GET, new HttpEntity<Void>(headers), PartnerProject.class, projectId);
      return requireBody(response.getBody());
    } catch (RestClientResponseException exception) {
      if (exception.getRawStatusCode() == 404) {
        throw new PartnerProjectNotFoundException(projectId);
      }
      throw new PartnerUnavailableException(
          "Partner project service returned " + exception.getRawStatusCode(), exception);
    } catch (RestClientException exception) {
      throw new PartnerUnavailableException("Partner project service is unavailable", exception);
    }
  }

  /** 创建外部项目；该非幂等 POST 不自动重试。 */
  public PartnerProject createProject(String name) {
    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
      ResponseEntity<PartnerProject> response =
          restTemplate.exchange(
              "/projects",
              HttpMethod.POST,
              new HttpEntity<CreateProjectRequest>(new CreateProjectRequest(name), headers),
              PartnerProject.class);
      return requireBody(response.getBody());
    } catch (RestClientResponseException exception) {
      throw new PartnerUnavailableException(
          "Partner project service returned " + exception.getRawStatusCode(), exception);
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
  public static final class PartnerProject {
    private String id;
    private String name;
    private String status;

    /** 返回外部项目 ID。 */
    public String getId() {
      return id;
    }

    /** 设置外部项目 ID。 */
    public void setId(String id) {
      this.id = id;
    }

    /** 返回外部项目名称。 */
    public String getName() {
      return name;
    }

    /** 设置外部项目名称。 */
    public void setName(String name) {
      this.name = name;
    }

    /** 返回外部项目状态。 */
    public String getStatus() {
      return status;
    }

    /** 设置外部项目状态。 */
    public void setStatus(String status) {
      this.status = status;
    }
  }

  /** 创建外部项目请求。 */
  private static final class CreateProjectRequest {
    private final String name;

    /** 创建最小请求载荷。 */
    private CreateProjectRequest(String name) {
      this.name = name;
    }

    /** 返回外部项目名称。 */
    public String getName() {
      return name;
    }
  }

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
