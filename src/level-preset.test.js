const LevelPreset = require('./level-preset');

test('should create a level preset for specified number of players', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getGoodCount() + levelPreset.getEvilCount()).toEqual(7);
});

test('should get quests', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getQuests()).toBeTruthy();
  expect(levelPreset.getQuests().length).toBeTruthy();
});

test('should get total number of players', () => {
  const levelPreset = new LevelPreset(7);

  expect(levelPreset.getPlayerCount()).toEqual(7);
});
