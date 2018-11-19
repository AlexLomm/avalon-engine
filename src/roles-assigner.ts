import * as _ from 'lodash';
import { Player } from './player';
import { LevelPreset } from './level-preset';
import { Loyalty, RoleId } from './configs/roles.config';
import { Role } from './role';

// TODO: promote to a service
export class RolesAssigner {
  private _players: Player[];
  private _levelPreset: LevelPreset;

  constructor(players: Player[], levelPreset: LevelPreset) {
    this._players     = players;
    this._levelPreset = levelPreset;
  }

  assignRoles(requestedRoleIds: RoleId[] = []): Player[] {
    const roleIds = RolesAssigner._generateRolesConfig(requestedRoleIds);
    const roles   = RolesAssigner._generateRoles(
      roleIds,
      this._levelPreset.getGoodCount(),
      this._levelPreset.getEvilCount(),
    );

    this._players.forEach((player) => player.setRole(roles.pop()));

    return this._players;
  }

  static _generateRolesConfig(roleIds: RoleId[]): RoleId[] {
    const defaultRoleIds: RoleId[] = [RoleId.Merlin, RoleId.Assassin];

    return _.union(roleIds, defaultRoleIds);
  }

  static _generateRoles(roleIds: RoleId[], goodCount: number, evilCount: number): Role[] {
    const roles = roleIds.map((roleId: RoleId) => {
      const role = new Role(roleId);

      role.getLoyalty() === Loyalty.Good
        ? goodCount--
        : evilCount--;

      return role;
    });

    return _.shuffle(_.concat(
      roles,
      RolesAssigner._generateServants(goodCount),
      RolesAssigner._generateMinions(evilCount),
    ));
  }

  static _generateServants(count: number): Role[] {
    return _.shuffle([
      new Role(RoleId.Servant_1),
      new Role(RoleId.Servant_2),
      new Role(RoleId.Servant_3),
      new Role(RoleId.Servant_4),
      new Role(RoleId.Servant_5),
    ]).slice(0, count);
  }

  static _generateMinions(count: number): Role[] {
    return _.shuffle([
      new Role(RoleId.Minion_1),
      new Role(RoleId.Minion_2),
      new Role(RoleId.Minion_3),
    ]).slice(0, count);
  }
}
