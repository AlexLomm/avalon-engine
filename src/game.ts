import EventEmitter from 'events';
import { PlayersManager } from './players-manager';
import { QuestsManager } from './quests-manager';
import { PreparationState } from './game-states/preparation-state';
import { BaseState } from './game-states/base-state';
import { GameMetaData } from './game-meta-data';
import { GameSerialized } from './types/game-serialized';
import { RoleId } from './enums/role-id';
import { GameEvent } from './enums/game-event';
import { IGameClientApi } from './interfaces/game-client-api';
import { GameStateMachine } from './game-states/game-state-machine';
import { IEventEmitter } from './interfaces/event-emitter';

export class Game implements IGameClientApi, IEventEmitter {
  constructor(
    private playersManager = new PlayersManager(),
    private questsManager = new QuestsManager(),
    private metaData: GameMetaData = new GameMetaData(),
    private fsm: GameStateMachine = new GameStateMachine(),
    private state: BaseState = new PreparationState(),
    private eventEmitter: EventEmitter = new EventEmitter(),
  ) {
    this.fsm.init(this);

    this.fsm.on(GameEvent.StateChange, () => {
      this.eventEmitter.emit(GameEvent.StateChange);
    });
  }

  emit(event: GameEvent) {
    this.eventEmitter.emit(event);
  }

  on(event: GameEvent, cb: () => void) {
    this.eventEmitter.addListener(event, cb);
  }

  off(event: GameEvent, cb: () => void) {
    this.eventEmitter.removeListener(event, cb);
  }

  // TODO: cache states
  setState(state: BaseState) {
    this.state = state;
  }

  getPlayersManager(): PlayersManager {
    return this.playersManager;
  }

  getQuestsManager(): QuestsManager {
    return this.questsManager;
  }

  getMetaData(): GameMetaData {
    return this.metaData;
  }

  getFsm(): GameStateMachine {
    return this.fsm;
  }

  addPlayer(id: string) {
    this.state.addPlayer(this, id);
  }

  removePlayer(id: string) {
    this.state.removePlayer(this, id);
  }

  start(roleIds: RoleId[] = []) {
    this.state.start(this, roleIds);
  }

  submitTeam(leaderId: string) {
    this.state.submitTeam(this, leaderId);
  }

  voteForQuest(id: string, voteValue: boolean) {
    this.state.voteForQuest(this, id, voteValue);
  }

  voteForTeam(id: string, voteValue: boolean) {
    this.state.voteForTeam(this, id, voteValue);
  }

  toggleTeammateProposition(leaderId: string, id: string) {
    this.state.toggleTeammateProposition(this, leaderId, id);
  }

  resetProposedTeammates(leaderId: string) {
    this.state.resetProposedTeammates(this, leaderId);
  }

  toggleVictimProposition(assassinsId: string, victimsId: string) {
    this.state.toggleVictimProposition(this, assassinsId, victimsId);
  }

  assassinate(assassinsId: string) {
    this.state.assassinate(this, assassinsId);
  }

  serialize(forId: string): GameSerialized {
    return this.state.serialize(this, forId);
  }
}
