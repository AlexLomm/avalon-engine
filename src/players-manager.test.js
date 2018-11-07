const _              = require('lodash');
const errors         = require('./errors');
const LevelPreset    = require('./level-preset');
const PlayersManager = require('./players-manager');
const Player         = require('./player');
const Vote           = require('./vote');

describe('adding players', () => {
  test('should add a player', () => {
    const manager = new PlayersManager();

    expect(manager.getAll().length).toBeFalsy();

    manager.add(new Player());

    expect(manager.getAll().length).toBeTruthy();
  });

  test('should get players', () => {
    const manager = new PlayersManager();

    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    expect(manager.getAll().length).toEqual(2);
  });

  test('should not accept a "falsy" argument to add as a player', () => {
    const manager = new PlayersManager();

    const playersLength = manager._players.length;

    manager.add(null);

    expect(manager._players.length).toStrictEqual(playersLength);
  });

  test('should prevent adding a new player with the same username', () => {
    const manager = new PlayersManager();

    manager.add(new Player('some-username'));

    expect(() => {
      manager.add(new Player('some-username'));
    }).toThrow(errors.USERNAME_ALREADY_EXISTS);
  });

  test('should prevent adding more than 10 players', () => {
    const manager = new PlayersManager();

    _.times(10, (i) => manager.add(new Player(`user-${i}`)));

    expect(() => manager.add(new Player('user-11'))).toThrow(errors.MAXIMUM_PLAYERS_REACHED);
  });

  test('should make the first player a "creator"', () => {
    const manager = new PlayersManager();

    manager.add(new Player('username-1'));
    manager.add(new Player('username-2'));

    expect(manager.getGameCreator().getUsername()).toEqual('username-1');
  });
});

describe('roles assignment', () => {
  test('should assign every player a role', () => {
    const manager = new PlayersManager();

    _.times(8, (i) => manager.add(new Player(`user-${i}`)));

    manager.assignRoles(new LevelPreset(manager.getAll().length));

    const roles = manager.getAll()
      .filter(p => !!p.getRole())
      .map(p => p.getRole());

    expect(roles.length).toEqual(8);
  });

  test('should always have the default roles', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    manager.assignRoles(new LevelPreset(manager.getAll().length), {
      MERLIN: false,
      ASSASSIN: false,
    });

    expect(manager.getAll().find(p => p.getRole().getId() === 'MERLIN')).toBeTruthy();
    expect(manager.getAll().find(p => p.getRole().getId() === 'ASSASSIN')).toBeTruthy();
  });

  test('should have unique roles', () => {
    const manager = new PlayersManager();

    _.times(10, (i) => manager.add(new Player(`user-${i}`)));

    manager.assignRoles(new LevelPreset(manager.getAll().length));

    const roleIds = manager.getAll().map(p => p.getRole().getId());

    expect(_.uniqBy(roleIds, v => v).length).toEqual(roleIds.length);
  });

  test('should have a correct number of good and evil players', () => {
    for (let j = 5; j < 10; j++) {
      const manager = new PlayersManager();

      _.times(j, (i) => manager.add(new Player(`user-${i}`)));

      manager.assignRoles(new LevelPreset(manager.getAll().length));

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
    const manager = new PlayersManager();

    _.times(8, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.getLeader()).toBeFalsy();

    manager.assignRoles(new LevelPreset(manager.getAll().length));

    expect(manager.getLeader()).toBeTruthy();
    expect(manager.getLeader().getIsLeader()).toBeTruthy();
  });

  test('should preserve a creator after the role assignment phase', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    const gameCreator = manager.getGameCreator();

    manager.assignRoles(new LevelPreset(manager.getAll().length));

    expect(manager.getGameCreator()).toBe(gameCreator);
  });
});

describe('leader', () => {
  test('should allow only one leader to exist', () => {
    const manager = new PlayersManager();

    _.times(5, (i) => manager.add(new Player(`user-${i}`)));

    manager.nextLeader();
    manager.nextLeader();

    const leadersCount = manager.getAll()
      .reduce((acc, player) => player.getIsLeader() ? acc + 1 : acc, 0);

    expect(leadersCount).toStrictEqual(1);
  });

  test('should choose the next team leader', () => {
    const manager = new PlayersManager();

    _.times(5, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.getLeader()).toBeFalsy();

    manager.nextLeader();

    expect(manager.getLeader()).toBeTruthy();
    expect(manager.getLeader().getIsLeader()).toBeTruthy();
  });

  test('should choose a new leader that is located next to the old leader', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

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
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.isAllowedToProposePlayer('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.isAllowedToProposePlayer(leader.getUsername())).toBeTruthy();
  });

  test('should set and get proposed players', () => {
    const manager = new PlayersManager();

    manager.add(new Player('user-1'));
    manager.add(new Player('user-2'));

    manager.toggleIsProposed(null);

    expect(manager.getProposedPlayers().length).toBeFalsy();

    manager.toggleIsProposed('user-2');

    expect(manager.getProposedPlayers().pop().getUsername()).toEqual('user-2');
  });

  test('should return if a player has right to submit a team', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.isAllowedToProposeTeam('user-1')).toBeFalsy();

    manager.nextLeader();
    const leader = manager.getLeader();

    expect(manager.isAllowedToProposeTeam(leader.getUsername())).toBeTruthy();
  });

  test('should mark players as submitted', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.getIsSubmitted()).toStrictEqual(false);

    expect(manager.markAsSubmitted());

    expect(manager.getIsSubmitted()).toStrictEqual(true);

    expect(manager.unmarkAsSubmitted());

    expect(manager.getIsSubmitted()).toStrictEqual(false);
  });

  test('should reset votes', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    manager.setVote(new Vote('user-3', true));
    manager.setVote(new Vote('user-4', true));

    manager.resetVotes();

    const playersVotedCount = manager.getAll()
      .filter(p => p.getVote()).length;

    expect(playersVotedCount).toStrictEqual(0);
  });

  test('should reset propositions', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    manager.setVote(new Vote('user-3', true));
    manager.setVote(new Vote('user-4', true));

    manager.resetPropositions();

    expect(manager.getProposedPlayers().length).toStrictEqual(0);
  });
});

describe('voting', () => {
  test('should mark player as has voted', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    manager.setVote(new Vote('nonexistent', false));

    expect(manager.getAll().find(p => p.getVote())).toBeFalsy();

    manager.setVote(new Vote('user-3', false));

    expect(
      manager.getAll().find(p => p.getVote()).getUsername()
    ).toStrictEqual('user-3');
  });

  test('should return if a player is allowed to vote for team', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.isAllowedToVoteForTeam('user-1')).toBeTruthy();

    manager.setVote(new Vote('user-1', true));

    expect(manager.isAllowedToVoteForTeam('user-1')).toBeFalsy();
  });

  test('should return if a player is allowed to vote for quest', () => {
    const manager = new PlayersManager();

    _.times(7, (i) => manager.add(new Player(`user-${i}`)));

    expect(manager.isAllowedToVoteForQuest('user-1')).toBeFalsy();

    manager.toggleIsProposed('user-1');

    expect(manager.isAllowedToVoteForQuest('user-1')).toBeTruthy();

    manager.setVote(new Vote('user-1', true));

    expect(manager.isAllowedToVoteForQuest('user-1')).toBeFalsy();
  });
});
