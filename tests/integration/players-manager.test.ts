import * as fromErrors from '../../src/errors';
import { PlayersManager } from '../../src/players-manager';
import { Player } from '../../src/player';
import { PlayersManagerHelper } from '../helpers/players-manager.helper';
import { RoleId } from '../../src/enums/role-id';

let manager: PlayersManager;
beforeEach(() => {
  manager = new PlayersManager();
});

describe('adding players', () => {
  test('should add a player', () => {
    expect(manager.getAll().length).toBeFalsy();

    manager.add(new Player('user-1'));

    expect(manager.getAll().length).toBeTruthy();
  });

  test('should remove a player', () => {
    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));
    manager.add(new Player('user-3'));

    manager.remove('user-2');

    expect(manager.getAll().map(p => p.getId())).toEqual(['user-1', 'user-3']);
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

  test('should prevent adding a new player with the same id', () => {
    manager.add(new Player('some-id'));

    expect(() => {
      manager.add(new Player('some-id'));
    }).toThrow(fromErrors.AlreadyExistsPlayerError);
  });

  test('should prevent adding more than 10 players', () => {
    PlayersManagerHelper.fillPlayers(manager, 10);

    expect(() => manager.add(new Player('user-11')))
      .toThrow(fromErrors.PlayersMaximumReachedError);
  });
});

describe('roles assignment', () => {
  test('should have a team leader chosen', () => {
    PlayersManagerHelper.fillPlayers(manager, 8);

    expect(manager.getLeader()).toBeFalsy();

    PlayersManagerHelper.assignRoles(manager);

    expect(manager.getLeader()).toBeTruthy();
  });

  test('should have an assassin appointed', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(PlayersManagerHelper.getAssassin(manager)).toBeFalsy();

    PlayersManagerHelper.assignRoles(manager);

    expect(PlayersManagerHelper.getAssassin(manager)).toBeTruthy();
  });
});

describe('leader', () => {
  test('should choose the next team leader', () => {
    PlayersManagerHelper.fillPlayers(manager, 5);

    expect(manager.getLeader()).toBeFalsy();

    manager.nextLeader();

    expect(manager.getLeader()).toBeTruthy();
  });

  test('should choose a new leader that is located right next to the old leader', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

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
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(manager.playerPropositionAllowedFor('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.playerPropositionAllowedFor(leader.getId())).toBeTruthy();
  });

  test('should set and get proposed players', () => {
    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    manager.togglePlayerProposition(null);

    expect(manager.getProposedPlayersCount()).toStrictEqual(0);

    manager.togglePlayerProposition('user-2');

    expect(manager.getProposedPlayersCount()).toBeTruthy();
  });

  test('should toggle a proposed player', () => {
    manager.add(new Player('user-1'));

    manager.togglePlayerProposition('user-1');
    manager.togglePlayerProposition('user-1');

    expect(manager.getProposedPlayersCount()).toStrictEqual(0);
  });

  test('should reset all the proposed players', () => {
    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    manager.togglePlayerProposition('user-1');
    manager.togglePlayerProposition('user-2');

    manager.resetProposedTeammates();

    expect(manager.getProposedPlayersCount()).toStrictEqual(0);
  });

  test('should return if a player has right to submit a team', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(manager.playerPropositionAllowedFor('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.playerPropositionAllowedFor(leader.getId())).toBeTruthy();
  });

  test('should mark players as submitted', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(manager.getIsSubmitted()).toStrictEqual(false);

    expect(manager.setIsSubmitted(true));

    expect(manager.getIsSubmitted()).toStrictEqual(true);

    expect(manager.setIsSubmitted(false));

    expect(manager.getIsSubmitted()).toStrictEqual(false);
  });

  test('should reset votes', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    manager.generateVote('user-3', true);
    manager.generateVote('user-4', true);

    manager.resetVotes();

    const playersVotedCount = manager.getAll()
      .filter(p => p.getVote()).length;

    expect(playersVotedCount).toStrictEqual(0);
  });

  test('should reset propositions', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    manager.generateVote('user-3', true);
    manager.generateVote('user-4', true);

    manager.reset();

    expect(manager.getProposedPlayersCount()).toStrictEqual(0);
  });

  test('should reset votes, propositions and whether the team is submitted or not', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    manager.setIsSubmitted(true);
    manager.generateVote('user-1', true);
    manager.togglePlayerProposition(manager.getAll()[0].getId());

    manager.reset();

    expect(manager.getIsSubmitted()).toBeFalsy();

    expect(manager.getProposedPlayersCount()).toStrictEqual(0);

    expect(manager.getIsSubmitted()).toBeFalsy();
  });
});

