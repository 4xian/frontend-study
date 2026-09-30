package dev.teamflow.cache;

import org.springframework.stereotype.Component;

/** 发送验证码的本地安全适配器，不把验证码写入 HTTP 或日志。 */
@Component
public class VerificationCodeSender {
  /** 接受发送请求；真实邮件适配器可在此边界替换。 */
  public void send(String userId, String code) {
    // 本地交付演示不连接外部邮件系统，也不记录验证码。
  }
}

