const _       = require('lodash');
const errors  = require('./errors');
const roleIds = require('./roles.config').roleIds;
const Role    = require('./role');

const PlayersManager = function () {
  this._leaderIndex = -1;
  this._levelPreset = null;
  this._isSubmitted = false;
  this._gameCreator = null;
  this._players     = [];
};

PlayersManager.prototype.getAll = function () {
  return this._players;
};

PlayersManager.prototype.getGameCreator = function () {
  return this._gameCreator;
};

PlayersManager.prototype.add = function (player) {
  if (!player) return;

  const existingPlayer = this._players
    .find(p => p.getUsername() === player.getUsername());

  if (existingPlayer) {
    throw new Error(errors.USERNAME_ALREADY_EXISTS);
  }

  if (this._players.length === 10) {
    throw new Error(errors.MAXIMUM_PLAYERS_REACHED);
  }

  this._players.push(player);

  if (!this._gameCreator) {
    this._gameCreator = this._players[0];
  }
};

PlayersManager.prototype.getChosenPlayers = function () {
  return this._players.filter(player => player.getIsChosen());
};

PlayersManager.prototype.toggleIsChosen = function (username) {
  const player = this._players.find(p => p.getUsername() === username);

  if (!player) return;

  player.toggleIsChosen();
};

PlayersManager.prototype.markAsSubmitted = function () {
  this._isSubmitted = true;
};

PlayersManager.prototype.unmarkAsSubmitted = function () {
  this._isSubmitted = false;
};

PlayersManager.prototype.getIsSubmitted = function () {
  return this._isSubmitted;
};

PlayersManager.prototype.assignRoles = function (levelPreset, config = {}) {
  this._levelPreset = levelPreset;

  const rolesConfig = this._generateRolesConfig(config);

  const roles = this._generateRoles(rolesConfig);

  this._players.forEach(player => player.setRole(roles.pop()));

  this.nextLeader();
};

PlayersManager.prototype._generateRolesConfig = function (config) {
  const defaultRolesConfig = {
    [roleIds.MERLIN]: true,
    [roleIds.ASSASSIN]: true,
  };

  return Object.assign({}, config, defaultRolesConfig);
};

PlayersManager.prototype._generateRoles = function (config) {
  let goodCount = this._levelPreset.getGoodCount();
  let evilCount = this._levelPreset.getEvilCount();

  const roles = Object.keys(config).map(roleId => {
    const role = new Role(roleId);

    role.getLoyalty() === 'GOOD' ? goodCount-- : evilCount--;

    return role;
  });

  return _.shuffle(_.concat(
    roles,
    this._generateServants(goodCount),
    this._generateMinions(evilCount)
  ));
};

PlayersManager.prototype._generateServants = function (count) {
  return _.shuffle([
    new Role(roleIds.SERVANT_1),
    new Role(roleIds.SERVANT_2),
    new Role(roleIds.SERVANT_3),
    new Role(roleIds.SERVANT_4),
    new Role(roleIds.SERVANT_5),
  ]).slice(0, count);
};

PlayersManager.prototype._generateMinions = function (count) {
  return _.shuffle([
    new Role(roleIds.MINION_1),
    new Role(roleIds.MINION_2),
    new Role(roleIds.MINION_3),
  ]).slice(0, count);
};

PlayersManager.prototype.nextLeader = function () {
  if (this._leaderIndex === -1) {
    this._leaderIndex = _.random(0, this._players.length - 1);
    return;
  }

  this._leaderIndex = (this._leaderIndex + 1) % this._players.length;
};

PlayersManager.prototype.getLeader = function () {
  return this._players[this._leaderIndex];
};

module.exports = PlayersManager;
