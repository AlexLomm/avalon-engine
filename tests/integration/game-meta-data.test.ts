import { GameMetaData } from '../../src/game-meta-data';
import { LevelPreset } from '../../src/level-preset';
import { Player } from '../../src/player';
import { GameStatus } from '../../src/enums/game-status';

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

  expect(gameMeta.serialize().creatorId).toBeFalsy();

  gameMeta.setCreatorOnce(new Player('user-1'));
  gameMeta.setCreatorOnce(new Player('user-2'));

  expect(gameMeta.serialize().creatorId).toStrictEqual('user-1');
});

test('should set an appropriate level preset', () => {
  const gameMeta = new GameMetaData();

  const preset = gameMeta.init(5);

  expect(preset.serialize()).toEqual(new LevelPreset(5).serialize());
});

test('should contain a serialized level preset', () => {
  const gameMeta = new GameMetaData();

  gameMeta.init(5);

  expect(gameMeta.serialize().levelPreset).toEqual(
    new LevelPreset(5).serialize(),
  );
});

test('should have a starting date set', () => {
  const gameMeta = new GameMetaData();

  gameMeta.init(5);

  expect(gameMeta.serialize().startedAt).toBeTruthy();
});

test('should have a finish date set', () => {
  const gameMeta = new GameMetaData();

  gameMeta.finish(GameStatus.Lost);

  expect(gameMeta.serialize().finishedAt).toBeTruthy();
});

test('should contain the expected keys', () => {
  const gameMeta = new GameMetaData();

  const expected = [
    'id',
    'createdAt',
    'levelPreset',
    'status',
    'creatorId',
    'startedAt',
    'finishedAt',
  ].sort();

  const actual = Object.keys(gameMeta.serialize()).sort();

  expect(expected).toEqual(actual);
});

test('should have the game status set as "Unfinished" by default', () => {
  const gameMeta = new GameMetaData();

  expect(gameMeta.serialize().status).toEqual('Unfinished');
});

test('should set the game status to "Won"', () => {
  const gameMeta = new GameMetaData();

  gameMeta.finish(GameStatus.Won);

  expect(gameMeta.getGameStatus()).toEqual(GameStatus.Won);
});

test('should set the game status to "Lost"', () => {
  const gameMeta = new GameMetaData();

  gameMeta.finish(GameStatus.Lost);

  expect(gameMeta.getGameStatus()).toEqual(GameStatus.Lost);
});
