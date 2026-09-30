package dev.teamflow.web;

import dev.teamflow.application.ResourceAccessService;
import dev.teamflow.cache.VerificationCodeService;
import dev.teamflow.cache.VerificationCodeService.VerificationResult;
import dev.teamflow.security.TeamFlowActor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 提供邮箱变更验证码的签发与验证入口。 */
@RestController
@RequestMapping("/api/v1/users/{userId}/email-change-verification-code")
public class VerificationCodeController {
  private final VerificationCodeService service;
  private final ResourceAccessService resourceAccessService;

  /**
   * 保存验证码与资源归属服务。
   *
   * @param service 验证码服务
   * @param resourceAccessService 资源归属服务
   */
  public VerificationCodeController(
      VerificationCodeService service, ResourceAccessService resourceAccessService) {
    this.service = service;
    this.resourceAccessService = resourceAccessService;
  }

  /**
   * 为当前主体可操作的用户签发新码。
   *
   * @param userId 目标用户 ID
   * @param authentication 当前身份
   * @return 无正文受理响应
   */
  @PostMapping
  public ResponseEntity<Void> issue(
      @PathVariable String userId, Authentication authentication) {
    requireUserAccess(authentication, userId);
    service.issue(userId);
    return ResponseEntity.accepted().build();
  }

  /**
   * 验证当前主体可操作用户提交的 code。
   *
   * @param userId 目标用户 ID
   * @param request 验证请求
   * @param authentication 当前身份
   * @return 公开验证结果
   */
  @PostMapping(value = "/verification", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<VerificationCodeResponse> verify(
      @PathVariable String userId,
      @RequestBody VerificationCodeRequest request,
      Authentication authentication) {
    requireUserAccess(authentication, userId);
    return ResponseEntity.ok(new VerificationCodeResponse(service.verify(userId, request.code)));
  }

  /** 验证当前主体可以操作指定用户的验证码。 */
  private void requireUserAccess(Authentication authentication, String userId) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    resourceAccessService.requireUserAccess(actor.userId(), actor.administrator(), userId);
  }

  /** 验证请求体。 */
  public static class VerificationCodeRequest {
    public String code;
  }

  /** 验证结果响应。 */
  public static class VerificationCodeResponse {
    public final VerificationResult result;

    /** 保存公开验证码结果。 */
    public VerificationCodeResponse(VerificationResult result) {
      this.result = result;
    }
  }
}
