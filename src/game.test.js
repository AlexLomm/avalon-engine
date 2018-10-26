const _      = require('lodash');
const errors = require('./errors');
const Game   = require('./game.js');
const Player = require('./player');
const Quest  = require('./quest');

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

  test('should make the first player a creator', () => {
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

  test('should preserve a creator after game is started', () => {
    const game = new Game();

    _.times(7, (i) => game.addPlayer(new Player(i)));

    const gameCreator = game.getCreator();

    game.start();

    expect(game.getCreator()).toBe(gameCreator);
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

describe('choosing players', () => {
  test('should set and get chosen players', () => {
    const game = new Game();

    game.addPlayer(new Player('user-1'));
    game.addPlayer(new Player('user-2'));

    expect(game.getChosenPlayers().length).toBeFalsy();

    game.toggleIsChosen('user-2');

    expect(game.getChosenPlayers().pop().getUsername()).toEqual('user-2');
  });

  test('should not submit in an inappropriate time', () => {
    const game = new Game();

    _.times(7, (i) => game.addPlayer(new Player(i)));

    expect(() => game.submitPlayers()).toThrow(errors.GAME_NOT_STARTED);

    game.start();

    expect(() => game.submitPlayers()).toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);

    // TODO: add cases
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
