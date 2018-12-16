import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from '../enums/game-state';
import { GameEvent } from '../enums/game-event';

export class TeamVotingState extends BaseState {
  protected resultsConcealed = true;
  protected rolesConcealed   = true;

  voteForTeam(game: Game, id: string, voteValue: boolean) {
    if (!game.getPlayersManager().teamVotingAllowedFor(id)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, id, voteValue);

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
  private vote(game: Game, id: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(id, voteValue);

    game.getQuestsManager().addVote(vote);
  }
}
