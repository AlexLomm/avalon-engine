const rolesConfig = require('../configs/roles.config').rolesConfig;
const errors      = require('../configs/errors.config');

class Role {
  constructor(id) {
    if (!rolesConfig[id]) {
      throw new Error(errors.INCORRECT_ROLE_ID);
    }

    this._id             = rolesConfig[id].id;
    this._name           = rolesConfig[id].name;
    this._description    = rolesConfig[id].description;
    this._loyalty        = rolesConfig[id].loyalty;
    this._visibleRoleIds = rolesConfig[id].visibleRoleIds;
  }

  getId() {
    return this._id;
  };

  getName() {
    return this._name;
  };

  getDescription() {
    return this._description;
  };

  getLoyalty() {
    return this._loyalty;
  };

  getVisibleRoleIds() {
    return this._visibleRoleIds;
  };

  canSee(anotherRole) {
    const index = this._visibleRoleIds
      .findIndex((roleId) => roleId === anotherRole.getId());

    return index > -1;
  }
}

module.exports = Role;
