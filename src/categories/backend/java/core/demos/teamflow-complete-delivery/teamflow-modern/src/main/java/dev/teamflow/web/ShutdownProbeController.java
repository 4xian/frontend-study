package dev.teamflow.web;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 提供交付门禁使用的在途请求观测入口。 */
@RestController
public class ShutdownProbeController {
  private final AtomicInteger acceptedSlowRequests = new AtomicInteger();
  private final ApplicationAvailability availability;

  /** 注入应用可用性状态，用于在停机拒绝新的探针请求。 */
  public ShutdownProbeController(ApplicationAvailability availability) {
    this.availability = availability;
  }

  /** 等待五秒后返回累计接收数，用于验证优雅停机。 */
  @GetMapping("/slow")
  public ResponseEntity<String> slow() throws InterruptedException {
    if (availability.getReadinessState() == ReadinessState.REFUSING_TRAFFIC) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("slow-rejected");
    }
    acceptedSlowRequests.incrementAndGet();
    Thread.sleep(5000L);
    return ResponseEntity.ok("slow-finished; accepted=" + acceptedSlowRequests.get());
  }
}
