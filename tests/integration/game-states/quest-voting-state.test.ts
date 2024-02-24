import { Game } from '../../../src/game';
import { QuestVotingState } from '../../../src/game-states/quest-voting-state';
import { PlayerManager } from '../../../src/player-manager';
import { QuestManager } from '../../../src/quest-manager';
import { GameEvent } from '../../../src/enums/game-event';

jest.mock('../../../src/player-manager');
jest.mock('../../../src/quest-manager');

test('should emit an event upon adding a player', () => {
  const playersManager = new PlayerManager();
  playersManager.questVotingAllowedFor = jest
    .fn()
    .mockImplementation(() => true);
  playersManager.getIsSubmitted = jest.fn().mockImplementation(() => true);

  const questsManager = new QuestManager();
  questsManager.questVotingAllowed = jest.fn().mockImplementation(() => true);

  const game = new Game(playersManager, questsManager);
  const state = new QuestVotingState();

  jest.spyOn(game, 'emit');

  state.voteForQuest(game, 'user-1', true);

  expect(game.emit).toHaveBeenCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
