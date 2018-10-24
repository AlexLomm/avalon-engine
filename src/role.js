const roles  = require('./roles.config');
const errors = require('./errors');

const Role = function (id) {
  if (!roles[id]) {
    throw new Error(errors.INCORRECT_ROLE_ID);
  }

  this.id          = roles[id].id;
  this.name        = roles[id].name;
  this.description = roles[id].description;
  this.loyalty     = roles[id].loyalty;
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
