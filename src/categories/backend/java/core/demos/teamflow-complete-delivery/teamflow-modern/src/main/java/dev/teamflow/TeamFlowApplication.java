package dev.teamflow;

import dev.teamflow.persistence.TeamFlowMapper;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

/** TeamFlow 现代交付快照入口。 */
@EnableRabbit
@EnableScheduling
@MapperScan(basePackageClasses = TeamFlowMapper.class)
@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "TeamFlow API", version = "1.0.0"))
public class TeamFlowApplication {

  /**
   * 启动 TeamFlow 服务。
   *
   * @param args 启动参数
   */
  public static void main(String[] args) {
    SpringApplication.run(TeamFlowApplication.class, args);
  }
}
