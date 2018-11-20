import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './finite-state-machine';

export class TeamPropositionState extends BaseState {
  toggleTeammateProposition(game: Game, leaderUsername: string, username: string) {
    if (!game.playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeammatePropositionError();
    }

    game.playersManager.togglePlayerProposition(username);
  }

  submitTeam(game: Game, leaderUsername: string) {
    if (!game.playersManager.playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeamSubmissionError();
    }

    if (this.playerAmountIsIncorrect(game)) {
      throw new fromErrors.RequiredCorrectTeammatesAmountError();
    }

    game.questsManager.isLastRoundOfTeamVoting()
      ? game.fsm.go(GameState.TeamVotingPreApproved)
      : game.fsm.go(GameState.TeamVoting);
  }

  private playerAmountIsIncorrect(game: Game) {
    const proposedPlayersCount = game.playersManager.getProposedPlayers().length;
    const votesNeededCount     = game.questsManager.getCurrentQuest().getVotesNeeded();

    return proposedPlayersCount !== votesNeededCount;
  }
}
