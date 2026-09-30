package dev.teamflow.application;

import dev.teamflow.persistence.TeamFlowMapper;
import dev.teamflow.persistence.TeamFlowRows;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 提供 C3 用户、团队和成员关系的 MySQL 业务用例。 */
@Service
public class TeamDirectoryService {
  private final TeamFlowMapper mapper;
  private final MembershipAccessCache membershipAccessCache;

  /**
   * 注入目录持久化入口和成员授权缓存端口。
   *
   * @param mapper TeamFlow Mapper
   * @param membershipAccessCache 成员授权缓存端口
   */
  public TeamDirectoryService(
      TeamFlowMapper mapper, MembershipAccessCache membershipAccessCache) {
    this.mapper = mapper;
    this.membershipAccessCache = membershipAccessCache;
  }

  /** 查询用户。 */
  public UserResult findUser(String userId) {
    TeamFlowRows.UserRow row = mapper.findUser(userId);
    if (row == null) throw new TeamFlowNotFoundException("User not found: " + userId);
    return new UserResult(row.id, row.displayName, row.email);
  }

  /** 按已解析的偏移量查询用户分页。 */
  public PageResult<UserResult> listUsers(int pageSize, int offset) {
    long count = mapper.countUsers();
    requireOffset(offset, count);
    List<UserResult> items = new ArrayList<UserResult>();
    for (TeamFlowRows.UserRow row : mapper.listUsers(pageSize, offset)) {
      items.add(new UserResult(row.id, row.displayName, row.email));
    }
    return new PageResult<UserResult>(items, nextOffset(offset, pageSize, count));
  }

  /** 创建用户并检查邮箱业务唯一性。 */
  @Transactional
  public UserResult createUser(String displayName, String email) {
    if (mapper.findUserByEmail(email) != null) {
      throw new TeamFlowConflictException("USER_CONFLICT", "Email is already registered");
    }
    String id = nextId("USER", "USR-");
    mapper.insertUser(id, displayName, email);
    return new UserResult(id, displayName, email);
  }

  /** 查询团队。 */
  public TeamResult findTeam(String teamId) {
    TeamFlowRows.TeamRow row = mapper.findTeam(teamId);
    if (row == null) throw new TeamFlowNotFoundException("Team not found: " + teamId);
    return new TeamResult(row.id, row.name);
  }

  /** 按已解析的偏移量查询团队分页。 */
  public PageResult<TeamResult> listTeams(int pageSize, int offset) {
    long count = mapper.countTeams();
    requireOffset(offset, count);
    List<TeamResult> items = new ArrayList<TeamResult>();
    for (TeamFlowRows.TeamRow row : mapper.listTeams(pageSize, offset)) {
      items.add(new TeamResult(row.id, row.name));
    }
    return new PageResult<TeamResult>(items, nextOffset(offset, pageSize, count));
  }

  /**
   * 创建团队，并把创建者登记为 Owner。
   *
   * @param name 团队名称
   * @param actorUserId 创建者用户 ID
   * @return 已创建团队
   */
  @Transactional
  public TeamResult createTeam(String name, String actorUserId) {
    findUser(actorUserId);
    String id = nextId("TEAM", "TEAM-");
    mapper.insertTeam(id, name);
    membershipAccessCache.guardChange(id);
    mapper.insertMember(nextId("MEMBER", "MBR-"), id, actorUserId, "Owner");
    return new TeamResult(id, name);
  }

  /** 按已解析的偏移量查询团队成员分页。 */
  public PageResult<MemberResult> listMembers(String teamId, int pageSize, int offset) {
    requireTeam(teamId);
    long count = mapper.countMembers(teamId);
    requireOffset(offset, count);
    List<MemberResult> items = new ArrayList<MemberResult>();
    for (TeamFlowRows.MemberRow row : mapper.listMembers(teamId, pageSize, offset)) {
      items.add(new MemberResult(row.id, row.userId, row.displayName, row.role));
    }
    return new PageResult<MemberResult>(items, nextOffset(offset, pageSize, count));
  }

  /** 查询单个团队成员关系。 */
  public MemberResult findMember(String teamId, String memberId) {
    requireTeam(teamId);
    TeamFlowRows.MemberRow row = mapper.findMember(teamId, memberId);
    if (row == null) throw new TeamFlowNotFoundException("Member not found: " + memberId);
    return new MemberResult(row.id, row.userId, row.displayName, row.role);
  }

