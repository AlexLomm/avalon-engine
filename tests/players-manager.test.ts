import * as _ from 'lodash';
import * as fromErrors from '../src/errors';
import { PlayersManager } from '../src/players-manager';
import { Player } from '../src/player';
import { LevelPreset } from '../src/level-preset';
import { RoleId } from '../src/configs/roles.config';

let manager: PlayersManager;
beforeEach(() => {
  manager = new PlayersManager();
});

// TODO: extract
const addPlayersAndAssignRoles = (number: number, _manager: PlayersManager = manager) => {
  addPlayersToManager(number, _manager);
  assignRolesToManager(_manager);
};

// TODO: extract
const addPlayersToManager = (number: number, _manager: PlayersManager = manager) => {
  _.times(number, (i: number) => _manager.add(new Player(`user-${i}`)));
};

// TODO: extract
const assignRolesToManager = (_manager: PlayersManager = manager) => {
  _manager.assignRoles(new LevelPreset(_manager.getAll().length));
};

describe('adding players', () => {
  test('should add a player', () => {
    expect(manager.getAll().length).toBeFalsy();

    manager.add(new Player('user-1'));

    expect(manager.getAll().length).toBeTruthy();
  });

  test('should get players', () => {
    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    expect(manager.getAll().length).toEqual(2);
  });

  test('should not accept a "falsy" argument to add as a player', () => {
    const initialPlayersCount = manager.getAll().length;

    manager.add(null);

    expect(manager.getAll().length).toStrictEqual(initialPlayersCount);
  });

  test('should prevent adding a new player with the same username', () => {
    manager.add(new Player('some-username'));

    expect(() => {
      manager.add(new Player('some-username'));
    }).toThrow(fromErrors.AlreadyExistsPlayerError);
  });

  test('should prevent adding more than 10 players', () => {
    addPlayersToManager(10);

    expect(() => manager.add(new Player('user-11')))
      .toThrow(fromErrors.PlayersMaximumReachedError);
  });

  test('should make the first player a "creator"', () => {
    manager.add(new Player('username-1'));
    manager.add(new Player('username-2'));

    expect(manager.getGameCreator().getUsername()).toEqual('username-1');
  });
});

describe('roles assignment', () => {
  test('should have a team leader chosen', () => {
    addPlayersToManager(8);

    expect(manager.getLeader()).toBeFalsy();

    assignRolesToManager();

    expect(manager.getLeader()).toBeTruthy();
  });

  test('should have an assassin appointed', () => {
    addPlayersToManager(7);

    expect(manager.getAssassin()).toBeFalsy();

    assignRolesToManager();

    expect(manager.getAssassin()).toBeTruthy();
  });

  test('should preserve a creator after the role assignment phase', () => {
    addPlayersToManager(7);

    const gameCreator = manager.getGameCreator();

    assignRolesToManager();

    expect(manager.getGameCreator()).toBe(gameCreator);
  });
});

describe('leader', () => {
  test('should choose the next team leader', () => {
    addPlayersToManager(5);

    expect(manager.getLeader()).toBeFalsy();

    manager.nextLeader();

    expect(manager.getLeader()).toBeTruthy();
  });

  test('should choose a new leader that is located right next to the old leader', () => {
    addPlayersToManager(7);

    manager.nextLeader();
    const oldLeaderIndex = manager.getAll()
      .findIndex(p => p === manager.getLeader());

    manager.nextLeader();
    const newLeaderIndex = manager.getAll()
      .findIndex(p => p === manager.getLeader());

    expect(newLeaderIndex).toEqual((oldLeaderIndex + 1) % manager.getAll().length);
  });
});

