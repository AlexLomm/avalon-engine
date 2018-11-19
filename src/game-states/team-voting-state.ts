import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { FrozenState } from './frozen-state';
import { QuestVotingState } from './quest-voting-state';
import { TeamPropositionState } from './team-proposition-state';

export class TeamVotingState extends BaseState {
  voteForTeam(game: Game, username: string, voteValue: boolean) {
    if (!game.playersManager.teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, username, voteValue);

    // TODO: refactor
    if (game.questsManager.teamVotingSucceeded()) {
      this.transitionToQuestVotingState(game);
    } else if (game.questsManager.teamVotingRoundFinished()) {
      this.transitionToPropositionState(game);
    }
  }

  // TODO: implement as a transition
  private transitionToQuestVotingState(game: Game) {
    game.state = new FrozenState();

    //setTimeout(() => {
      game.playersManager.resetVotes();

      game.state = new QuestVotingState();
    //}, 5000);
  }

  // TODO: implement as a transition
  private transitionToPropositionState(game: Game) {
    game.state = new FrozenState();

    //setTimeout(() => {
      this.resetFlags(game);

      game.state = new TeamPropositionState();
    //}, 5000);
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
