const errors = require('./errors');
const Role   = require('./role');

test('should throw an error if the specified id is incorrect', () => {
  expect(() => {
    new Role('nonexistent-id');
  }).toThrow(errors.INCORRECT_ROLE_ID);
});

test('should get id', () => {
  const role = new Role('MERLIN');

  expect(role.getId()).toBeTruthy();
});

test('should get name', () => {
  const role = new Role('MERLIN');

  expect(role.getName()).toBeTruthy();
});

test('should get description', () => {
  const role = new Role('MERLIN');

  expect(role.getDescription()).toBeTruthy();
});

test('should get loyalty', () => {
  const role = new Role('MERLIN');

  expect(role.getLoyalty()).toBeTruthy();
});
