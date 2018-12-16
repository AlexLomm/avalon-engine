import { GameSerialized } from '../types/game-serialized';
import { IEventListener } from './event-listener';
import { RoleId } from '../enums/role-id';

// TODO: split into state-specific interfaces
export interface IGameClientApi extends IEventListener {
  addPlayer(id: string): void;

  removePlayer(id: string): void;

  start(roleIds: RoleId[]): void;

  submitTeam(leaderId: string): void;

  voteForQuest(id: string, voteValue: boolean): void;

  voteForTeam(id: string, voteValue: boolean): void;

  toggleTeammateProposition(leaderId: string, id: string): void;

  toggleVictimProposition(assassinsId: string, victimsId: string): void;

  assassinate(assassinsId: string): void;

  serialize(forId: string): GameSerialized;
}
