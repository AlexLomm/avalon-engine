import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './finite-state-machine';

export class QuestVotingState extends BaseState {
  voteForQuest(game: Game, username: string, voteValue: boolean) {
    if (!game.playersManager.questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, username, voteValue);

    // TODO: add state freezing
    if (!this.questVotingIsOn(game)) {

      // TODO: refactor
      if (game.questsManager.getStatus() === 0) {
        game.fsm.go(GameState.Finish);
      }

      else if (game.questsManager.assassinationAllowed()) {
        game.fsm.go(GameState.Assassination);
      }

      else {
        game.fsm.go(GameState.TeamProposition);
      }
    }
  }

  // TODO: dedupe
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.playersManager.generateVote(username, voteValue);

    game.questsManager.addVote(vote);
  }

  // TODO: rename
  private questVotingIsOn(game: Game) {
    return game.playersManager.getIsSubmitted()
      && game.questsManager.getCurrentQuest().questVotingAllowed();
  }
}
