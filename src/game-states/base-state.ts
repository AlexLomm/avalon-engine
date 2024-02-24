import * as fromErrors from '../errors';
import { Game } from '../game';
import { RoleId } from '../enums/role-id';
import { GameSerialized } from '../types/game-serialized';

export abstract class BaseState {
  protected abstract resultsConcealed: boolean;
  protected abstract rolesConcealed: boolean;

  addPlayer(game: Game, id: string): void {
    throw new fromErrors.AlreadyStartedGameError();
  }

  removePlayer(game: Game, id: string): void {
    throw new fromErrors.AlreadyStartedGameError();
  }

  start(game: Game, roleIds: RoleId[]): void {
    throw new fromErrors.AlreadyStartedGameError();
  }

  toggleTeammateProposition(game: Game, leaderId: string, id: string): void {
    throw new fromErrors.NoTimeForTeammatePropositionError();
  }

  resetProposedTeammates(game: Game, leaderId: string) {
    throw new fromErrors.NoTimeForTeammatePropositionError();
  }

  submitTeam(game: Game, leaderId: string): void {
    throw new fromErrors.NoTimeForTeamSubmissionError();
  }

  voteForTeam(game: Game, id: string, voteValue: boolean): void {
    throw new fromErrors.NoTimeForTeamVotingError();
  }

  voteForQuest(game: Game, id: string, voteValue: boolean): void {
    throw new fromErrors.NoTimeForQuestVotingError();
  }

  toggleVictimProposition(game: Game, assassinsId: string, victimsId: string): void {
    throw new fromErrors.NoTimeVictimPropositionError();
  }

  assassinate(game: Game, assassinsId: string): void {
    throw new fromErrors.NoTimeForAssassinationError();
  }

  serialize(game: Game, forId: string): GameSerialized {
    return {
      meta: game.getMetaData().serialize(),
      quests: game.getQuestsManager().serialize(this.resultsConcealed),
      players: game.getPlayersManager().serialize(forId, this.rolesConcealed),
    };
  }
}
