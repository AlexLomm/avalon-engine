const crypto         = require('crypto');
const errors         = require('./errors');
const LevelPreset    = require('./level-preset');
const Quest          = require('./quest');
const PlayersManager = require('./players-manager');

const Game = function () {
  this._id                 = crypto.randomBytes(20).toString('hex');
  this._createdAt          = new Date();
  this._startedAt          = null;
  this._finishedAt         = null;
  this._levelPreset        = null;
  this._rolesAreRevealed   = false;
  this._revealRolesPromise = null;
  this._quests             = [];
  // TODO: inject as a dependency
  this._playersManager     = new PlayersManager();
};

Game.prototype.getId = function () {
  return this._id;
};

Game.prototype.addPlayer = function (player) {
  if (this._startedAt) {
    throw new Error(errors.GAME_ALREADY_STARTED);
  }

  this._playersManager.add(player);
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
  const playerCount = this._playersManager.getAll().length;

  if (playerCount < 5 || playerCount > 10) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  this._startedAt   = new Date();
  this._levelPreset = new LevelPreset(playerCount);

  this._playersManager.assignRoles(this._levelPreset, config);

  // TODO: maybe extract into a separate class?
  this._initQuests();
};

Game.prototype._initQuests = function () {
  this._quests = this._levelPreset.getQuests().map(
    (config) => new Quest(config.playersNeeded, config.failsNeeded)
  );
};

Game.prototype.finish = function () {
  this._finishedAt = new Date();
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

Game.prototype.toggleIsChosen = function (username) {
  const player = this._playersManager.find(p => p.getUsername() === username);

  if (!player) return;

  player.toggleIsChosen();
};

Game.prototype.isTimeToVoteForTeam = function (username) {
  // TODO: add logic
};

module.exports = Game;
