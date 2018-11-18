const _                    = require('lodash');
const {roleIds, loyalties} = require('../configs/roles.config');
const Role                 = require('./role');

// TODO: promote to a service
class RolesAssigner {
  constructor(players, levelPreset) {
    this._players     = players;
    this._levelPreset = levelPreset;
  }

  assignRoles(config) {
    const rolesConfig = RolesAssigner._generateRolesConfig(config);
    const roles       = RolesAssigner._generateRoles(
      rolesConfig,
      this._levelPreset.getGoodCount(),
      this._levelPreset.getEvilCount(),
    );

    this._players.forEach((player) => player.setRole(roles.pop()));

    return this._players;
  }

  static _generateRolesConfig(config) {
    // TODO: convert to an array?
    const defaultRolesConfig = {
      [roleIds.MERLIN]: true,
      [roleIds.ASSASSIN]: true,
    };

    return Object.assign({}, config, defaultRolesConfig);
  }

  static _generateRoles(config, goodCount, evilCount) {
    const roles = Object.keys(config).map(roleId => {
      const role = new Role(roleId);

      role.getLoyalty() === loyalties.GOOD
        ? goodCount--
        : evilCount--;

      return role;
    });

    return _.shuffle(_.concat(
      roles,
      RolesAssigner._generateServants(goodCount),
      RolesAssigner._generateMinions(evilCount)
    ));
  }

  static _generateServants(count) {
    return _.shuffle([
      new Role(roleIds.SERVANT_1),
      new Role(roleIds.SERVANT_2),
      new Role(roleIds.SERVANT_3),
      new Role(roleIds.SERVANT_4),
      new Role(roleIds.SERVANT_5),
    ]).slice(0, count);
  }

  static _generateMinions(count) {
    return _.shuffle([
      new Role(roleIds.MINION_1),
      new Role(roleIds.MINION_2),
      new Role(roleIds.MINION_3),
    ]).slice(0, count);
  }
}

module.exports = RolesAssigner;
