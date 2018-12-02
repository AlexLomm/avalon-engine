import { Role } from '../../src/role';
import { rolesConfig } from '../../src/configs/roles.config';
import { RoleId } from '../../src/enums/role-id';

test('should get id', () => {
  const role = new Role(RoleId.Merlin);

  expect(role.getId()).toBeTruthy();
});

test('should get name', () => {
  const role = new Role(RoleId.Merlin);

  expect(role.getName()).toBeTruthy();
});

test('should get description', () => {
  const role = new Role(RoleId.Merlin);

  expect(role.getDescription()).toBeTruthy();
});

test('should get loyalty', () => {
  const role = new Role(RoleId.Merlin);

  expect(role.getLoyalty()).toBeTruthy();
});

test('should get a list of visible role ids', () => {
  const role = new Role(RoleId.Merlin);

  expect(role.getVisibleRoleIds().length).toBeTruthy();
});

test('should say if can see another role', () => {
  const role1 = new Role(RoleId.Minion_2);
  const role2 = new Role(RoleId.Minion_3);

  expect(role1.canSee(role2)).toBeTruthy();
  expect(role2.canSee(role1)).toBeTruthy();
});

test('should see itself', () => {
  const role = new Role(RoleId.Oberon);

  expect(role.canSee(role)).toBeTruthy();
});

test('should return a serialized role', () => {
  const role = new Role(RoleId.Merlin);

  const expected = {
    id: RoleId.Merlin,
    name: rolesConfig[RoleId.Merlin].name,
    description: rolesConfig[RoleId.Merlin].description,
    loyalty: rolesConfig[RoleId.Merlin].loyalty,
  };

  const actual = role.serialize();

  expect(expected).toEqual(actual);
});
