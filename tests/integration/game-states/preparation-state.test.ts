import { Game } from '../../../src/game';
import { PreparationState } from '../../../src/game-states/preparation-state';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/players-manager');
jest.mock('../../../src/game-meta-data');

test('should emit an event upon adding a player', () => {
  const game = new Game();

  const state = new PreparationState();

  jest.spyOn(game, 'emit');

  state.addPlayer(game, 'user-1');

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});

test('should emit an event upon removing a player', () => {
  const game = new Game();

  const state = new PreparationState();

  state.addPlayer(game, 'user-1');

  jest.spyOn(game, 'emit');

  state.removePlayer(game, 'user-1');

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
