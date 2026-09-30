package dev.teamflow.application;

import dev.teamflow.persistence.TeamFlowMapper;
import org.springframework.stereotype.Service;

/** 根据 MySQL 成员关系验证用户、团队和项目资源边界。 */
@Service
public class ResourceAccessService {
  private final TeamFlowMapper mapper;

  /**
   * 注入资源归属查询入口。
   *
   * @param mapper TeamFlow Mapper
   */
  public ResourceAccessService(TeamFlowMapper mapper) {
    this.mapper = mapper;
  }

  /**
   * 验证当前主体只能操作自己的用户资源，管理员可以代管。
   *
   * @param actorUserId 当前主体的用户 ID
   * @param administrator 当前主体是否为管理员
   * @param userId 目标用户 ID
   */
  public void requireUserAccess(String actorUserId, boolean administrator, String userId) {
    if (mapper.findUser(userId) == null) {
      throw new TeamFlowNotFoundException("User not found: " + userId);
    }
    if (!administrator && !actorUserId.equals(userId)) {
      throw new TeamFlowAccessDeniedException("User resource is outside the current actor scope");
    }
  }

  /**
   * 验证当前主体是目标团队成员，管理员可以代管。
   *
   * @param actorUserId 当前主体的用户 ID
   * @param administrator 当前主体是否为管理员
   * @param teamId 目标团队 ID
   */
  public void requireTeamAccess(String actorUserId, boolean administrator, String teamId) {
    if (mapper.findTeam(teamId) == null) {
      throw new TeamFlowNotFoundException("Team not found: " + teamId);
    }
    if (!administrator && mapper.countTeamAccess(teamId, actorUserId) == 0L) {
      throw new TeamFlowAccessDeniedException("Team resource is outside the current actor scope");
    }
  }

  /**
   * 验证当前主体属于项目所在团队，管理员可以跨团队代管。
   *
   * @param actorUserId 当前主体的用户 ID
   * @param administrator 当前主体是否为管理员
   * @param projectId 目标项目 ID
   */
  public void requireProjectAccess(String actorUserId, boolean administrator, String projectId) {
    if (mapper.countProject(projectId) == 0L) {
      throw new TeamFlowNotFoundException("Project not found: " + projectId);
    }
    if (!administrator && mapper.countProjectAccess(projectId, actorUserId) == 0L) {
      throw new TeamFlowAccessDeniedException("Project resource is outside the current actor scope");
    }
  }
}
