const _         = require('lodash');
const Game      = require('../src/game');
const GameState = require('../src/game-state');

test('should make a deep copy of an object', () => {
  const game = new Game();

  const obj = {nestedObject: {test: 'test'}};
  game.obj  = obj;

  const gameState = new GameState(game);

  expect(gameState.get().obj).not.toBe(obj);
  expect(gameState.get().obj.nestedObject).not.toBe(obj.nestedObject);
});

test('should be a plain object', () => {
  const game = new Game();

  const gameState = new GameState(game);

  expect(_.isPlainObject(gameState.get())).toBeTruthy();
});

test('should recursively omit the "function" properties', () => {
  const game = new Game();

  game.obj = {test: 'test', obj: {obj: {func: () => {}}}};

  const gameState = new GameState(game);

  expect(_.isEqual(gameState.get().obj, {test: 'test', obj: {obj: {}}})).toStrictEqual(true);
});

test('should recursively omit the "Promise" properties', () => {
  const game = new Game();

  game.obj = {test: 'test', promise: new Promise(() => {})};

  const gameState = new GameState(game);

  expect(_.isEqual(gameState.get().obj, {test: 'test'})).toStrictEqual(true);
});

test('should recursively trim the keys with prefixes', () => {
  const game = new Game();

  game.obj = {_test: {_test: {_test: 'test'}}};

  const gameState = new GameState(game);

  expect(_.isEqual(gameState.get().obj, {test: {test: {test: 'test'}}})).toStrictEqual(true);
});
