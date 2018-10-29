const crypto               = require('crypto');
const _                    = require('lodash');
const errors               = require('./errors');
const {roleIds, loyalties} = require('./roles.config');
const LevelPreset          = require('./level-preset');
const Role                 = require('./role');
const Quest                = require('./quest');

const Game = function () {
  this._id                 = crypto.randomBytes(20).toString('hex');
  this._createdAt          = new Date();
  this._startedAt          = null;
  this._finishedAt         = null;
  this._levelPreset        = null;
  this._rolesAreRevealed   = false;
  this._revealRolesPromise = null;
  this._players            = [];
  this._leaderIndex        = -1;
  this._quests             = [];
};

Game.prototype.getId = function () {
  return this._id;
};

Game.prototype.getPlayers = function () {
  return this._players;
};

Game.prototype.addPlayer = function (player) {
  if (!player) return;

  if (this._startedAt) {
    throw new Error(errors.GAME_ALREADY_STARTED);
  }

  const existingPlayer = this._players
    .find(p => p.getUsername() === player.getUsername());

  if (existingPlayer) {
    throw new Error(errors.USERNAME_ALREADY_EXISTS);
  }

  if (this._players.length === 10) {
    throw new Error(errors.MAXIMUM_PLAYERS_REACHED);
  }

  this._players.push(player);
};

Game.prototype.getCreatedAt = function () {
  return this._createdAt;
};

Game.prototype.getStartedAt = function () {
  return this._startedAt;
};

Game.prototype.getFinishedAt = function () {
  return this._finishedAt;
};

Game.prototype.start = function (config = {}) {
  if (this._players.length < 5 || this._players.length > 10) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  this._startedAt   = new Date();
  this._levelPreset = new LevelPreset(this._players.length);

  // TODO: maybe extract into a separate class?
  this._assignRoles(config);

  // TODO: maybe extract into a separate class?
  this._initQuests();

  this._nextLeader();
};

Game.prototype._assignRoles = function (config = {}) {
  const rolesConfig = this._generateRolesConfig(config);

  const roles = this._generateRoles(rolesConfig);

  this._players.forEach(player => player.setRole(roles.pop()));
};

Game.prototype._generateRolesConfig = function (config) {
  const defaultRolesConfig = {
    [roleIds.MERLIN]: true,
    [roleIds.ASSASSIN]: true,
  };

  return Object.assign({}, config, defaultRolesConfig);
};

Game.prototype._generateRoles = function (config) {
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

Game.prototype._generateServants = function (count) {
  return _.shuffle([
    new Role(roleIds.SERVANT_1),
    new Role(roleIds.SERVANT_2),
    new Role(roleIds.SERVANT_3),
    new Role(roleIds.SERVANT_4),
    new Role(roleIds.SERVANT_5),
  ]).slice(0, count);
};

Game.prototype._generateMinions = function (count) {
  return _.shuffle([
    new Role(roleIds.MINION_1),
    new Role(roleIds.MINION_2),
    new Role(roleIds.MINION_3),
  ]).slice(0, count);
};

Game.prototype._initQuests = function () {
  this._quests = this._levelPreset.getQuests().map(
    (config) => new Quest(config.playersNeeded, config.failsNeeded)
  );
};

Game.prototype._nextLeader = function () {
  if (this._leaderIndex === -1) {
    this._leaderIndex = _.random(0, this._players.length - 1);

    this._players[this._leaderIndex].markAsLeader();

    return;
  }

  this._players[this._leaderIndex].unmarkAsLeader();
  this._players[(this._leaderIndex + 1) % this._players.length].markAsLeader();
};

Game.prototype.finish = function () {
  this._finishedAt = new Date();
};

Game.prototype.getCreator = function () {
  return this._players[0];
};

Game.prototype.getLevelPreset = function () {
  return this._levelPreset;
};

Game.prototype.getRolesAreRevealed = function () {
  return this._rolesAreRevealed;
};

Game.prototype.revealRoles = function (seconds) {
  if (this._revealRolesPromise) return this._revealRolesPromise;

  this._rolesAreRevealed = true;

  this._revealRolesPromise = new Promise((resolve) => {
    const rolesAreRevealed = setTimeout(() => {
      this._rolesAreRevealed   = false;
      this._revealRolesPromise = null;
      clearTimeout(rolesAreRevealed);

      resolve();
    }, seconds * 1000);
  });

  return this._revealRolesPromise;
};

Game.prototype.getQuests = function () {
  return this._quests;
};

Game.prototype.submitPlayers = function () {
  if (!this._startedAt) {
    throw new Error(errors.GAME_NOT_STARTED);
  }

  const chosenPlayers = this.getChosenPlayers();

  if (!chosenPlayers.length) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  // TODO: add logic
};

Game.prototype.getChosenPlayers = function () {
  return this._players.filter(player => player.getIsChosen());
};

Game.prototype.toggleIsChosen = function (username) {
  const player = this._players.find(p => p.getUsername() === username);

  if (!player) return;

  player.toggleIsChosen();
};

module.exports = Game;
