import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './game-state-machine';
import { GameStatus } from '../quests-manager';

export class QuestVotingState extends BaseState {
  protected resultsConcealed = true;

  voteForQuest(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, username, voteValue);

    if (!this.questVotingIsOn(game)) {
      if (game.getQuestsManager().getGameStatus() === GameStatus.Lost) {
        return game.getFsm().transitionTo(GameState.Finish);
      }

      if (game.getQuestsManager().assassinationAllowed()) {
        return game.getFsm().transitionTo(GameState.Assassination);
      }

      return game.getFsm().transitionTo(GameState.TeamProposition);
    }

    return Promise.resolve();
  }

  // TODO: dry up
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(username, voteValue);

    game.getQuestsManager().addVote(vote);
  }

  // TODO: rename
  private questVotingIsOn(game: Game) {
    return game.getPlayersManager().getIsSubmitted()
      && game.getQuestsManager().getCurrentQuest().questVotingAllowed();
  }
}
