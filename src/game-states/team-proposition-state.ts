import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { QuestVotingState } from './quest-voting-state';
import { TeamVotingState } from './team-voting-state';

export class TeamPropositionState extends BaseState {
  toggleTeammateProposition(game: Game, leaderUsername: string, username: string) {
    if (!game.playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeammatePropositionError();
    }

    game.playersManager.togglePlayerProposition(username);
  }

  // TODO: add state freeze
  submitTeam(game: Game, leaderUsername: string) {
    if (!game.playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeamSubmissionError();
    }

    if (this.playerAmountIsIncorrect(game)) {
      throw new fromErrors.RequiredCorrectTeammatesAmountError();
    }

    game.playersManager.setIsSubmitted(true);

    if (game.questsManager.isLastRoundOfTeamVoting()) {
      game.state = new TeamVotingState();

      this.approveAllVotes(game);

      game.state = new QuestVotingState();
    } else {
      game.state = new TeamVotingState();
    }
  }

  private playerAmountIsIncorrect(game: Game) {
    const proposedPlayersCount = game.playersManager.getProposedPlayers().length;
    const votesNeededCount     = game.questsManager.getCurrentQuest().getVotesNeeded();

    return proposedPlayersCount !== votesNeededCount;
  }

  private approveAllVotes(game: Game) {
    game.playersManager
      .getAll()
      .forEach((player) => game.voteForTeam(player.getUsername(), true));
  }
}
