import { Game } from '../../../src/game';
import { PlayerManager } from '../../../src/player-manager';
import { TeamVotingState } from '../../../src/game-states/team-voting-state';
import { QuestManager } from '../../../src/quest-manager';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/player-manager');
jest.mock('../../../src/quest-manager');

test('should emit an event upon team proposition', () => {
  const playersManager = new PlayerManager();
  playersManager.teamVotingAllowedFor = jest
    .fn()
    .mockImplementation(() => true);

  const game = new Game(playersManager, new QuestManager());
  const state = new TeamVotingState();

  jest.spyOn(game, 'emit');

  state.voteForTeam(game, 'user-1', true);

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