describe('voting', () => {
  test('should throw if a nonexistent player tries to vote', () => {
    PlayersManagerHelper.fillPlayers(manager, 5);

    expect(() => {
      manager.generateVote('nonexistent', false);
    }).toThrow(fromErrors.PlayerMissingError);
  });

  test('should mark player as has voted', () => {
    PlayersManagerHelper.fillPlayers(manager, 5);

    manager.generateVote('user-3', false);

    expect(
      manager.getAll().find(p => !!p.getVote()).getId(),
    ).toStrictEqual('user-3');
  });

  test('should throw if a player tries to vote twice', () => {
    PlayersManagerHelper.fillPlayers(manager, 5);

    manager.generateVote('user-1', false);

    expect(() => {
      manager.generateVote('user-1', false);
    }).toThrow(fromErrors.AlreadyVotedError);
  });

  test('should return if a player is allowed to vote for team', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(manager.teamVotingAllowedFor('user-1')).toBeTruthy();

    manager.generateVote('user-1', true);

    expect(manager.teamVotingAllowedFor('user-1')).toBeFalsy();
  });

  test('should return if a player is allowed to vote for quest', () => {
    PlayersManagerHelper.fillPlayers(manager, 7);

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();

    manager.togglePlayerProposition('user-1');

    expect(manager.questVotingAllowedFor('user-1')).toBeTruthy();

    manager.generateVote('user-1', true);

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();
  });
});

