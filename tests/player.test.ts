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

test('should return a role', () => {
  expect(player.getRole()).toBeFalsy();

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
    const expected = ['username', 'role', 'vote'].sort();
    const actual   = Object.keys(player.serialize(false, false)).sort();

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role when no role is assigned', () => {
    const expected = new Role(RoleId.Unknown).serialize();
    const actual   = player.serialize(true, false).role;

    expect(expected).toEqual(actual);
  });

  test('should contain a hidden role, despite it being assigned', () => {
    player.setRole(new Role(RoleId.Merlin));

    const expected = new Role(RoleId.Unknown).serialize();
    const actual   = player.serialize(false, false).role;

    expect(expected).toEqual(actual);
  });

  test('should contain a revealed role when role is assigned', () => {
    const role = new Role(RoleId.Mordred);
    player.setRole(role);

    const expected = role.serialize();
    const actual   = player.serialize(true, false).role;

    expect(actual).toEqual(expected);
  });

  test('should contain `null` if a vote hasn\'t been cast', () => {
    expect(player.serialize(false, false).vote).toStrictEqual(null);
  });

  test('should contain `null` as a vote value if the vote has not been yet revealed', () => {
    player.generateVote(true);

    expect(player.serialize(false, false).vote.value).toStrictEqual(null);
  });

  test('should reveal the vote value', () => {
    player.generateVote(true);

    expect(player.serialize(false, true).vote.value).toStrictEqual(true);
  });
});
