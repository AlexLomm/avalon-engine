const _              = require('lodash');
const errors         = require('./errors');
const Game           = require('./game.js');
const Player         = require('./player');
const PlayersManager = require('./players-manager');
const QuestsManager  = require('./quests-manager');

describe('game start', () => {
  test('should not start the game if the player count is not enough', () => {
    const game = new Game();

    _.times(4, (i) => game.addPlayer(new Player(i)));

    expect(() => game.start()).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);
  });

  test('should mark the game as started', () => {
    const game = new Game();

    _.times(8, (i) => game.addPlayer(new Player(i)));

    expect(game.getStartedAt()).toBeDefined();
    expect(game.getStartedAt()).toBeFalsy();

    game.start();

    expect(game.getStartedAt() instanceof Date).toStrictEqual(true);
  });

  test('should load the level preset appropriate to the player count', () => {
    const game        = new Game();
    const playerCount = 8;

    _.times(playerCount, (i) => game.addPlayer(new Player(i)));

    game.start();

    const goodCount = game.getLevelPreset().getGoodCount();
    const evilCount = game.getLevelPreset().getEvilCount();

    expect(goodCount + evilCount).toEqual(playerCount);
  });

  test('should assign roles', () => {
    const playersManager = new PlayersManager();
    const game           = new Game(playersManager);
    jest.spyOn(playersManager, 'assignRoles');

    _.times(5, (i) => game.addPlayer(new Player(i)));

    expect(playersManager.assignRoles).toBeCalledTimes(0);

    game.start();

    expect(playersManager.assignRoles).toBeCalledTimes(1);
  });

  test('should initialize quests', () => {
    const questsManager = new QuestsManager();
    const game          = new Game(new PlayersManager(), questsManager);
    jest.spyOn(questsManager, 'init');

    _.times(5, (i) => game.addPlayer(new Player(i)));

    expect(questsManager.init).toBeCalledTimes(0);

    game.start();

    expect(questsManager.init).toBeCalledTimes(1);
  });
});

describe('reveal roles', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('should reveal the roles', () => {
    const game = new Game();

    expect(game.getRolesAreRevealed()).toBeDefined();
    expect(game.getRolesAreRevealed()).toBeFalsy();

    game.revealRoles();

    expect(game.getRolesAreRevealed()).toBeTruthy();
  });

  test('should conceal roles after specified seconds', (done) => {
    const game = new Game();

    game.revealRoles(10);

    setTimeout(() => {
      expect(game.getRolesAreRevealed()).toBeFalsy();

      done();
    }, 11 * 1000);

    jest.runAllTimers();
  });

  test('should return a promise which will resolve after the roles are concealed', (done) => {
    const game = new Game();

    const p = game.revealRoles(10).then(() => {
      expect(game.getRolesAreRevealed()).toBeFalsy();

      done();
    });

    expect(p instanceof Promise).toBeTruthy();

    jest.runAllTimers();
  });

  test('should return the old promise if it hasn\'t resolved yet', () => {
    const game = new Game();

    const p1 = game.revealRoles(10);
    const p2 = game.revealRoles(10);

    expect(p1).toBe(p2);
  });

  test('should return a new promise if the old one has resolved', () => {
    const game = new Game();

    const p1 = game.revealRoles(10);

    jest.advanceTimersByTime(11 * 1000);

    const p2 = game.revealRoles(10);

    expect(p1).not.toBe(p2);
  });
});