describe('team proposition and submission', () => {
  test('should return if a player has right to propose a teammate', () => {
    addPlayersToManager(7);

    expect(manager.playerPropositionAllowedFor('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.playerPropositionAllowedFor(leader.getUsername())).toBeTruthy();
  });

  test('should set and get proposed players', () => {
    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    manager.togglePlayerProposition(null);

    expect(manager.getProposedPlayers().length).toStrictEqual(0);

    manager.togglePlayerProposition('user-2');

    expect(manager.getProposedPlayers().pop().getUsername()).toEqual('user-2');
  });

  test('should toggle a proposed player', () => {
    manager.add(new Player('user-1'));

    manager.togglePlayerProposition('user-1');
    manager.togglePlayerProposition('user-1');

    expect(manager.getProposedPlayers().length).toStrictEqual(0);
  });

  test('should return if a player has right to submit a team', () => {
    addPlayersToManager(7);

    expect(manager.playerPropositionAllowedFor('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.playerPropositionAllowedFor(leader.getUsername())).toBeTruthy();
  });

  test('should mark players as submitted', () => {
    addPlayersToManager(7);

    expect(manager.getIsSubmitted()).toStrictEqual(false);

    expect(manager.setIsSubmitted(true));

    expect(manager.getIsSubmitted()).toStrictEqual(true);

    expect(manager.setIsSubmitted(false));

    expect(manager.getIsSubmitted()).toStrictEqual(false);
  });

  test('should reset votes', () => {
    addPlayersToManager(7);

    manager.generateVote('user-3', true);
    manager.generateVote('user-4', true);

    manager.resetVotes();

    const playersVotedCount = manager.getAll()
      .filter(p => p.getVote()).length;

    expect(playersVotedCount).toStrictEqual(0);
  });

  test('should reset propositions', () => {
    addPlayersToManager(7);

    manager.generateVote('user-3', true);
    manager.generateVote('user-4', true);

    manager.reset();

    expect(manager.getProposedPlayers().length).toStrictEqual(0);
  });

  test('should reset votes, propositions and whether the team is submitted or not', () => {
    addPlayersToManager(7);

    manager.setIsSubmitted(true);
    manager.generateVote('user-1', true);
    manager.togglePlayerProposition(manager.getAll()[0].getUsername());

    manager.reset();

    expect(manager.getIsSubmitted()).toBeFalsy();
    expect(manager.getProposedPlayers().length).toStrictEqual(0);
    expect(manager.getIsSubmitted()).toBeFalsy();
  });
});

describe('voting', () => {
  test('should throw if a nonexistent player tries to vote', () => {
    addPlayersToManager(5);

    expect(() => {
      manager.generateVote('nonexistent', false);
    }).toThrow(fromErrors.PlayerMissingError);
  });

  test('should mark player as has voted', () => {
    addPlayersToManager(5);

    manager.generateVote('user-3', false);

    expect(
      manager.getAll().find(p => !!p.getVote()).getUsername(),
    ).toStrictEqual('user-3');
  });

  test('should throw if a player tries to vote twice', () => {
    addPlayersToManager(5);

    manager.generateVote('user-1', false);

    expect(() => {
      manager.generateVote('user-1', false);
    }).toThrow(fromErrors.AlreadyVotedError);
  });

  test('should return if a player is allowed to vote for team', () => {
    addPlayersToManager(7);

    expect(manager.teamVotingAllowedFor('user-1')).toBeTruthy();

    manager.generateVote('user-1', true);

    expect(manager.teamVotingAllowedFor('user-1')).toBeFalsy();
  });

  test('should return if a player is allowed to vote for quest', () => {
    addPlayersToManager(7);

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();

    manager.togglePlayerProposition('user-1');

    expect(manager.questVotingAllowedFor('user-1')).toBeTruthy();

    manager.generateVote('user-1', true);

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();
  });
});

describe('assassination', () => {
  test('should throw if a non-assassin tries to propose a victim', () => {
    addPlayersAndAssignRoles(5);

    const nonAssassins = manager.getAll().filter((p) => !p.isAssassin());

    expect(() => {
      manager.toggleVictimProposition(
        nonAssassins[0].getUsername(),
        nonAssassins[1].getUsername(),
      );
    }).toThrow(fromErrors.DeniedVictimPropositionError);
  });

  test('should throw if an assassin tries to propose himself', () => {
    addPlayersAndAssignRoles(5);

    expect(() => {
      manager.toggleVictimProposition(
        manager.getAssassin().getUsername(),
        manager.getAssassin().getUsername(),
      );
    }).toThrow(fromErrors.DeniedSelfSacrificeError);
  });

  test('should toggle victim proposition', () => {
    addPlayersAndAssignRoles(7);

    expect(manager.getVictim()).toBeFalsy();

    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());
    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername(),
    );

    expect(manager.getVictim()).toBe(nonAssassin);

    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername(),
    );

    expect(manager.getVictim()).toBeFalsy();
  });

  test('should throw for assassination attempt, when no victim is proposed', () => {
    addPlayersAndAssignRoles(7);

    expect(() => manager.assassinate(manager.getAssassin().getUsername()))
      .toThrow(fromErrors.RequiredVictimError);
  });

  test('should throw if a non-assassin tries to assassinate', () => {
    addPlayersAndAssignRoles(7);

    const assassin    = manager.getAssassin();
    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());

    manager.toggleVictimProposition(
      assassin.getUsername(),
      nonAssassin.getUsername(),
    );

    expect(() => manager.assassinate(nonAssassin.getUsername()))
      .toThrow(fromErrors.DeniedAssassinationError);
  });

  test('should assassinate a player', () => {
    addPlayersAndAssignRoles(7);

    const assassin = manager.getAssassin();
    const victim   = manager.getAll().find((p) => !p.isAssassin());

    manager.toggleVictimProposition(assassin.getUsername(), victim.getUsername());

    expect(manager.getIsAssassinated(victim)).toBeFalsy();

    manager.assassinate(assassin.getUsername());

    expect(manager.getIsAssassinated(victim)).toBeTruthy();
  });

  test('should return true if the assassination was successful', () => {
    addPlayersAndAssignRoles(5);

    const assassin = manager.getAssassin();
    const merlin   = manager.getAll().find((p) => p.getRole().getId() === RoleId.Merlin);

    manager.toggleVictimProposition(assassin.getUsername(), merlin.getUsername());

    const wasMerlin = manager.assassinate(assassin.getUsername());

    expect(wasMerlin).toBeTruthy();
  });

  test('should return false if the assassination was unsucsessful', () => {
    addPlayersAndAssignRoles(5);

    const assassin  = manager.getAssassin();
    const nonMerlin = manager.getAll().find((p) => {
      return p.getRole().getId() !== RoleId.Merlin
        && !p.isAssassin();
    });

    manager.toggleVictimProposition(assassin.getUsername(), nonMerlin.getUsername());

    const wasMerlin = manager.assassinate(assassin.getUsername());

    expect(wasMerlin).toBeFalsy();
  });
});

