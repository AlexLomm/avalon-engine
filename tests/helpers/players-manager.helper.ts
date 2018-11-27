import * as _ from 'lodash';
import { PlayersManager } from '../../src/players-manager';
import { Player } from '../../src/player';
import { LevelPreset } from '../../src/level-preset';
import { RoleId } from '../../src/configs/roles.config';

export class PlayersManagerHelper {
  static addPlayersAndAssignRoles(manager: PlayersManager, number: number) {
    PlayersManagerHelper.fillPlayers(manager, number);
    PlayersManagerHelper.assignRoles(manager);
  }

  static fillPlayers(manager: PlayersManager, number: number) {
    _.times(number, (i: number) => manager.add(new Player(`user-${i}`)));
  }

  static assignRoles(manager: PlayersManager) {
    manager.assignRoles(new LevelPreset(manager.getAll().length));
  }

  static getNonAssassin(playersManager: PlayersManager) {
    return playersManager.getAll().find(
      (p) => p.getUsername() !== playersManager.getAssassin().getUsername(),
    );
  }

  static getMerlin(playersManager: PlayersManager) {
    return playersManager.getAll().find(
      (p) => p.getRole().getId() === RoleId.Merlin,
    );
  }

  static getNonAssassinNonMerlin(playersManager: PlayersManager) {
    return playersManager.getAll()
      .find(p => {
        return p.getUsername() !== playersManager.getAssassin().getUsername()
          && p.getRole().getId() !== RoleId.Merlin;
      });
  }
}
