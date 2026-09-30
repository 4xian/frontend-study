package dev.teamflow.web;

import dev.teamflow.application.TeamDirectoryService;
import dev.teamflow.application.TeamDirectoryService.PageResult;
import dev.teamflow.application.TeamDirectoryService.UserResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.validation.Valid;

/** 暴露 TeamFlow 用户集合。 */
@Validated
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "用户资源")
public class UserController {
  private final TeamDirectoryService service;

  /** 注入用户与团队目录服务。 */
  public UserController(TeamDirectoryService service) {
    this.service = service;
  }

  /** 查询用户分页。 */
  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询用户")
  public TeamFlowWebDto.PageResponse<TeamFlowWebDto.UserResponse> list(
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String pageToken) {
    PageResult<UserResult> page =
        service.listUsers(pageSize, PaginationSupport.offset(pageSize, pageToken, "USR-PAGE-"));
    return new TeamFlowWebDto.PageResponse<>(
        page.items().stream().map(UserController::response).toList(),
        PaginationSupport.nextToken("USR-PAGE-", page.nextOffset()));
  }

  /** 查询一个用户。 */
  @GetMapping(path = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询单个用户")
  public TeamFlowWebDto.UserResponse find(@PathVariable String userId) {
    return response(service.findUser(userId));
  }

  /** 创建用户并返回新资源地址。 */
  @PostMapping(
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "创建用户")
  @ApiResponse(responseCode = "201", description = "用户已创建")
  public ResponseEntity<TeamFlowWebDto.UserResponse> create(
      @Valid @RequestBody TeamFlowWebDto.CreateUserRequest request) {
    TeamFlowWebDto.UserResponse user =
        response(service.createUser(request.displayName(), request.email()));
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{userId}")
            .buildAndExpand(user.id())
            .toUri();
    return ResponseEntity.created(location).body(user);
  }

  /** 把应用结果映射为公开用户 DTO。 */
  private static TeamFlowWebDto.UserResponse response(UserResult user) {
    return new TeamFlowWebDto.UserResponse(user.id(), user.displayName(), user.email());
  }
}
