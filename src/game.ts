import EventEmitter from 'events';
import { PlayersManager, PlayersManagerSerialized } from './players-manager';
import { QuestsManager, QuestsManagerSerialized } from './quests-manager';
import { PreparationState } from './game-states/preparation-state';
import { RoleId } from './configs/roles.config';
import { BaseState } from './game-states/base-state';
import { Player } from './player';
import { GameMetaData, GameMetaDataSerialized } from './game-meta-data';
import { GameStateMachine, GameEvent, GameStateTransitionWaitTimes } from './game-states/game-state-machine';

export interface GameSerialized {
  meta: GameMetaDataSerialized;
  players: PlayersManagerSerialized;
  quests: QuestsManagerSerialized;
}

export interface GameConfig {
  stateTransitionWaitTimes: GameStateTransitionWaitTimes
}

export class Game {
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

  static create(config: GameConfig): Game {
    return new Game(
      new PlayersManager(),
      new QuestsManager(),
      new GameMetaData(),
      new GameStateMachine(config.stateTransitionWaitTimes),
      new PreparationState(),
      new EventEmitter(),
    );
  }

  // TODO: hide
  emit(event: GameEvent) {
    this.eventEmitter.emit(event);
  }

  on(event: GameEvent, cb: () => void) {
    this.eventEmitter.on(event, cb);
  }

  off(event: GameEvent, cb: () => void) {
    this.eventEmitter.off(event, cb);
  }

  // TODO: cache states
  setState(state: BaseState) {
    this.state = state;
  }

  // TODO: hide
  getPlayersManager(): PlayersManager {
    return this.playersManager;
  }

  // TODO: hide
  getQuestsManager(): QuestsManager {
    return this.questsManager;
  }

  // TODO: hide
  getMetaData(): GameMetaData {
    return this.metaData;
  }

  // TODO: hide
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
