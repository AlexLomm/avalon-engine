import * as fromErrors from '../errors';
import { BaseState } from './base-state';
import { Game } from '../game';
import { GameState } from './finite-state-machine';

export class TeamVotingState extends BaseState {
  voteForTeam(game: Game, username: string, voteValue: boolean) {
    if (!game.playersManager.teamVotingAllowedFor(username)) {
      throw new fromErrors.DeniedTeamVotingError();
    }

    this.vote(game, username, voteValue);

    if (game.questsManager.teamVotingSucceeded()) {
      game.fsm.go(GameState.QuestVoting);
    }

    else if (game.questsManager.teamVotingRoundFinished()) {
      game.fsm.go(GameState.TeamProposition);
    }
  }

  // TODO: dedupe
  private vote(game: Game, username: string, voteValue: boolean) {
    const vote = game.playersManager.generateVote(username, voteValue);

    game.questsManager.addVote(vote);
  }
}
