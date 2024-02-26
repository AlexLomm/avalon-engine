import * as fromErrors from '../../src/errors';
import { LevelPreset } from '../../src/level-preset';

test('should throw if the specified number of players is incorrect', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(() => new LevelPreset(100 as any)).toThrow(
    fromErrors.PlayersAmountIncorrectError,
  );
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
    evilCount: levelPreset.getEvilCount(),
  };

  const actual = levelPreset.serialize();

  expect(expected).toEqual(actual);
});

test('should return a null object if called with -1 parameter', () => {
  expect(() => new LevelPreset(-1)).not.toThrow();

  const levelPreset = new LevelPreset(-1);

  expect(levelPreset.getGoodCount()).toStrictEqual(null);
  expect(levelPreset.getEvilCount()).toStrictEqual(null);
  expect(levelPreset.getQuestsConfig()).toStrictEqual([
    null,
    null,
    null,
    null,
    null,
  ]);
});

test('should return a null object', () => {
  expect(LevelPreset.null()).toEqual(new LevelPreset(-1));
});
