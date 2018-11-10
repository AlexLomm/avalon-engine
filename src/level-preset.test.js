const errors      = require('./errors');
const LevelPreset = require('./level-preset');

test('should throw if the specified number of players is incorrect', () => {
  expect(() => new LevelPreset(100))
    .toThrow(errors.INCORRECT_NUMBER_OF_PLAYERS);
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
