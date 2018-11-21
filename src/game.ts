import { PlayersManager } from './players-manager';
import { QuestsManager } from './quests-manager';
import { PreparationState } from './game-states/preparation-state';
import { RoleId } from './configs/roles.config';
import { BaseState } from './game-states/base-state';
import { Player } from './player';
import { createAsyncStateMachine, AsyncFiniteStateMachine } from './game-states/async-finite-state-machine';
import { GameMetaData } from './game-meta-data';

export class Game {
  private asyncFsm: AsyncFiniteStateMachine;

  constructor(
    private playersManager         = new PlayersManager(),
    private questsManager          = new QuestsManager(),
    private state: BaseState       = new PreparationState(),
    private metaData: GameMetaData = new GameMetaData(),
  ) {
    this.asyncFsm = createAsyncStateMachine(this);
  }

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

  getAsyncFsm(): AsyncFiniteStateMachine {
    return this.asyncFsm;
  }

  addPlayer(player: Player) {
    this.state.addPlayer(this, player);

    this.metaData.setCreatorOnce(player);
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

  serialize(forUsername: string) {
    return this.state.serialize(this, forUsername);
  }
}
