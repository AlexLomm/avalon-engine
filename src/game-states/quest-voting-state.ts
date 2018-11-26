import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState, GameEvent } from './game-state-machine';

export class QuestVotingState extends BaseState {
  protected resultsConcealed = true;

  voteForQuest(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, username, voteValue);

    if (!this.questVotingIsOn(game)) {
      const manager = game.getQuestsManager();

      if (manager.getFailedQuestsCount() >= 3) {
        game.getFsm().transitionTo(GameState.GameLost);

        return;
      }

      if (manager.getSucceededQuestsCount() >= 3) {
        game.getFsm().transitionTo(GameState.Assassination);

        return;
      }

      game.getFsm().transitionTo(GameState.TeamProposition);

      return;
    }

    game.emit(GameEvent.StateChange);
  }

  // TODO: dry up
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(username, voteValue);

    game.getQuestsManager().addVote(vote);
  }

  // TODO: rename
  private questVotingIsOn(game: Game) {
    return game.getPlayersManager().getIsSubmitted()
      && game.getQuestsManager().questVotingAllowed();
  }
}
