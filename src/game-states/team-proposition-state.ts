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

    const proposedPlayersCount = game.playersManager.getProposedPlayers().length;
    const votesNeededCount     = game.questsManager.getCurrentQuest().getVotesNeeded();

    if (proposedPlayersCount !== votesNeededCount) {
      throw new fromErrors.RequiredCorrectTeammatesAmountError();
    }

    game.playersManager.setIsSubmitted(true);

    if (game.questsManager.isLastRoundOfTeamVoting()) {
      game.state = new TeamVotingState();

      game.playersManager
        .getAll()
        .forEach((player) => game.voteForTeam(player.getUsername(), true));

      game.state = new QuestVotingState();

      return;
    } else {
      game.state = new TeamVotingState();
    }
  }
}
