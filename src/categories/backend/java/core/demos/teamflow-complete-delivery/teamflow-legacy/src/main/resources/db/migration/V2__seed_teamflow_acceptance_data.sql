INSERT INTO directory_sequence (resource_type, next_value) VALUES
  ('USER', 3),
  ('TEAM', 2),
  ('MEMBER', 2),
  ('PROJECT', 3);

INSERT INTO teamflow_user (id, display_name, email) VALUES
  ('USR-1', '周宁', 'zhou@example.com'),
  ('USR-2', '林澄', 'lin@example.com');

INSERT INTO team (id, name) VALUES
  ('TEAM-1', '课程平台组'),
  ('TEAM-EMPTY', '空团队');

INSERT INTO team_member (id, team_id, user_id, role) VALUES
  ('MBR-1', 'TEAM-1', 'USR-1', 'Designer');

INSERT INTO project (id, team_id, name) VALUES
  ('PRJ-1', 'TEAM-1', 'TeamFlow delivery'),
  ('PRJ-2', 'TEAM-1', 'TeamFlow operations');
