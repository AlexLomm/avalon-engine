import { Game } from '../../../src/game';
import { PlayersManager } from '../../../src/players-manager';
import { TeamVotingState } from '../../../src/game-states/team-voting-state';
import { QuestsManager } from '../../../src/quests-manager';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/players-manager');
jest.mock('../../../src/quests-manager');

test('should emit an event upon team proposition', () => {
  const playersManager = new PlayersManager();
  playersManager.teamVotingAllowedFor = jest
    .fn()
    .mockImplementation(() => true);

  const game = new Game(playersManager, new QuestsManager());
  const state = new TeamVotingState();

  jest.spyOn(game, 'emit');

  state.voteForTeam(game, 'user-1', true);

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
