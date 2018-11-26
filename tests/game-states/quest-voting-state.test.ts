import { Game } from '../../src/game';
import { GameEvent } from '../../src/game-states/game-state-machine';
import { QuestVotingState } from '../../src/game-states/quest-voting-state';
import { PlayersManager } from '../../src/players-manager';
import { QuestsManager } from '../../src/quests-manager';

jest.mock('../../src/players-manager');
jest.mock('../../src/quests-manager');

test('should emit an event upon adding a player', () => {
  const playersManager                 = new PlayersManager();
  playersManager.questVotingAllowedFor = jest.fn().mockImplementation(() => true);
  playersManager.getIsSubmitted        = jest.fn().mockImplementation(() => true);

  const questsManager              = new QuestsManager();
  questsManager.questVotingAllowed = jest.fn().mockImplementation(() => true);

  const game  = new Game(playersManager, questsManager);
  const state = new QuestVotingState();

  jest.spyOn(game, 'emit');

  state.voteForQuest(game, 'user-1', true);

  expect(game.emit).toBeCalledTimes(1);
  expect(game.emit).toBeCalledWith(GameEvent.StateChange);
});
