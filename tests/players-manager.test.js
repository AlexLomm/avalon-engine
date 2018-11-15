const _              = require('lodash');
const errors         = require('../src/errors');
const LevelPreset    = require('../src/level-preset');
const PlayersManager = require('../src/players-manager');
const Player         = require('../src/player');
const Vote           = require('../src/vote');

let manager;
beforeEach(() => {
  manager = new PlayersManager();
});

// TODO: extract
const addPlayersAndAssignRoles = (number, _manager = manager) => {
  addPlayersToManager(number, _manager);
  assignRolesToManager(_manager);
};

// TODO: extract
const addPlayersToManager = (number, _manager = manager) => {
  _.times(number, (i) => _manager.add(new Player(`user-${i}`)));
};

// TODO: extract
const assignRolesToManager = (_manager = manager) => {
  _manager.assignRoles(new LevelPreset(_manager.getAll().length));
};

describe('adding players', () => {
  test('should add a player', () => {
    expect(manager.getAll().length).toBeFalsy();

    manager.add(new Player());

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
    }).toThrow(errors.AlreadyExistsPlayerError);
  });

  test('should prevent adding more than 10 players', () => {
    addPlayersToManager(10);

    expect(() => manager.add(new Player('user-11')))
      .toThrow(errors.PlayersMaximumReachedError);
  });

  test('should make the first player a "creator"', () => {
    manager.add(new Player('username-1'));
    manager.add(new Player('username-2'));

    expect(manager.getGameCreator().getUsername()).toEqual('username-1');
  });
});

