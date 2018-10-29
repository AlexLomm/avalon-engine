const _              = require('lodash');
const errors         = require('./errors');
const LevelPreset    = require('./level-preset');
const PlayersManager = require('./players-manager');
const Player         = require('./player');

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

test('should not accept a "falsy" argument', () => {
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

  _.times(10, (i) => manager.add(new Player(i)));

  expect(() => {
    manager.add(new Player(11));
  }).toThrow(errors.MAXIMUM_PLAYERS_REACHED);
});

test('should make the first player a manager creator', () => {
  const manager = new PlayersManager();

  manager.add(new Player('username-1'));
  manager.add(new Player('username-2'));

  expect(manager.getGameCreator().getUsername()).toEqual('username-1');
});

test('should set and get chosen players', () => {
  const manager = new PlayersManager();

  manager.add(new Player('user-1'));
  manager.add(new Player('user-2'));

  manager.toggleIsChosen(null);

  expect(manager.getChosenPlayers().length).toBeFalsy();

  manager.toggleIsChosen('user-2');

  expect(manager.getChosenPlayers().pop().getUsername()).toEqual('user-2');
});

test('should mark players as submitted', () => {
  const manager = new PlayersManager();

  _.times(7, (i) => manager.add(new Player(i)));

  expect(manager.getIsSubmitted()).toStrictEqual(false);

  expect(manager.markAsSubmitted());

  expect(manager.getIsSubmitted()).toStrictEqual(true);

  expect(manager.unmarkAsSubmitted());

  expect(manager.getIsSubmitted()).toStrictEqual(false);
});

test('should assign every player a role', () => {
  const manager = new PlayersManager();

  _.times(8, (i) => manager.add(new Player(i)));

  manager.assignRoles(new LevelPreset(manager.getAll().length));

  const roles = manager.getAll()
    .filter(p => !!p.getRole())
    .map(p => p.getRole());

  expect(roles.length).toEqual(8);
});

test('should choose a team leader', () => {
  const manager = new PlayersManager();

  _.times(8, (i) => manager.add(new Player(i)));

  expect(manager.getLeader()).toBeFalsy();

  manager.assignRoles(new LevelPreset(manager.getAll().length));

  expect(manager.getLeader()).toBeTruthy();
});

test('should always have default roles', () => {
  const manager = new PlayersManager();

  _.times(7, (i) => manager.add(new Player(i)));

  manager.assignRoles(new LevelPreset(manager.getAll().length), {
    MERLIN: false,
    ASSASSIN: false,
  });

  expect(manager.getAll().find(p => p.getRole().getId() === 'MERLIN')).toBeTruthy();
  expect(manager.getAll().find(p => p.getRole().getId() === 'ASSASSIN')).toBeTruthy();
});

test('should have unique roles', () => {
  const manager = new PlayersManager();

  _.times(10, (i) => manager.add(new Player(i)));

  manager.assignRoles(new LevelPreset(manager.getAll().length));

  const roleIds = manager.getAll().map(p => p.getRole().getId());

  expect(_.uniqBy(roleIds, v => v).length).toEqual(roleIds.length);
});

test('should have a correct number of good and evil players', () => {
  for (let j = 5; j < 10; j++) {
    const manager = new PlayersManager();

    _.times(j, (i) => manager.add(new Player(i)));

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

test('should preserve a creator after manager is started', () => {
  const manager = new PlayersManager();

  _.times(7, (i) => manager.add(new Player(i)));

  const gameCreator = manager.getGameCreator();

  manager.assignRoles(new LevelPreset(manager.getAll().length));

  expect(manager.getGameCreator()).toBe(gameCreator);
});

test('should choose a team leader', () => {
  const manager = new PlayersManager();

  _.times(5, (i) => manager.add(new Player(i)));

  expect(manager.getLeader()).toBeFalsy();

  manager.nextLeader();

  expect(manager.getLeader()).toBeTruthy();
});

test('should choose a new leader that is located next to the old leader', () => {
  const manager = new PlayersManager();

  _.times(7, (i) => manager.add(new Player(i)));

  manager.nextLeader();
  const oldLeaderIndex = manager.getAll()
    .findIndex(p => p === manager.getLeader());

  manager.nextLeader();
  const newLeaderIndex = manager.getAll()
    .findIndex(p => p === manager.getLeader());

  expect(newLeaderIndex).toEqual((oldLeaderIndex + 1) % manager.getAll().length);
});
