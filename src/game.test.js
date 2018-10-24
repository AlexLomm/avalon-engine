const _      = require('lodash');
const errors = require('./errors');
const Game   = require('./game.js');
const Player = require('./player');

describe('working with players', () => {
  test('should add a player', () => {
    const game = new Game();

    expect(game.getPlayers().length).toBeFalsy();

    game.addPlayer(new Player());

    expect(game.getPlayers().length).toBeTruthy();
  });

  test('should get players', () => {
    const game = new Game();

    game.addPlayer(new Player('user-1'));
    game.addPlayer(new Player('user-2'));

    expect(game.getPlayers().length).toEqual(2);
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

    _.times(5, (i) => game.addPlayer(new Player(i)));

    game.start();

    expect(() => {
      game.addPlayer(new Player(6));
    }).toThrow(errors.GAME_ALREADY_STARTED);
  });

  test('should prevent adding more than 10 players', () => {
    const game = new Game();

    _.times(10, (i) => game.addPlayer(new Player(i)));

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

  test('should assign every player a role', () => {
    const game = new Game();

    _.times(8, (i) => game.addPlayer(new Player(i)));

    game.start();

    const roles = game.getPlayers()
                      .filter(p => !!p.getRole())
                      .map(p => p.getRole());

    expect(roles.length).toEqual(8);
  });

  test('should always have default roles', () => {
    const game = new Game();

    _.times(7, (i) => game.addPlayer(new Player(i)));

    game.start({
      MERLIN: false,
      ASSASSIN: false,
    });

    expect(game.getPlayers().find(p => p.getRole().getId() === 'MERLIN')).toBeTruthy();
    expect(game.getPlayers().find(p => p.getRole().getId() === 'ASSASSIN')).toBeTruthy();
  });

  test('should have unique roles', () => {
    const game = new Game();

    _.times(10, (i) => game.addPlayer(new Player(i)));

    game.start();

    const roleIds = game.getPlayers().map(p => p.getRole().getId());

    expect(_.uniqBy(roleIds, v => v).length).toEqual(roleIds.length);
  });

  test('should have a correct number of good and evil players', () => {
    for (let j = 5; j < 10; j++) {
      const game = new Game();

      _.times(j, (i) => game.addPlayer(new Player(i)));

      game.start();

      let goodCount = 0;
      let evilCount = 0;
      game.getPlayers().forEach(p => {
        const loyalty = p.getRole().getLoyalty();

        loyalty === 'GOOD' ? goodCount++ : evilCount++;
      });

      expect(game.getLevelPreset().getGoodCount()).toEqual(goodCount);
      expect(game.getLevelPreset().getEvilCount()).toEqual(evilCount);
    }
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
