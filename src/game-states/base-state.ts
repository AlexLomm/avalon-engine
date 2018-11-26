import * as fromErrors from '../errors';
import { Game } from '../game';
import { Player } from '../player';
import { RoleId } from '../configs/roles.config';

export abstract class BaseState {
  protected abstract resultsConcealed: boolean;

  // TODO: emit a "stateChange" event
  addPlayer(game: Game, player: Player) {
    throw new fromErrors.AlreadyStartedGameError();
  }

  // TODO: emit a "stateChange" event
  start(game: Game, roleIds: RoleId[]): Promise<void> {
    throw new fromErrors.AlreadyStartedGameError();
  }

  // TODO: emit a "stateChange" event
  toggleTeammateProposition(game: Game, leaderUsername: string, username: string) {
    throw new fromErrors.NoTimeForTeammatePropositionError();
  }

  // TODO: emit a "stateChange" event
  submitTeam(game: Game, leaderUsername: string) {
    throw new fromErrors.NoTimeForTeamSubmissionError();
  }

  // TODO: emit a "stateChange" event
  voteForTeam(game: Game, username: string, voteValue: boolean): Promise<void> {
    throw new fromErrors.NoTimeForTeamVotingError();
  }

  // TODO: emit a "stateChange" event
  voteForQuest(game: Game, username: string, voteValue: boolean): Promise<void> {
    throw new fromErrors.NoTimeForQuestVotingError();
  }

  // TODO: emit a "stateChange" event
  toggleVictimProposition(game: Game, assassinsUsername: string, victimsUsername: string) {
    throw new fromErrors.NoTimeVictimPropositionError();
  }

  // TODO: emit a "stateChange" event
  assassinate(game: Game, assassinsUsername: string) {
    throw new fromErrors.NoTimeForAssassinationError();
  }

  serialize(game: Game, forUsername: string) {
    return {
      meta: game.getMetaData().serialize(),
      quests: game.getQuestsManager().serialize(this.resultsConcealed),
      players: game.getPlayersManager().serialize(forUsername),
    };
  }
}