  /** 添加成员关系，并拒绝同一团队中的重复用户。 */
  @Transactional
  public MemberResult addMember(String teamId, String userId, String role) {
    requireTeam(teamId);
    findUser(userId);
    if (mapper.findMemberByUser(teamId, userId) != null) {
      throw new TeamFlowConflictException("MEMBER_CONFLICT", "User is already a team member");
    }
    membershipAccessCache.guardChange(teamId);
    String id = nextId("MEMBER", "MBR-");
    mapper.insertMember(id, teamId, userId, role);
    TeamFlowRows.UserRow user = mapper.findUser(userId);
    return new MemberResult(id, user.id, user.displayName, role);
  }

  /** 移除成员关系，不删除全局用户。 */
  @Transactional
  public void removeMember(String teamId, String memberId) {
    requireTeam(teamId);
    if (mapper.findMember(teamId, memberId) == null) {
      throw new TeamFlowNotFoundException("Member not found: " + memberId);
    }
    membershipAccessCache.guardChange(teamId);
    if (mapper.deleteMember(teamId, memberId) == 0) {
      throw new TeamFlowNotFoundException("Member not found: " + memberId);
    }
  }

  /** 返回已存在团队。 */
  private void requireTeam(String teamId) {
    if (mapper.findTeam(teamId) == null) {
      throw new TeamFlowNotFoundException("Team not found: " + teamId);
    }
  }

  /** 拒绝超出当前集合的已解析偏移量。 */
  private void requireOffset(int offset, long itemCount) {
    if (offset < 0 || (offset > 0 && offset >= itemCount)) {
      throw new TeamFlowBadRequestException(
          "INVALID_PAGE_TOKEN", "pageToken does not belong to this resource collection");
    }
  }

  /** 仅在存在下一页时返回下一页偏移量。 */
  private Integer nextOffset(int offset, int pageSize, long itemCount) {
    long next = (long) offset + pageSize;
    return next < itemCount ? Integer.valueOf((int) next) : null;
  }

  /** 在当前事务内锁定并递增目录序列。 */
  private String nextId(String resourceType, String prefix) {
    long value = mapper.lockNextDirectoryId(resourceType);
    mapper.advanceDirectoryId(resourceType);
    return prefix + value;
  }

  /** 用户应用结果。 */
  public static final class UserResult {
    public final String id;
    public final String displayName;
    public final String email;

    /**
     * 创建用户应用结果。
     *
     * @param id 用户 ID
     * @param displayName 用户显示名
     * @param email 用户邮箱
     */
    public UserResult(String id, String displayName, String email) {
      this.id = id;
      this.displayName = displayName;
      this.email = email;
    }
  }

  /** 团队应用结果。 */
  public static final class TeamResult {
    public final String id;
    public final String name;

    /**
     * 创建团队应用结果。
     *
     * @param id 团队 ID
     * @param name 团队名称
     */
    public TeamResult(String id, String name) {
      this.id = id;
      this.name = name;
    }
  }

  /** 成员关系应用结果。 */
  public static final class MemberResult {
    public final String id;
    public final String userId;
    public final String displayName;
    public final String role;

    /**
     * 创建成员关系应用结果。
     *
     * @param id 成员关系 ID
     * @param userId 用户 ID
     * @param displayName 用户显示名
     * @param role 团队角色
     */
    public MemberResult(String id, String userId, String displayName, String role) {
      this.id = id;
      this.userId = userId;
      this.displayName = displayName;
      this.role = role;
    }
  }

  /** 已解析分页的应用结果。 */
  public static final class PageResult<T> {
    private final List<T> items;
    private final Integer nextOffset;

    /**
     * 创建不可变分页结果。
     *
     * @param items 当前页项目
     * @param nextOffset 下一页偏移量
     */
    public PageResult(List<T> items, Integer nextOffset) {
      this.items = Collections.unmodifiableList(new ArrayList<T>(items));
      this.nextOffset = nextOffset;
    }

    /**
     * 返回当前页项目。
     *
     * @return 当前页项目
     */
    public List<T> getItems() {
      return items;
    }

    /**
     * 返回下一页偏移量。
     *
     * @return 下一页偏移量；没有下一页时为 null
     */
    public Integer getNextOffset() {
      return nextOffset;
    }
  }
}
