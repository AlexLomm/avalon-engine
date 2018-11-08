const roleIds = require('./roles.config').roleIds;
const Player  = require('./player');
const Role    = require('./role');
const Vote    = require('./vote');

test('should return if is leader', () => {
  const player = new Player('user-1');

  expect(player.getIsLeader()).toBeFalsy();
});

test('should mark as leader', () => {
  const player = new Player('user-1');

  player.markAsLeader();

  expect(player.getIsLeader()).toBeTruthy();
});

test('should unmark as leader', () => {
  const player = new Player('user-1');

  player.markAsLeader();
  player.unmarkAsLeader();

  expect(player.getIsLeader()).toBeFalsy();
});

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

test('should return whether is proposed or not', () => {
  const player = new Player('some-user');

  expect(player.getIsProposed()).toBeFalsy();

  player.toggleIsProposed();

  expect(player.getIsProposed()).toBeTruthy();
});

test('should toggle choosing', () => {
  const player = new Player('some-user');

  player.toggleIsProposed();
  player.toggleIsProposed();

  expect(player.getIsProposed()).toBeFalsy();
});

test('should say if can see another player', () => {
  const player1 = new Player('user-1');
  player1.setRole(new Role(roleIds.MERLIN));

  const player2 = new Player('user-2');
  player2.setRole(new Role(roleIds.MINION_1));

  expect(player1.canSee(player2)).toBeTruthy();
  expect(player2.canSee(player1)).toBeFalsy();
});

test('should assign a vote', () => {
  const player = new Player('user-1');

  expect(player.getVote()).toBeFalsy();

  player.setVote(new Vote('user-1', true));

  expect(player.getVote()).toBeTruthy();
});

test('should reset player', () => {
  const player = new Player('user-1');

  player.toggleIsProposed();
  player.setVote(new Vote('user-1', true));

  player.reset();

  expect(player.getVote()).toBeFalsy();
  expect(player.getIsProposed()).toBeFalsy();
});

test('should test proposition to false', () => {
  const player = new Player('user-1');

  player.toggleIsProposed();
  player.setIsProposed(false);

  expect(player.getIsProposed()).toBeFalsy();
});

test('should be assassinated', () => {
  const player = new Player('user-1');

  expect(player.getIsAssassinated()).toBeFalsy();

  player.markAsAssassinated();

  expect(player.getIsAssassinated()).toBeTruthy();
});
