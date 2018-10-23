const Player = require('./player');
const Role   = require('./role');

test('should return a username', () => {
  const player = new Player('some-user');

  expect(player.getUsername()).toEqual('some-user');
});

test('should return a role', () => {
  const player = new Player('some-user');

  expect(player.getRole()).toBeFalsy();

  const role = new Role();
  player.setRole(role);

  expect(player.getRole()).toEqual(role);
});
