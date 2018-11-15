const errors      = require('../src/errors');
const LevelPreset = require('../src/level-preset');

test('should throw if the specified number of players is incorrect', () => {
  expect(() => new LevelPreset(100))
    .toThrow(errors.PlayersAmountIncorrectError);
});

test('should create a level preset for specified number of players', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getGoodCount() + levelPreset.getEvilCount()).toEqual(7);
});

test('should get quests', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getQuestsConfig()).toBeTruthy();
  expect(levelPreset.getQuestsConfig().length).toBeTruthy();
});

test('should get total number of players', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getPlayerCount()).toEqual(7);
});

test('should be serialized', () => {
  const levelPreset = new LevelPreset(7);

  const expected = {
    goodCount: levelPreset.getGoodCount(),
    evilCount: levelPreset.getEvilCount()
  };

  const actual = levelPreset.serialize();

  expect(expected).toEqual(actual);
});
