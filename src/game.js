const errors = require('./errors');

const Game = function () {
  this._createdAt  = new Date();
  this._startedAt  = null;
  this._finishedAt = null;
  this._players    = [];
};

Game.prototype.addPlayer = function (player) {
  if (!player) return;

  if (this._startedAt) throw new Error(errors.GAME_ALREADY_STARTED);

  const existingPlayer = this._players.find(p => p.username === player.username);
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

Game.prototype.start = function () {
  if (this._players.length < 5 || this._players.length > 10) {
    throw new Error(errors.INCORRECT_NUMBER_OF_PLAYERS);
  }

  return this._startedAt = new Date();
};

Game.prototype.finish = function () {
  this._finishedAt = new Date();
};

Game.prototype.getCreator = function () {
  return this._players[0];
};

module.exports = Game;
