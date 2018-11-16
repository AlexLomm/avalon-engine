const {roleIds} = require('../configs/roles.config');
const Player    = require('../src/player');
const Role      = require('../src/role');
const Vote      = require('../src/vote');

let player;
beforeEach(() => {
  player = new Player('user-1');
});

test('should return a username', () => {
  expect(player.getUsername()).toEqual('user-1');
});

test('should return a role', () => {
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

describe('voting', () => {
  test('should return a vote', () => {
    expect(player.vote(false))
      .toEqual(new Vote(player.getUsername(), false));
  });

  test('should remember the vote', () => {
    expect(player.getVote()).toBeFalsy();

    const vote = player.vote(true);

    expect(vote).toBe(player.getVote());
  });

  test('should reset vote', () => {
    player.vote(true);

    player.resetVote();

    expect(player.getVote()).toBeFalsy();
  });
});

describe('serialization', () => {
  test('should return it\'s field values as an object', () => {
    const actual   = player.serialize();
    const expected = {
      username: 'user-1',
      role: null,
      vote: null,
    };

    expect(actual).toEqual(expected);
  });

  test('should contain a serialized vote', () => {
    const vote = new Vote('user-1', true);
    player.vote(vote);

    expect(player.serialize().vote).toEqual(vote.serialize());
  });

  test('should contain a serialized role', () => {
    const role = new Role(roleIds.MORDRED);
    player.setRole(role);

    expect(player.serialize().role).toEqual(role.serialize());
  });
});
