const Player = function (username) {
  this._username       = username;
  this._role           = null;
  this._vote           = null;
  this._isProposed     = false;
  this._isLeader       = false;
  this._isAssassin     = false;
  this._isVictim       = false;
  this._isAssassinated = false;
};

Player.prototype.getUsername = function () {
  return this._username;
};

Player.prototype.setRole = function (role) {
  this._role = role;
};

Player.prototype.getRole = function () {
  return this._role;
};

Player.prototype.setVote = function (vote) {
  this._vote = vote;
};

Player.prototype.getVote = function () {
  return this._vote;
};

Player.prototype.setIsProposed = function (isProposed) {
  this._isProposed = isProposed;
};

Player.prototype.getIsVictim = function () {
  return this._isVictim;
};

Player.prototype.setIsVictim = function (isVictim) {
  this._isVictim = isVictim;
};

Player.prototype.toggleIsVictim = function () {
  this._isVictim = !this._isVictim;
};

Player.prototype.getIsAssassin = function () {
  return this._isAssassin;
};

Player.prototype.markAsAssassin = function () {
  this._isAssassin = true;
};

Player.prototype.toggleTeamProposition = function () {
  this._isProposed = !this._isProposed;
};

Player.prototype.getIsProposed = function () {
  return this._isProposed;
};

Player.prototype.setIsLeader = function (isLeader) {
  this._isLeader = isLeader;
};

Player.prototype.getIsLeader = function () {
  return this._isLeader;
};

Player.prototype.markAsAssassinated = function () {
  this._isAssassinated = true;
};

Player.prototype.getIsAssassinated = function () {
  return this._isAssassinated;
};

Player.prototype.canSee = function (anotherPlayer) {
  return this._role.canSee(anotherPlayer.getRole());
};

module.exports = Player;
