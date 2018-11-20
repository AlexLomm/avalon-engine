import * as fromErrors from '../errors';
import { Game } from '../game';
import { Player } from '../player';
import { RoleId } from '../configs/roles.config';

export abstract class BaseState {
  addPlayer(game: Game, player: Player) {
    throw new fromErrors.AlreadyStartedGameError();
  }

  start(game: Game, roleIds: RoleId[]) {
    throw new fromErrors.AlreadyStartedGameError();
  }

  toggleTeammateProposition(game: Game, leaderUsername: string, username: string) {
    throw new fromErrors.NoTimeForTeammatePropositionError();
  }

  submitTeam(game: Game, leaderUsername: string) {
    throw new fromErrors.NoTimeForTeamSubmissionError();
  }

  voteForTeam(game: Game, username: string, voteValue: boolean) {
    throw new fromErrors.NoTimeForTeamVotingError();
  }

  voteForQuest(game: Game, username: string, voteValue: boolean) {
    throw new fromErrors.NoTimeForQuestVotingError();
  }

  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    throw new fromErrors.NoTimeVictimPropositionError();
  }

  assassinate(game: Game, assassinsUsername: string) {
    throw new fromErrors.NoTimeForAssassinationError();
  }
}
