import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './finite-state-machine';

export class QuestVotingState extends BaseState {
  voteForQuest(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, username, voteValue);

    // TODO: add state freezing
    if (!this.questVotingIsOn(game)) {

      // TODO: refactor
      if (game.getQuestsManager().getStatus() === 0) {
        game.getFsm().go(GameState.Finish);
      }

      else if (game.getQuestsManager().assassinationAllowed()) {
        game.getFsm().go(GameState.Assassination);
      }

      else {
        game.getFsm().go(GameState.TeamProposition);
      }
    }
  }

  // TODO: dedupe
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
