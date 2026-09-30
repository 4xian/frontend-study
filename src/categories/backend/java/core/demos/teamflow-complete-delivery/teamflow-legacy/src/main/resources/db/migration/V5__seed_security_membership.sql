INSERT INTO team_member (id, team_id, user_id, role)
VALUES ('MBR-2', 'TEAM-EMPTY', 'USR-1', 'Owner');

UPDATE directory_sequence
SET next_value = 3
WHERE resource_type = 'MEMBER' AND next_value < 3;
