package dev.teamflow.web;

import dev.teamflow.application.TeamDirectoryService;
import dev.teamflow.application.TeamDirectoryService.MemberResult;
import dev.teamflow.application.TeamDirectoryService.PageResult;
import dev.teamflow.application.TeamDirectoryService.TeamResult;
import dev.teamflow.application.ResourceAccessService;
import dev.teamflow.security.TeamFlowActor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** 暴露 TeamFlow 团队和成员关系。 */
@RestController
@RequestMapping("/api/v1/teams")
@Tag(name = "Teams", description = "团队与成员资源")
public class TeamController {
  private final TeamDirectoryService service;
  private final ResourceAccessService resourceAccessService;

  /**
   * 注入用户、团队目录与资源归属服务。
   *
   * @param service 团队目录服务
   * @param resourceAccessService 资源归属服务
   */
  public TeamController(
      TeamDirectoryService service, ResourceAccessService resourceAccessService) {
    this.service = service;
    this.resourceAccessService = resourceAccessService;
  }

  /** 查询团队分页。 */
  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询团队")
  public TeamFlowWebDto.PageResponse<TeamFlowWebDto.TeamResponse> list(
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String pageToken) {
    PageResult<TeamResult> page =
        service.listTeams(pageSize, PaginationSupport.offset(pageSize, pageToken, "TEAM-PAGE-"));
    return new TeamFlowWebDto.PageResponse<>(
        page.items().stream().map(TeamController::response).toList(),
        PaginationSupport.nextToken("TEAM-PAGE-", page.nextOffset()));
  }

  /**
   * 查询当前主体可访问的团队。
   *
   * @param teamId 团队 ID
   * @param authentication 当前身份
   * @return 团队公开响应
   */
  @GetMapping(path = "/{teamId}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询单个团队")
  public TeamFlowWebDto.TeamResponse find(
      @PathVariable String teamId, Authentication authentication) {
    requireTeamAccess(authentication, teamId);
    return response(service.findTeam(teamId));
  }

  /**
   * 创建团队并把当前主体登记为 Owner。
   *
   * @param request 创建团队请求
   * @param authentication 当前身份
   * @return 已创建团队及其 Location
   */
  @PostMapping(
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "创建团队")
  @ApiResponse(responseCode = "201", description = "团队已创建")
  public ResponseEntity<TeamFlowWebDto.TeamResponse> create(
      @Valid @RequestBody TeamFlowWebDto.CreateTeamRequest request,
      Authentication authentication) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    TeamFlowWebDto.TeamResponse team =
        response(service.createTeam(request.name(), actor.userId()));
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{teamId}")
            .buildAndExpand(team.id())
            .toUri();
    return ResponseEntity.created(location).body(team);
  }

  /**
   * 查询当前主体可访问团队的成员分页。
   *
   * @param teamId 团队 ID
   * @param pageSize 单页数量
   * @param pageToken 不透明分页令牌
   * @param authentication 当前身份
   * @return 团队成员分页
   */
  @GetMapping(path = "/{teamId}/members", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询团队成员")
  public TeamFlowWebDto.PageResponse<TeamFlowWebDto.MemberResponse> listMembers(
      @PathVariable String teamId,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String pageToken,
      Authentication authentication) {
    requireTeamAccess(authentication, teamId);
    PageResult<MemberResult> page =
        service.listMembers(
            teamId,
            pageSize,
            PaginationSupport.offset(pageSize, pageToken, "MEMBER-PAGE-"));
    return new TeamFlowWebDto.PageResponse<>(
        page.items().stream().map(TeamController::response).toList(),
        PaginationSupport.nextToken("MEMBER-PAGE-", page.nextOffset()));
  }

  /**
   * 查询当前主体可访问团队中的成员关系。
   *
   * @param teamId 团队 ID
   * @param memberId 成员关系 ID
   * @param authentication 当前身份
   * @return 成员关系公开响应
   */
  @GetMapping(path = "/{teamId}/members/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "查询团队成员")
  public TeamFlowWebDto.MemberResponse findMember(
      @PathVariable String teamId,
      @PathVariable String memberId,
      Authentication authentication) {
    requireTeamAccess(authentication, teamId);
    return response(service.findMember(teamId, memberId));
  }

  /**
   * 将已有用户加入当前主体可访问的团队。
   *
   * @param teamId 团队 ID
   * @param request 添加成员请求
   * @param authentication 当前身份
   * @return 已创建成员关系及其 Location
   */
  @PostMapping(
      path = "/{teamId}/members",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "添加团队成员")
  @ApiResponse(responseCode = "201", description = "成员关系已创建")
  public ResponseEntity<TeamFlowWebDto.MemberResponse> addMember(
      @PathVariable String teamId,
      @Valid @RequestBody TeamFlowWebDto.AddMemberRequest request,
      Authentication authentication) {
    requireTeamAccess(authentication, teamId);
    TeamFlowWebDto.MemberResponse member =
        response(service.addMember(teamId, request.userId(), request.role()));
    URI location =
        ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{memberId}")
            .buildAndExpand(member.id())
            .toUri();
    return ResponseEntity.created(location).body(member);
  }

  /**
   * 移除当前主体可访问团队中的成员关系。
   *
   * @param teamId 团队 ID
   * @param memberId 成员关系 ID
   * @param authentication 当前身份
   * @return 无正文响应
   */
  @DeleteMapping("/{teamId}/members/{memberId}")
  @Operation(summary = "移除团队成员")
  @ApiResponse(responseCode = "204", description = "成员关系已移除")
  public ResponseEntity<Void> removeMember(
      @PathVariable String teamId,
      @PathVariable String memberId,
      Authentication authentication) {
    requireTeamAccess(authentication, teamId);
    service.removeMember(teamId, memberId);
    return ResponseEntity.noContent().build();
  }

  /** 把应用结果映射为公开团队 DTO。 */
  private static TeamFlowWebDto.TeamResponse response(TeamResult team) {
    return new TeamFlowWebDto.TeamResponse(team.id(), team.name());
  }

  /** 把应用结果映射为公开成员 DTO。 */
  private static TeamFlowWebDto.MemberResponse response(MemberResult member) {
    return new TeamFlowWebDto.MemberResponse(
        member.id(), member.userId(), member.displayName(), member.role());
  }

  /** 验证当前主体可以访问指定团队。 */
  private void requireTeamAccess(Authentication authentication, String teamId) {
    TeamFlowActor actor = TeamFlowActor.from(authentication);
    resourceAccessService.requireTeamAccess(actor.userId(), actor.administrator(), teamId);
  }
}
