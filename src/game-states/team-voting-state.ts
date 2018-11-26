import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState, GameEvent } from './game-state-machine';

export class TeamVotingState extends BaseState {
  protected resultsConcealed = true;

  voteForTeam(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, username, voteValue);

    if (game.getQuestsManager().teamVotingSucceeded()) {
      game.getFsm().transitionTo(GameState.QuestVoting);

      return;
    }

    if (game.getQuestsManager().teamVotingRoundFinished()) {
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
}
