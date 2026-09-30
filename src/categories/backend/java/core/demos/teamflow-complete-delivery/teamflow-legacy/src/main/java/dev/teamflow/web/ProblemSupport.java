package dev.teamflow.web;

import dev.teamflow.application.TeamFlowBadRequestException;
import dev.teamflow.application.TeamFlowAccessDeniedException;
import dev.teamflow.application.TeamFlowConflictException;
import dev.teamflow.application.TeamFlowNotFoundException;
import dev.teamflow.cache.TeamFlowCacheStateException;
import dev.teamflow.integration.PartnerProjectClient.PartnerProjectNotFoundException;
import dev.teamflow.integration.PartnerProjectClient.PartnerUnavailableException;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.amqp.AmqpException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.validation.FieldError;
import org.slf4j.MDC;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/** 将业务与依赖异常转换为 TeamFlow 的 Problem Details 响应。 */
@RestControllerAdvice
public class ProblemSupport {
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  /**
   * 返回请求参数不符合既有 API 合同的响应。
   *
   * @param exception 请求校验异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(TeamFlowBadRequestException.class)
  public ResponseEntity<Map<String, Object>> handleBadRequest(
      TeamFlowBadRequestException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        exception.getMessage(),
        exception.getCode(),
        request.getRequestURI());
  }

  /**
   * 返回认证失败响应。
   *
   * @param exception 认证异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(TeamFlowUnauthorizedException.class)
  public ResponseEntity<Map<String, Object>> handleUnauthorized(
      TeamFlowUnauthorizedException exception, HttpServletRequest request) {
    return response(401, "Unauthorized", exception.getMessage(), "AUTH_REQUIRED", request.getRequestURI());
  }

  /**
   * 返回已认证主体的资源归属拒绝响应。
   *
   * @param exception 资源访问拒绝异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(TeamFlowAccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(
      TeamFlowAccessDeniedException exception, HttpServletRequest request) {
    return response(403, "Forbidden", exception.getMessage(), "ACCESS_DENIED", request.getRequestURI());
  }

  /**
   * 返回资源不存在响应。
   *
   * @param exception 资源不存在异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(TeamFlowNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleNotFound(
      TeamFlowNotFoundException exception, HttpServletRequest request) {
    return response(404, "Not Found", exception.getMessage(), "RESOURCE_NOT_FOUND", request.getRequestURI());
  }

  /** 返回外部项目不存在响应。 */
  @ExceptionHandler(PartnerProjectNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handlePartnerNotFound(
      PartnerProjectNotFoundException exception, HttpServletRequest request) {
    return response(404, "Not Found", exception.getMessage(), "RESOURCE_NOT_FOUND", request.getRequestURI());
  }

  /** 返回外部项目服务不可用响应。 */
  @ExceptionHandler(PartnerUnavailableException.class)
  public ResponseEntity<Map<String, Object>> handlePartnerUnavailable(
      PartnerUnavailableException exception, HttpServletRequest request) {
    return response(
        503,
        "Service Unavailable",
        "Partner project service is temporarily unavailable",
        "PARTNER_UNAVAILABLE",
        request.getRequestURI());
  }

  /**
   * 返回状态冲突响应。
   *
   * @param exception 状态冲突异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(TeamFlowConflictException.class)
  public ResponseEntity<Map<String, Object>> handleConflict(
      TeamFlowConflictException exception, HttpServletRequest request) {
    ResponseEntity<Map<String, Object>> result =
        response(409, "Conflict", exception.getMessage(), exception.getCode(), request.getRequestURI());
    if (!exception.isReplayed()) {
      return result;
    }
    return ResponseEntity.status(result.getStatusCode())
        .header("Idempotency-Replayed", "true")
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(result.getBody());
  }

  /**
   * 返回基础设施不可用响应。
   *
   * @param exception 依赖访问异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler({
    CannotGetJdbcConnectionException.class,
    DataAccessException.class,
    RedisConnectionFailureException.class,
    RedisSystemException.class,
    DataAccessResourceFailureException.class,
    AmqpException.class,
  })
  public ResponseEntity<Map<String, Object>> handleDependency(
      RuntimeException exception, HttpServletRequest request) {
    return response(
        503,
        "Service Unavailable",
        "TeamFlow dependency is temporarily unavailable",
        "DEPENDENCY_UNAVAILABLE",
        request.getRequestURI());
  }

  /** 将损坏的 Redis 受控状态转换为稳定服务端错误。 */
  @ExceptionHandler(TeamFlowCacheStateException.class)
  public ResponseEntity<Map<String, Object>> handleCacheState(
      TeamFlowCacheStateException exception, HttpServletRequest request) {
    return response(
        500,
        "Internal Server Error",
        "TeamFlow cache state does not match the current schema",
        "CACHE_STATE_INVALID",
        request.getRequestURI());
  }

  /**
   * 返回无法解析 JSON 请求体的稳定错误。
   *
   * @param exception 请求体解析异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> handleUnreadableBody(
      HttpMessageNotReadableException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "Request body must be valid JSON",
        "INVALID_REQUEST_BODY",
        request.getRequestURI());
  }

  /**
   * 返回容器入口拒绝超限文件的稳定错误。
   *
   * @param exception 上传大小异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<Map<String, Object>> handleMaxUpload(
      MaxUploadSizeExceededException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "file must be at most 5 MiB",
        "FILE_TOO_LARGE",
        request.getRequestURI());
  }

  /**
   * 返回缺少文件 part 的稳定错误。
   *
   * @param exception multipart part 缺失异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MissingServletRequestPartException.class)
  public ResponseEntity<Map<String, Object>> handleMissingPart(
      MissingServletRequestPartException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "Request must contain a file part",
        "FILE_PART_MISSING",
        request.getRequestURI());
  }

  /**
   * 返回无法解析 multipart 请求的稳定错误。
   *
   * @param exception multipart 解析异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MultipartException.class)
  public ResponseEntity<Map<String, Object>> handleMultipart(
      MultipartException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "multipart request cannot be parsed",
        "MULTIPART_INVALID",
        request.getRequestURI());
  }

  /**
   * 返回缺少请求头的稳定错误。
   *
   * @param exception 请求头异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MissingRequestHeaderException.class)
  public ResponseEntity<Map<String, Object>> handleMissingHeader(
      MissingRequestHeaderException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "Required request header is missing",
        "MISSING_REQUEST_HEADER",
        request.getRequestURI());
  }

  /**
   * 返回媒体类型不受支持的稳定错误。
   *
   * @param exception 媒体类型异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  public ResponseEntity<Map<String, Object>> handleUnsupportedMediaType(
      HttpMediaTypeNotSupportedException exception, HttpServletRequest request) {
    return response(
        415,
        "Unsupported Media Type",
        "Content-Type must be application/json",
        "UNSUPPORTED_MEDIA_TYPE",
        request.getRequestURI());
  }

  /**
   * 返回缺少查询参数的稳定错误。
   *
   * @param exception 查询参数异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MissingServletRequestParameterException.class)
  public ResponseEntity<Map<String, Object>> handleMissingParameter(
      MissingServletRequestParameterException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "Required request parameter is missing",
        "MISSING_REQUEST_PARAMETER",
        request.getRequestURI());
  }

  /**
   * 返回参数类型不正确的稳定错误。
   *
   * @param exception 参数类型异常
   * @param request 当前请求
   * @return Problem Details 响应
   */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<Map<String, Object>> handleTypeMismatch(
      MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
    return response(
        400,
        "Bad Request",
        "Request parameter has an invalid type",
        "INVALID_REQUEST_PARAMETER",
        request.getRequestURI());
  }

  /** 将请求体 Bean Validation 失败转换成稳定字段错误。 */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(
      MethodArgumentNotValidException exception, HttpServletRequest request) {
    java.util.List<Map<String, String>> errors = new java.util.ArrayList<Map<String, String>>();
    for (FieldError error : exception.getBindingResult().getFieldErrors()) {
      Map<String, String> field = new LinkedHashMap<String, String>();
      field.put("field", error.getField());
      field.put("code", error.getCode() == null ? "INVALID" : error.getCode().toUpperCase());
      field.put("message", error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage());
      errors.add(field);
    }
    errors.sort(java.util.Comparator.comparing(item -> item.get("field")));
    return response(
        400,
        "Bad Request",
        "Request fields do not satisfy validation constraints",
        "REQUEST_VALIDATION_FAILED",
        request.getRequestURI(),
        errors);
  }

  /**
   * 由安全过滤链直接写出认证或授权错误。
   *
   * @param response 当前响应
   * @param status HTTP 状态
   * @param title 错误标题
   * @param code 稳定错误码
   * @param instance 请求路径
   * @throws IOException 响应写入失败
   */
  public static void write(
      HttpServletResponse response, int status, String title, String code, String instance)
      throws IOException {
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
    response.setCharacterEncoding("UTF-8");
    try {
      response
          .getWriter()
          .write(
              OBJECT_MAPPER.writeValueAsString(
                  problem(status, title, "Request rejected by TeamFlow security", code, instance)));
    } catch (JsonProcessingException exception) {
      throw new IOException("TeamFlow problem response cannot be encoded", exception);
    }
  }

  /** 创建标准 Problem Details 响应。 */
  private static ResponseEntity<Map<String, Object>> response(
      int status, String title, String detail, String code, String instance) {
    return response(status, title, detail, code, instance, java.util.Collections.emptyList());
  }

  /** 创建带字段错误的 Problem Details 响应。 */
  private static ResponseEntity<Map<String, Object>> response(
      int status,
      String title,
      String detail,
      String code,
      String instance,
      java.util.List<?> errors) {
    Map<String, Object> body = problem(status, title, detail, code, instance);
    body.put("errors", errors);
    return ResponseEntity.status(status)
        .contentType(MediaType.APPLICATION_PROBLEM_JSON)
        .body(body);
  }

  /** 创建统一的 Problem Details 字段。 */
  private static Map<String, Object> problem(
      int status, String title, String detail, String code, String instance) {
    Map<String, Object> body = new LinkedHashMap<String, Object>();
    body.put("type", "about:blank");
    body.put("title", title);
    body.put("status", status);
    body.put("detail", detail);
    body.put("instance", instance);
    body.put("code", code);
    String traceId = MDC.get("correlationId");
    body.put("traceId", traceId == null ? UUID.randomUUID().toString() : traceId);
    body.put("errors", java.util.Collections.emptyList());
    return body;
  }
}
