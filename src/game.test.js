const _      = require('lodash');
const errors = require('./errors');
const Game   = require('./game.js');
const Player = require('./player');
const Quest  = require('./quest');

describe('game start', () => {
  test('should not start the game if players\' count is incorrect', () => {
    const game = new Game();

    expect(() => {
      game.start();
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

    expect(() => {
      game.start();

      _.times(4, (i) => game.addPlayer(new Player(i)));
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

    expect(() => {
      game.start();

      _.times(11, (i) => game.addPlayer(new Player(i)));
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);
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
    const game = new Game();

    _.times(8, (i) => game.addPlayer(new Player(i)));

    expect(game.getLevelPreset()).toBeDefined();
    expect(game.getLevelPreset()).toBeFalsy();

    game.start();

    const levelPreset = game.getLevelPreset();
    expect(levelPreset.getGoodCount() + levelPreset.getEvilCount()).toEqual(8);
  });

  test('should initialize quests', () => {
    const game = new Game();

    expect(game.getQuests().length).toBeFalsy();

    _.times(5, (i) => game.addPlayer(new Player(i)));

    game.start();

    expect(game.getQuests().length).toEqual(5);
    expect(game.getQuests()[0] instanceof Quest).toBeTruthy();
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

test('should know if it is time to vote for team', () => {
  const game = new Game();

  expect(game.isTimeToVoteForTeam()).toBeFalsy();

  _.times(7, (i) => game.addPlayer(new Player(i)));

  game.start();
  game.revealRoles(10);

  expect(game.isTimeToVoteForTeam()).toBeFalsy();

  jest.runAllTimers();

  expect(game.isTimeToVoteForTeam()).toBeFalsy();

  // TODO: add logic
});

test('should not add a player when the game is started', () => {
  const game = new Game();

  _.times(5, (i) => game.addPlayer(new Player(i)));

  game.start();

  expect(() => {
    game.addPlayer(new Player(6));
  }).toThrow(errors.GAME_ALREADY_STARTED);
});