describe('roles assignment', () => {
  test('should assign every player a role', () => {
    addPlayersAndAssignRoles(8);

    const roles = manager.getAll()
      .filter(p => !!p.getRole())
      .map(p => p.getRole());

    expect(roles.length).toEqual(8);
  });

  test('should always assign default roles to players', () => {
    addPlayersToManager(7);

    manager.assignRoles(new LevelPreset(manager.getAll().length), {
      MERLIN: false,
      ASSASSIN: false,
    });

    expect(manager.getAll().find(p => p.getRole().getId() === 'MERLIN')).toBeTruthy();
    expect(manager.getAll().find(p => p.getRole().getId() === 'ASSASSIN')).toBeTruthy();
  });

  test('should assign every player a unique role', () => {
    addPlayersAndAssignRoles(10);

    const roleIds = manager.getAll().map(p => p.getRole().getId());

    expect(_.uniqBy(roleIds, v => v).length).toEqual(roleIds.length);
  });

  test('should have a correct number of good and evil players', () => {
    for (let j = 5; j < 10; j++) {
      const manager = new PlayersManager();

      addPlayersAndAssignRoles(j, manager);

      let goodCount = 0;
      let evilCount = 0;
      manager.getAll().forEach(p => {
        const loyalty = p.getRole().getLoyalty();

        loyalty === 'GOOD' ? goodCount++ : evilCount++;
      });

      expect((new LevelPreset(j)).getGoodCount()).toEqual(goodCount);
      expect((new LevelPreset(j)).getEvilCount()).toEqual(evilCount);
    }
  });

  test('should have a team leader chosen', () => {
    addPlayersToManager(8);

    expect(manager.getLeader()).toBeFalsy();

    assignRolesToManager();

    expect(manager.getLeader().getIsLeader()).toBeTruthy();
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

    expect(manager.getLeader().getIsLeader()).toBeTruthy();
  });

  test('should allow only one leader to exist', () => {
    addPlayersToManager(5);

    manager.nextLeader();
    manager.nextLeader();

    const leadersCount = manager.getAll()
      .reduce((acc, player) => player.getIsLeader() ? acc + 1 : acc, 0);

    expect(leadersCount).toStrictEqual(1);
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

    manager.toggleTeamProposition(null);

    expect(manager.getProposedPlayers().length).toBeFalsy();

    manager.toggleTeamProposition('user-2');

    expect(manager.getProposedPlayers().pop().getUsername()).toEqual('user-2');
  });

  test('should return if a player has right to submit a team', () => {
    addPlayersToManager(7);

    expect(manager.teamPropositionAllowedFor('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.teamPropositionAllowedFor(leader.getUsername())).toBeTruthy();
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

    manager.setVote(new Vote('user-3', true));
    manager.setVote(new Vote('user-4', true));

    manager.resetVotes();

    const playersVotedCount = manager.getAll()
      .filter(p => p.getVote()).length;

    expect(playersVotedCount).toStrictEqual(0);
  });

  test('should reset propositions', () => {
    addPlayersToManager(7);

    manager.setVote(new Vote('user-3', true));
    manager.setVote(new Vote('user-4', true));

    manager.resetPropositions();

    expect(manager.getProposedPlayers().length).toStrictEqual(0);
  });
});

describe('voting', () => {
  test('should mark player as has voted', () => {
    addPlayersToManager(7);

    manager.setVote(new Vote('nonexistent', false));

    expect(manager.getAll().find(p => p.getVote())).toBeFalsy();

    manager.setVote(new Vote('user-3', false));

    expect(
      manager.getAll().find(p => p.getVote()).getUsername()
    ).toStrictEqual('user-3');
  });

  test('should return if a player is allowed to vote for team', () => {
    addPlayersToManager(7);

    expect(manager.teamVotingAllowedFor('user-1')).toBeTruthy();

    manager.setVote(new Vote('user-1', true));

    expect(manager.teamVotingAllowedFor('user-1')).toBeFalsy();
  });

  test('should return if a player is allowed to vote for quest', () => {
    addPlayersToManager(7);

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();

    manager.toggleTeamProposition('user-1');

    expect(manager.questVotingAllowedFor('user-1')).toBeTruthy();

    manager.setVote(new Vote('user-1', true));

    expect(manager.questVotingAllowedFor('user-1')).toBeFalsy();
  });
});

describe('assassination', () => {
  test('should throw if a non-assassin tries to propose a victim', () => {
    addPlayersAndAssignRoles(5);

    const nonAssassins = manager.getAll().filter((p) => !p.getIsAssassin());

    expect(() => {
      manager.toggleVictimProposition(
        nonAssassins[0].getUsername(),
        nonAssassins[1].getUsername()
      );
    }).toThrow(errors.DeniedVictimPropositionError);
  });

  test('should throw if an assassin tries to propose himself', () => {
    addPlayersAndAssignRoles(5);

    expect(() => {
      manager.toggleVictimProposition(
        manager.getAssassin().getUsername(),
        manager.getAssassin().getUsername()
      );
    }).toThrow(errors.DeniedSelfSacrificeError);
  });

  test('should toggle victim proposition', () => {
    addPlayersAndAssignRoles(7);

    expect(manager.getVictim()).toBeFalsy();

    const nonAssassin = manager.getAll().find((p) => !p.getIsAssassin());
    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername()
    );

    expect(manager.getVictim()).toBe(nonAssassin);

    manager.toggleVictimProposition(
      manager.getAssassin().getUsername(),
      nonAssassin.getUsername()
    );

    expect(manager.getVictim()).toBeFalsy();
  });

  test('should throw for assassination attempt, when no victim is proposed', () => {
    addPlayersAndAssignRoles(7);

    expect(() => manager.assassinate(manager.getAssassin().getUsername()))
      .toThrow(errors.RequiredVictimError);
  });

  test('should throw if a non-assassin tries to assassinate', () => {
    addPlayersAndAssignRoles(7);

    const assassin    = manager.getAssassin();
    const nonAssassin = manager.getAll().find((p) => !p.getIsAssassin());

    manager.toggleVictimProposition(
      assassin.getUsername(),
      nonAssassin.getUsername()
    );

    expect(() => manager.assassinate(nonAssassin.getUsername()))
      .toThrow(errors.DeniedAssassinationError);
  });

  test('should assassinate a player', () => {
    addPlayersAndAssignRoles(7);

    const assassin = manager.getAssassin();
    const victim   = manager.getAll().find((p) => !p.getIsAssassin());

    manager.toggleVictimProposition(assassin.getUsername(), victim.getUsername());

    expect(victim.getIsAssassinated()).toBeFalsy();

    manager.assassinate(assassin.getUsername(), victim.getUsername());

    expect(victim.getIsAssassinated()).toBeTruthy();
  });
});

describe('serialization', () => {
  test('should return an empty state', () => {
    const expected = {
      gameCreator: null,
      isSubmitted: false,
      players: [],
    };

    const actual = manager.serialize();

    expect(expected).toEqual(actual);
  });

  test('should contain serialized players', () => {
    addPlayersAndAssignRoles(5);

    const serialized            = manager.serialize();
    const firstPlayerSerialized = manager.getAll()[0].serialize();

    expect(serialized.players.length).toEqual(manager.getAll().length);
    expect(serialized.players[0]).toEqual(firstPlayerSerialized);
  });

  test('should contain serialized players', () => {
    addPlayersAndAssignRoles(5);

    const serializedState       = manager.serialize();
    const serializedGameCreator = manager.getGameCreator().serialize();

    expect(serializedState.gameCreator).toEqual(serializedGameCreator);
  });

  test('should contain whether the team is submitted', () => {
    addPlayersAndAssignRoles(5);
    manager.setIsSubmitted(true);

    const serialized = manager.serialize();

    expect(serialized.isSubmitted).toStrictEqual(true);
  });
});
