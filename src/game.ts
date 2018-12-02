import EventEmitter from 'events';
import { PlayersManager } from './players-manager';
import { QuestsManager } from './quests-manager';
import { PreparationState } from './game-states/preparation-state';
import { BaseState } from './game-states/base-state';
import { Player } from './player';
import { GameMetaData } from './game-meta-data';
import { GameSerialized } from './types/game-serialized';
import { RoleId } from './enums/role-id';
import { GameEvent } from './enums/game-event';
import { IGameClientApi } from './interfaces/game-client-api';
import { GameStateMachine } from './game-states/game-state-machine';

export class Game implements IGameClientApi {
  constructor(
    private playersManager             = new PlayersManager(),
    private questsManager              = new QuestsManager(),
    private metaData: GameMetaData     = new GameMetaData(),
    private fsm: GameStateMachine      = new GameStateMachine(),
    private state: BaseState           = new PreparationState(),
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

  addPlayer(player: Player) {
    this.state.addPlayer(this, player);
  }

  start(roleIds: RoleId[] = []) {
    this.state.start(this, roleIds);
  }

  submitTeam(leaderUsername: string) {
    this.state.submitTeam(this, leaderUsername);
  }

  voteForQuest(username: string, voteValue: boolean) {
    this.state.voteForQuest(this, username, voteValue);
  }

  voteForTeam(username: string, voteValue: boolean) {
    this.state.voteForTeam(this, username, voteValue);
  }

  toggleTeammateProposition(leaderUsername: string, username: string) {
    this.state.toggleTeammateProposition(this, leaderUsername, username);
  }

  toggleVictimProposition(assassinsUsername: string, victimsUsername: string) {
    this.state.toggleVictimProposition(this, assassinsUsername, victimsUsername);
  }

  assassinate(assassinsUsername: string) {
    this.state.assassinate(this, assassinsUsername);
  }

  serialize(forUsername: string): GameSerialized {
    return this.state.serialize(this, forUsername);
  }
}
