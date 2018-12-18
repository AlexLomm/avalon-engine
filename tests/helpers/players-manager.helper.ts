import * as _ from 'lodash';
import { PlayersManager } from '../../src/players-manager';
import { Player } from '../../src/player';
import { LevelPreset } from '../../src/level-preset';
import { RoleId } from '../../src/enums/role-id';
import { LevelPresetId } from '../../src/types/level-preset-id';

export class PlayersManagerHelper {
  static addPlayersAndAssignRoles(manager: PlayersManager, number: number) {
    PlayersManagerHelper.fillPlayers(manager, number);
    PlayersManagerHelper.assignRoles(manager);
  }

  static fillPlayers(manager: PlayersManager, number: number) {
    _.times(number, (i: number) => manager.add(new Player(`user-${i}`)));
  }

  static assignRoles(manager: PlayersManager) {
    manager.assignRoles(new LevelPreset(manager.getAll().length as LevelPresetId));
  }

  static getAssassin(manager: PlayersManager) {
    return manager.getAll().find(p => p.isAssassin());
  }

  static getMerlin(manager: PlayersManager) {
    return manager.getAll().find(
      (p) => p.getRole().getId() === RoleId.Merlin,
    );
  }

  static getProposedPlayers(manager: PlayersManager) {
    const id = manager.getAll()[0].getId();

    return manager.serialize(id, false)
      .proposedPlayerIds
      .map(id => manager.getAll().find(p => p.getId() === id));
  }

  static getNonAssassin(manager: PlayersManager) {
    const assassinsId = PlayersManagerHelper.getAssassin(manager).getId();

    return manager.getAll().find((p) => p.getId() !== assassinsId);
  }

  static getNonAssassinNonMerlin(manager: PlayersManager) {
    const assassinsId = PlayersManagerHelper.getAssassin(manager).getId();

    return manager.getAll()
      .find(p => {
        return p.getId() !== assassinsId
          && p.getRole().getId() !== RoleId.Merlin;
      });
  }
}
