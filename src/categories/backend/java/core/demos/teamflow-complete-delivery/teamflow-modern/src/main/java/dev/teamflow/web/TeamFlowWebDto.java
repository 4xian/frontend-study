package dev.teamflow.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/** C3 用户、团队和成员接口使用的请求与响应 DTO。 */
public final class TeamFlowWebDto {
  private TeamFlowWebDto() {}

  /** 创建用户请求。 */
  public record CreateUserRequest(
      @NotBlank(message = "displayName must not be blank")
          @Size(max = 40, message = "displayName must be at most 40 characters")
          String displayName,
      @NotBlank(message = "email must not be blank")
          @Email(message = "email must be valid")
          @Size(max = 120, message = "email must be at most 120 characters")
          String email) {}

  /** 创建团队请求。 */
  public record CreateTeamRequest(
      @NotBlank(message = "name must not be blank")
          @Size(max = 60, message = "name must be at most 60 characters")
          String name) {}

  /** 添加团队成员请求。 */
  public record AddMemberRequest(
      @NotBlank(message = "userId must not be blank")
          @Pattern(regexp = "USR-[1-9][0-9]*", message = "userId must use USR-<number>")
          String userId,
      @NotBlank(message = "role must not be blank")
          @Size(max = 30, message = "role must be at most 30 characters")
          String role) {}

  /** 用户公开响应。 */
  public record UserResponse(String id, String displayName, String email) {}

  /** 团队公开响应。 */
  public record TeamResponse(String id, String name) {}

  /** 成员公开响应。 */
  public record MemberResponse(String id, String userId, String displayName, String role) {}

  /** 稳定的分页响应。 */
  public record PageResponse<T>(List<T> items, String nextPageToken) {
    public PageResponse {
      items = List.copyOf(items);
    }
  }
}
