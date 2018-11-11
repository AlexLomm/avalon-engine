const {roleIds} = require('./roles.config');
const Player    = require('./player');
const Role      = require('./role');
const Vote      = require('./vote');

test('should return a username', () => {
  const player = new Player('user-1');

  expect(player.getUsername()).toEqual('user-1');
});

test('should return a role', () => {
  const player = new Player('user-1');

  expect(player.getRole()).toBeFalsy();

  const role = new Role(roleIds.MERLIN);
  player.setRole(role);

  expect(player.getRole()).toEqual(role);
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

  player.toggleProposition();
  player.setVote(new Vote('user-1', true));

  player.reset();

  expect(player.getVote()).toBeFalsy();
  expect(player.getIsProposed()).toBeFalsy();
});

test('should be assassinated', () => {
  const player = new Player('user-1');

  expect(player.getIsAssassinated()).toBeFalsy();

  player.markAsAssassinated();

  expect(player.getIsAssassinated()).toBeTruthy();
});

describe('leader', () => {
  test('should mark as leader', () => {
    const player = new Player('user-1');

    player.setIsLeader(true);

    expect(player.getIsLeader()).toBeTruthy();
  });

  test('should unmark as leader', () => {
    const player = new Player('user-1');

    player.setIsLeader(true);
    player.setIsLeader(false);

    expect(player.getIsLeader()).toBeFalsy();
  });
});

describe('proposal', () => {
  test('should toggle proposal', () => {
    const player = new Player('user-1');

    player.toggleProposition();

    expect(player.getIsProposed()).toBeTruthy();

    player.toggleProposition();

    expect(player.getIsProposed()).toBeFalsy();
  });

  test('should test proposition to false', () => {
    const player = new Player('user-1');

    player.toggleProposition();
    player.setIsProposed(false);

    expect(player.getIsProposed()).toBeFalsy();
  });
});
