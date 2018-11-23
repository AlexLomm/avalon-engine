import { GameMetaData } from '../src/game-meta-data';
import { LevelPreset } from '../src/level-preset';
import { Player } from '../src/player';

test('should have an id and creation date set upon initialization', () => {
  const gameMeta = new GameMetaData();

  const serializedMeta = gameMeta.serialize();

  expect(serializedMeta.id).toBeTruthy();
  expect(serializedMeta.createdAt).toBeTruthy();
  expect(serializedMeta.levelPreset).toBeTruthy();

  expect(gameMeta.serialize());
});

test('should set a creator once', () => {
  const gameMeta = new GameMetaData();

  expect(gameMeta.serialize().gameCreator).toBeFalsy();

  gameMeta.setCreatorOnce(new Player('user-1'));
  gameMeta.setCreatorOnce(new Player('user-2'));

  expect(gameMeta.serialize().gameCreator).toStrictEqual('user-1');
});

test('should set an appropriate level preset', () => {
  const gameMeta = new GameMetaData();

  const preset = gameMeta.init(5);

  expect(preset.serialize()).toEqual(new LevelPreset(5).serialize());
});

test('should contain a serialized level preset', () => {
  const gameMeta = new GameMetaData();

  gameMeta.init(5);

  expect(gameMeta.serialize().levelPreset).toEqual(new LevelPreset(5).serialize());
});

test('should have a starting date set', () => {
  const gameMeta = new GameMetaData();

  gameMeta.init(5);

  expect(gameMeta.serialize().startedAt).toBeTruthy();
});

test('should have a finish date set', () => {
  const gameMeta = new GameMetaData();

  gameMeta.finish();

  expect(gameMeta.serialize().finishedAt).toBeTruthy();
});
