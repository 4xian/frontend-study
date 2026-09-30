package dev.teamflow.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/** C3 用户、团队和成员接口使用的请求与响应 DTO。 */
public final class TeamFlowWebDto {
  private TeamFlowWebDto() {}

  /** 创建用户请求。 */
  public static final class CreateUserRequest {
    @NotBlank(message = "displayName must not be blank")
    @Size(max = 40, message = "displayName must be at most 40 characters")
    public String displayName;

    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be valid")
    @Size(max = 120, message = "email must be at most 120 characters")
    public String email;
  }

  /** 创建团队请求。 */
  public static final class CreateTeamRequest {
    @NotBlank(message = "name must not be blank")
    @Size(max = 60, message = "name must be at most 60 characters")
    public String name;
  }

  /** 添加团队成员请求。 */
  public static final class AddMemberRequest {
    @NotBlank(message = "userId must not be blank")
    @Pattern(regexp = "USR-[1-9][0-9]*", message = "userId must use USR-<number>")
    public String userId;

    @NotBlank(message = "role must not be blank")
    @Size(max = 30, message = "role must be at most 30 characters")
    public String role;
  }

  /** 用户公开响应。 */
  public static final class UserResponse {
    public final String id;
    public final String displayName;
    public final String email;

    public UserResponse(String id, String displayName, String email) {
      this.id = id;
      this.displayName = displayName;
      this.email = email;
    }
  }

  /** 团队公开响应。 */
  public static final class TeamResponse {
    public final String id;
    public final String name;

    public TeamResponse(String id, String name) {
      this.id = id;
      this.name = name;
    }
  }

  /** 成员公开响应。 */
  public static final class MemberResponse {
    public final String id;
    public final String userId;
    public final String displayName;
    public final String role;

    public MemberResponse(String id, String userId, String displayName, String role) {
      this.id = id;
      this.userId = userId;
      this.displayName = displayName;
      this.role = role;
    }
  }

  /** 稳定的分页响应。 */
  public static final class PageResponse<T> {
    private final List<T> items;
    private final String nextPageToken;

    public PageResponse(List<T> items, String nextPageToken) {
      this.items = Collections.unmodifiableList(new ArrayList<T>(items));
      this.nextPageToken = nextPageToken;
    }

    public List<T> getItems() {
      return items;
    }

    public String getNextPageToken() {
      return nextPageToken;
    }
  }
}
