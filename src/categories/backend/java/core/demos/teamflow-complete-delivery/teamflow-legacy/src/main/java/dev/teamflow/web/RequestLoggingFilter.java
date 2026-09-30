package dev.teamflow.web;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** 以低基数字段记录请求结果，不记录请求头或请求体中的敏感值。 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
  private static final String CORRELATION_HEADER = "X-Correlation-Id";
  private static final Pattern ACCEPTED_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

  /** 为每个请求记录关联 ID、路径、状态和失败原因。 */
  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String correlationId = resolveCorrelationId(request.getHeader(CORRELATION_HEADER));
    response.setHeader(CORRELATION_HEADER, correlationId);
    MDC.put("correlationId", correlationId);
    try {
      filterChain.doFilter(request, response);
    } finally {
      int status = response.getStatus();
      String failureReason = status >= 400 ? "HTTP_" + status : "none";
      log.info(
          "http_request traceId={} path={} status={} failureReason={}",
          correlationId,
          request.getRequestURI(),
          status,
          failureReason);
      MDC.remove("correlationId");
    }
  }

  /** 返回可信关联标识，外部值不合格时生成新值。 */
  private String resolveCorrelationId(String candidate) {
    if (candidate != null && ACCEPTED_ID.matcher(candidate).matches()) {
      return candidate;
    }
    return UUID.randomUUID().toString();
  }
}
