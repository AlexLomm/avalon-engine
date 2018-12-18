import { Player } from '../../src/player';
import { Role } from '../../src/role';
import { Vote } from '../../src/vote';
import { RoleId } from '../../src/enums/role-id';

let player: Player;
beforeEach(() => {
  player = new Player('user-1');
});

test('should return a id', () => {
  expect(player.getId()).toEqual('user-1');
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
  const merlin = new Player('user-1');
  merlin.setRole(new Role(RoleId.Merlin));

  const minion = new Player('user-2');
  minion.setRole(new Role(RoleId.Minion_1));

  expect(merlin.canSee(minion)).toBeTruthy();
  expect(minion.canSee(merlin)).toBeFalsy();
});

test('should return if is assassin', () => {
  const nonAssassin = new Player('user-1');
  nonAssassin.setRole(new Role(RoleId.Minion_1));

  const assassin = new Player('user-1');
  assassin.setRole(new Role(RoleId.Assassin));

  expect(nonAssassin.isAssassin()).toBeFalsy();
  expect(assassin.isAssassin()).toBeTruthy();
});

test('should return if is merlin', () => {
  const nonMerlin = new Player('user-1');
  nonMerlin.setRole(new Role(RoleId.Mordred));

  const merlin = new Player('user-1');
  merlin.setRole(new Role(RoleId.Merlin));

  expect(nonMerlin.isMerlin()).toBeFalsy();
  expect(merlin.isMerlin()).toBeTruthy();
});

describe('voting', () => {
  test('should return a vote', () => {
    expect(player.generateVote(false))
      .toEqual(new Vote(player.getId(), false));
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
    const expected = ['id', 'role'].sort();
    const actual   = Object.keys(player.serialize(false)).sort();

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role when no role is assigned', () => {
    const expected = Role.null().serialize();
    const actual   = player.serialize(true).role;

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role, despite it being assigned', () => {
    player.setRole(new Role(RoleId.Merlin));

    const expected = Role.null().serialize();
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
