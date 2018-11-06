const errors  = require('./errors');
const roleIds = require('./roles.config').roleIds;
const Role    = require('./role');

test('should throw an error if the specified id is incorrect', () => {
  expect(() => {
    new Role('nonexistent-id');
  }).toThrow(errors.INCORRECT_ROLE_ID);
});

test('should get id', () => {
  const role = new Role(roleIds.MERLIN);

  expect(role.getId()).toBeTruthy();
});

test('should get name', () => {
  const role = new Role(roleIds.MERLIN);

  expect(role.getName()).toBeTruthy();
});

test('should get description', () => {
  const role = new Role(roleIds.MERLIN);

  expect(role.getDescription()).toBeTruthy();
});

test('should get loyalty', () => {
  const role = new Role(roleIds.MERLIN);

  expect(role.getLoyalty()).toBeTruthy();
});

test('should get a list of visible role ids', () => {
  const role = new Role(roleIds.MERLIN);

  expect(role.getVisibleRoleIds().length).toBeTruthy();
});

test('should say if can see another role', () => {
  const role1 = new Role(roleIds.MINION_2);
  const role2 = new Role(roleIds.MINION_3);

  expect(role1.canSee(role2)).toBeTruthy();
  expect(role2.canSee(role1)).toBeTruthy();
});
