import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './finite-state-machine';

export class TeamVotingState extends BaseState {
  voteForTeam(game: Game, username: string, voteValue: boolean) {
    if (!game.getPlayersManager().teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, username, voteValue);

    if (game.getQuestsManager().teamVotingSucceeded()) {
      game.getFsm().go(GameState.QuestVoting);
    }

    else if (game.getQuestsManager().teamVotingRoundFinished()) {
      game.getFsm().go(GameState.TeamProposition);
    }
  }

  // TODO: dedupe
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.getPlayersManager().generateVote(username, voteValue);

    game.getQuestsManager().addVote(vote);
  }
}
