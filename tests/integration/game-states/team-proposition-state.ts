import { Game } from '../../../src/game';
import { PlayerManager } from '../../../src/player-manager';
import { TeamPropositionState } from '../../../src/game-states/team-proposition-state';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/player-manager');

test('should emit an event upon team proposition', () => {
  const playersManager = new PlayerManager();
  playersManager.playerPropositionAllowedFor = jest
    .fn()
    .mockImplementation(() => true);

  const game = new Game(playersManager);
  const state = new TeamPropositionState();

  jest.spyOn(game, 'emit');

  state.toggleTeammateProposition(game, 'user-1', 'user-2');

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