describe('assassination', () => {
  test('should throw if a non-assassin tries to propose a victim', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const nonAssassins = manager.getAll().filter((p) => !p.isAssassin());

    expect(() => {
      manager.toggleVictimProposition(
        nonAssassins[0].getId(),
        nonAssassins[1].getId(),
      );
    }).toThrow(fromErrors.DeniedVictimPropositionError);
  });

  test('should throw if an assassin tries to propose himself', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    expect(() => {
      manager.toggleVictimProposition(
        PlayersManagerHelper.getAssassin(manager).getId(),
        PlayersManagerHelper.getAssassin(manager).getId(),
      );
    }).toThrow(fromErrors.DeniedSelfSacrificeError);
  });

  test('should toggle victim proposition', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    expect(manager.serialize('user-1', true).victimId).toBeFalsy();

    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());
    manager.toggleVictimProposition(
      PlayersManagerHelper.getAssassin(manager).getId(),
      nonAssassin.getId(),
    );

    expect(manager.serialize('user-1', true).victimId).toEqual(nonAssassin.getId());

    manager.toggleVictimProposition(
      PlayersManagerHelper.getAssassin(manager).getId(),
      nonAssassin.getId(),
    );

    expect(manager.serialize('user-1', true).victimId).toBeFalsy();
  });

  test('should reveal every role', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    const serialized       = manager.serialize('user-1', false);
    const concealedPlayers = serialized.collection.filter(p => p.role.id === RoleId.Unknown);

    expect(concealedPlayers.length).toStrictEqual(0);
  });

  test('should throw for assassination attempt, when no victim is proposed', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    expect(() => manager.assassinate(PlayersManagerHelper.getAssassin(manager).getId()))
      .toThrow(fromErrors.RequiredVictimError);
  });

  test('should throw if a non-assassin tries to assassinate', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    const assassin    = PlayersManagerHelper.getAssassin(manager);
    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());

    manager.toggleVictimProposition(
      assassin.getId(),
      nonAssassin.getId(),
    );

    expect(() => manager.assassinate(nonAssassin.getId()))
      .toThrow(fromErrors.DeniedAssassinationError);
  });

  test('should return whether that the assassination was successful', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    const assassin = PlayersManagerHelper.getAssassin(manager);
    const victim   = manager.getAll().find((p) => p.getRole().getId() === RoleId.Merlin);

    manager.toggleVictimProposition(assassin.getId(), victim.getId());

    const isSuccessful = manager.assassinate(assassin.getId());

    expect(isSuccessful).toBeTruthy();
  });

  test('should return whether the assassination was unsuccessful', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 7);

    const assassin = PlayersManagerHelper.getAssassin(manager);
    const victim   = PlayersManagerHelper.getNonAssassinNonMerlin(manager);

    manager.toggleVictimProposition(assassin.getId(), victim.getId());

    const isSuccessful = manager.assassinate(assassin.getId());

    expect(isSuccessful).toBeFalsy();
  });

  test('should return true if the assassination was successful', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const assassin = PlayersManagerHelper.getAssassin(manager);
    const merlin   = manager.getAll().find((p) => p.getRole().getId() === RoleId.Merlin);

    manager.toggleVictimProposition(assassin.getId(), merlin.getId());

    const wasMerlin = manager.assassinate(assassin.getId());

    expect(wasMerlin).toBeTruthy();
  });

  test('should return false if the assassination was unsuccessful', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const assassin  = PlayersManagerHelper.getAssassin(manager);
    const nonMerlin = manager.getAll().find((p) => {
      return p.getRole().getId() !== RoleId.Merlin
        && !p.isAssassin();
    });

    manager.toggleVictimProposition(assassin.getId(), nonMerlin.getId());

    const wasMerlin = manager.assassinate(assassin.getId());

    expect(wasMerlin).toBeFalsy();
  });
});

describe('serialization', () => {
  test('should throw if no such player exists', () => {
    expect(() => manager.serialize('nonexistent', true))
      .toThrow(fromErrors.PlayerMissingError);
  });

  test('should return necessary values', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const expected = [
      'collection',
      'proposedPlayerIds',
      'leaderId',
      'isSubmitted',
      'victimId',
    ].sort();

    const actual = Object.keys(manager.serialize('user-1', true)).sort();

    expect(expected).toEqual(actual);
  });

  test('should contain every serialized player', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    manager.getAll().forEach((p) => jest.spyOn(p, 'serialize'));

    manager.serialize('user-1', true);

    manager.getAll().forEach((p) => expect(p.serialize).toBeCalledTimes(1));
  });

  test('should contain proposed player ids', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    manager.togglePlayerProposition('user-1');
    manager.togglePlayerProposition('user-2');

    const serialized = manager.serialize('user-3', true);

    expect(serialized.proposedPlayerIds)
      .toEqual(['user-1', 'user-2']);
  });

  test('should contain a game leader id', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const expected = manager.getLeader().getId();
    const actual   = manager.serialize('user-1', true)
      .leaderId;

    expect(expected).toEqual(actual);
  });

  test('should contain if is submitted', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    manager.setIsSubmitted(true);

    expect(manager.serialize('user-1', true).isSubmitted)
      .toStrictEqual(true);
  });

  test('should contain the victim\'s id', () => {
    PlayersManagerHelper.addPlayersAndAssignRoles(manager, 5);

    const nonAssassin = manager.getAll().find((p) => !p.isAssassin());
    manager.toggleVictimProposition(
      PlayersManagerHelper.getAssassin(manager).getId(),
      nonAssassin.getId(),
    );

    const victimId = manager.serialize('user-1', true).victimId;

    expect(nonAssassin.getId()).toStrictEqual(victimId);
  });
});
