import { Player } from '../src/player';
import { RoleId } from '../src/configs/roles.config';
import { Role } from '../src/role';
import { Vote } from '../src/vote';

let player: Player;
beforeEach(() => {
  player = new Player('user-1');
});

test('should return a username', () => {
  expect(player.getUsername()).toEqual('user-1');
});

test('should start with an `Unknown` role', () => {
  expect(new Player('user-1').getRole().getId()).toEqual(RoleId.Unknown);
});

test('should return a role', () => {
  const role = new Role(RoleId.Merlin);
  player.setRole(role);

  expect(player.getRole()).toEqual(role);
});

test('should say if can see another player', () => {
  const player1 = new Player('user-1');
  player1.setRole(new Role(RoleId.Merlin));

  const player2 = new Player('user-2');
  player2.setRole(new Role(RoleId.Minion_1));

  expect(player1.canSee(player2)).toBeTruthy();
  expect(player2.canSee(player1)).toBeFalsy();
});

describe('voting', () => {
  test('should return a vote', () => {
    expect(player.generateVote(false))
      .toEqual(new Vote(player.getUsername(), false));
  });

  test('should remember the vote', () => {
    expect(player.getVote()).toBeFalsy();

    const vote = player.generateVote(true);

    expect(vote).toBe(player.getVote());
  });

  test('should reset vote', () => {
    player.generateVote(true);

    player.resetVote();

    expect(player.getVote()).toBeFalsy();
  });
});

describe('serialization', () => {
  test('should return necessary values', () => {
    const expected = ['username', 'role'].sort();
    const actual   = Object.keys(player.serialize(false)).sort();

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role when no role is assigned', () => {
    const expected = new Role(RoleId.Unknown).serialize();
    const actual   = player.serialize(true).role;

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role, despite it being assigned', () => {
    player.setRole(new Role(RoleId.Merlin));

    const expected = new Role(RoleId.Unknown).serialize();
    const actual   = player.serialize(false).role;

    expect(expected).toEqual(actual);
  });

  test('should contain a revealed role when role is assigned', () => {
    const role = new Role(RoleId.Mordred);
    player.setRole(role);

    const expected = role.serialize();
    const actual   = player.serialize(true).role;

    expect(actual).toEqual(expected);
  });
});
