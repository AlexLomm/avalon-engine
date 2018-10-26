const roleIds = require('./roles.config').roleIds;
const Player  = require('./player');
const Role    = require('./role');

test('should return a username', () => {
  const player = new Player('some-user');

  expect(player.getUsername()).toEqual('some-user');
});

test('should return a role', () => {
  const player = new Player('some-user');

  expect(player.getRole()).toBeFalsy();

  const role = new Role(roleIds.MERLIN);
  player.setRole(role);

  expect(player.getRole()).toEqual(role);
});

test('should return whether is chosen or not', () => {
  const player = new Player('some-user');

  expect(player.getIsChosen()).toBeFalsy();

  player.toggleIsChosen();

  expect(player.getIsChosen()).toBeTruthy();
});

test('should toggle choosing', () => {
  const player = new Player('some-user');

  player.toggleIsChosen();
  player.toggleIsChosen();

  expect(player.getIsChosen()).toBeFalsy();
});

test('should say if can see another player', () => {
  const player1 = new Player('user-1');
  player1.setRole(new Role(roleIds.MERLIN));

  const player2 = new Player('user-2');
  player2.setRole(new Role(roleIds.MINION_1))

  expect(player1.canSee(player2)).toBeTruthy();
  expect(player2.canSee(player1)).toBeFalsy();
});
