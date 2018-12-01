import { Game } from '../game';
import { Player } from '../player';
import { BaseState } from './base-state';
import { LevelPresetId } from '../types/level-preset-id';
import { RoleId } from '../enums/role-id';
import { GameEvent } from '../enums/game-event';
import { GameState } from '../enums/game-state';

export class PreparationState extends BaseState {
  protected resultsConcealed = true;
  protected rolesConcealed   = true;

  addPlayer(game: Game, player: Player) {
    game.getPlayersManager().add(player);
    game.getMetaData().setCreatorOnce(player);

    game.emit(GameEvent.StateChange);
  }

  start(game: Game, roleIds: RoleId[]) {
    const playerCount = game.getPlayersManager().getAll().length as LevelPresetId;
    const levelPreset = game.getMetaData().init(playerCount);

    game.getPlayersManager().assignRoles(levelPreset, roleIds);
    game.getQuestsManager().init(levelPreset);

    game.getFsm().transitionTo(GameState.TeamProposition);
  }
}
