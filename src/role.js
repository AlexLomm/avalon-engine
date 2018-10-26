const rolesConfig  = require('./roles.config').rolesConfig;
const errors = require('./errors');

const Role = function (id) {
  if (!rolesConfig[id]) {
    throw new Error(errors.INCORRECT_ROLE_ID);
  }

  this.id          = rolesConfig[id].id;
  this.name        = rolesConfig[id].name;
  this.description = rolesConfig[id].description;
  this.loyalty     = rolesConfig[id].loyalty;
};

Role.prototype.getId = function () {
  return this.id;
};

Role.prototype.getName = function () {
  return this.name;
};

Role.prototype.getDescription = function () {
  return this.description;
};

Role.prototype.getLoyalty = function () {
  return this.loyalty;
};

module.exports = Role;
