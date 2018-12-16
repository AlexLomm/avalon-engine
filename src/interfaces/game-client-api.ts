import { GameSerialized } from '../types/game-serialized';
import { IEventListener } from './event-listener';
import { RoleId } from '../enums/role-id';

// TODO: split into state-specific interfaces
export interface IGameClientApi extends IEventListener {
  addPlayer(username: string): void;

  removePlayer(username: string): void;

  start(roleIds: RoleId[]): void;

  submitTeam(leaderUsername: string): void;

  voteForQuest(username: string, voteValue: boolean): void;

  voteForTeam(username: string, voteValue: boolean): void;

  toggleTeammateProposition(leaderUsername: string, username: string): void;

  toggleVictimProposition(assassinsUsername: string, victimsUsername: string): void;

  assassinate(assassinsUsername: string): void;

  serialize(forUsername: string): GameSerialized;
}
