import { Game } from '../../../src/game';
import { AssassinationState } from '../../../src/game-states/assassination-state';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/players-manager');

test('should emit an event upon assassination', () => {
  const game = new Game();

  const state = new AssassinationState();

  jest.spyOn(game, 'emit');

  state.toggleVictimProposition(game, 'user-1', 'user-2');

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
