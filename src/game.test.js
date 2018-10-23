const errors = require('./errors');
const Game   = require('./game.js');
const Player = require('./player');

describe('adding players', () => {
  test('should add a player', () => {
    const game = new Game();

    expect(game._players.length).toBeFalsy();

    game.addPlayer(new Player());

    expect(game._players.length).toBeTruthy();
  });

  test('should check that player is not falsy', () => {
    const game = new Game();

    const playersLength = game._players.length;

    game.addPlayer(null);

    expect(game._players.length).toStrictEqual(playersLength);
  });

  test('should prevent adding a new player with the same username', () => {
    const game = new Game();

    game.addPlayer(new Player('some-username'));

    expect(() => {
      game.addPlayer(new Player('some-username'));
    }).toThrow(errors.USERNAME_ALREADY_EXISTS);
  });

  test('should not add a player when the game is started', () => {
    const game = new Game();

    [1, 2, 3, 4, 5].forEach(i => game.addPlayer(new Player(i)));

    game.start();

    expect(() => {
      game.addPlayer(new Player(6));
    }).toThrow(errors.GAME_ALREADY_STARTED);
  });

  test('should prevent adding more than 10 players', () => {
    const game = new Game();

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .forEach((username) => game.addPlayer(new Player(username)));

    expect(() => {
      game.addPlayer(new Player());
    }).toThrow(errors.MAXIMUM_PLAYERS_REACHED);
  });

  test('should make the first player creator', () => {
    const game = new Game();

    game.addPlayer(new Player('username-1'));
    game.addPlayer(new Player('username-2'));

    expect(game.getCreator().getUsername()).toEqual('username-1');
  });
});

describe('game start', () => {
  test('should not start the game if players\' count is incorrect', () => {
    const game = new Game();

    expect(() => {
      game.start();
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

    expect(() => {
      game.start();

      [1, 2, 3, 4].forEach(() => game.addPlayer(new Player()));
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

    expect(() => {
      game.start();

      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(() => game.addPlayer(new Player()));
    }).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);
  });

  test('should mark the game as started', () => {
    const game = new Game();

    game._players = [1, 2, 3, 4, 5];

    expect(game.getStartedAt()).toBeDefined();
    expect(game.getStartedAt()).toBeFalsy();

    game.start();

    expect(game.getStartedAt() instanceof Date).toStrictEqual(true);
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
