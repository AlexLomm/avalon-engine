const crypto         = require('crypto');
const errors         = require('./errors');
const LevelPreset    = require('./level-preset');
const PlayersManager = require('./players-manager');
const QuestsManager  = require('./quests-manager');

const Game = function (
  playersManager = new PlayersManager(),
  questsManager  = new QuestsManager()
) {
  this._id                 = crypto.randomBytes(20).toString('hex');
  this._createdAt          = new Date();
  this._startedAt          = null;
  this._finishedAt         = null;
  this._levelPreset        = null;
  this._rolesAreRevealed   = false;
  this._revealRolesPromise = null;
  this._playersManager     = playersManager;
  this._questsManager      = questsManager;
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

  this._questsManager.init(this._levelPreset);
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
  this._playersManager.toggleIsChosen(username);
};

Game.prototype.isTimeToVoteForTeam = function (username) {
  // TODO: add logic
};

module.exports = Game;