describe('serialization', () => {
  test('should throw if no such player exists', () => {
    expect(() => manager.serializeFor('nonexistent', false))
      .toThrow(fromErrors.PlayerMissingError);
  });

  test('should return necessary values', () => {
    addPlayersAndAssignRoles(5);

    const expected = [
      'players', 'proposedPlayerUsernames', 'gameCreatorUsername',
      'leaderUsername', 'isSubmitted', 'victimUsername', 'isAssassinated',
    ].sort();

    const actual = Object.keys(manager.serializeFor('user-1', false)).sort();

    expect(expected).toEqual(actual);
  });

  test('should contain every serialized player', () => {
    addPlayersAndAssignRoles(5);

    manager.getAll().forEach((p) => jest.spyOn(p, 'serialize'));

    const votesRevealed = true;
    manager.serializeFor('user-1', votesRevealed);

    manager.getAll().forEach((p) => expect(p.serialize).toBeCalledTimes(1));
  });

  test('should contain proposed player usernames', () => {
    addPlayersAndAssignRoles(5);

    manager.togglePlayerProposition('user-1');
    manager.togglePlayerProposition('user-2');

    const serialized = manager.serializeFor('user-3', false);

    expect(serialized.proposedPlayerUsernames)
      .toEqual(['user-1', 'user-2']);
  });

  test('should contain a game creator username', () => {
    addPlayersAndAssignRoles(5);

    const gameCreatorUsername = manager.serializeFor('user-1', false)
      .gameCreatorUsername;
    const usernames           = manager.getAll().map((p) => p.getUsername());

    expect(usernames.includes(gameCreatorUsername)).toBeTruthy();
  });

  test('should contain a game leader username', () => {
    addPlayersAndAssignRoles(5);

    const expected = manager.getLeader().getUsername();
    const actual   = manager.serializeFor('user-1', false)
      .leaderUsername;

    expect(expected).toEqual(actual);
  });

  test('should contain if is submitted', () => {
    addPlayersAndAssignRoles(5);

    manager.setIsSubmitted(true);

    expect(manager.serializeFor('user-1', false).isSubmitted)
      .toStrictEqual(true);
  });

  test('should contain the victim\'s username', () => {
    addPlayersAndAssignRoles(5);

    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());
    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername(),
    );

    const victimUsername = manager.serializeFor('user-1', false)
      .victimUsername;

    expect(nonAssassin.getUsername()).toStrictEqual(victimUsername);
  });

  test('should contain whether the victim is assassinated', () => {
    addPlayersAndAssignRoles(5);

    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());
    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername(),
    );

    manager.assassinate(manager.getAssassin().getUsername());

    const isAssassinated = manager.serializeFor('user-1', false)
      .isAssassinated;

    expect(isAssassinated).toStrictEqual(true);
  });
});
