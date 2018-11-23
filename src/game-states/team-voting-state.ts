import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './game-state-machine';

export class TeamVotingState extends BaseState {
  voteForTeam(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, username, voteValue);

    if (game.getQuestsManager().teamVotingSucceeded()) {
      return game.getFsm().transitionTo(GameState.QuestVoting);
    }

    if (game.getQuestsManager().teamVotingRoundFinished()) {
      return game.getFsm().transitionTo(GameState.TeamProposition);
    }

    return Promise.resolve();
  }

  // TODO: dry up
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(username, voteValue);

    game.getQuestsManager().addVote(vote);
  }
}
