import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from '../enums/game-state';
import { GameEvent } from '../enums/game-event';

export class QuestVotingState extends BaseState {
  protected resultsConcealed = true;
  protected rolesConcealed = true;

  voteForQuest(game: Game, id: string, voteValue: boolean) {
    if (!game.getPlayersManager().questVotingAllowedFor(id)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, id, voteValue);

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
  private vote(game: Game, id: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(id, voteValue);

    game.getQuestsManager().addVote(vote);
  }

  // TODO: rename
  private questVotingIsOn(game: Game) {
    return (
      game.getPlayersManager().getIsSubmitted() &&
      game.getQuestsManager().questVotingAllowed()
    );
  }
}
