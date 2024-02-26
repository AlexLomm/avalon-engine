import * as _ from 'lodash';
import { PlayerManager } from '../../src/player-manager';
import { Player } from '../../src/player';
import { LevelPreset } from '../../src/level-preset';
import { RoleId } from '../../src/enums/role-id';
import { LevelPresetId } from '../../src/types/level-preset-id';

export class PlayerManagerHelper {
  static addPlayersAndAssignRoles(manager: PlayerManager, number: number) {
    PlayerManagerHelper.fillPlayers(manager, number);
    PlayerManagerHelper.assignRoles(manager);
  }

  static fillPlayers(manager: PlayerManager, number: number) {
    _.times(number, (i: number) => manager.add(new Player(`user-${i}`)));
  }

  static assignRoles(manager: PlayerManager) {
    manager.assignRoles(
      new LevelPreset(manager.getAll().length as LevelPresetId),
    );
  }

  static getAssassin(manager: PlayerManager) {
    return manager.getAll().find((p) => p.isAssassin());
  }

  static getMerlin(manager: PlayerManager) {
    return manager.getAll().find((p) => p.getRole().getId() === RoleId.Merlin);
  }

  static getProposedPlayers(manager: PlayerManager) {
    const id = manager.getAll()[0].getId();

    return manager
      .serialize(id, false)
      .proposedPlayerIds.map((id) =>
        manager.getAll().find((p) => p.getId() === id),
      );
  }

  static getNonAssassin(manager: PlayerManager) {
    const assassinsId = PlayerManagerHelper.getAssassin(manager).getId();

    return manager.getAll().find((p) => p.getId() !== assassinsId);
  }

  static getNonAssassinNonMerlin(manager: PlayerManager) {
    const assassinsId = PlayerManagerHelper.getAssassin(manager).getId();

    return manager.getAll().find((p) => {
      return p.getId() !== assassinsId && p.getRole().getId() !== RoleId.Merlin;
    });
  }
}
