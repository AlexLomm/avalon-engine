import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { AssassinationState } from './assassination-state';
import { FrozenState } from './frozen-state';
import { TeamPropositionState } from './team-proposition-state';

export class QuestVotingState extends BaseState {
  voteForQuest(game: Game, username: string, voteValue: boolean) {
    if (!game.playersManager.questVotingAllowedFor(username)) {
      throw new fromErrors.DeniedQuestVotingError();
    }

    this.vote(game, username, voteValue);

    // TODO: add state freezing
    if (!game.questVotingIsOn()) {
      // TODO: refactor
      if (game.questsManager.getStatus() === 0) {
        game.state = new FrozenState();
      } else if (game.assassinationIsOn()) {
        this.resetFlags(game);

        game.state = new AssassinationState();
      } else {
        game.state = new FrozenState();

        //setTimeout(() => {
          this.resetFlags(game);

          game.questsManager.nextQuest();

          game.state = new TeamPropositionState();
        //}, 5000);
      }
    }
  }

  // TODO: dedupe
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.playersManager.generateVote(username, voteValue);

    game.questsManager.addVote(vote);
  }

  // TODO: dedupe
  private resetFlags(game: Game) {
    game.playersManager.resetVotes();
    game.playersManager.resetPropositions();
    game.playersManager.setIsSubmitted(false);
  }
}
