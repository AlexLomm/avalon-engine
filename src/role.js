const rolesConfig = require('../configs/roles.config').rolesConfig;
const errors      = require('../configs/errors.config');

const Role = function (id) {
  if (!rolesConfig[id]) {
    throw new Error(errors.INCORRECT_ROLE_ID);
  }

  this._id             = rolesConfig[id].id;
  this._name           = rolesConfig[id].name;
  this._description    = rolesConfig[id].description;
  this._loyalty        = rolesConfig[id].loyalty;
  this._visibleRoleIds = rolesConfig[id].visibleRoleIds;
};

Role.prototype.getId = function () {
  return this._id;
};

Role.prototype.getName = function () {
  return this._name;
};

Role.prototype.getDescription = function () {
  return this._description;
};

Role.prototype.getLoyalty = function () {
  return this._loyalty;
};

Role.prototype.getVisibleRoleIds = function () {
  return this._visibleRoleIds;
};

Role.prototype.canSee = function (anotherRole) {
  const index = this._visibleRoleIds
    .findIndex((roleId) => roleId === anotherRole.getId());

  return index > -1;
};

module.exports = Role;
