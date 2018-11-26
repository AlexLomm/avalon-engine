import { Game } from '../game';
import { Player } from '../player';
import { RoleId } from '../configs/roles.config';
import { BaseState } from './base-state';
import { GameState } from './game-state-machine';

export class PreparationState extends BaseState {
  protected resultsConcealed = true;

  addPlayer(game: Game, player: Player) {
    game.getPlayersManager().add(player);
    game.getMetaData().setCreatorOnce(player);
  }

  start(game: Game, roleIds: RoleId[]) {
    const playerCount = game.getPlayersManager().getAll().length;
    const levelPreset = game.getMetaData().init(playerCount);

    game.getPlayersManager().assignRoles(levelPreset, roleIds);
    game.getQuestsManager().init(levelPreset);

    return game.getFsm().transitionTo(GameState.TeamProposition);
  }
}
