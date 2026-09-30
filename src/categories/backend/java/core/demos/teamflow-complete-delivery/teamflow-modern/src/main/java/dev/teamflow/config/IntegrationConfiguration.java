package dev.teamflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/** 提供现代线外部 HTTP 客户端的共享构建器。 */
@Configuration
public class IntegrationConfiguration {
  /** 返回可复用的 RestClient 构建器。 */
  @Bean
  public RestClient.Builder restClientBuilder() {
    return RestClient.builder();
  }
}
