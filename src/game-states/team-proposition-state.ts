import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState, GameEvent } from './game-state-machine';

export class TeamPropositionState extends BaseState {
  protected resultsConcealed = true;

  toggleTeammateProposition(game: Game, leaderUsername: string, username: string) {
    if (!game.getPlayersManager().playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeammatePropositionError();
    }

    game.getPlayersManager().togglePlayerProposition(username);

    game.emit(GameEvent.StateChange);
  }

  submitTeam(game: Game, leaderUsername: string) {
    if (!game.getPlayersManager().playerPropositionAllowedFor(leaderUsername)) {
      throw new fromErrors.DeniedTeamSubmissionError();
    }

    if (this.playerAmountIsIncorrect(game)) {
      throw new fromErrors.RequiredCorrectTeammatesAmountError();
    }

    game.getQuestsManager().isLastRoundOfTeamVoting()
      ? game.getFsm().transitionTo(GameState.TeamVotingPreApproved)
      : game.getFsm().transitionTo(GameState.TeamVoting);
  }

  private playerAmountIsIncorrect(game: Game) {
    const proposedPlayersCount = game.getPlayersManager().getProposedPlayers().length;
    const votesNeededCount     = game.getQuestsManager().getVotesNeeded();

    return proposedPlayersCount !== votesNeededCount;
  }
}
