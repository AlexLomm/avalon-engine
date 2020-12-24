import * as _ from 'lodash';
import { Player } from './player';
import { LevelPreset } from './level-preset';
import { Role } from './role';
import { RoleId } from './enums/role-id';
import { Loyalty } from './enums/loyalty';

// TODO: promote to a service
export class RolesAssigner {
  private players: Player[];
  private levelPreset: LevelPreset;

  constructor(players: Player[], levelPreset: LevelPreset) {
    this.players = players;
    this.levelPreset = levelPreset;
  }

  assignRoles(requestedRoleIds: RoleId[] = []): Player[] {
    const roleIds = RolesAssigner.generateRolesConfig(requestedRoleIds);
    const roles = RolesAssigner.generateRoles(
      roleIds,
      this.levelPreset.getGoodCount(),
      this.levelPreset.getEvilCount()
    );

    this.players.forEach((player) => player.setRole(roles.pop()));

    return this.players;
  }

  static generateRolesConfig(roleIds: RoleId[]): RoleId[] {
    const defaultRoleIds: RoleId[] = [RoleId.Merlin, RoleId.Assassin];

    return _.union(roleIds, defaultRoleIds);
  }

  static generateRoles(
    roleIds: RoleId[],
    goodCount: number,
    evilCount: number
  ): Role[] {
    const roles = roleIds.map((roleId: RoleId) => {
      const role = new Role(roleId);

      role.getLoyalty() === Loyalty.Good ? goodCount-- : evilCount--;

      return role;
    });

    return _.shuffle(
      _.concat(
        roles,
        RolesAssigner.generateServants(goodCount),
        RolesAssigner.generateMinions(evilCount)
      )
    );
  }

  static generateServants(count: number): Role[] {
    return _.shuffle([
      new Role(RoleId.Servant_1),
      new Role(RoleId.Servant_2),
      new Role(RoleId.Servant_3),
      new Role(RoleId.Servant_4),
      new Role(RoleId.Servant_5),
    ]).slice(0, count);
  }

  static generateMinions(count: number): Role[] {
    return _.shuffle([
      new Role(RoleId.Minion_1),
      new Role(RoleId.Minion_2),
      new Role(RoleId.Minion_3),
    ]).slice(0, count);
  }
}