describe('post starting phase', () => {
  let game;
  let playersManager;
  let questsManager;
  let leader;
  beforeEach(() => {
    playersManager = new PlayersManager();
    questsManager  = new QuestsManager();

    game = new Game(playersManager, questsManager);

    _.times(7, (i) => game.addPlayer(new Player(i)));

    game.start();
    game.revealRoles(10);
    jest.runAllTimers();

    leader = playersManager.getLeader();
  });

  describe('team proposal', () => {
    test('should throw when the team proposition is not allowed', () => {
      playersManager = new PlayersManager();
      questsManager  = new QuestsManager();

      const game = new Game(playersManager, questsManager);

      expect(() => game.toggleIsProposed(leader.getUsername(), 1))
        .toThrow(errors.NO_VOTING_TIME);

      _.times(7, (i) => game.addPlayer(new Player(i)));

      expect(() => game.toggleIsProposed(leader.getUsername(), 1))
        .toThrow(errors.NO_VOTING_TIME);

      game.start();

      expect(() => game.toggleIsProposed(leader.getUsername(), 1))
        .toThrow(errors.NO_VOTING_TIME);

      game.revealRoles(10);

      expect(() => game.toggleIsProposed(leader.getUsername(), 1))
        .toThrow(errors.NO_VOTING_TIME);

      jest.runAllTimers();

      _.times(
        questsManager.getCurrentQuest().getVotesNeeded(),
        (username) => game.toggleIsProposed(
          playersManager.getLeader().getUsername(),
          username
        )
      );

      game.submitTeam(playersManager.getLeader().getUsername());

      expect(() => game.toggleIsProposed(playersManager.getLeader().getUsername(), 1))
        .toThrow(errors.NO_VOTING_TIME);

      // TODO: add additional cases
    });

    test('should disallow anybody other then the party leader to propose a player', () => {
      const leader = playersManager.getLeader();

      expect(() => game.toggleIsProposed(leader.getUsername(), 3)).not.toThrow();

      const nonLeader = playersManager.getAll().find(player => !player.getIsLeader());
      expect(() => {
        game.toggleIsProposed(nonLeader.getUsername(), 3);
      }).toThrow(errors.NO_RIGHT_TO_PROPOSE);
    });

    test('should toggle whether a player is proposed or not', () => {
      const leader = playersManager.getLeader();

      jest.spyOn(playersManager, 'toggleIsProposed');

      game.toggleIsProposed(leader.getUsername(), 3);

      expect(playersManager.toggleIsProposed).toBeCalledTimes(1);
    });

    test('should disallow any further proposals once the team is submitted', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      expect(() => game.toggleIsProposed(leader.getUsername(), 2))
        .toThrow(errors.NO_VOTING_TIME);
    });
  });

  describe('team submission', () => {
    test('should disallow team submission by a non-leader player', () => {
      const nonLeaderUsername = playersManager.getAll().find(p => !p.getIsLeader());

      expect(() => game.submitTeam(nonLeaderUsername))
        .toThrow(errors.NO_RIGHT_TO_SUBMIT_TEAM);
    });

    test('should disallow submission if not enough players are proposed', () => {
      expect(() => game.submitTeam(leader.getUsername()))
        .toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

      game.toggleIsProposed(leader.getUsername(), 1);

      expect(() => game.submitTeam(leader.getUsername()))
        .toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

      game.toggleIsProposed(leader.getUsername(), 2);

      expect(game.submitTeam(leader.getUsername()));
    });

    test('should submit proposed players', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      expect(playersManager.getIsSubmitted()).toBeFalsy();

      game.submitTeam(leader.getUsername());

      expect(playersManager.getIsSubmitted()).toBeTruthy();
    });
  });

  describe('team voting', () => {
    // TODO: refactor
    test('should throw when team voting is not allowed', () => {
      const playersManger = new PlayersManager();
      const game          = new Game(playersManger);

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      _.times(7, (i) => game.addPlayer(new Player(i)));

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.start();

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.revealRoles(10);

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      jest.runAllTimers();

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.toggleIsProposed(playersManger.getLeader().getUsername(), 1);
      game.toggleIsProposed(playersManger.getLeader().getUsername(), 2);

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.submitTeam(playersManger.getLeader().getUsername());

      expect(() => game.voteForTeam(1, true)).not.toThrow(errors.NO_VOTING_TIME);

      // TODO: add additional cases
    });

    test('should only allow to vote when the team is submitted', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.submitTeam(leader.getUsername());

      expect(() => game.voteForTeam(1, false)).not.toThrow();
    });

    test('should only allow to vote to an existing player', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      expect(() => game.voteForTeam(3, true)).not.toThrow();
      expect(() => game.voteForTeam('nonexistent', true)).toThrow(errors.NO_RIGHT_TO_VOTE);
    });

    test('should only allow voting once', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      game.voteForTeam(1, true);

      expect(() => game.voteForTeam(1, true)).toThrow(errors.NO_RIGHT_TO_VOTE);
    });

    test('should persist the vote in quest history', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      jest.spyOn(questsManager, 'addVote');
      game.voteForTeam(1, true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes when the team voting was successful', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      jest.spyOn(questsManager, 'addVote');

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });

    test('should reset the votes even when the team got rejected', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      jest.spyOn(questsManager, 'addVote');

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), false));

      expect(playersManager.getAll()[0].getVote()).toBeFalsy();
    });
  });

  describe('quest voting', () => {
    // TODO: refactor
    test('should throw when quest voting is not allowed', () => {
      const playersManger = new PlayersManager();
      const game          = new Game(playersManger);

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      _.times(7, (i) => game.addPlayer(new Player(i)));

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.start();

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.revealRoles(10);

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      jest.runAllTimers();

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.toggleIsProposed(playersManger.getLeader().getUsername(), 1);
      game.toggleIsProposed(playersManger.getLeader().getUsername(), 2);

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      game.submitTeam(playersManger.getLeader().getUsername());

      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_VOTING_TIME);

      // TODO: add additional cases
    });

    test('should return whether quest voting is on', () => {
      expect(game.questVotingIsOn()).toBeFalsy();

      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);
      game.submitTeam(leader.getUsername());

      expect(game.questVotingIsOn()).toBeFalsy();

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));

      expect(game.questVotingIsOn()).toBeTruthy();
    });

    test('should only allow a proposed player to vote on a quest', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));

      expect(() => game.voteForQuest(1, true)).not.toThrow();
      expect(() => game.voteForQuest(4, true)).toThrow(errors.NO_RIGHT_TO_VOTE);
      expect(() => game.voteForQuest('nonexistent', true)).toThrow(errors.NO_RIGHT_TO_VOTE);
    });

    test('should only allow a player to vote on a quest once', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));

      game.voteForQuest(1, true);
      expect(() => game.voteForQuest(1, true)).toThrow(errors.NO_RIGHT_TO_VOTE);
    });

    test('should persist the vote in the quest history', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));

      jest.spyOn(questsManager, 'addVote');

      game.voteForQuest(1, true);

      expect(questsManager.addVote).toBeCalledTimes(1);
    });

    test('should reset the votes after every proposed player has voted', () => {
      game.toggleIsProposed(leader.getUsername(), 1);
      game.toggleIsProposed(leader.getUsername(), 2);

      game.submitTeam(leader.getUsername());

      playersManager.getAll().forEach(p => game.voteForTeam(p.getUsername(), true));
      playersManager.getProposedPlayers().forEach(p => game.voteForQuest(p.getUsername(), true));

      const playersWhoVotedCount = playersManager.getAll().filter(p => p.getVote()).length;

      expect(playersWhoVotedCount).toStrictEqual(0);
    });
  });
});

test('should set creation date', () => {
  const game = new Game();

  expect(game.getCreatedAt() instanceof Date).toStrictEqual(true);
});

test('should mark the game as finished', () => {
  const game = new Game();

  expect(game.getFinishedAt()).toBeDefined();
  expect(game.getFinishedAt()).toBeFalsy();

  game.finish();

  expect(game.getFinishedAt() instanceof Date).toStrictEqual(true);
});

test('should be assigned a unique id', () => {
  const game1 = new Game();
  const game2 = new Game();

  expect(game1.getId()).not.toEqual(game2.getId());
});

test('should not add a player when the game is started', () => {
  const game = new Game();

  _.times(5, (i) => game.addPlayer(new Player(i)));

  game.start();

  expect(() => game.addPlayer(new Player(6))).toThrow(errors.GAME_ALREADY_STARTED);
});
