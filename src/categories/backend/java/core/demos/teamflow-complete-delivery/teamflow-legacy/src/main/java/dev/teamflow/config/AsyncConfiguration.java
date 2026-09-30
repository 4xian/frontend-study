package dev.teamflow.config;

import java.util.concurrent.Executor;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** 配置 TeamFlow 异步任务的线程边界、上下文传播和关闭行为。 */
@Configuration
@EnableAsync
public class AsyncConfiguration {
  /** 返回带请求关联 ID 传播和有限关闭等待的具名执行器。 */
  @Bean(name = "teamflowTaskExecutor")
  public Executor teamflowTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(4);
    executor.setQueueCapacity(20);
    executor.setThreadNamePrefix("teamflow-async-");
    executor.setTaskDecorator(new MdcTaskDecorator());
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(15);
    executor.initialize();
    return executor;
  }

  /** 在工作线程执行期间复制并最终清理请求关联上下文。 */
  private static final class MdcTaskDecorator implements TaskDecorator {
    @Override
    public Runnable decorate(Runnable runnable) {
      final java.util.Map<String, String> captured = MDC.getCopyOfContextMap();
      return new Runnable() {
        @Override
        public void run() {
          if (captured == null) {
            MDC.clear();
          } else {
            MDC.setContextMap(captured);
          }
          try {
            runnable.run();
          } finally {
            MDC.clear();
          }
        }
      };
    }
  }
}
