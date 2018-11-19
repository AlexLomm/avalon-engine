import { LevelPreset } from '../level-preset';
import { Game } from '../game';
import { Player } from '../player';
import { RoleId } from '../configs/roles.config';
import { BaseState } from './base-state';
import { TeamPropositionState } from './team-proposition-state';

export class PreparationState extends BaseState {
  addPlayer(game: Game, player: Player) {
    game.playersManager.add(player);
  }

  start(game: Game, roleIds: RoleId[]) {
    const playerCount = game.playersManager.getAll().length;

    game.levelPreset = new LevelPreset(playerCount);
    game.startedAt   = new Date();

    game.playersManager.assignRoles(game.levelPreset, roleIds);
    game.questsManager.init(game.levelPreset);

    game.state = new TeamPropositionState();
  }
}
