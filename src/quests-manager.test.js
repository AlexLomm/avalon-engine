const QuestsManager = require('./quests-manager');
const Quest         = require('./quest');
const LevelPreset   = require('./level-preset');

test('should initialize quests', () => {
  const manager = new QuestsManager();

  expect(manager.getAll().length).toBeFalsy();

  manager.init(new LevelPreset(5));

  expect(manager.getAll().length).toEqual(5);
  expect(manager.getAll()[0] instanceof Quest).toBeTruthy();
});
