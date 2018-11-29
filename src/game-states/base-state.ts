import * as fromErrors from '../errors';
import { Game, GameSerialized } from '../game';
import { Player } from '../player';
import { RoleId } from '../configs/roles.config';

export abstract class BaseState {
  protected abstract resultsConcealed: boolean = true;
  protected abstract rolesConcealed: boolean   = true;

  addPlayer(game: Game, player: Player): void {
    throw new fromErrors.AlreadyStartedGameError();
  }

  start(game: Game, roleIds: RoleId[]): void {
    throw new fromErrors.AlreadyStartedGameError();
  }

  toggleTeammateProposition(game: Game, leaderUsername: string, username: string): void {
    throw new fromErrors.NoTimeForTeammatePropositionError();
  }

  submitTeam(game: Game, leaderUsername: string): void {
    throw new fromErrors.NoTimeForTeamSubmissionError();
  }

  voteForTeam(game: Game, username: string, voteValue: boolean): void {
    throw new fromErrors.NoTimeForTeamVotingError();
  }

  voteForQuest(game: Game, username: string, voteValue: boolean): void {
    throw new fromErrors.NoTimeForQuestVotingError();
  }

  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string): void {
    throw new fromErrors.NoTimeVictimPropositionError();
  }

  assassinate(game: Game, assassinsUsername: string): void {
    throw new fromErrors.NoTimeForAssassinationError();
  }

  serialize(game: Game, forUsername: string): GameSerialized {
    return {
      meta: game.getMetaData().serialize(),
      quests: game.getQuestsManager().serialize(this.resultsConcealed),
      players: game.getPlayersManager().serialize(forUsername, this.rolesConcealed),
    };
  }
}
